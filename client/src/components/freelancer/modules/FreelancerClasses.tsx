import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Plus, Calendar, BookOpen, DollarSign, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FreelancerClasses = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Mes Élèves',
      subtitle: 'Gestion de vos élèves en cours particuliers',
      totalStudents: 'Élèves Totaux',
      activeStudents: 'Élèves Actifs',
      monthlyEarnings: 'Revenus Mensuels',
      sessionsThisWeek: 'Séances Cette Semaine',
      addStudent: 'Ajouter Élève',
      selectClass: 'Toutes les classes',
      studentName: 'Nom Élève',
      parentName: 'Nom Parent',
      phone: 'Téléphone',
      subject: 'Matière',
      level: 'Niveau',
      hourlyRate: 'Tarif/Heure',
      weeklyHours: 'Heures/Semaine',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      contact: 'Contacter',
      schedule: 'Programmer',
      nextSession: 'Prochaine Séance',
      totalHours: 'Heures Totales',
      progress: 'Progrès',
      payment: 'Paiement',
      paid: 'Payé',
      pending: 'En Attente',
      studentAdded: 'Élève ajouté avec succès!',
      loading: 'Chargement des élèves...',
      error: 'Erreur lors du chargement',
      noStudents: 'Aucun élève inscrit'
    },
    en: {
      title: 'My Students',
      subtitle: 'Management of your private tutoring students',
      totalStudents: 'Total Students',
      activeStudents: 'Active Students',
      monthlyEarnings: 'Monthly Earnings',
      sessionsThisWeek: 'Sessions This Week',
      addStudent: 'Add Student',
      selectClass: 'All classes',
      studentName: 'Student Name',
      parentName: 'Parent Name',
      phone: 'Phone',
      subject: 'Subject',
      level: 'Level',
      hourlyRate: 'Rate/Hour',
      weeklyHours: 'Hours/Week',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      contact: 'Contact',
      schedule: 'Schedule',
      nextSession: 'Next Session',
      totalHours: 'Total Hours',
      progress: 'Progress',
      payment: 'Payment',
      paid: 'Paid',
      pending: 'Pending',
      studentAdded: 'Student added successfully!',
      loading: 'Loading students...',
      error: 'Error loading data',
      noStudents: 'No students enrolled'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch freelancer's students from API
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['/api/freelancer/students', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/freelancer/students?teacherId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch freelancer's sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/freelancer/sessions', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/freelancer/sessions?teacherId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch('/api/freelancer/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          teacherId: user?.id
        }),
      });
      if (!response.ok) throw new Error('Failed to add student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/students'] });
      alert(t.studentAdded);
      setShowAddStudent(false);
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      alert('Erreur lors de l\'ajout de l\'élève.');
    }
  });

  const handleAddStudent = (formData: FormData) => {
    const studentData = {
      name: formData.get('name') as string,
      parentName: formData.get('parentName') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      level: formData.get('level') as string,
      hourlyRate: parseFloat(formData.get('hourlyRate') as string) || 0,
      weeklyHours: parseInt(formData.get('weeklyHours') as string) || 0
    };

    addStudentMutation.mutate(studentData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{t.error}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0);
  const activeStudents = (Array.isArray(students) ? students : []).filter((s: any) => s.status === 'active').length;
  const monthlyEarnings = (Array.isArray(students) ? students : []).reduce((sum: number, s: any) => 
    sum + ((s.hourlyRate || 0) * (s.weeklyHours || 0) * 4), 0);
  const sessionsThisWeek = (Array.isArray(sessions) ? sessions : []).filter((s: any) => {
    const sessionDate = new Date(s.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return sessionDate >= weekStart;
  }).length;

  const stats = [
    {
      title: t.totalStudents,
      value: totalStudents.toString(),
      icon: <Users className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t.activeStudents,
      value: activeStudents.toString(),
      icon: <BookOpen className="w-5 h-5" />,
      trend: { value: 1, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.monthlyEarnings,
      value: `${monthlyEarnings.toLocaleString()} CFA`,
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 8, isPositive: true },
      gradient: 'purple' as const
    },
    {
      title: t.sessionsThisWeek,
      value: sessionsThisWeek.toString(),
      icon: <Calendar className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'orange' as const
    }
  ];

  const getPaymentStatus = (student: any) => {
    const lastPayment = student.lastPayment;
    if (!lastPayment) return 'pending';
    const paymentDate = new Date(lastPayment);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 'pending' : 'paid';
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Élèves</h3>
          <Button 
            onClick={() => setShowAddStudent(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addStudent}
          </Button>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noStudents}
            </div>
          ) : (
            (Array.isArray(students) ? students : []).map((student: any, index: number) => {
              const colors = ['blue', 'green', 'purple', 'orange'];
              const colorClass = colors[index % (Array.isArray(colors) ? colors.length : 0)];
              const paymentStatus = getPaymentStatus(student);
              
              return (
                <div key={student.id} className={`activity-card-${colorClass} p-6 rounded-xl transition-all duration-300 hover:scale-105`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{student.name || ''}</h4>
                          <Badge className={getPaymentColor(paymentStatus)}>
                            {t[paymentStatus as keyof typeof t] || paymentStatus}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Parent:</strong> {student.parentName || 'Non spécifié'}</p>
                          <p><strong>Contact:</strong> {student.phone || 'Non spécifié'}</p>
                          <p><strong>Matière:</strong> {student.subject || 'Non spécifiée'}</p>
                          <p><strong>Niveau:</strong> {student.level || 'Non spécifié'}</p>
                        </div>

                        {/* Progress indicators */}
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.weeklyHours || 0}h</div>
                            <div className="text-xs text-gray-600">par semaine</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.totalHours || 0}h</div>
                            <div className="text-xs text-gray-600">au total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.progress || 85}%</div>
                            <div className="text-xs text-gray-600">progression</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {student.hourlyRate || 0} CFA/h
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {student.nextSession ? 
                          `Prochaine: ${new Date(student.nextSession).toLocaleDateString('fr-FR')}` : 
                          'Pas de séance prévue'
                        }
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-1" />
                          {t.schedule}
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {t.edit}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ModernCard>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.addStudent}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddStudent(new FormData(e.target as HTMLFormElement));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.studentName} *
                  </label>
                  <Input name="name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.parentName}
                  </label>
                  <Input name="parentName" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phone}
                  </label>
                  <Input name="phone" type="tel" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.subject} *
                    </label>
                    <select name="subject" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="">Sélectionner</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Français">Français</option>
                      <option value="Anglais">Anglais</option>
                      <option value="Sciences">Sciences</option>
                      <option value="Histoire">Histoire</option>
                      <option value="Géographie">Géographie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.level}
                    </label>
                    <select name="level" className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option value="">Sélectionner</option>
                      <option value="CE1">CE1</option>
                      <option value="CE2">CE2</option>
                      <option value="CM1">CM1</option>
                      <option value="CM2">CM2</option>
                      <option value="6ème">6ème</option>
                      <option value="5ème">5ème</option>
                      <option value="4ème">4ème</option>
                      <option value="3ème">3ème</option>
                      <option value="2nde">2nde</option>
                      <option value="1ère">1ère</option>
                      <option value="Terminale">Terminale</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.hourlyRate} (CFA)
                    </label>
                    <Input name="hourlyRate" type="number" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.weeklyHours}
                    </label>
                    <Input name="weeklyHours" type="number" min="0" max="20" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  {t.save}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddStudent(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerClasses;