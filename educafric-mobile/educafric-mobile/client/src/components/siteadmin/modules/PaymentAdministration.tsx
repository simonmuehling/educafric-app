import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Search, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, TrendingUp, UserCheck, Calendar, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ModuleContainer from '../components/ModuleContainer';
import StatCard from '../components/StatCard';

const PaymentAdministration = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManualActivation, setShowManualActivation] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activationReason, setActivationReason] = useState('');
  const [activationDuration, setActivationDuration] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showExtendPeriod, setShowExtendPeriod] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Fetch real payment data from API
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['/api/admin/payments'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

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

  // Payment action handlers
  const handleConfirmPayment = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'fr' ? "Paiement confirmé" : "Payment confirmed",
          description: language === 'fr' ? "Le paiement a été confirmé avec succès" : "Payment has been confirmed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Échec de la confirmation" : "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'fr' ? "Paiement rejeté" : "Payment rejected",
          description: language === 'fr' ? "Le paiement a été rejeté" : "Payment has been rejected",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Échec du rejet" : "Failed to reject payment",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (paymentId: number) => {
    toast({
      title: language === 'fr' ? "Détails du paiement" : "Payment details",
      description: language === 'fr' ? `Affichage des détails pour le paiement #${paymentId}` : `Showing details for payment #${paymentId}`,
    });
  };

  const handleBulkConfirmPayments = async () => {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    if (pendingPayments.length === 0) {
      toast({
        title: language === 'fr' ? "Aucun paiement en attente" : "No pending payments",
        description: language === 'fr' ? "Il n'y a pas de paiements à confirmer" : "No payments to confirm",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/payments/bulk-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentIds: pendingPayments.map(p => p.id)
        })
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'fr' ? "Paiements confirmés" : "Payments confirmed",
          description: language === 'fr' ? `${pendingPayments.length} paiements confirmés` : `${pendingPayments.length} payments confirmed`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Échec de la confirmation en lot" : "Failed to bulk confirm",
        variant: "destructive",
      });
    }
  };

  const handleProcessBatch = async () => {
    try {
      const response = await fetch('/api/admin/payments/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          batchType: 'pending',
          criteria: {}
        })
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'fr' ? "Lot traité" : "Batch processed",
          description: language === 'fr' 
            ? `${result.processedCount} paiements traités avec succès` 
            : `${result.processedCount} payments processed successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Échec du traitement par lots" : "Failed to process batch",
        variant: "destructive",
      });
    }
  };

  const handleExtendPeriod = () => {
    setShowExtendPeriod(!showExtendPeriod);
  };

  const handleMonthlyReport = async () => {
    setReportLoading(true);
    try {
      const response = await fetch('/api/admin/reports/monthly', {
        method: 'GET',
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.report);
        setShowReportModal(true);
        toast({
          title: language === 'fr' ? "Rapport mensuel" : "Monthly report",
          description: language === 'fr' ? "Rapport généré avec succès" : "Report generated successfully",
        });
      } else {
        toast({
          title: language === 'fr' ? "Rapport mensuel" : "Monthly report",
          description: language === 'fr' ? "Génération du rapport en cours" : "Report generation in progress",
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Erreur lors de la génération du rapport" : "Error generating report",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportData = () => {
    // Create CSV export
    const csvData = payments.map(payment => ({
      ID: payment.transactionId,
      École: payment.school,
      Montant: payment.amount,
      Statut: payment.status,
      Méthode: payment.method,
      Date: payment.date,
      Description: payment.description
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educafric-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: language === 'fr' ? "Export réussi" : "Export successful",
      description: language === 'fr' ? "Données exportées en CSV" : "Data exported to CSV",
    });
  };

  // Loading state
  if (loadingPayments) {
    return (
      <ModuleContainer
        title={t.title || ''}
        subtitle={t.subtitle}
        icon={<CreditCard className="w-6 h-6" />}
        iconColor="from-green-500 to-green-600"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">
            {language === 'fr' ? 'Chargement des paiements...' : 'Loading payments...'}
          </span>
        </div>
      </ModuleContainer>
    );
  }

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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleConfirmPayment(payment.id)}
                              data-testid={`button-confirm-${payment.id}`}
                            >
                              {t.confirm}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectPayment(payment.id)}
                              data-testid={`button-reject-${payment.id}`}
                            >
                              {t.reject}
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(payment.id)}
                          data-testid={`button-details-${payment.id}`}
                        >
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleBulkConfirmPayments}
                data-testid="button-bulk-confirm"
              >
                {language === 'fr' ? 'Confirmer Paiements' : 'Confirm Payments'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleProcessBatch}
                data-testid="button-process-batch"
              >
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowManualActivation(!showManualActivation)}
                data-testid="button-manual-activation"
              >
                {language === 'fr' ? 'Activation Manuelle' : 'Manual Activation'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleExtendPeriod}
                data-testid="button-extend-period"
              >
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleMonthlyReport}
                data-testid="button-monthly-report"
              >
                {language === 'fr' ? 'Rapport Mensuel' : 'Monthly Report'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleExportData}
                data-testid="button-export-data"
              >
                {language === 'fr' ? 'Export Données' : 'Export Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Subscription Activation Modal */}
      {showManualActivation && (
        <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5" />
              {language === 'fr' ? 'Activation Manuelle d\'Abonnement' : 'Manual Subscription Activation'}
            </CardTitle>
            <CardDescription>
              {language === 'fr' 
                ? 'Réservé aux Site Admin et Carine Nguetsop - Activation directe d\'abonnements utilisateurs'
                : 'Reserved for Site Admin and Carine Nguetsop - Direct user subscription activation'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManualActivationForm 
              language={language}
              onClose={() => setShowManualActivation(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Extend Period Modal */}
      {showExtendPeriod && (
        <Card className="mt-6 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Calendar className="w-5 h-5" />
              {language === 'fr' ? 'Extension de Période d\'Abonnement' : 'Extend Subscription Period'}
            </CardTitle>
            <CardDescription>
              {language === 'fr' 
                ? 'Prolonger la période d\'abonnement d\'un utilisateur'
                : 'Extend a user\'s subscription period'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExtendPeriodForm 
              language={language}
              onClose={() => setShowExtendPeriod(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Monthly Report Modal */}
      {showReportModal && reportData && (
        <Card className="mt-6 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-green-800">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {language === 'fr' ? 'Rapport Mensuel des Paiements' : 'Monthly Payment Report'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReportModal(false)}
                data-testid="button-close-report"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
            </CardTitle>
            <CardDescription>
              {language === 'fr' 
                ? `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`
                : `Report generated on ${new Date().toLocaleDateString('en-US')}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyReportDisplay 
              reportData={reportData}
              language={language}
            />
          </CardContent>
        </Card>
      )}
    </ModuleContainer>
  );
};

// Manual Activation Form Component
const ManualActivationForm: React.FC<{ language: string; onClose: () => void }> = ({ language, onClose }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activationReason, setActivationReason] = useState('');
  const [activationDuration, setActivationDuration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  
  const [selectedUserType, setSelectedUserType] = useState('school');
  
  // Fetch users based on selected type
  const { data: users = [] } = useQuery({
    queryKey: ['/api/siteadmin/users-for-activation', selectedUserType],
    queryFn: async () => {
      const response = await fetch(`/api/siteadmin/users-for-activation?userType=${selectedUserType}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users || [];
    }
  });

  // Available subscription plans based on user type
  const getSubscriptionPlans = (userType: string) => {
    if (userType === 'school') {
      return [
        { id: 'ecole_500_plus', name: language === 'fr' ? 'École 500+ élèves - EDUCAFRIC paie l\'école' : 'School 500+ students - EDUCAFRIC pays school' },
        { id: 'ecole_200_499', name: language === 'fr' ? 'École 200-499 élèves' : 'School 200-499 students' },
        { id: 'ecole_50_199', name: language === 'fr' ? 'École 50-199 élèves' : 'School 50-199 students' },
        { id: 'ecole_trial', name: language === 'fr' ? 'Essai gratuit 30 jours' : '30-day free trial' }
      ];
    } else if (userType === 'parent') {
      return [
        { id: 'parent_public_quarterly', name: language === 'fr' ? 'Parent École Publique (3.000 CFA/trimestre)' : 'Parent Public School (3,000 CFA/quarter)' },
        { id: 'parent_private_quarterly', name: language === 'fr' ? 'Parent École Privée (4.500 CFA/trimestre)' : 'Parent Private School (4,500 CFA/quarter)' },
        { id: 'parent_public_annual', name: language === 'fr' ? 'Parent École Publique (12.000 CFA/an)' : 'Parent Public School (12,000 CFA/year)' },
        { id: 'parent_private_annual', name: language === 'fr' ? 'Parent École Privée (18.000 CFA/an)' : 'Parent Private School (18,000 CFA/year)' }
      ];
    } else if (userType === 'tutor') {
      return [
        { id: 'freelancer_semester', name: language === 'fr' ? 'Répétiteur (12.500 CFA/semestre)' : 'Tutor (12,500 CFA/semester)' },
        { id: 'freelancer_annual', name: language === 'fr' ? 'Répétiteur (25.000 CFA/an)' : 'Tutor (25,000 CFA/year)' },
        { id: 'freelancer_trial', name: language === 'fr' ? 'Essai gratuit 15 jours' : '15-day free trial' }
      ];
    }
    return [];
  };
  
  const subscriptionPlans = getSubscriptionPlans(selectedUserType);

  const activationDurations = [
    { value: '3months', label: language === 'fr' ? '3 mois (trimestriel)' : '3 months (quarterly)' },
    { value: '6months', label: language === 'fr' ? '6 mois (semestriel)' : '6 months (semester)' },
    { value: '12months', label: language === 'fr' ? '12 mois (annuel)' : '12 months (annual)' },
    { value: 'custom', label: language === 'fr' ? 'Durée personnalisée' : 'Custom duration' }
  ];

  const handleManualActivation = async () => {
    if (!selectedUser || !selectedPlan || !activationDuration || !activationReason.trim()) {
      toast({
        title: language === 'fr' ? "Champs requis" : "Required fields",
        description: language === 'fr' ? "Veuillez remplir tous les champs obligatoires" : "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const selectedUserData = users.find(u => u.id.toString() === selectedUser);
      const response = await fetch('/api/admin/subscriptions/manual-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: parseInt(selectedUser),
          plan: selectedPlan,
          duration: activationDuration.replace('months', ' months').replace('custom', '12 months'),
          reason: activationReason
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: language === 'fr' ? "Activation réussie" : "Activation successful",
          description: language === 'fr' 
            ? `Abonnement ${selectedPlan} activé pour ${selectedUserData?.email}` 
            : `${selectedPlan} subscription activated for ${selectedUserData?.email}`,
        });
        
        // Reset form
        setSelectedUser('');
        setSelectedPlan('');
        setActivationReason('');
        setActivationDuration('');
        onClose();
      } else {
        throw new Error(result.message || 'Activation failed');
      }
    } catch (error: any) {
      console.error('[MANUAL_ACTIVATION] Error:', error);
      toast({
        title: language === 'fr' ? "Erreur d'activation" : "Activation error",
        description: error.message || (language === 'fr' ? "Échec de l'activation" : "Activation failed"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Type d\'utilisateur' : 'User Type'}
        </label>
        <Select value={selectedUserType} onValueChange={(value) => {
          setSelectedUserType(value);
          setSelectedUser('');
          setSelectedPlan('');
        }}>
          <SelectTrigger data-testid="select-user-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="school">
              {language === 'fr' ? '🏫 École' : '🏫 School'}
            </SelectItem>
            <SelectItem value="parent">
              {language === 'fr' ? '👨‍👩‍👧‍👦 Parent' : '👨‍👩‍👧‍👦 Parent'}
            </SelectItem>
            <SelectItem value="tutor">
              {language === 'fr' ? '👨‍🏫 Répétiteur' : '👨‍🏫 Tutor'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Sélectionner l\'utilisateur' : 'Select User'}
        </label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger data-testid="select-user">
            <SelectValue placeholder={language === 'fr' ? 'Choisir un utilisateur...' : 'Choose a user...'} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name} ({user.email}) - {user.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Plan d\'abonnement' : 'Subscription Plan'}
        </label>
        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
          <SelectTrigger data-testid="select-plan">
            <SelectValue placeholder={language === 'fr' ? 'Choisir un plan...' : 'Choose a plan...'} />
          </SelectTrigger>
          <SelectContent>
            {subscriptionPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Durée d\'activation' : 'Activation Duration'}
        </label>
        <Select value={activationDuration} onValueChange={setActivationDuration}>
          <SelectTrigger data-testid="select-duration">
            <SelectValue placeholder={language === 'fr' ? 'Choisir la durée...' : 'Choose duration...'} />
          </SelectTrigger>
          <SelectContent>
            {activationDurations.map((duration) => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activation Reason */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Raison de l\'activation' : 'Activation Reason'}
        </label>
        <Textarea
          value={activationReason}
          onChange={(e) => setActivationReason(e.target.value)}
          placeholder={language === 'fr' 
            ? 'Expliquez pourquoi cet abonnement est activé manuellement...'
            : 'Explain why this subscription is being manually activated...'
          }
          rows={3}
          data-testid="textarea-reason"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleManualActivation}
          disabled={isProcessing}
          className="flex-1"
          data-testid="button-activate"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {language === 'fr' ? 'Activation...' : 'Activating...'}
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Activer l\'Abonnement' : 'Activate Subscription'}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          data-testid="button-cancel"
        >
          {language === 'fr' ? 'Annuler' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

// Monthly Report Display Component
const MonthlyReportDisplay: React.FC<{ reportData: any; language: string }> = ({ reportData, language }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} CFA`;
  };

  const formatPercentage = (value: number, total: number) => {
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {language === 'fr' ? 'Revenus Totaux' : 'Total Revenue'}
          </h4>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(reportData.totalRevenue)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {language === 'fr' ? 'Transactions Totales' : 'Total Transactions'}
          </h4>
          <p className="text-2xl font-bold text-blue-700">
            {reportData.totalTransactions}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-emerald-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {language === 'fr' ? 'Transactions Réussies' : 'Successful Transactions'}
          </h4>
          <p className="text-2xl font-bold text-emerald-700">
            {reportData.successfulTransactions}
          </p>
          <p className="text-xs text-emerald-600">
            {formatPercentage(reportData.successfulTransactions, reportData.totalTransactions)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            {language === 'fr' ? 'Transactions Échouées' : 'Failed Transactions'}
          </h4>
          <p className="text-2xl font-bold text-red-700">
            {reportData.failedTransactions}
          </p>
          <p className="text-xs text-red-600">
            {formatPercentage(reportData.failedTransactions, reportData.totalTransactions)}
          </p>
        </div>
      </div>

      {/* Top Schools */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {language === 'fr' ? 'Top Écoles par Revenus' : 'Top Schools by Revenue'}
        </h3>
        <div className="space-y-3">
          {reportData.topSchools?.map((school: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-800">{school.name}</span>
              </div>
              <span className="font-bold text-green-600">
                {formatCurrency(school.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {language === 'fr' ? 'Répartition par Méthode de Paiement' : 'Payment Method Distribution'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(reportData.paymentMethods || {}).map(([method, count]: [string, any]) => (
            <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{count}</p>
              <p className="text-sm text-gray-600">{method}</p>
              <p className="text-xs text-gray-500">
                {formatPercentage(count, reportData.totalTransactions)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">
          {language === 'fr' ? 'Options d\'Export' : 'Export Options'}
        </h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const csvData = [
                ['Metric', 'Value'],
                ['Total Revenue', reportData.totalRevenue],
                ['Total Transactions', reportData.totalTransactions],
                ['Successful Transactions', reportData.successfulTransactions],
                ['Failed Transactions', reportData.failedTransactions],
                ['Pending Transactions', reportData.pendingTransactions],
                ...reportData.topSchools?.map((school: any) => [`${school.name} Revenue`, school.revenue]) || [],
                ...Object.entries(reportData.paymentMethods || {}).map(([method, count]) => [`${method} Count`, count])
              ];
              
              const csv = csvData.map(row => row.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `monthly-report-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            data-testid="button-export-report-csv"
          >
            {language === 'fr' ? 'Export CSV' : 'Export CSV'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Extend Period Form Component
const ExtendPeriodForm: React.FC<{ language: string; onClose: () => void }> = ({ language, onClose }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [extensionDays, setExtensionDays] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch users with active subscriptions
  const { data: users = [] } = useQuery({
    queryKey: ['/api/siteadmin/users'],
    queryFn: async () => {
      const response = await fetch('/api/siteadmin/users?hasSubscription=true', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users || [];
    }
  });

  const handleExtendSubmit = async () => {
    if (!selectedUserId || !extensionDays || !extensionReason.trim()) {
      toast({
        title: language === 'fr' ? "Champs requis" : "Required fields",
        description: language === 'fr' ? "Veuillez remplir tous les champs" : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/admin/subscriptions/extend-period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          extensionDays: parseInt(extensionDays),
          reason: extensionReason
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: language === 'fr' ? "Extension réussie" : "Extension successful",
          description: language === 'fr' 
            ? `Abonnement prolongé de ${extensionDays} jours` 
            : `Subscription extended by ${extensionDays} days`,
        });
        
        // Reset form
        setSelectedUserId('');
        setExtensionDays('');
        setExtensionReason('');
        onClose();
      } else {
        throw new Error(result.message || 'Extension failed');
      }
    } catch (error: any) {
      console.error('[EXTEND_PERIOD] Error:', error);
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: error.message || (language === 'fr' ? "Échec de l'extension" : "Extension failed"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Sélectionner l\'utilisateur' : 'Select User'}
        </label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger data-testid="select-extend-user">
            <SelectValue placeholder={language === 'fr' ? 'Choisir un utilisateur...' : 'Choose a user...'} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name || user.firstName + ' ' + user.lastName} ({user.email}) - {user.subscriptionPlan || 'N/A'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Extension Days */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Nombre de jours d\'extension' : 'Extension Days'}
        </label>
        <Input
          type="number"
          min="1"
          max="365"
          value={extensionDays}
          onChange={(e) => setExtensionDays(e.target.value)}
          placeholder={language === 'fr' ? 'Ex: 30, 60, 90' : 'E.g: 30, 60, 90'}
          data-testid="input-extension-days"
        />
        <p className="text-xs text-gray-500 mt-1">
          {language === 'fr' ? 'Nombre de jours à ajouter à la période actuelle' : 'Number of days to add to current period'}
        </p>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {language === 'fr' ? 'Raison de l\'extension' : 'Extension Reason'}
        </label>
        <Textarea
          value={extensionReason}
          onChange={(e) => setExtensionReason(e.target.value)}
          placeholder={language === 'fr' 
            ? 'Ex: Compensation pour interruption de service...' 
            : 'E.g: Compensation for service interruption...'}
          rows={3}
          data-testid="textarea-extension-reason"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isProcessing}
          data-testid="button-cancel-extend"
        >
          {language === 'fr' ? 'Annuler' : 'Cancel'}
        </Button>
        <Button 
          onClick={handleExtendSubmit}
          disabled={isProcessing}
          data-testid="button-submit-extend"
        >
          {isProcessing 
            ? (language === 'fr' ? 'Extension...' : 'Extending...') 
            : (language === 'fr' ? 'Étendre Période' : 'Extend Period')}
        </Button>
      </div>
    </div>
  );
};

export default PaymentAdministration;