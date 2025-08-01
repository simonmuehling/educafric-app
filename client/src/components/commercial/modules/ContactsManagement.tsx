import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Search, Phone, Mail, Calendar, Star, Plus, Filter, MessageSquare } from 'lucide-react';

const ContactsManagement = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const text = {
    fr: {
      title: 'Gestion des Contacts',
      subtitle: 'Base de données clients et génération de leads',
      searchPlaceholder: 'Rechercher un contact...',
      addContact: 'Ajouter Contact',
      all: 'Tous',
      leads: 'Leads',
      clients: 'Clients',
      prospects: 'Prospects',
      inactive: 'Inactifs',
      name: 'Nom',
      position: 'Poste',
      school: 'École',
      lastContact: 'Dernier Contact',
      nextAction: 'Prochaine Action',
      priority: 'Priorité',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      call: 'Appeler',
      email: 'Email',
      meeting: 'RDV',
      followUp: 'Relance'
    },
    en: {
      title: 'Contact Management',
      subtitle: 'Client database and lead generation',
      searchPlaceholder: 'Search contacts...',
      addContact: 'Add Contact',
      all: 'All',
      leads: 'Leads',
      clients: 'Clients',
      prospects: 'Prospects',
      inactive: 'Inactive',
      name: 'Name',
      position: 'Position',
      school: 'School',
      lastContact: 'Last Contact',
      nextAction: 'Next Action',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      call: 'Call',
      email: 'Email',
      meeting: 'Meeting',
      followUp: 'Follow Up'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock contacts data
  const contacts = [
    {
      id: 1,
      name: 'Sarah Nkomo',
      position: 'Directrice',
      school: 'École Primaire Bilingue Yaoundé',
      phone: '+237 656 123 456',
      email: 'sarah.nkomo@epby.cm',
      status: 'client',
      priority: 'high',
      lastContact: '2024-01-20',
      nextAction: 'call',
      notes: 'Intéressée par l\'extension premium',
      rating: 5
    },
    {
      id: 2,
      name: 'Paul Mbarga',
      position: 'Proviseur',
      school: 'Lycée Excellence Douala',
      phone: '+237 675 987 654',
      email: 'paul.mbarga@led.cm',
      status: 'prospect',
      priority: 'high',
      lastContact: '2024-01-18',
      nextAction: 'meeting',
      notes: 'Négociation contrat en cours',
      rating: 4
    },
    {
      id: 3,
      name: 'Marie Fotso',
      position: 'Principale',
      school: 'Collège Moderne Bafoussam',
      phone: '+237 694 555 777',
      email: 'marie.fotso@cmb.cm',
      status: 'lead',
      priority: 'medium',
      lastContact: '2024-01-15',
      nextAction: 'email',
      notes: 'Premier contact établi',
      rating: 3
    },
    {
      id: 4,
      name: 'Ahmadou Bello',
      position: 'Directeur',
      school: 'Institut Technique Garoua',
      phone: '+237 677 333 888',
      email: 'ahmadou.bello@itg.cm',
      status: 'client',
      priority: 'medium',
      lastContact: '2024-01-22',
      nextAction: 'followUp',
      notes: 'Client satisfait, renouvellement prévu',
      rating: 5
    },
    {
      id: 5,
      name: 'Fatima Kouassi',
      position: 'Coordinatrice',
      school: 'Centre de Formation Abidjan',
      phone: '+225 07 89 12 34',
      email: 'fatima.kouassi@cfa.ci',
      status: 'prospect',
      priority: 'low',
      lastContact: '2024-01-10',
      nextAction: 'call',
      notes: 'Intérêt modéré, besoin de relance',
      rating: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'call': return <Phone className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
      case 'meeting': return <Calendar className="w-3 h-3" />;
      case 'followUp': return <MessageSquare className="w-3 h-3" />;
      default: return <Phone className="w-3 h-3" />;
    }
  };

  const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(contact => {
    if (!contact) return false;
    const matchesSearch = contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact?.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || contact.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: t.all, count: (Array.isArray(contacts) ? contacts.length : 0) },
    { key: 'leads', label: t.leads, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'lead').length },
    { key: 'prospects', label: t.prospects, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'prospect').length },
    { key: 'clients', label: t.clients, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'client').length },
    { key: 'inactive', label: t.inactive, count: (Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'inactive').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(filters) ? filters : []).map((filter) => (
          <Button
            key={filter.key}
            variant={selectedFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t.addContact}
        </Button>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {(Array.isArray(filteredContacts) ? filteredContacts : []).map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{contact.name || ''}</h3>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < contact.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{contact.position} - {contact.school}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email || ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {contact.lastContact}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getPriorityColor(contact.priority)}`}>
                      {contact.priority === 'high' ? t.high : contact.priority === 'medium' ? t.medium : t.low}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      {getActionIcon(contact.nextAction)}
                      <span className="capitalize">{contact.nextAction}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {t.call}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {t.email || ''}
                    </Button>
                  </div>
                </div>
              </div>
              {contact.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Notes:</strong> {contact.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'client').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Clients Actifs' : 'Active Clients'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.status === 'prospect').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Prospects Chauds' : 'Hot Prospects'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{(Array.isArray(contacts) ? contacts : []).filter(c => c.priority === 'high').length}</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Priorité Haute' : 'High Priority'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Taux Conversion' : 'Conversion Rate'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactsManagement;