import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Hash, TrendingUp } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface EducafricNumber {
  id: number;
  educafricNumber: string;
  status: string;
  entityId: number | null;
  notes: string;
  createdAt: string;
  schoolName?: string | null;
  schoolEmail?: string | null;
  userName?: string | null;
  userLastName?: string | null;
  userEmail?: string | null;
}

interface CounterStat {
  type: string;
  label: string;
  currentCounter: number;
  lastGenerated: string | null;
  nextNumber: string;
}

type NumberType = 'school' | 'commercial';

export default function EducafricNumberManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<NumberType>('school');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<EducafricNumber | null>(null);
  const [notes, setNotes] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editNotes, setEditNotes] = useState('');

  const text = language === 'fr' ? {
    title: 'Gestion des Numéros EDUCAFRIC',
    subtitle: 'Créez et gérez les numéros EDUCAFRIC pour les écoles et commerciaux',
    stats: 'Statistiques des Compteurs',
    schoolTab: 'Écoles',
    commercialTab: 'Commerciaux',
    schoolNumbers: 'Numéros des Écoles',
    commercialNumbers: 'Numéros des Commerciaux',
    createNumber: 'Créer un Numéro',
    edit: 'Modifier',
    delete: 'Supprimer',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    revoked: 'Révoqué',
    assigned: 'Assigné',
    available: 'Disponible',
    notes: 'Notes',
    school: 'École',
    commercial: 'Commercial',
    createdAt: 'Créé le',
    actions: 'Actions',
    createDialog: {
      titleSchool: 'Créer un Numéro École',
      titleCommercial: 'Créer un Numéro Commercial',
      descriptionSchool: 'Générer un nouveau numéro pour une école',
      descriptionCommercial: 'Générer un nouveau numéro pour un commercial',
      notes: 'Notes (optionnel)',
      notesPlaceholderSchool: 'Ajouter des notes sur cette école...',
      notesPlaceholderCommercial: 'Ajouter des notes sur ce commercial...',
      create: 'Créer',
      cancel: 'Annuler'
    },
    editDialog: {
      title: 'Modifier le Numéro EDUCAFRIC',
      status: 'Statut',
      notes: 'Notes',
      save: 'Enregistrer',
      cancel: 'Annuler'
    },
    messages: {
      created: 'Numéro EDUCAFRIC créé avec succès',
      updated: 'Numéro EDUCAFRIC mis à jour',
      deleted: 'Numéro EDUCAFRIC supprimé',
      error: 'Une erreur s\'est produite',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce numéro?'
    }
  } : {
    title: 'EDUCAFRIC Number Management',
    subtitle: 'Create and manage EDUCAFRIC numbers for schools and commercials',
    stats: 'Counter Statistics',
    schoolTab: 'Schools',
    commercialTab: 'Commercials',
    schoolNumbers: 'School Numbers',
    commercialNumbers: 'Commercial Numbers',
    createNumber: 'Create Number',
    edit: 'Edit',
    delete: 'Delete',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    revoked: 'Revoked',
    assigned: 'Assigned',
    available: 'Available',
    notes: 'Notes',
    school: 'School',
    commercial: 'Commercial',
    createdAt: 'Created',
    actions: 'Actions',
    createDialog: {
      titleSchool: 'Create School Number',
      titleCommercial: 'Create Commercial Number',
      descriptionSchool: 'Generate a new number for a school',
      descriptionCommercial: 'Generate a new number for a commercial',
      notes: 'Notes (optional)',
      notesPlaceholderSchool: 'Add notes about this school...',
      notesPlaceholderCommercial: 'Add notes about this commercial...',
      create: 'Create',
      cancel: 'Cancel'
    },
    editDialog: {
      title: 'Edit EDUCAFRIC Number',
      status: 'Status',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel'
    },
    messages: {
      created: 'EDUCAFRIC number created successfully',
      updated: 'EDUCAFRIC number updated',
      deleted: 'EDUCAFRIC number deleted',
      error: 'An error occurred',
      confirmDelete: 'Are you sure you want to delete this number?'
    }
  };

  // Fetch counter statistics
  const { data: statsResponse } = useQuery<{ stats: CounterStat[] }>({
    queryKey: ['/api/admin/educafric-numbers/stats'],
  });
  const stats = statsResponse?.stats || [];

  // Fetch school numbers
  const { data: schoolNumbersResponse, isLoading: loadingSchools } = useQuery<{ numbers: EducafricNumber[] }>({
    queryKey: ['/api/admin/educafric-numbers'],
  });
  const schoolNumbers = schoolNumbersResponse?.numbers || [];

  // Fetch commercial numbers
  const { data: commercialNumbersResponse, isLoading: loadingCommercials } = useQuery<{ numbers: EducafricNumber[] }>({
    queryKey: ['/api/admin/educafric-numbers/commercial'],
  });
  const commercialNumbers = commercialNumbersResponse?.numbers || [];

  // Create school number mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await apiRequest('POST', '/api/admin/educafric-numbers', { notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/stats'] });
      setShowCreateDialog(false);
      setNotes('');
      toast({ title: text.messages.created });
    },
    onError: () => {
      toast({ title: text.messages.error, variant: 'destructive' });
    }
  });

  // Create commercial number mutation
  const createCommercialMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await apiRequest('POST', '/api/admin/educafric-numbers/commercial', { notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/commercial'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/stats'] });
      setShowCreateDialog(false);
      setNotes('');
      toast({ title: text.messages.created });
    },
    onError: () => {
      toast({ title: text.messages.error, variant: 'destructive' });
    }
  });

  // Update number mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/educafric-numbers/${id}`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/commercial'] });
      setShowEditDialog(false);
      setSelectedNumber(null);
      toast({ title: text.messages.updated });
    },
    onError: () => {
      toast({ title: text.messages.error, variant: 'destructive' });
    }
  });

  // Delete number mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/educafric-numbers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/commercial'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/stats'] });
      toast({ title: text.messages.deleted });
    },
    onError: () => {
      toast({ title: text.messages.error, variant: 'destructive' });
    }
  });

  const handleCreate = () => {
    if (activeTab === 'school') {
      createSchoolMutation.mutate(notes);
    } else {
      createCommercialMutation.mutate(notes);
    }
  };

  const handleEdit = (number: EducafricNumber) => {
    setSelectedNumber(number);
    setEditStatus(number.status);
    setEditNotes(number.notes || '');
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (selectedNumber) {
      updateMutation.mutate({
        id: selectedNumber.id,
        status: editStatus,
        notes: editNotes
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(text.messages.confirmDelete)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      revoked: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const renderNumbersTable = (numbers: EducafricNumber[], isLoading: boolean, type: NumberType) => {
    if (isLoading) {
      return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    if (numbers.length === 0) {
      return <div className="text-center py-8 text-gray-500">No EDUCAFRIC numbers created yet</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>EDUCAFRIC Number</TableHead>
            <TableHead>{text.status}</TableHead>
            <TableHead>{type === 'school' ? text.school : text.commercial}</TableHead>
            <TableHead>{text.notes}</TableHead>
            <TableHead>{text.createdAt}</TableHead>
            <TableHead className="text-right">{text.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {numbers.map((number) => (
            <TableRow key={number.id}>
              <TableCell className="font-mono font-semibold">{number.educafricNumber}</TableCell>
              <TableCell>{getStatusBadge(number.status)}</TableCell>
              <TableCell>
                {type === 'school' ? (
                  number.schoolName ? (
                    <div>
                      <div className="font-medium">{number.schoolName}</div>
                      <div className="text-sm text-gray-500">{number.schoolEmail}</div>
                    </div>
                  ) : (
                    <Badge variant="outline">{text.available}</Badge>
                  )
                ) : (
                  number.userName ? (
                    <div>
                      <div className="font-medium">{number.userName} {number.userLastName}</div>
                      <div className="text-sm text-gray-500">{number.userEmail}</div>
                    </div>
                  ) : (
                    <Badge variant="outline">{text.available}</Badge>
                  )
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">{number.notes || '-'}</TableCell>
              <TableCell>{new Date(number.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(number)}
                    data-testid={`button-edit-${number.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!number.entityId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(number.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-delete-${number.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{text.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{text.subtitle}</p>
        </div>
      </div>

      {/* Counter Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {text.stats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div key={stat.type} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.currentCounter}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Next: <span className="font-mono font-semibold">{stat.nextNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Schools and Commercial */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NumberType)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="school" data-testid="tab-schools">{text.schoolTab}</TabsTrigger>
            <TabsTrigger value="commercial" data-testid="tab-commercials">{text.commercialTab}</TabsTrigger>
          </TabsList>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-create-educafric-number"
          >
            <Plus className="w-4 h-4 mr-2" />
            {text.createNumber}
          </Button>
        </div>

        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                {text.schoolNumbers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderNumbersTable(schoolNumbers, loadingSchools, 'school')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                {text.commercialNumbers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderNumbersTable(commercialNumbers, loadingCommercials, 'commercial')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'school' ? text.createDialog.titleSchool : text.createDialog.titleCommercial}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'school' ? text.createDialog.descriptionSchool : text.createDialog.descriptionCommercial}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={activeTab === 'school' ? text.createDialog.notesPlaceholderSchool : text.createDialog.notesPlaceholderCommercial}
              data-testid="input-create-notes"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {text.createDialog.cancel}
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={activeTab === 'school' ? createSchoolMutation.isPending : createCommercialMutation.isPending}
              data-testid="button-confirm-create"
            >
              {text.createDialog.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{text.editDialog.title}</DialogTitle>
            <DialogDescription>{selectedNumber?.educafricNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{text.editDialog.status}</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                data-testid="select-edit-status"
              >
                <option value="active">{text.active}</option>
                <option value="inactive">{text.inactive}</option>
                <option value="revoked">{text.revoked}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{text.editDialog.notes}</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                data-testid="input-edit-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {text.editDialog.cancel}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} data-testid="button-confirm-update">
              {text.editDialog.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
