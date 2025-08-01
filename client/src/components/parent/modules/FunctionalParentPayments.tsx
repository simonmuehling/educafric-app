import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, DollarSign, Calendar, AlertTriangle,
  CheckCircle2, Clock, Filter, Search, 
  Download, Eye, Plus, Wallet, X
} from 'lucide-react';

interface ParentPayment {
  id: number;
  studentName: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate: string;
  status: string;
  paymentMethod: string;
  category: string;
  invoiceNumber: string;
  academicYear: string;
  term: string;
  installmentNumber: number;
  totalInstallments: number;
  lateFee: number;
  discount: number;
  notes: string;
}

const FunctionalParentPayments: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({
    studentName: '',
    description: '',
    amount: '',
    currency: 'XAF',
    dueDate: '',
    category: 'tuition',
    notes: ''
  });

  // Fetch parent payments data from PostgreSQL API
  const { data: payments = [], isLoading } = useQuery<ParentPayment[]>({
    queryKey: ['/api/parent/payments'],
    enabled: !!user
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/parent/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Failed to create payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/payments'] });
      toast({
        title: language === 'fr' ? "✅ Paiement Créé" : "✅ Payment Created",
        description: language === 'fr' ? "Le nouveau paiement a été créé avec succès" : "New payment has been created successfully"
      });
      setIsNewPaymentOpen(false);
      setNewPaymentForm({
        studentName: '',
        description: '',
        amount: '',
        currency: 'XAF',
        dueDate: '',
        category: 'tuition',
        notes: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? "❌ Erreur" : "❌ Error",
        description: error.message || (language === 'fr' ? "Impossible de créer le paiement" : "Failed to create payment"),
        variant: "destructive"
      });
    }
  });

  const text = {
    fr: {
      title: 'Paiements Scolaires',
      subtitle: 'Gestion des frais de scolarité et paiements',
      loading: 'Chargement des paiements...',
      noData: 'Aucun paiement enregistré',
      stats: {
        totalPayments: 'Paiements Totaux',
        paidAmount: 'Montant Payé',
        pendingAmount: 'À Payer',
        overduePayments: 'En Retard'
      },
      status: {
        paid: 'Payé',
        pending: 'En attente',
        overdue: 'En retard',
        cancelled: 'Annulé',
        partial: 'Partiel'
      },
      category: {
        tuition: 'Frais de scolarité',
        registration: 'Inscription',
        transport: 'Transport',
        meals: 'Restauration',
        books: 'Manuels',
        activities: 'Activités',
        uniform: 'Uniforme',
        exams: 'Examens'
      },
      paymentMethod: {
        cash: 'Espèces',
        bank_transfer: 'Virement bancaire',
        card: 'Carte bancaire',
        mobile_money: 'Mobile Money',
        check: 'Chèque'
      },
      actions: {
        payNow: 'Payer Maintenant',
        viewInvoice: 'Voir Facture',
        downloadReceipt: 'Télécharger Reçu',
        requestInstallment: 'Demander Échelonnement',
        contactAdmin: 'Contacter Administration',
        newPayment: 'Nouveau Paiement'
      },
      filters: {
        allStudents: 'Tous les enfants',
        allStatuses: 'Tous statuts',
        allCategories: 'Toutes catégories'
      },
      payment: {
        student: 'Élève',
        amount: 'Montant',
        dueDate: 'Date d\'échéance',
        paidDate: 'Date de paiement',
        method: 'Mode de paiement',
        category: 'Catégorie',
        invoice: 'Facture N°',
        installment: 'Versement',
        lateFee: 'Pénalité',
        discount: 'Remise',
        notes: 'Notes'
      },
      newPaymentForm: {
        title: 'Créer un Nouveau Paiement',
        studentName: 'Nom de l\'élève',
        description: 'Description',
        amount: 'Montant',
        currency: 'Devise',
        dueDate: 'Date d\'échéance',
        category: 'Catégorie',
        notes: 'Notes',
        create: 'Créer le Paiement',
        cancel: 'Annuler',
        selectStudent: 'Sélectionner un élève',
        enterDescription: 'Entrez la description du paiement',
        enterAmount: 'Entrez le montant',
        selectDate: 'Sélectionnez la date d\'échéance',
        selectCategory: 'Sélectionnez une catégorie',
        addNotes: 'Ajoutez des notes (optionnel)'
      }
    },
    en: {
      title: 'School Payments',
      subtitle: 'Manage tuition fees and school payments',
      loading: 'Loading payments...',
      noData: 'No payments recorded',
      stats: {
        totalPayments: 'Total Payments',
        paidAmount: 'Paid Amount',
        pendingAmount: 'Pending Amount',
        overduePayments: 'Overdue'
      },
      status: {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
        partial: 'Partial'
      },
      category: {
        tuition: 'Tuition fees',
        registration: 'Registration',
        transport: 'Transport',
        meals: 'Meals',
        books: 'Books',
        activities: 'Activities',
        uniform: 'Uniform',
        exams: 'Exams'
      },
      paymentMethod: {
        cash: 'Cash',
        bank_transfer: 'Bank transfer',
        card: 'Card',
        mobile_money: 'Mobile Money',
        check: 'Check'
      },
      actions: {
        payNow: 'Pay Now',
        viewInvoice: 'View Invoice',
        downloadReceipt: 'Download Receipt',
        requestInstallment: 'Request Installment',
        contactAdmin: 'Contact Administration',
        newPayment: 'New Payment'
      },
      filters: {
        allStudents: 'All children',
        allStatuses: 'All statuses',
        allCategories: 'All categories'
      },
      payment: {
        student: 'Student',
        amount: 'Amount',
        dueDate: 'Due date',
        paidDate: 'Payment date',
        method: 'Payment method',
        category: 'Category',
        invoice: 'Invoice #',
        installment: 'Installment',
        lateFee: 'Late fee',
        discount: 'Discount',
        notes: 'Notes'
      },
      newPaymentForm: {
        title: 'Create New Payment',
        studentName: 'Student Name',
        description: 'Description',
        amount: 'Amount',
        currency: 'Currency',
        dueDate: 'Due Date',
        category: 'Category',
        notes: 'Notes',
        create: 'Create Payment',
        cancel: 'Cancel',
        selectStudent: 'Select a student',
        enterDescription: 'Enter payment description',
        enterAmount: 'Enter amount',
        selectDate: 'Select due date',
        selectCategory: 'Select category',
        addNotes: 'Add notes (optional)'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter payments
  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(payment => {
    if (!payment) return false;
    const matchesStudent = selectedStudent === 'all' || payment.studentName === selectedStudent;
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || payment.category === selectedCategory;
    return matchesStudent && matchesStatus && matchesCategory;
  });

  // Get unique values for filters
  const uniqueStudents = Array.from(new Set((Array.isArray(payments) ? payments : []).map(p => p.studentName)));
  const uniqueCategories = Array.from(new Set((Array.isArray(payments) ? payments : []).map(p => p.category)));

  // Calculate statistics
  const totalPayments = (Array.isArray(filteredPayments) ? filteredPayments.length : 0);
  const paidAmount = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = (Array.isArray(filteredPayments) ? filteredPayments : []).filter(p => p.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      partial: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tuition: 'bg-blue-500',
      registration: 'bg-green-500',
      transport: 'bg-yellow-500',
      meals: 'bg-orange-500',
      books: 'bg-purple-500',
      activities: 'bg-pink-500',
      uniform: 'bg-indigo-500',
      exams: 'bg-red-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPaymentForm.studentName || !newPaymentForm.description || !newPaymentForm.amount || !newPaymentForm.dueDate) {
      toast({
        title: language === 'fr' ? "❌ Champs requis" : "❌ Required fields",
        description: language === 'fr' ? "Veuillez remplir tous les champs obligatoires" : "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const paymentData = {
      ...newPaymentForm,
      amount: parseInt(newPaymentForm.amount),
      invoiceNumber: `INV-${Date.now()}`,
      academicYear: '2024-2025',
      term: 'Trimestre 2',
      installmentNumber: 1,
      totalInstallments: 1,
      lateFee: 0,
      discount: 0
    };

    createPaymentMutation.mutate(paymentData);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Dialog open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700" data-testid="new-payment-button">
              <Plus className="w-4 h-4 mr-2" />
              {t.actions.newPayment}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{(t.newPaymentForm.title || '')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <Label htmlFor="studentName">{t.newPaymentForm.studentName} *</Label>
                <Select value={newPaymentForm.studentName} onValueChange={(value) => setNewPaymentForm(prev => ({...prev, studentName: value}))}>
                  <SelectTrigger data-testid="student-select">
                    <SelectValue placeholder={t.newPaymentForm.selectStudent} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(uniqueStudents) ? uniqueStudents : []).map(student => (
                      <SelectItem key={student} value={student}>{student}</SelectItem>
                    ))}
                    <SelectItem value="Junior Kamga">Junior Kamga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">{(t.newPaymentForm.description || '')} *</Label>
                <Input
                  id="description"
                  value={newPaymentForm.description || ''}
                  onChange={(e) => setNewPaymentForm(prev => ({...prev, description: e.target.value}))}
                  placeholder={t.newPaymentForm.enterDescription}
                  data-testid="description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">{t.newPaymentForm.amount} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPaymentForm.amount}
                    onChange={(e) => setNewPaymentForm(prev => ({...prev, amount: e.target.value}))}
                    placeholder={t.newPaymentForm.enterAmount}
                    data-testid="amount-input"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">{t.newPaymentForm.currency}</Label>
                  <Select value={newPaymentForm.currency} onValueChange={(value) => setNewPaymentForm(prev => ({...prev, currency: value}))}>
                    <SelectTrigger data-testid="currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">CFA (XAF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">{t.newPaymentForm.dueDate} *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newPaymentForm.dueDate}
                  onChange={(e) => setNewPaymentForm(prev => ({...prev, dueDate: e.target.value}))}
                  data-testid="due-date-input"
                />
              </div>

              <div>
                <Label htmlFor="category">{t.newPaymentForm.category}</Label>
                <Select value={newPaymentForm.category} onValueChange={(value) => setNewPaymentForm(prev => ({...prev, category: value}))}>
                  <SelectTrigger data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.category).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{t.newPaymentForm.notes}</Label>
                <Textarea
                  id="notes"
                  value={newPaymentForm.notes}
                  onChange={(e) => setNewPaymentForm(prev => ({...prev, notes: e.target.value}))}
                  placeholder={t.newPaymentForm.addNotes}
                  rows={3}
                  data-testid="notes-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="flex-1"
                  data-testid="cancel-payment-button"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.newPaymentForm.cancel}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={createPaymentMutation.isPending}
                  data-testid="create-payment-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createPaymentMutation.isPending ? 
                    (language === 'fr' ? 'Création...' : 'Creating...') : 
                    t.newPaymentForm.create
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalPayments}</p>
                <p className="text-2xl font-bold">{totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.paidAmount}</p>
                <p className="text-xl font-bold text-green-600">{formatAmount(paidAmount, 'CFA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.pendingAmount}</p>
                <p className="text-xl font-bold text-yellow-600">{formatAmount(pendingAmount, 'CFA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.overduePayments}</p>
                <p className="text-2xl font-bold text-red-600">{overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des Paiements - Reorganized Layout */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold mb-4">Historique des Paiements</h3>
            {/* Filter Fields - Moved Under Title */}
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allStudents}</option>
                {(Array.isArray(uniqueStudents) ? uniqueStudents : []).map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allStatuses}</option>
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allCategories}</option>
                {(Array.isArray(uniqueCategories) ? uniqueCategories : []).map(category => (
                  <option key={category} value={category}>
                    {t.category[category as keyof typeof t.category]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredPayments) ? filteredPayments.length : 0) === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun paiement ne correspond à vos critères de filtre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredPayments) ? filteredPayments : []).map((payment) => (
                <Card key={payment.id} className={`border hover:shadow-md transition-shadow ${
                  payment.status === 'overdue' ? 'border-red-200 bg-red-50' : 
                  payment.status === 'pending' && isOverdue(payment.dueDate, payment.status) ? 'border-orange-200 bg-orange-50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 ${getCategoryColor(payment.category)} rounded-lg`}>
                            {getStatusIcon(payment.status)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {payment.description || ''}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {payment.studentName} - {t.category[payment.category as keyof typeof t.category]}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatAmount(payment.amount, payment.currency)}
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.dueDate}</p>
                            <p className={`font-medium ${isOverdue(payment.dueDate, payment.status) ? 'text-red-600' : ''}`}>
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.paidDate}</p>
                            <p className="font-medium">
                              {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'Non payé'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.method}</p>
                            <p className="font-medium">
                              {payment.paymentMethod ? t.paymentMethod[payment.paymentMethod as keyof typeof t.paymentMethod] : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.payment?.invoice}</p>
                            <p className="font-medium">{payment.invoiceNumber}</p>
                          </div>
                        </div>

                        {(payment.installmentNumber > 0 || payment.lateFee > 0 || payment.discount > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                            {payment.installmentNumber > 0 && (
                              <div>
                                <p className="text-sm text-gray-500">{t?.payment?.installment}</p>
                                <p className="font-medium">{payment.installmentNumber}/{payment.totalInstallments}</p>
                              </div>
                            )}
                            {payment.lateFee > 0 && (
                              <div>
                                <p className="text-sm text-gray-500">{t?.payment?.lateFee}</p>
                                <p className="font-medium text-red-600">+{formatAmount(payment.lateFee, payment.currency)}</p>
                              </div>
                            )}
                            {payment.discount > 0 && (
                              <div>
                                <p className="text-sm text-gray-500">{t?.payment?.discount}</p>
                                <p className="font-medium text-green-600">-{formatAmount(payment.discount, payment.currency)}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {payment.notes && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Notes:</p>
                            <p className="text-sm text-blue-700">{payment.notes}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {payment.status === 'pending' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t?.actions?.payNow}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {t?.actions?.viewInvoice}
                          </Button>
                          {payment.status === 'paid' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              {t?.actions?.downloadReceipt}
                            </Button>
                          )}
                          {payment.status === 'pending' && payment.amount > 50000 && (
                            <Button variant="outline" size="sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              {t?.actions?.requestInstallment}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalParentPayments;