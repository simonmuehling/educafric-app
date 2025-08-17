import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, Search, Calendar, UserCheck, Bell, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TeacherAbsences = () => {
  const { language } = useLanguage();
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Absences Professeurs',
      subtitle: 'Gestion des absences enseignants et remplacements',
      totalAbsences: 'Absences Totales',
      pendingReplacements: 'Remplacements En Attente',
      resolvedAbsences: 'Absences Résolues',
      activeReplacements: 'Remplacements Actifs',
      teacher: 'Enseignant',
      subject: 'Matière',
      class: 'Classe',
      date: 'Date',
      reason: 'Motif',
      status: 'Statut',
      findReplacement: 'Trouver Remplaçant',
      selectReplacement: 'Sélectionner Remplaçant',
      notifyParents: 'Notifier Parents/Élèves',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      absent: 'Absent',
      sick: 'Malade',
      emergency: 'Urgence',
      personal: 'Personnel',
      pending: 'En attente',
      resolved: 'Résolu',
      replacement: 'Remplaçant',
      originalTeacher: 'Enseignant titulaire',
      replacementFound: 'Remplaçant trouvé!',
      notificationsSent: 'Notifications envoyées!'
    },
    en: {
      title: 'Teacher Absences',
      subtitle: 'Teacher absence management and replacements',
      totalAbsences: 'Total Absences',
      pendingReplacements: 'Pending Replacements',
      resolvedAbsences: 'Resolved Absences',
      activeReplacements: 'Active Replacements',
      teacher: 'Teacher',
      subject: 'Subject',
      class: 'Class',
      date: 'Date',
      reason: 'Reason',
      status: 'Status',
      findReplacement: 'Find Replacement',
      selectReplacement: 'Select Replacement',
      notifyParents: 'Notify Parents/Students',
      confirm: 'Confirm',
      cancel: 'Cancel',
      absent: 'Absent',
      sick: 'Sick',
      emergency: 'Emergency',
      personal: 'Personal',
      pending: 'Pending',
      resolved: 'Resolved',
      replacement: 'Replacement',
      originalTeacher: 'Original Teacher',
      replacementFound: 'Replacement found!',
      notificationsSent: 'Notifications sent!'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch teacher absences
  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['/api/teacher-absences'],
    queryFn: async () => {
      const response = await fetch('/api/teacher-absences');
      if (!response.ok) throw new Error('Failed to fetch teacher absences');
      return response.json();
    }
  });

  // Fetch available replacement teachers from school
  const { data: replacementTeachers = [] } = useQuery({
    queryKey: ['/api/teachers/school/available'],
    queryFn: async () => {
      const response = await fetch('/api/teachers/school/available');
      if (!response.ok) throw new Error('Failed to fetch replacement teachers');
      return response.json();
    }
  });

  // Assign replacement teacher mutation
  const assignReplacementMutation = useMutation({
    mutationFn: async ({ absenceId, replacementTeacherId }: any) => {
      const response = await fetch('/api/teacher-absences/assign-replacement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          absenceId,
          replacementTeacherId
        }),
      });
      if (!response.ok) throw new Error('Failed to assign replacement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher-absences'] });
      alert(t.replacementFound);
      setShowReplacementModal(false);
      setSelectedAbsence(null);
    }
  });

  // Send notifications mutation
  const sendNotificationsMutation = useMutation({
    mutationFn: async (absenceId: string) => {
      const response = await fetch('/api/notifications/teacher-absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ absenceId }),
      });
      if (!response.ok) throw new Error('Failed to send notifications');
      return response.json();
    },
    onSuccess: () => {
      alert(t.notificationsSent);
    }
  });

  // Calculate statistics
  const totalAbsences = (Array.isArray(absences) ? absences.length : 0);
  const pendingReplacements = (Array.isArray(absences) ? absences : []).filter((a: any) => a.status === 'pending').length;
  const resolvedAbsences = (Array.isArray(absences) ? absences : []).filter((a: any) => a.status === 'resolved').length;
  const activeReplacements = (Array.isArray(absences) ? absences : []).filter((a: any) => a.replacementTeacherId).length;

  const stats = [
    {
      title: t.totalAbsences,
      value: totalAbsences.toString(),
      icon: <AlertTriangle className="w-5 h-5" />,
      trend: { value: 2, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t.pendingReplacements,
      value: pendingReplacements.toString(),
      icon: <User className="w-5 h-5" />,
      trend: { value: 1, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t.resolvedAbsences,
      value: resolvedAbsences.toString(),
      icon: <UserCheck className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.activeReplacements,
      value: activeReplacements.toString(),
      icon: <Search className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'blue' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'emergency':
        return 'bg-orange-100 text-orange-800';
      case 'personal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFindReplacement = (absence: any) => {
    setSelectedAbsence(absence);
    setShowReplacementModal(true);
  };

  const handleAssignReplacement = (replacementTeacherId: string) => {
    if (selectedAbsence) {
      assignReplacementMutation.mutate({
        absenceId: selectedAbsence.id,
        replacementTeacherId
      });
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

      {/* Absences List */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Absences Enseignants</h3>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement des absences...
            </div>
          ) : (Array.isArray(absences) ? absences.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune absence signalée
            </div>
          ) : (
            (Array.isArray(absences) ? absences : []).map((absence: any) => (
              <div key={absence.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {absence.teacherName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {absence.subjectName} - {absence.className}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(absence.status)}>
                      {t[absence.status as keyof typeof t] || absence.status}
                    </Badge>
                    <Badge className={getReasonColor(absence.reason)}>
                      {t[absence.reason as keyof typeof t] || absence.reason}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">{t.date}:</span> {absence.absenceDate}
                  </div>
                  <div>
                    <span className="font-medium">Heures:</span> {absence.startTime} - {absence.endTime}
                  </div>
                  <div>
                    <span className="font-medium">{t.class}:</span> {absence.className}
                  </div>
                  <div>
                    <span className="font-medium">{t.subject}:</span> {absence.subjectName}
                  </div>
                </div>

                {absence.replacementTeacherName && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {t.replacement}: {absence.replacementTeacherName}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!absence.replacementTeacherId && absence.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => handleFindReplacement(absence)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {t.findReplacement}
                    </Button>
                  )}
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => sendNotificationsMutation.mutate(absence.id)}
                    disabled={sendNotificationsMutation.isPending}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {t.notifyParents}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>

      {/* Replacement Teacher Selection Modal */}
      {showReplacementModal && selectedAbsence && (
        <ModernCard className="p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.selectReplacement}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowReplacementModal(false);
                setSelectedAbsence(null);
              }}
            >
              {t.cancel}
            </Button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Absence à couvrir:</h4>
            <p className="text-sm text-gray-600">
              <strong>{t.originalTeacher}:</strong> {selectedAbsence.teacherName}<br/>
              <strong>{t.subject}:</strong> {selectedAbsence.subjectName}<br/>
              <strong>{t.class}:</strong> {selectedAbsence.className}<br/>
              <strong>{t.date}:</strong> {selectedAbsence.absenceDate} ({selectedAbsence.startTime} - {selectedAbsence.endTime})
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Enseignants disponibles de l'école:</h4>
            {(Array.isArray(replacementTeachers) ? replacementTeachers.length : 0) === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Aucun enseignant disponible
              </div>
            ) : (
              (Array.isArray(replacementTeachers) ? replacementTeachers : []).map((teacher: any) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {teacher.firstName || ''} {teacher.lastName || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {teacher.subjects?.join(', ') || 'Polyvalent'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleAssignReplacement(teacher.id)}
                    disabled={assignReplacementMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t.confirm}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default TeacherAbsences;