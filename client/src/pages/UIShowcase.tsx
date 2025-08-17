import { useState } from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import ResponsiveLayout from '@/components/ui/ResponsiveLayout';
import TabNavigation, { TabItem } from '@/components/ui/TabNavigation';
import MobileMenu, { MenuItem } from '@/components/ui/MobileMenu';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormBuilder, { FormField } from '@/components/ui/FormBuilder';
import { Card, CardHeader, CardContent, CardFooter, StatsCard, MetricCard } from '@/components/ui/CardLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Student {
  id: number;
  name: string;
  class: string;
  grade: number;
  attendance: number;
  email: string;
}

const UIShowcase = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('components');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // Sample data for tables
  const students: Student[] = [
    { id: 1, name: 'Amina Kouassi', class: '6ème A', grade: 85, attendance: 95, email: 'amina@example.com' },
    { id: 2, name: 'Koffi Asante', class: '6ème B', grade: 78, attendance: 88, email: 'koffi@example.com' },
    { id: 3, name: 'Fatou Diallo', class: '5ème A', grade: 92, attendance: 97, email: 'fatou@example.com' },
    { id: 4, name: 'Ibrahim Traoré', class: '5ème B', grade: 76, attendance: 82, email: 'ibrahim@example.com' },
    { id: 5, name: 'Aisha Mensah', class: '4ème A', grade: 89, attendance: 91, email: 'aisha@example.com' }
  ];

  // Tab navigation items
  const tabItems: TabItem[] = [
    {
      id: 'components',
      labelEn: 'Components',
      labelFr: 'Composants',
      icon: BookOpen
    },
    {
      id: 'tables',
      labelEn: 'Data Tables',
      labelFr: 'Tableaux',
      icon: Users,
      badge: 5
    },
    {
      id: 'forms',
      labelEn: 'Forms',
      labelFr: 'Formulaires',
      icon: Edit
    },
    {
      id: 'cards',
      labelEn: 'Cards',
      labelFr: 'Cartes',
      icon: Calendar
    }
  ];

  // Navigation menu items
  const navigationItems: MenuItem[] = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelFr: 'Tableau de bord',
      icon: TrendingUp,
      href: '/dashboard'
    },
    {
      id: 'students',
      labelEn: 'Students',
      labelFr: 'Étudiants',
      icon: Users,
      badge: 245
    },
    {
      id: 'teachers',
      labelEn: 'Teachers',
      labelFr: 'Enseignants',
      icon: GraduationCap,
      children: [
        {
          id: 'all-teachers',
          labelEn: 'All Teachers',
          labelFr: 'Tous les Enseignants',
          icon: Users
        },
        {
          id: 'add-teacher',
          labelEn: 'Add Teacher',
          labelFr: 'Ajouter Enseignant',
          icon: Plus
        }
      ]
    },
    {
      id: 'settings',
      labelEn: 'Settings',
      labelFr: 'Paramètres',
      icon: Settings,
      divider: true
    }
  ];

  // Table columns
  const studentColumns: TableColumn<Student>[] = [
    {
      key: 'name',
      labelEn: 'Student Name',
      labelFr: 'Nom de l\'Étudiant',
      sortable: true,
      render: (value, student) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {student?.name?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'class',
      labelEn: 'Class',
      labelFr: 'Classe',
      sortable: true
    },
    {
      key: 'grade',
      labelEn: 'Average Grade',
      labelFr: 'Note Moyenne',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value >= 85 ? 'bg-green-100 text-green-800' :
          value >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}%
        </span>
      )
    },
    {
      key: 'attendance',
      labelEn: 'Attendance',
      labelFr: 'Présence',
      sortable: true,
      render: (value) => `${value}%`
    },
    {
      key: 'email',
      labelEn: 'Email',
      labelFr: 'Email',
      render: (value) => (
        <a href={`mailto:${value}`} className="text-primary hover:underline">
          {value}
        </a>
      )
    }
  ];

  // Table actions
  const studentActions: TableAction<Student>[] = [
    {
      id: 'view',
      labelEn: 'View',
      labelFr: 'Voir',
      icon: Eye,
      onClick: (student) => console.log('View student:', student),
      variant: 'default'
    },
    {
      id: 'edit',
      labelEn: 'Edit',
      labelFr: 'Modifier',
      icon: Edit,
      onClick: (student) => console.log('Edit student:', student),
      variant: 'secondary'
    },
    {
      id: 'delete',
      labelEn: 'Delete',
      labelFr: 'Supprimer',
      icon: Trash2,
      onClick: (student) => console.log('Delete student:', student),
      variant: 'destructive'
    }
  ];

  // Form fields
  const studentFormFields: FormField[] = [
    {
      name: 'firstName',
      labelEn: 'First Name',
      labelFr: 'Prénom',
      type: 'text',
      required: true,
      placeholder: { en: 'Enter first name', fr: 'Entrez le prénom' }
    },
    {
      name: 'lastName',
      labelEn: 'Last Name',
      labelFr: 'Nom de famille',
      type: 'text',
      required: true,
      placeholder: { en: 'Enter last name', fr: 'Entrez le nom de famille' }
    },
    {
      name: 'email',
      labelEn: 'Email Address',
      labelFr: 'Adresse Email',
      type: 'email',
      required: true,
      placeholder: { en: 'student@example.com', fr: 'etudiant@exemple.com' }
    },
    {
      name: 'phone',
      labelEn: 'Phone Number',
      labelFr: 'Numéro de Téléphone',
      type: 'tel',
      prefix: <Phone className="w-4 h-4 text-gray-400" />
    },
    {
      name: 'class',
      labelEn: 'Class',
      labelFr: 'Classe',
      type: 'select',
      required: true,
      options: [
        { value: '6A', labelEn: '6th Grade A', labelFr: '6ème A' },
        { value: '6B', labelEn: '6th Grade B', labelFr: '6ème B' },
        { value: '5A', labelEn: '5th Grade A', labelFr: '5ème A' },
        { value: '5B', labelEn: '5th Grade B', labelFr: '5ème B' }
      ]
    },
    {
      name: 'subjects',
      labelEn: 'Subjects',
      labelFr: 'Matières',
      type: 'multiselect',
      options: [
        { value: 'math', labelEn: 'Mathematics', labelFr: 'Mathématiques' },
        { value: 'french', labelEn: 'French', labelFr: 'Français' },
        { value: 'english', labelEn: 'English', labelFr: 'Anglais' },
        { value: 'science', labelEn: 'Science', labelFr: 'Sciences' },
        { value: 'history', labelEn: 'History', labelFr: 'Histoire' }
      ]
    },
    {
      name: 'birthDate',
      labelEn: 'Birth Date',
      labelFr: 'Date de Naissance',
      type: 'date',
      required: true
    },
    {
      name: 'notes',
      labelEn: 'Additional Notes',
      labelFr: 'Notes Additionnelles',
      type: 'textarea',
      rows: 3,
      placeholder: { en: 'Any additional information...', fr: 'Informations supplémentaires...' }
    }
  ];

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  const renderComponentsTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {language === 'fr' ? 'Système de Navigation par Onglets' : 'Tab Navigation System'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {language === 'fr' 
            ? 'Navigation avec icônes alignées horizontalement et menu déroulant mobile exécutable'
            : 'Navigation with horizontal aligned icons and executable mobile dropdown menu'
          }
        </p>
        
        <Card>
          <CardHeader 
            titleEn="Tab Navigation Demo"
            titleFr="Démo Navigation par Onglets"
            descriptionEn="Interactive tab navigation with mobile support"
            descriptionFr="Navigation par onglets interactive avec support mobile"
          />
          <CardContent>
            <TabNavigation
              tabs={tabItems}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="underline"
              orientation="horizontal"
              showMobileDropdown={true}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          {language === 'fr' ? 'Menu Mobile Exécutable' : 'Executable Mobile Menu'}
        </h2>
        <Card>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <MobileMenu
                items={navigationItems}
                side="left"
                width="md"
                trigger={
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
                    <Users className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Ouvrir Menu' : 'Open Menu'}</span>
                  </button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTablesTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {language === 'fr' ? 'Tableaux de Données Avancés' : 'Advanced Data Tables'}
      </h2>
      
      <DataTable
        data={students}
        columns={studentColumns}
        actions={studentActions}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={3}
        bulkActions={true}
        onBulkAction={(action, items) => {
          console.log('Bulk action:', action, items);
          setSelectedStudents(items);
        }}
        emptyStateEn="No students found"
        emptyStateFr="Aucun étudiant trouvé"
      />
    </div>
  );

  const renderFormsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {language === 'fr' ? 'Constructeur de Formulaires' : 'Form Builder'}
      </h2>
      
      <Card>
        <CardHeader 
          titleEn="Student Registration Form"
          titleFr="Formulaire d'Inscription Étudiant"
          descriptionEn="Comprehensive form with bilingual support and validation"
          descriptionFr="Formulaire complet avec support bilingue et validation"
        />
        <CardContent>
          <FormBuilder
            fields={studentFormFields}
            onSubmit={handleFormSubmit}
            layout="grid"
            columns={2}
            submitButtonTextEn="Register Student"
            submitButtonTextFr="Inscrire Étudiant"
            cancelButtonTextEn="Cancel"
            cancelButtonTextFr="Annuler"
            showResetButton={true}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderCardsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {language === 'fr' ? 'Système de Cartes' : 'Card System'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          titleEn="Total Students"
          titleFr="Total Étudiants"
          value={1245}
          change={{ value: 12, type: 'increase', period: 'this month' }}
          icon={Users}
          color="blue"
        />
        
        <StatsCard
          titleEn="Active Teachers"
          titleFr="Enseignants Actifs"
          value={87}
          change={{ value: 3, type: 'increase', period: 'this week' }}
          icon={GraduationCap}
          color="green"
        />
        
        <StatsCard
          titleEn="Average Grade"
          titleFr="Note Moyenne"
          value="84.2%"
          change={{ value: 2, type: 'increase', period: 'this quarter' }}
          icon={BookOpen}
          color="yellow"
        />
        
        <StatsCard
          titleEn="Attendance Rate"
          titleFr="Taux de Présence"
          value="92.5%"
          change={{ value: 1, type: 'decrease', period: 'this month' }}
          icon={Calendar}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          titleEn="School Performance"
          titleFr="Performance de l'École"
          metrics={[
            {
              labelEn: 'Top Performers',
              labelFr: 'Meilleurs Élèves',
              value: 245,
              icon: TrendingUp,
              color: 'bg-green-100 text-green-600'
            },
            {
              labelEn: 'Need Support',
              labelFr: 'Besoin d\'Aide',
              value: 32,
              icon: Users,
              color: 'bg-orange-100 text-orange-600'
            },
            {
              labelEn: 'Perfect Attendance',
              labelFr: 'Présence Parfaite',
              value: 156,
              icon: Calendar,
              color: 'bg-blue-100 text-blue-600'
            }
          ]}
          actions={[
            {
              id: 'export',
              labelEn: 'Export',
              labelFr: 'Exporter',
              icon: Download,
              onClick: () => console.log('Export clicked'),
              variant: 'secondary'
            }
          ]}
        />

        <Card>
          <CardHeader
            titleEn="Recent Activity"
            titleFr="Activité Récente"
            icon={Calendar}
            actions={[
              {
                id: 'view-all',
                labelEn: 'View All',
                labelFr: 'Voir Tout',
                onClick: () => console.log('View all clicked'),
                variant: 'primary'
              }
            ]}
          />
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New student registered', time: '2 minutes ago', fr: 'Nouvel étudiant inscrit' },
                { action: 'Grade updated for Class 6A', time: '15 minutes ago', fr: 'Notes mises à jour pour 6ème A' },
                { action: 'Teacher meeting scheduled', time: '1 hour ago', fr: 'Réunion enseignants programmée' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium">
                    {language === 'fr' ? activity.fr : activity.action}
                  </span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter alignment="center">
            <span className="text-sm text-gray-500">
              {language === 'fr' ? 'Plus d\'activités disponibles' : 'More activities available'}
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components': return renderComponentsTab();
      case 'tables': return renderTablesTab();
      case 'forms': return renderFormsTab();
      case 'cards': return renderCardsTab();
      default: return renderComponentsTab();
    }
  };

  return (
    <ResponsiveLayout
      navigationItems={navigationItems}
      tabItems={tabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showTabs={true}
      showMobileMenu={true}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'fr' ? 'Vitrine des Composants UI' : 'UI Components Showcase'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'fr' 
              ? 'Démonstration du système de composants UI normalisé et consolidé d\'Educafric avec support bilingue et design mobile-first'
              : 'Demonstration of Educafric\'s normalized and consolidated UI component system with bilingual support and mobile-first design'
            }
          </p>
        </div>
        
        {renderTabContent()}
      </div>
    </ResponsiveLayout>
  );
};

export default UIShowcase;