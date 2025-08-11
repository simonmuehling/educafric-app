import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, MessageSquare, GraduationCap, School, Users, Search, MapPin, Globe, Phone, User, Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useStableCallback } from '@/hooks/useStableCallback';

// Schema de base pour la validation des demandes
const baseRequestSchema = z.object({
  type: z.enum(['absence_request', 'permission', 'complaint', 'information', 'meeting', 'document', 'school_enrollment', 'other']),
  category: z.enum(['academic', 'administrative', 'health', 'disciplinary', 'transportation', 'enrollment', 'other']),
  subject: z.string().min(1, 'Le sujet est requis').max(200, 'Le sujet est trop long'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(1000, 'La description est trop longue'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  requestedDate: z.string().optional(),
  studentId: z.number().optional(),
});

// Schema avec validation conditionnelle pour l'inscription école
const requestSchema = baseRequestSchema.extend({
  // Champs spécifiques pour l'inscription à l'école
  schoolCode: z.string().optional(),
  childFirstName: z.string().optional(),
  childLastName: z.string().optional(),
  childDateOfBirth: z.string().optional(),
  relationshipType: z.enum(['parent', 'guardian', 'tutor']).optional(),
  contactPhone: z.string().optional(),
}).refine((data) => {
  if (data.type === 'school_enrollment') {
    return !!(data.schoolCode && data.childFirstName && data.childLastName && 
              data.childDateOfBirth && data.relationshipType && data.contactPhone);
  }
  return true;
}, {
  message: "Tous les champs sont requis pour une demande d'adhésion école",
  path: ["schoolCode"]
});

type RequestFormData = z.infer<typeof requestSchema>;

interface ParentRequestManagerProps {}

const ParentRequestManager: React.FC<ParentRequestManagerProps> = () => {
  const { user } = useAuth();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock children data for demo - in production this would come from API
  const children = [
    { id: 1, firstName: 'Junior', lastName: 'Kamga', className: '3ème A' },
    { id: 2, firstName: 'Marie', lastName: 'Kamga', className: '6ème B' }
  ];

  // Search schools query with debouncing
  const { data: schoolsData } = useQuery({
    queryKey: ['/api/schools/search', schoolSearchQuery],
    enabled: schoolSearchQuery.length >= 2,
    queryFn: async () => {
      const response = await apiRequest(`/api/schools/search?query=${encodeURIComponent(schoolSearchQuery)}`);
      return response;
    },
  });

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'medium',
      studentId: children[0]?.id || 1,
    },
  });

  // Récupérer les demandes du parent
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/parent-requests'],
  });

  // Mutation pour créer une nouvelle demande
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      console.log('[PARENT_REQUEST_MANAGER] Creating request:', data);
      const response = await apiRequest('/api/parent-requests', 'POST', data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent-requests'] });
      setIsNewRequestOpen(false);
      
      // Reset form and search states
      form.reset();
      setSelectedSchool(null);
      setSchoolSearchQuery('');
      setShowSchoolSearch(false);
      
      // Customized success messages based on request type
      let title = 'Demande envoyée';
      let description = 'Votre demande a été envoyée avec succès à l\'administration.';
      
      if (variables.type === 'absence_request') {
        title = 'Demande d\'absence envoyée';
        description = `L'absence de votre enfant pour le ${variables.requestedDate ? new Date(variables.requestedDate).toLocaleDateString('fr-FR') : 'jour demandé'} a été signalée. L'administration et les enseignants seront notifiés automatiquement.`;
      } else if (variables.type === 'school_enrollment') {
        const schoolName = selectedSchool?.name || 'l\'école sélectionnée';
        title = 'Demande d\'adhésion envoyée';
        description = `Votre demande d'inscription à ${schoolName} a été envoyée. L'équipe administrative vous contactera prochainement.`;
      } else if (variables.type === 'meeting') {
        title = 'Demande de rendez-vous envoyée';
        description = 'Votre demande de rendez-vous a été transmise à l\'équipe pédagogique. Vous recevrez une réponse sous 48h.';
      }
      
      toast({
        title,
        description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = useStableCallback((data: RequestFormData) => {
    // If it's a school enrollment request and we have a selected school, use its code
    if (data.type === 'school_enrollment' && selectedSchool) {
      data.schoolCode = selectedSchool.code;
    }
    createRequestMutation.mutate(data);
  });

  // Handler to select a school from the search results
  const handleSchoolSelect = (school: any) => {
    setSelectedSchool(school);
    form.setValue('schoolCode', school.code);
    setShowSchoolSearch(false);
    setSchoolSearchQuery(school.name);
    
    toast({
      title: 'École sélectionnée',
      description: `${school.name} - ${school.city}, ${school.country}`,
    });
  };

  // Reset school selection when changing request type
  const handleRequestTypeChange = (type: string) => {
    if (type !== 'school_enrollment') {
      setSelectedSchool(null);
      setSchoolSearchQuery('');
      setShowSchoolSearch(false);
      form.setValue('schoolCode', '');
    }
  };

  // Types de demandes avec leurs icônes et descriptions
  const requestTypes = {
    absence_request: { 
      label: 'Demande d\'absence', 
      icon: Calendar, 
      description: 'Demander une autorisation d\'absence pour votre enfant' 
    },
    permission: { 
      label: 'Autorisation', 
      icon: FileText, 
      description: 'Demander une autorisation spéciale' 
    },
    complaint: { 
      label: 'Réclamation', 
      icon: AlertCircle, 
      description: 'Signaler un problème ou faire une réclamation' 
    },
    information: { 
      label: 'Information', 
      icon: MessageSquare, 
      description: 'Demander des informations sur la scolarité' 
    },
    meeting: { 
      label: 'Rendez-vous', 
      icon: Calendar, 
      description: 'Demander un rendez-vous avec l\'administration' 
    },
    document: { 
      label: 'Document', 
      icon: FileText, 
      description: 'Demander un certificat ou document officiel' 
    },
    school_enrollment: { 
      label: 'Demande d\'Adhésion École', 
      icon: GraduationCap, 
      description: 'Demander l\'inscription de votre enfant à une école partenaire Educafric' 
    },
    other: { 
      label: 'Autre', 
      icon: MessageSquare, 
      description: 'Autre type de demande' 
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  const filteredRequests = (requests as any[])?.filter((request: any) => 
    selectedStatus === 'all' || request.status === selectedStatus
  ) || [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton nouvelle demande */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mes Demandes</h3>
          <p className="text-sm text-gray-600">
            Gérez vos demandes à l'administration scolaire
          </p>
        </div>
        
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Demande
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle Demande</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Sélection de l'enfant */}
                {children.length > 1 && (
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enfant concerné</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un enfant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id.toString()}>
                                {child.firstName} {child.lastName} {child.className && `(${child.className})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Type de demande */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de demande</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de demande" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(requestTypes).map(([key, type]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Catégorie */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="academic">Académique</SelectItem>
                          <SelectItem value="administrative">Administrative</SelectItem>
                          <SelectItem value="health">Santé</SelectItem>
                          <SelectItem value="disciplinary">Disciplinaire</SelectItem>
                          <SelectItem value="transportation">Transport</SelectItem>
                          <SelectItem value="enrollment">Inscription/Adhésion</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priorité */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Faible</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Élevée</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sujet */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sujet</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Résumé en quelques mots de votre demande"
                          maxLength={200}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Champs spécifiques pour les demandes d'absence */}
                {form.watch('type') === 'absence_request' && (
                  <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Calendar className="w-5 h-5" />
                      <h4 className="font-semibold">Informations pour la Demande d'Absence</h4>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="requestedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'absence demandée *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <p className="text-xs text-yellow-700">
                            Sélectionnez la date où votre enfant sera absent
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Information sur le processus */}
                    <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        📋 Après votre demande :
                      </p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• L'administration scolaire sera automatiquement notifiée</li>
                        <li>• Les enseignants de votre enfant recevront l'information</li>
                        <li>• Le système d'assiduité sera mis à jour</li>
                        <li>• Vous recevrez une confirmation par notification</li>
                        <li>• Le statut de la demande sera visible dans cet onglet</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Champs spécifiques pour la demande d'adhésion à une école */}
                {form.watch('type') === 'school_enrollment' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <GraduationCap className="w-5 h-5" />
                      <h4 className="font-semibold">Informations pour l'Adhésion École</h4>
                    </div>
                    
                    {/* Recherche et sélection d'école */}
                    <div className="space-y-3">
                      <FormLabel>École Recherchée *</FormLabel>
                      
                      {/* School Search Input */}
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            value={schoolSearchQuery}
                            onChange={(e) => {
                              setSchoolSearchQuery(e.target.value);
                              setShowSchoolSearch(e.target.value.length >= 2);
                            }}
                            placeholder="Tapez le nom d'une école Educafric..."
                            className="pl-10"
                            data-testid="input-school-search"
                          />
                        </div>
                        
                        {/* School Search Results */}
                        {showSchoolSearch && schoolsData?.schools?.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {schoolsData.schools.map((school: any) => (
                              <div
                                key={school.id}
                                className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSchoolSelect(school)}
                                data-testid={`school-option-${school.code}`}
                              >
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <School className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {school.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-600">
                                      {school.city}, {school.country}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Globe className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                      {school.type} • {school.languages.join(', ')}
                                    </p>
                                  </div>
                                  <p className="text-xs text-blue-600 font-mono mt-1">
                                    Code: {school.code}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {showSchoolSearch && schoolSearchQuery.length >= 2 && (!schoolsData?.schools || schoolsData.schools.length === 0) && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
                            <p className="text-sm text-gray-500">Aucune école trouvée pour "{schoolSearchQuery}"</p>
                            <p className="text-xs text-gray-400 mt-1">Essayez avec un autre nom ou ville</p>
                          </div>
                        )}
                      </div>

                      {/* Selected School Display */}
                      {selectedSchool && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <School className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900">
                                École sélectionnée: {selectedSchool.name}
                              </p>
                              <p className="text-xs text-green-700 mt-1">
                                {selectedSchool.city}, {selectedSchool.country} • Code: {selectedSchool.code}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                {selectedSchool.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="schoolCode"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Informations de l'enfant */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="childFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom de l'enfant *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Prénom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="childLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'enfant *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nom de famille" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="childDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance de l'enfant *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type de relation */}
                    <FormField
                      control={form.control}
                      name="relationshipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relation avec l'enfant *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre relation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="guardian">Tuteur légal</SelectItem>
                              <SelectItem value="tutor">Tuteur</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Téléphone de contact */}
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone de contact *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="+237 xxx xxx xxx"
                              type="tel"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-600">
                            Numéro pour les communications urgentes liées à l'enfant
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('type') === 'school_enrollment' 
                          ? 'Raisons de la demande d\'adhésion' 
                          : 'Description détaillée'
                        }
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder={
                            form.watch('type') === 'school_enrollment'
                              ? "Expliquez pourquoi vous souhaitez inscrire votre enfant dans cette école, vos attentes, et toute information pertinente..."
                              : "Décrivez en détail votre demande, les raisons, et toute information utile..."
                          }
                          rows={5}
                          maxLength={1000}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewRequestOpen(false)}
                    disabled={createRequestMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRequestMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createRequestMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres de statut */}
      <div className="flex space-x-2">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          Toutes
        </Button>
        <Button
          variant={selectedStatus === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('pending')}
        >
          En attente
        </Button>
        <Button
          variant={selectedStatus === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('in_progress')}
        >
          En cours
        </Button>
        <Button
          variant={selectedStatus === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('approved')}
        >
          Approuvées
        </Button>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucune demande</p>
              <p className="text-sm">
                {selectedStatus === 'all' 
                  ? "Vous n'avez encore fait aucune demande."
                  : `Aucune demande avec le statut "${getStatusLabel(selectedStatus)}".`
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredRequests.map((request: any) => {
            const RequestIcon = requestTypes[request.type as keyof typeof requestTypes]?.icon || MessageSquare;
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <RequestIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{request.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {requestTypes[request.type as keyof typeof requestTypes]?.label || request.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(request.status)}
                      >
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusLabel(request.status)}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Créée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                      {request.priority !== 'medium' && (
                        <Badge variant="outline" className={
                          request.priority === 'urgent' ? 'text-red-600 border-red-200' :
                          request.priority === 'high' ? 'text-orange-600 border-orange-200' :
                          'text-gray-600 border-gray-200'
                        }>
                          {request.priority === 'urgent' ? 'Urgent' :
                           request.priority === 'high' ? 'Priorité élevée' :
                           request.priority === 'low' ? 'Priorité faible' : request.priority}
                        </Badge>
                      )}
                    </div>
                    
                    {request.responseDate && (
                      <span>Réponse le {new Date(request.responseDate).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>

                  {/* Réponse de l'administration si disponible */}
                  {request.adminResponse && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-900 mb-1">Réponse de l'administration:</p>
                      <p className="text-sm text-gray-700">{request.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParentRequestManager;