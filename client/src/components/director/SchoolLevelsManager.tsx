import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Label } from '@/components/ui/label';

interface SchoolLevel {
  id: number;
  schoolId: number;
  name: string;
  nameFr?: string;
  nameEn?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SchoolLevelsManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    nameEn: '',
    order: 1
  });

  const { data: levelsData, isLoading } = useQuery<{ success: boolean; levels: SchoolLevel[] }>({
    queryKey: ['/api/director/school-levels'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/director/school-levels', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/school-levels'] });
      toast({
        title: language === 'fr' ? '✅ Niveau créé' : '✅ Level created',
        description: language === 'fr' ? 'Le niveau a été ajouté avec succès' : 'Level added successfully'
      });
      setIsAdding(false);
      setFormData({ name: '', nameFr: '', nameEn: '', order: 1 });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' ? 'Échec de la création du niveau' : 'Failed to create level',
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      return await apiRequest(`/api/director/school-levels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/school-levels'] });
      toast({
        title: language === 'fr' ? '✅ Niveau mis à jour' : '✅ Level updated',
        description: language === 'fr' ? 'Le niveau a été modifié avec succès' : 'Level updated successfully'
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' ? 'Échec de la mise à jour du niveau' : 'Failed to update level',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/director/school-levels/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/school-levels'] });
      toast({
        title: language === 'fr' ? '✅ Niveau supprimé' : '✅ Level deleted',
        description: language === 'fr' ? 'Le niveau a été supprimé avec succès' : 'Level deleted successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' ? 'Échec de la suppression du niveau' : 'Failed to delete level',
        variant: 'destructive'
      });
    }
  });

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({
        title: language === 'fr' ? '❌ Erreur' : '❌ Error',
        description: language === 'fr' ? 'Le nom est obligatoire' : 'Name is required',
        variant: 'destructive'
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (level: SchoolLevel) => {
    updateMutation.mutate({
      id: level.id,
      data: {
        name: level.name,
        nameFr: level.nameFr,
        nameEn: level.nameEn,
        order: level.order
      }
    });
  };

  const levels = levelsData?.levels || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'fr' ? '📊 Niveaux Scolaires' : '📊 School Levels'}
        </CardTitle>
        <CardDescription>
          {language === 'fr' 
            ? 'Gérez les niveaux personnalisés de votre école (Form 1, 6ème, etc.)'
            : 'Manage your school\'s custom levels (Form 1, 6ème, etc.)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            {language === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        ) : (
          <>
            {/* Existing levels list */}
            <div className="space-y-2">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  data-testid={`level-item-${level.id}`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  
                  {editingId === level.id ? (
                    <>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          placeholder={language === 'fr' ? 'Nom' : 'Name'}
                          value={level.name}
                          onChange={(e) => {
                            const updatedLevels = levels.map(l =>
                              l.id === level.id ? { ...l, name: e.target.value } : l
                            );
                            queryClient.setQueryData(['/api/director/school-levels'], { 
                              success: true, 
                              levels: updatedLevels 
                            });
                          }}
                          data-testid={`input-name-${level.id}`}
                        />
                        <Input
                          placeholder="Nom FR"
                          value={level.nameFr || ''}
                          onChange={(e) => {
                            const updatedLevels = levels.map(l =>
                              l.id === level.id ? { ...l, nameFr: e.target.value } : l
                            );
                            queryClient.setQueryData(['/api/director/school-levels'], { 
                              success: true, 
                              levels: updatedLevels 
                            });
                          }}
                          data-testid={`input-name-fr-${level.id}`}
                        />
                        <Input
                          placeholder="Name EN"
                          value={level.nameEn || ''}
                          onChange={(e) => {
                            const updatedLevels = levels.map(l =>
                              l.id === level.id ? { ...l, nameEn: e.target.value } : l
                            );
                            queryClient.setQueryData(['/api/director/school-levels'], { 
                              success: true, 
                              levels: updatedLevels 
                            });
                          }}
                          data-testid={`input-name-en-${level.id}`}
                        />
                      </div>
                      <Input
                        type="number"
                        className="w-20"
                        placeholder={language === 'fr' ? 'Ordre' : 'Order'}
                        value={level.order}
                        onChange={(e) => {
                          const updatedLevels = levels.map(l =>
                            l.id === level.id ? { ...l, order: parseInt(e.target.value) } : l
                          );
                          queryClient.setQueryData(['/api/director/school-levels'], { 
                            success: true, 
                            levels: updatedLevels 
                          });
                        }}
                        data-testid={`input-order-${level.id}`}
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdate(level)}
                          data-testid={`button-save-${level.id}`}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          data-testid={`button-cancel-${level.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{level.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {level.nameFr && `FR: ${level.nameFr}`}
                          {level.nameFr && level.nameEn && ' | '}
                          {level.nameEn && `EN: ${level.nameEn}`}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        #{level.order}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(level.id)}
                          data-testid={`button-edit-${level.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(level.id)}
                          data-testid={`button-delete-${level.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add new level form */}
            {isAdding ? (
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{language === 'fr' ? 'Nom*' : 'Name*'}</Label>
                    <Input
                      placeholder={language === 'fr' ? 'Ex: Form 1, 6ème' : 'Ex: Form 1, 6ème'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-new-name"
                    />
                  </div>
                  <div>
                    <Label>{language === 'fr' ? 'Ordre*' : 'Order*'}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      data-testid="input-new-order"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{language === 'fr' ? 'Nom FR (optionnel)' : 'Name FR (optional)'}</Label>
                    <Input
                      placeholder="Ex: Sixième"
                      value={formData.nameFr}
                      onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                      data-testid="input-new-name-fr"
                    />
                  </div>
                  <div>
                    <Label>{language === 'fr' ? 'Nom EN (optionnel)' : 'Name EN (optional)'}</Label>
                    <Input
                      placeholder="Ex: Form 1"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      data-testid="input-new-name-en"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setFormData({ name: '', nameFr: '', nameEn: '', order: 1 });
                    }}
                    data-testid="button-cancel-add"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={createMutation.isPending}
                    data-testid="button-save-new"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Enregistrer' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full"
                variant="outline"
                data-testid="button-add-level"
              >
                <Plus className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Ajouter un niveau' : 'Add level'}
              </Button>
            )}

            {levels.length === 0 && !isAdding && (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'fr' 
                  ? 'Aucun niveau défini. Cliquez sur "Ajouter un niveau" pour commencer.' 
                  : 'No levels defined. Click "Add level" to get started.'}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
