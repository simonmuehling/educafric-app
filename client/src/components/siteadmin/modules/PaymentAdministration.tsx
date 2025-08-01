import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Search, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import StatCard from '../components/StatCard';

const PaymentAdministration = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const text = {
    fr: {
      title: 'Administration Financière',
      subtitle: 'Surveillance financière et gestion des paiements',
      searchPlaceholder: 'Rechercher transaction...',
      allStatuses: 'Tous Statuts',
      pending: 'En Attente',
      completed: 'Complété',
      failed: 'Échoué',
      refunded: 'Remboursé',
      totalRevenue: 'Revenus Totaux',
      pendingPayments: 'Paiements En Attente',
      successfulTransactions: 'Transactions Réussies',
      disputedPayments: 'Paiements Disputés',
      manualConfirmation: 'Confirmation Manuelle',
      activateSubscription: 'Activer Abonnement',
      processRefund: 'Traiter Remboursement',
      viewDetails: 'Voir Détails',
      school: 'École',
      amount: 'Montant',
      status: 'Statut',
      date: 'Date',
      method: 'Méthode',
      actions: 'Actions',
      confirm: 'Confirmer',
      reject: 'Rejeter'
    },
    en: {
      title: 'Payment & Financial Administration',
      subtitle: 'Financial oversight and payment management',
      searchPlaceholder: 'Search transactions...',
      allStatuses: 'All Statuses',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
      totalRevenue: 'Total Revenue',
      pendingPayments: 'Pending Payments',
      successfulTransactions: 'Successful Transactions',
      disputedPayments: 'Disputed Payments',
      manualConfirmation: 'Manual Confirmation',
      activateSubscription: 'Activate Subscription',
      processRefund: 'Process Refund',
      viewDetails: 'View Details',
      school: 'School',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      method: 'Method',
      actions: 'Actions',
      confirm: 'Confirm',
      reject: 'Reject'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock payment data
  const payments = [
    {
      id: 1,
      school: 'École Primaire Bilingue Yaoundé',
      amount: 50000,
      status: 'pending',
      date: '2024-01-22 14:30',
      method: 'Bank Transfer',
      type: 'subscription',
      transactionId: 'TXN-001-2024',
      description: 'Abonnement annuel Premium'
    },
    {
      id: 2,
      school: 'Lycée Excellence Douala',
      amount: 75000,
      status: 'completed',
      date: '2024-01-22 13:45',
      method: 'Mobile Money',
      type: 'subscription',
      transactionId: 'TXN-002-2024',
      description: 'Abonnement mensuel Premium'
    },
    {
      id: 3,
      school: 'Collège Moderne Bafoussam',
      amount: 25000,
      status: 'failed',
      date: '2024-01-22 12:20',
      method: 'Credit Card',
      type: 'subscription',
      transactionId: 'TXN-003-2024',
      description: 'Abonnement mensuel Basic'
    },
    {
      id: 4,
      school: 'Institut Technique Garoua',
      amount: 30000,
      status: 'completed',
      date: '2024-01-22 11:15',
      method: 'Bank Transfer',
      type: 'top-up',
      transactionId: 'TXN-004-2024',
      description: 'Recharge SMS crédit'
    },
    {
      id: 5,
      school: 'École Primaire Publique Bamenda',
      amount: 50000,
      status: 'pending',
      date: '2024-01-22 10:30',
      method: 'Mobile Money',
      type: 'subscription',
      transactionId: 'TXN-005-2024',
      description: 'Abonnement trial extension'
    },
    {
      id: 6,
      school: 'Université Catholique Yaoundé',
      amount: 100000,
      status: 'refunded',
      date: '2024-01-21 16:45',
      method: 'Bank Transfer',
      type: 'subscription',
      transactionId: 'TXN-006-2024',
      description: 'Abonnement Enterprise - remboursé'
    }
  ];

  const statuses = [
    { key: 'all', label: t.allStatuses, count: (Array.isArray(payments) ? payments.length : 0) },
    { key: 'pending', label: t.pending, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').length },
    { key: 'completed', label: t.completed, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'completed').length },
    { key: 'failed', label: t.failed, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'failed').length },
    { key: 'refunded', label: t.refunded, count: (Array.isArray(payments) ? payments : []).filter(p => p.status === 'refunded').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(payment => {
    if (!payment) return false;
    const matchesSearch = payment?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = (Array.isArray(payments) ? payments : []).filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = (Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} CFA`;
  };

  return (
    <ModuleContainer
      title={t.title || ''}
      subtitle={t.subtitle}
      icon={<CreditCard className="w-6 h-6" />}
      iconColor="from-green-500 to-green-600"
    >
      {/* Normalized Financial Statistics with StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t.totalRevenue}
          value={formatCurrency(totalRevenue)}
          subtitle={language === 'fr' ? '+18% ce mois' : '+18% this month'}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-green-50 to-green-100"
          change={{ value: "18%", type: "increase" }}
        />
        
        <StatCard
          title={t.pendingPayments}
          value={formatCurrency(pendingAmount)}
          subtitle={`${(Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').length} transactions`}
          icon={<Clock className="w-8 h-8" />}
          gradient="from-yellow-50 to-yellow-100"
        />
        
        <StatCard
          title={t.successfulTransactions}
          value={(Array.isArray(payments) ? payments : []).filter(p => p.status === 'completed').length}
          subtitle="Taux: 67%"
          icon={<CheckCircle className="w-8 h-8" />}
          gradient="from-blue-50 to-blue-100"
        />
        
        <StatCard
          title={t.disputedPayments}
          value={(Array.isArray(payments) ? payments : []).filter(p => p.status === 'failed' || p.status === 'refunded').length}
          subtitle={language === 'fr' ? 'Nécessite attention' : 'Requires attention'}
          icon={<AlertTriangle className="w-8 h-8" />}
          gradient="from-red-50 to-red-100"
        />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(statuses) ? statuses : []).map((status) => (
          <Button
            key={status.key}
            variant={selectedStatus === status.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status.key)}
            className="flex items-center gap-2"
          >
            {status.label}
            <Badge variant="secondary" className="ml-1">
              {status.count}
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Transactions Récentes' : 'Recent Transactions'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">ID</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.school}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.amount}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.status}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.method}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.date}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredPayments) ? filteredPayments : []).map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{payment.transactionId}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{payment.school}</div>
                        <div className="text-sm text-gray-600">{payment.description || ''}</div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status === 'completed' ? t.completed :
                           payment.status === 'pending' ? t.pending :
                           payment.status === 'failed' ? t.failed : t.refunded}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{payment.method}</td>
                    <td className="p-4 text-gray-600 text-sm">{payment.date}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                              {t.confirm}
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              {t.reject}
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          {t.viewDetails}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t.manualConfirmation}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Confirmer Paiements' : 'Confirm Payments'}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Traiter Lots' : 'Process Batch'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t.activateSubscription}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Activation Manuelle' : 'Manual Activation'}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Extension Période' : 'Extend Period'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'fr' ? 'Rapports' : 'Reports'}
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Rapport Mensuel' : 'Monthly Report'}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {language === 'fr' ? 'Export Données' : 'Export Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleContainer>
  );
};

export default PaymentAdministration;