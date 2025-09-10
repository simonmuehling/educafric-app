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
  const { data: absencesData } = useQuery({
    queryKey: ['/api/teacher/absences'],
    enabled: selectedTab === 'history'
  });

  const myAbsences = (absencesData as any)?.absences || [];

  // Fetch teacher classes from API
  const { data: classesData } = useQuery({
    queryKey: ['/api/teacher/classes'],
  });

  const teacherClasses = (classesData as any)?.classes?.map((cls: any) => cls.name) || ['6ème A', '5ème B', '4ème C', 'Terminale A'];

  // Submit absence declaration
  const declareAbsenceMutation = useMutation({
    mutationFn: async (absenceData: AbsenceDeclaration) => {
      const response = await fetch('/api/teacher/absence/declare-ERROR-TEST', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({
          ...absenceData,
          teacherId: user?.id,
          teacherName: `${user?.firstName} ${user?.lastName}`,
          subject: (user as any)?.subject || 'Matière non spécifiée'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to declare absence');
      }

      return response.json();
    },
    onSuccess: () => {
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
        title: language === 'fr' ? 'Absence déclarée' : 'Absence declared',
        description: language === 'fr' 
          ? 'Votre demande d\'absence a été envoyée à la direction'
          : 'Your absence request has been sent to the administration'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de déclarer l\'absence'
          : 'Failed to declare absence',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    if (!declaration.reason || !declaration.startDate || !declaration.endDate || declaration.classesAffected.length === 0) {
      toast({
        title: language === 'fr' ? 'Informations manquantes' : 'Missing information',
        description: language === 'fr' 
          ? 'Veuillez remplir tous les champs obligatoires'
          : 'Please fill all required fields',
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {teacherClasses.map((className) => (
                  <Button
                    key={className}
                    variant={declaration.classesAffected.includes(className) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleClassToggle(className)}
                    className="text-xs"
                  >
                    {className}
                  </Button>
                ))}
              </div>
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
                disabled={declareAbsenceMutation.isPending || !declaration.reason || !declaration.startDate || declaration.classesAffected.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {declareAbsenceMutation.isPending ? t.submitting : t.submit}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mes demandes d'absence</h3>
          {myAbsences.map((absence) => (
            <Card key={absence.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{absence.reason}</div>
                      {getStatusBadge(absence.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {absence.startDate} → {absence.endDate}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(absence.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Remplaçant: {absence.substitute}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAbsenceDeclaration;