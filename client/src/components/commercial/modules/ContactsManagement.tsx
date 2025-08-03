import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Search, Phone, Mail, Calendar, Star, Plus, Filter, MessageSquare, Edit2, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  school: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  status: z.enum(['lead', 'prospect', 'client', 'inactive']).default('prospect'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().optional(),
  nextAction: z.enum(['call', 'email', 'meeting', 'followUp']).default('call'),
  rating: z.number().min(1).max(5).default(3)
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactsManagement = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Gestion des Contacts',
      subtitle: 'Base de données clients et génération de leads',
      searchPlaceholder: 'Rechercher un contact...',
      addContact: 'Ajouter Contact',
      all: 'Tous',
      leads: 'Leads',
      clients: 'Clients',
      prospects: 'Prospects',
      inactive: 'Inactifs',
      name: 'Nom',
      position: 'Poste',
      school: 'École',
      lastContact: 'Dernier Contact',
      nextAction: 'Prochaine Action',
      priority: 'Priorité',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      call: 'Appeler',
      email: 'Email',
      meeting: 'RDV',
      followUp: 'Relance'
    },
    en: {
      title: 'Contact Management',
      subtitle: 'Client database and lead generation',
      searchPlaceholder: 'Search contacts...',
      addContact: 'Add Contact',
      all: 'All',
      leads: 'Leads',
      clients: 'Clients',
      prospects: 'Prospects',
      inactive: 'Inactive',
      name: 'Name',
      position: 'Position',
      school: 'School',
      lastContact: 'Last Contact',
      nextAction: 'Next Action',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      call: 'Call',
      email: 'Email',
      meeting: 'Meeting',
      followUp: 'Follow Up'
    }
  };

  const t = text[language as keyof typeof text];

  // API queries and mutations
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/commercial/contacts'],
    queryFn: () => fetch('/api/commercial/contacts', {
      credentials: 'include'
    }).then(res => res.json())
  });

  const createContactMutation = useMutation({
    mutationFn: (contactData: ContactFormData) => 
      fetch('/api/commercial/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contactData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/contacts'] });
      setIsFormOpen(false);
      setEditingContact(null);
      toast({
        title: language === 'fr' ? 'Contact ajouté' : 'Contact added',
        description: language === 'fr' ? 'Le contact a été ajouté avec succès.' : 'Contact has been added successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'ajout du contact.' : 'Error adding contact.',
        variant: 'destructive'
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, ...contactData }: ContactFormData & { id: number }) => 
      fetch(`/api/commercial/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contactData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/contacts'] });
      setIsFormOpen(false);
      setEditingContact(null);
      toast({
        title: language === 'fr' ? 'Contact modifié' : 'Contact updated',
        description: language === 'fr' ? 'Le contact a été modifié avec succès.' : 'Contact has been updated successfully.'
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/commercial/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/contacts'] });
      toast({
        title: language === 'fr' ? 'Contact supprimé' : 'Contact deleted',
        description: language === 'fr' ? 'Le contact a été supprimé avec succès.' : 'Contact has been deleted successfully.'
      });
    }
  });

  // Form handling
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      position: '',
      school: '',
      phone: '',
      email: '',
      status: 'prospect',
      priority: 'medium',
      notes: '',
      nextAction: 'call',
      rating: 3
    }
  });

  const onSubmit = (data: ContactFormData) => {
    if (editingContact) {
      updateContactMutation.mutate({ ...data, id: editingContact.id });
    } else {
      createContactMutation.mutate(data);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    form.reset({
      name: contact.name || '',
      position: contact.position || '',
      school: contact.school || '',
      phone: contact.phone || '',
      email: contact.email || '',
      status: contact.status || 'prospect',
      priority: contact.priority || 'medium',
      notes: contact.notes || '',
      nextAction: contact.nextAction || 'call',
      rating: contact.rating || 3
    });
    setIsFormOpen(true);
  };

  const handleDelete = (contactId: number) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce contact ?' : 'Are you sure you want to delete this contact?')) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const handleAddNew = () => {
    setEditingContact(null);
    form.reset();
    setIsFormOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'call': return <Phone className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
      case 'meeting': return <Calendar className="w-3 h-3" />;
      case 'followUp': return <MessageSquare className="w-3 h-3" />;
      default: return <Phone className="w-3 h-3" />;
    }
  };

  const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(contact => {
    if (!contact) return false;
    const matchesSearch = contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || contact.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: t.all, count: (Array.isArray(contacts) ? contacts.length : 0) },
    { key: 'leads', label: t.leads, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'lead').length },
    { key: 'prospects', label: t.prospects, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'prospect').length },
    { key: 'clients', label: t.clients, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'client').length },
    { key: 'inactive', label: t.inactive, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'inactive').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(filters) ? filters : []).map((filter) => (
          <Button
            key={filter.key}
            variant={selectedFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2" 
              onClick={handleAddNew}
              data-testid="button-add-contact"
            >
              <Plus className="w-4 h-4" />
              {t.addContact}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingContact 
                  ? (language === 'fr' ? 'Modifier le contact' : 'Edit Contact')
                  : (language === 'fr' ? 'Ajouter un contact' : 'Add Contact')
                }
              </DialogTitle>
              <DialogDescription>
                {language === 'fr' 
                  ? 'Remplissez les informations du contact ci-dessous.'
                  : 'Fill in the contact information below.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.name} *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.position}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-contact-position" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.school}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-school" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contact-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.priority}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contact-priority">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">{t.high}</SelectItem>
                            <SelectItem value="medium">{t.medium}</SelectItem>
                            <SelectItem value="low">{t.low}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.nextAction}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contact-action">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="call">{t.call}</SelectItem>
                            <SelectItem value="email">{t.email}</SelectItem>
                            <SelectItem value="meeting">{t.meeting}</SelectItem>
                            <SelectItem value="followUp">{t.followUp}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-contact-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsFormOpen(false)}
                    data-testid="button-cancel-contact"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createContactMutation.isPending || updateContactMutation.isPending}
                    data-testid="button-save-contact"
                  >
                    {createContactMutation.isPending || updateContactMutation.isPending
                      ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                      : (editingContact 
                          ? (language === 'fr' ? 'Modifier' : 'Update')
                          : (language === 'fr' ? 'Ajouter' : 'Add')
                        )
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {(Array.isArray(filteredContacts) ? filteredContacts : []).map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{contact.name || ''}</h3>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < contact.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{contact.position} - {contact.school}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email || ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {contact.lastContact}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getPriorityColor(contact.priority)}`}>
                      {contact.priority === 'high' ? t.high : contact.priority === 'medium' ? t.medium : t.low}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      {getActionIcon(contact.nextAction)}
                      <span className="capitalize">{contact.nextAction}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleEdit(contact)}
                      data-testid={`button-edit-contact-${contact.id}`}
                    >
                      <Edit2 className="w-3 h-3" />
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(contact.id)}
                      data-testid={`button-delete-contact-${contact.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                      {language === 'fr' ? 'Supprimer' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
              {contact.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Notes:</strong> {contact.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'client').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Clients Actifs' : 'Active Clients'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'prospect').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Prospects Chauds' : 'Hot Prospects'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.priority === 'high').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Priorité Haute' : 'High Priority'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Taux Conversion' : 'Conversion Rate'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactsManagement;