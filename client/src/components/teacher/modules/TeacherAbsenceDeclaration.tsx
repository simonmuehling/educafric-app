import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, UserX, AlertTriangle, CheckCircle, Send, Clock, FileText, Phone, Mail } from 'lucide-react';

interface AbsenceDeclaration {
  reason: string;
  startDate: string;
  endDate: string;
  contactPhone: string;
  contactEmail: string;
  details: string;
  classesAffected: string[];
  urgency: 'low' | 'medium' | 'high';
}

const TeacherAbsenceDeclaration: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [declaration, setDeclaration] = useState<AbsenceDeclaration>({
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    details: '',
    classesAffected: [],
    urgency: 'medium'
  });

  const [selectedTab, setSelectedTab] = useState<'declare' | 'history'>('declare');

  // Fetch absences history from API
  const { data: absencesData, isLoading: absencesLoading, error: absencesError } = useQuery<{ success: boolean, absences: any[] }>({
    queryKey: ['/api/teacher/absences'],
    enabled: selectedTab === 'history'
  });

  const myAbsences = absencesData?.success ? absencesData.absences : [];

  // Fetch teacher classes from API
  const { data: classesData, isLoading: classesLoading, error: classesError } = useQuery<any>({
    queryKey: ['/api/teacher/classes']
  });

  // ✅ FIX: Extract classes from schoolsWithClasses structure OR flat classes array
  const teacherClasses = React.useMemo(() => {
    if (!classesData) return [];
    
    // If API returns schoolsWithClasses structure, flatten it
    if (classesData.schoolsWithClasses && Array.isArray(classesData.schoolsWithClasses)) {
      const allClasses: string[] = [];
      for (const school of classesData.schoolsWithClasses) {
        if (school.classes && Array.isArray(school.classes)) {
          for (const cls of school.classes) {
            if (cls.name && !allClasses.includes(cls.name)) {
              allClasses.push(cls.name);
            }
          }
        }
      }
      return allClasses;
    }
    
    // If API returns flat classes array
    if (classesData.classes && Array.isArray(classesData.classes)) {
      return classesData.classes.map((cls: any) => cls.name).filter(Boolean);
    }
    
    return [];
  }, [classesData]);

  // Submit absence declaration
  const declareAbsenceMutation = useMutation({
    mutationFn: async (absenceData: AbsenceDeclaration) => {
      const response = await fetch('/api/teacher/absence/declare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: absenceData.reason,
          startDate: absenceData.startDate,
          endDate: absenceData.endDate,
          contactPhone: absenceData.contactPhone,
          contactEmail: absenceData.contactEmail,
          details: absenceData.details,
          classesAffected: absenceData.classesAffected,
          urgency: absenceData.urgency
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to declare absence');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/absences'] });
      setDeclaration({
        reason: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        contactPhone: user?.phone || '',
        contactEmail: user?.email || '',
        details: '',
        classesAffected: [],
        urgency: 'medium'
      });
      toast({
        title: language === 'fr' ? 'Absence déclarée avec succès' : 'Absence declared successfully',
        description: data.message || (language === 'fr' 
          ? 'Votre demande d\'absence a été envoyée à la direction'
          : 'Your absence request has been sent to the administration')
      });
    },
    onError: (error: any) => {
      console.error('[ABSENCE_DECLARATION] Error:', error);
      toast({
        title: language === 'fr' ? 'Erreur lors de la déclaration' : 'Declaration failed',
        description: error.message || (language === 'fr' 
          ? 'Impossible de déclarer l\'absence. Veuillez réessayer.'
          : 'Failed to declare absence. Please try again.'),
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    // Enhanced form validation
    const validationErrors = [];
    
    if (!declaration.reason || declaration.reason.trim() === '') {
      validationErrors.push(language === 'fr' ? 'Le motif d\'absence est requis' : 'Absence reason is required');
    }
    
    if (!declaration.startDate) {
      validationErrors.push(language === 'fr' ? 'La date de début est requise' : 'Start date is required');
    }
    
    if (!declaration.endDate) {
      validationErrors.push(language === 'fr' ? 'La date de fin est requise' : 'End date is required');
    }
    
    if (declaration.startDate && declaration.endDate && new Date(declaration.startDate) > new Date(declaration.endDate)) {
      validationErrors.push(language === 'fr' ? 'La date de début doit être antérieure à la date de fin' : 'Start date must be before end date');
    }
    
    if (declaration.classesAffected.length === 0) {
      validationErrors.push(language === 'fr' ? 'Veuillez sélectionner au moins une classe concernée' : 'Please select at least one affected class');
    }
    
    if (teacherClasses.length === 0) {
      validationErrors.push(language === 'fr' ? 'Impossible de charger vos classes. Veuillez réessayer.' : 'Unable to load your classes. Please try again.');
    }

    if (validationErrors.length > 0) {
      toast({
        title: language === 'fr' ? 'Informations manquantes ou incorrectes' : 'Missing or incorrect information',
        description: validationErrors.join('. '),
        variant: 'destructive'
      });
      return;
    }

    declareAbsenceMutation.mutate(declaration);
  };

  const handleClassToggle = (className: string) => {
    setDeclaration(prev => ({
      ...prev,
      classesAffected: prev.classesAffected.includes(className)
        ? prev.classesAffected.filter(c => c !== className)
        : [...prev.classesAffected, className]
    }));
  };

  const text = {
    fr: {
      title: 'Déclaration d\'Absence',
      subtitle: 'Informer l\'administration de votre absence',
      declare: 'Déclarer',
      history: 'Historique',
      reason: 'Motif d\'absence',
      startDate: 'Date début',
      endDate: 'Date fin',
      contactPhone: 'Téléphone contact',
      contactEmail: 'Email contact',
      details: 'Détails supplémentaires',
      classesAffected: 'Classes concernées',
      urgency: 'Urgence',
      submit: 'Déclarer l\'absence',
      submitting: 'Envoi en cours...',
      status: {
        pending: 'En attente',
        approved: 'Approuvée',
        rejected: 'Refusée'
      },
      urgencyLevels: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée'
      }
    },
    en: {
      title: 'Absence Declaration',
      subtitle: 'Inform administration of your absence',
      declare: 'Declare',
      history: 'History',
      reason: 'Absence reason',
      startDate: 'Start date',
      endDate: 'End date',
      contactPhone: 'Contact phone',
      contactEmail: 'Contact email',
      details: 'Additional details',
      classesAffected: 'Affected classes',
      urgency: 'Urgency',
      submit: 'Declare absence',
      submitting: 'Submitting...',
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      },
      urgencyLevels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status] || status}
      </Badge>
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <UserX className="w-6 h-6 text-orange-600" />
          <span className="text-sm text-gray-500">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={selectedTab === 'declare' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab('declare')}
          className="flex-1"
        >
          <Send className="w-4 h-4 mr-2" />
          {t.declare}
        </Button>
        <Button
          variant={selectedTab === 'history' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab('history')}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          {t.history}
        </Button>
      </div>

      {selectedTab === 'declare' ? (
        <Card className={`${getUrgencyColor(declaration.urgency)}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {t.declare}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.reason} *</label>
                <Select
                  value={declaration.reason}
                  onValueChange={(value) => setDeclaration(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maladie">Maladie</SelectItem>
                    <SelectItem value="urgence-familiale">Urgence familiale</SelectItem>
                    <SelectItem value="rendez-vous-medical">Rendez-vous médical</SelectItem>
                    <SelectItem value="formation">Formation professionnelle</SelectItem>
                    <SelectItem value="conges">Congés</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{t.urgency}</label>
                <Select
                  value={declaration.urgency}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setDeclaration(prev => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.urgencyLevels.low}</SelectItem>
                    <SelectItem value="medium">{t.urgencyLevels.medium}</SelectItem>
                    <SelectItem value="high">{t.urgencyLevels.high}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{t.startDate} *</label>
                <Input
                  type="date"
                  value={declaration.startDate}
                  onChange={(e) => setDeclaration(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t.endDate} *</label>
                <Input
                  type="date"
                  value={declaration.endDate}
                  onChange={(e) => setDeclaration(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t.contactPhone}</label>
                <Input
                  type="tel"
                  value={declaration.contactPhone}
                  onChange={(e) => setDeclaration(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t.contactEmail}</label>
                <Input
                  type="email"
                  value={declaration.contactEmail}
                  onChange={(e) => setDeclaration(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t.classesAffected} *</label>
              {classesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                  </span>
                </div>
              ) : classesError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    {language === 'fr' ? 'Erreur lors du chargement des classes' : 'Error loading classes'}
                  </p>
                </div>
              ) : teacherClasses.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-600 text-sm">
                    {language === 'fr' ? 'Aucune classe assignée' : 'No classes assigned'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {teacherClasses.map((className) => (
                    <Button
                      key={className}
                      variant={declaration.classesAffected.includes(className) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleClassToggle(className)}
                      className="text-xs"
                      data-testid={`button-class-${className.toLowerCase().replace(' ', '-')}`}
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">{t.details}</label>
              <Textarea
                value={declaration.details}
                onChange={(e) => setDeclaration(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Informations supplémentaires pour faciliter la gestion de l'absence..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                  Votre demande sera envoyée directement à la direction
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={declareAbsenceMutation.isPending || classesLoading || !declaration.reason || !declaration.startDate || declaration.classesAffected.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-submit-absence"
              >
                <Send className="w-4 h-4 mr-2" />
                {declareAbsenceMutation.isPending ? t.submitting : t.submit}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Mes demandes d\'absence' : 'My absence requests'}
          </h3>
          {absencesLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">
                {language === 'fr' ? 'Chargement de l\'historique...' : 'Loading history...'}
              </span>
            </div>
          ) : absencesError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600 font-medium">
                  {language === 'fr' ? 'Erreur lors du chargement' : 'Loading error'}
                </p>
              </div>
              <p className="text-red-600 text-sm mt-1">
                {language === 'fr' 
                  ? 'Impossible de charger l\'historique des absences'
                  : 'Unable to load absence history'}
              </p>
            </div>
          ) : myAbsences.length === 0 ? (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-md text-center">
              <UserX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {language === 'fr' 
                  ? 'Aucune demande d\'absence enregistrée'
                  : 'No absence requests recorded'}
              </p>
            </div>
          ) : (
            myAbsences.map((absence: any) => (
              <Card key={absence.id} data-testid={`card-absence-${absence.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium" data-testid={`text-absence-reason-${absence.id}`}>
                          {absence.reason}
                        </div>
                        {getStatusBadge(absence.status)}
                        <Badge variant="outline" className={`text-xs ${
                          absence.urgency === 'high' ? 'border-red-500 text-red-700' :
                          absence.urgency === 'medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-green-500 text-green-700'
                        }`}>
                          {t.urgencyLevels[absence.urgency as keyof typeof t.urgencyLevels]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(absence.startDate).toLocaleDateString()} → {new Date(absence.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(absence.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {absence.classesAffected && absence.classesAffected.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          {language === 'fr' ? 'Classes concernées: ' : 'Affected classes: '}
                          {Array.isArray(absence.classesAffected) ? absence.classesAffected.join(', ') : absence.classesAffected}
                        </div>
                      )}
                      {absence.details && (
                        <div className="text-sm text-gray-500 mt-1">
                          {absence.details}
                        </div>
                      )}
                      {(absence.contactPhone || absence.contactEmail) && (
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          {absence.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {absence.contactPhone}
                            </div>
                          )}
                          {absence.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {absence.contactEmail}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAbsenceDeclaration;