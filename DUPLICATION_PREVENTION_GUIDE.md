# Guide Anti-Duplication Educafric
*Adapté pour PostgreSQL + Drizzle + Express + React*

## 1. Base de Données : Contraintes UNIQUE + UPSERT

### Contraintes Uniques dans le Schema Drizzle

```typescript
// shared/schema.ts - Contraintes anti-duplication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(), // UNIQUE sur email
  phone: text('phone').unique(), // UNIQUE sur téléphone
  username: text('username').notNull().unique(), // UNIQUE sur nom utilisateur
}, (table) => ({
  // Index composites pour éviter duplications complexes
  schoolUserIdx: uniqueIndex('school_user_idx').on(table.schoolId, table.email),
}));

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id),
  name: text('name').notNull(),
  level: text('level').notNull(),
}, (table) => ({
  // Pas deux classes avec même nom dans même école
  schoolClassIdx: uniqueIndex('school_class_idx').on(table.schoolId, table.name, table.level),
}));
```

### UPSERT avec Drizzle (INSERT ... ON CONFLICT)

```typescript
// server/storage.ts - Méthodes anti-duplication
async createUserSafe(userData: InsertUser): Promise<User> {
  return await db.insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        updatedAt: new Date(),
        // Mise à jour des champs non-critiques seulement
        phone: userData.phone,
      }
    })
    .returning();
}

async createClassSafe(classData: InsertClass): Promise<Class> {
  return await db.insert(classes)
    .values(classData)
    .onConflictDoUpdate({
      target: [classes.schoolId, classes.name, classes.level],
      set: {
        updatedAt: new Date(),
        description: classData.description,
      }
    })
    .returning();
}
```

## 2. API Express : Clés d'Idempotence + Verrous Redis

### Middleware d'Idempotence

```typescript
// server/middleware/idempotency.ts
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export function idempotency(windowSec = 120) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.get('Idempotency-Key');
    if (!key) return next();
    
    const cacheKey = `educafric:idem:${req.path}:${key}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      const { status, body, headers } = JSON.parse(cached);
      res.set(headers || {});
      return res.status(status).json(body);
    }
    
    // Capture de la réponse
    const originalSend = res.json.bind(res);
    res.json = (body: any) => {
      const payload = JSON.stringify({
        status: res.statusCode,
        body,
        headers: res.getHeaders()
      });
      redis.setEx(cacheKey, windowSec, payload);
      return originalSend(body);
    };
    
    next();
  };
}
```

### Routes Critiques avec Idempotence

```typescript
// server/routes.ts - Application sur routes sensibles
app.post('/api/student/enrollment', 
  requireAuth, 
  idempotency(300), // 5 minutes pour inscriptions
  async (req, res) => {
    // Inscription sécurisée sans doublon
  }
);

app.post('/api/teacher/grades', 
  requireAuth, 
  idempotency(60), // 1 minute pour notes
  async (req, res) => {
    // Saisie de notes sans doublon
  }
);
```

### Verrous Redis pour Opérations Concurrentes

```typescript
// server/utils/lockManager.ts
export async function withLock<T>(
  lockKey: string, 
  ttlMs: number, 
  operation: () => Promise<T>
): Promise<T> {
  const fullKey = `educafric:lock:${lockKey}`;
  const acquired = await redis.set(fullKey, '1', { NX: true, PX: ttlMs });
  
  if (!acquired) {
    throw new Error('Operation already in progress');
  }
  
  try {
    return await operation();
  } finally {
    await redis.del(fullKey);
  }
}

// Usage dans les routes critiques
app.post('/api/teacher/attendance', async (req, res) => {
  const { classId, date } = req.body;
  
  await withLock(`attendance:${classId}:${date}`, 30000, async () => {
    // Prise de présence unique par classe/jour
    const attendance = await storage.recordAttendance(classId, date, req.body.students);
    res.json(attendance);
  });
});
```

## 3. Frontend React : Anti Double-Submit

### Hook useSingleSubmit Amélioré

```typescript
// client/src/hooks/useSingleSubmit.ts
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSingleSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const submitRef = useRef(false);
  const idempotencyKey = useRef<string | null>(null);
  
  const wrap = <T extends any[]>(fn: (...args: T) => Promise<any>) => {
    return async (...args: T) => {
      if (submitRef.current) return;
      
      submitRef.current = true;
      setSubmitting(true);
      idempotencyKey.current = uuidv4();
      
      try {
        const result = await fn(...args);
        return result;
      } finally {
        setSubmitting(false);
        // Délai de sécurité avant réactivation
        setTimeout(() => {
          submitRef.current = false;
          idempotencyKey.current = null;
        }, 2000);
      }
    };
  };
  
  return { 
    wrap, 
    submitting, 
    getIdempotencyKey: () => idempotencyKey.current 
  };
}
```

### Composants avec Protection Anti-Duplication

```typescript
// client/src/components/teacher/modules/FunctionalTeacherGrades.tsx
export default function FunctionalTeacherGrades() {
  const { wrap, submitting, getIdempotencyKey } = useSingleSubmit();
  const { toast } = useToast();
  
  const handleSubmitGrades = wrap(async (gradeData: GradeData) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const idempotencyKey = getIdempotencyKey();
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    
    const response = await apiRequest('POST', '/api/teacher/grades', gradeData, {
      headers
    });
    
    toast({
      title: "Notes enregistrées",
      description: "Les notes ont été sauvegardées avec succès",
    });
  });
  
  return (
    <Button 
      disabled={submitting} 
      onClick={() => handleSubmitGrades(formData)}
    >
      {submitting ? 'Enregistrement...' : 'Enregistrer Notes'}
    </Button>
  );
}
```

## 4. Uploads : Déduplication par Hash

```typescript
// server/services/uploadService.ts
import crypto from 'crypto';

