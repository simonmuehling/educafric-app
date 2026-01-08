import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Settings, Eye, Download, Share2, Search, Filter, Plus, FileText, User, Shield, Check, X, Edit, Loader2 } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  type: 'pricing' | 'policy' | 'technical' | 'training' | 'commercial' | 'administrative' | 'ministerial';
  language: 'fr' | 'en';
  size: string;
  lastModified: string;
  accessLevel: 'public' | 'commercial' | 'admin' | 'restricted';
  sharedWith: string[];
  downloadCount: number;
  description?: string;
}

interface CommercialUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  permissions: {
    [documentId: number]: {
      canView: boolean;
      canDownload: boolean;
      canShare: boolean;
    }
  };
}

const DocumentPermissionsManager: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Textes bilingues
  const text = {
    fr: {
      title: 'Gestion des Permissions Documents',
      subtitle: 'Gérez les accès aux documents pour Carine et l\'équipe commerciale',
      search: 'Rechercher documents ou utilisateurs...',
      filterByType: 'Filtrer par type',
      filterByUser: 'Filtrer par utilisateur',
      all: 'Tous',
      users: 'Utilisateurs',
      documents: 'Documents',
      permissions: 'Permissions',
      canView: 'Peut voir',
      canDownload: 'Peut télécharger',
      canShare: 'Peut partager',
      active: 'Actif',
      inactive: 'Inactif',
      lastLogin: 'Dernière connexion',
      grantAccess: 'Accorder l\'accès',
      revokeAccess: 'Retirer l\'accès',
      editPermissions: 'Modifier permissions',
      saveChanges: 'Enregistrer',
      cancel: 'Annuler',
      addUser: 'Ajouter utilisateur',
      manageDocument: 'Gérer document',
      bulkActions: 'Actions groupées',
      selectAll: 'Tout sélectionner',
      grantSelected: 'Accorder aux sélectionnés',
      revokeSelected: 'Retirer aux sélectionnés',
      userManagement: 'Gestion utilisateurs',
      documentTypes: {
        pricing: 'Tarifs & Plans',
        policy: 'Politiques',
        technical: 'Technique',
        training: 'Formation',
        commercial: 'Commercial',
        administrative: 'Administratif',
        ministerial: 'Ministériel'
      },
      accessLevels: {
        public: 'Public',
        commercial: 'Commercial',
        admin: 'Administration',
        restricted: 'Restreint'
      },
      commercialTeam: 'Équipe Commerciale',
      permissionsMatrix: 'Matrice des Permissions',
      quickActions: 'Actions Rapides'
    },
    en: {
      title: 'Document Permissions Management',
      subtitle: 'Manage document access for Carine and the commercial team',
      search: 'Search documents or users...',
      filterByType: 'Filter by type',
      filterByUser: 'Filter by user',
      all: 'All',
      users: 'Users',
      documents: 'Documents',
      permissions: 'Permissions',
      canView: 'Can view',
      canDownload: 'Can download',
      canShare: 'Can share',
      active: 'Active',
      inactive: 'Inactive',
      lastLogin: 'Last login',
      grantAccess: 'Grant access',
      revokeAccess: 'Revoke access',
      editPermissions: 'Edit permissions',
      saveChanges: 'Save changes',
      cancel: 'Cancel',
      addUser: 'Add user',
      manageDocument: 'Manage document',
      bulkActions: 'Bulk actions',
      selectAll: 'Select all',
      grantSelected: 'Grant to selected',
      revokeSelected: 'Revoke from selected',
      userManagement: 'User management',
      documentTypes: {
        pricing: 'Pricing & Plans',
        policy: 'Policies',
        technical: 'Technical',
        training: 'Training',
        commercial: 'Commercial',
        administrative: 'Administrative',
        ministerial: 'Ministerial'
      },
      accessLevels: {
        public: 'Public',
        commercial: 'Commercial',
        admin: 'Administration',
        restricted: 'Restricted'
      },
      commercialTeam: 'Commercial Team',
      permissionsMatrix: 'Permissions Matrix',
      quickActions: 'Quick Actions'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch commercial users from API
  const { data: commercialUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/commercial-users'],
    queryFn: () => fetch('/api/admin/commercial-users', { credentials: 'include' }).then(res => res.json())
  });

  // Use API data or empty array
  const commercialUsers: CommercialUser[] = commercialUsersData?.users || [];

  // Fetch documents from API
  const { data: documentsData, isLoading: loadingDocuments } = useQuery({
    queryKey: ['/api/admin/documents'],
    queryFn: () => fetch('/api/admin/documents', { credentials: 'include' }).then(res => res.json())
  });

  // Use API data or empty array
  const documents: Document[] = documentsData?.documents || [];

  // Fonctions de gestion des permissions
  const togglePermission = (userId: string, documentId: number, permission: 'canView' | 'canDownload' | 'canShare') => {
    console.log(`Toggle permission ${permission} for user ${userId} on document ${documentId}`);
    // Ici on mettrait à jour la base de données
  };

  const grantAllPermissions = (userId: string, documentId: number) => {
    console.log(`Grant all permissions for user ${userId} on document ${documentId}`);
    // Ici on mettrait à jour la base de données
  };

  const revokeAllPermissions = (userId: string, documentId: number) => {
    console.log(`Revoke all permissions for user ${userId} on document ${documentId}`);
    // Ici on mettrait à jour la base de données
  };

  const hasPermission = (userId: string, documentId: number, permission: 'canView' | 'canDownload' | 'canShare'): boolean => {
    const user = commercialUsers.find(u => u.id === userId);
    return user?.permissions[documentId]?.[permission] || false;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredUsers = selectedUser === 'all' ? commercialUsers : commercialUsers.filter(u => u.id === selectedUser);

  // Vérifier que l'utilisateur est bien site admin
  if (user?.role !== 'SiteAdmin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">Accès restreint - Réservé aux administrateurs site</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-permissions"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-filter-type">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.filterByType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  {Object.entries(t.documentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger data-testid="select-filter-user">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.filterByUser} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  {commercialUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-total-users">{commercialUsers.length}</div>
                <div className="text-sm text-gray-600">{t.users}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="stat-active-users">
                  {commercialUsers.filter(u => u.isActive).length}
                </div>
                <div className="text-sm text-gray-600">{t.active}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-total-documents">{documents.length}</div>
                <div className="text-sm text-gray-600">{t.documents}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600" data-testid="stat-total-permissions">
                  {commercialUsers.reduce((sum, user) => sum + Object.keys(user.permissions).length, 0)}
                </div>
                <div className="text-sm text-gray-600">{t.permissions}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matrice des permissions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t.permissionsMatrix}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Document</th>
                    {filteredUsers.map(user => (
                      <th key={user.id} className="text-center p-3 font-semibold min-w-[150px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm">{user.name}</span>
                          <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                            {user.isActive ? t.active : t.inactive}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50" data-testid={`row-document-${doc.id}`}>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm" data-testid={`text-doc-title-${doc.id}`}>{doc.title}</span>
                          <span className="text-xs text-gray-500">{t.documentTypes[doc.type]}</span>
                        </div>
                      </td>
                      {filteredUsers.map(user => (
                        <td key={user.id} className="p-3 text-center">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant={hasPermission(user.id, doc.id, 'canView') ? "default" : "outline"}
                                onClick={() => togglePermission(user.id, doc.id, 'canView')}
                                className="w-8 h-8 p-0"
                                data-testid={`button-view-${user.id}-${doc.id}`}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={hasPermission(user.id, doc.id, 'canDownload') ? "default" : "outline"}
                                onClick={() => togglePermission(user.id, doc.id, 'canDownload')}
                                className="w-8 h-8 p-0"
                                data-testid={`button-download-${user.id}-${doc.id}`}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={hasPermission(user.id, doc.id, 'canShare') ? "default" : "outline"}
                                onClick={() => togglePermission(user.id, doc.id, 'canShare')}
                                className="w-8 h-8 p-0"
                                data-testid={`button-share-${user.id}-${doc.id}`}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => grantAllPermissions(user.id, doc.id)}
                                className="text-xs px-2 py-1 h-6"
                                data-testid={`button-grant-all-${user.id}-${doc.id}`}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => revokeAllPermissions(user.id, doc.id)}
                                className="text-xs px-2 py-1 h-6"
                                data-testid={`button-revoke-all-${user.id}-${doc.id}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Utilisateurs commerciaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.commercialTeam}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {commercialUsers.map(user => (
                <Card key={user.id} className="border" data-testid={`card-user-${user.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="font-semibold" data-testid={`text-user-name-${user.id}`}>{user.name}</h3>
                          <p className="text-sm text-gray-600" data-testid={`text-user-email-${user.id}`}>{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? t.active : t.inactive}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {t.lastLogin}: {user.lastLogin}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-user-${user.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t.editPermissions}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {t.permissions}: {Object.keys(user.permissions).length} documents
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">
                            {Object.values(user.permissions).filter(p => p.canView).length}
                          </div>
                          <div>{t.canView}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {Object.values(user.permissions).filter(p => p.canDownload).length}
                          </div>
                          <div>{t.canDownload}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">
                            {Object.values(user.permissions).filter(p => p.canShare).length}
                          </div>
                          <div>{t.canShare}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentPermissionsManager;