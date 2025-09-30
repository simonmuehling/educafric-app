import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Hash, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface EducafricNumber {
  id: number;
  educafricNumber: string;
  status: string;
  entityId: number | null;
  notes: string;
  createdAt: string;
  schoolName: string | null;
  schoolEmail: string | null;
}

interface CounterStat {
  type: string;
  label: string;
  currentCounter: number;
  lastGenerated: string | null;
  nextNumber: string;
}

export default function EducafricNumberManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<EducafricNumber | null>(null);
  const [notes, setNotes] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editNotes, setEditNotes] = useState('');

  const text = language === 'fr' ? {
    title: 'Gestion des Numéros EDUCAFRIC',
    subtitle: 'Créez et gérez les numéros EDUCAFRIC pour les écoles',
    stats: 'Statistiques des Compteurs',
    schoolNumbers: 'Numéros des Écoles',
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
    createdAt: 'Créé le',
    actions: 'Actions',
    createDialog: {
      title: 'Créer un Numéro EDUCAFRIC',
      description: 'Générer un nouveau numéro pour une école',
      notes: 'Notes (optionnel)',
      notesPlaceholder: 'Ajouter des notes sur cette école...',
      create: 'Créer',
      cancel: 'Annuler'
    },
    editDialog: {
      title: 'Modifier le Numéro EDUCAFRIC',
      description: 'Mettre à jour le statut ou les notes',
      status: 'Statut',
      notes: 'Notes',
      save: 'Enregistrer',
      cancel: 'Annuler'
    },
    counterStats: {
      type: 'Type',
      current: 'Compteur Actuel',
      last: 'Dernier Généré',
      next: 'Prochain Numéro'
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
    subtitle: 'Create and manage EDUCAFRIC numbers for schools',
    stats: 'Counter Statistics',
    schoolNumbers: 'School Numbers',
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
    createdAt: 'Created',
    actions: 'Actions',
    createDialog: {
      title: 'Create EDUCAFRIC Number',
      description: 'Generate a new number for a school',
      notes: 'Notes (optional)',
      notesPlaceholder: 'Add notes about this school...',
      create: 'Create',
      cancel: 'Cancel'
    },
    editDialog: {
      title: 'Edit EDUCAFRIC Number',
      description: 'Update status or notes',
      status: 'Status',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel'
    },
    counterStats: {
      type: 'Type',
      current: 'Current Counter',
      last: 'Last Generated',
      next: 'Next Number'
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
  const { data: stats = [] } = useQuery<CounterStat[]>({
    queryKey: ['/api/admin/educafric-numbers/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/educafric-numbers/stats');
      const data = await response.json();
      return data.stats;
    }
  });

  // Fetch school numbers
  const { data: numbers = [], isLoading } = useQuery<EducafricNumber[]>({
    queryKey: ['/api/admin/educafric-numbers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/educafric-numbers');
      const data = await response.json();
      return data.numbers;
    }
  });

  // Create number mutation
  const createMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await apiRequest('POST', '/api/admin/educafric-numbers', { notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/stats'] });
      setShowCreateDialog(false);
      setNotes('');
      toast({
        title: text.messages.created,
        description: `${text.messages.created}`
      });
    },
    onError: () => {
      toast({
        title: text.messages.error,
        variant: 'destructive'
      });
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
      setShowEditDialog(false);
      setSelectedNumber(null);
      toast({
        title: text.messages.updated
      });
    },
    onError: () => {
      toast({
        title: text.messages.error,
        variant: 'destructive'
      });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/educafric-numbers/stats'] });
      toast({
        title: text.messages.deleted
      });
    },
    onError: () => {
      toast({
        title: text.messages.error,
        variant: 'destructive'
      });
    }
  });

  const handleCreate = () => {
    createMutation.mutate(notes);
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{text.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{text.subtitle}</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          data-testid="button-create-educafric-number"
        >
          <Plus className="w-4 h-4 mr-2" />
          {text.createNumber}
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.type} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.currentCounter}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {text.counterStats.next}: <span className="font-mono font-semibold">{stat.nextNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Numbers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            {text.schoolNumbers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : numbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No EDUCAFRIC numbers created yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EDUCAFRIC Number</TableHead>
                  <TableHead>{text.status}</TableHead>
                  <TableHead>{text.school}</TableHead>
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
                      {number.schoolName ? (
                        <div>
                          <div className="font-medium">{number.schoolName}</div>
                          <div className="text-sm text-gray-500">{number.schoolEmail}</div>
                        </div>
                      ) : (
                        <Badge variant="outline">{text.available}</Badge>
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
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{text.createDialog.title}</DialogTitle>
            <DialogDescription>{text.createDialog.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{text.createDialog.notes}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={text.createDialog.notesPlaceholder}
                data-testid="input-create-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {text.createDialog.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-confirm-create">
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
              <Label htmlFor="edit-status">{text.editDialog.status}</Label>
              <select
                id="edit-status"
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
              <Label htmlFor="edit-notes">{text.editDialog.notes}</Label>
              <Textarea
                id="edit-notes"
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
