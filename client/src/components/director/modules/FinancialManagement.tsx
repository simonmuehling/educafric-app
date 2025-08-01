import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  DollarSign, TrendingUp, CreditCard, FileText, Download, 
  Send, Users, AlertCircle, CheckCircle, Calendar, Bell
} from 'lucide-react';

const FinancialManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const text = {
    fr: {
      title: 'Gestion Financière',
      subtitle: 'Administration complète des finances de votre établissement',
      stats: {
        totalRevenue: 'Revenus Totaux',
        pendingPayments: 'Paiements en Attente',
        monthlyIncome: 'Revenus Mensuels',
        expenses: 'Dépenses'
      },
      actions: {
        processPayments: 'Traiter Paiements',
        generateReport: 'Générer Rapport',
        viewBudget: 'Voir Budget',
        sendReminders: 'Envoyer Rappels'
      },
      recent: 'Transactions Récentes',
      pending: 'Paiements en Attente',
      status: {
        paid: 'Payé',
        pending: 'En Attente',
        overdue: 'En Retard'
      }
    },
    en: {
      title: 'Financial Management',
      subtitle: 'Complete financial administration of your institution',
      stats: {
        totalRevenue: 'Total Revenue',
        pendingPayments: 'Pending Payments',
        monthlyIncome: 'Monthly Income',
        expenses: 'Expenses'
      },
      actions: {
        processPayments: 'Process Payments',
        generateReport: 'Generate Report',
        viewBudget: 'View Budget',
        sendReminders: 'Send Reminders'
      },
      recent: 'Recent Transactions',
      pending: 'Pending Payments',
      status: {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const financialStats = [
    {
      title: t?.stats?.totalRevenue,
      value: '2.4M CFA',
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t?.stats?.pendingPayments,
      value: '340K CFA',
      icon: <CreditCard className="w-5 h-5" />,
      trend: { value: 8, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t?.stats?.monthlyIncome,
      value: '800K CFA',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 15, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t?.stats?.expenses,
      value: '560K CFA',
      icon: <FileText className="w-5 h-5" />,
      trend: { value: 5, isPositive: false },
      gradient: 'purple' as const
    }
  ];

  const recentTransactions = [
    { id: 1, student: 'Marie Kamga', amount: '45,000 CFA', type: 'Frais Scolarité', status: 'paid', date: '2025-01-24' },
    { id: 2, student: 'Paul Mvondo', amount: '25,000 CFA', type: 'Frais Cantine', status: 'pending', date: '2025-01-23' },
    { id: 3, student: 'Sophie Biya', amount: '60,000 CFA', type: 'Frais Complets', status: 'paid', date: '2025-01-22' },
    { id: 4, student: 'Junior Essomba', amount: '35,000 CFA', type: 'Frais Transport', status: 'overdue', date: '2025-01-20' }
  ];

  const handleProcessPayments = async () => {
    setProcessing(true);
    // Simulation traitement des paiements
    setTimeout(() => {
      toast({
        title: language === 'fr' ? 'Paiements Traités' : 'Payments Processed',
        description: language === 'fr' ? '12 paiements traités avec succès' : '12 payments processed successfully'
      });
      setProcessing(false);
    }, 2000);
  };

  const handleGenerateReport = () => {
    // Génération de rapport financier
    const reportData = `Rapport Financier - ${new Date().toLocaleDateString()}\n\nRecettes: 2,400,000 CFA\nDépenses: 560,000 CFA\nBénéfice Net: 1,840,000 CFA`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.txt`;
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'fr' ? 'Rapport Généré' : 'Report Generated',
      description: language === 'fr' ? 'Le rapport financier a été téléchargé' : 'Financial report has been downloaded'
    });
  };

  const handleViewBudget = () => {
    toast({
      title: language === 'fr' ? 'Analyse Budgétaire' : 'Budget Analysis',
      description: language === 'fr' ? 'Ouverture de l\'analyse budgétaire détaillée' : 'Opening detailed budget analysis'
    });
  };

  const handleSendReminders = async () => {
    // Envoi automatique de rappels de paiement
    const overdueCount = (Array.isArray(recentTransactions) ? recentTransactions : []).filter(t => t.status === 'overdue' || t.status === 'pending').length;
    
    toast({
      title: language === 'fr' ? 'Rappels Envoyés' : 'Reminders Sent',
      description: language === 'fr' ? `${overdueCount} rappels de paiement envoyés par SMS et email` : `${overdueCount} payment reminders sent via SMS and email`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t?.status?.paid, className: 'bg-green-100 text-green-800' },
      pending: { label: t?.status?.pending, className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: t?.status?.overdue, className: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              {t.title || ''}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(financialStats) ? financialStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            onClick={handleProcessPayments} 
            disabled={processing}
            className="h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center gap-2"
          >
            <CreditCard className="w-6 h-6" />
            {processing ? (language === 'fr' ? 'Traitement...' : 'Processing...') : t?.actions?.processPayments}
          </Button>
          
          <Button 
            onClick={handleGenerateReport}
            className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center gap-2"
          >
            <Download className="w-6 h-6" />
            {t?.actions?.generateReport}
          </Button>
          
          <Button 
            onClick={handleViewBudget}
            className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center gap-2"
          >
            <FileText className="w-6 h-6" />
            {t?.actions?.viewBudget}
          </Button>
          
          <Button 
            onClick={handleSendReminders}
            className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center gap-2"
          >
            <Send className="w-6 h-6" />
            {t?.actions?.sendReminders}
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {t.recent}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Array.isArray(recentTransactions) ? recentTransactions : []).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.student}</p>
                      <p className="text-sm text-gray-600">{transaction.type}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">{transaction.amount}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transaction.status)}
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialManagement;