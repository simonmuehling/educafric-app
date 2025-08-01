import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  School, UserPlus, Search, Download, Filter, MoreHorizontal, 
  Users, BookOpen, TrendingUp, Calendar, Plus, Edit, Trash2, 
  Eye, X, Building, MapPin 
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
  level: string;
  section: string;
  capacity: number;
  currentStudents: number;
  teacherName: string;
  room: string;
  status: 'active' | 'full' | 'closed';
}

const FunctionalDirectorClassManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    level: '',
    section: '',
    capacity: '',
    teacherId: '',
    teacherName: '',
    room: ''
  });

  // Fetch classes data from PostgreSQL API
  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ['/api/director/classes'],
    enabled: !!user
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: any) => {
      const response = await fetch('/api/director/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      setIsCreateClassOpen(false);
      setClassForm({ name: '', level: '', section: '', capacity: '', teacherId: '', teacherName: '', room: '' });
      toast({
        title: 'Classe créée',
        description: 'La classe a été créée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la classe.',
        variant: 'destructive'
      });
    }
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async (classData: any) => {
      const response = await fetch(`/api/director/class/${classData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      setIsEditClassOpen(false);
      setSelectedClass(null);
      toast({
        title: 'Classe modifiée',
        description: 'La classe a été modifiée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la classe.',
        variant: 'destructive'
      });
    }
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await fetch(`/api/director/class/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/classes'] });
      toast({
        title: 'Classe supprimée',
        description: 'La classe a été supprimée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la classe.',
        variant: 'destructive'
      });
    }
  });

  const handleCreateClass = () => {
    createClassMutation.mutate({
      ...classForm,
      capacity: parseInt(classForm.capacity) || 30
    });
  };

  const handleUpdateClass = () => {
    if (selectedClass) {
      updateClassMutation.mutate({
        ...selectedClass,
        ...classForm
      });
    }
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setClassForm({
      name: classItem.name,
      level: classItem.level,
      section: classItem.section,
      capacity: classItem.capacity.toString(),
      teacherId: '',
      teacherName: classItem.teacherName,
      room: classItem.room
    });
    setIsEditClassOpen(true);
  };

  const handleDeleteClass = (classId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      deleteClassMutation.mutate(classId);
    }
  };

  const filteredClasses = (Array.isArray(classes) ? classes : []).filter(cls => {
    if (!cls) return false;
    const matchesSearch = (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cls.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || cls.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    totalClasses: classes.length,
    totalStudents: (Array.isArray(classes) ? classes : []).reduce((sum, cls) => sum + cls.currentStudents, 0),
    averageCapacity: classes.length > 0 ? Math.round((Array.isArray(classes) ? classes : []).reduce((sum, cls) => sum + cls.capacity, 0) / classes.length) : 0,
    fullClasses: (Array.isArray(classes) ? classes : []).filter(cls => cls.status === 'full').length
  };

  const text = language === 'fr' ? {
    title: 'Gestion des Classes',
    createClass: 'Créer une Classe',
    editClass: 'Modifier la Classe',
    search: 'Rechercher...',
    level: 'Niveau',
    allLevels: 'Tous les niveaux',
    stats: {
      total: 'Total Classes',
      students: 'Total Élèves', 
      capacity: 'Capacité Moyenne',
      full: 'Classes Pleines'
    },
    form: {
      name: 'Nom de la classe',
      level: 'Niveau',
      section: 'Section',
      capacity: 'Capacité',
      teacher: 'Enseignant principal',
      room: 'Salle'
    },
    table: {
      name: 'Classe',
      level: 'Niveau',
      students: 'Élèves',
      capacity: 'Capacité',
      teacher: 'Professeur',
      room: 'Salle',
      status: 'Statut',
      actions: 'Actions'
    },
    status: {
      active: 'Active',
      full: 'Complète',
      closed: 'Fermée'
    },
    buttons: {
      create: 'Créer',
      update: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      edit: 'Modifier',
      view: 'Voir'
    }
  } : {
    title: 'Class Management',
    createClass: 'Create Class',
    editClass: 'Edit Class',
    search: 'Search...',
    level: 'Level',
    allLevels: 'All levels',
    stats: {
      total: 'Total Classes',
      students: 'Total Students',
      capacity: 'Average Capacity',
      full: 'Full Classes'
    },
    form: {
      name: 'Class name',
      level: 'Level',
      section: 'Section',
      capacity: 'Capacity',
      teacher: 'Main teacher',
      room: 'Room'
    },
    table: {
      name: 'Class',
      level: 'Level',
      students: 'Students',
      capacity: 'Capacity',
      teacher: 'Teacher',
      room: 'Room',
      status: 'Status',
      actions: 'Actions'
    },
    status: {
      active: 'Active',
      full: 'Full',
      closed: 'Closed'
    },
    buttons: {
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{text.title || ''}</h1>
          <p className="text-gray-500">Gérez les classes de votre établissement</p>
        </div>
        <Button 
          onClick={() => setIsCreateClassOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-class"
        >
          <Plus className="w-4 h-4 mr-2" />
          {text.createClass}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.total}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.students}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.capacity}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageCapacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-full">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{text.stats.full}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.fullClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={text.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={text.level} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{text.allLevels}</SelectItem>
                  <SelectItem value="6ème">6ème</SelectItem>
                  <SelectItem value="5ème">5ème</SelectItem>
                  <SelectItem value="4ème">4ème</SelectItem>
                  <SelectItem value="3ème">3ème</SelectItem>
                  <SelectItem value="2nde">2nde</SelectItem>
                  <SelectItem value="1ère">1ère</SelectItem>
                  <SelectItem value="Tle">Terminale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Class Modal */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.createClass}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCreateClassOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={classForm.name || ''}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: 6ème A"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.level}</Label>
                <Select 
                  value={classForm.level} 
                  onValueChange={(value) => setClassForm(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6ème">6ème</SelectItem>
                    <SelectItem value="5ème">5ème</SelectItem>
                    <SelectItem value="4ème">4ème</SelectItem>
                    <SelectItem value="3ème">3ème</SelectItem>
                    <SelectItem value="2nde">2nde</SelectItem>
                    <SelectItem value="1ère">1ère</SelectItem>
                    <SelectItem value="Tle">Terminale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.section}</Label>
                <Input
                  value={classForm.section}
                  onChange={(e) => setClassForm(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="Ex: A, B, C"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.capacity}</Label>
                <Input
                  type="number"
                  value={classForm.capacity}
                  onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="30"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.teacher}</Label>
                <Input
                  value={classForm.teacherName}
                  onChange={(e) => setClassForm(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="Nom de l'enseignant principal"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.room}</Label>
                <Input
                  value={classForm.room}
                  onChange={(e) => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Ex: Salle 101"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateClass}
                  disabled={createClassMutation.isPending || !classForm.name || !classForm.level}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-create-class"
                >
                  {createClassMutation.isPending ? 'Création...' : text.buttons.create}
                </Button>
                <Button 
                  onClick={() => setIsCreateClassOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-create-class"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditClassOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{text.editClass}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditClassOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{(text.form.name || '')}</Label>
                <Input
                  value={classForm.name || ''}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.level}</Label>
                <Select 
                  value={classForm.level} 
                  onValueChange={(value) => setClassForm(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6ème">6ème</SelectItem>
                    <SelectItem value="5ème">5ème</SelectItem>
                    <SelectItem value="4ème">4ème</SelectItem>
                    <SelectItem value="3ème">3ème</SelectItem>
                    <SelectItem value="2nde">2nde</SelectItem>
                    <SelectItem value="1ère">1ère</SelectItem>
                    <SelectItem value="Tle">Terminale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">{text.form.capacity}</Label>
                <Input
                  type="number"
                  value={classForm.capacity}
                  onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateClass}
                  disabled={updateClassMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-edit-class"
                >
                  {updateClassMutation.isPending ? 'Modification...' : text.buttons.update}
                </Button>
                <Button 
                  onClick={() => setIsEditClassOpen(false)}
                  variant="outline"
                  data-testid="button-cancel-edit-class"
                >
                  {text.buttons.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Classes Actives</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe trouvée</h3>
              <p className="text-gray-500">Créez votre première classe pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredClasses) ? filteredClasses : []).map((classItem) => (
                <div key={classItem.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{classItem.name || ''}</div>
                        <Badge variant={classItem.status === 'active' ? 'default' : 'secondary'}>
                          {text.status[classItem.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>👥 {classItem.currentStudents}/{classItem.capacity}</span>
                        <span>👨‍🏫 {classItem.teacherName}</span>
                        <span>🏢 {classItem.room}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClass(classItem)}
                        data-testid={`button-edit-class-${classItem.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClass(classItem.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-class-${classItem.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalDirectorClassManagement;