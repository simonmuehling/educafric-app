import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DollarSign, Plus, Users, TrendingUp, AlertTriangle, CheckCircle,
  CreditCard, Send, Edit, Trash2, Download, Bell, Settings, FileBarChart,
  RefreshCw, Printer, MessageSquare, Mail, Phone, Smartphone
} from 'lucide-react';

const translations = {
  fr: {
    title: 'Gestion des Frais',
    subtitle: 'Gérez les frais de scolarité, paiements et rappels',
    dashboard: 'Tableau de Bord',
    structures: 'Structures',
    assigned: 'Élèves & Rappels',
    reports: 'Rapports',
    settings: 'Paramètres',
    totalExpected: 'Total Attendu',
    totalCollected: 'Total Collecté',
    outstanding: 'Solde Restant',
    collectionRate: 'Taux Recouvrement',
    studentsInArrears: 'Élèves en Retard',
    createStructure: 'Créer Structure',
    name: 'Nom',
    amount: 'Montant',
    feeType: 'Type',
    frequency: 'Fréquence',
    dueDate: 'Échéance',
    status: 'Statut',
    actions: 'Actions',
    tuition: 'Scolarité',
    registration: 'Inscription',
    exam: 'Examen',
    transport: 'Transport',
    pta: 'APE',
    boarding: 'Internat',
    custom: 'Autre',
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
    recordPayment: 'Paiement',
    paymentMethod: 'Mode',
    cash: 'Espèces',
    bank: 'Virement',
    mtnMomo: 'MTN MoMo',
    orangeMoney: 'Orange Money',
    transactionRef: 'Référence',
    save: 'Enregistrer',
    cancel: 'Annuler',
    selectClass: 'Classe',
    all: 'Tous',
    noData: 'Aucune donnée',
    loading: 'Chargement...',
    sendReminder: 'Envoyer Rappel',
    printReminder: 'Imprimer Rappel',
    printReceipt: 'Imprimer Reçu',
    printStructure: 'Imprimer',
    bulkReminder: 'Rappel Groupé',
    selectAll: 'Tout sélectionner',
    selectedCount: 'sélectionnés',
    channels: 'Canaux',
    email: 'Email',
    whatsapp: 'WhatsApp',
    pwa: 'Notification',
    reminderSent: 'Rappel envoyé',
    remindersSent: 'Rappels envoyés',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    generateReport: 'Générer',
    filterByClass: 'Par Classe',
    filterByStatus: 'Par Statut',
    thisMonth: 'Ce Mois',
    lastMonth: 'Mois Dernier',
    thisYear: 'Cette Année',
    parent: 'Parent',
    phone: 'Téléphone'
  },
  en: {
    title: 'Fees Management',
    subtitle: 'Manage school fees, payments and reminders',
    dashboard: 'Dashboard',
    structures: 'Structures',
    assigned: 'Students & Reminders',
    reports: 'Reports',
    settings: 'Settings',
    totalExpected: 'Total Expected',
    totalCollected: 'Total Collected',
    outstanding: 'Outstanding',
    collectionRate: 'Collection Rate',
    studentsInArrears: 'Students in Arrears',
    createStructure: 'Create Structure',
    name: 'Name',
    amount: 'Amount',
    feeType: 'Type',
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
    custom: 'Other',
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
    recordPayment: 'Payment',
    paymentMethod: 'Method',
    cash: 'Cash',
    bank: 'Transfer',
    mtnMomo: 'MTN MoMo',
    orangeMoney: 'Orange Money',
    transactionRef: 'Reference',
    save: 'Save',
    cancel: 'Cancel',
    selectClass: 'Class',
    all: 'All',
    noData: 'No data',
    loading: 'Loading...',
    sendReminder: 'Send Reminder',
    printReminder: 'Print Reminder',
    printReceipt: 'Print Receipt',
    printStructure: 'Print',
    bulkReminder: 'Bulk Reminder',
    selectAll: 'Select All',
    selectedCount: 'selected',
    channels: 'Channels',
    email: 'Email',
    whatsapp: 'WhatsApp',
    pwa: 'Notification',
    reminderSent: 'Reminder sent',
    remindersSent: 'Reminders sent',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    generateReport: 'Generate',
    filterByClass: 'By Class',
    filterByStatus: 'By Status',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    parent: 'Parent',
    phone: 'Phone'
  }
};

