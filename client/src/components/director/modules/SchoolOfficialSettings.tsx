import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ModernCard } from '@/components/ui/modern-card';
import { 
  School, FileText, MapPin, Mail, Save, 
  Building, Flag, AlertCircle, CheckCircle 
} from 'lucide-react';

interface SchoolSettings {
  name: string;
  type: string; // public, private, enterprise
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  // Nouveaux champs officiels camerounais
  regionaleMinisterielle: string;
  delegationDepartementale: string;
  boitePostale: string;
  arrondissement: string;
}

const SchoolOfficialSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SchoolSettings>({
    name: '',
    type: 'private',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    regionaleMinisterielle: '',
    delegationDepartementale: '',
    boitePostale: '',
    arrondissement: ''
  });

  const text = {
    fr: {
      title: 'Paramètres Officiels École',
      subtitle: 'Configuration des en-têtes gouvernementaux pour documents officiels',
      schoolInfo: 'Informations École',
      officialInfo: 'Informations Officielles Cameroun',
      name: 'Nom de l\'école',
      type: 'Type d\'établissement',
      typePublic: 'Public',
      typePrivate: 'Privé',
      typeEnterprise: 'Entreprise',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      logo: 'URL Logo',
      regionaleMinisterielle: 'Délégation Régionale',
      regionaleExample: 'Ex: Délégation Régionale du Centre',
      delegationDepartementale: 'Délégation Départementale',
      delegationExample: 'Ex: Délégation Départementale du Mfoundi',
      boitePostale: 'Boîte Postale',
      boiteExample: 'Ex: B.P. 1234 Yaoundé',
      arrondissement: 'Arrondissement',
      arrondissementExample: 'Ex: Yaoundé 1er',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      success: 'Paramètres sauvegardés avec succès',
      error: 'Erreur lors de l\'enregistrement',
      required: 'Ces informations apparaîtront sur tous les bulletins et documents officiels',
      warning: 'République du Cameroun - Ministère des Enseignements Secondaires'
    },
    en: {
      title: 'Official School Settings',
      subtitle: 'Government header configuration for official documents',
      schoolInfo: 'School Information',
      officialInfo: 'Official Cameroon Information',
      name: 'School name',
      type: 'Institution type',
      typePublic: 'Public',
      typePrivate: 'Private',
      typeEnterprise: 'Enterprise',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      logo: 'Logo URL',
      regionaleMinisterielle: 'Regional Delegation',
      regionaleExample: 'Ex: Centre Regional Delegation',
      delegationDepartementale: 'Departmental Delegation',
      delegationExample: 'Ex: Mfoundi Departmental Delegation',
      boitePostale: 'P.O. Box',
      boiteExample: 'Ex: P.O. Box 1234 Yaoundé',
      arrondissement: 'District',
      arrondissementExample: 'Ex: Yaoundé 1st',
      save: 'Save',
      saving: 'Saving...',
      success: 'Settings saved successfully',
      error: 'Error saving settings',
      required: 'This information will appear on all bulletins and official documents',
      warning: 'Republic of Cameroon - Ministry of Secondary Education'
    }
  };

  const t = text[language];

  // Fetch school settings
  const { data: schoolData, isLoading } = useQuery({
    queryKey: ['/api/director/school-settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/school-settings', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch school settings');
      }
      return response.json();
    },
    enabled: !!user
  });

  useEffect(() => {
    if (schoolData?.school) {
      setFormData({
        name: schoolData.school.name || '',
        type: schoolData.school.type || 'private',
        address: schoolData.school.address || '',
        phone: schoolData.school.phone || '',
        email: schoolData.school.email || '',
        logoUrl: schoolData.school.logoUrl || '',
        regionaleMinisterielle: schoolData.school.regionaleMinisterielle || '',
        delegationDepartementale: schoolData.school.delegationDepartementale || '',
        boitePostale: schoolData.school.boitePostale || '',
        arrondissement: schoolData.school.arrondissement || ''
      });
    }
  }, [schoolData]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SchoolSettings) => {
      const response = await fetch('/api/director/school-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to save school settings');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.required,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/school-settings'] });
    },
    onError: () => {
      toast({
        title: t.error,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof SchoolSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Flag className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">{t.warning}</span>
          </div>
          <p className="text-green-700 mt-1 text-sm">{t.required}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {t.schoolInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t.name}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">{t.type}</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t.type} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.typePublic}</SelectItem>
                      <SelectItem value="private">{t.typePrivate}</SelectItem>
                      <SelectItem value="enterprise">{t.typeEnterprise}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">{t.logo}</Label>
                  <Input
                    id="logo"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">{t.address}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Official Cameroon Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.officialInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regionale">{t.regionaleMinisterielle}</Label>
                  <Input
                    id="regionale"
                    value={formData.regionaleMinisterielle}
                    onChange={(e) => handleInputChange('regionaleMinisterielle', e.target.value)}
                    placeholder={t.regionaleExample}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="delegation">{t.delegationDepartementale}</Label>
                  <Input
                    id="delegation"
                    value={formData.delegationDepartementale}
                    onChange={(e) => handleInputChange('delegationDepartementale', e.target.value)}
                    placeholder={t.delegationExample}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="boite">{t.boitePostale}</Label>
                  <Input
                    id="boite"
                    value={formData.boitePostale}
                    onChange={(e) => handleInputChange('boitePostale', e.target.value)}
                    placeholder={t.boiteExample}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="arrondissement">{t.arrondissement}</Label>
                  <Input
                    id="arrondissement"
                    value={formData.arrondissement}
                    onChange={(e) => handleInputChange('arrondissement', e.target.value)}
                    placeholder={t.arrondissementExample}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saveSettingsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveSettingsMutation.isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolOfficialSettings;