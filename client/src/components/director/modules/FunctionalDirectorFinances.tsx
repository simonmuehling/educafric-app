// 📱 MOBILE-OPTIMIZED Director Finances Management
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, PieChart, CreditCard, Receipt, Plus, Download } from 'lucide-react';

const FunctionalDirectorFinances: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const t = {
    title: language === 'fr' ? 'Gestion Financière' : 'Financial Management',
    overview: language === 'fr' ? 'Vue d\'ensemble' : 'Overview',
    revenue: language === 'fr' ? 'Revenus' : 'Revenue',
    expenses: language === 'fr' ? 'Dépenses' : 'Expenses',
    profit: language === 'fr' ? 'Bénéfice' : 'Profit',
    thisMonth: language === 'fr' ? 'Ce mois' : 'This month',
    lastMonth: language === 'fr' ? 'Mois dernier' : 'Last month',
    tuitionFees: language === 'fr' ? 'Frais de scolarité' : 'Tuition fees',
    salaries: language === 'fr' ? 'Salaires' : 'Salaries',
    utilities: language === 'fr' ? 'Services publics' : 'Utilities',
    supplies: language === 'fr' ? 'Fournitures' : 'Supplies',
    addTransaction: language === 'fr' ? 'Ajouter Transaction' : 'Add Transaction',
    exportReport: language === 'fr' ? 'Exporter Rapport' : 'Export Report'
  };

  // Sample financial data
  const financialSummary = {
    totalRevenue: 2450000,
    totalExpenses: 1850000,
    netProfit: 600000,
    revenueGrowth: 12.5,
    expenseGrowth: 8.3
  };

  const recentTransactions = [
    {
      id: 1,
      type: 'revenue',
      description: language === 'fr' ? 'Frais de scolarité - Janvier' : 'Tuition fees - January',
      amount: 850000,
      date: '2025-01-15',
      category: language === 'fr' ? 'Frais de scolarité' : 'Tuition fees'
    },
    {
      id: 2,
      type: 'expense',
      description: language === 'fr' ? 'Salaires enseignants' : 'Teacher salaries',
      amount: -450000,
      date: '2025-01-31',
      category: language === 'fr' ? 'Salaires' : 'Salaries'
    },
    {
      id: 3,
      type: 'expense',
      description: language === 'fr' ? 'Facture électricité' : 'Electricity bill',
      amount: -125000,
      date: '2025-01-28',
      category: language === 'fr' ? 'Services publics' : 'Utilities'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {language === 'fr' ? 'Suivez vos finances et revenus' : 'Track your finances and revenue'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            {t.exportReport}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t.addTransaction}
          </Button>
        </div>
      </div>

      {/* Mobile-optimized financial overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{t.revenue}</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(financialSummary.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+{financialSummary.revenueGrowth}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">{t.expenses}</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(financialSummary.totalExpenses)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+{financialSummary.expenseGrowth}%</span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t.profit}</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(financialSummary.netProfit)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+15.2%</span>
                </div>
              </div>
              <PieChart className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized recent transactions */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg sm:text-xl font-semibold">
            {language === 'fr' ? 'Transactions Récentes' : 'Recent Transactions'}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-start sm:items-center space-x-3">
                <div className={`p-2 rounded-full ${transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'revenue' ? 
                    <TrendingUp className="w-4 h-4 text-green-600" /> : 
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">{transaction.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                    <Badge variant="secondary" className="w-fit text-xs">
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm sm:text-base ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalDirectorFinances;