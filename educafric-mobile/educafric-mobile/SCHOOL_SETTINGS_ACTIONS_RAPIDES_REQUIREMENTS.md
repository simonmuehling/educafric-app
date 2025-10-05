# REQUIREMENT ENREGISTREMENT: SCHOOL SETTINGS ACTIONS RAPIDES

## DEMANDE UTILISATEUR PERMANENTE
L'utilisateur a demandé que ce requirement soit enregistré pour ne plus avoir à le répéter.

### LOCALISATION
**School Settings** → **"Paramètres École"** → **"Actions Rapides"**

### FONCTIONNALITÉ REQUISE
Les 4 boutons "Actions Rapides" DOIVENT rediriger vers les modules spécifiques:

1. **"Emploi du temps"** → Module Timetable (TimetableConfiguration.tsx)
2. **"Enseignants"** → Module Teacher Management (TeacherManagement.tsx) 
3. **"Classes"** → Module Class Management (ClassManagement.tsx)
4. **"Communications"** → Module Communications

### IMPLÉMENTATION TECHNIQUE

#### 1. API Routes Corrigées ✅
- `/api/school/quick-actions/timetable` - Autorisations: Director, Admin, SiteAdmin
- `/api/school/quick-actions/teachers` - Autorisations: Director, Admin, SiteAdmin
- `/api/school/quick-actions/classes` - Autorisations: Director, Admin, SiteAdmin  
- `/api/school/quick-actions/communications` - Autorisations: Director, Admin, SiteAdmin

#### 2. Navigation Events ✅
- `switchToTimetable` → module 'timetable'
- `switchToTeacherManagement` → module 'teachers'
- `switchToClassManagement` → module 'classes'
- `switchToCommunications` → module 'communications'

#### 3. DirectorDashboard Event Listeners ✅
DirectorDashboard écoute ces événements et mappe vers les modules appropriés via UnifiedIconDashboard.

### STATUS: IMPLÉMENTÉ ✅
- ✅ API routes corrigées avec autorisations appropriées
- ✅ Boutons SchoolSettings configurés avec navigation événementielle  
- ✅ DirectorDashboard event listeners ajoutés
- ✅ Logs de débogage ajoutés pour traçabilité

### DATE: 29 Janvier 2025, 9:40 AM
### UTILISATEUR: Ne plus demander de répéter cette fonctionnalité