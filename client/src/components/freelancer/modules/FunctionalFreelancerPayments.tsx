import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, TrendingUp, Clock, CheckCircle,
  Plus, Filter, Download, Eye, 
  CreditCard, Banknote, AlertCircle, Calendar
} from 'lucide-react';

interface FreelancerPayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  clientName: string;
  date: string;
  description: string;
  type: string;
  invoiceNumber: string;
  dueDate: string;
}

const FunctionalFreelancerPayments: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Fetch freelancer payments data from PostgreSQL API
  const { data: payments = [], isLoading } = useQuery<FreelancerPayment[]>({
    queryKey: ['/api/freelancer/payments'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Gestion des Paiements',
      subtitle: 'Suivez vos revenus de cours particuliers et gérez vos factures',
      loading: 'Chargement des paiements...',
      noData: 'Aucun paiement enregistré',
      stats: {
        totalRevenue: 'Revenus Totaux',
        thisMonth: 'Ce Mois',
        pending: 'En Attente',
        overdue: 'En Retard'
      },
      status: {
        paid: 'Payé',
        pending: 'En attente',
        overdue: 'En retard',
        cancelled: 'Annulé'
      },
      methods: {
        bank_transfer: 'Virement bancaire',
        mobile_money: 'Mobile Money',
        cash: 'Espèces',
        online: 'Paiement en ligne'
      },
      actions: {
        newInvoice: 'Nouvelle Facture',
        viewInvoice: 'Voir Facture',
        sendReminder: 'Rappel Client',
        markPaid: 'Marquer Payé',
        export: 'Exporter'
      },
      filters: {
        all: 'Tous',
        paid: 'Payés',
        pending: 'En attente',
        overdue: 'En retard',
        thisMonth: 'Ce mois'
      },
      payment: {
        client: 'Client',
        amount: 'Montant',
        date: 'Date',
        method: 'Méthode',
        status: 'Statut',
        invoice: 'Facture',
        description: 'Description',
        dueDate: 'Échéance'
      }
    },
    en: {
      title: 'Payment Management',
      subtitle: 'Track your tutoring income and manage invoices',
      loading: 'Loading payments...',
      noData: 'No payments recorded',
      stats: {
        totalRevenue: 'Total Revenue',
        thisMonth: 'This Month',
        pending: 'Pending',
        overdue: 'Overdue'
      },
      status: {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        cancelled: 'Cancelled'
      },
      methods: {
        bank_transfer: 'Bank Transfer',
        mobile_money: 'Mobile Money',
        cash: 'Cash',
        online: 'Online Payment'
      },
      actions: {
        newInvoice: 'New Invoice',
        viewInvoice: 'View Invoice',
        sendReminder: 'Send Reminder',
        markPaid: 'Mark Paid',
        export: 'Export'
      },
      filters: {
        all: 'All',
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        thisMonth: 'This Month'
      },
      payment: {
        client: 'Client',
        amount: 'Amount',
        date: 'Date',
        method: 'Method',
        status: 'Status',
        invoice: 'Invoice',
        description: 'Description',
        dueDate: 'Due Date'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter payments
  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(payment => {
    if (!payment) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'thisMonth') {
      return payment?.date?.startsWith(selectedMonth);
    }
    return payment.status === selectedFilter;
  });

  // Calculate statistics
  const totalRevenue = (Array.isArray(payments) ? payments : []).reduce((sum, p) => sum + p.amount, 0);
  const thisMonthRevenue = payments
    .filter(p => p?.date?.startsWith(selectedMonth))
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = (Array.isArray(payments) ? payments : []).filter(p => p.status === 'pending').length;
  const overdueCount = (Array.isArray(payments) ? payments : []).filter(p => p.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Banknote className="w-4 h-4" />;
      case 'mobile_money':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.newInvoice}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalRevenue}</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(totalRevenue, 'CFA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.thisMonth}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(thisMonthRevenue, 'CFA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.pending}</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.overdue}</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historique des Paiements</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="paid">{t?.filters?.paid}</option>
                  <option value="pending">{t?.filters?.pending}</option>
                  <option value="overdue">{t?.filters?.overdue}</option>
                  <option value="thisMonth">{t?.filters?.thisMonth}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredPayments) ? filteredPayments.length : 0) === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun paiement ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredPayments) ? filteredPayments : []).map((payment) => (
                <Card key={payment.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            {getMethodIcon(payment.method)}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {formatAmount(payment.amount, payment.currency)}
                            </h4>
                            <p className="text-sm text-gray-600">{payment.clientName}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.invoice}</p>
                            <p className="font-medium">{payment.invoiceNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.date}</p>
                            <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.method}</p>
                            <div className="flex items-center">
                              {getMethodIcon(payment.method)}
                              <span className="ml-1 font-medium">
                                {t.methods[payment.method as keyof typeof t.methods]}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.dueDate}</p>
                            <p className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium">{payment.type}</p>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">{t?.payment?.description}</p>
                          <p className="text-sm text-gray-700">{payment.description || ''}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {t?.actions?.viewInvoice}
                          </Button>
                          {payment.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t?.actions?.markPaid}
                              </Button>
                              <Button variant="outline" size="sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {t?.actions?.sendReminder}
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalFreelancerPayments;