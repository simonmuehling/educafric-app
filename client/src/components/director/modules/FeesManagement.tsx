import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatName } from '@/utils/formatName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DollarSign, Plus, Users, TrendingUp, AlertTriangle, CheckCircle,
  CreditCard, Send, Edit, Trash2, Download, Bell, Settings, FileBarChart,
  RefreshCw, Printer, MessageSquare, Mail, Smartphone, UserCheck, School
} from 'lucide-react';
import { generateBilingualPrintHeaderHtml } from '@/components/shared/StandardBilingualPrintHeader';

const translations = {
  fr: {
    title: 'Gestion des Frais',
    subtitle: 'Gérez les frais de scolarité, paiements et rappels',
    dashboard: 'Tableau de Bord',
    feeGrid: 'Grille Tarifaire',
    assigned: 'Élèves & Rappels',
    reports: 'Rapports',
    settings: 'Paramètres',
    totalExpected: 'Total Attendu',
    totalCollected: 'Total Collecté',
    outstanding: 'Solde Restant',
    collectionRate: 'Taux Recouvrement',
    studentsInArrears: 'Élèves en Retard',
    recentPayments: 'Paiements Récents',
    createFee: 'Créer Tarif',
    editFee: 'Modifier Tarif',
    name: 'Nom du tarif',
    amountCFA: 'Montant (CFA)',
    feeType: 'Type de frais',
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
    selectClass: 'Sélectionner une classe',
    selectStudents: 'Sélectionner des élèves',
    allStudentsInClass: 'Tous les élèves de la classe',
    specificStudents: 'Élèves spécifiques',
    all: 'Tous',
    noData: 'Aucune donnée',
    loading: 'Chargement...',
    sendReminder: 'Envoyer Rappel',
    printReminder: 'Imprimer Rappel',
    printReceipt: 'Imprimer Reçu',
    printFee: 'Imprimer',
    bulkReminder: 'Rappel Groupé',
    selectAll: 'Tout sélectionner',
    selectedCount: 'sélectionnés',
    channels: 'Canaux de notification',
    email: 'Email',
    whatsapp: 'WhatsApp',
    pwa: 'Notification Push',
    reminderSent: 'Rappel envoyé avec succès',
    remindersSent: 'Rappels envoyés avec succès',
    exportExcel: 'Exporter Excel',
    exportPdf: 'Exporter PDF',
    generateReport: 'Générer Rapport',
    filterByClass: 'Par Classe',
    filterByStatus: 'Par Statut',
    thisMonth: 'Ce Mois',
    lastMonth: 'Mois Dernier',
    thisYear: 'Cette Année',
    parent: 'Parent',
    phone: 'Téléphone',
    class: 'Classe',
    target: 'Cible',
    active: 'Actif',
    inactive: 'Inactif',
    feeCreated: 'Tarif créé avec succès',
    feeUpdated: 'Tarif modifié avec succès',
    feeDeleted: 'Tarif supprimé',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce tarif ?',
    noStudentsSelected: 'Veuillez sélectionner au moins une classe ou des élèves',
    assignToClass: 'Assigner à une classe',
    assignToStudents: 'Assigner à des élèves',
    parentInfo: 'Info Parent',
    collectionSummary: 'Résumé des Recouvrements',
    overduePayments: 'Paiements en Retard',
    upcomingDue: 'Échéances Prochaines',
    todayReminders: 'Rappels Aujourd\'hui'
  },
  en: {
    title: 'Fees Management',
    subtitle: 'Manage school fees, payments and reminders',
    dashboard: 'Dashboard',
    feeGrid: 'Fee Grid',
    assigned: 'Students & Reminders',
    reports: 'Reports',
    settings: 'Settings',
    totalExpected: 'Total Expected',
    totalCollected: 'Total Collected',
    outstanding: 'Outstanding',
    collectionRate: 'Collection Rate',
    studentsInArrears: 'Students in Arrears',
    recentPayments: 'Recent Payments',
    createFee: 'Create Fee',
    editFee: 'Edit Fee',
    name: 'Fee Name',
    amountCFA: 'Amount (CFA)',
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
    selectClass: 'Select a class',
    selectStudents: 'Select students',
    allStudentsInClass: 'All students in class',
    specificStudents: 'Specific students',
    all: 'All',
    noData: 'No data',
    loading: 'Loading...',
    sendReminder: 'Send Reminder',
    printReminder: 'Print Reminder',
    printReceipt: 'Print Receipt',
    printFee: 'Print',
    bulkReminder: 'Bulk Reminder',
    selectAll: 'Select All',
    selectedCount: 'selected',
    channels: 'Notification Channels',
    email: 'Email',
    whatsapp: 'WhatsApp',
    pwa: 'Push Notification',
    reminderSent: 'Reminder sent successfully',
    remindersSent: 'Reminders sent successfully',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    generateReport: 'Generate Report',
    filterByClass: 'By Class',
    filterByStatus: 'By Status',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    parent: 'Parent',
    phone: 'Phone',
    class: 'Class',
    target: 'Target',
    active: 'Active',
    inactive: 'Inactive',
    feeCreated: 'Fee created successfully',
    feeUpdated: 'Fee updated successfully',
    feeDeleted: 'Fee deleted',
    confirmDelete: 'Are you sure you want to delete this fee?',
    noStudentsSelected: 'Please select at least one class or students',
    assignToClass: 'Assign to class',
    assignToStudents: 'Assign to students',
    parentInfo: 'Parent Info',
    collectionSummary: 'Collection Summary',
    overduePayments: 'Overdue Payments',
    upcomingDue: 'Upcoming Due',
    todayReminders: 'Today\'s Reminders'
  }
};

