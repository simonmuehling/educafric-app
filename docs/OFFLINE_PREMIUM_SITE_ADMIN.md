# Documentation - Système Offline Premium Site Admin

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Fonctionnalités](#fonctionnalités)
4. [Guide d'utilisation](#guide-dutilisation)
5. [API Endpoints](#api-endpoints)
6. [Structure Database](#structure-database)
7. [Exemples de Code](#exemples-de-code)
8. [Troubleshooting](#troubleshooting)

---

## 📖 Vue d'ensemble

### Contexte
Le système **Offline Premium** permet au Site Admin d'activer ou de désactiver l'accès hors ligne premium pour chaque école individuellement. Cette fonctionnalité offre aux écoles la possibilité d'utiliser Educafric en mode hors ligne avec des capacités étendues.

### Caractéristiques Principales
- ✅ **Gestion centralisée** : Site Admin contrôle l'accès depuis un dashboard unique
- ✅ **Toggle instantané** : Activation/désactivation en un clic
- ✅ **Gratuit pour les écoles** : Pas de frais d'abonnement, option toggleable par Site Admin
- ✅ **Bilingue** : Interface complète en Français et Anglais
- ✅ **Sécurisé** : Authentification Site Admin requise
- ✅ **En temps réel** : Mise à jour immédiate sans rechargement de page

### Écoles avec Offline Premium Activé (Exemple)
Actuellement, **3 écoles** bénéficient de l'Offline Premium:
1. **Lycée Bilingue de Yaoundé** (ID: 1)
2. **École Primaire Bilingue Excellence** (ID: 3)
3. **Government Technical High School Kumbo** (ID: 10)

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend
- **Framework** : React + TypeScript
- **UI Components** : Shadcn/UI (Radix UI + Tailwind CSS)
- **State Management** : TanStack Query v5
- **Form Validation** : React Hook Form + Zod
- **Routing** : Wouter

#### Backend
- **Framework** : Express.js
- **ORM** : Drizzle ORM
- **Database** : PostgreSQL (Neon Serverless)
- **Authentication** : Express Session + Passport.js

### Flux de Données

```
┌─────────────────────────────────────────────────────────────────┐
│                        SITE ADMIN UI                             │
│  ┌───────────────────┐         ┌──────────────────────┐        │
│  │  School List      │         │  Offline Premium     │        │
│  │  with Badge       │ ──────> │  Modal with Switch   │        │
│  │  (Purple/Gray)    │         │  Toggle              │        │
│  └───────────────────┘         └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TANSTACK QUERY                              │
│  ┌───────────────────┐         ┌──────────────────────┐        │
│  │  GET /schools     │         │  PATCH /offline-     │        │
│  │  (Fetch list)     │         │  premium (Toggle)    │        │
│  └───────────────────┘         └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS API ROUTES                          │
│  ┌───────────────────┐         ┌──────────────────────┐        │
│  │  GET /api/        │         │  PATCH /api/         │        │
│  │  siteadmin/       │         │  siteadmin/schools/  │        │
│  │  schools          │         │  :id/offline-premium │        │
│  └───────────────────┘         └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
│  ┌───────────────────────────────────────────────────┐          │
│  │  getSchoolsWithStats()                            │          │
│  │  updateSchoolOfflinePremium(schoolId, enabled)    │          │
│  └───────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                         │
│  ┌───────────────────────────────────────────────────┐          │
│  │  TABLE: schools                                   │          │
│  │  COLUMN: offline_premium_enabled BOOLEAN          │          │
│  │  DEFAULT: FALSE                                   │          │
│  └───────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Fonctionnalités

### 1. Affichage du Statut
- **Badge coloré** dans la liste des écoles
  - 🟣 **Purple** : Offline Premium activé
  - ⚪ **Gray** : Offline Premium désactivé
- **Mise à jour en temps réel** : Changement immédiat après toggle

### 2. Gestion via Modal
- **Accès** : Clic sur l'icône CreditCard dans la ligne de l'école
- **Interface** : Modal simplifiée avec Switch toggle Shadcn
- **Action** : Activation/désactivation en un clic
- **Feedback** : Message de confirmation bilingue (FR/EN)

### 3. Sécurité
- **Authentification** : Seuls les Site Admins peuvent accéder
- **Validation** : Paramètre `enabled` doit être boolean
- **Logs** : Toutes les actions sont loggées avec timestamp et utilisateur

### 4. Internationalisation
- **Interface bilingue** : Français / Anglais
- **Messages d'erreur** : Traduits dans les 2 langues
- **Labels dynamiques** : S'adaptent à la langue active

---

## 📘 Guide d'Utilisation

### Pour le Site Admin

#### 1. Accéder au Dashboard
```
1. Se connecter en tant que Site Admin
2. Naviguer vers "Gestion des Écoles"
3. La liste des écoles s'affiche avec badges de statut
```

#### 2. Activer Offline Premium
```
1. Localiser l'école dans la liste
2. Cliquer sur l'icône CreditCard (💳) dans la colonne "Actions"
3. Le modal "Offline Premium" s'ouvre
4. Activer le Switch toggle (OFF → ON)
5. Confirmation automatique : "Offline Premium activé avec succès"
6. Le badge devient purple dans la liste
```

#### 3. Désactiver Offline Premium
```
1. Localiser l'école dans la liste
2. Cliquer sur l'icône CreditCard (💳)
3. Désactiver le Switch toggle (ON → OFF)
4. Confirmation automatique : "Offline Premium désactivé avec succès"
5. Le badge devient gris dans la liste
```

### Exemple Visuel

```
┌─────────────────────────────────────────────────────────────────┐
│ LISTE DES ÉCOLES                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Nom École                           | Statut      | Actions      │
├─────────────────────────────────────────────────────────────────┤
│ Lycée Bilingue de Yaoundé          | [🟣 Activé]  | [💳] [✏️] [🗑️] │
│ École Primaire Saint-Paul          | [⚪ Désactivé]| [💳] [✏️] [🗑️] │
│ École Primaire Bilingue Excellence | [🟣 Activé]  | [💳] [✏️] [🗑️] │
└─────────────────────────────────────────────────────────────────┘

Clic sur [💳]
      ↓
┌─────────────────────────────────────────────────────────────────┐
│ OFFLINE PREMIUM - École Primaire Saint-Paul                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Offline Premium Désactivé                          [OFF] ←──┐   │
│                                                                │  │
│ Activez Offline Premium pour permettre à cette école          │  │
│ d'utiliser Educafric en mode hors ligne avec capacités        │  │
│ étendues (14 jours pour Directors/Parents, illimité pour      │  │
│ Teachers/Students).                                            │  │
│                                                                │  │
│ Note: Cette option est gratuite et peut être activée ou       │  │
│ désactivée à tout moment par le Site Admin.                   │  │
│                                                                │  │
│                                    [Fermer]                    │  │
└─────────────────────────────────────────────────────────────────┘
                                                                 │
                                                   Basculer ON   │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Offline Premium activé avec succès                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### 1. GET /api/siteadmin/schools

Récupère la liste de toutes les écoles avec leur statut Offline Premium.

#### Authentification
- **Requise** : Oui
- **Rôle** : Site Admin uniquement

#### Requête
```http
GET /api/siteadmin/schools HTTP/1.1
Host: educafric.com
Cookie: session_id=<SESSION_TOKEN>
```

#### Query Parameters (optionnels)
```typescript
{
  search?: string;    // Recherche par nom, adresse, directeur
  type?: string;      // Filtre par type: 'public' | 'private' | 'all'
  page?: number;      // Numéro de page (défaut: 1)
  limit?: number;     // Résultats par page (défaut: 20)
}
```

#### Réponse Success (200)
```json
{
  "schools": [
    {
      "id": 1,
      "name": "Lycée Bilingue de Yaoundé",
      "location": "Yaoundé, Cameroun",
      "address": "Yaoundé, Cameroun",
      "phone": "+237 222 123 456",
      "email": "contact@lycee-yaounde.cm",
      "contactEmail": "contact@lycee-yaounde.cm",
      "type": "public",
      "studentCount": 850,
      "teacherCount": 45,
      "subscriptionStatus": "active",
      "monthlyRevenue": 0,
      "createdAt": "2024-01-15T10:00:00Z",
      "educafricNumber": "EDU-CM-SC-001",
      "offlinePremiumEnabled": true,
      "director": "Jean Mbarga",
      "directorEmail": "director@lycee-yaounde.cm",
      "directorPhone": "+237 677 123 456"
    },
    {
      "id": 2,
      "name": "École Primaire Saint-Paul",
      "location": "Douala, Cameroun",
      "address": "Douala, Cameroun",
      "phone": "+237 233 456 789",
      "email": "contact@saint-paul.cm",
      "contactEmail": "contact@saint-paul.cm",
      "type": "private",
      "studentCount": 320,
      "teacherCount": 18,
      "subscriptionStatus": "active",
      "monthlyRevenue": 0,
      "createdAt": "2024-02-20T14:30:00Z",
      "educafricNumber": "EDU-CM-SC-002",
      "offlinePremiumEnabled": false,
      "director": "Marie Ngono",
      "directorEmail": "director@saint-paul.cm",
      "directorPhone": "+237 698 456 789"
    }
  ],
  "totalCount": 13,
  "page": 1,
  "limit": 20
}
```

#### Réponse Error (500)
```json
{
  "message": "Failed to fetch schools"
}
```

---

### 2. PATCH /api/siteadmin/schools/:schoolId/offline-premium

Active ou désactive Offline Premium pour une école spécifique.

#### Authentification
- **Requise** : Oui
- **Rôle** : Site Admin uniquement

#### Path Parameters
```typescript
{
  schoolId: number;  // ID de l'école
}
```

#### Request Body
```json
{
  "enabled": true  // true = activer, false = désactiver
}
```

#### Validation
- `enabled` DOIT être un boolean
- `schoolId` DOIT être un nombre valide
- L'école DOIT exister dans la database

#### Requête Example (Activation)
```http
PATCH /api/siteadmin/schools/1/offline-premium HTTP/1.1
Host: educafric.com
Content-Type: application/json
Cookie: session_id=<SESSION_TOKEN>

{
  "enabled": true
}
```

#### Réponse Success (200)
```json
{
  "success": true,
  "message": "Offline Premium activé avec succès",
  "messageFr": "Offline Premium activé avec succès",
  "messageEn": "Offline Premium enabled successfully",
  "schoolId": 1,
  "offlinePremiumEnabled": true
}
```

#### Réponse Error - Validation (400)
```json
{
  "success": false,
  "message": "Invalid request: enabled must be a boolean"
}
```

#### Réponse Error - Server (500)
```json
{
  "success": false,
  "message": "Failed to update Offline Premium status",
  "messageFr": "Échec de la mise à jour du statut Offline Premium",
  "messageEn": "Failed to update Offline Premium status"
}
```

#### Logs Console
```
[SITE_ADMIN_API] Enabling Offline Premium for school 1
[SCHOOL_STORAGE] Enabling Offline Premium for school 1
[SCHOOL_STORAGE] ✅ Offline Premium enabled for school 1
[SITE_ADMIN_API] ✅ Offline Premium enabled for school 1
```

---

## 💾 Structure Database

### Table: schools

#### Colonne Offline Premium
```sql
ALTER TABLE schools 
ADD COLUMN offline_premium_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN schools.offline_premium_enabled IS 
'Offline Premium feature toggle (free for all schools, managed by Site Admin)';
```

#### Schema Complet (Drizzle ORM)
```typescript
// shared/schemas/schoolSchema.ts
import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  type: text('type'), // 'public' | 'private'
  educafricNumber: text('educafric_number'),
  offlinePremiumEnabled: boolean('offline_premium_enabled').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Indexes
```sql
-- Index pour recherche rapide par statut Offline Premium
CREATE INDEX idx_schools_offline_premium 
ON schools(offline_premium_enabled);

-- Index composite pour filtrage avancé
CREATE INDEX idx_schools_type_offline_premium 
ON schools(type, offline_premium_enabled);
```

#### Migration Script
```sql
-- Migration: Add Offline Premium column
-- Date: 2025-11-18
-- Author: Educafric Team

BEGIN;

-- Add column with default value
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS offline_premium_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN schools.offline_premium_enabled IS 
'Offline Premium feature toggle (free for all schools, managed by Site Admin)';

-- Create index
CREATE INDEX IF NOT EXISTS idx_schools_offline_premium 
ON schools(offline_premium_enabled);

COMMIT;
```

---

## 💻 Exemples de Code

### Backend - Storage Layer

#### getSchoolsWithStats()
```typescript
// server/storage/schoolStorage.ts

async getSchoolsWithStats(): Promise<any[]> {
  try {
    const { sql, desc, and } = await import("drizzle-orm");
    
    // Sélection avec Offline Premium
    const schoolsList = await db
      .select({
        id: schools.id,
        name: schools.name,
        address: schools.address,
        phone: schools.phone,
        email: schools.email,
        type: schools.type,
        createdAt: schools.createdAt,
        educafricNumber: schools.educafricNumber,
        offlinePremiumEnabled: schools.offlinePremiumEnabled  // ✅ IMPORTANT
      })
      .from(schools)
      .orderBy(desc(schools.createdAt));

    // Ajout des statistiques (students, teachers)
    const schoolsWithStats = await Promise.all(schoolsList.map(async (school) => {
      const [studentCountResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(
          eq(users.schoolId, school.id),
          eq(users.role, 'Student')
        ));
      
      const [teacherCountResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(
          eq(users.schoolId, school.id),
          eq(users.role, 'Teacher')
        ));

      return {
        ...school,
        studentCount: studentCountResult?.count || 0,
        teacherCount: teacherCountResult?.count || 0
      };
    }));

    return schoolsWithStats;
  } catch (error) {
    console.error('[SCHOOL_STORAGE] Error fetching schools with stats:', error);
    return [];
  }
}
```

#### updateSchoolOfflinePremium()
```typescript
// server/storage/schoolStorage.ts

async updateSchoolOfflinePremium(schoolId: number, enabled: boolean): Promise<any> {
  try {
    console.log(`[SCHOOL_STORAGE] ${enabled ? 'Enabling' : 'Disabling'} Offline Premium for school ${schoolId}`);
    
    // Mise à jour avec Drizzle ORM
    const [updatedSchool] = await db
      .update(schools)
      .set({ offlinePremiumEnabled: enabled })
      .where(eq(schools.id, schoolId))
      .returning();
    
    if (!updatedSchool) {
      throw new Error(`School ${schoolId} not found`);
    }
    
    console.log(`[SCHOOL_STORAGE] ✅ Offline Premium ${enabled ? 'enabled' : 'disabled'} for school ${schoolId}`);
    return updatedSchool;
  } catch (error) {
    console.error(`[SCHOOL_STORAGE] Error updating Offline Premium for school ${schoolId}:`, error);
    throw new Error(`Failed to update Offline Premium: ${error}`);
  }
}
```

---

### Backend - API Routes

```typescript
// server/routes/siteAdminRoutes.ts

// GET: Liste des écoles avec Offline Premium
app.get("/api/siteadmin/schools", requireAuth, requireSiteAdminAccess, async (req, res) => {
  try {
    const schoolsWithStats = await storage.getSchoolsWithStats();
    
    const schoolsWithDirector = await Promise.all(schoolsWithStats.map(async (school) => {
      const director = await storage.getSchoolDirector(school.id);
      
      return {
        id: school.id,
        name: school.name,
        location: school.address || '',
        address: school.address || '',
        phone: school.phone,
        email: school.email,
        contactEmail: school.email,
        type: school.type || 'private',
        studentCount: school.studentCount || 0,
        teacherCount: school.teacherCount || 0,
        subscriptionStatus: 'active',
        monthlyRevenue: 0,
        createdAt: school.createdAt,
        educafricNumber: school.educafricNumber,
        offlinePremiumEnabled: school.offlinePremiumEnabled || false,  // ✅ IMPORTANT
        director: director ? `${director.firstName || ''} ${director.lastName || ''}`.trim() : 'N/A',
        directorEmail: director?.email || null,
        directorPhone: director?.phone || null
      };
    }));

    res.json({ 
      schools: schoolsWithDirector,
      totalCount: schoolsWithDirector.length,
      page: 1,
      limit: 20
    });
  } catch (error) {
    console.error('[SITE_ADMIN_API] Error fetching schools:', error);
    res.status(500).json({ message: 'Failed to fetch schools' });
  }
});

// PATCH: Toggle Offline Premium
app.patch("/api/siteadmin/schools/:schoolId/offline-premium", 
  requireAuth, 
  requireSiteAdminAccess, 
  async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { enabled } = req.body;
      
      // Validation
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid request: enabled must be a boolean' 
        });
      }

      console.log(`[SITE_ADMIN_API] ${enabled ? 'Enabling' : 'Disabling'} Offline Premium for school ${schoolId}`);

      // Mise à jour database
      await storage.updateSchoolOfflinePremium(parseInt(schoolId), enabled);

      console.log(`[SITE_ADMIN_API] ✅ Offline Premium ${enabled ? 'enabled' : 'disabled'} for school ${schoolId}`);
      
      res.json({ 
        success: true,
        message: `Offline Premium ${enabled ? 'activé' : 'désactivé'} avec succès`,
        messageFr: `Offline Premium ${enabled ? 'activé' : 'désactivé'} avec succès`,
        messageEn: `Offline Premium ${enabled ? 'enabled' : 'disabled'} successfully`,
        schoolId: parseInt(schoolId),
        offlinePremiumEnabled: enabled 
      });
    } catch (error) {
      console.error('[SITE_ADMIN_API] Error updating Offline Premium status:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update Offline Premium status',
        messageFr: 'Échec de la mise à jour du statut Offline Premium',
        messageEn: 'Failed to update Offline Premium status'
      });
    }
});
```

---

### Frontend - React Component

#### Interface TypeScript
```typescript
// client/src/components/siteadmin/modules/SchoolManagement.tsx

interface School {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  contactEmail: string;
  type: 'public' | 'private';
  studentCount: number;
  teacherCount: number;
  subscriptionStatus: string;
  monthlyRevenue: number;
  createdAt: string;
  lastActiveAt: string | null;
  isBlocked?: boolean;
  offlinePremiumEnabled?: boolean;  // ✅ IMPORTANT
}
```

#### TanStack Query - Fetch Schools
```typescript
const { data: schoolsData, isLoading } = useQuery({
  queryKey: ['/api/siteadmin/schools'],
  enabled: !!user,
});
```

#### TanStack Query - Toggle Offline Premium
```typescript
const toggleOfflinePremiumMutation = useMutation({
  mutationFn: async ({ schoolId, enabled }: { schoolId: number; enabled: boolean }) => {
    const response = await apiRequest(
      `/api/siteadmin/schools/${schoolId}/offline-premium`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }
    );
    return response;
  },
  onSuccess: (data) => {
    // Invalider le cache pour rafraîchir la liste
    queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
    
    // Toast de confirmation
    toast({
      title: data.messageFr || "Statut mis à jour",
      description: data.messageEn || "Status updated successfully",
      variant: "default",
    });
    
    // Fermer le modal
    setShowSubscriptionModal(false);
  },
  onError: (error: any) => {
    toast({
      title: "Erreur / Error",
      description: error.message || "Une erreur s'est produite",
      variant: "destructive",
    });
  },
});
```

#### Badge de Statut
```tsx
<td className="py-3 px-4">
  <div className="flex flex-col gap-1">
    {school.offlinePremiumEnabled ? (
      <Badge className="bg-purple-100 text-purple-800">
        {t.offlinePremiumEnabled}
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600">
        {t.offlinePremiumDisabled}
      </Badge>
    )}
  </div>
</td>
```

#### Switch Toggle Modal
```tsx
<DialogContent className="bg-white sm:max-w-md">
  <DialogHeader>
    <DialogTitle className="text-xl font-bold text-gray-900">
      {t.offlinePremium} - {selectedSchoolForSubscription?.name}
    </DialogTitle>
  </DialogHeader>
  
  <div className="space-y-6 py-4">
    <div className="flex items-center justify-between space-x-4">
      <div className="flex-1">
        <Label htmlFor="offline-premium-toggle" className="text-base font-medium">
          {selectedSchoolForSubscription?.offlinePremiumEnabled 
            ? t.offlinePremiumEnabled 
            : t.offlinePremiumDisabled}
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          {t.offlinePremiumDescription}
        </p>
      </div>
      
      <Switch
        id="offline-premium-toggle"
        checked={selectedSchoolForSubscription?.offlinePremiumEnabled || false}
        onCheckedChange={(checked) => {
          if (selectedSchoolForSubscription) {
            toggleOfflinePremiumMutation.mutate({
              schoolId: selectedSchoolForSubscription.id,
              enabled: checked
            });
          }
        }}
        disabled={toggleOfflinePremiumMutation.isPending}
      />
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        <strong>Note :</strong> Cette option est gratuite et peut être activée 
        ou désactivée à tout moment par le Site Admin.
      </p>
    </div>
  </div>
  
  <DialogFooter>
    <Button
      variant="outline"
      onClick={() => setShowSubscriptionModal(false)}
      className="w-full sm:w-auto"
    >
      {t.close}
    </Button>
  </DialogFooter>
</DialogContent>
```

#### Traductions i18n
```typescript
const translations = {
  fr: {
    offlinePremium: 'Offline Premium',
    offlinePremiumEnabled: 'Offline Premium Activé',
    offlinePremiumDisabled: 'Offline Premium Désactivé',
    enableOfflinePremium: 'Activer Offline Premium',
    disableOfflinePremium: 'Désactiver Offline Premium',
    offlinePremiumDescription: 'Activez Offline Premium pour permettre à cette école d\'utiliser Educafric en mode hors ligne avec capacités étendues (14 jours pour Directors/Parents, illimité pour Teachers/Students).',
  },
  en: {
    offlinePremium: 'Offline Premium',
    offlinePremiumEnabled: 'Offline Premium Enabled',
    offlinePremiumDisabled: 'Offline Premium Disabled',
    enableOfflinePremium: 'Enable Offline Premium',
    disableOfflinePremium: 'Disable Offline Premium',
    offlinePremiumDescription: 'Enable Offline Premium to allow this school to use Educafric offline with extended capabilities (14 days for Directors/Parents, unlimited for Teachers/Students).',
  }
};
```

---

## 🔧 Troubleshooting

### Problème 1: Badge ne s'affiche pas
**Symptôme:** Le badge Offline Premium n'apparaît pas dans la liste des écoles.

**Solution:**
1. Vérifier que `offlinePremiumEnabled` est bien dans la réponse API:
```bash
curl -X GET http://localhost:5000/api/siteadmin/schools \
  -H "Cookie: session_id=YOUR_SESSION" | jq '.schools[0].offlinePremiumEnabled'
```

2. Vérifier l'interface TypeScript:
```typescript
interface School {
  // ...
  offlinePremiumEnabled?: boolean;  // DOIT être présent
}
```

3. Vérifier le code du badge:
```tsx
{school.offlinePremiumEnabled ? (
  <Badge className="bg-purple-100 text-purple-800">
    {t.offlinePremiumEnabled}
  </Badge>
) : (
  <Badge className="bg-gray-100 text-gray-600">
    {t.offlinePremiumDisabled}
  </Badge>
)}
```

---

### Problème 2: Toggle ne fonctionne pas
**Symptôme:** Le Switch toggle ne change pas le statut.

**Solution:**
1. Vérifier les logs console backend:
```
[SITE_ADMIN_API] Enabling Offline Premium for school 1
[SCHOOL_STORAGE] Enabling Offline Premium for school 1
[SCHOOL_STORAGE] ✅ Offline Premium enabled for school 1
```

2. Vérifier la mutation TanStack Query:
```typescript
const toggleOfflinePremiumMutation = useMutation({
  mutationFn: async ({ schoolId, enabled }) => {
    const response = await apiRequest(
      `/api/siteadmin/schools/${schoolId}/offline-premium`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }
    );
    return response;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
  }
});
```

3. Vérifier l'invalidation du cache:
```typescript
queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
```

---

### Problème 3: Erreur 400 "enabled must be a boolean"
**Symptôme:** Erreur de validation lors du toggle.

**Solution:**
Vérifier que le paramètre `enabled` est bien un boolean:
```typescript
// ❌ MAUVAIS
body: JSON.stringify({ enabled: "true" })  // String au lieu de boolean

// ✅ BON
body: JSON.stringify({ enabled: true })  // Boolean
```

---

### Problème 4: Erreur 401 Unauthorized
**Symptôme:** Impossible d'accéder à l'endpoint malgré connexion.

**Solution:**
1. Vérifier l'authentification Site Admin:
```typescript
app.patch("/api/siteadmin/schools/:schoolId/offline-premium", 
  requireAuth,              // ✅ Vérifier session
  requireSiteAdminAccess,   // ✅ Vérifier rôle
  async (req, res) => {
    // ...
  }
);
```

2. Vérifier le rôle de l'utilisateur:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@educafric.com';
```

Le rôle DOIT être `'SiteAdmin'`.

---

### Problème 5: Base de données ne se met pas à jour
**Symptôme:** Le toggle fonctionne en frontend mais la database reste inchangée.

**Solution:**
1. Vérifier la colonne existe:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'schools' AND column_name = 'offline_premium_enabled';
```

2. Vérifier la méthode storage:
```typescript
await db
  .update(schools)
  .set({ offlinePremiumEnabled: enabled })  // Nom correct
  .where(eq(schools.id, schoolId))
  .returning();
```

3. Tester manuellement:
```sql
UPDATE schools SET offline_premium_enabled = true WHERE id = 1;
SELECT id, name, offline_premium_enabled FROM schools WHERE id = 1;
```

---

### Problème 6: Erreur TypeScript "Property does not exist"
**Symptôme:** 
```
Property 'offlinePremiumEnabled' does not exist on type 'School'
```

**Solution:**
Régénérer les types Drizzle:
```bash
npm run db:generate
```

Ou ajouter manuellement dans le schema:
```typescript
export const schools = pgTable('schools', {
  // ... autres colonnes
  offlinePremiumEnabled: boolean('offline_premium_enabled').notNull().default(false),
});
```

---

## 📊 Statistiques et Monitoring

### Requêtes SQL Utiles

#### Compter les écoles avec Offline Premium
```sql
SELECT 
  COUNT(*) FILTER (WHERE offline_premium_enabled = true) as enabled_count,
  COUNT(*) FILTER (WHERE offline_premium_enabled = false) as disabled_count,
  COUNT(*) as total_count
FROM schools;
```

#### Lister les écoles avec Offline Premium activé
```sql
SELECT 
  id,
  name,
  educafric_number,
  offline_premium_enabled,
  created_at
FROM schools
WHERE offline_premium_enabled = true
ORDER BY name ASC;
```

#### Historique des changements (si audit log implémenté)
```sql
SELECT 
  al.created_at,
  al.user_id,
  u.email as admin_email,
  al.action,
  al.entity_type,
  al.entity_id,
  s.name as school_name,
  al.changes
FROM audit_logs al
JOIN users u ON u.id = al.user_id
JOIN schools s ON s.id = al.entity_id
WHERE al.entity_type = 'school'
  AND al.changes::text LIKE '%offline_premium_enabled%'
ORDER BY al.created_at DESC;
```

---

## 🎯 Bonnes Pratiques

### 1. Sécurité
- ✅ Toujours vérifier l'authentification Site Admin
- ✅ Valider tous les paramètres d'entrée
- ✅ Logger toutes les actions sensibles
- ✅ Ne jamais exposer de données sensibles dans les réponses API

### 2. Performance
- ✅ Utiliser TanStack Query pour le caching
- ✅ Invalider uniquement les queries nécessaires
- ✅ Indexer la colonne `offline_premium_enabled` pour recherches rapides
- ✅ Utiliser `LIMIT` dans les requêtes SQL

### 3. UX
- ✅ Afficher des badges colorés pour visibilité immédiate
- ✅ Fournir un feedback instantané après chaque action
- ✅ Supporter les deux langues (FR/EN)
- ✅ Désactiver le toggle pendant la mutation (éviter double-clic)

### 4. Maintenance
- ✅ Documenter toutes les migrations database
- ✅ Garder les logs structurés et recherchables
- ✅ Tester les endpoints avec des outils comme Postman
- ✅ Monitorer les erreurs et exceptions

---

## 📝 Checklist de Déploiement

Avant de déployer en production:

- [ ] Migration database exécutée avec succès
- [ ] Colonne `offline_premium_enabled` créée avec index
- [ ] Endpoint GET `/api/siteadmin/schools` retourne `offlinePremiumEnabled`
- [ ] Endpoint PATCH `/api/siteadmin/schools/:id/offline-premium` fonctionne
- [ ] Authentication Site Admin requise et testée
- [ ] Validation des paramètres implémentée
- [ ] Logs backend activés et fonctionnels
- [ ] Frontend affiche les badges correctement
- [ ] Modal Offline Premium fonctionne
- [ ] Switch toggle met à jour la database
- [ ] Cache invalidation fonctionne
- [ ] Traductions FR/EN complètes
- [ ] Tests manuels effectués sur 3+ écoles
- [ ] Documentation à jour

---

## 📞 Support

Pour toute question ou problème:
- **Email**: support@educafric.com
- **Documentation**: `/docs/OFFLINE_PREMIUM_SITE_ADMIN.md`
- **Repository**: Contact développeur Educafric

---

## 📜 Historique des Versions

### Version 1.0.0 - 18 Novembre 2025
- ✅ Implémentation initiale du système Offline Premium Site Admin
- ✅ Ajout colonne `offline_premium_enabled` dans table `schools`
- ✅ Création endpoints API GET et PATCH
- ✅ Interface Site Admin avec badges et modal
- ✅ Support bilingue FR/EN complet
- ✅ Documentation complète

---

**Dernière mise à jour:** 18 Novembre 2025  
**Version:** 1.0.0  
**Auteur:** Équipe Educafric
