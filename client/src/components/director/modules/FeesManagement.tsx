import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DollarSign, 
  Plus, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  CreditCard,
  Receipt,
  Send,
  Edit,
  Trash2,
  Download,
  Bell,
  FileText,
  Settings,
  FileBarChart,
  RefreshCw,
  Calendar,
  Percent,
  Filter
} from 'lucide-react';

const translations = {
  fr: {
    title: 'Gestion des Frais',
    subtitle: 'Gérez les frais de scolarité et les paiements',
    dashboard: 'Tableau de Bord',
    structures: 'Structures de Frais',
    assigned: 'Frais Assignés',
    payments: 'Paiements',
    totalExpected: 'Total Attendu',
    totalCollected: 'Total Collecté',
    outstanding: 'Solde Restant',
    collectionRate: 'Taux de Recouvrement',
    studentsInArrears: 'Élèves en Retard',
    recentPayments: 'Paiements Récents (30j)',
    createStructure: 'Créer Structure',
    name: 'Nom',
    amount: 'Montant',
    feeType: 'Type de Frais',
    frequency: 'Fréquence',
    dueDate: 'Date d\'échéance',
    status: 'Statut',
    actions: 'Actions',
    tuition: 'Scolarité',
    registration: 'Inscription',
    exam: 'Examen',
    transport: 'Transport',
    pta: 'APE',
    boarding: 'Internat',
    custom: 'Personnalisé',
    monthly: 'Mensuel',
    term: 'Trimestriel',
    yearly: 'Annuel',
    once: 'Unique',
    pending: 'En attente',
    partial: 'Partiel',
    paid: 'Payé',
    overdue: 'En retard',
    student: 'Élève',
    balance: 'Solde',
    recordPayment: 'Enregistrer Paiement',
    paymentMethod: 'Mode de Paiement',
    cash: 'Espèces',
    bank: 'Virement',
    mtnMomo: 'MTN MoMo',
    orangeMoney: 'Orange Money',
    card: 'Carte',
    transactionRef: 'Référence',
    save: 'Enregistrer',
    cancel: 'Annuler',
    assignFees: 'Assigner Frais',
    selectClass: 'Sélectionner Classe',
    selectStructure: 'Sélectionner Structure',
    assign: 'Assigner',
    noData: 'Aucune donnée',
    xaf: 'XAF',
    loading: 'Chargement...',
    reminders: 'Rappels',
    reports: 'Rapports',
    settings: 'Paramètres',
    sendReminder: 'Envoyer Rappel',
    remindersSent: 'Rappels Envoyés',
    upcomingDue: 'Échéances à Venir',
    overdueCount: 'En Retard',
    lastReminderSent: 'Dernier Rappel',
    autoReminders: 'Rappels Automatiques',
    reminderDaysBefore: 'Jours avant échéance',
    enableReminders: 'Activer les rappels',
    exportReport: 'Exporter Rapport',
    filterByClass: 'Filtrer par Classe',
    filterByStatus: 'Filtrer par Statut',
    dateRange: 'Période',
    generateReport: 'Générer Rapport',
    collectionReport: 'Rapport de Recouvrement',
    defaultersReport: 'Liste des Défaillants',
    paymentMethods: 'Modes de Paiement',
    enableMtnMomo: 'Activer MTN MoMo',
    enableOrangeMoney: 'Activer Orange Money',
    enableStripe: 'Activer Stripe',
    discountSettings: 'Remises',
    siblingDiscount: 'Remise Fratrie',
    scholarshipDiscount: 'Bourse',
    latePaymentPenalty: 'Pénalité Retard',
    penaltyPercent: 'Pourcentage Pénalité',
    all: 'Tous',
    thisMonth: 'Ce Mois',
    lastMonth: 'Mois Dernier',
    thisYear: 'Cette Année',
    exportExcel: 'Exporter Excel',
    exportPdf: 'Exporter PDF',
    noReminders: 'Aucun rappel à envoyer'
  },
  en: {
    title: 'Fees Management',
    subtitle: 'Manage school fees and payments',
    dashboard: 'Dashboard',
    structures: 'Fee Structures',
    assigned: 'Assigned Fees',
    payments: 'Payments',
    totalExpected: 'Total Expected',
    totalCollected: 'Total Collected',
    outstanding: 'Outstanding',
    collectionRate: 'Collection Rate',
    studentsInArrears: 'Students in Arrears',
    recentPayments: 'Recent Payments (30d)',
    createStructure: 'Create Structure',
    name: 'Name',
    amount: 'Amount',
    feeType: 'Fee Type',
    frequency: 'Frequency',
    dueDate: 'Due Date',
    status: 'Status',
    actions: 'Actions',
    tuition: 'Tuition',
    registration: 'Registration',
    exam: 'Exam',
    transport: 'Transport',
    pta: 'PTA',
    boarding: 'Boarding',
    custom: 'Custom',
    monthly: 'Monthly',
    term: 'Term',
    yearly: 'Yearly',
    once: 'One-time',
    pending: 'Pending',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    student: 'Student',
    balance: 'Balance',
    recordPayment: 'Record Payment',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    bank: 'Bank Transfer',
    mtnMomo: 'MTN MoMo',
    orangeMoney: 'Orange Money',
    card: 'Card',
    transactionRef: 'Reference',
    save: 'Save',
    cancel: 'Cancel',
    assignFees: 'Assign Fees',
    selectClass: 'Select Class',
    selectStructure: 'Select Structure',
    assign: 'Assign',
    noData: 'No data',
    xaf: 'XAF',
    loading: 'Loading...',
    reminders: 'Reminders',
    reports: 'Reports',
    settings: 'Settings',
    sendReminder: 'Send Reminder',
    remindersSent: 'Reminders Sent',
    upcomingDue: 'Upcoming Due',
    overdueCount: 'Overdue',
    lastReminderSent: 'Last Reminder',
    autoReminders: 'Auto Reminders',
    reminderDaysBefore: 'Days before due',
    enableReminders: 'Enable reminders',
    exportReport: 'Export Report',
    filterByClass: 'Filter by Class',
    filterByStatus: 'Filter by Status',
    dateRange: 'Date Range',
    generateReport: 'Generate Report',
    collectionReport: 'Collection Report',
    defaultersReport: 'Defaulters List',
    paymentMethods: 'Payment Methods',
    enableMtnMomo: 'Enable MTN MoMo',
    enableOrangeMoney: 'Enable Orange Money',
    enableStripe: 'Enable Stripe',
    discountSettings: 'Discounts',
    siblingDiscount: 'Sibling Discount',
    scholarshipDiscount: 'Scholarship',
    latePaymentPenalty: 'Late Penalty',
    penaltyPercent: 'Penalty Percent',
    all: 'All',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    noReminders: 'No reminders to send'
  }
};

const feeTypes = ['tuition', 'registration', 'exam', 'transport', 'pta', 'boarding', 'custom'];
const frequencies = ['monthly', 'term', 'yearly', 'once'];
const paymentMethods = ['cash', 'bank', 'mtn_momo', 'orange_money', 'stripe'];

export default function FeesManagement() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newStructure, setNewStructure] = useState({
    name: '',
    amount: '',
    feeType: 'tuition',
    frequency: 'term',
    dueDate: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionRef: ''
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/fees/stats']
  });

  const { data: structures, isLoading: structuresLoading } = useQuery({
    queryKey: ['/api/fees/structures']
  });

  const { data: assignedFees, isLoading: assignedLoading } = useQuery({
    queryKey: ['/api/fees/assigned']
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/fees/payments']
  });

  const { data: classes } = useQuery({
    queryKey: ['/api/classes']
  });

  const createStructureMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/fees/structures', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast({ title: 'Structure créée avec succès' });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/structures'] });
      setShowCreateDialog(false);
      setNewStructure({ name: '', amount: '', feeType: 'tuition', frequency: 'term', dueDate: '' });
    },
    onError: () => {
      toast({ title: 'Erreur lors de la création', variant: 'destructive' });
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/fees/payments', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast({ title: 'Paiement enregistré avec succès' });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
      setShowPaymentDialog(false);
      setPaymentData({ amount: '', paymentMethod: 'cash', transactionRef: '' });
    },
    onError: () => {
      toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' });
    }
  });

  const handleCreateStructure = () => {
    createStructureMutation.mutate({
      ...newStructure,
      amount: parseInt(newStructure.amount)
    });
  };

  const handleRecordPayment = () => {
    if (!selectedStudent) return;
    recordPaymentMutation.mutate({
      studentId: selectedStudent.studentId,
      amount: parseInt(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      partial: 'outline',
      paid: 'default',
      overdue: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{t[status as keyof typeof t] || status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} ${t.xaf}`;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="fees-title">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide bg-muted p-1 rounded-lg gap-1">
          <TabsTrigger 
            value="dashboard" 
            data-testid="tab-dashboard"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.dashboard}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="structures" 
            data-testid="tab-structures"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.structures}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assigned" 
            data-testid="tab-assigned"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.assigned}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            data-testid="tab-payments"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.payments}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reminders" 
            data-testid="tab-reminders"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.reminders}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            data-testid="tab-reports"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <FileBarChart className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.reports}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            data-testid="tab-settings"
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t.settings}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {statsLoading ? (
            <div className="text-center py-8">{t.loading}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t.totalExpected}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-expected">
                      {formatCurrency(stats?.stats?.totalExpected || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t.totalCollected}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="stat-collected">
                      {formatCurrency(stats?.stats?.totalCollected || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t.outstanding}</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600" data-testid="stat-outstanding">
                      {formatCurrency(stats?.stats?.totalOutstanding || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t.collectionRate}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-rate">
                      {stats?.stats?.collectionRate || 0}%
                    </div>
                    <Progress value={stats?.stats?.collectionRate || 0} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      {t.studentsInArrears}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600" data-testid="stat-arrears">
                      {stats?.stats?.studentsInArrears || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-green-500" />
                      {t.recentPayments}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600" data-testid="stat-recent">
                      {formatCurrency(stats?.stats?.recentPaymentsTotal || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats?.stats?.recentPaymentsCount || 0} transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.structures}</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="btn-create-structure">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createStructure}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>{t.createStructure}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t.name}</Label>
                    <Input
                      value={newStructure.name}
                      onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })}
                      data-testid="input-structure-name"
                    />
                  </div>
                  <div>
                    <Label>{t.amount}</Label>
                    <Input
                      type="number"
                      value={newStructure.amount}
                      onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })}
                      data-testid="input-structure-amount"
                    />
                  </div>
                  <div>
                    <Label>{t.feeType}</Label>
                    <Select
                      value={newStructure.feeType}
                      onValueChange={(v) => setNewStructure({ ...newStructure, feeType: v })}
                    >
                      <SelectTrigger data-testid="select-fee-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {t[type as keyof typeof t] || type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.frequency}</Label>
                    <Select
                      value={newStructure.frequency}
                      onValueChange={(v) => setNewStructure({ ...newStructure, frequency: v })}
                    >
                      <SelectTrigger data-testid="select-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(freq => (
                          <SelectItem key={freq} value={freq}>
                            {t[freq as keyof typeof t] || freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.dueDate}</Label>
                    <Input
                      type="date"
                      value={newStructure.dueDate}
                      onChange={(e) => setNewStructure({ ...newStructure, dueDate: e.target.value })}
                      data-testid="input-due-date"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.cancel}</Button>
                  <Button onClick={handleCreateStructure} disabled={createStructureMutation.isPending} data-testid="btn-save-structure">
                    {t.save}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.feeType}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.frequency}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structuresLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">{t.loading}</TableCell>
                    </TableRow>
                  ) : structures?.structures?.length > 0 ? (
                    structures.structures.map((structure: any) => (
                      <TableRow key={structure.id} data-testid={`structure-row-${structure.id}`}>
                        <TableCell className="font-medium">{structure.name}</TableCell>
                        <TableCell>{t[structure.feeType as keyof typeof t] || structure.feeType}</TableCell>
                        <TableCell>{formatCurrency(structure.amount)}</TableCell>
                        <TableCell>{t[structure.frequency as keyof typeof t] || structure.frequency}</TableCell>
                        <TableCell>
                          <Badge variant={structure.isActive ? 'default' : 'secondary'}>
                            {structure.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t.noData}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.assigned}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.student}</TableHead>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.balance}</TableHead>
                    <TableHead>{t.dueDate}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">{t.loading}</TableCell>
                    </TableRow>
                  ) : assignedFees?.fees?.length > 0 ? (
                    assignedFees.fees.map((fee: any) => (
                      <TableRow key={fee.id} data-testid={`assigned-row-${fee.id}`}>
                        <TableCell className="font-medium">
                          {fee.studentFirstName} {fee.studentLastName}
                        </TableCell>
                        <TableCell>{fee.structureName}</TableCell>
                        <TableCell>{formatCurrency(fee.finalAmount)}</TableCell>
                        <TableCell className={fee.balanceAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                          {formatCurrency(fee.balanceAmount)}
                        </TableCell>
                        <TableCell>
                          {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        <TableCell>
                          {fee.balanceAmount > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(fee);
                                setPaymentData({ ...paymentData, amount: fee.balanceAmount.toString() });
                                setShowPaymentDialog(true);
                              }}
                              data-testid={`btn-pay-${fee.id}`}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              {t.recordPayment}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t.noData}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{t.recordPayment}</DialogTitle>
                <DialogDescription>
                  {selectedStudent?.studentFirstName} {selectedStudent?.studentLastName} - {selectedStudent?.structureName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t.amount}</Label>
                  <Input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    data-testid="input-payment-amount"
                  />
                </div>
                <div>
                  <Label>{t.paymentMethod}</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(v) => setPaymentData({ ...paymentData, paymentMethod: v })}
                  >
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t.cash}</SelectItem>
                      <SelectItem value="bank">{t.bank}</SelectItem>
                      <SelectItem value="mtn_momo">{t.mtnMomo}</SelectItem>
                      <SelectItem value="orange_money">{t.orangeMoney}</SelectItem>
                      <SelectItem value="stripe">{t.card}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.transactionRef}</Label>
                  <Input
                    value={paymentData.transactionRef}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionRef: e.target.value })}
                    data-testid="input-transaction-ref"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>{t.cancel}</Button>
                <Button onClick={handleRecordPayment} disabled={recordPaymentMutation.isPending} data-testid="btn-save-payment">
                  {t.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.payments}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.student}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.paymentMethod}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">{t.loading}</TableCell>
                    </TableRow>
                  ) : payments?.payments?.length > 0 ? (
                    payments.payments.map((payment: any) => (
                      <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                        <TableCell className="font-medium">
                          {payment.studentFirstName} {payment.studentLastName}
                        </TableCell>
                        <TableCell>{formatCurrency(parseInt(payment.amount))}</TableCell>
                        <TableCell>
                          {t[payment.paymentMethod?.replace('_', '') as keyof typeof t] || payment.paymentMethod}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t.noData}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REMINDERS TAB */}
        <TabsContent value="reminders" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.upcomingDue}</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.stats?.upcomingDueCount || 0}</div>
                <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Dans les 7 prochains jours' : 'In next 7 days'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.overdueCount}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.stats?.studentsInArrears || 0}</div>
                <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Élèves en retard' : 'Students overdue'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.remindersSent}</CardTitle>
                <Send className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.stats?.remindersSentToday || 0}</div>
                <p className="text-xs text-muted-foreground">{language === 'fr' ? "Aujourd'hui" : 'Today'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.autoReminders}</CardTitle>
                <Bell className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  <CheckCircle className="h-6 w-6 inline" />
                </div>
                <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Activés' : 'Enabled'}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.sendReminder}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Envoyer des rappels aux parents des élèves en retard de paiement' : 'Send reminders to parents of students with overdue payments'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-reminder-class">
                    <SelectValue placeholder={t.selectClass} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="overdue">
                  <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-reminder-status">
                    <SelectValue placeholder={t.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overdue">{t.overdue}</SelectItem>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="partial">{t.partial}</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-green-600 hover:bg-green-700" data-testid="btn-send-reminders">
                  <Send className="w-4 h-4 mr-2" />
                  {t.sendReminder}
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Aperçu du message' : 'Message Preview'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' 
                    ? "Cher parent, nous vous rappelons que les frais de scolarité de votre enfant [NOM] sont en retard. Montant dû: [MONTANT] XAF. Veuillez régulariser dans les plus brefs délais."
                    : "Dear parent, this is a reminder that the school fees for your child [NAME] are overdue. Amount due: [AMOUNT] XAF. Please settle at your earliest convenience."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                {t.generateReport}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Générer des rapports de recouvrement et de paiements' : 'Generate collection and payment reports'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>{t.filterByClass}</Label>
                  <Select defaultValue="all">
                    <SelectTrigger data-testid="report-class-filter">
                      <SelectValue placeholder={t.selectClass} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      {classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.filterByStatus}</Label>
                  <Select defaultValue="all">
                    <SelectTrigger data-testid="report-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="paid">{t.paid}</SelectItem>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="overdue">{t.overdue}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.dateRange}</Label>
                  <Select defaultValue="thisMonth">
                    <SelectTrigger data-testid="report-date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                      <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                      <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                      <SelectItem value="all">{t.all}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="outline" className="flex-1" data-testid="btn-export-excel">
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="btn-export-pdf">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-green-500 transition-colors" data-testid="card-collection-report">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  {t.collectionReport}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Voir le taux de recouvrement par classe et par mois' : 'View collection rate by class and month'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.totalExpected}</span>
                    <span className="font-bold">{formatCurrency(stats?.stats?.totalExpected || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.totalCollected}</span>
                    <span className="font-bold text-green-600">{formatCurrency(stats?.stats?.totalCollected || 0)}</span>
                  </div>
                  <Progress value={stats?.stats?.collectionRate || 0} className="mt-2" />
                  <p className="text-xs text-center text-muted-foreground">{stats?.stats?.collectionRate || 0}% {language === 'fr' ? 'recouvré' : 'collected'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-red-500 transition-colors" data-testid="card-defaulters-report">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t.defaultersReport}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Liste des élèves en retard de paiement' : 'List of students with overdue payments'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.studentsInArrears}</span>
                    <span className="font-bold text-red-600">{stats?.stats?.studentsInArrears || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.outstanding}</span>
                    <span className="font-bold text-orange-600">{formatCurrency(stats?.stats?.totalOutstanding || 0)}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" data-testid="btn-view-defaulters">
                    <Download className="w-4 h-4 mr-2" />
                    {t.exportReport}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t.paymentMethods}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Configurer les modes de paiement acceptés' : 'Configure accepted payment methods'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-xs">MTN</span>
                    </div>
                    <div>
                      <p className="font-medium">MTN Mobile Money</p>
                      <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Paiement mobile' : 'Mobile payment'}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">{language === 'fr' ? 'Actif' : 'Active'}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">OM</span>
                    </div>
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Paiement mobile' : 'Mobile payment'}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">{language === 'fr' ? 'Actif' : 'Active'}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Carte bancaire' : 'Bank card'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{language === 'fr' ? 'Config requise' : 'Setup required'}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{t.cash}</p>
                      <p className="text-xs text-muted-foreground">{language === 'fr' ? 'Paiement en espèces' : 'Cash payment'}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">{language === 'fr' ? 'Actif' : 'Active'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  {t.discountSettings}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Configurer les remises et pénalités' : 'Configure discounts and penalties'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.siblingDiscount}</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="10" className="w-20" data-testid="input-sibling-discount" />
                    <span className="text-muted-foreground">%</span>
                    <p className="text-xs text-muted-foreground flex-1">
                      {language === 'fr' ? 'Appliqué au 2ème enfant et plus' : 'Applied to 2nd child and more'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.scholarshipDiscount}</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="25" className="w-20" data-testid="input-scholarship-discount" />
                    <span className="text-muted-foreground">%</span>
                    <p className="text-xs text-muted-foreground flex-1">
                      {language === 'fr' ? 'Pour les boursiers' : 'For scholarship students'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.latePaymentPenalty}</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" className="w-20" data-testid="input-late-penalty" />
                    <span className="text-muted-foreground">%</span>
                    <p className="text-xs text-muted-foreground flex-1">
                      {language === 'fr' ? 'Après 30 jours de retard' : 'After 30 days overdue'}
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-4" data-testid="btn-save-settings">
                  {t.save}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.autoReminders}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Configurer les rappels automatiques' : 'Configure automatic reminders'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label>{t.reminderDaysBefore}</Label>
                  <Select defaultValue="3">
                    <SelectTrigger data-testid="select-reminder-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {language === 'fr' ? 'jour' : 'day'}</SelectItem>
                      <SelectItem value="3">3 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                      <SelectItem value="7">7 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                      <SelectItem value="14">14 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Badge variant="default" className="bg-green-600 py-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Rappels activés' : 'Reminders enabled'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' 
                  ? 'Les rappels sont envoyés automatiquement par email et WhatsApp aux parents des élèves dont les frais arrivent à échéance.'
                  : 'Reminders are automatically sent via email and WhatsApp to parents of students with fees due soon.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