function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function handleFileUpload(file: Buffer, metadata: any) {
  const hash = calculateHash(file);
  
  // Vérifier si fichier existe déjà
  const existing = await storage.findFileByHash(hash);
  if (existing) {
    return {
      id: existing.id,
      url: existing.url,
      deduplicated: true,
      message: 'Fichier déjà existant'
    };
  }
  
  // Sauvegarder nouveau fichier
  const savedFile = await storage.saveFile({
    hash,
    data: file,
    metadata,
    size: file.length
  });
  
  return {
    id: savedFile.id,
    url: savedFile.url,
    deduplicated: false,
    message: 'Nouveau fichier sauvegardé'
  };
}
```

## 5. Notifications : Anti-Spam

```typescript
// server/services/notificationService.ts
export class NotificationService {
  private static instance: NotificationService;
  
  async sendNotificationSafe(
    userId: number, 
    type: string, 
    content: string,
    throttleMinutes = 5
  ) {
    const throttleKey = `notification:${userId}:${type}`;
    const lastSent = await redis.get(throttleKey);
    
    if (lastSent) {
      const timeDiff = Date.now() - parseInt(lastSent);
      if (timeDiff < throttleMinutes * 60 * 1000) {
        return { throttled: true, message: 'Notification throttled' };
      }
    }
    
    // Envoyer notification
    const result = await this.sendNotification(userId, type, content);
    
    // Marquer timestamp
    await redis.setEx(throttleKey, throttleMinutes * 60, Date.now().toString());
    
    return result;
  }
}
```

## 6. Tests d'Intégration Anti-Duplication

```typescript
// tests/integration/antiDuplication.test.ts
describe('Anti-Duplication System', () => {
  test('prevents duplicate user creation with same email', async () => {
    const userData = {
      email: 'test@educafric.com',
      username: 'testuser',
      password: 'password123'
    };
    
    const user1 = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    const user2 = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(user1.status).toBe(201);
    expect(user2.status).toBe(409); // Conflict
    
    const userCount = await storage.getUserCountByEmail(userData.email);
    expect(userCount).toBe(1);
  });
  
  test('idempotency prevents duplicate grade submissions', async () => {
    const idempotencyKey = uuidv4();
    const gradeData = { studentId: 1, subject: 'Math', grade: 85 };
    
    const response1 = await request(app)
      .post('/api/teacher/grades')
      .set('Idempotency-Key', idempotencyKey)
      .send(gradeData);
    
    const response2 = await request(app)
      .post('/api/teacher/grades')
      .set('Idempotency-Key', idempotencyKey)
      .send(gradeData);
    
    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(response1.body).toEqual(response2.body);
    
    const gradeCount = await storage.getGradeCount(gradeData);
    expect(gradeCount).toBe(1);
  });
});
```

## Plan d'Implémentation Éducafric

### Phase 1 : Base de Données (Immédiat)
1. ✅ Ajouter contraintes UNIQUE aux tables critiques
2. ✅ Migrer les méthodes de création vers UPSERT
3. ✅ Script de nettoyage des doublons existants

### Phase 2 : API (Cette semaine)
1. ✅ Implémenter middleware d'idempotence
2. ✅ Ajouter verrous Redis pour opérations critiques
3. ✅ Protection des routes sensibles (inscriptions, notes, présences)

### Phase 3 : Frontend (Cette semaine)
1. ✅ Hook useSingleSubmit dans tous les formulaires
2. ✅ Clés d'idempotence automatiques
3. ✅ Debounce pour champs de recherche/validation

### Phase 4 : Tests (Prochaine semaine)
1. ✅ Tests d'intégration anti-duplication
2. ✅ Tests de charge sur endpoints critiques
3. ✅ Monitoring des duplications en production

---
*Guide adapté spécifiquement pour l'architecture Educafric*