import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Users, BookOpen, Clock, MapPin, 
  Edit, Trash2, Eye, Calendar, GraduationCap,
  Search, Filter, MoreVertical, School, LogOut,
  Phone, AlertTriangle
} from 'lucide-react';
import { sortBy } from '@/utils/sort';

interface ClassData {
  id: number;
  name: string;
  level: string;
  section: string;
  studentCount: number;
  subject: string;
  room: string;
  schedule: string;
}

interface SchoolData {
  schoolId: number;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  isConnected: boolean;
  assignmentDate: string;
  classes: ClassData[];
}

const FunctionalMyClasses: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    level: '',
    schoolId: 1 // Will be set dynamically based on user
  });

  const [disconnectingSchool, setDisconnectingSchool] = useState<SchoolData | null>(null);
  const [disconnectReason, setDisconnectReason] = useState('');

  // Fetch schools and classes data from REAL database
  // Auto-refresh every 30 seconds to show new class assignments immediately
  const { data: schoolsData, isLoading, error } = useQuery<{success: boolean, schoolsWithClasses: SchoolData[]}>({
    queryKey: ['/api/teacher/classes'],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when tab becomes active
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Mutation pour se déconnecter d'une école
  const disconnectMutation = useMutation({
    mutationFn: async ({ schoolId, reason }: { schoolId: number, reason: string }) => {
      const response = await fetch('/api/teacher/disconnect-school', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, reason })
      });
      if (!response.ok) throw new Error('Failed to disconnect from school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      setDisconnectingSchool(null);
      setDisconnectReason('');
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté de l\'école avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de se déconnecter de l\'école',
        variant: 'destructive'
      });
    }
  });

  // Create class mutation
  const createMutation = useMutation({
    mutationFn: async (classData: typeof newClass) => {
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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

  const handleDisconnectSchool = (school: SchoolData) => {
    setDisconnectingSchool(school);
  };

  const confirmDisconnect = () => {
    if (disconnectingSchool && disconnectReason.trim()) {
      disconnectMutation.mutate({
        schoolId: disconnectingSchool.schoolId,
        reason: disconnectReason
      });
    }
  };

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

  const schools = schoolsData?.schoolsWithClasses || [];
  const allClasses = schools.flatMap(school => 
    school.classes.map(cls => ({
      ...cls,
      schoolName: school.schoolName,
      schoolId: school.schoolId
    }))
  );
  
  const filteredClasses = allClasses.filter(cls => {
    if (!cls) return false;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      cls?.name?.toLowerCase().includes(searchLower) ||
      cls?.subject?.toLowerCase().includes(searchLower) ||
      cls?.schoolName?.toLowerCase().includes(searchLower) ||
      (cls as any)?.subjects?.some((s: string) => s?.toLowerCase().includes(searchLower));
    return matchesSearch;
  });

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
              <DialogDescription>
                {language === 'fr' ? 'Créez une nouvelle classe pour organiser vos étudiants' : 'Create a new class to organise your students'}
              </DialogDescription>
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
                <Input
                  id="level"
                  value={newClass.level || ''}
                  onChange={(e) => setNewClass({...newClass, level: e?.target?.value})}
                  placeholder="6ème, 5ème, 4ème..."
                />
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

      {/* Search Bar - Simple */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder={language === 'fr' ? 'Rechercher une classe ou matière...' : 'Search class or subject...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
              data-testid="input-search-classes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Écoles et Classes */}
      <div className="space-y-6">
        {schools.map((school) => (
          <Card key={school.schoolId} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <School className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{school.schoolName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {school.schoolAddress}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {school.schoolPhone}
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Connecté depuis {new Date(school.assignmentDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDisconnectSchool(school)}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {school.classes.map((classItem) => (
                  <Card key={classItem.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-800">
                          {classItem.name || (language === 'fr' ? 'Classe sans nom' : 'Unnamed class')}
                        </h4>
                        {classItem.subject && (
                          <Badge className="bg-blue-100 text-blue-800">{classItem.subject}</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {language === 'fr' ? 'Élèves' : 'Students'}:
                          </span>
                          <span className="font-medium">{classItem.studentCount || 0}</span>
                        </div>
                        {classItem.room && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {language === 'fr' ? 'Salle' : 'Room'}:
                            </span>
                            <span className="font-medium">{classItem.room}</span>
                          </div>
                        )}
                        {classItem.schedule && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{classItem.schedule}</span>
                          </div>
                        )}
                        {classItem.level && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {language === 'fr' ? 'Niveau' : 'Level'}:
                            </span>
                            <span className="font-medium">{classItem.level}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {school.classes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune classe assignée dans cette école</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {schools.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <School className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune école assignée</h3>
            <p className="text-gray-500">
              Contactez l'administration pour être assigné à une école
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de déconnexion d'école */}
      <Dialog open={!!disconnectingSchool} onOpenChange={() => setDisconnectingSchool(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Déconnexion de l'école
            </DialogTitle>
            <DialogDescription>
              {language === 'fr' ? 'Confirmez la déconnexion de cette école et perdez l\'accès aux classes' : 'Confirm disconnection from this school and lose access to classes'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous allez vous déconnecter de <strong>{disconnectingSchool?.schoolName}</strong>. 
              Cette action est irréversible et vous perdrez l'accès à toutes les classes de cette école.
            </p>
            
            <div>
              <Label htmlFor="disconnectReason">Raison de la déconnexion *</Label>
              <Select value={disconnectReason} onValueChange={setDisconnectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fin de contrat">Fin de contrat</SelectItem>
                  <SelectItem value="Licenciement">Licenciement</SelectItem>
                  <SelectItem value="Démission">Démission</SelectItem>
                  <SelectItem value="Mutation">Mutation vers une autre école</SelectItem>
                  <SelectItem value="Autre">Autre raison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDisconnectingSchool(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDisconnect}
                disabled={!disconnectReason || disconnectMutation.isPending}
                className="flex-1"
              >
                {disconnectMutation.isPending ? 'Déconnexion...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunctionalMyClasses;