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
import { Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

// Schema pour la validation des demandes
const requestSchema = z.object({
  type: z.enum(['absence_request', 'permission', 'complaint', 'information', 'meeting', 'document', 'other']),
  category: z.enum(['academic', 'administrative', 'health', 'disciplinary', 'transportation', 'other']),
  subject: z.string().min(1, 'Le sujet est requis').max(200, 'Le sujet est trop long'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(1000, 'La description est trop longue'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  requestedDate: z.string().optional(),
  studentId: z.number(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface ParentRequestManagerProps {}

const ParentRequestManager: React.FC<ParentRequestManagerProps> = () => {
  const { user } = useAuth();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock children data for demo - in production this would come from API
  const children = [
    { id: 1, firstName: 'Junior', lastName: 'Kamga', className: '3ème A' },
    { id: 2, firstName: 'Marie', lastName: 'Kamga', className: '6ème B' }
  ];

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
    queryFn: async () => {
      // For demo purposes, return mock data
      return [
        {
          id: 1,
          type: 'absence_request',
          subject: 'Demande d\'absence pour rendez-vous médical',
          description: 'Mon enfant a un rendez-vous médical important',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          studentId: 1
        },
        {
          id: 2,
          type: 'meeting',
          subject: 'Rendez-vous avec le professeur',
          description: 'Je souhaiterais discuter des résultats de mon enfant',
          status: 'approved',
          priority: 'high',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          responseDate: new Date().toISOString(),
          adminResponse: 'Rendez-vous confirmé pour vendredi 14h00',
          studentId: 1
        }
      ];
    },
  });

  // Mutation pour créer une nouvelle demande
  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      // Mock API call - in production this would be a real API call
      const response = await fetch('/api/parent-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent-requests'] });
      setIsNewRequestOpen(false);
      form.reset();
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été envoyée avec succès à l\'administration.',
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

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
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

  const filteredRequests = requests?.filter((request: any) => 
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

                {/* Date demandée (pour les absences) */}
                {form.watch('type') === 'absence_request' && (
                  <FormField
                    control={form.control}
                    name="requestedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'absence demandée</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description détaillée</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Décrivez en détail votre demande, les raisons, et toute information utile..."
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