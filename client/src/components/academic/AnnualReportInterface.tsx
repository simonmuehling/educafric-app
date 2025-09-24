// ANNUAL REPORT INTERFACE WITH PDF, SIGNATURE, SEND, AND ARCHIVE
// Complete interface for managing annual reports with workflow features
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Send, Archive, PenTool, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Import the components we need
import AnnualReportSheet from './AnnualReportSheet';
import BulletinPrint from './BulletinPrint';

interface AnnualReportInterfaceProps {
  studentId?: number;
  reportId?: number;
  schoolId?: number;
  classId?: number;
  mode?: 'create' | 'view' | 'edit';
}

export default function AnnualReportInterface({
  studentId = 123,
  reportId,
  schoolId = 1,
  classId = 1,
  mode = 'view'
}: AnnualReportInterfaceProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [reportData, setReportData] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [signatures, setSignatures] = useState({
    parent: null,
    teacher: null,
    headmaster: null
  });

  // Labels for bilingual interface
  const labels = {
    fr: {
      title: "Rapport Annuel",
      generatePdf: "Générer PDF",
      signReport: "Signer le Rapport",
      sendNotifications: "Envoyer Notifications",
      archiveReport: "Archiver le Rapport",
      preview: "Aperçu",
      edit: "Modifier",
      status: "Statut",
      signatures: "Signatures",
      parentSignature: "Signature Parent",
      teacherSignature: "Signature Enseignant",
      principalSignature: "Signature Directeur",
      notificationsSent: "Notifications Envoyées",
      archived: "Archivé",
      draft: "Brouillon",
      submitted: "Soumis",
      approved: "Approuvé",
      signed: "Signé",
      sent: "Envoyé",
      actions: "Actions",
      workflow: "Workflow"
    },
    en: {
      title: "Annual Report",
      generatePdf: "Generate PDF",
      signReport: "Sign Report",
      sendNotifications: "Send Notifications", 
      archiveReport: "Archive Report",
      preview: "Preview",
      edit: "Edit",
      status: "Status",
      signatures: "Signatures",
      parentSignature: "Parent Signature",
      teacherSignature: "Teacher Signature",
      principalSignature: "Principal Signature",
      notificationsSent: "Notifications Sent",
      archived: "Archived",
      draft: "Draft",
      submitted: "Submitted",
      approved: "Approved",
      signed: "Signed",
      sent: "Sent",
      actions: "Actions",
      workflow: "Workflow"
    }
  };

  const t = labels[language as keyof typeof labels];

  // Fetch annual report data
  const { data: annualReport, isLoading } = useQuery({
    queryKey: ['/api/annual-reports', reportId],
    queryFn: reportId ? undefined : () => null,
    enabled: !!reportId
  });

  // Sign report mutation
  const signMutation = useMutation({
    mutationFn: async ({ signatureType, signatureName, signatureUrl }: any) => {
      return apiRequest(`/api/annual-reports/${reportId}/sign`, {
        method: 'POST',
        body: { signatureType, signatureName, signatureUrl }
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Signature ajoutée",
        description: `Rapport signé en tant que ${variables.signatureType}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/annual-reports', reportId] });
      setSignatures(prev => ({
        ...prev,
        [variables.signatureType]: data.signature
      }));
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de signer le rapport",
        variant: "destructive"
      });
    }
  });

  // Send notifications mutation
  const sendMutation = useMutation({
    mutationFn: async ({ channels, recipients }: any) => {
      return apiRequest(`/api/annual-reports/${reportId}/notify`, {
        method: 'POST',
        body: { channels, recipients }
      });
    },
    onSuccess: () => {
      toast({
        title: "Notifications envoyées",
        description: "Le rapport annuel a été envoyé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/annual-reports', reportId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer les notifications",
        variant: "destructive"
      });
    }
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/annual-reports/${reportId}/archive`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Rapport archivé",
        description: "Le rapport annuel a été archivé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/annual-reports', reportId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le rapport",
        variant: "destructive"
      });
    }
  });

  // Generate sample data for preview
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData = {
        student: {
          name: "Marie-Claire NKOMO MBALLA",
          id: "STU-6E-00157",
          class: "6ème A",
          classLabel: "6ème A Sciences",
          gender: "Féminin",
          birthDate: "15/03/2010",
          birthPlace: "Yaoundé",
          guardian: "M. Jean-Paul NKOMO",
          photoUrl: null
        },
        schoolInfo: {
          name: "Collège Excellence Africaine",
          region: "CENTRE",
          department: "MFOUNDI",
          code: "CEA-2024",
          logo: null
        },
        academicYear: "2024-2025",
        trimesterData: {
          trimester1: {
            average: 15.5,
            rank: "3ème",
            totalStudents: 35,
            subjectCount: 9,
            passedSubjects: 8,
            discipline: { absJ: 2, absNJ: 1, lates: 3, sanctions: 0 },
            teacherObservations: "Bon démarrage d'année. L'élève montre de bonnes dispositions."
          },
          trimester2: {
            average: 14.8,
            rank: "5ème",
            totalStudents: 35,
            subjectCount: 9,
            passedSubjects: 7,
            discipline: { absJ: 1, absNJ: 2, lates: 2, sanctions: 1 },
            teacherObservations: "Progression constante malgré quelques difficultés."
          },
          trimester3: {
            average: 16.2,
            rank: "2ème",
            totalStudents: 35,
            subjectCount: 9,
            passedSubjects: 9,
            discipline: { absJ: 0, absNJ: 1, lates: 1, sanctions: 0 },
            teacherObservations: "Excellente fin d'année. Félicitations pour les efforts."
          }
        },
        annualSummary: {
          annualAverage: 15.5,
          annualRank: "3ème/35",
          finalDecision: 'PASSE',
          principalObservations: "Excellente année scolaire. L'élève a démontré une progression constante et une grande maturité. Continue ainsi !",
          parentObservations: "",
          holidayRecommendations: "Continuer la lecture pendant les vacances. Révisions en mathématiques et français recommandées."
        },
        language: language as 'fr' | 'en'
      };
      setReportData(sampleData);
    };

    if (!annualReport && !isLoading) {
      generateSampleData();
    } else if (annualReport) {
      setReportData(annualReport.data);
    }
  }, [annualReport, isLoading, language]);

  // Handle signature action
  const handleSign = (signatureType: string) => {
    const signatureName = prompt(`Nom pour la signature ${signatureType}:`);
    if (signatureName) {
      signMutation.mutate({ signatureType, signatureName });
    }
  };

  // Handle send notifications
  const handleSendNotifications = () => {
    const channels = ['email']; // Only email and whatsapp allowed per user requirements
    const recipients = [
      { type: 'parent', email: 'parent@example.com' },
      { type: 'student', email: 'student@example.com' }
    ];
    sendMutation.mutate({ channels, recipients });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'signed': return 'bg-purple-500';
      case 'sent': return 'bg-indigo-500';
      case 'archived': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="p-6">Chargement du rapport annuel...</div>;
  }

  if (!reportData) {
    return <div className="p-6">Aucune donnée de rapport disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Status and Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.title} - {reportData.student?.name}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getStatusBadgeColor(reportData.status || 'draft')}>
                {t[reportData.status as keyof typeof t] || reportData.status || t.draft}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                data-testid="button-toggle-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? t.edit : t.preview}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sign Button */}
            <Button
              onClick={() => handleSign('teacher')}
              disabled={signMutation.isPending}
              className="w-full"
              data-testid="button-sign-annual"
            >
              <PenTool className="h-4 w-4 mr-2" />
              {t.signReport}
            </Button>

            {/* Send Notifications Button */}
            <Button
              onClick={handleSendNotifications}
              disabled={sendMutation.isPending}
              variant="secondary"
              className="w-full"
              data-testid="button-send-annual"
            >
              <Send className="h-4 w-4 mr-2" />
              {t.sendNotifications}
            </Button>

            {/* Archive Button */}
            <Button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              variant="outline"
              className="w-full"
              data-testid="button-archive-annual"
            >
              <Archive className="h-4 w-4 mr-2" />
              {t.archiveReport}
            </Button>

            {/* Status Info */}
            <div className="text-sm text-gray-600">
              <div>{t.status}: {t[reportData.status as keyof typeof t] || reportData.status || t.draft}</div>
              {reportData.verificationCode && (
                <div>Code: {reportData.verificationCode}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Status */}
      {(signatures.parent || signatures.teacher || signatures.headmaster) && (
        <Card>
          <CardHeader>
            <CardTitle>{t.signatures}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signatures.parent && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t.parentSignature}</span>
                </div>
              )}
              {signatures.teacher && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t.teacherSignature}</span>
                </div>
              )}
              {signatures.headmaster && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t.principalSignature}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Annual Report Preview with PDF Button */}
      {isPreviewMode && reportData && (
        <BulletinPrint documentTitle={`rapport-annuel-${reportData.student?.name?.replace(/\s+/g, '-')}`}>
          <AnnualReportSheet
            student={reportData.student}
            schoolInfo={reportData.schoolInfo}
            academicYear={reportData.academicYear}
            trimesterData={reportData.trimesterData}
            annualSummary={reportData.annualSummary}
            language={reportData.language}
          />
        </BulletinPrint>
      )}

      {/* Edit Mode (placeholder for future implementation) */}
      {!isPreviewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Édition du Rapport Annuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Fonctionnalité d'édition à implémenter selon les besoins spécifiques.
              </div>
              <Button onClick={() => setIsPreviewMode(true)}>
                Retour à l'aperçu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}