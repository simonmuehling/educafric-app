import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Phone, Mail, Calendar, TrendingUp,
  Plus, Search, Filter, Download,
  Eye, Edit, MessageCircle, Clock,
  Star, AlertTriangle, CheckCircle
} from 'lucide-react';

interface Lead {
  id: number;
  schoolName: string;
  contactPerson: string;
  position: string;
  phone: string;
  email: string;
  location: string;
  studentCount: number;
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'referral' | 'cold_call' | 'event' | 'social_media';
  estimatedValue: number;
  nextContactDate: string;
  notes: string;
  createdAt: string;
  lastContact: string;
}

const FunctionalCommercialLeads: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [leadForm, setLeadForm] = useState({
    schoolName: '',
    contactPerson: '',
    position: '',
    phone: '',
    email: '',
    location: '',
    studentCount: '',
    status: 'new',
    priority: 'medium',
    source: 'website',
    estimatedValue: '',
    nextContactDate: '',
    notes: ''
  });

  // Fetch leads data
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/commercial/leads'],
    enabled: !!user
  });

  // Add lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await fetch('/api/commercial/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/leads'] });
      setIsAddLeadOpen(false);
      resetForm();
      toast({
        title: 'Prospect ajouté',
        description: 'Le prospect a été ajouté avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le prospect.',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setLeadForm({
      schoolName: '',
      contactPerson: '',
      position: '',
      phone: '',
      email: '',
      location: '',
      studentCount: '',
      status: 'new',
      priority: 'medium',
      source: 'website',
      estimatedValue: '',
      nextContactDate: '',
      notes: ''
    });
  };

  const handleAddLead = () => {
    if (leadForm.schoolName && leadForm.contactPerson && leadForm.email) {
      addLeadMutation.mutate({
        ...leadForm,
        studentCount: parseInt(leadForm.studentCount) || 0,
        estimatedValue: parseFloat(leadForm.estimatedValue) || 0
      });
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Prospects',
      subtitle: 'Suivez et gérez votre pipeline commercial',
      loading: 'Chargement des prospects...',
      noData: 'Aucun prospect enregistré',
      stats: {
        totalLeads: 'Prospects Totaux',
        hotLeads: 'Prospects Chauds',
        estimatedValue: 'Valeur Estimée',
        conversionRate: 'Taux de Conversion'
      },
      actions: {
        addLead: 'Nouveau Prospect',
        viewDetails: 'Voir Détails',
        editLead: 'Modifier',
        contact: 'Contacter',
        convertToSchool: 'Convertir'
      },
      filters: {
        all: 'Tous',
        new: 'Nouveaux',
        contacted: 'Contactés',
        interested: 'Intéressés',
        negotiating: 'Négociation',
        won: 'Gagnés',
        lost: 'Perdus'
      },
      priority: {
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevé'
      },
      source: {
        website: 'Site Web',
        referral: 'Recommandation',
        cold_call: 'Appel à Froid',
        event: 'Événement',
        social_media: 'Réseaux Sociaux'
      },
      status: {
        new: 'Nouveau',
        contacted: 'Contacté',
        interested: 'Intéressé',
        negotiating: 'Négociation',
        won: 'Gagné',
        lost: 'Perdu'
      }
    },
    en: {
      title: 'Lead Management',
      subtitle: 'Track and manage your sales pipeline',
      loading: 'Loading leads...',
      noData: 'No leads registered',
      stats: {
        totalLeads: 'Total Leads',
        hotLeads: 'Hot Leads',
        estimatedValue: 'Estimated Value',
        conversionRate: 'Conversion Rate'
      },
      actions: {
        addLead: 'New Lead',
        viewDetails: 'View Details',
        editLead: 'Edit',
        contact: 'Contact',
        convertToSchool: 'Convert'
      },
      filters: {
        all: 'All',
        new: 'New',
        contacted: 'Contacted',
        interested: 'Interested',
        negotiating: 'Negotiating',
        won: 'Won',
        lost: 'Lost'
      },
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },
      source: {
        website: 'Website',
        referral: 'Referral',
        cold_call: 'Cold Call',
        event: 'Event',
        social_media: 'Social Media'
      },
      status: {
        new: 'New',
        contacted: 'Contacted',
        interested: 'Interested',
        negotiating: 'Negotiating',
        won: 'Won',
        lost: 'Lost'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalLeads = leads.length;
  const hotLeads = (Array.isArray(leads) ? leads : []).filter(l => l.priority === 'high' && ['interested', 'negotiating'].includes(l.status)).length;
  const estimatedValue = (Array.isArray(leads) ? leads : []).reduce((sum, l) => sum + l.estimatedValue, 0);
  const wonLeads = (Array.isArray(leads) ? leads : []).filter(l => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-purple-100 text-purple-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = (Array.isArray(leads) ? leads : []).filter(lead => {
    if (!lead) return false;
    const matchesSearch = (lead.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsAddLeadOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.addLead}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalLeads}</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.hotLeads}</p>
                <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.estimatedValue}</p>
                <p className="text-2xl font-bold text-purple-600">{estimatedValue.toLocaleString()} CFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.conversionRate}</p>
                <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un prospect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md px-3 py-2 w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="new">{t?.filters?.new}</option>
                <option value="contacted">{t?.filters?.contacted}</option>
                <option value="interested">{t?.filters?.interested}</option>
                <option value="negotiating">{t?.filters?.negotiating}</option>
                <option value="won">{t?.filters?.won}</option>
                <option value="lost">{t?.filters?.lost}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">{t?.priority?.high}</option>
                <option value="medium">{t?.priority?.medium}</option>
                <option value="low">{t?.priority?.low}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pipeline Commercial ({filteredLeads.length})</h3>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par ajouter des prospects à votre pipeline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredLeads) ? filteredLeads : []).map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{lead.schoolName}</h4>
                        <Badge className={getStatusColor(lead.status)}>
                          {t?.status?.[lead.status as keyof typeof t.status]}
                        </Badge>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {t?.priority?.[lead.priority as keyof typeof t.priority]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Contact:</strong> {lead.contactPerson} ({lead.position})
                        </div>
                        <div>
                          <strong>Localisation:</strong> {lead.location}
                        </div>
                        <div>
                          <strong>Valeur estimée:</strong> {lead.estimatedValue.toLocaleString()} CFA
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email || ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {lead.studentCount} élèves
                          </span>
                        </div>
                      </div>
                      
                      {lead.nextContactDate && (
                        <div className="mt-2 text-sm text-orange-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Prochain contact: {new Date(lead.nextContactDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      
                      {lead.notes && (
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Notes:</strong> {lead.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        {t?.actions?.viewDetails}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        {t?.actions?.contact}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        {t?.actions?.editLead}
                      </Button>
                      {lead.status === 'won' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t?.actions?.convertToSchool}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nouveau Prospect</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom de l'École *</label>
                <input
                  type="text"
                  value={leadForm.schoolName}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Ex: École Primaire Excellence"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Personne de Contact *</label>
                <input
                  type="text"
                  value={leadForm.contactPerson}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nom du contact"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Poste</label>
                <input
                  type="text"
                  value={leadForm.position}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Ex: Directeur"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Localisation</label>
                <input
                  type="text"
                  value={leadForm.location}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Douala, Cameroun"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+237 XXX XXX XXX"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={leadForm.email || ''}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@ecole.cm"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Nombre d'Élèves</label>
                <input
                  type="number"
                  value={leadForm.studentCount}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, studentCount: e.target.value }))}
                  placeholder="Ex: 250"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Valeur Estimée (CFA)</label>
                <input
                  type="number"
                  value={leadForm.estimatedValue}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="Ex: 500000"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={leadForm.status}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="new">{t?.status?.new}</option>
                  <option value="contacted">{t?.status?.contacted}</option>
                  <option value="interested">{t?.status?.interested}</option>
                  <option value="negotiating">{t?.status?.negotiating}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <select
                  value={leadForm.priority}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="low">{t?.priority?.low}</option>
                  <option value="medium">{t?.priority?.medium}</option>
                  <option value="high">{t?.priority?.high}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Source</label>
                <select
                  value={leadForm.source}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="website">{t?.source?.website}</option>
                  <option value="referral">{t?.source?.referral}</option>
                  <option value="cold_call">{t?.source?.cold_call}</option>
                  <option value="event">{t?.source?.event}</option>
                  <option value="social_media">{t?.source?.social_media}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Prochain Contact</label>
                <input
                  type="date"
                  value={leadForm.nextContactDate}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, nextContactDate: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={leadForm.notes}
                onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes sur le prospect..."
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddLead}
                disabled={addLeadMutation.isPending || !leadForm.schoolName || !leadForm.contactPerson || !leadForm.email}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {addLeadMutation.isPending ? 'Ajout...' : 'Ajouter le Prospect'}
              </Button>
              <Button 
                onClick={() => setIsAddLeadOpen(false)}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalCommercialLeads;