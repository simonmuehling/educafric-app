import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Video, Search, CheckCircle, XCircle, Clock, School, User, Calendar, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface School {
  id: number;
  name: string;
  code?: string;
  city?: string;
  country?: string;
}

interface Activation {
  id: number;
  entityType: 'school' | 'teacher';
  entityId: number;
  entityName?: string;
  durationType?: string;
  expiresAt: string;
  isActive: boolean;
  activatedBy: number;
  activatorName?: string;
  paymentId?: string;
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
  createdAt: string;
}

export default function OnlineClassActivations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [durationType, setDurationType] = useState<'monthly' | 'quarterly' | 'semestral' | 'yearly'>('yearly');
  const [notes, setNotes] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  // Fetch all schools
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery<{ schools: School[] }>({
    queryKey: ['/api/admin/schools'],
  });

  // Fetch all activations
  const { data: activationsData, isLoading: activationsLoading } = useQuery<{ activations: Activation[] }>({
    queryKey: ['/api/admin/online-class-activations'],
  });

  // Activate school mutation
  const activateSchoolMutation = useMutation({
    mutationFn: async (data: { schoolId: number; durationType: string; notes?: string }) => {
      const response = await apiRequest('POST', '/api/admin/online-class-activations/schools', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Échec de l\'activation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Activation réussie',
        description: data.message || 'L\'école a été activée pour les cours en ligne',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/online-class-activations'] });
      setShowDialog(false);
      setSelectedSchool(null);
      setNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'activation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel activation mutation
  const cancelActivationMutation = useMutation({
    mutationFn: async (activationId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/online-class-activations/${activationId}`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Échec de l\'annulation');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Activation annulée',
        description: 'L\'activation a été annulée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/online-class-activations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'annulation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleActivateSchool = () => {
    if (!selectedSchool) return;
    
    activateSchoolMutation.mutate({
      schoolId: selectedSchool.id,
      durationType,
      notes: notes || undefined,
    });
  };

  const handleCancelActivation = (activationId: number) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette activation ?')) {
      cancelActivationMutation.mutate(activationId);
    }
  };

  const filteredSchools = schoolsData?.schools?.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activations = activationsData?.activations || [];
  const activeActivations = activations.filter((a) => a.isActive);
  const expiredActivations = activations.filter((a) => !a.isActive);

  const getDurationLabel = (durationType: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      semestral: 'Semestriel',
      yearly: 'Annuel',
    };
    return labels[durationType] || durationType;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Activations Cours en Ligne
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les activations manuelles pour les écoles
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          data-testid="button-activate-school"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="ml-2 sm:ml-0">Activer École</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Activations Actives</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{activeActivations.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Écoles Activées</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {activeActivations.filter((a) => a.entityType === 'school').length}
                </p>
              </div>
              <School className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Expirées</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-600">{expiredActivations.length}</p>
              </div>
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Activations en Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : activeActivations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune activation active
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Expire le</TableHead>
                    <TableHead>Activé par</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeActivations.map((activation) => (
                    <TableRow key={activation.id}>
                      <TableCell>
                        <Badge variant={activation.entityType === 'school' ? 'default' : 'secondary'}>
                          {activation.entityType === 'school' ? (
                            <School className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {activation.entityType === 'school' ? 'École' : 'Enseignant'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {activation.entityName || `ID: ${activation.entityId}`}
                      </TableCell>
                      <TableCell>
                        {activation.durationType ? getDurationLabel(activation.durationType) : '1 an'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(activation.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {activation.activatorName || `User ${activation.activatedBy}`}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelActivation(activation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-cancel-${activation.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activer Cours en Ligne pour une École</DialogTitle>
            <DialogDescription>
              Sélectionnez une école et configurez la durée d'activation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Schools */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une école..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-school"
              />
            </div>

            {/* Schools List */}
            {schoolsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedSchool?.id === school.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    data-testid={`button-select-school-${school.id}`}
                  >
                    <div className="font-medium">{school.name}</div>
                    <div className="text-sm text-gray-600">
                      {school.code && `${school.code} • `}
                      {school.city}, {school.country}
                    </div>
                  </button>
                ))}
                {filteredSchools.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Aucune école trouvée
                  </div>
                )}
              </div>
            )}

            {/* Selected School */}
            {selectedSchool && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-700">École sélectionnée:</p>
                  <p className="text-lg font-bold text-blue-900">{selectedSchool.name}</p>
                </CardContent>
              </Card>
            )}

            {/* Duration Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Durée d'activation</label>
              <Select value={durationType} onValueChange={(value: any) => setDurationType(value)}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel (1 mois)</SelectItem>
                  <SelectItem value="quarterly">Trimestriel (3 mois)</SelectItem>
                  <SelectItem value="semestral">Semestriel (6 mois)</SelectItem>
                  <SelectItem value="yearly">Annuel (1 an)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (optionnel)</label>
              <Input
                placeholder="Raison de l'activation, numéro de commande, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-testid="button-cancel-dialog"
            >
              Annuler
            </Button>
            <Button
              onClick={handleActivateSchool}
              disabled={!selectedSchool || activateSchoolMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-confirm-activate"
            >
              {activateSchoolMutation.isPending ? 'Activation...' : 'Activer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
