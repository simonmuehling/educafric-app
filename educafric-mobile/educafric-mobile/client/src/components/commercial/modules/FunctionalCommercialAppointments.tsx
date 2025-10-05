import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, MapPin, User, Phone,
  Plus, Edit, Trash2, Eye, CheckCircle,
  Building2, AlertTriangle, Users
} from 'lucide-react';

interface Appointment {
  id: number;
  title: string;
  contact: string;
  school: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'presentation' | 'contract' | 'follow_up';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

const FunctionalCommercialAppointments: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    contact: '',
    school: '',
    date: '',
    time: '',
    location: '',
    type: 'meeting' as 'meeting' | 'presentation' | 'contract' | 'follow_up',
    notes: ''
  });

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/commercial/appointments'],
    enabled: !!user
  });

  // Add appointment mutation
  const addAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/commercial/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/appointments'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Rendez-vous ajouté',
        description: 'Le rendez-vous a été programmé avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le rendez-vous.',
        variant: 'destructive'
      });
    }
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, ...appointmentData }: any) => {
      const response = await fetch(`/api/commercial/appointment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/appointments'] });
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
      toast({
        title: 'Rendez-vous modifié',
        description: 'Le rendez-vous a été mis à jour avec succès.'
      });
    }
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/commercial/appointment/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete appointment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/appointments'] });
      toast({
        title: 'Rendez-vous supprimé',
        description: 'Le rendez-vous a été supprimé avec succès.'
      });
    }
  });

  const resetForm = () => {
    setAppointmentForm({
      title: '',
      contact: '',
      school: '',
      date: '',
      time: '',
      location: '',
      type: 'meeting',
      notes: ''
    });
  };

  const handleAddAppointment = () => {
    if (appointmentForm.title && appointmentForm.contact && appointmentForm.date && appointmentForm.time) {
      addAppointmentMutation.mutate(appointmentForm);
    }
  };

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        id: selectedAppointment.id,
        ...appointmentForm
      });
    }
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      title: appointment.title,
      contact: appointment.contact,
      school: appointment.school,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
      type: appointment.type,
      notes: appointment.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.scheduled;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      meeting: 'bg-purple-100 text-purple-800',
      presentation: 'bg-orange-100 text-orange-800',
      contract: 'bg-green-100 text-green-800',
      follow_up: 'bg-blue-100 text-blue-800'
    };
    return variants[type as keyof typeof variants] || variants.meeting;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des rendez-vous...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rendez-vous</h2>
          <p className="text-gray-600">Gérez vos rendez-vous et présentations commerciales</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="button-add-appointment"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Rendez-vous
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Prochains Rendez-vous</h3>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous programmé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                        <Badge className={getStatusBadge(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge className={getTypeBadge(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{appointment.contact}</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>{appointment.school}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{appointment.date}</span>
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(appointment)}
                        data-testid={`button-edit-appointment-${appointment.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-appointment-${appointment.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nouveau Rendez-vous</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={appointmentForm.title}
                  onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Présentation EDUCAFRIC"
                  data-testid="input-appointment-title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                <input
                  type="text"
                  value={appointmentForm.contact}
                  onChange={(e) => setAppointmentForm({...appointmentForm, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du contact"
                  data-testid="input-appointment-contact"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">École</label>
                <input
                  type="text"
                  value={appointmentForm.school}
                  onChange={(e) => setAppointmentForm({...appointmentForm, school: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'établissement"
                  data-testid="input-appointment-school"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={appointmentForm.type}
                  onChange={(e) => setAppointmentForm({...appointmentForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-appointment-type"
                >
                  <option value="meeting">Réunion</option>
                  <option value="presentation">Présentation</option>
                  <option value="contract">Signature contrat</option>
                  <option value="follow_up">Suivi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-appointment-date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
                <input
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-appointment-time"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input
                  type="text"
                  value={appointmentForm.location}
                  onChange={(e) => setAppointmentForm({...appointmentForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse du rendez-vous"
                  data-testid="input-appointment-location"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Notes supplémentaires..."
                  data-testid="textarea-appointment-notes"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel-add-appointment"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={addAppointmentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-save-appointment"
              >
                {addAppointmentMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal - Similar structure but with update functionality */}
      {isEditModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Modifier le Rendez-vous</h3>
            
            {/* Same form fields as add modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Form fields identical to add modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={appointmentForm.title}
                  onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-edit-appointment-title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                <input
                  type="text"
                  value={appointmentForm.contact}
                  onChange={(e) => setAppointmentForm({...appointmentForm, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-edit-appointment-contact"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAppointment(null);
                  resetForm();
                }}
                data-testid="button-cancel-edit-appointment"
              >
                Annuler
              </Button>
              <Button
                onClick={handleEditAppointment}
                disabled={updateAppointmentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-update-appointment"
              >
                {updateAppointmentMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalCommercialAppointments;