import React, { useState } from 'react';
import { FileText, Plus, Search, Download, Edit, Trash2, Eye, Upload, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  uploadedBy: string;
  downloads: number;
}

const FunctionalSiteAdminDocuments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/admin/documents'],
    queryFn: async () => {
      // Mock data for demonstration - replace with real API
      return [
        {
          id: 1,
          name: 'Contrat École Primaire Central.pdf',
          type: 'PDF',
          category: 'Contrats',
          size: '2.4 MB',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          status: 'active',
          uploadedBy: 'Marie Ngono',
          downloads: 156
        },
        {
          id: 2,
          name: 'Rapport Financier Q4 2024.xlsx',
          type: 'Excel',
          category: 'Finances',
          size: '1.8 MB',
          createdAt: '2024-12-31T16:45:00Z',
          updatedAt: '2025-01-02T09:15:00Z',
          status: 'active',
          uploadedBy: 'Simon Admin',
          downloads: 89
        },
        {
          id: 3,
          name: 'Politique Confidentialité EDUCAFRIC.docx',
          type: 'Word',
          category: 'Légal',
          size: '856 KB',
          createdAt: '2024-11-20T14:20:00Z',
          updatedAt: '2024-12-15T11:30:00Z',
          status: 'active',
          uploadedBy: 'Paul Kamdem',
          downloads: 234
        },
        {
          id: 4,
          name: 'Guide Utilisateur Parent.pdf',
          type: 'PDF',
          category: 'Documentation',
          size: '3.2 MB',
          createdAt: '2024-10-10T08:00:00Z',
          updatedAt: '2024-11-05T13:45:00Z',
          status: 'active',
          uploadedBy: 'Marie Ngono',
          downloads: 421
        }
      ];
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: number) => {
      const response = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
    }
  });

  const filteredDocuments = documents?.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDeleteDocument = (docId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      deleteDocumentMutation.mutate(docId);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Contrats': 'bg-blue-100 text-blue-800',
      'Finances': 'bg-green-100 text-green-800',
      'Légal': 'bg-red-100 text-red-800',
      'Documentation': 'bg-purple-100 text-purple-800',
      'Rapports': 'bg-orange-100 text-orange-800',
      'Divers': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'word':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement des documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des documents</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-green-600" />
            Gestion des Documents
            <Badge variant="secondary" className="ml-2">
              {filteredDocuments.length} documents
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger Document
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-documents"
            />
          </div>
          <div className="relative">
            <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="select-filter-category"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Contrats">Contrats</option>
              <option value="Finances">Finances</option>
              <option value="Légal">Légal</option>
              <option value="Documentation">Documentation</option>
              <option value="Rapports">Rapports</option>
              <option value="Divers">Divers</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Document</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Catégorie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Taille</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Téléchargements</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Modifié</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document: Document) => (
                <tr key={document.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`row-document-${document.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {getFileTypeIcon(document.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {document.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          par {document.uploadedBy}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getCategoryBadgeColor(document.category)}>
                      {document.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {document.size}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {document.downloads}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(document.updatedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        data-testid={`button-view-${document.id}`}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        data-testid={`button-download-${document.id}`}
                      >
                        <Download className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        data-testid={`button-edit-${document.id}`}
                      >
                        <Edit className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-delete-${document.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun document trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Document Categories Summary */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Contrats', 'Finances', 'Légal', 'Documentation', 'Rapports', 'Divers'].map((category) => {
            const count = documents?.filter((doc: Document) => doc.category === category).length || 0;
            return (
              <Card key={category} className="text-center p-4">
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionalSiteAdminDocuments;