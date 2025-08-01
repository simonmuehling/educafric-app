import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  User,
  BookOpen,
  Clock,
  AlertCircle,
  Download,
  Upload,
  PenTool,
  Users,
  Building,
  QrCode,
  Shield,
  Image,
  Signature
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { generateBulletinPDF } from '@/utils/bulletinPdfGenerator';

interface PendingBulletin {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  teacherId: number;
  teacherName: string;
  period: string;
  academicYear: string;
  status: string;
  submittedAt: string;
  generalAverage: number;
}

interface SchoolBranding {
  id: number;
  schoolId: number;
  schoolName: string;
  logoUrl: string;
  directorSignatureUrl: string;
  principalSignatureUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  footerText: string;
  useWatermark: boolean;
  watermarkText: string;
}

interface BatchSignature {
  id: number;
  batchSignatureId: string;
  signatureType: 'individual' | 'batch_class' | 'batch_school';
  classId?: number;
  className?: string;
  classesAffected?: number[];
  signerName: string;
  signedAt: string;
  bulletinCount: number;
  period: string;
  academicYear: string;
}

const BulletinFinalizer: React.FC = () => {
  const [pendingBulletins, setPendingBulletins] = useState<PendingBulletin[]>([]);
  const [schoolBranding, setSchoolBranding] = useState<SchoolBranding | null>(null);
  const [batchSignatures, setBatchSignatures] = useState<BatchSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBulletins, setSelectedBulletins] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPendingBulletins();
    fetchSchoolBranding();
    fetchBatchSignatures();
  }, []);

  const fetchPendingBulletins = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/bulletins/pending');
      const data = await response.json();
      setPendingBulletins(data);
    } catch (error) {
      console.error('Error fetching pending bulletins:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors du chargement des bulletins en attente' 
          : 'Error loading pending bulletins',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolBranding = async () => {
    try {
      const response = await apiRequest('GET', '/api/school/1/branding');
      const data = await response.json();
      setSchoolBranding(data);
    } catch (error) {
      console.error('Error fetching school branding:', error);
    }
  };

  const fetchBatchSignatures = async () => {
    try {
      const response = await apiRequest('GET', '/api/school/1/batch-signatures');
      const data = await response.json();
      setBatchSignatures(data);
    } catch (error) {
      console.error('Error fetching batch signatures:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files || event.target.(Array.isArray(files) ? files.length : 0) === 0) return;

    const file = event?.target?.files[0];
    const formData = new FormData();
    formData.append('logo', file);

    try {
      setUploadingLogo(true);
      const response = await fetch('/api/school/1/branding/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: language === 'fr' ? 'Logo mis à jour' : 'Logo Updated',
          description: language === 'fr' 
            ? 'Le logo de l\'école a été mis à jour avec succès' 
            : 'School logo has been updated successfully'
        });
        fetchSchoolBranding();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors du téléchargement du logo' 
          : 'Error uploading logo',
        variant: 'destructive'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files || event.target.(Array.isArray(files) ? files.length : 0) === 0) return;

    const file = event?.target?.files[0];
    const formData = new FormData();
    formData.append('signature', file);

    try {
      setUploadingSignature(true);
      const response = await fetch('/api/school/1/signatures/director', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Signature mise à jour' : 'Signature Updated',
          description: language === 'fr' 
            ? 'Votre signature a été mise à jour avec succès' 
            : 'Your signature has been updated successfully'
        });
        fetchSchoolBranding();
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors du téléchargement de la signature' 
          : 'Error uploading signature',
        variant: 'destructive'
      });
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleBatchSignClass = async (classId: number) => {
    try {
      const response = await apiRequest('POST', `/api/bulletins/batch-sign/class/${classId}`, {
        period: 'trimestre1',
        academicYear: '2024-2025'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: language === 'fr' ? 'Signature en lot réussie' : 'Batch Signature Successful',
          description: language === 'fr' 
            ? `${data.bulletinCount} bulletins signés pour la classe` 
            : `${data.bulletinCount} bulletins signed for the class`
        });
        fetchBatchSignatures();
        fetchPendingBulletins();
      }
    } catch (error) {
      console.error('Error batch signing class:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de la signature en lot' 
          : 'Error with batch signing',
        variant: 'destructive'
      });
    }
  };

  const handleBatchSignSchool = async () => {
    if ((Array.isArray(selectedClasses) ? selectedClasses.length : 0) === 0) {
      toast({
        title: language === 'fr' ? 'Sélection requise' : 'Selection Required',
        description: language === 'fr' 
          ? 'Veuillez sélectionner au moins une classe' 
          : 'Please select at least one class',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/bulletins/batch-sign/school', {
        classIds: selectedClasses,
        period: 'trimestre1',
        academicYear: '2024-2025'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: language === 'fr' ? 'Signature école complète' : 'School Signature Complete',
          description: language === 'fr' 
            ? `${data.bulletinCount} bulletins signés dans ${(Array.isArray(selectedClasses) ? selectedClasses.length : 0)} classes` 
            : `${data.bulletinCount} bulletins signed across ${(Array.isArray(selectedClasses) ? selectedClasses.length : 0)} classes`
        });
        fetchBatchSignatures();
        fetchPendingBulletins();
        setSelectedClasses([]);
      }
    } catch (error) {
      console.error('Error batch signing school:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de la signature de l\'école' 
          : 'Error with school signature',
        variant: 'destructive'
      });
    }
  };

  const handleApprove = async (bulletinId: number) => {
    try {
      const response = await apiRequest('PATCH', `/api/bulletins/${bulletinId}/approve`, {
        action: 'approved',
        comment
      });
      
      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Bulletin approuvé' : 'Bulletin Approved',
          description: language === 'fr' 
            ? 'Le bulletin a été approuvé avec succès' 
            : 'Bulletin has been approved successfully'
        });
        fetchPendingBulletins();
        setComment('');
      }
    } catch (error) {
      console.error('Error approving bulletin:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de l\'approbation du bulletin' 
          : 'Error approving bulletin',
        variant: 'destructive'
      });
    }
  };

  const generateBulletinWithBranding = async (bulletin: PendingBulletin) => {
    try {
      if (!schoolBranding) {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' 
            ? 'Configuration de l\'école non trouvée'
            : 'School branding not found',
          variant: 'destructive'
        });
        return;
      }

      // Mock data for demonstration - in production, this would come from API
      const bulletinData = {
        student: {
          id: bulletin.studentId,
          name: bulletin.studentName,
          class: bulletin.className
        },
        subjects: [
          { name: 'Mathématiques', grade: 16, coefficient: 4, teacher: 'M. Dupont', comment: 'Excellent travail' },
          { name: 'Français', grade: 14, coefficient: 4, teacher: 'Mme Martin', comment: 'Peut mieux faire' },
          { name: 'Anglais', grade: 15, coefficient: 3, teacher: 'Mrs Johnson', comment: 'Good progress' },
          { name: 'Sciences', grade: 17, coefficient: 3, teacher: 'Dr. Kamga', comment: 'Très bon niveau' },
          { name: 'Histoire', grade: 13, coefficient: 2, teacher: 'M. Biya', comment: 'Satisfaisant' }
        ],
        period: bulletin.period,
        academicYear: bulletin.academicYear,
        generalAverage: bulletin.generalAverage,
        classRank: Math.floor(Math.random() * 30) + 1,
        totalStudents: 32,
        teacherComments: 'L\'élève montre de bonnes capacités et un intérêt constant pour les études.',
        directorComments: 'Résultats encourageants. Continuez vos efforts.',
        verificationCode: `EDU${Date.now().toString().slice(-8)}`,
        schoolBranding: {
          schoolName: schoolBranding.schoolName,
          logoUrl: schoolBranding.logoUrl,
          directorSignatureUrl: schoolBranding.directorSignatureUrl,
          principalSignatureUrl: schoolBranding.principalSignatureUrl,
          primaryColor: schoolBranding.primaryColor,
          secondaryColor: schoolBranding.secondaryColor,
          footerText: schoolBranding.footerText,
          useWatermark: schoolBranding.useWatermark,
          watermarkText: schoolBranding.watermarkText
        },
        signatures: [
          {
            signerName: 'Dr. Marie KAMGA',
            signerRole: 'director',
            signedAt: new Date().toISOString(),
            digitalSignatureHash: `DSH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            verificationCode: `VER_${Date.now().toString().slice(-6)}`,
            signatureImageUrl: schoolBranding.directorSignatureUrl
          }
        ]
      };

      const pdf = await generateBulletinPDF(bulletinData, language);
      const fileName = `bulletin-${bulletin?.studentName?.replace(/\s+/g, '_')}-${bulletin.period}-${bulletin.academicYear}.pdf`;
      pdf.save(fileName);

      toast({
        title: language === 'fr' ? 'PDF généré' : 'PDF generated',
        description: language === 'fr' 
          ? `Bulletin de ${bulletin.studentName} téléchargé avec succès`
          : `${bulletin.studentName}'s bulletin downloaded successfully`
      });

    } catch (error) {
      console.error('Error generating bulletin PDF:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de la génération du PDF'
          : 'Error generating PDF',
        variant: 'destructive'
      });
    }
  };

  const uniqueClasses = Array.from(new Set((Array.isArray(pendingBulletins) ? pendingBulletins : []).map(b => b.classId)))
    .map(classId => {
      const bulletin = pendingBulletins.find(b => b.classId === classId)!;
      return {
        id: classId,
        name: bulletin.className,
        bulletinCount: (Array.isArray(pendingBulletins) ? pendingBulletins : []).filter(b => b.classId === classId).length
      };
    });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bulletins" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulletins" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {language === 'fr' ? 'Bulletins' : 'Bulletins'}
          </TabsTrigger>
          <TabsTrigger value="signatures" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            {language === 'fr' ? 'Signatures' : 'Signatures'}
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            {language === 'fr' ? 'Identité' : 'Branding'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulletins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {language === 'fr' ? 'Bulletins en Attente d\'Approbation' : 'Bulletins Pending Approval'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="mb-4">
                {(Array.isArray(pendingBulletins) ? pendingBulletins.length : 0)} {language === 'fr' ? 'bulletins en attente' : 'pending bulletins'}
              </Badge>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (Array.isArray(pendingBulletins) ? pendingBulletins.length : 0) === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {language === 'fr' 
                      ? 'Aucun bulletin en attente d\'approbation' 
                      : 'No bulletins pending approval'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(pendingBulletins) ? pendingBulletins : []).map((bulletin) => (
                    <Card key={bulletin.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-3 gap-4 items-center">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {bulletin.studentName}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {bulletin.className}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {bulletin.period} - {bulletin.academicYear}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === 'fr' ? 'Enseignant' : 'Teacher'}: {bulletin.teacherName}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {language === 'fr' ? 'Soumis le' : 'Submitted'}: {new Date(bulletin.submittedAt).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary">
                              {language === 'fr' ? 'Moyenne' : 'Average'}: {bulletin.generalAverage}/20
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(bulletin.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Approuver' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateBulletinWithBranding(bulletin)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Batch Sign by Class */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {language === 'fr' ? 'Signature par Classe' : 'Sign by Class'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Array.isArray(uniqueClasses) ? uniqueClasses : []).map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{cls.name || ''}</h4>
                      <p className="text-sm text-gray-600">
                        {cls.bulletinCount} {language === 'fr' ? 'bulletins' : 'bulletins'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBatchSignClass(cls.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Signature className="w-4 h-4 mr-1" />
                      {language === 'fr' ? 'Signer' : 'Sign'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Batch Sign Multiple Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {language === 'fr' ? 'Signature École Complète' : 'Full School Signature'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(Array.isArray(uniqueClasses) ? uniqueClasses : []).map((cls) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${cls.id}`}
                        checked={selectedClasses.includes(cls.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses((Array.isArray(selectedClasses) ? selectedClasses : []).filter(id => id !== cls.id));
                          }
                        }}
                      />
                      <Label htmlFor={`class-${cls.id}`} className="text-sm">
                        {cls.name || ''} ({cls.bulletinCount} bulletins)
                      </Label>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleBatchSignSchool}
                  disabled={(Array.isArray(selectedClasses) ? selectedClasses.length : 0) === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Signature className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Signer Toutes les Classes' : 'Sign All Classes'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Batch Signatures History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {language === 'fr' ? 'Historique des Signatures' : 'Signature History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Array.isArray(batchSignatures) ? batchSignatures : []).map((signature) => (
                  <div key={signature.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{signature.signerName}</p>
                      <p className="text-sm text-gray-600">
                        {signature.signatureType === 'batch_class' ? signature.className : `${signature.classesAffected?.length} classes`}
                        - {signature.bulletinCount} bulletins
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signature.signedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={signature.signatureType === 'batch_school' ? 'default' : 'secondary'}>
                      {signature.signatureType === 'batch_school' ? 'École' : 'Classe'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* School Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  {language === 'fr' ? 'Logo de l\'École' : 'School Logo'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {schoolBranding?.logoUrl && (
                  <div className="text-center">
                    <img 
                      src={schoolBranding.logoUrl} 
                      alt="School Logo" 
                      className="h-20 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">{schoolBranding.schoolName}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="logo-upload">
                    {language === 'fr' ? 'Télécharger un nouveau logo' : 'Upload new logo'}
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && (
                    <p className="text-sm text-blue-600 mt-1">
                      {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Director Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  {language === 'fr' ? 'Signature du Directeur' : 'Director Signature'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {schoolBranding?.directorSignatureUrl && (
                  <div className="text-center p-4 border border-gray-200 rounded">
                    <img 
                      src={schoolBranding.directorSignatureUrl} 
                      alt="Director Signature" 
                      className="h-16 mx-auto"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="signature-upload">
                    {language === 'fr' ? 'Télécharger votre signature' : 'Upload your signature'}
                  </Label>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    disabled={uploadingSignature}
                  />
                  {uploadingSignature && (
                    <p className="text-sm text-blue-600 mt-1">
                      {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulletinFinalizer;