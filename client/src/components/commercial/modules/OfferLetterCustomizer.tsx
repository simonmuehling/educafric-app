import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Save, Eye, Phone, Building2, User, 
  Mail, MapPin, Signature, Plus, Settings, 
  Download, Share2, Trash2, Edit
} from 'lucide-react';

interface OfferLetterTemplate {
  id?: number;
  templateName: string;
  commercialPhone: string;
  recipientTitle: string; // Monsieur/Madame le/la Directeur(trice)
  schoolName: string;
  schoolAddress: string;
  salutation: string; // Monsieur/Madame le/la Directeur(trice),
  signatureName: string; // [Nom & Prénom]
  signatureFunction: string; // [Votre Fonction]
  customFields?: {
    email?: string;
    secondaryPhone?: string;
    department?: string;
  };
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const OfferLetterCustomizer: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentTemplate, setCurrentTemplate] = useState<OfferLetterTemplate>({
    templateName: '',
    commercialPhone: '+237 ',
    recipientTitle: 'Monsieur/Madame le/la Directeur(trice)',
    schoolName: '[Nom de l\'établissement scolaire]',
    schoolAddress: '[Adresse]',
    salutation: 'Monsieur/Madame le/la Directeur(trice),',
    signatureName: '[Nom & Prénom]',
    signatureFunction: '[Votre Fonction]',
    isDefault: false
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch saved templates
  const { data: templates, isLoading } = useQuery<OfferLetterTemplate[]>({
    queryKey: ['/api/commercial/offer-templates'],
    queryFn: async () => {
      const response = await fetch('/api/commercial/offer-templates', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return empty array if API fails
        return [];
      }
      return response.json();
    }
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: OfferLetterTemplate) => {
      const response = await fetch('/api/commercial/offer-templates', {
        method: template.id ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/offer-templates'] });
      toast({
        title: language === 'fr' ? 'Modèle sauvegardé' : 'Template saved',
        description: language === 'fr' ? 'Le modèle de lettre a été sauvegardé avec succès' : 'Offer letter template saved successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder le modèle' : 'Failed to save template',
        variant: 'destructive'
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await fetch(`/api/commercial/offer-templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/offer-templates'] });
      toast({
        title: language === 'fr' ? 'Modèle supprimé' : 'Template deleted',
        description: language === 'fr' ? 'Le modèle a été supprimé avec succès' : 'Template deleted successfully'
      });
    }
  });

  const loadTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id?.toString() === templateId);
    if (template) {
      setCurrentTemplate(template);
    }
  };

  const resetForm = () => {
    setCurrentTemplate({
      templateName: '',
      commercialPhone: '+237 ',
      recipientTitle: 'Monsieur/Madame le/la Directeur(trice)',
      schoolName: '[Nom de l\'établissement scolaire]',
      schoolAddress: '[Adresse]',
      salutation: 'Monsieur/Madame le/la Directeur(trice),',
      signatureName: '[Nom & Prénom]',
      signatureFunction: '[Votre Fonction]',
      isDefault: false
    });
    setSelectedTemplate('');
  };

  const generatePreview = () => {
    return `Educafric.com by Afro Metaverse
info@educafric.com / info@afrometaverse.online
${currentTemplate.commercialPhone}
educafric.com
RC/YAE/2023/B/1361
NIU:M032318079876K

À
${currentTemplate.recipientTitle}
${currentTemplate.schoolName}
${currentTemplate.schoolAddress}

OBJET : OFFRE DE SOLUTION NUMÉRIQUE DE GESTION SCOLAIRE –
                    APPLICATION EDUCAFRIC

${currentTemplate.salutation.toUpperCase()}

Dans le cadre de notre mission d'accompagnement des établissements scolaires vers la modernisation
et la digitalisation de leurs services, nous avons l'honneur de vous présenter EducaFric, une application
scolaire innovante et adaptée au contexte africain.

Cet outil numérique offre plusieurs avantages :

- Gestion académique : suivi des élèves, enseignants, emplois du temps et calendrier scolaire ;
- Bulletins automatisés : édition sécurisée et conforme ;
- Suivi disciplinaire : gestion des absences, retards et comportements ;
- Communication instantanée : envoi de SMS et notifications aux parents ;
- Gestion financière : suivi et règlement des frais de scolarité avec reçus automatiques.

Nous serions honorés de pouvoir organiser une démonstration gratuite et de vous accompagner dans
l'implémentation de cette solution moderne au sein de votre établissement.

Dans l'attente de votre retour favorable, nous vous prions d'agréer, ${currentTemplate.recipientTitle.toLowerCase()},
l'expression de notre parfaite considération.




${currentTemplate.signatureName}
${currentTemplate.signatureFunction}
Educafric.com by Afro Metaverse


                                                                                            +237 656 200 472

                                                                                           INFO@EDUCAFRIC.COM

                                                                                       INFO@AFROMETAVERSE.ONLINE


                                                                                       
                                                                                    [CACHET OFFICIEL EDUCAFRIC]`;
  };

  const text = {
    fr: {
      title: 'Personnalisation des Lettres d\'Offres',
      subtitle: 'Créez et gérez vos modèles de lettres personnalisées',
      templateName: 'Nom du modèle',
      commercialPhone: 'Téléphone commercial',
      recipientDetails: 'Détails du destinataire',
      recipientTitle: 'Titre du destinataire',
      schoolName: 'Nom de l\'établissement',
      schoolAddress: 'Adresse de l\'établissement',
      salutation: 'Formule de politesse',
      signature: 'Signature',
      signatureName: 'Nom et prénom',
      signatureFunction: 'Fonction',
      saveTemplate: 'Sauvegarder le modèle',
      loadTemplate: 'Charger un modèle',
      preview: 'Aperçu',
      newTemplate: 'Nouveau modèle',
      deleteTemplate: 'Supprimer',
      setDefault: 'Définir par défaut',
      templateNamePlaceholder: 'Ex: Modèle École Privée',
      phonePlaceholder: '+237 6XX XXX XXX',
      selectTemplate: 'Sélectionner un modèle'
    },
    en: {
      title: 'Offer Letter Customization',
      subtitle: 'Create and manage your personalized letter templates',
      templateName: 'Template name',
      commercialPhone: 'Commercial phone',
      recipientDetails: 'Recipient details',
      recipientTitle: 'Recipient title',
      schoolName: 'School name',
      schoolAddress: 'School address',
      salutation: 'Salutation',
      signature: 'Signature',
      signatureName: 'Name and surname',
      signatureFunction: 'Function',
      saveTemplate: 'Save template',
      loadTemplate: 'Load template',
      preview: 'Preview',
      newTemplate: 'New template',
      deleteTemplate: 'Delete',
      setDefault: 'Set as default',
      templateNamePlaceholder: 'Ex: Private School Template',
      phonePlaceholder: '+237 6XX XXX XXX',
      selectTemplate: 'Select a template'
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {t.preview}
          </Button>
          <Button
            onClick={() => saveTemplateMutation.mutate(currentTemplate)}
            disabled={saveTemplateMutation.isPending || !currentTemplate.templateName}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t.saveTemplate}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t.loadTemplate}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.selectTemplate}</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  if (value) loadTemplate(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectTemplate} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map(template => (
                      <SelectItem key={template.id} value={template.id?.toString() || ''}>
                        <div className="flex items-center gap-2">
                          {template.templateName}
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">Défaut</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t.newTemplate}
                </Button>
                {selectedTemplate && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const templateId = parseInt(selectedTemplate);
                      deleteTemplateMutation.mutate(templateId);
                      setSelectedTemplate('');
                      resetForm();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {templates && templates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Modèles sauvegardés</h4>
                  {templates.map(template => (
                    <div key={template.id} className="p-2 border rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{template.templateName}</span>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">Défaut</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {template.commercialPhone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Éditeur de modèle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Name */}
              <div>
                <Label htmlFor="templateName">{t.templateName}</Label>
                <Input
                  id="templateName"
                  value={currentTemplate.templateName}
                  onChange={(e) => setCurrentTemplate({
                    ...currentTemplate,
                    templateName: e.target.value
                  })}
                  placeholder={t.templateNamePlaceholder}
                />
              </div>

              {/* Commercial Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t.commercialPhone}
                </Label>
                <Input
                  id="phone"
                  value={currentTemplate.commercialPhone}
                  onChange={(e) => setCurrentTemplate({
                    ...currentTemplate,
                    commercialPhone: e.target.value
                  })}
                  placeholder={t.phonePlaceholder}
                />
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t.recipientDetails}
                </h3>
                
                <div>
                  <Label htmlFor="recipientTitle">{t.recipientTitle}</Label>
                  <Select
                    value={currentTemplate.recipientTitle}
                    onValueChange={(value) => setCurrentTemplate({
                      ...currentTemplate,
                      recipientTitle: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monsieur le Directeur">Monsieur le Directeur</SelectItem>
                      <SelectItem value="Madame la Directrice">Madame la Directrice</SelectItem>
                      <SelectItem value="Monsieur/Madame le/la Directeur(trice)">Monsieur/Madame le/la Directeur(trice)</SelectItem>
                      <SelectItem value="Monsieur le Principal">Monsieur le Principal</SelectItem>
                      <SelectItem value="Madame la Principale">Madame la Principale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schoolName">{t.schoolName}</Label>
                  <Input
                    id="schoolName"
                    value={currentTemplate.schoolName}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      schoolName: e.target.value
                    })}
                    placeholder="Ex: Lycée Bilingue de Yaoundé"
                  />
                </div>

                <div>
                  <Label htmlFor="schoolAddress">{t.schoolAddress}</Label>
                  <Textarea
                    id="schoolAddress"
                    value={currentTemplate.schoolAddress}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      schoolAddress: e.target.value
                    })}
                    placeholder="Ex: B.P. 1234, Quartier Bastos, Yaoundé"
                    rows={2}
                  />
                </div>
              </div>

              {/* Salutation */}
              <div>
                <Label htmlFor="salutation">{t.salutation}</Label>
                <Select
                  value={currentTemplate.salutation}
                  onValueChange={(value) => setCurrentTemplate({
                    ...currentTemplate,
                    salutation: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monsieur le Directeur,">Monsieur le Directeur,</SelectItem>
                    <SelectItem value="Madame la Directrice,">Madame la Directrice,</SelectItem>
                    <SelectItem value="Monsieur/Madame le/la Directeur(trice),">Monsieur/Madame le/la Directeur(trice),</SelectItem>
                    <SelectItem value="Cher(e) Directeur(trice),">Cher(e) Directeur(trice),</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Signature */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Signature className="w-5 h-5" />
                  {t.signature}
                </h3>
                
                <div>
                  <Label htmlFor="signatureName">{t.signatureName}</Label>
                  <Input
                    id="signatureName"
                    value={currentTemplate.signatureName}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      signatureName: e.target.value
                    })}
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                <div>
                  <Label htmlFor="signatureFunction">{t.signatureFunction}</Label>
                  <Input
                    id="signatureFunction"
                    value={currentTemplate.signatureFunction}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      signatureFunction: e.target.value
                    })}
                    placeholder="Ex: Directeur Commercial"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Aperçu de la lettre d'offre</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Partager
                  </Button>
                  <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded border">
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatePreview().split('[CACHET OFFICIEL EDUCAFRIC]').map((part, index) => (
                    <span key={index}>
                      {part}
                      {index === 0 && (
                        <div className="flex justify-end mt-4">
                          <img 
                            src="/images/cachet-educafric.png" 
                            alt="Cachet Officiel Educafric" 
                            className="w-24 h-24 opacity-80"
                          />
                        </div>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLetterCustomizer;