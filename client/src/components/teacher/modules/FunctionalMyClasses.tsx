import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Users, BookOpen, Clock, MapPin, 
  Edit, Trash2, Eye, Calendar, GraduationCap,
  Search, Filter, MoreVertical
} from 'lucide-react';

interface ClassData {
  id: number;
  name: string;
  subject: string;
  students: number;
  nextLesson: string;
  attendance: number;
  pendingGrades: number;
  homeworkSubmitted: number;
}

const FunctionalMyClasses: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    level: '',
    schoolId: 1 // Will be set dynamically based on user
  });

  // Fetch classes data
  const { data: classesData, isLoading } = useQuery<ClassData[]>({
    queryKey: ['/api/teacher/classes']
  });

  // Create class mutation
  const createMutation = useMutation({
    mutationFn: async (classData: typeof newClass) => {
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      });
      if (!response.ok) throw new Error('Failed to create class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      setIsCreateOpen(false);
      setNewClass({ name: '', subject: '', level: '', schoolId: 1 });
      toast({
        title: language === 'fr' ? 'Classe créée' : 'Class created',
        description: language === 'fr' ? 'La classe a été créée avec succès' : 'Class has been created successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer la classe' : 'Failed to create class',
        variant: 'destructive'
      });
    }
  });

  // Update class mutation
  const updateMutation = useMutation({
    mutationFn: async (classData: ClassData) => {
      const response = await fetch(`/api/teacher/classes/${classData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      });
      if (!response.ok) throw new Error('Failed to update class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      setEditingClass(null);
      toast({
        title: language === 'fr' ? 'Classe modifiée' : 'Class updated',
        description: language === 'fr' ? 'La classe a été modifiée avec succès' : 'Class has been updated successfully',
      });
    }
  });

  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: async (classId: number) => {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete class');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      toast({
        title: language === 'fr' ? 'Classe supprimée' : 'Class deleted',
        description: language === 'fr' ? 'La classe a été supprimée avec succès' : 'Class has been deleted successfully',
      });
    }
  });

  const text = {
    fr: {
      title: 'Mes Classes',
      subtitle: 'Gérez vos classes et suivez vos étudiants',
      createClass: 'Créer une classe',
      editClass: 'Modifier la classe',
      deleteClass: 'Supprimer',
      viewStudents: 'Voir les élèves',
      searchPlaceholder: 'Rechercher une classe...',
      allLevels: 'Tous les niveaux',
      className: 'Nom de la classe',
      level: 'Niveau',
      section: 'Section',
      subject: 'Matière',
      capacity: 'Capacité',
      room: 'Salle',
      schedule: 'Horaires',
      students: 'élèves',
      active: 'Active',
      inactive: 'Inactive',
      create: 'Créer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      loading: 'Chargement...',
      noClasses: 'Aucune classe trouvée',
      actions: 'Actions'
    },
    en: {
      title: 'My Classes',
      subtitle: 'Manage your classes and track your students',
      createClass: 'Create Class',
      editClass: 'Edit Class',
      deleteClass: 'Delete',
      viewStudents: 'View Students',
      searchPlaceholder: 'Search classes...',
      allLevels: 'All levels',
      className: 'Class Name',
      level: 'Level',
      section: 'Section',
      subject: 'Subject',
      capacity: 'Capacity',
      room: 'Room',
      schedule: 'Schedule',
      students: 'students',
      active: 'Active',
      inactive: 'Inactive',
      create: 'Create',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      noClasses: 'No classes found',
      actions: 'Actions'
    }
  };

  const t = text[language as keyof typeof text];

  const classes = classesData || [];
  const filteredClasses = (Array.isArray(classes) ? classes : []).filter(cls => {
    if (!cls) return false;
    const matchesSearch = cls?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || cls?.name?.includes(selectedLevel);
    return matchesSearch && matchesLevel;
  });

  const levels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.createClass}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{t.createClass}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="className">{t.className}</Label>
                <Input
                  id="className"
                  value={newClass.name || ''}
                  onChange={(e) => setNewClass({...newClass, name: e?.target?.value})}
                  placeholder="Ex: 6ème A"
                />
              </div>
              <div>
                <Label htmlFor="level">{t.level}</Label>
                <Select value={newClass.level} onValueChange={(value) => setNewClass({...newClass, level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.level} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(levels) ? levels : []).map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">{t.subject}</Label>
                <Input
                  id="subject"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({...newClass, subject: e?.target?.value})}
                  placeholder="Mathématiques, Français..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                  {t.cancel}
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(newClass)}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {t.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.allLevels} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allLevels}</SelectItem>
                {(Array.isArray(levels) ? levels : []).map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {(Array.isArray(filteredClasses) ? filteredClasses.length : 0) === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noClasses}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(filteredClasses) ? filteredClasses : []).map(classItem => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{classItem.name || ''}</h3>
                    <p className="text-sm text-gray-600">{classItem.subject}</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {t.active}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {classItem.students} {t.students}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {classItem.nextLesson}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">✓ {classItem.attendance}% présence</span>
                  <span className="text-orange-600">{classItem.pendingGrades} notes à saisir</span>
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {classItem.homeworkSubmitted} devoirs rendus
                </div>
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewStudents}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingClass(classItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteMutation.mutate(classItem.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionalMyClasses;