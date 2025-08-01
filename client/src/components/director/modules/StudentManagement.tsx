import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Search, Download, Filter, MoreHorizontal, BookOpen, TrendingUp, Calendar, GraduationCap, Upload, X, Eye, Edit, Trash2, Mail } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import DashboardNavbar from '@/components/shared/DashboardNavbar';
import { useToast } from '@/hooks/use-toast';
import EnhancedStudentForm from '@/components/forms/EnhancedStudentForm';

const StudentManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    minAverage: '',
    maxAverage: '',
    minAttendance: '',
    maxAttendance: '',
    minAge: '',
    maxAge: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    class: '',
    age: '',
    parentEmail: '',
    parentPhone: '',
    parent2Email: '',
    parent2Phone: '',
    parent2Name: '',
    parentName: ''
  });

  const text = {
    fr: {
      title: 'Gestion des Étudiants',
      subtitle: 'Administration complète des étudiants de votre établissement',
      stats: {
        total: 'Total Étudiants',
        enrolled: 'Inscrits',
        active: 'Actifs',
        graduated: 'Diplômés'
      },
      actions: {
        addStudent: 'Ajouter Étudiant',
        import: 'Importer',
        export: 'Exporter',
        filter: 'Filtrer',
        filterModal: {
          title: 'Filtres Avancés',
          status: 'Statut',
          allStatuses: 'Tous les statuts',
          averageRange: 'Plage de moyenne',
          attendanceRange: 'Plage de présence',
          ageRange: 'Plage d\'âge',
          from: 'De',
          to: 'À',
          applyFilters: 'Appliquer Filtres',
          resetFilters: 'Réinitialiser',
          activeFilters: 'Filtres Actifs'
        }
      },
      table: {
        name: 'Nom',
        class: 'Classe',
        age: 'Âge',
        average: 'Moyenne',
        attendance: 'Présence',
        status: 'Statut',
        actions: 'Actions'
      },
      status: {
        active: 'Actif',
        inactive: 'Inactif',
        suspended: 'Suspendu'
      },
      classes: {
        all: 'Toutes les classes',
        sixth: '6ème',
        fifth: '5ème',
        fourth: '4ème',
        third: '3ème'
      }
    },
    en: {
      title: 'Student Management',
      subtitle: 'Complete administration of your institution students',
      stats: {
        total: 'Total Students',
        enrolled: 'Enrolled',
        active: 'Active',
        graduated: 'Graduated'
      },
      actions: {
        addStudent: 'Add Student',
        import: 'Import',
        export: 'Export',
        filter: 'Filter',
        filterModal: {
          title: 'Advanced Filters',
          status: 'Status',
          allStatuses: 'All statuses',
          averageRange: 'Average range',
          attendanceRange: 'Attendance range',
          ageRange: 'Age range',
          from: 'From',
          to: 'To',
          applyFilters: 'Apply Filters',
          resetFilters: 'Reset',
          activeFilters: 'Active Filters'
        }
      },
      table: {
        name: 'Name',
        class: 'Class',
        age: 'Age',
        average: 'Average',
        attendance: 'Attendance',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended'
      },
      classes: {
        all: 'All classes',
        sixth: '6th Grade',
        fifth: '5th Grade',
        fourth: '4th Grade',
        third: '3rd Grade'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Données d'étudiants réalistes
  const students = [
    {
      id: 1,
      name: 'Marie Kamga',
      class: '6ème A',
      age: 12,
      average: 16.5,
      attendance: 95,
      status: 'active',
      email: 'marie.kamga@educafric.com'
    },
    {
      id: 2,
      name: 'Paul Mvondo',
      class: '5ème B',
      age: 13,
      average: 14.2,
      attendance: 89,
      status: 'active',
      email: 'paul.mvondo@educafric.com'
    },
    {
      id: 3,
      name: 'Sophie Biya',
      class: '4ème C',
      age: 14,
      average: 17.8,
      attendance: 98,
      status: 'active',
      email: 'sophie.biya@educafric.com'
    },
    {
      id: 4,
      name: 'Junior Essomba',
      class: '3ème A',
      age: 15,
      average: 13.5,
      attendance: 76,
      status: 'inactive',
      email: 'junior.essomba@educafric.com'
    },
    {
      id: 5,
      name: 'Fatima Nkomo',
      class: '6ème B',
      age: 12,
      average: 15.9,
      attendance: 92,
      status: 'active',
      email: 'fatima.nkomo@educafric.com'
    }
  ];

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
    if (!student) return false;
    const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student?.class?.includes(selectedClass);
    
    // Advanced filter conditions
    const matchesStatus = filterOptions.status === 'all' || student.status === filterOptions.status;
    const matchesMinAverage = !filterOptions.minAverage || student.average >= parseFloat(filterOptions.minAverage);
    const matchesMaxAverage = !filterOptions.maxAverage || student.average <= parseFloat(filterOptions.maxAverage);
    const matchesMinAttendance = !filterOptions.minAttendance || student.attendance >= parseFloat(filterOptions.minAttendance);
    const matchesMaxAttendance = !filterOptions.maxAttendance || student.attendance <= parseFloat(filterOptions.maxAttendance);
    const matchesMinAge = !filterOptions.minAge || student.age >= parseInt(filterOptions.minAge);
    const matchesMaxAge = !filterOptions.maxAge || student.age <= parseInt(filterOptions.maxAge);
    
    return matchesSearch && matchesClass && matchesStatus && matchesMinAverage && 
           matchesMaxAverage && matchesMinAttendance && matchesMaxAttendance && 
           matchesMinAge && matchesMaxAge;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Actions Header */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{String(t?.title) || "N/A"}</h2>
              <p className="text-gray-600 mt-1">{String(t?.subtitle) || "N/A"}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    name: '',
                    email: '',
                    class: '',
                    age: '',
                    parentEmail: '',
                    parentPhone: '',
                    parent2Email: '',
                    parent2Phone: '',
                    parent2Name: '',
                    parentName: ''
                  });
                  setShowAddModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {String(t?.actions?.addStudent) || "N/A"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                {String(t?.actions?.import) || "N/A"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Generate CSV content
                  const csvContent = [
                    ['Nom,Classe,Age,Moyenne,Présence,Statut,Email'],
                    ...(Array.isArray(filteredStudents) ? filteredStudents : []).map(student => [
                      student.name,
                      student.class,
                      student.age,
                      student.average,
                      student.attendance + '%',
                      t.status[student.status as keyof typeof t.status],
                      student.email
                    ].join(','))
                  ].join('\n');
                  
                  // Create and download file
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
                  if (link.style) {
                    link.style.visibility = 'hidden';
                  }
                  if (document.body) {
                    document.body.appendChild(link);
                  }
                  link.click();
                  if (document.body) {
                    document.body.removeChild(link);
                  }
                  
                  toast({
                    title: t?.actions?.export,
                    description: language === 'fr' ? 'Export CSV des élèves terminé avec succès' : 'Student CSV export completed successfully',
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {String(t?.actions?.export) || "N/A"}
              </Button>
            </div>
          </div>
        </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{String(t?.stats?.total) || "N/A"}</p>
              <p className="text-2xl font-bold">847</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{String(t?.stats?.enrolled) || "N/A"}</p>
              <p className="text-2xl font-bold">823</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{String(t?.stats?.active) || "N/A"}</p>
              <p className="text-2xl font-bold">798</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{String(t?.stats?.graduated) || "N/A"}</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
      </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              <h3 className="text-xl font-semibold">{language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}</h3>
            </div>
          </CardHeader>
          <CardContent>
            <MobileActionsOverlay
              title={language === 'fr' ? 'Actions Étudiants' : 'Student Actions'}
              maxVisibleButtons={3}
              actions={[
                {
                  id: 'add-student',
                  label: language === 'fr' ? 'Ajouter Étudiant' : 'Add Student',
                  icon: <UserPlus className="w-5 h-5" />,
                  onClick: () => {
                    setFormData({
                      firstName: '',
                      lastName: '',
                      name: '',
                      email: '',
                      class: '',
                      age: '',
                      parentEmail: '',
                      parentPhone: '',
                      parent2Email: '',
                      parent2Phone: '',
                      parent2Name: '',
                      parentName: ''
                    });
                    setShowAddModal(true);
                  },
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'bulk-import',
                  label: language === 'fr' ? 'Import Groupé' : 'Bulk Import',
                  icon: <Upload className="w-5 h-5" />,
                  onClick: () => setShowImportModal(true),
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'export-data',
                  label: language === 'fr' ? 'Exporter Données' : 'Export Data',
                  icon: <Download className="w-5 h-5" />,
                  onClick: () => {
                    const csvContent = [
                      ['Nom,Classe,Age,Moyenne,Présence,Statut,Email'],
                      ...(Array.isArray(filteredStudents) ? filteredStudents : []).map(student => [
                        student.name,
                        student.class,
                        student.age,
                        student.average,
                        student.attendance + '%',
                        t.status[student.status as keyof typeof t.status],
                        student.email
                      ].join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
                    if (link.style) link.style.visibility = 'hidden';
                    if (document.body) document.body.appendChild(link);
                    link.click();
                    if (document.body) document.body.removeChild(link);
                    
                    toast({
                      title: t?.actions?.export,
                      description: language === 'fr' ? 'Export CSV des élèves terminé avec succès' : 'Student CSV export completed successfully',
                    });
                  },
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'attendance-report',
                  label: language === 'fr' ? 'Rapport Présence' : 'Attendance Report',
                  icon: <BookOpen className="w-5 h-5" />,
                  onClick: () => {
                    const event = new CustomEvent('switchToAttendance');
                    window.dispatchEvent(event);
                  },
                  color: 'bg-orange-600 hover:bg-orange-700'
                },
                {
                  id: 'notify-parents',
                  label: language === 'fr' ? 'Notifier Parents' : 'Notify Parents',
                  icon: <Mail className="w-5 h-5" />,
                  onClick: () => {
                    const event = new CustomEvent('switchToCommunications');
                    window.dispatchEvent(event);
                  },
                  color: 'bg-teal-600 hover:bg-teal-700'
                }
              ]}
            />
          </CardContent>
        </Card>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher un étudiant...' : 'Search student...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{String(t?.classes?.all) || "N/A"}</option>
            <option value="6ème">{String(t?.classes?.sixth) || "N/A"}</option>
            <option value="5ème">{String(t?.classes?.fifth) || "N/A"}</option>
            <option value="4ème">{String(t?.classes?.fourth) || "N/A"}</option>
            <option value="3ème">{String(t?.classes?.third) || "N/A"}</option>
          </select>
          <Button 
            variant="outline"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {String(t?.actions?.filter) || "N/A"}
            {Object.values(filterOptions).some(value => value && value !== 'all') && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">
                {Object.values(filterOptions).filter(value => value && value !== 'all').length}
              </Badge>
            )}
          </Button>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">{String(t?.table?.name) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.class) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.age) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.average) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.attendance) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.status) || "N/A"}</th>
                <th className="text-left p-4 font-semibold">{String(t?.table?.actions) || "N/A"}</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(filteredStudents) ? filteredStudents : []).map((student) => (
                <tr key={String(student?.id) || "N/A"} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{String(student?.name) || "N/A"}</div>
                      <div className="text-sm text-gray-500">{String(student?.email) || "N/A"}</div>
                    </div>
                  </td>
                  <td className="p-4">{String(student?.class) || "N/A"}</td>
                  <td className="p-4">{String(student?.age) || "N/A"} ans</td>
                  <td className="p-4">
                    <span className={`font-semibold ${(student.average >= 15) ? 'text-green-600' : (student.average >= 10) ? 'text-yellow-600' : 'text-red-600'}`}>
                      {String(student?.average) || "N/A"}/20
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${(student.attendance >= 90) ? 'text-green-600' : (student.attendance >= 75) ? 'text-yellow-600' : 'text-red-600'}`}>
                      {String(student?.attendance) || "N/A"}%
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusBadge(student.status)}>
                      {t.status[student.status as keyof typeof t.status]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setFormData({
                            firstName: student.name?.split(' ')[0] || '',
                            lastName: student.name?.split(' ').slice(1).join(' ') || '',
                            name: student.name,
                            email: student.email,
                            class: student.class,
                            age: student?.age?.toString() || '',
                            parentEmail: student?.email?.replace(student?.name?.toLowerCase().replace(' ', '.'), 'parent.') || '',
                            parentPhone: '+237 6XX XXX XXX',
                            parent2Email: '',
                            parent2Phone: '',
                            parent2Name: '',
                            parentName: ''
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élève ?' : 'Are you sure you want to delete this student?')) {
                            toast({
                              title: language === 'fr' ? 'Élève supprimé' : 'Student deleted',
                              description: language === 'fr' ? `${String(student?.name) || "N/A"} a été supprimé avec succès` : `${String(student?.name) || "N/A"} has been deleted successfully`,
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && typeof showAddModal === "object" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {language === 'fr' ? 'Ajouter un Élève' : 'Add Student'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                    <Input
                      id="student-name"
                      value={String(formData?.name) || "N/A"}
                      onChange={(e) => setFormData({...formData, name: e?.target?.value})}
                      placeholder={language === 'fr' ? 'Entrez le nom complet' : 'Enter full name'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-email">{language === 'fr' ? 'Email élève' : 'Student Email'}</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={String(formData?.email) || "N/A"}
                      onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                      placeholder="eleve@educafric.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-class">{language === 'fr' ? 'Classe' : 'Class'}</Label>
                    <select
                      id="student-class"
                      value={String(formData?.class) || "N/A"}
                      onChange={(e) => setFormData({...formData, class: e?.target?.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{language === 'fr' ? 'Sélectionner une classe' : 'Select a class'}</option>
                      <option value="6ème A">6ème A</option>
                      <option value="6ème B">6ème B</option>
                      <option value="5ème A">5ème A</option>
                      <option value="5ème B">5ème B</option>
                      <option value="4ème A">4ème A</option>
                      <option value="4ème B">4ème B</option>
                      <option value="3ème A">3ème A</option>
                      <option value="3ème B">3ème B</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="student-age">{language === 'fr' ? 'Âge' : 'Age'}</Label>
                    <Input
                      id="student-age"
                      type="number"
                      value={String(formData?.age) || "N/A"}
                      onChange={(e) => setFormData({...formData, age: e?.target?.value})}
                      placeholder="12"
                      min="6"
                      max="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent-email">{language === 'fr' ? 'Email parent' : 'Parent Email'}</Label>
                    <Input
                      id="parent-email"
                      type="email"
                      value={String(formData?.parentEmail) || "N/A"}
                      onChange={(e) => setFormData({...formData, parentEmail: e?.target?.value})}
                      placeholder="parent@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent-phone">{language === 'fr' ? 'Téléphone parent' : 'Parent Phone'}</Label>
                    <Input
                      id="parent-phone"
                      value={String(formData?.parentPhone) || "N/A"}
                      onChange={(e) => setFormData({...formData, parentPhone: e?.target?.value})}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: language === 'fr' ? 'Élève ajouté' : 'Student added',
                      description: language === 'fr' ? `${String(formData?.name) || "N/A"} a été ajouté avec succès en ${String(formData?.class) || "N/A"}` : `${String(formData?.name) || "N/A"} has been added successfully to ${String(formData?.class) || "N/A"}`,
                    });
                    setShowAddModal(false);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      name: '',
                      email: '',
                      class: '',
                      age: '',
                      parentEmail: '',
                      parentPhone: '',
                      parent2Email: '',
                      parent2Phone: '',
                      parent2Name: '',
                      parentName: ''
                    });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {language === 'fr' ? 'Ajouter' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {showImportModal && typeof showImportModal === "object" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {language === 'fr' ? 'Importer des Élèves' : 'Import Students'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowImportModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {language === 'fr' ? 'Glissez et déposez votre fichier CSV ici' : 'Drag and drop your CSV file here'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'fr' ? 'ou cliquez pour sélectionner' : 'or click to select'}
                  </p>
                  <Button variant="outline">
                    {language === 'fr' ? 'Sélectionner fichier' : 'Select File'}
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {language === 'fr' ? 'Format CSV requis:' : 'Required CSV format:'}
                  </h4>
                  <code className="text-sm bg-white p-2 rounded block">
                    Nom,Email,Classe,Age,EmailParent,TelParent<br/>
                    Marie Kamga,marie@educafric.com,6ème A,12,parent@email.com,+237...
                  </code>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportModal(false)}
                  className="flex-1"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: language === 'fr' ? 'Import réussi' : 'Import successful',
                      description: language === 'fr' ? 'Les élèves ont été importés avec succès' : 'Students have been imported successfully',
                    });
                    setShowImportModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {language === 'fr' ? 'Importer' : 'Import'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && typeof showEditModal === "object" && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {language === 'fr' ? 'Modifier l\'Élève' : 'Edit Student'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-student-name">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
                    <Input
                      id="edit-student-name"
                      value={String(formData?.name) || "N/A"}
                      onChange={(e) => setFormData({...formData, name: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-student-email">{language === 'fr' ? 'Email élève' : 'Student Email'}</Label>
                    <Input
                      id="edit-student-email"
                      type="email"
                      value={String(formData?.email) || "N/A"}
                      onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-student-class">{language === 'fr' ? 'Classe' : 'Class'}</Label>
                    <select
                      id="edit-student-class"
                      value={String(formData?.class) || "N/A"}
                      onChange={(e) => setFormData({...formData, class: e?.target?.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="6ème A">6ème A</option>
                      <option value="6ème B">6ème B</option>
                      <option value="5ème A">5ème A</option>
                      <option value="5ème B">5ème B</option>
                      <option value="4ème A">4ème A</option>
                      <option value="4ème B">4ème B</option>
                      <option value="3ème A">3ème A</option>
                      <option value="3ème B">3ème B</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-student-age">{language === 'fr' ? 'Âge' : 'Age'}</Label>
                    <Input
                      id="edit-student-age"
                      type="number"
                      value={String(formData?.age) || "N/A"}
                      onChange={(e) => setFormData({...formData, age: e?.target?.value})}
                      min="6"
                      max="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-parent-email">{language === 'fr' ? 'Email parent' : 'Parent Email'}</Label>
                    <Input
                      id="edit-parent-email"
                      type="email"
                      value={String(formData?.parentEmail) || "N/A"}
                      onChange={(e) => setFormData({...formData, parentEmail: e?.target?.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-parent-phone">{language === 'fr' ? 'Téléphone parent' : 'Parent Phone'}</Label>
                    <Input
                      id="edit-parent-phone"
                      value={String(formData?.parentPhone) || "N/A"}
                      onChange={(e) => setFormData({...formData, parentPhone: e?.target?.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: language === 'fr' ? 'Élève modifié' : 'Student updated',
                      description: language === 'fr' ? `${String(formData?.name) || "N/A"} a été modifié avec succès` : `${String(formData?.name) || "N/A"} has been updated successfully`,
                    });
                    setShowEditModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && typeof showViewModal === "object" && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {language === 'fr' ? 'Détails de l\'Élève' : 'Student Details'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedStudent?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{String(selectedStudent?.name) || "N/A"}</h3>
                    <Badge className={getStatusBadge(selectedStudent.status)}>
                      {t.status[selectedStudent.status as keyof typeof t.status]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{language === 'fr' ? 'Classe' : 'Class'}</span>
                    </div>
                    <p>{String(selectedStudent?.class) || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{language === 'fr' ? 'Âge' : 'Age'}</span>
                    </div>
                    <p>{String(selectedStudent?.age) || "N/A"} ans</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{language === 'fr' ? 'Moyenne générale' : 'Overall Average'}</span>
                    </div>
                    <p className={`font-semibold ${(selectedStudent.average >= 15) ? 'text-green-600' : (selectedStudent.average >= 10) ? 'text-yellow-600' : 'text-red-600'}`}>
                      {String(selectedStudent?.average) || "N/A"}/20
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{language === 'fr' ? 'Présence' : 'Attendance'}</span>
                    </div>
                    <p className={`font-semibold ${(selectedStudent.attendance >= 90) ? 'text-green-600' : (selectedStudent.attendance >= 75) ? 'text-yellow-600' : 'text-red-600'}`}>
                      {String(selectedStudent?.attendance) || "N/A"}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setShowViewModal(false)}
                >
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {showFilterModal && typeof showFilterModal === "object" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {t?.actions?.filterModal.title}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFilterModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Status Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    {t?.actions?.filterModal.status}
                  </Label>
                  <select
                    value={String(filterOptions?.status) || "N/A"}
                    onChange={(e) => setFilterOptions({...filterOptions, status: e?.target?.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t?.actions?.filterModal.allStatuses}</option>
                    <option value="active">{String(t?.status?.active) || "N/A"}</option>
                    <option value="inactive">{String(t?.status?.inactive) || "N/A"}</option>
                    <option value="suspended">{String(t?.status?.suspended) || "N/A"}</option>
                  </select>
                </div>

                {/* Average Range Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    {t?.actions?.filterModal.averageRange} (0-20)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.from}</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        placeholder="0"
                        value={String(filterOptions?.minAverage) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, minAverage: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.to}</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        placeholder="20"
                        value={String(filterOptions?.maxAverage) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, maxAverage: e?.target?.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Range Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    {t?.actions?.filterModal.attendanceRange} (0-100%)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.from}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={String(filterOptions?.minAttendance) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, minAttendance: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.to}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="100"
                        value={String(filterOptions?.maxAttendance) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, maxAttendance: e?.target?.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Age Range Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    {t?.actions?.filterModal.ageRange}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.from}</label>
                      <Input
                        type="number"
                        min="5"
                        max="25"
                        placeholder="10"
                        value={String(filterOptions?.minAge) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, minAge: e?.target?.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">{t?.actions?.filterModal.to}</label>
                      <Input
                        type="number"
                        min="5"
                        max="25"
                        placeholder="18"
                        value={String(filterOptions?.maxAge) || "N/A"}
                        onChange={(e) => setFilterOptions({...filterOptions, maxAge: e?.target?.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {Object.values(filterOptions).some(value => value && value !== 'all') && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">{t?.actions?.filterModal.activeFilters}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.status !== 'all' && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {t?.actions?.filterModal.status}: {t.status[filterOptions.status as keyof typeof t.status]}
                        </Badge>
                      )}
                      {filterOptions.minAverage && (
                        <Badge className="bg-green-100 text-green-800">
                          Min moyenne: {String(filterOptions?.minAverage) || "N/A"}
                        </Badge>
                      )}
                      {filterOptions.maxAverage && (
                        <Badge className="bg-green-100 text-green-800">
                          Max moyenne: {String(filterOptions?.maxAverage) || "N/A"}
                        </Badge>
                      )}
                      {filterOptions.minAttendance && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Min présence: {String(filterOptions?.minAttendance) || "N/A"}%
                        </Badge>
                      )}
                      {filterOptions.maxAttendance && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Max présence: {String(filterOptions?.maxAttendance) || "N/A"}%
                        </Badge>
                      )}
                      {filterOptions.minAge && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Min âge: {String(filterOptions?.minAge) || "N/A"}
                        </Badge>
                      )}
                      {filterOptions.maxAge && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Max âge: {String(filterOptions?.maxAge) || "N/A"}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterOptions({
                      status: 'all',
                      minAverage: '',
                      maxAverage: '',
                      minAttendance: '',
                      maxAttendance: '',
                      minAge: '',
                      maxAge: ''
                    });
                    toast({
                      title: t?.actions?.filterModal.resetFilters,
                      description: language === 'fr' ? 'Tous les filtres ont été réinitialisés' : 'All filters have been reset',
                    });
                  }}
                  className="flex-1"
                >
                  {t?.actions?.filterModal.resetFilters}
                </Button>
                <Button 
                  onClick={() => {
                    setShowFilterModal(false);
                    toast({
                      title: t?.actions?.filterModal.applyFilters,
                      description: language === 'fr' ? `Filtres appliqués - ${String(filteredStudents?.length) || "N/A"} étudiants trouvés` : `Filters applied - ${String(filteredStudents?.length) || "N/A"} students found`,
                    });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {t?.actions?.filterModal.applyFilters}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentManagement;