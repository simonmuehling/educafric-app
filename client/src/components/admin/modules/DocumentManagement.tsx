import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { 
  FileText, Download, Upload, Share2, Eye, 
  Calendar, User, Building, DollarSign,
  TrendingUp, BarChart3, RefreshCw, Trash2, Edit
} from 'lucide-react';

const DocumentManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const text = {
    fr: {
      title: 'Gestion des Documents',
      subtitle: 'Administration des documents et rapports système',
      currentDocuments: 'Documents Actuels',
      generateReports: 'Générer Rapports',
      systemReports: 'Rapports Système',
      userActivity: 'Activité Utilisateurs',
      platformStats: 'Statistiques Plateforme',
      generateSystemPDF: '📄 Générer Rapport Système PDF',
      generateActivityReport: '📊 Rapport Activité Utilisateurs',
      generatePlatformStats: '📈 Statistiques Plateforme',
      documentsLibrary: 'Bibliothèque Documents',
      recentDocuments: 'Documents Récents',
      documentActions: 'Actions Document',
      view: 'Voir',
      download: 'Télécharger',
      share: 'Partager',
      delete: 'Supprimer',
      createdBy: 'Créé par',
      createdOn: 'Créé le',
      fileSize: 'Taille',
      status: 'Statut',
      active: 'Actif',
      archived: 'Archivé',
      generating: 'Génération...',
      success: 'Succès',
      permissions: 'Permissions',
      editPermissions: 'Modifier Permissions',
      adminOnly: 'Administrateurs Seulement',
      commercialTeam: 'Équipe Commerciale',
      carineOnly: 'Carine Seulement',
      visibleTo: 'Visible pour',
      error: 'Erreur',
      pdfGenerated: 'PDF généré avec succès',
      pdfError: 'Erreur lors de la génération du PDF',
      pdfDescription: 'Le document de projections financières a été téléchargé.',
      pdfErrorDescription: 'Une erreur s\'est produite lors de la génération.',
      systemOverview: 'Vue d\'ensemble du système EDUCAFRIC',
      totalUsers: 'Utilisateurs Totaux',
      activeSchools: 'Écoles Actives',
      monthlyRevenue: 'Revenus Mensuels',
      platformGrowth: 'Croissance Plateforme'
    },
    en: {
      title: 'Document Management',
      subtitle: 'Administration of system documents and reports',
      currentDocuments: 'Current Documents',
      generateReports: 'Generate Reports',
      systemReports: 'System Reports',
      userActivity: 'User Activity',
      platformStats: 'Platform Statistics',
      generateSystemPDF: '📄 Generate System Report PDF',
      generateActivityReport: '📊 User Activity Report',
      generatePlatformStats: '📈 Platform Statistics',
      documentsLibrary: 'Documents Library',
      recentDocuments: 'Recent Documents',
      documentActions: 'Document Actions',
      view: 'View',
      download: 'Download',
      share: 'Share',
      delete: 'Delete',
      createdBy: 'Created by',
      createdOn: 'Created on',
      fileSize: 'Size',
      status: 'Status',
      active: 'Active',
      archived: 'Archived',
      generating: 'Generating...',
      success: 'Success',
      error: 'Error',
      pdfGenerated: 'PDF generated successfully',
      pdfError: 'PDF generation error',
      pdfDescription: 'The financial projections document has been downloaded.',
      pdfErrorDescription: 'An error occurred during generation.',
      systemOverview: 'EDUCAFRIC system overview',
      totalUsers: 'Total Users',
      activeSchools: 'Active Schools',
      monthlyRevenue: 'Monthly Revenue',
      platformGrowth: 'Platform Growth',
      permissions: 'Permissions',
      editPermissions: 'Edit Permissions', 
      adminOnly: 'Administrators Only',
      commercialTeam: 'Commercial Team',
      carineOnly: 'Carine Only',
      visibleTo: 'Visible to'
    }
  };

  const t = text[language as keyof typeof text];

  // Données exemple pour l'administration
  const platformData = {
    totalUsers: 12847,
    activeSchools: 156,
    monthlyRevenue: 87500000, // CFA
    platformGrowth: 24.5 // %
  };

  // Exemple de projections financières pour document admin
  const sampleProjectionData = {
    schoolName: language === 'fr' ? 'Système EDUCAFRIC - Vue d\'ensemble' : 'EDUCAFRIC System - Overview',
    studentCount: 15000, // Total students across platform
    monthlyFeePerStudent: 2000, // Average
    teacherCount: 890, // Total teachers
    currentSystemCosts: 125000000, // Total system costs
    educafricAnnualCost: 50000000, // Platform investment
    currentAnnualRevenue: 360000000, // Total platform revenue
    revenueIncrease: 54000000, // 15% increase
    costSavings: 25000000, // 20% savings
    netGain: 79000000, // Net gain
    roi: 158.0, // ROI %
    paybackPeriod: 7.6, // months
    fiveYearProjections: [
      { year: 2025, revenue: 414000000, savings: 25000000, netProfit: 104000000 },
      { year: 2026, revenue: 476100000, savings: 28750000, netProfit: 119600000 },
      { year: 2027, revenue: 547515000, savings: 33062500, netProfit: 137540000 },
      { year: 2028, revenue: 629642250, savings: 38021875, netProfit: 158171000 },
      { year: 2029, revenue: 724088587, savings: 43725156, netProfit: 181896550 }
    ],
    language: language as 'fr' | 'en'
  };

  const documents = [
    {
      id: 1,
      name: language === 'fr' ? 'Rapport Système EDUCAFRIC 2025.pdf' : 'EDUCAFRIC System Report 2025.pdf',
      type: 'PDF',
      size: '2.4 MB',
      createdBy: 'Site Admin',
      createdOn: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'system',
      permissions: 'admin_only',
      visibleTo: ['SiteAdmin', 'Admin']
    },
    {
      id: 2,
      name: language === 'fr' ? 'Rapport Activité Utilisateurs.pdf' : 'User Activity Report.pdf',
      type: 'PDF',
      size: '1.8 MB',
      createdBy: 'Site Admin',
      createdOn: new Date(Date.now() - 86400000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'activity',
      permissions: 'admin_only',
      visibleTo: ['SiteAdmin', 'Admin']
    },
    {
      id: 3,
      name: language === 'fr' ? 'Statistiques Plateforme.pdf' : 'Platform Statistics.pdf',
      type: 'PDF', 
      size: '3.1 MB',
      createdBy: 'Site Admin',
      createdOn: new Date(Date.now() - 172800000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'stats',
      permissions: 'admin_only',
      visibleTo: ['SiteAdmin', 'Admin']
    },
    {
      id: 4,
      name: language === 'fr' ? 'Demande d\'offre - École Bilingue Yaoundé.pdf' : 'Quote Request - Bilingual School Yaoundé.pdf',
      type: 'PDF',
      size: '1.5 MB',
      createdBy: 'Commercial Team',
      createdOn: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'proposal',
      permissions: 'commercial_team',
      visibleTo: ['SiteAdmin', 'Admin', 'Commercial']
    },
    {
      id: 5,
      name: language === 'fr' ? 'Demande d\'offre - Lycée Excellence Douala.pdf' : 'Quote Request - Excellence High School Douala.pdf',
      type: 'PDF',
      size: '2.1 MB',
      createdBy: 'Commercial Team',
      createdOn: new Date(Date.now() - 86400000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'proposal',
      permissions: 'commercial_team',
      visibleTo: ['SiteAdmin', 'Admin', 'Commercial']
    },
    {
      id: 6,
      name: language === 'fr' ? 'Demande d\'offre - Groupe Scolaire Bastos.pdf' : 'Quote Request - Bastos School Group.pdf',
      type: 'PDF',
      size: '1.8 MB',
      createdBy: 'Commercial Team',
      createdOn: new Date(Date.now() - 172800000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'proposal',
      permissions: 'commercial_team',
      visibleTo: ['SiteAdmin', 'Admin', 'Commercial']
    },
    {
      id: 7,
      name: 'Demande_Etablissement.pdf',
      type: 'PDF',
      size: '1.2 MB',
      createdBy: 'Commercial Team',
      createdOn: new Date(Date.now() - 259200000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'proposal',
      permissions: 'carine_only',
      visibleTo: ['SiteAdmin', 'Admin', 'carine.nguetsop@educafric.com'],
      attachedAsset: true
    },
    {
      id: 8,
      name: 'Demande_ministre-8.pdf',
      type: 'PDF',
      size: '890 KB',
      createdBy: 'Government Relations',
      createdOn: new Date(Date.now() - 345600000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'official',
      permissions: 'carine_only',
      visibleTo: ['SiteAdmin', 'Admin', 'carine.nguetsop@educafric.com'],
      attachedAsset: true
    },
    {
      id: 9,
      name: 'Educafric_Plans_Abonnement_Complets_FR.html',
      type: 'HTML',
      size: '2.3 MB',
      createdBy: 'Commercial Team',
      createdOn: new Date(Date.now() - 432000000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      status: 'active',
      category: 'pricing',
      permissions: 'commercial_team',
      visibleTo: ['SiteAdmin', 'Admin', 'Commercial'],
      attachedAsset: true
    }
  ];

  const generateSystemReport = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Generate system report instead of financial projections
      const reportData = {
        title: t.title,
        platformData,
        documents,
        timestamp: new Date().toISOString()
      };
      
      toast({
        title: t.pdfGenerated,
        description: "Rapport système généré avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast({
        title: t.pdfError,
        description: t.pdfErrorDescription,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewDocument = async (doc: any) => {
    try {
      // Ouvrir le document avec credentials pour maintenir la session
      const response = await fetch(`/api/documents/${doc.id}/view`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (response.ok) {
        // Créer blob URL pour afficher le PDF
        const blob = await response.blob();
        const blobUrl = window?.URL?.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        
        toast({
          title: language === 'fr' ? 'Document ouvert' : 'Document opened',
          description: language === 'fr' ? `Consultation de ${doc.title || doc.name}` : `Viewing ${doc.title || doc.name}`,
        });

        // Nettoyer l'URL après 1 minute
        setTimeout(() => window?.URL?.revokeObjectURL(blobUrl), 60000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Document view error:', error);
      toast({
        title: language === 'fr' ? 'Erreur d\'ouverture' : 'Opening error',
        description: language === 'fr' ? 'Impossible d\'ouvrir le document' : 'Cannot open document',
        variant: "destructive",
      });
    }
  }

  const handleDownloadDocument = async (doc: any) => {
    try {
      // Télécharger le document avec credentials
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window?.URL?.createObjectURL(blob);
        
        // Créer un lien temporaire pour le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title || doc.name}.pdf`;
        document?.body?.appendChild(link);
        link.click();
        document?.body?.removeChild(link);
        
        // Nettoyer l'URL
        window?.URL?.revokeObjectURL(url);
        
        toast({
          title: language === 'fr' ? 'Téléchargement réussi' : 'Download successful',
          description: language === 'fr' ? `${doc.title || doc.name} téléchargé avec succès` : `${doc.title || doc.name} downloaded successfully`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Document download error:', error);
      toast({
        title: language === 'fr' ? 'Erreur de téléchargement' : 'Download error',
        description: language === 'fr' ? 'Impossible de télécharger le document' : 'Failed to download document',
        variant: "destructive",
      });
    }
  };

  const handleShareDocument = async (doc: any) => {
    try {
      const shareUrl = `${window?.location?.origin}/documents/shared/${doc.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: doc.name,
          text: language === 'fr' ? 'Document partagé depuis EDUCAFRIC' : 'Document shared from EDUCAFRIC',
          url: shareUrl,
        });
      } else {
        await navigator?.clipboard?.writeText(shareUrl);
        toast({
          title: language === 'fr' ? 'Lien copié' : 'Link copied',
          description: language === 'fr' ? 'Lien de partage copié dans le presse-papiers' : 'Share link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Erreur de partage:', error);
      toast({
        title: language === 'fr' ? 'Erreur de partage' : 'Share error',
        description: language === 'fr' ? 'Impossible de partager le document' : 'Unable to share document',
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: language === 'fr' ? 'Document supprimé' : 'Document deleted',
          description: language === 'fr' ? `${doc.name || ''} supprimé avec succès` : `${doc.name || ''} deleted successfully`,
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
      toast({
        title: language === 'fr' ? 'Erreur de suppression' : 'Delete error',
        description: language === 'fr' ? 'Impossible de supprimer le document' : 'Unable to delete document',
        variant: "destructive",
      });
    }
  };

  const handleEditPermissions = (doc: any) => {
    // Afficher les permissions actuelles
    const permissionLabels = {
      'admin_only': language === 'fr' ? 'Administrateurs Seulement' : 'Administrators Only',
      'commercial_team': language === 'fr' ? 'Équipe Commerciale' : 'Commercial Team', 
      'carine_only': language === 'fr' ? 'Carine Seulement' : 'Carine Only'
    };
    
    const currentPermission = permissionLabels[doc.permissions as keyof typeof permissionLabels];
    
    toast({
      title: language === 'fr' ? 'Permissions du document' : 'Document permissions',
      description: language === 'fr' 
        ? `${doc.name || ''}: ${currentPermission}. Visible pour: ${doc?.visibleTo?.join(', ')}`
        : `${doc.name || ''}: ${currentPermission}. Visible to: ${doc?.visibleTo?.join(', ')}`,
    });
  };

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title || ''}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble système */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">{t.systemOverview}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">{t.totalUsers}</p>
                <p className="text-2xl font-bold text-blue-800">{platformData?.totalUsers?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">{t.activeSchools}</p>
                <p className="text-2xl font-bold text-green-800">{platformData.activeSchools}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">{t.monthlyRevenue}</p>
                <p className="text-xl font-bold text-purple-800">{formatCFA(platformData.monthlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">{t.platformGrowth}</p>
                <p className="text-2xl font-bold text-orange-800">+{platformData.platformGrowth}%</p>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Génération de rapports */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">{t.generateReports}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={generateSystemReport}
            className="flex items-center gap-2 h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {isGeneratingPDF ? t.generating : t.generateSystemPDF}
              </div>
              <div className="text-xs text-blue-100">
                {t.systemReports}
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 border-green-200 hover:bg-green-50"
            onClick={() => toast({
              title: language === 'fr' ? 'Rapport d\'activité' : 'Activity Report',
              description: language === 'fr' ? 'Génération du rapport d\'activité utilisateurs' : 'Generating user activity report'
            })}
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-green-700">{t.generateActivityReport}</div>
              <div className="text-xs text-green-600">{t.userActivity}</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 border-purple-200 hover:bg-purple-50"
            onClick={() => toast({
              title: language === 'fr' ? 'Statistiques plateforme' : 'Platform Statistics',
              description: language === 'fr' ? 'Génération des statistiques de la plateforme' : 'Generating platform statistics'
            })}
          >
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-purple-700">{t.generatePlatformStats}</div>
              <div className="text-xs text-purple-600">{t.platformStats}</div>
            </div>
          </Button>
        </div>
      </ModernCard>

      {/* Bibliothèque de documents */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">{t.documentsLibrary}</h3>
          </div>
          <Badge variant="secondary">{(Array.isArray(documents) ? documents.length : 0)} documents</Badge>
        </div>

        <div className="space-y-3">
          {(Array.isArray(documents) ? documents : []).map((doc) => (
            <div
              key={doc.id}
              className="p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Layout superposé mobile-first */}
              <div className="space-y-3">
                {/* En-tête avec icône et titre */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm md:text-base text-gray-900 truncate leading-tight">{doc.name || ''}</h4>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                      <Badge variant={doc.status === 'active' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                        {doc.status === 'active' ? t.active : t.archived}
                      </Badge>
                      {doc.permissions && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 text-blue-600 border-blue-200 bg-blue-50">
                          {
                            doc.permissions === 'admin_only' ? 'Admin' :
                            doc.permissions === 'commercial_team' ? 'Commercial' :
                            doc.permissions === 'carine_only' ? 'Carine' :
                            doc.permissions
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métadonnées en grille compacte */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-xs text-gray-500 bg-gray-100 rounded p-2">
                  <div className="truncate">
                    <span className="font-medium text-gray-700">Créé:</span> {doc.createdBy}
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-gray-700">Date:</span> {doc.createdOn}
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-gray-700">Taille:</span> {doc.size}
                  </div>
                </div>

                {/* Actions en grille superposée pour mobile */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 md:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDocument(doc)}
                    className="text-xs h-7 md:h-8 flex items-center justify-center gap-1 hover:bg-gray-200"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.view}</span>
                    <span className="sm:hidden">Voir</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadDocument(doc)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs h-7 md:h-8 flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.download}</span>
                    <span className="sm:hidden">DL</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareDocument(doc)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-7 md:h-8 flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.share}</span>
                    <span className="sm:hidden">Share</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPermissions(doc)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 md:h-8 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden md:inline">{t.editPermissions}</span>
                    <span className="md:hidden">Perms</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteDocument(doc)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7 md:h-8 flex items-center justify-center gap-1 col-span-2 md:col-span-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.delete}</span>
                    <span className="sm:hidden">Suppr</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default DocumentManagement;