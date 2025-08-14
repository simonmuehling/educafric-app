import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, Users, MapPin, ExternalLink, Star, 
  X, Send, Calendar, User, CheckCircle
} from 'lucide-react';

interface BusinessPartner {
  id: number;
  name: string;
  sector: string;
  type: string;
  description?: string;
  city?: string;
  region?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  partnershipType: string;
  rating?: number;
  studentsPlaced?: number;
  opportunitiesOffered?: number;
}

const BusinessPartnershipMapSimple: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactData, setContactData] = useState({
    subject: '',
    message: '',
    recipientEmail: ''
  });

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partnerships/partners');
        if (response.ok) {
          const data = await response.json();
          setPartners(data);
        } else {
          throw new Error('Failed to fetch partners');
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Impossible de charger les partenaires' : 'Failed to load partners',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [language, toast]);

  const text = {
    fr: {
      title: 'Partenariats École-Entreprise',
      subtitle: 'Gestion des partenariats avec les entreprises locales',
      map: 'Carte',
      list: 'Liste',
      internships: 'Stages',
      statistics: 'Statistiques',
      totalPartners: 'Partenaires Total',
      activeInternships: 'Stages Actifs',
      studentsPlaced: 'Étudiants Placés',
      averageRating: 'Note Moyenne',
      partnerDetails: 'Détails du Partenaire',
      sector: 'Secteur',
      type: 'Type',
      location: 'Localisation',
      contact: 'Contact',
      website: 'Site Web',
      email: 'Email',
      phone: 'Téléphone',
      sendMessage: 'Envoyer un Message',
      close: 'Fermer',
      contactForm: 'Formulaire de Contact',
      subject: 'Objet',
      message: 'Message',
      send: 'Envoyer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      contactPartner: 'Contacter le Partenaire',
      viewDetails: 'Voir Détails',
      rating: 'Évaluation'
    },
    en: {
      title: 'School-Enterprise Partnerships',
      subtitle: 'Management of partnerships with local enterprises',
      map: 'Map',
      list: 'List',
      internships: 'Internships',
      statistics: 'Statistics',
      totalPartners: 'Total Partners',
      activeInternships: 'Active Internships',
      studentsPlaced: 'Students Placed',
      averageRating: 'Average Rating',
      partnerDetails: 'Partner Details',
      sector: 'Sector',
      type: 'Type',
      location: 'Location',
      contact: 'Contact',
      website: 'Website',
      email: 'Email',
      phone: 'Phone',
      sendMessage: 'Send Message',
      close: 'Close',
      contactForm: 'Contact Form',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      cancel: 'Cancel',
      loading: 'Loading...',
      contactPartner: 'Contact Partner',
      viewDetails: 'View Details',
      rating: 'Rating'
    }
  };

  const t = text[language];

  const formatPartnershipType = (type: string) => {
    const types = {
      'internship': language === 'fr' ? 'Stages' : 'Internships',
      'training': language === 'fr' ? 'Formation' : 'Training',
      'collaboration': language === 'fr' ? 'Collaboration' : 'Collaboration',
      'mentoring': language === 'fr' ? 'Mentorat' : 'Mentoring'
    };
    return types[type as keyof typeof types] || type;
  };

  const openContactForm = (partner: BusinessPartner) => {
    setContactData({
      subject: '',
      message: '',
      recipientEmail: partner.email || ''
    });
    setContactFormOpen(true);
  };

  const handleSendMessage = async () => {
    if (!contactData.subject || !contactData.message || !contactData.recipientEmail) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/partnerships/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Message envoyé avec succès' : 'Message sent successfully',
        });
        setContactFormOpen(false);
        setContactData({ subject: '', message: '', recipientEmail: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le message' : 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const statistics = {
    totalPartners: partners.length,
    activeInternships: partners.reduce((acc, p) => acc + (p.opportunitiesOffered || 0), 0),
    studentsPlaced: partners.reduce((acc, p) => acc + (p.studentsPlaced || 0), 0),
    averageRating: partners.length > 0 ? 
      partners.reduce((acc, p) => acc + (p.rating || 0), 0) / partners.length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="map">{t.map}</TabsTrigger>
            <TabsTrigger value="list">{t.list}</TabsTrigger>
            <TabsTrigger value="internships">{t.internships}</TabsTrigger>
            <TabsTrigger value="statistics">{t.statistics}</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Carte interactive des partenaires (À venir)</p>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                      {partner.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-gray-600">{partner.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Secteur:</span>
                        <p className="text-gray-600 capitalize">{partner.sector}</p>
                      </div>
                      <div>
                        <span className="font-medium">Localisation:</span>
                        <p className="text-gray-600">{partner.city}, {partner.region}</p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p className="text-gray-600">{partner.contactPerson}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-gray-600">{formatPartnershipType(partner.partnershipType)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{partner.rating ? partner.rating.toFixed(1) : 'N/A'}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPartner(partner)}
                          data-testid={`button-view-details-${partner.id}`}
                        >
                          {t.viewDetails}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internships" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {partners.filter(p => p.partnershipType === 'internship').map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.sector}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {partner.opportunitiesOffered || 0} opportunités disponibles
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPartner(partner)}
                      >
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalPartners}</div>
                  <div className="text-sm text-gray-600">{t.totalPartners}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.activeInternships}</div>
                  <div className="text-sm text-gray-600">{t.activeInternships}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{statistics.studentsPlaced}</div>
                  <div className="text-sm text-gray-600">{t.studentsPlaced}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statistics.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">{t.averageRating}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal détails partenaire */}
      {selectedPartner && (
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {t.partnerDetails}: {selectedPartner.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">{t.sector}</Label>
                  <p className="text-lg capitalize">{selectedPartner.sector}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">{t.type}</Label>
                  <p className="text-lg">{formatPartnershipType(selectedPartner.partnershipType)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-gray-700">{selectedPartner.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Localisation</Label>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedPartner.city}, {selectedPartner.region}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Partenariat depuis</Label>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    2023
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedPartner.studentsPlaced || 0}</div>
                  <div className="text-sm text-gray-600">{t.studentsPlaced}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedPartner.opportunitiesOffered || 0}</div>
                  <div className="text-sm text-gray-600">Opportunités</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Number.isFinite(Number(selectedPartner.rating)) ? Number(selectedPartner.rating).toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">{t.rating}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Informations de Contact</Label>
                {selectedPartner.contactPerson && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {selectedPartner.contactPerson} - {selectedPartner.contactPosition}
                  </div>
                )}
                {selectedPartner.email && (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    <a href={`mailto:${selectedPartner.email}`} className="text-blue-600 hover:underline">
                      {selectedPartner.email}
                    </a>
                  </div>
                )}
                {selectedPartner.phone && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <a href={`tel:${selectedPartner.phone}`} className="text-blue-600 hover:underline">
                      {selectedPartner.phone}
                    </a>
                  </div>
                )}
                {selectedPartner.website && (
                  <div className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedPartner.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {selectedPartner.email && (
                  <Button
                    onClick={() => openContactForm(selectedPartner)}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {t.sendMessage}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                  {t.close}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal formulaire de contact */}
      <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              {t.contactForm}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">{t.contact}</Label>
              <Input
                id="recipient"
                value={contactData.recipientEmail}
                onChange={(e) => setContactData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder="email@entreprise.com"
                data-testid="input-recipient-email"
              />
            </div>
            <div>
              <Label htmlFor="subject">{t.subject}</Label>
              <Input
                id="subject"
                value={contactData.subject}
                onChange={(e) => setContactData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Objet du message"
                data-testid="input-subject"
              />
            </div>
            <div>
              <Label htmlFor="message">{t.message}</Label>
              <Textarea
                id="message"
                value={contactData.message}
                onChange={(e) => setContactData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Votre message..."
                rows={4}
                data-testid="textarea-message"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setContactFormOpen(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!contactData.subject || !contactData.message || !contactData.recipientEmail}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" />
                {t.send}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BusinessPartnershipMapSimple;