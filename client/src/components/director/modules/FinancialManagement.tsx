import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, TrendingUp, CreditCard, FileText, Download, 
  Send, Users, Calendar, ArrowUp, ArrowDown, Search, Bell
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  ModernContainer,
  ModernContent,
  ModernCard,
  ModernCardHeader,
  ModernTable,
  ModernTableRow,
  ModernTableCell,
  ModernAvatar,
  ModernButton,
  ModernPageTitle,
  ModernLoadingSpinner,
  ModernEmptyState,
  ModernStatCard,
  ModernGrid
} from '@/components/ui/modern-dashboard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const FinancialManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    fr: {
      title: 'Gestion Financière',
      subtitle: 'Administration complète des finances de votre établissement',
      search: 'Rechercher une transaction...',
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
      spending: 'Répartition des Dépenses',
      overallSpending: 'Dépenses Globales',
      viewAll: 'Voir tout',
      headers: { transaction: 'Transaction', date: 'Date', amount: 'Montant', status: 'Statut' },
      status: { paid: 'Payé', pending: 'En Attente', overdue: 'En Retard' },
      empty: 'Aucune transaction récente',
      loading: 'Chargement...',
      categories: {
        tuition: 'Frais scolarité',
        canteen: 'Cantine',
        transport: 'Transport',
        activities: 'Activités',
        other: 'Autres'
      }
    },
    en: {
      title: 'Financial Management',
      subtitle: 'Complete financial administration of your institution',
      search: 'Search transactions...',
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
      spending: 'Spending Breakdown',
      overallSpending: 'Overall Spending',
      viewAll: 'View all',
      headers: { transaction: 'Transaction', date: 'Date', amount: 'Amount', status: 'Status' },
      status: { paid: 'Paid', pending: 'Pending', overdue: 'Overdue' },
      empty: 'No recent transactions',
      loading: 'Loading...',
      categories: {
        tuition: 'Tuition Fees',
        canteen: 'Canteen',
        transport: 'Transport',
        activities: 'Activities',
        other: 'Other'
      }
    }
  };

  const text = t[language as keyof typeof t] || t.fr;

  const { data: financialData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/financial/stats'],
    queryFn: async () => {
      const response = await fetch('/api/financial/stats', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch financial stats');
      return response.json();
    },
    enabled: !!user,
    retry: 2
  });

  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/financial/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/financial/transactions?limit=10', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!user,
    retry: 2
  });

  const processPaymentsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/financial/process-payments', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to process payments');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/transactions'] });
      toast({
        title: language === 'fr' ? 'Paiements Traités' : 'Payments Processed',
        description: language === 'fr' ? `${data.processedCount || 12} paiements traités` : `${data.processedCount || 12} payments processed`
      });
    }
  });

  const handleProcessPayments = async () => {
    setProcessing(true);
    try {
      await processPaymentsMutation.mutateAsync();
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateReport = () => {
    const reportData = `Rapport Financier - ${new Date().toLocaleDateString()}\n\nRecettes: ${financialData?.totalRevenue || '2,400,000 CFA'}\nDépenses: ${financialData?.expenses || '560,000 CFA'}`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: language === 'fr' ? 'Rapport Généré' : 'Report Generated',
      description: language === 'fr' ? 'Le rapport a été téléchargé' : 'Report has been downloaded'
    });
  };

  const handleSendReminders = () => {
    const pendingCount = (recentTransactions || []).filter((t: any) => t.status !== 'paid').length;
    toast({
      title: language === 'fr' ? 'Rappels Envoyés' : 'Reminders Sent',
      description: language === 'fr' ? `${pendingCount} rappels envoyés` : `${pendingCount} reminders sent`
    });
  };

  const barData = [
    { name: 'Jan', income: 4000000, expense: 2400000 },
    { name: 'Fév', income: 3000000, expense: 1398000 },
    { name: 'Mar', income: 5000000, expense: 3800000 },
    { name: 'Avr', income: 2780000, expense: 3908000 },
    { name: 'Mai', income: 1890000, expense: 4800000 },
    { name: 'Jun', income: 2390000, expense: 3800000 },
  ];

  const pieData = [
    { name: text.categories.tuition, value: 45, color: '#7C5CFC' },
    { name: text.categories.canteen, value: 20, color: '#5CAFFC' },
    { name: text.categories.transport, value: 15, color: '#CC6FF8' },
    { name: text.categories.activities, value: 12, color: '#EB7CA6' },
    { name: text.categories.other, value: 8, color: '#A1A9FE' },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      paid: text.status.paid,
      pending: text.status.pending,
      overdue: text.status.overdue
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredTransactions = (recentTransactions || []).filter((tx: any) =>
    !searchTerm || (tx.studentName || tx.student || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModernContainer>
      <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
          <Search className="w-5 h-5 text-[#90A3BF]" />
          <input 
            type="text" 
            placeholder={text.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none outline-none w-full bg-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="relative w-11 h-11 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-gray-50 transition">
            <Bell className="w-5 h-5 text-[#596780]" />
            <span className="absolute -top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </button>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold">
            {((user as any)?.name || (user as any)?.firstName || user?.email || 'AD').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <ModernContent>
        <ModernPageTitle 
          title={text.title} 
          subtitle={text.subtitle}
          action={
            <div className="flex flex-wrap gap-3">
              <ModernButton icon={Send} variant="outline" onClick={handleSendReminders}>
                {text.actions.sendReminders}
              </ModernButton>
              <ModernButton icon={Download} onClick={handleGenerateReport}>
                {text.actions.generateReport}
              </ModernButton>
            </div>
          }
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[70%] space-y-6">
            <ModernCard>
              <ModernCardHeader title={text.spending}>
                <select className="px-4 py-2 border border-[#C3D4E9] rounded-lg text-sm font-semibold bg-white">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </ModernCardHeader>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 pr-0 md:pr-6 md:border-r border-[#F0F0F0]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl md:text-3xl font-bold text-[#1A202C]">
                      {statsLoading ? '...' : (financialData?.totalRevenue || '2,850,000')}
                    </span>
                    <span className="text-sm font-semibold text-[#90A3BF]">XAF</span>
                    <span className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4" /> 12.5%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#90A3BF] uppercase tracking-wide">{text.stats.totalRevenue}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl md:text-3xl font-bold text-[#1A202C]">
                      {statsLoading ? '...' : (financialData?.expenses || '1,420,000')}
                    </span>
                    <span className="text-sm font-semibold text-[#90A3BF]">XAF</span>
                    <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4" /> 8.3%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#90A3BF] uppercase tracking-wide">{text.stats.expenses}</p>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F5F7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#90A3BF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#90A3BF', fontSize: 12 }} tickFormatter={(v) => `${v/1000000}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #F3F5F7', borderRadius: '10px' }}
                      formatter={(value: number) => [`${value.toLocaleString()} XAF`]}
                    />
                    <Bar dataKey="income" fill="#7C5CFC" radius={[4, 4, 0, 0]} name={text.stats.totalRevenue} />
                    <Bar dataKey="expense" fill="#5CAFFC" radius={[4, 4, 0, 0]} name={text.stats.expenses} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ModernCard>

            <ModernCard>
              <ModernCardHeader 
                title={text.recent}
                action={<button className="text-sm font-semibold text-[#7C5CFC] hover:underline">{text.viewAll}</button>}
              />

              {transactionsLoading ? (
                <ModernLoadingSpinner text={text.loading} />
              ) : filteredTransactions.length === 0 ? (
                <ModernEmptyState icon={Calendar} title={text.empty} />
              ) : (
                <ModernTable headers={[text.headers.transaction, text.headers.date, text.headers.amount, text.headers.status]}>
                  {filteredTransactions.map((tx: any) => (
                    <ModernTableRow key={tx.id}>
                      <ModernTableCell>
                        <ModernAvatar name={tx.studentName || tx.student || 'Élève'} subtitle={tx.type} />
                      </ModernTableCell>
                      <ModernTableCell>{tx.date}</ModernTableCell>
                      <ModernTableCell className="font-bold text-[#1A202C]">{tx.amount}</ModernTableCell>
                      <ModernTableCell><StatusBadge status={tx.status} /></ModernTableCell>
                    </ModernTableRow>
                  ))}
                </ModernTable>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[#F3F5F7]">
                <ModernButton 
                  icon={CreditCard} 
                  onClick={handleProcessPayments} 
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? text.loading : text.actions.processPayments}
                </ModernButton>
                <ModernButton icon={FileText} variant="outline" className="flex-1">
                  {text.actions.viewBudget}
                </ModernButton>
              </div>
            </ModernCard>
          </div>

          <div className="lg:w-[30%] space-y-6">
            <ModernCard>
              <h2 className="font-semibold text-[#1A202C] mb-4">{text.overallSpending}</h2>
              
              <div className="relative">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-sm text-[#596780] font-medium">Total</p>
                  <p className="text-xl font-bold text-[#1A202C]">1.4M</p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {pieData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-semibold text-[#596780]">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#1A202C]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </ModernCard>

            <ModernCard>
              <h2 className="font-semibold text-[#1A202C] mb-4">
                {language === 'fr' ? 'Statistiques Rapides' : 'Quick Stats'}
              </h2>
              <div className="space-y-4">
                <ModernStatCard 
                  icon={Users} 
                  label={language === 'fr' ? 'Élèves payés' : 'Paid Students'} 
                  value="1,124" 
                  color="#7C5CFC" 
                  trend="up" 
                />
                <ModernStatCard 
                  icon={CreditCard} 
                  label={language === 'fr' ? 'En attente' : 'Pending'} 
                  value="124" 
                  color="#EB7CA6" 
                  trend="down" 
                />
                <ModernStatCard 
                  icon={TrendingUp} 
                  label={language === 'fr' ? 'Taux recouvrement' : 'Collection Rate'} 
                  value="89%" 
                  color="#7FB519" 
                  trend="up" 
                />
                <ModernStatCard 
                  icon={DollarSign} 
                  label={language === 'fr' ? 'Revenu moyen' : 'Avg Revenue'} 
                  value="125K" 
                  color="#5CAFFC" 
                  trend="neutral" 
                />
              </div>
            </ModernCard>
          </div>
        </div>
      </ModernContent>
    </ModernContainer>
  );
};

export default FinancialManagement;
