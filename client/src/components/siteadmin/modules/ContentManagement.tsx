import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Plus,
  File,
  Image,
  Video,
  Music,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  HardDrive,
  Folder,
  FolderOpen
} from 'lucide-react';

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  downloadCount: number;
  isPublic: boolean;
  description?: string;
}

const ContentManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const text = {
    fr: {
      title: 'Gestion Contenu & Documents',
      subtitle: 'Administration complète du contenu système',
      searchDocuments: 'Rechercher documents...',
      uploadDocument: 'Télécharger Document',
      addDocument: 'Ajouter Document',
      exportDocuments: 'Exporter Documents',
      totalDocuments: 'Total Documents',
      totalSize: 'Taille Totale',
      recentUploads: 'Uploads Récents',
      filterByCategory: 'Filtrer par Catégorie',
      filterByType: 'Filtrer par Type',
      allCategories: 'Toutes Catégories',
      allTypes: 'Tous Types',
      academic: 'Académique',
      administrative: 'Administratif',
      marketing: 'Marketing',
      legal: 'Légal',
      financial: 'Financier',
      technical: 'Technique',
      document: 'Document',
      image: 'Image',
      video: 'Vidéo',
      audio: 'Audio',
      archive: 'Archive',
      other: 'Autre',
      fileName: 'Nom Fichier',
      type: 'Type',
      size: 'Taille',
      createdBy: 'Créé par',
      createdAt: 'Créé le',
      downloads: 'Téléchargements',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      download: 'Télécharger',
      preview: 'Aperçu',
      share: 'Partager',
      bulkActions: 'Actions Groupées',
      deleteSelected: 'Supprimer Sélectionnés',
      public: 'Public',
      private: 'Privé',
      documentDetails: 'Détails Document',
      documentInfo: 'Informations Document',
      tags: 'Tags',
      description: 'Description',
      category: 'Catégorie',
      visibility: 'Visibilité',
      uploadProgress: 'Progression Upload',
      uploading: 'Upload en cours...',
      uploadComplete: 'Upload terminé',
      uploadFailed: 'Échec upload',
      loading: 'Chargement...',
      noDocuments: 'Aucun document trouvé',
      confirmDelete: 'Confirmer la suppression',
      deleteDocumentConfirm: 'Êtes-vous sûr de vouloir supprimer ce document ?',
      documentDeleted: 'Document supprimé',
      documentUpdated: 'Document mis à jour',
      documentUploaded: 'Document téléchargé',
      error: 'Erreur',
      success: 'Succès',
      bytes: 'octets',
      kb: 'Ko',
      mb: 'Mo',
      gb: 'Go',
      selectFile: 'Sélectionner Fichier',
      dragDropFiles: 'Glisser-déposer des fichiers ici',
      or: 'ou',
      maxFileSize: 'Taille max: 50MB',
      supportedFormats: 'Formats supportés: PDF, DOC, XLS, PPT, IMG, VID',
      documentQueue: 'File Documents',
      queueEmpty: 'Aucun document en attente',
      addToQueue: 'Ajouter à la File',
      processQueue: 'Traiter la File',
      queueProcessed: 'File traitée'
    },
    en: {
      title: 'Content & Document Management',
      subtitle: 'Complete system content administration',
      searchDocuments: 'Search documents...',
      uploadDocument: 'Upload Document',
      addDocument: 'Add Document',
      exportDocuments: 'Export Documents',
      totalDocuments: 'Total Documents',
      totalSize: 'Total Size',
      recentUploads: 'Recent Uploads',
      filterByCategory: 'Filter by Category',
      filterByType: 'Filter by Type',
      allCategories: 'All Categories',
      allTypes: 'All Types',
      academic: 'Academic',
      administrative: 'Administrative',
      marketing: 'Marketing',
      legal: 'Legal',
      financial: 'Financial',
      technical: 'Technical',
      document: 'Document',
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      archive: 'Archive',
      other: 'Other',
      fileName: 'File Name',
      type: 'Type',
      size: 'Size',
      createdBy: 'Created By',
      createdAt: 'Created At',
      downloads: 'Downloads',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      download: 'Download',
      preview: 'Preview',
      share: 'Share',
      bulkActions: 'Bulk Actions',
      deleteSelected: 'Delete Selected',
      public: 'Public',
      private: 'Private',
      documentDetails: 'Document Details',
      documentInfo: 'Document Information',
      tags: 'Tags',
      description: 'Description',
      category: 'Category',
      visibility: 'Visibility',
      uploadProgress: 'Upload Progress',
      uploading: 'Uploading...',
      uploadComplete: 'Upload complete',
      uploadFailed: 'Upload failed',
      loading: 'Loading...',
      noDocuments: 'No documents found',
      confirmDelete: 'Confirm Deletion',
      deleteDocumentConfirm: 'Are you sure you want to delete this document?',
      documentDeleted: 'Document deleted',
      documentUpdated: 'Document updated',
      documentUploaded: 'Document uploaded',
      error: 'Error',
      success: 'Success',
      bytes: 'bytes',
      kb: 'KB',
      mb: 'MB',
      gb: 'GB',
      selectFile: 'Select File',
      dragDropFiles: 'Drag and drop files here',
      or: 'or',
      maxFileSize: 'Max size: 50MB',
      supportedFormats: 'Supported: PDF, DOC, XLS, PPT, IMG, VID',
      documentQueue: 'Document Queue',
      queueEmpty: 'No documents in queue',
      addToQueue: 'Add to Queue',
      processQueue: 'Process Queue',
      queueProcessed: 'Queue processed'
    }
  };

  const t = text[language];

  // Fetch documents with filtering and pagination
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/documents', { 
      search: searchTerm, 
      category: categoryFilter, 
      type: typeFilter, 
      page: currentPage 
    }],
    queryFn: () => apiRequest('GET', `/api/admin/documents?search=${encodeURIComponent(searchTerm)}&category=${categoryFilter}&type=${typeFilter}&page=${currentPage}&limit=20`)
  });

  // Document statistics
  const { data: documentStats } = useQuery({
    queryKey: ['/api/admin/document-stats'],
    queryFn: () => apiRequest('GET', '/api/admin/document-stats')
  });

  // Document queue
  const { data: documentQueue } = useQuery({
    queryKey: ['/api/admin/document-queue'],
    queryFn: () => apiRequest('GET', '/api/admin/document-queue')
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload!.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', '/api/admin/documents/upload');
        xhr.send(formData);
      });
    },
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.documentUploaded
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-queue'] });
      setIsUploading(false);
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.uploadFailed,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) => apiRequest('DELETE', `/api/admin/documents/${documentId}`),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.documentDeleted
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-stats'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Failed to delete document',
        variant: "destructive"
      });
    }
  });

  // Process document queue mutation
  const processQueueMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/document-queue/process'),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.queueProcessed
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 ' + t.bytes;
    const k = 1024;
    const sizes = [t.bytes, t.kb, t.mb, t.gb];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="w-4 h-4 text-green-500" />;
    if (fileType.includes('video')) return <Video className="w-4 h-4 text-blue-500" />;
    if (fileType.includes('audio')) return <Music className="w-4 h-4 text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-4 h-4 text-orange-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'academic': 'bg-blue-100 text-blue-800',
      'administrative': 'bg-green-100 text-green-800',
      'marketing': 'bg-purple-100 text-purple-800',
      'legal': 'bg-red-100 text-red-800',
      'financial': 'bg-yellow-100 text-yellow-800',
      'technical': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;
    if (!files || (Array.isArray(files) ? files.length : 0) === 0) return;

    const file = files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      toast({
        title: t.error,
        description: `File too large. ${t.maxFileSize}`,
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', categoryFilter !== 'all' ? categoryFilter : 'academic');
    formData.append('isPublic', 'false');

    uploadDocumentMutation.mutate(formData);
  };

  const handleDeleteDocument = (documentId: number) => {
    if (confirm(t.deleteDocumentConfirm)) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const renderDocumentStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(documentStats as any)?.totalDocuments || 0}</div>
            <div className="text-sm text-gray-600">{t.totalDocuments}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <HardDrive className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {formatFileSize((documentStats as any)?.totalSize || 0)}
            </div>
            <div className="text-sm text-gray-600">{t.totalSize}</div>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{(documentStats as any)?.recentUploads || 0}</div>
            <div className="text-sm text-gray-600">{t.recentUploads}</div>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderUploadArea = () => (
    <ModernCard className="p-6 mb-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.uploadDocument}</h3>
          <p className="text-gray-600 mb-4">{t.dragDropFiles}</p>
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.uploading}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.selectFile}
              </label>
              <div className="text-sm text-gray-500">
                <div>{t.maxFileSize}</div>
                <div>{t.supportedFormats}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );

  const renderDocumentQueue = () => (
    <ModernCard className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="w-5 h-5" />
          {t.documentQueue}
        </h3>
        <Button
          onClick={() => processQueueMutation.mutate()}
          disabled={processQueueMutation.isPending || !(documentQueue as any)?.documents?.length}
          size="sm"
        >
          {processQueueMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.processQueue}
            </>
          )}
        </Button>
      </div>
      
      {(documentQueue as any)?.documents?.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          {t.queueEmpty}
        </div>
      ) : (
        <div className="space-y-2">
          {(documentQueue as any)?.documents?.map((doc: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.fileType)}
                <div>
                  <div className="font-medium">{doc.fileName}</div>
                  <div className="text-sm text-gray-600">{formatFileSize(doc.fileSize)}</div>
                </div>
              </div>
              <Badge variant="secondary">En attente</Badge>
            </div>
          ))}
        </div>
      )}
    </ModernCard>
  );

  const renderFilters = () => (
    <ModernCard className="p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.searchDocuments}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allCategories}</option>
            <option value="academic">{t.academic}</option>
            <option value="administrative">{t.administrative}</option>
            <option value="marketing">{t.marketing}</option>
            <option value="legal">{t.legal}</option>
            <option value="financial">{t.financial}</option>
            <option value="technical">{t.technical}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e?.target?.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">{t.allTypes}</option>
            <option value="document">{t.document}</option>
            <option value="image">{t.image}</option>
            <option value="video">{t.video}</option>
            <option value="audio">{t.audio}</option>
            <option value="archive">{t.archive}</option>
          </select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportDocuments}
          </Button>
        </div>
      </div>
    </ModernCard>
  );

  const renderDocumentTable = () => (
    <ModernCard className="p-6">
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Error loading documents</p>
          </div>
        ) : (documentsData as any)?.documents?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noDocuments}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        setSelectedDocuments((documentsData as any)?.documents?.map((d: Document) => d.id) || []);
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4">{t.title || ''}</th>
                <th className="text-left py-3 px-4">{t.type}</th>
                <th className="text-left py-3 px-4">{t.size}</th>
                <th className="text-left py-3 px-4">{t.createdBy}</th>
                <th className="text-left py-3 px-4">{t.createdAt}</th>
                <th className="text-left py-3 px-4">{t.downloads}</th>
                <th className="text-left py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(documentsData as any)?.documents?.map((document: Document) => (
                <tr key={document.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedDocuments([...selectedDocuments, document.id]);
                        } else {
                          setSelectedDocuments((Array.isArray(selectedDocuments) ? selectedDocuments : []).filter(id => id !== document.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.fileType)}
                      <div>
                        <div className="font-medium">{document.title || ''}</div>
                        <div className="text-sm text-gray-600">{document.fileName}</div>
                        <Badge className={getCategoryColor(document.category)} variant="outline">
                          {document.category}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{document.fileType}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {formatFileSize(document.fileSize)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {document.createdBy}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(document.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-500" />
                      {document.downloadCount}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ModernCard>
  );

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion du contenu.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      {renderDocumentStats()}

      {/* Upload Area */}
      {renderUploadArea()}

      {/* Document Queue */}
      {renderDocumentQueue()}

      {/* Filters */}
      {renderFilters()}

      {/* Document Table */}
      {renderDocumentTable()}
    </div>
  );
};

export default ContentManagement;