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
  Download
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
    loading: 'Chargement...'
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
    loading: 'Loading...'
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t.dashboard}
          </TabsTrigger>
          <TabsTrigger value="structures" data-testid="tab-structures">
            <DollarSign className="w-4 h-4 mr-2" />
            {t.structures}
          </TabsTrigger>
          <TabsTrigger value="assigned" data-testid="tab-assigned">
            <Users className="w-4 h-4 mr-2" />
            {t.assigned}
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            <CreditCard className="w-4 h-4 mr-2" />
            {t.payments}
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
      </Tabs>
    </div>
  );
}