const feeTypes = ['tuition', 'registration', 'exam', 'transport', 'pta', 'boarding', 'custom'];
const frequencies = ['monthly', 'term', 'yearly', 'once'];

export default function FeesManagement() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [selectedFeeIds, setSelectedFeeIds] = useState<number[]>([]);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reminderChannels, setReminderChannels] = useState({ email: true, whatsapp: true, pwa: true });
  
  const [newStructure, setNewStructure] = useState({
    name: '', amount: '', feeType: 'tuition', frequency: 'term', dueDate: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '', paymentMethod: 'cash', transactionRef: ''
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({ queryKey: ['/api/fees/stats'] });
  const { data: structuresData, isLoading: structuresLoading } = useQuery({ queryKey: ['/api/fees/structures'] });
  const { data: assignedData, isLoading: assignedLoading } = useQuery({ queryKey: ['/api/fees/assigned'] });
  const { data: classesData } = useQuery({ queryKey: ['/api/classes'] });
  const { data: schoolSettings } = useQuery({ queryKey: ['/api/director/settings'] });

  const classes = Array.isArray(classesData) ? classesData : ((classesData as any)?.classes || []);
  const stats = (statsData as any)?.stats || statsData || {};
  const structures = (structuresData as any)?.structures || [];
  const assignedFees = (assignedData as any)?.fees || [];
  const school = (schoolSettings as any)?.settings?.school || (schoolSettings as any)?.school || {};

  const filteredFees = assignedFees.filter((fee: any) => {
    if (filterClass !== 'all' && fee.classId?.toString() !== filterClass) return false;
    if (filterStatus !== 'all' && fee.status !== filterStatus) return false;
    return true;
  });

  const formatCurrency = (amount: number) => `${(amount || 0).toLocaleString()} CFA`;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {t[status as keyof typeof t] || status}
    </span>;
  };

  const createStructureMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/fees/structures', data),
    onSuccess: () => {
      toast({ title: language === 'fr' ? 'Structure créée' : 'Structure created' });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/structures'] });
      setShowCreateDialog(false);
      setNewStructure({ name: '', amount: '', feeType: 'tuition', frequency: 'term', dueDate: '' });
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/fees/payments', data),
    onSuccess: () => {
      toast({ title: language === 'fr' ? 'Paiement enregistré' : 'Payment recorded' });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
      setShowPaymentDialog(false);
      setPaymentData({ amount: '', paymentMethod: 'cash', transactionRef: '' });
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const sendReminderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/fees/reminders', data),
    onSuccess: () => {
      toast({ title: selectedFeeIds.length > 1 ? t.remindersSent : t.reminderSent });
      setShowReminderDialog(false);
      setSelectedFeeIds([]);
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const handlePrintStructure = (structure: any) => {
    const w = window.open('', '_blank', 'width=600,height=700');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Structure - ${structure.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .school-name { font-size: 24px; font-weight: bold; color: #1a365d; }
        .title { font-size: 18px; font-weight: bold; margin: 20px 0; padding: 10px; background: #1a365d; color: white; text-align: center; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #ddd; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .amount { text-align: center; margin: 30px 0; padding: 20px; border: 3px solid #16a34a; background: #f0fdf4; }
        .amount-value { font-size: 32px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      <div class="header">
        <div class="school-name">${school?.name || 'EDUCAFRIC'}</div>
        <div style="font-size:12px;margin-top:5px;">${school?.address || ''}</div>
      </div>
      <div class="title">${language === 'fr' ? 'STRUCTURE DE FRAIS' : 'FEE STRUCTURE'}</div>
      <div class="row"><span class="label">${t.name}:</span><span class="value">${structure.name}</span></div>
      <div class="row"><span class="label">${t.feeType}:</span><span class="value">${t[structure.feeType as keyof typeof t] || structure.feeType}</span></div>
      <div class="row"><span class="label">${t.frequency}:</span><span class="value">${t[structure.frequency as keyof typeof t] || structure.frequency}</span></div>
      <div class="row"><span class="label">${t.dueDate}:</span><span class="value">${structure.dueDate ? new Date(structure.dueDate).toLocaleDateString() : '-'}</span></div>
      <div class="row"><span class="label">${t.status}:</span><span class="value">${structure.isActive ? 'Actif' : 'Inactif'}</span></div>
      <div class="amount">
        <div style="font-size:14px;color:#166534;margin-bottom:5px;">${language === 'fr' ? 'MONTANT' : 'AMOUNT'}</div>
        <div class="amount-value">${parseInt(structure.amount).toLocaleString()} CFA</div>
      </div>
      <div class="footer">Powered by EDUCAFRIC</div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const handlePrintReceipt = (fee: any) => {
    const w = window.open('', '_blank', 'width=500,height=600');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Reçu - ${fee.studentFirstName} ${fee.studentLastName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
        .school-name { font-size: 20px; font-weight: bold; }
        .title { text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; padding: 8px; background: #f0f0f0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; }
        .amount { text-align: center; margin: 20px 0; padding: 15px; border: 2px solid #16a34a; background: #f0fdf4; }
        .amount-value { font-size: 24px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #888; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      <div class="header"><div class="school-name">${school?.name || 'EDUCAFRIC'}</div></div>
      <div class="title">${language === 'fr' ? 'REÇU DE PAIEMENT' : 'PAYMENT RECEIPT'}</div>
      <div class="row"><span>${t.student}:</span><span><b>${fee.studentFirstName} ${fee.studentLastName}</b></span></div>
      <div class="row"><span>${t.name}:</span><span>${fee.structureName}</span></div>
      <div class="row"><span>${t.status}:</span><span>${t[fee.status as keyof typeof t] || fee.status}</span></div>
      <div class="row"><span>Date:</span><span>${new Date().toLocaleDateString()}</span></div>
      <div class="amount">
        <div style="font-size:12px;color:#166534;">${language === 'fr' ? 'MONTANT PAYÉ' : 'AMOUNT PAID'}</div>
        <div class="amount-value">${(fee.finalAmount - fee.balanceAmount).toLocaleString()} CFA</div>
      </div>
      <div class="footer">Merci - ${school?.name || 'EDUCAFRIC'}</div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const handlePrintReminder = (fee: any) => {
    const w = window.open('', '_blank', 'width=500,height=700');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Rappel - ${fee.studentFirstName} ${fee.studentLastName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .school-name { font-size: 22px; font-weight: bold; color: #1a365d; }
        .title { font-size: 18px; font-weight: bold; margin: 25px 0; padding: 12px; background: #dc2626; color: white; text-align: center; }
        .content { margin: 20px 0; }
        .highlight { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; text-align: center; }
        .amount { font-size: 28px; font-weight: bold; color: #dc2626; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature { margin-top: 50px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      <div class="header">
        <div class="school-name">${school?.name || 'EDUCAFRIC'}</div>
        <div style="margin-top:5px;">${school?.address || ''}</div>
        <div style="margin-top:5px;">Tél: ${school?.phone || ''}</div>
      </div>
      <div class="title">${language === 'fr' ? 'RAPPEL DE PAIEMENT' : 'PAYMENT REMINDER'}</div>
      <div class="content">
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>${language === 'fr' ? 'Cher Parent/Tuteur' : 'Dear Parent/Guardian'},</strong></p>
        <p>${language === 'fr' 
          ? `Nous vous rappelons que les frais de scolarité de votre enfant <strong>${fee.studentFirstName} ${fee.studentLastName}</strong> sont en attente de paiement.`
          : `This is a reminder that the school fees for your child <strong>${fee.studentFirstName} ${fee.studentLastName}</strong> are pending payment.`
        }</p>
        <div class="highlight">
          <div style="font-size:14px;margin-bottom:10px;">${language === 'fr' ? 'MONTANT DÛ' : 'AMOUNT DUE'}</div>
          <div class="amount">${fee.balanceAmount?.toLocaleString()} CFA</div>
          <div style="margin-top:10px;font-size:14px;">${fee.structureName}</div>
        </div>
        <p>${language === 'fr' 
          ? 'Nous vous prions de bien vouloir régulariser cette situation dans les meilleurs délais.'
          : 'Please settle this amount at your earliest convenience.'
        }</p>
      </div>
      <div class="footer">
        <p>${language === 'fr' ? 'Cordialement,' : 'Best regards,'}</p>
        <div class="signature">
          <p>_____________________________</p>
          <p>${language === 'fr' ? 'La Direction' : 'The Administration'}</p>
        </div>
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const handleSendReminder = (fee: any) => {
    setSelectedFee(fee);
    setSelectedFeeIds([fee.id]);
    setShowReminderDialog(true);
  };

  const handleBulkReminder = () => {
    if (selectedFeeIds.length === 0) {
      toast({ title: language === 'fr' ? 'Sélectionnez des élèves' : 'Select students', variant: 'destructive' });
      return;
    }
    setShowReminderDialog(true);
  };

  const confirmSendReminders = () => {
    const channels = Object.entries(reminderChannels).filter(([, v]) => v).map(([k]) => k);
    sendReminderMutation.mutate({ feeIds: selectedFeeIds, channels });
  };

  const toggleFeeSelection = (feeId: number) => {
    setSelectedFeeIds(prev => prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]);
  };

  const selectAllFees = () => {
    if (selectedFeeIds.length === filteredFees.length) {
      setSelectedFeeIds([]);
    } else {
      setSelectedFeeIds(filteredFees.map((f: any) => f.id));
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2">
            <TrendingUp className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.dashboard}</span>
          </TabsTrigger>
          <TabsTrigger value="structures" className="text-xs sm:text-sm py-2">
            <DollarSign className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.structures}</span>
          </TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs sm:text-sm py-2">
            <Users className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.assigned}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm py-2">
            <FileBarChart className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.reports}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">
            <Settings className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.settings}</span>
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          {statsLoading ? (
            <div className="text-center py-8">{t.loading}</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.totalExpected}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats?.totalExpected || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.totalCollected}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalCollected || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.outstanding}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.outstanding || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.studentsInArrears}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.studentsInArrears || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t.collectionRate}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats?.collectionRate || 0} className="h-4" />
              <p className="text-center mt-2 font-bold">{stats?.collectionRate || 0}%</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STRUCTURES */}
        <TabsContent value="structures" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{t.structures}</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />{t.createStructure}</Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>{t.createStructure}</DialogTitle>
                  <DialogDescription>{language === 'fr' ? 'Créer une nouvelle structure de frais' : 'Create a new fee structure'}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.name}</Label>
                      <Input value={newStructure.name} onChange={e => setNewStructure({...newStructure, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>{t.amount} (CFA)</Label>
                      <Input type="number" value={newStructure.amount} onChange={e => setNewStructure({...newStructure, amount: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.feeType}</Label>
                      <Select value={newStructure.feeType} onValueChange={v => setNewStructure({...newStructure, feeType: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {feeTypes.map(type => <SelectItem key={type} value={type}>{t[type as keyof typeof t] || type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.frequency}</Label>
                      <Select value={newStructure.frequency} onValueChange={v => setNewStructure({...newStructure, frequency: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {frequencies.map(freq => <SelectItem key={freq} value={freq}>{t[freq as keyof typeof t] || freq}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t.dueDate}</Label>
                    <Input type="date" value={newStructure.dueDate} onChange={e => setNewStructure({...newStructure, dueDate: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.cancel}</Button>
                  <Button onClick={() => createStructureMutation.mutate(newStructure)} disabled={createStructureMutation.isPending}>
                    {createStructureMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.save}
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
                    <TableRow><TableCell colSpan={6} className="text-center">{t.loading}</TableCell></TableRow>
                  ) : structures.length > 0 ? structures.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{t[s.feeType as keyof typeof t] || s.feeType}</TableCell>
                      <TableCell>{formatCurrency(s.amount)}</TableCell>
                      <TableCell>{t[s.frequency as keyof typeof t] || s.frequency}</TableCell>
                      <TableCell><Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Actif' : 'Inactif'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePrintStructure(s)} title={t.printStructure}>
                            <Printer className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t.noData}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSIGNED FEES - WITH REMINDERS */}
        <TabsContent value="assigned" className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder={t.filterByClass} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      {classes.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder={t.filterByStatus} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="partial">{t.partial}</SelectItem>
                      <SelectItem value="overdue">{t.overdue}</SelectItem>
                      <SelectItem value="paid">{t.paid}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-blue-700">{selectedFeeIds.length} {t.selectedCount}</span>
                  <Button size="sm" variant="outline" onClick={selectAllFees} className="bg-white">
                    <CheckCircle className="w-4 h-4 mr-1" />{t.selectAll}
                  </Button>
                  <Button size="sm" onClick={handleBulkReminder} disabled={selectedFeeIds.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Bell className="w-4 h-4 mr-1" />{t.bulkReminder}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t.student}</TableHead>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.balance}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center">{t.loading}</TableCell></TableRow>
                  ) : filteredFees.length > 0 ? filteredFees.map((fee: any) => (
                    <TableRow key={fee.id} className={selectedFeeIds.includes(fee.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedFeeIds.includes(fee.id)} 
                          onCheckedChange={() => toggleFeeSelection(fee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.studentFirstName} {fee.studentLastName}</div>
                          {fee.parentPhone && <div className="text-xs text-muted-foreground">{fee.parentPhone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{fee.structureName}</TableCell>
                      <TableCell>{formatCurrency(fee.finalAmount)}</TableCell>
                      <TableCell className={fee.balanceAmount > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {formatCurrency(fee.balanceAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {fee.balanceAmount > 0 && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedFee(fee); setPaymentData({...paymentData, amount: fee.balanceAmount.toString()}); setShowPaymentDialog(true); }} title={t.recordPayment}>
                              <CreditCard className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleSendReminder(fee)} title={t.sendReminder}>
                            <Send className="w-4 h-4 text-orange-500" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handlePrintReminder(fee)} title={t.printReminder}>
                            <Printer className="w-4 h-4 text-purple-600" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(fee)} title={t.printReceipt}>
                            <Printer className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t.noData}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{t.recordPayment}</DialogTitle>
                <DialogDescription>{selectedFee?.studentFirstName} {selectedFee?.studentLastName} - {selectedFee?.structureName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t.amount} (CFA)</Label>
                  <Input type="number" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                </div>
                <div>
                  <Label>{t.paymentMethod}</Label>
                  <Select value={paymentData.paymentMethod} onValueChange={v => setPaymentData({...paymentData, paymentMethod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t.cash}</SelectItem>
                      <SelectItem value="bank">{t.bank}</SelectItem>
                      <SelectItem value="mtn_momo">{t.mtnMomo}</SelectItem>
                      <SelectItem value="orange_money">{t.orangeMoney}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.transactionRef}</Label>
                  <Input value={paymentData.transactionRef} onChange={e => setPaymentData({...paymentData, transactionRef: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>{t.cancel}</Button>
                <Button onClick={() => recordPaymentMutation.mutate({ ...paymentData, studentId: selectedFee?.studentId, assignedFeeId: selectedFee?.id })} disabled={recordPaymentMutation.isPending}>
                  {recordPaymentMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reminder Dialog */}
          <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{t.sendReminder}</DialogTitle>
                <DialogDescription>
                  {selectedFeeIds.length === 1 
                    ? `${selectedFee?.studentFirstName} ${selectedFee?.studentLastName}`
                    : `${selectedFeeIds.length} ${language === 'fr' ? 'élèves sélectionnés' : 'students selected'}`
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label>{t.channels}</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Switch checked={reminderChannels.email} onCheckedChange={v => setReminderChannels({...reminderChannels, email: v})} />
                    <Mail className="w-4 h-4 text-blue-600" /><span>{t.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={reminderChannels.whatsapp} onCheckedChange={v => setReminderChannels({...reminderChannels, whatsapp: v})} />
                    <MessageSquare className="w-4 h-4 text-green-600" /><span>{t.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={reminderChannels.pwa} onCheckedChange={v => setReminderChannels({...reminderChannels, pwa: v})} />
                    <Smartphone className="w-4 h-4 text-purple-600" /><span>{t.pwa}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReminderDialog(false)}>{t.cancel}</Button>
                <Button onClick={confirmSendReminders} disabled={sendReminderMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
                  {sendReminderMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" />{t.sendReminder}</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.reports}</CardTitle>
              <CardDescription>{language === 'fr' ? 'Générer et exporter des rapports' : 'Generate and export reports'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder={t.filterByClass} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {classes.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select defaultValue="thisMonth">
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                    <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                    <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Download className="w-4 h-4 mr-1" />{t.exportExcel}</Button>
                <Button variant="outline"><Download className="w-4 h-4 mr-1" />{t.exportPdf}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings}</CardTitle>
              <CardDescription>{language === 'fr' ? 'Configuration des notifications et rappels automatiques' : 'Configure notifications and automatic reminders'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{language === 'fr' ? 'Rappels par Email' : 'Email Reminders'}</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span>{language === 'fr' ? 'Rappels WhatsApp' : 'WhatsApp Reminders'}</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span>{language === 'fr' ? 'Notifications Push' : 'Push Notifications'}</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <span>{language === 'fr' ? 'Rappels automatiques (7 jours avant échéance)' : 'Auto reminders (7 days before due)'}</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