const feeTypes = ['tuition', 'registration', 'exam', 'transport', 'pta', 'boarding', 'custom'];
const frequencies = ['monthly', 'term', 'yearly', 'once'];

interface Student {
  id: number;
  studentId?: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  classId?: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

interface FeeStructure {
  id: number;
  name: string;
  amount: number;
  feeType: string;
  frequency: string;
  dueDate?: string;
  isActive: boolean;
  classId?: number;
  className?: string;
}

export default function FeesManagement() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [deletingFee, setDeletingFee] = useState<FeeStructure | null>(null);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [selectedFeeIds, setSelectedFeeIds] = useState<number[]>([]);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportPeriod, setReportPeriod] = useState('thisMonth');
  const [reportClass, setReportClass] = useState('all');
  const [reminderChannels, setReminderChannels] = useState({ email: true, whatsapp: true, pwa: true });
  
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: '',
    feeType: 'tuition',
    frequency: 'term',
    dueDate: '',
    classId: '',
    assignType: 'class',
    selectedStudentIds: [] as number[],
    isActive: true
  });
  
  const [paymentData, setPaymentData] = useState({
    amount: '', paymentMethod: 'cash', transactionRef: ''
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({ queryKey: ['/api/fees/stats'] });
  const { data: structuresData, isLoading: structuresLoading } = useQuery({ queryKey: ['/api/fees/structures'] });
  const { data: assignedData, isLoading: assignedLoading } = useQuery({ queryKey: ['/api/fees/assigned'] });
  const { data: paymentsData } = useQuery({ queryKey: ['/api/fees/payments'] });
  const { data: classesData } = useQuery({ queryKey: ['/api/classes'] });
  const { data: studentsData } = useQuery({ queryKey: ['/api/director/students'] });
  const { data: schoolSettings } = useQuery({ queryKey: ['/api/director/settings'] });

  const classes = Array.isArray(classesData) ? classesData : ((classesData as any)?.classes || []);
  const stats = (statsData as any)?.stats || statsData || {};
  const structures: FeeStructure[] = (structuresData as any)?.structures || [];
  const assignedFees = (assignedData as any)?.fees || [];
  const payments = (paymentsData as any)?.payments || [];
  const allStudents: Student[] = Array.isArray(studentsData) ? studentsData : ((studentsData as any)?.students || []);
  const school = (schoolSettings as any)?.settings?.school || (schoolSettings as any)?.school || {};
  const schoolLogoUrl = (schoolSettings as any)?.settings?.profile?.logoUrl || (schoolSettings as any)?.settings?.school?.logoUrl || school?.logoUrl || null;

  const filteredStudentsByClass = feeForm.classId && feeForm.classId !== 'all'
    ? allStudents.filter(s => s.classId?.toString() === feeForm.classId)
    : allStudents;

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

  const resetFeeForm = () => {
    setFeeForm({
      name: '', amount: '', feeType: 'tuition', frequency: 'term', dueDate: '',
      classId: '', assignType: 'class', selectedStudentIds: [], isActive: true
    });
    setEditingFee(null);
  };

  const openCreateDialog = () => {
    resetFeeForm();
    setShowFeeDialog(true);
  };

  const openEditDialog = (fee: FeeStructure) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name,
      amount: fee.amount.toString(),
      feeType: fee.feeType,
      frequency: fee.frequency,
      dueDate: fee.dueDate || '',
      classId: fee.classId?.toString() || '',
      assignType: 'class',
      selectedStudentIds: [],
      isActive: fee.isActive
    });
    setShowFeeDialog(true);
  };

  const createFeeMutation = useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create the fee structure
      const response = await apiRequest('POST', '/api/fees/structures', data);
      const result = await response.json();
      
      // Step 2: Automatically assign fee to students based on class or selected students
      if (result.structure?.id) {
        const assignData: any = { feeStructureId: result.structure.id };
        
        if (data.studentIds && data.studentIds.length > 0) {
          // Assign to specific students
          assignData.studentIds = data.studentIds;
        } else if (data.classId) {
          // Assign to all students in a class
          assignData.classId = data.classId;
        } else {
          // Assign to all students (no class filter)
          assignData.classId = null;
        }
        
        await apiRequest('POST', '/api/fees/assign', assignData);
      }
      
      return result;
    },
    onSuccess: () => {
      toast({ title: t.feeCreated, description: language === 'fr' ? 'Frais créé et assigné aux élèves' : 'Fee created and assigned to students' });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/structures'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
      setShowFeeDialog(false);
      resetFeeForm();
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const updateFeeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/fees/structures/${editingFee?.id}`, data),
    onSuccess: () => {
      toast({ title: t.feeUpdated });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/structures'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
      setShowFeeDialog(false);
      resetFeeForm();
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const deleteFeeMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/fees/structures/${deletingFee?.id}`, {}),
    onSuccess: () => {
      toast({ title: t.feeDeleted });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/structures'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
      setShowDeleteDialog(false);
      setDeletingFee(null);
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

  const assignExistingFeeMutation = useMutation({
    mutationFn: async (fee: FeeStructure) => {
      const assignData: any = { feeStructureId: fee.id };
      if (fee.classId) {
        assignData.classId = fee.classId;
      }
      return apiRequest('POST', '/api/fees/assign', assignData);
    },
    onSuccess: () => {
      toast({ 
        title: language === 'fr' ? 'Frais assigné' : 'Fee assigned',
        description: language === 'fr' ? 'Les frais ont été assignés aux élèves' : 'Fee has been assigned to students'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fees/stats'] });
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' })
  });

  const handleSaveFee = () => {
    const data = {
      name: feeForm.name,
      amount: parseInt(feeForm.amount),
      feeType: feeForm.feeType,
      frequency: feeForm.frequency,
      dueDate: feeForm.dueDate || null,
      classId: feeForm.classId && feeForm.classId !== 'all' ? parseInt(feeForm.classId) : null,
      studentIds: feeForm.assignType === 'students' ? feeForm.selectedStudentIds : null,
      isActive: feeForm.isActive
    };

    if (editingFee) {
      updateFeeMutation.mutate(data);
    } else {
      createFeeMutation.mutate(data);
    }
  };

  const handlePrintFee = (fee: FeeStructure) => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const className = classes.find((c: any) => c.id === fee.classId)?.name || 'Toutes les classes';
    const bilingualHeader = generateBilingualPrintHeaderHtml(
      school,
      { fr: 'GRILLE TARIFAIRE', en: 'FEE SCHEDULE' }
    );
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Tarif - ${fee.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #ddd; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .amount { text-align: center; margin: 30px 0; padding: 20px; border: 3px solid #16a34a; background: #f0fdf4; }
        .amount-value { font-size: 32px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      ${bilingualHeader}
      <div class="row"><span class="label">${t.name}:</span><span class="value">${fee.name}</span></div>
      <div class="row"><span class="label">${t.feeType}:</span><span class="value">${t[fee.feeType as keyof typeof t] || fee.feeType}</span></div>
      <div class="row"><span class="label">${t.frequency}:</span><span class="value">${t[fee.frequency as keyof typeof t] || fee.frequency}</span></div>
      <div class="row"><span class="label">${t.class}:</span><span class="value">${className}</span></div>
      <div class="row"><span class="label">${t.dueDate}:</span><span class="value">${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</span></div>
      <div class="row"><span class="label">${t.status}:</span><span class="value">${fee.isActive ? t.active : t.inactive}</span></div>
      <div class="amount">
        <div style="font-size:14px;color:#166534;margin-bottom:5px;">${language === 'fr' ? 'MONTANT' : 'AMOUNT'} / ${language === 'fr' ? 'AMOUNT' : 'MONTANT'}</div>
        <div class="amount-value">${parseInt(fee.amount.toString()).toLocaleString()} CFA</div>
      </div>
      <div class="footer">
        <p>${new Date().toLocaleDateString()}</p>
        <p>Powered by EDUCAFRIC</p>
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const handlePrintReceipt = (fee: any) => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const bilingualHeader = generateBilingualPrintHeaderHtml(
      school,
      { fr: 'REÇU DE PAIEMENT', en: 'PAYMENT RECEIPT' },
      { fr: `Élève: ${fee.studentFirstName} ${fee.studentLastName}`, en: `Student: ${fee.studentFirstName} ${fee.studentLastName}` }
    );
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Reçu - ${fee.studentFirstName} ${fee.studentLastName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #ccc; }
        .amount { text-align: center; margin: 25px 0; padding: 20px; border: 3px solid #16a34a; background: #f0fdf4; }
        .amount-value { font-size: 28px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #888; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      ${bilingualHeader}
      <div class="row"><span>${t.student} / Student:</span><span><b>${fee.studentFirstName} ${fee.studentLastName}</b></span></div>
      <div class="row"><span>${t.name} / Fee Name:</span><span>${fee.structureName}</span></div>
      <div class="row"><span>${t.status} / Status:</span><span>${t[fee.status as keyof typeof t] || fee.status}</span></div>
      <div class="row"><span>Date:</span><span>${new Date().toLocaleDateString()}</span></div>
      <div class="amount">
        <div style="font-size:13px;color:#166534;margin-bottom:5px;">MONTANT PAYÉ / AMOUNT PAID</div>
        <div class="amount-value">${((fee.finalAmount || 0) - (fee.balanceAmount || 0)).toLocaleString()} CFA</div>
      </div>
      <div class="footer">Merci / Thank you - ${school?.name || 'EDUCAFRIC'}</div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  };

  const handlePrintReminder = (fee: any) => {
    const w = window.open('', '_blank', 'width=600,height=900');
    if (!w) { toast({ title: 'Popup bloqué', variant: 'destructive' }); return; }
    
    const bilingualHeader = generateBilingualPrintHeaderHtml(
      school,
      { fr: 'RAPPEL DE PAIEMENT', en: 'PAYMENT REMINDER' },
      { fr: `Élève: ${fee.studentFirstName} ${fee.studentLastName}`, en: `Student: ${fee.studentFirstName} ${fee.studentLastName}` }
    );
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Rappel - ${fee.studentFirstName} ${fee.studentLastName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .content { margin: 20px 0; }
        .highlight { background: #fef2f2; border: 3px solid #dc2626; padding: 20px; margin: 25px 0; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #dc2626; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature { margin-top: 50px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>
      ${bilingualHeader}
      <div class="content">
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Cher Parent/Tuteur, / Dear Parent/Guardian,</strong></p>
        <p>Nous vous rappelons que les frais de scolarité de votre enfant <strong>${fee.studentFirstName} ${fee.studentLastName}</strong> sont en attente de paiement.</p>
        <p><em>This is a reminder that the school fees for your child <strong>${fee.studentFirstName} ${fee.studentLastName}</strong> are pending payment.</em></p>
        <div class="highlight">
          <div style="font-size:14px;margin-bottom:10px;">MONTANT DÛ / AMOUNT DUE</div>
          <div class="amount">${(fee.balanceAmount || 0).toLocaleString()} CFA</div>
          <div style="margin-top:10px;font-size:14px;">${fee.structureName}</div>
        </div>
        <p>Nous vous prions de bien vouloir régulariser cette situation dans les meilleurs délais.</p>
        <p><em>Please settle this amount at your earliest convenience.</em></p>
      </div>
      <div class="footer">
        <p>Cordialement, / Best regards,</p>
        <div class="signature">
          <p>_____________________________</p>
          <p>La Direction / The Administration</p>
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
      toast({ title: t.noStudentsSelected, variant: 'destructive' });
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

  const toggleStudentSelection = (studentId: number) => {
    setFeeForm(prev => ({
      ...prev,
      selectedStudentIds: prev.selectedStudentIds.includes(studentId)
        ? prev.selectedStudentIds.filter(id => id !== studentId)
        : [...prev.selectedStudentIds, studentId]
    }));
  };

  const handleExportReport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await fetch(`/api/fees/reports/export?format=${format}&period=${reportPeriod}&classId=${reportClass}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-frais-${reportPeriod}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: language === 'fr' ? 'Rapport téléchargé' : 'Report downloaded' });
      } else {
        toast({ title: language === 'fr' ? 'Erreur lors de l\'export' : 'Export error', variant: 'destructive' });
      }
    } catch {
      toast({ title: language === 'fr' ? 'Erreur lors de l\'export' : 'Export error', variant: 'destructive' });
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
          <TabsTrigger value="feeGrid" className="text-xs sm:text-sm py-2">
            <DollarSign className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t.feeGrid}</span>
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

        {/* DASHBOARD - Real data from /api/fees/stats */}
        <TabsContent value="dashboard" className="space-y-4">
          {statsLoading ? (
            <div className="text-center py-8">{t.loading}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      {t.totalExpected}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalExpected || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {t.totalCollected}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalCollected || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      {t.outstanding}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.outstanding || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-600" />
                      {t.studentsInArrears}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats?.studentsInArrears || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t.collectionRate}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={stats?.collectionRate || 0} className="h-4" />
                    <p className="text-center mt-2 font-bold text-lg">{stats?.collectionRate || 0}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t.collectionSummary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">{t.overduePayments}</span>
                      <Badge variant="destructive">{stats?.overdue || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-600">{t.upcomingDue}</span>
                      <Badge variant="outline">{stats?.upcomingDue || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">{t.todayReminders}</span>
                      <Badge>{stats?.remindersSentToday || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* FEE GRID - Create/Edit/Delete/Print */}
        <TabsContent value="feeGrid" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{t.feeGrid}</h3>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-1" />{t.createFee}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.feeType}</TableHead>
                    <TableHead>{t.amountCFA}</TableHead>
                    <TableHead>{t.frequency}</TableHead>
                    <TableHead>{t.class}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structuresLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center">{t.loading}</TableCell></TableRow>
                  ) : structures.length > 0 ? structures.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>{t[fee.feeType as keyof typeof t] || fee.feeType}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(fee.amount)}</TableCell>
                      <TableCell>{t[fee.frequency as keyof typeof t] || fee.frequency}</TableCell>
                      <TableCell>{fee.className || classes.find((c: any) => c.id === fee.classId)?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={fee.isActive ? 'default' : 'secondary'}>
                          {fee.isActive ? t.active : t.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => assignExistingFeeMutation.mutate(fee)} 
                            disabled={assignExistingFeeMutation.isPending}
                            title={language === 'fr' ? 'Assigner aux élèves' : 'Assign to students'}
                          >
                            <Users className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handlePrintFee(fee)} title={t.printFee}>
                            <Printer className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(fee)} title={t.editFee}>
                            <Edit className="w-4 h-4 text-orange-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeletingFee(fee); setShowDeleteDialog(true); }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
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

          {/* Create/Edit Fee Dialog */}
          <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
            <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFee ? t.editFee : t.createFee}</DialogTitle>
                <DialogDescription>
                  {language === 'fr' ? 'Configurez les détails du tarif et assignez-le à une classe ou des élèves' : 'Configure fee details and assign to a class or students'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.name} *</Label>
                    <Input 
                      placeholder={language === 'fr' ? 'Ex: Frais de scolarité T1' : 'Ex: Tuition Term 1'}
                      value={feeForm.name} 
                      onChange={e => setFeeForm({...feeForm, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label>{t.amountCFA} *</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="50000"
                        value={feeForm.amount} 
                        onChange={e => setFeeForm({...feeForm, amount: e.target.value})} 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">CFA</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.feeType}</Label>
                    <Select value={feeForm.feeType} onValueChange={v => setFeeForm({...feeForm, feeType: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(type => <SelectItem key={type} value={type}>{t[type as keyof typeof t] || type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.frequency}</Label>
                    <Select value={feeForm.frequency} onValueChange={v => setFeeForm({...feeForm, frequency: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {frequencies.map(freq => <SelectItem key={freq} value={freq}>{t[freq as keyof typeof t] || freq}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.dueDate}</Label>
                    <Input type="date" value={feeForm.dueDate} onChange={e => setFeeForm({...feeForm, dueDate: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={feeForm.isActive} onCheckedChange={v => setFeeForm({...feeForm, isActive: v})} />
                    <Label>{feeForm.isActive ? t.active : t.inactive}</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-2 block">{t.target}</Label>
                  <div className="flex gap-4 mb-4">
                    <Button 
                      type="button"
                      variant={feeForm.assignType === 'class' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFeeForm({...feeForm, assignType: 'class', selectedStudentIds: []})}
                    >
                      <School className="w-4 h-4 mr-1" />{t.assignToClass}
                    </Button>
                    <Button 
                      type="button"
                      variant={feeForm.assignType === 'students' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFeeForm({...feeForm, assignType: 'students'})}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />{t.assignToStudents}
                    </Button>
                  </div>

                  <div>
                    <Label>{t.selectClass}</Label>
                    <Select value={feeForm.classId} onValueChange={v => setFeeForm({...feeForm, classId: v, selectedStudentIds: []})}>
                      <SelectTrigger><SelectValue placeholder={t.selectClass} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.all}</SelectItem>
                        {classes.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {feeForm.assignType === 'students' && (
                    <div className="mt-4">
                      <Label className="mb-2 block">{t.selectStudents} ({feeForm.selectedStudentIds.length} {t.selectedCount})</Label>
                      <ScrollArea className="h-48 border rounded-md p-2">
                        {filteredStudentsByClass.length > 0 ? filteredStudentsByClass.map((student) => {
                          const name = formatName(student.firstName || student.first_name || '', student.lastName || student.last_name || '', language as 'fr' | 'en');
                          return (
                            <div key={student.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={feeForm.selectedStudentIds.includes(student.id)}
                                  onCheckedChange={() => toggleStudentSelection(student.id)}
                                />
                                <span className="font-medium">{name || `Élève #${student.id}`}</span>
                              </div>
                              {(student.parentName || student.parentPhone) && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="text-blue-600">{student.parentName}</span>
                                  {student.parentPhone && <span className="ml-2">{student.parentPhone}</span>}
                                </div>
                              )}
                            </div>
                          );
                        }) : (
                          <div className="text-center py-4 text-muted-foreground">
                            {(feeForm.classId && feeForm.classId !== 'all') ? t.noData : (language === 'fr' ? 'Sélectionnez une classe' : 'Select a class')}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowFeeDialog(false); resetFeeForm(); }}>{t.cancel}</Button>
                <Button 
                  onClick={handleSaveFee} 
                  disabled={createFeeMutation.isPending || updateFeeMutation.isPending || !feeForm.name || !feeForm.amount}
                >
                  {(createFeeMutation.isPending || updateFeeMutation.isPending) ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{language === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion'}</DialogTitle>
                <DialogDescription>{t.confirmDelete}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="font-medium">{deletingFee?.name}</p>
                <p className="text-muted-foreground">{formatCurrency(deletingFee?.amount || 0)}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>{t.cancel}</Button>
                <Button variant="destructive" onClick={() => deleteFeeMutation.mutate()} disabled={deleteFeeMutation.isPending}>
                  {deleteFeeMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                  {language === 'fr' ? 'Supprimer' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <span className="text-sm text-blue-700 font-medium">{selectedFeeIds.length} {t.selectedCount}</span>
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
                    <TableHead>{t.parent}</TableHead>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.amountCFA}</TableHead>
                    <TableHead>{t.balance}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center">{t.loading}</TableCell></TableRow>
                  ) : filteredFees.length > 0 ? filteredFees.map((fee: any) => (
                    <TableRow key={fee.id} className={selectedFeeIds.includes(fee.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedFeeIds.includes(fee.id)} 
                          onCheckedChange={() => toggleFeeSelection(fee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{fee.studentFirstName} {fee.studentLastName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {fee.parentName && <div className="text-blue-600">{fee.parentName}</div>}
                          {fee.parentPhone && <div className="text-muted-foreground">{fee.parentPhone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{fee.structureName}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(fee.finalAmount)}</TableCell>
                      <TableCell className={fee.balanceAmount > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
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
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <p className="font-medium text-lg mb-2">{language === 'fr' ? 'Aucun frais assigné' : 'No fees assigned'}</p>
                          <p className="text-sm mb-4">
                            {language === 'fr' 
                              ? 'Pour envoyer des rappels, créez d\'abord un frais dans "Grille Tarifaire". Les frais seront automatiquement assignés aux élèves.'
                              : 'To send reminders, first create a fee in "Fee Grid". Fees will be automatically assigned to students.'}
                          </p>
                          <Button variant="outline" onClick={() => setActiveTab('feeGrid')}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            {language === 'fr' ? 'Aller à Grille Tarifaire' : 'Go to Fee Grid'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
                  <Label>{t.amountCFA}</Label>
                  <div className="relative">
                    <Input type="number" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">CFA</span>
                  </div>
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
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch checked={reminderChannels.email} onCheckedChange={v => setReminderChannels({...reminderChannels, email: v})} />
                    <Mail className="w-5 h-5 text-blue-600" /><span className="font-medium">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch checked={reminderChannels.whatsapp} onCheckedChange={v => setReminderChannels({...reminderChannels, whatsapp: v})} />
                    <MessageSquare className="w-5 h-5 text-green-600" /><span className="font-medium">{t.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch checked={reminderChannels.pwa} onCheckedChange={v => setReminderChannels({...reminderChannels, pwa: v})} />
                    <Smartphone className="w-5 h-5 text-purple-600" /><span className="font-medium">{t.pwa}</span>
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

        {/* REPORTS - Real data export */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.reports}</CardTitle>
              <CardDescription>{language === 'fr' ? 'Générer et exporter des rapports de frais' : 'Generate and export fee reports'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <Label className="mb-2 block">{t.filterByClass}</Label>
                  <Select value={reportClass} onValueChange={setReportClass}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      {classes.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">{language === 'fr' ? 'Période' : 'Period'}</Label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                      <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                      <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="mb-3 block font-semibold">{t.generateReport}</Label>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleExportReport('excel')} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />{t.exportExcel}
                  </Button>
                  <Button variant="outline" onClick={() => handleExportReport('pdf')} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />{t.exportPdf}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">{language === 'fr' ? 'Aperçu des données' : 'Data Preview'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">{structures.length}</div>
                    <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Tarifs' : 'Fees'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">{assignedFees.length}</div>
                    <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Assignations' : 'Assignments'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold">{payments.length}</div>
                    <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Paiements' : 'Payments'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalCollected || 0)}</div>
                    <div className="text-sm text-muted-foreground">{t.totalCollected}</div>
                  </div>
                </div>
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
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Rappels par Email' : 'Email Reminders'}</span>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Envoyer des rappels par email aux parents' : 'Send reminders via email to parents'}</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Rappels WhatsApp' : 'WhatsApp Reminders'}</span>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Envoyer des rappels via WhatsApp' : 'Send reminders via WhatsApp'}</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Notifications Push' : 'Push Notifications'}</span>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Envoyer des notifications push sur l\'app' : 'Send push notifications on the app'}</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Rappels automatiques' : 'Auto reminders'}</span>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? '7 jours avant l\'échéance' : '7 days before due date'}</p>
                  </div>
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
