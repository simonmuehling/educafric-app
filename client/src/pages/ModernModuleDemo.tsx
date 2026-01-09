import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Bell, ChevronDown, ArrowUp, ArrowDown, 
  Calendar, Download, FileText, Users, BookOpen,
  GraduationCap, CreditCard, TrendingUp, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const barData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Fév', income: 3000, expense: 1398 },
  { name: 'Mar', income: 5000, expense: 3800 },
  { name: 'Avr', income: 2780, expense: 3908 },
  { name: 'Mai', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];

const pieData = [
  { name: 'Frais scolarité', value: 45, color: '#7C5CFC' },
  { name: 'Cantine', value: 20, color: '#5CAFFC' },
  { name: 'Transport', value: 15, color: '#CC6FF8' },
  { name: 'Activités', value: 12, color: '#EB7CA6' },
  { name: 'Autres', value: 8, color: '#A1A9FE' },
];

const transactions = [
  { id: 1, name: 'Jean Mbarga', type: 'Frais scolarité', date: '12 Jan 2026', amount: 150000, status: 'completed' },
  { id: 2, name: 'Marie Ateba', type: 'Cantine', date: '11 Jan 2026', amount: 25000, status: 'pending' },
  { id: 3, name: 'Paul Nkomo', type: 'Transport', date: '10 Jan 2026', amount: 35000, status: 'completed' },
  { id: 4, name: 'Sophie Fotso', type: 'Activités', date: '09 Jan 2026', amount: 15000, status: 'failed' },
];

export default function ModernModuleDemo() {
  const { language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState('2026');

  const t = {
    fr: {
      title: 'Aperçu Design Moderne - Module Finances',
      search: 'Rechercher...',
      totalIncome: 'Revenu Total',
      totalExpense: 'Dépenses Totales',
      thisMonth: 'Ce mois',
      vsLastMonth: 'vs mois dernier',
      spendingStats: 'Statistiques des Dépenses',
      overallSpending: 'Dépenses Globales',
      transactions: 'Transactions Récentes',
      viewAll: 'Voir tout',
      exportPdf: 'Exporter PDF',
      generateReport: 'Générer Rapport',
      status: { completed: 'Payé', pending: 'En attente', failed: 'Échoué' },
      headers: { transaction: 'Transaction', date: 'Date', amount: 'Montant', status: 'Statut' }
    },
    en: {
      title: 'Modern Design Preview - Finance Module',
      search: 'Search...',
      totalIncome: 'Total Income',
      totalExpense: 'Total Expenses',
      thisMonth: 'This month',
      vsLastMonth: 'vs last month',
      spendingStats: 'Spending Statistics',
      overallSpending: 'Overall Spending',
      transactions: 'Recent Transactions',
      viewAll: 'View all',
      exportPdf: 'Export PDF',
      generateReport: 'Generate Report',
      status: { completed: 'Paid', pending: 'Pending', failed: 'Failed' },
      headers: { transaction: 'Transaction', date: 'Date', amount: 'Amount', status: 'Status' }
    }
  };

  const text = t[language] || t.fr;

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
        {text.status[status as keyof typeof text.status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="border-b border-[#F3F5F7] bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6 px-6 py-3 border border-[#C3D4E9] rounded-full bg-white/80 w-full md:max-w-md">
          <Search className="w-5 h-5 text-[#90A3BF]" />
          <input 
            type="text" 
            placeholder={text.search}
            className="border-none outline-none w-full bg-transparent text-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative w-11 h-11 rounded-full border border-[#C3D4E9] flex items-center justify-center hover:bg-gray-50 transition">
            <Bell className="w-5 h-5 text-[#596780]" />
            <span className="absolute -top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5CAFFC] flex items-center justify-center text-white font-bold">
              AD
            </div>
            <span className="font-semibold text-[#1A202C] hidden md:block">Admin Demo</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#1A202C] mb-6">{text.title}</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[70%] space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="font-semibold text-[#1A202C]">{text.spendingStats}</h2>
                <div className="flex items-center gap-6">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2 border border-[#C3D4E9] rounded-lg text-sm font-semibold bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#C3D4E9] rounded-lg text-sm font-semibold">
                    <Calendar className="w-4 h-4" />
                    <span>Jan - Jun</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 pr-0 md:pr-6 md:border-r border-[#F0F0F0]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl md:text-3xl font-bold text-[#1A202C]">2,850,000</span>
                    <span className="text-sm font-semibold text-[#90A3BF]">XAF</span>
                    <span className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4" /> 12.5%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#90A3BF] uppercase tracking-wide">{text.totalIncome}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl md:text-3xl font-bold text-[#1A202C]">1,420,000</span>
                    <span className="text-sm font-semibold text-[#90A3BF]">XAF</span>
                    <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4" /> 8.3%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#90A3BF] uppercase tracking-wide">{text.totalExpense}</p>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F5F7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#90A3BF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#90A3BF', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #F3F5F7',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="income" fill="#7C5CFC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#5CAFFC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-[#1A202C]">{text.transactions}</h2>
                <button className="text-sm font-semibold text-[#7C5CFC] hover:underline">
                  {text.viewAll}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F3F5F7]">
                      <th className="pb-4 text-xs font-medium text-[#90A3BF] uppercase">{text.headers.transaction}</th>
                      <th className="pb-4 text-xs font-medium text-[#90A3BF] uppercase">{text.headers.date}</th>
                      <th className="pb-4 text-xs font-medium text-[#90A3BF] uppercase">{text.headers.amount}</th>
                      <th className="pb-4 text-xs font-medium text-[#90A3BF] uppercase">{text.headers.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#F3F5F7] last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#CC6FF8] flex items-center justify-center text-white text-sm font-bold">
                              {tx.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#1A202C]">{tx.name}</p>
                              <p className="text-xs text-[#90A3BF]">{tx.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-semibold text-[#596780]">{tx.date}</td>
                        <td className="py-4 text-sm font-bold text-[#1A202C]">{tx.amount.toLocaleString()} XAF</td>
                        <td className="py-4"><StatusBadge status={tx.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[#F3F5F7]">
                <button className="flex-1 flex items-center justify-center gap-3 px-5 py-4 bg-[#7C5CFC] text-white rounded-xl font-semibold hover:bg-[#6B4CE0] transition">
                  <Download className="w-5 h-5" />
                  {text.exportPdf}
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-[#7C5CFC] text-[#7C5CFC] rounded-xl font-semibold hover:bg-[#7C5CFC]/5 transition">
                  <FileText className="w-5 h-5" />
                  {text.generateReport}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-[30%] space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
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
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-[#1A202C] mb-4">
                {language === 'fr' ? 'Statistiques Rapides' : 'Quick Stats'}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Users, label: language === 'fr' ? 'Élèves' : 'Students', value: '1,248', color: '#7C5CFC' },
                  { icon: GraduationCap, label: language === 'fr' ? 'Enseignants' : 'Teachers', value: '52', color: '#5CAFFC' },
                  { icon: BookOpen, label: language === 'fr' ? 'Classes' : 'Classes', value: '24', color: '#CC6FF8' },
                  { icon: CreditCard, label: language === 'fr' ? 'Paiements' : 'Payments', value: '89%', color: '#EB7CA6' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-[#F3F5F7]/50 hover:bg-[#F3F5F7] transition cursor-pointer">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#90A3BF] font-medium">{stat.label}</p>
                      <p className="text-lg font-bold text-[#1A202C]">{stat.value}</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
