import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import SchoolConfigurationGuide from './SchoolConfigurationGuide';
import { 
  BookOpen, 
  Settings, 
  CheckCircle, 
  ArrowLeft,
  HelpCircle,
  FileText,
  Download
} from 'lucide-react';

interface InteractiveSchoolGuideProps {
  onBack?: () => void;
}

const InteractiveSchoolGuide: React.FC<InteractiveSchoolGuideProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('interactive');

  const schoolConfigurationContent = {
    fr: `# 🏫 GUIDE COMPLET - CONFIGURATION PROFIL ÉCOLE EDUCAFRIC

## 📋 ÉTAPE 1 : INFORMATIONS GÉNÉRALES DE L'ÉCOLE

**🎯 Par où commencer :** Tableau de bord Directeur → Paramètres École

### Informations de base à configurer :
- **Nom complet de l'école** (ex: "École Bilingue Excellence Yaoundé") 
- **Adresse complète** avec quartier, ville
- **Numéro de téléphone principal** (+237 xxx xxx xxx)
- **Email officiel de l'école** (contact@votre-ecole.cm)
- **Site web** (si disponible)
- **Type d'établissement** (Privé/Public)
- **Année académique** (2024-2025)

### Statistiques école :
- Nombre total d'élèves
- Nombre total d'enseignants
- Nombre total de classes

## 🎨 ÉTAPE 2 : IDENTITÉ VISUELLE (BRANDING)

**Accès :** Tableau de bord → Bulletins → Onglet "Branding"

### Logo de l'école :
1. **Télécharger le logo officiel** (format PNG/JPG recommandé)
2. **Dimensions optimales :** 200x200 pixels minimum
3. **Qualité :** Image claire et nette pour documents PDF

### Signatures numériques :
1. **Signature du Directeur** (image scannée ou créée)
2. **Signature du Principal** (si différent)
3. **Format :** PNG avec fond transparent recommandé

### Couleurs institutionnelles :
- **Couleur primaire** (couleur principale de l'école)
- **Couleur secondaire** (couleur d'accent)
- **Police de caractère** (Arial, Times New Roman, etc.)

## 👥 ÉTAPE 3 : GESTION DES ADMINISTRATEURS

**Accès :** Tableau de bord → Administrateurs

### Configurer les rôles :
1. **Directeur Principal** (vous-même)
2. **Directeur Adjoint** (si applicable)
3. **Coordinateur Académique**
4. **Surveillant Général**

### Permissions par rôle :
- **Gestion des enseignants** ✓/✗
- **Gestion des élèves** ✓/✗
- **Gestion des classes** ✓/✗
- **Communications** ✓/✗
- **Bulletins** ✓/✗
- **Présences** ✓/✗
- **Emploi du temps** ✓/✗
- **Rapports** ✓/✗

## 👨‍🏫 ÉTAPE 4 : AJOUT DES ENSEIGNANTS

**Accès :** Tableau de bord → Enseignants

### Pour chaque enseignant :
1. **Informations personnelles :**
   - Nom et prénoms complets
   - Email professionnel
   - Numéro de téléphone
   - Adresse complète

2. **Informations professionnelles :**
   - Matières enseignées
   - Classes assignées
   - Niveau d'étude/Diplômes
   - Années d'expérience
   - Département

3. **Compte utilisateur :**
   - Créer le compte Educafric
   - Envoyer les identifiants de connexion

## 🏛️ ÉTAPE 5 : CRÉATION DES CLASSES

**Accès :** Tableau de bord → Classes

### Structure des classes :
1. **Nom de la classe** (ex: "6ème A", "CM2 B")
2. **Niveau d'étude** (Primaire, Collège, Lycée)
3. **Effectif maximum**
4. **Enseignant titulaire**
5. **Salle de classe assignée**

### Organisation par cycle :
- **Maternelle :** SIL, CP
- **Primaire :** CE1, CE2, CM1, CM2
- **Collège :** 6ème, 5ème, 4ème, 3ème
- **Lycée :** 2nde, 1ère, Terminale

## 👨‍👩‍👧‍👦 ÉTAPE 6 : INSCRIPTION DES ÉLÈVES

**Accès :** Tableau de bord → Élèves

### Informations élève :
1. **Données personnelles :**
   - Nom et prénoms
   - Date de naissance
   - Lieu de naissance
   - Sexe
   - Photo (optionnel)

2. **Inscription scolaire :**
   - Classe assignée
   - Année d'inscription
   - Numéro matricule
   - Statut (Actif/Inactif)

3. **Informations parents/tuteurs :**
   - Nom complet des parents
   - Profession
   - Téléphones de contact
   - Emails
   - Adresse familiale

## 📅 ÉTAPE 7 : EMPLOI DU TEMPS

**Accès :** Tableau de bord → Emploi du temps

### Configuration :
1. **Horaires généraux :**
   - Heure de début : 7h30
   - Heure de fin : 16h00
   - Pause déjeuner : 12h00-14h00 (recommandé pour l'Afrique)

2. **Planning par classe :**
   - Matières par jour
   - Enseignants assignés
   - Salles de classe
   - Durée des cours (55 minutes recommandé)

3. **Jours de semaine :**
   - Lundi à Vendredi (obligatoire)
   - Samedi (optionnel selon établissement)

## 💬 ÉTAPE 8 : SYSTÈME DE COMMUNICATIONS

**Accès :** Tableau de bord → Communications

### Canaux de communication :
1. **SMS automatiques** (présences, notes, annonces)
2. **Emails** (rapports, newsletters)
3. **WhatsApp Business** (communications urgentes)
4. **Notifications in-app** (temps réel)

### Messages types à configurer :
- Absence élève
- Retard élève
- Convocation parent
- Annonces générales
- Alertes disciplinaires

## 📊 ÉTAPE 9 : PARAMÈTRES AVANCÉS

### Année académique :
- **Date de début :** Octobre 2024
- **Date de fin :** Juillet 2025
- **Périodes d'évaluation :** Trimestre 1, 2, 3
- **Vacances scolaires** (Noël, Pâques, grandes vacances)

### Système de notation :
- **Échelle :** 0-20
- **Note de passage :** 10/20
- **Coefficients par matière**
- **Calcul moyenne générale**

## 🔍 ÉTAPE 10 : VÉRIFICATION ET TESTS

### Liste de vérification finale :
- [ ] Informations école complètes
- [ ] Logo et signatures téléchargés
- [ ] Administrateurs configurés
- [ ] Enseignants ajoutés avec comptes
- [ ] Classes créées et organisées
- [ ] Élèves inscrits avec parents
- [ ] Emploi du temps configuré
- [ ] Communications testées
- [ ] Paramètres académiques définis

## 📞 SUPPORT ET FORMATION

**Contact Educafric :**
- Email : info@educafric.com
- Téléphone : +237 656 200 472
- WhatsApp : +237 656 200 472

**Formation personnalisée :**
- Session de formation gratuite disponible
- Support technique 24h/7j
- Guide d'utilisation complet

---

## 🚀 ORDRE DE PRIORITÉ RECOMMANDÉ

1. **URGENT :** Informations générales école
2. **IMPORTANT :** Logo et identité visuelle
3. **ESSENTIEL :** Ajout des enseignants
4. **FONDAMENTAL :** Création des classes
5. **CRITIQUE :** Inscription des élèves
6. **NÉCESSAIRE :** Emploi du temps
7. **UTILE :** Communications
8. **OPTIMAL :** Paramètres avancés

Commencez par les étapes 1-2-3 dès aujourd'hui pour avoir une base solide, puis progressez selon vos besoins et votre rythme.`,
    en: `# 🏫 COMPLETE GUIDE - EDUCAFRIC SCHOOL PROFILE CONFIGURATION

## 📋 STEP 1: GENERAL SCHOOL INFORMATION

**🎯 Where to start:** Director Dashboard → School Settings

### Basic information to configure:
- **Full school name** (e.g., "Excellence Bilingual School Yaounde") 
- **Complete address** with district, city
- **Main phone number** (+237 xxx xxx xxx)
- **Official school email** (contact@your-school.cm)
- **Website** (if available)
- **Institution type** (Private/Public)
- **Academic year** (2024-2025)

### School statistics:
- Total number of students
- Total number of teachers
- Total number of classes

## 🎨 STEP 2: VISUAL IDENTITY (BRANDING)

**Access:** Dashboard → Bulletins → "Branding" Tab

### School logo:
1. **Upload official logo** (PNG/JPG format recommended)
2. **Optimal dimensions:** 200x200 pixels minimum
3. **Quality:** Clear and sharp image for PDF documents

### Digital signatures:
1. **Director's signature** (scanned or created image)
2. **Principal's signature** (if different)
3. **Format:** PNG with transparent background recommended

### Institutional colors:
- **Primary color** (school's main color)
- **Secondary color** (accent color)
- **Font family** (Arial, Times New Roman, etc.)

## 👥 STEP 3: ADMINISTRATOR MANAGEMENT

**Access:** Dashboard → Administrators

### Configure roles:
1. **Principal Director** (yourself)
2. **Deputy Director** (if applicable)
3. **Academic Coordinator**
4. **General Supervisor**

### Permissions by role:
- **Teacher management** ✓/✗
- **Student management** ✓/✗
- **Class management** ✓/✗
- **Communications** ✓/✗
- **Report cards** ✓/✗
- **Attendance** ✓/✗
- **Timetable** ✓/✗
- **Reports** ✓/✗

## 👨‍🏫 STEP 4: ADDING TEACHERS

**Access:** Dashboard → Teachers

### For each teacher:
1. **Personal information:**
   - Full name and surnames
   - Professional email
   - Phone number
   - Complete address

2. **Professional information:**
   - Subjects taught
   - Assigned classes
   - Education level/Degrees
   - Years of experience
   - Department

3. **User account:**
   - Create Educafric account
   - Send login credentials

## 🏛️ STEP 5: CLASS CREATION

**Access:** Dashboard → Classes

### Class structure:
1. **Class name** (e.g., "6th A", "CM2 B")
2. **Study level** (Primary, Middle School, High School)
3. **Maximum capacity**
4. **Homeroom teacher**
5. **Assigned classroom**

### Organization by cycle:
- **Kindergarten:** SIL, CP
- **Primary:** CE1, CE2, CM1, CM2
- **Middle School:** 6th, 5th, 4th, 3rd
- **High School:** 2nd, 1st, Terminal

## 👨‍👩‍👧‍👦 STEP 6: STUDENT ENROLLMENT

**Access:** Dashboard → Students

### Student information:
1. **Personal data:**
   - Name and surnames
   - Date of birth
   - Place of birth
   - Gender
   - Photo (optional)

2. **School enrollment:**
   - Assigned class
   - Enrollment year
   - Student ID number
   - Status (Active/Inactive)

3. **Parent/guardian information:**
   - Full parent names
   - Profession
   - Contact phones
   - Emails
   - Family address

## 📅 STEP 7: TIMETABLE

**Access:** Dashboard → Timetable

### Configuration:
1. **General hours:**
   - Start time: 7:30 AM
   - End time: 4:00 PM
   - Lunch break: 12:00-2:00 PM (recommended for Africa)

2. **Class schedule:**
   - Subjects per day
   - Assigned teachers
   - Classrooms
   - Class duration (55 minutes recommended)

3. **Weekdays:**
   - Monday to Friday (mandatory)
   - Saturday (optional depending on institution)

## 💬 STEP 8: COMMUNICATION SYSTEM

**Access:** Dashboard → Communications

### Communication channels:
1. **Automatic SMS** (attendance, grades, announcements)
2. **Emails** (reports, newsletters)
3. **WhatsApp Business** (urgent communications)
4. **In-app notifications** (real-time)

### Message types to configure:
- Student absence
- Student tardiness
- Parent summons
- General announcements
- Disciplinary alerts

## 📊 STEP 9: ADVANCED SETTINGS

### Academic year:
- **Start date:** October 2024
- **End date:** July 2025
- **Evaluation periods:** Quarter 1, 2, 3
- **School holidays** (Christmas, Easter, summer break)

### Grading system:
- **Scale:** 0-20
- **Passing grade:** 10/20
- **Subject coefficients**
- **Overall average calculation**

## 🔍 STEP 10: VERIFICATION AND TESTING

### Final checklist:
- [ ] Complete school information
- [ ] Logo and signatures uploaded
- [ ] Administrators configured
- [ ] Teachers added with accounts
- [ ] Classes created and organized
- [ ] Students enrolled with parents
- [ ] Timetable configured
- [ ] Communications tested
- [ ] Academic parameters defined

## 📞 SUPPORT AND TRAINING

**Educafric Contact:**
- Email: info@educafric.com
- Phone: +237 656 200 472
- WhatsApp: +237 656 200 472

**Personalized training:**
- Free training session available
- 24/7 technical support
- Complete user guide

---

## 🚀 RECOMMENDED PRIORITY ORDER

1. **URGENT:** General school information
2. **IMPORTANT:** Logo and visual identity
3. **ESSENTIAL:** Adding teachers
4. **FUNDAMENTAL:** Class creation
5. **CRITICAL:** Student enrollment
6. **NECESSARY:** Timetable
7. **USEFUL:** Communications
8. **OPTIMAL:** Advanced settings

Start with steps 1-2-3 today to have a solid foundation, then progress according to your needs and pace.`
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <Button 
            onClick={onBack} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Retour au Centre d\'Aide' : 'Back to Help Center'}
          </Button>
        )}
        
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800 flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              {language === 'fr' 
                ? 'Guide Configuration École Educafric' 
                : 'Educafric School Configuration Guide'
              }
            </CardTitle>
            <p className="text-blue-600">
              {language === 'fr'
                ? 'Guide complet et interactif pour configurer votre profil école'
                : 'Complete and interactive guide to configure your school profile'
              }
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="interactive" 
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {language === 'fr' ? 'Guide Interactif' : 'Interactive Guide'}
          </TabsTrigger>
          <TabsTrigger 
            value="documentation" 
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {language === 'fr' ? 'Documentation' : 'Documentation'}
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'fr' ? 'Ressources' : 'Resources'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactive">
          <SchoolConfigurationGuide />
        </TabsContent>

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {language === 'fr' ? 'Guide Complet PDF' : 'Complete PDF Guide'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">
                  {schoolConfigurationContent[language as 'fr' | 'en']}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  {language === 'fr' ? 'Téléchargements' : 'Downloads'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Guide PDF Configuration École' : 'School Configuration PDF Guide'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Checklist de Configuration' : 'Configuration Checklist'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Modèles de Paramètres' : 'Settings Templates'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  {language === 'fr' ? 'Support Personnalisé' : 'Personalized Support'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  {language === 'fr'
                    ? 'Besoin d\'aide personnalisée pour configurer votre école ? Notre équipe peut vous accompagner.'
                    : 'Need personalized help configuring your school? Our team can assist you.'
                  }
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    {language === 'fr' ? 'Formation gratuite disponible' : 'Free training available'}
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {language === 'fr' ? 'Demander une Formation' : 'Request Training'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveSchoolGuide;