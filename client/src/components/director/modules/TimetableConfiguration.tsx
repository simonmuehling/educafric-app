import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Users, School, Plus, Upload, Edit3, Trash2, Save, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { TimetableCreation } from '@/components/timetable/TimetableCreation';

interface TimetableEntry {
  id: number;
  className: string;
  day: string;
  timeSlot: string;
  subject: string;
  teacher: string;
  room: string;
}

const TimetableConfiguration: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    className: '',
    day: '',
    timeSlot: '',
    subject: '',
    teacher: '',
    room: ''
  });

  const days = [
    { value: 'Lundi', label: language === 'fr' ? 'Lundi' : 'Monday' },
    { value: 'Mardi', label: language === 'fr' ? 'Mardi' : 'Tuesday' },
    { value: 'Mercredi', label: language === 'fr' ? 'Mercredi' : 'Wednesday' },
    { value: 'Jeudi', label: language === 'fr' ? 'Jeudi' : 'Thursday' },
    { value: 'Vendredi', label: language === 'fr' ? 'Vendredi' : 'Friday' },
    { value: 'Samedi', label: language === 'fr' ? 'Samedi' : 'Saturday' }
  ];

  const timeSlots = [
    '07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:20 - 11:10',
    '11:10 - 12:00', '12:00 - 12:50', '14:00 - 14:50', '14:50 - 15:40', '15:40 - 16:30'
  ];

  // ✅ OPTIMIZED: Use TanStack Query with preloaded cache for instant loading
  const { data: timetables = [], isLoading: loading } = useQuery<TimetableEntry[]>({
    queryKey: ['/api/timetables'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/timetables', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch timetables');
      return response.json();
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // ✅ OPTIMIZED: Create timetable mutation with cache invalidation
  const createTimetableMutation = useMutation({
    mutationFn: async (timetableData: any) => {
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timetableData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create timetable entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetables'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Entrée d\'emploi du temps créée avec succès' : 'Timetable entry created successfully'
      });
      setShowCreateForm(false);
      setFormData({ className: '', day: '', timeSlot: '', subject: '', teacher: '', room: '' });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la création' : 'Failed to create entry'),
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = useStableCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.className || !formData.day || !formData.timeSlot || !formData.subject || !formData.teacher || !formData.room) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Tous les champs sont requis' : 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    // ✅ OPTIMIZED: Use TanStack Query mutations for instant cache updates
    createTimetableMutation.mutate(formData);
  });

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      className: entry.className,
      day: entry.day,
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      teacher: entry.teacher,
      room: entry.room
    });
    setShowCreateForm(true);
  };

  // ✅ OPTIMIZED: Delete timetable mutation with cache invalidation
  const deleteTimetableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/timetables/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete timetable entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetables'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Créneaux supprimé' : 'Slot deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting slot'),
        variant: 'destructive'
      });
    }
  });

  const handleDelete = (id: number) => {
    deleteTimetableMutation.mutate(id);
  };

  const resetForm = () => {
    setFormData({ className: '', day: '', timeSlot: '', subject: '', teacher: '', room: '' });
    setEditingEntry(null);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'fr' ? 'Configuration Emploi du Temps' : 'Timetable Configuration'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {language === 'fr' ? 
                'Gérez les emplois du temps de votre établissement' : 
                'Manage your institution timetables'}
            </p>
          </CardHeader>
        </Card>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </h3>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Emploi du Temps' : 'Timetable Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'add-timeslot',
                label: language === 'fr' ? 'Ajouter Créneaux' : 'Add Time Slot',
                icon: <Plus className="w-5 h-5" />,
                onClick: () => setShowCreateForm(true),
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'view-all',
                label: language === 'fr' ? 'Voir Tout' : 'View All',
                icon: <Calendar className="w-5 h-5" />,
                onClick: () => setShowCreateForm(false),
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'export-timetable',
                label: language === 'fr' ? 'Exporter PDF' : 'Export PDF',
                icon: <FileText className="w-5 h-5" />,
                onClick: () => console.log('Export timetable PDF'),
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                id: 'bulk-import',
                label: language === 'fr' ? 'Import CSV' : 'Bulk Import',
                icon: <Upload className="w-5 h-5" />,
                onClick: () => console.log('Bulk import timetables'),
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'refresh-data',
                label: language === 'fr' ? 'Actualiser' : 'Refresh',
                icon: <RefreshCw className="w-5 h-5" />,
                onClick: () => queryClient.invalidateQueries({ queryKey: ['/api/timetables'] }),
                color: 'bg-teal-600 hover:bg-teal-700'
              }
            ]}
          />
        </Card>

        {/* Advanced Timetable Creation Form */}
        {showCreateForm && (
          <TimetableCreation 
            onSlotCreated={(slot) => {
              console.log('[TIMETABLE_CONFIG] Nouveau créneau créé:', slot);
              // Cache will automatically update via invalidation
              setShowCreateForm(false); // Close the form
            }}
            onBulkOperation={(operation, slots) => {
              console.log('[TIMETABLE_CONFIG] Opération en lot:', operation, slots);
            }}
          />
        )}

        {/* Timetable List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'fr' ? 'Emplois du Temps Existants' : 'Existing Timetables'}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{language === 'fr' ? 'Classe' : 'Class'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Jour' : 'Day'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Horaire' : 'Time'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Matière' : 'Subject'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Professeur' : 'Teacher'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Salle' : 'Room'}</th>
                      <th className="text-left p-2">{language === 'fr' ? 'Actions' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(timetables) ? timetables : []).map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{entry.className}</td>
                        <td className="p-2">{entry.day}</td>
                        <td className="p-2">{entry.timeSlot}</td>
                        <td className="p-2">{entry.subject}</td>
                        <td className="p-2">{entry.teacher}</td>
                        <td className="p-2">{entry.room}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(Array.isArray(timetables) ? timetables.length : 0) === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    {language === 'fr' ? 'Aucun emploi du temps créé' : 'No timetables created yet'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableConfiguration;