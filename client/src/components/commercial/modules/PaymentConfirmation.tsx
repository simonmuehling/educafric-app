import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, Search, CheckCircle, Clock, AlertCircle, CreditCard, FileText, Calendar } from 'lucide-react';

const PaymentConfirmation = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const text = {
    fr: {
      title: 'Confirmation Paiements',
      subtitle: 'Vérification et traitement des paiements',
      searchPlaceholder: 'Rechercher transaction...',
      confirmPayment: 'Confirmer Paiement',
      all: 'Tous',
      pending: 'En Attente',
      confirmed: 'Confirmés',
      rejected: 'Rejetés',
      school: 'École',
      amount: 'Montant',
      date: 'Date',
      status: 'Statut',
      method: 'Méthode',
      reference: 'Référence',
      confirm: 'Confirmer',
      reject: 'Rejeter',
      details: 'Détails',
      bankTransfer: 'Virement Bancaire',
      mobileMoney: 'Mobile Money',
      cash: 'Espèces',
      card: 'Carte',
      subscription: 'Abonnement',
      schoolFees: 'Frais Scolaires',
      equipment: 'Équipement'
    },
    en: {
      title: 'Payment Confirmation',
      subtitle: 'Payment verification and processing',
      searchPlaceholder: 'Search transaction...',
      confirmPayment: 'Confirm Payment',
      all: 'All',
      pending: 'Pending',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      school: 'School',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      method: 'Method',
      reference: 'Reference',
      confirm: 'Confirm',
      reject: 'Reject',
      details: 'Details',
      bankTransfer: 'Bank Transfer',
      mobileMoney: 'Mobile Money',
      cash: 'Cash',
      card: 'Card',
      subscription: 'Subscription',
      schoolFees: 'School Fees',
      equipment: 'Equipment'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock payment data
  const payments = [
    {
      id: 1,
      school: 'École Primaire Bilingue Yaoundé',
      amount: 250000,
      currency: 'CFA',
      date: '2024-01-22',
      status: 'pending',
      method: 'bankTransfer',
      reference: 'BT-20240122-001',
      type: 'subscription',
      description: 'Abonnement Premium - Janvier 2024',
      contact: 'Sarah Nkomo',
      phone: '+237 656 123 456'
    },
    {
      id: 2,
      school: 'Lycée Excellence Douala',
      amount: 180000,
      currency: 'CFA',
      date: '2024-01-21',
      status: 'confirmed',
      method: 'mobileMoney',
      reference: 'MM-20240121-045',
      type: 'schoolFees',
      description: 'Frais de scolarité - Trimestre 2',
      contact: 'Paul Mbarga',
      phone: '+237 675 987 654'
    },
    {
      id: 3,
      school: 'Collège Moderne Bafoussam',
      amount: 125000,
      currency: 'CFA',
      date: '2024-01-20',
      status: 'pending',
      method: 'cash',
      reference: 'CASH-20240120-012',
      type: 'equipment',
      description: 'Matériel pédagogique',
      contact: 'Marie Fotso',
      phone: '+237 694 555 777'
    },
    {
      id: 4,
      school: 'Institut Technique Garoua',
      amount: 300000,
      currency: 'CFA',
      date: '2024-01-19',
      status: 'confirmed',
      method: 'bankTransfer',
      reference: 'BT-20240119-067',
      type: 'subscription',
      description: 'Abonnement Annuel Standard',
      contact: 'Ahmadou Bello',
      phone: '+237 677 333 888'
    },
    {
      id: 5,
      school: 'École Internationale Abidjan',
      amount: 95000,
      currency: 'CFA',
      date: '2024-01-18',
      status: 'rejected',
      method: 'card',
      reference: 'CARD-20240118-089',
      type: 'subscription',
      description: 'Tentative paiement échouée',
      contact: 'Fatima Kouassi',
      phone: '+225 07 89 12 34'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bankTransfer': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'mobileMoney': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'cash': return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'card': return <CreditCard className="w-4 h-4 text-purple-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(payment => {
    if (!payment) return false;
    const matchesSearch = payment?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.contact?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusFilters = [
    { key: 'all', label: t.all, count: (Array.isArray(payments) ? payments.length : 0) },
    { key: 'pending', label: t.pending, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').length },
    { key: 'confirmed', label: t.confirmed, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'confirmed').length },
    { key: 'rejected', label: t.rejected, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'rejected').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(statusFilters) ? statusFilters : []).map((filter) => (
          <Button
            key={filter.key}
            variant={selectedStatus === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="pl-10"
        />
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {(Array.isArray(filteredPayments) ? filteredPayments : []).map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    {getMethodIcon(payment.method)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{payment.school}</h3>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === 'confirmed' ? t.confirmed : 
                         payment.status === 'pending' ? t.pending : t.rejected}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{payment.description || ''}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{t.reference}: {payment.reference}</span>
                      <span>{t.date}: {payment.date}</span>
                      <span>{payment.contact} - {payment.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {payment.method === 'bankTransfer' ? t.bankTransfer :
                       payment.method === 'mobileMoney' ? t.mobileMoney :
                       payment.method === 'cash' ? t.cash : t.card}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {payment.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.confirm}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {t.reject}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <FileText className="w-3 h-3 mr-1" />
                      {t.details}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'En Attente' : 'Pending'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(Array.isArray(payments) ? payments : []).filter(p => p.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Confirmés' : 'Confirmed'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(Array.isArray(payments) ? payments : []).reduce((sum, p) => sum + (p.status === 'confirmed' ? p.amount : 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Total Confirmé' : 'Total Confirmed'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(Array.isArray(payments) ? payments : []).reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'En Cours' : 'In Progress'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentConfirmation;