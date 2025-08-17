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

  // Payment action handlers
  const handleConfirmPayment = async (paymentId: number) => {
    try {
      const response = await apiRequest('PUT', `/api/admin/payments/${paymentId}/confirm`, {});
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
      const response = await apiRequest('PUT', `/api/admin/payments/${paymentId}/reject`, {});
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
      const response = await apiRequest('POST', '/api/admin/payments/bulk-confirm', {
        paymentIds: pendingPayments.map(p => p.id)
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

  const handleProcessBatch = () => {
    toast({
      title: language === 'fr' ? "Traitement des lots" : "Batch processing",
      description: language === 'fr' ? "Fonction de traitement par lots démarrée" : "Batch processing function started",
    });
  };

  const handleExtendPeriod = () => {
    toast({
      title: language === 'fr' ? "Extension de période" : "Period extension",
      description: language === 'fr' ? "Interface d'extension de période ouverte" : "Period extension interface opened",
    });
  };

  const handleMonthlyReport = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/reports/monthly', {});
      const result = await response.json();
      
      toast({
        title: language === 'fr' ? "Rapport mensuel" : "Monthly report",
        description: language === 'fr' ? "Génération du rapport mensuel..." : "Generating monthly report...",
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? "Rapport mensuel" : "Monthly report",
        description: language === 'fr' ? "Génération du rapport en cours" : "Report generation in progress",
      });
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
  
  // Fetch all users for selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users', {});
      const data = await response.json();
      return data.users || [];
    }
  });

  // Available subscription plans
  const subscriptionPlans = [
    { id: 'parent_public_quarterly', name: language === 'fr' ? 'Parent École Publique (3.000 CFA/trimestre)' : 'Parent Public School (3,000 CFA/quarter)' },
    { id: 'parent_private_quarterly', name: language === 'fr' ? 'Parent École Privée (4.500 CFA/trimestre)' : 'Parent Private School (4,500 CFA/quarter)' },
    { id: 'parent_public_annual', name: language === 'fr' ? 'Parent École Publique (12.000 CFA/an)' : 'Parent Public School (12,000 CFA/year)' },
    { id: 'parent_private_annual', name: language === 'fr' ? 'Parent École Privée (18.000 CFA/an)' : 'Parent Private School (18,000 CFA/year)' },
    { id: 'school_public', name: language === 'fr' ? 'École Publique (50.000 CFA/an)' : 'Public School (50,000 CFA/year)' },
    { id: 'school_private', name: language === 'fr' ? 'École Privée (75.000 CFA/an)' : 'Private School (75,000 CFA/year)' },
    { id: 'freelancer_semester', name: language === 'fr' ? 'Répétiteur (12.500 CFA/semestre)' : 'Tutor (12,500 CFA/semester)' },
    { id: 'freelancer_annual', name: language === 'fr' ? 'Répétiteur (25.000 CFA/an)' : 'Tutor (25,000 CFA/year)' }
  ];

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
      const response = await apiRequest('POST', '/api/admin/manual-subscription-activation', {
        userId: parseInt(selectedUser),
        planId: selectedPlan,
        duration: activationDuration,
        reason: activationReason,
        activatedBy: 'site_admin' // This will be determined by backend based on current user
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: language === 'fr' ? "Activation réussie" : "Activation successful",
          description: language === 'fr' 
            ? `Abonnement activé pour l'utilisateur ${result.user?.email}` 
            : `Subscription activated for user ${result.user?.email}`,
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
                {user.firstName} {user.lastName} ({user.email}) - {user.userType || user.role}
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

export default PaymentAdministration;