import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, X, Eye, Download, FileText, Clock, User, AlertTriangle } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ReportValidation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const { data: reports } = useQuery({
    queryKey: ['/api/reports'],
    queryFn: () => fetch('/api/reports', { credentials: 'include' }).then(res => res.json())
  });

  const validateReportMutation = useMutation({
    mutationFn: async ({ reportId, action, comment }: { reportId: number, action: 'approve' | 'reject', comment?: string }) => {
      return apiRequest('PATCH', `/api/reports/${reportId}/validate`, { action, comment });
    },
    onSuccess: () => {
      toast({
        title: "Bulletin validé",
        description: "L'action a été effectuée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      setIsReviewDialogOpen(false);
      setReviewComment('');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la validation",
        variant: "destructive",
      });
    }
  });

  const tabs = [
    { id: 'pending', label: 'En Attente', icon: <Clock className="w-4 h-4" />, count: 8 },
    { id: 'approved', label: 'Approuvés', icon: <CheckCircle className="w-4 h-4" />, count: 156 },
    { id: 'rejected', label: 'Rejetés', icon: <X className="w-4 h-4" />, count: 3 },
    { id: 'statistics', label: 'Statistiques', icon: <FileText className="w-4 h-4" /> }
  ];

  const mockReports = {
    pending: [
      {
        id: 1,
        studentName: 'Junior Kamga',
        class: 'Terminal C',
        term: 'Premier Trimestre',
        teacher: 'M. Mvondo',
        submittedDate: '2025-01-24',
        type: 'Bulletin Trimestriel',
        average: 16.5,
        subjects: 8,
        status: 'pending'
      },
      {
        id: 2,
        studentName: 'Sophie Nkomo',
        class: 'Première S',
        term: 'Premier Trimestre',
        teacher: 'Mme Essono',
        submittedDate: '2025-01-23',
        type: 'Bulletin Trimestriel',
        average: 14.8,
        subjects: 9,
        status: 'pending'
      },
      {
        id: 3,
        studentName: 'Paul Essomba',
        class: 'Seconde A',
        term: 'Premier Trimestre',
        teacher: 'M. Abega',
        submittedDate: '2025-01-22',
        type: 'Bulletin Trimestriel',
        average: 13.2,
        subjects: 10,
        status: 'pending'
      }
    ],
    approved: [
      {
        id: 4,
        studentName: 'Marie Fotso',
        class: 'Terminal C',
        term: 'Premier Trimestre',
        teacher: 'M. Mvondo',
        submittedDate: '2025-01-20',
        approvedDate: '2025-01-21',
        type: 'Bulletin Trimestriel',
        average: 15.7,
        subjects: 8,
        status: 'approved'
      }
    ],
    rejected: [
      {
        id: 5,
        studentName: 'Alex Biya',
        class: 'Première L',
        term: 'Premier Trimestre',
        teacher: 'M. Nkomo',
        submittedDate: '2025-01-19',
        rejectedDate: '2025-01-20',
        type: 'Bulletin Trimestriel',
        average: 8.2,
        subjects: 9,
        status: 'rejected',
        rejectionReason: 'Notes incomplètes - Manque évaluation philosophie'
      }
    ]
  };

  const handleReportReview = (report: any) => {
    setSelectedReport(report);
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedReport) {
      validateReportMutation.mutate({
        reportId: selectedReport.id,
        action: 'approve',
        comment: reviewComment
      });
    }
  };

  const handleReject = () => {
    if (selectedReport && reviewComment.trim()) {
      validateReportMutation.mutate({
        reportId: selectedReport.id,
        action: 'reject',
        comment: reviewComment
      });
    } else {
      toast({
        title: "Commentaire requis",
        description: "Veuillez indiquer la raison du rejet",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation Bulletins</h2>
          <p className="text-gray-600">Système complet de validation avec workflow d'approbation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter Rapport
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Modèles
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Pending Reports Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bulletins en Attente de Validation</h3>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  <SelectItem value="terminal">Terminal</SelectItem>
                  <SelectItem value="premiere">Première</SelectItem>
                  <SelectItem value="seconde">Seconde</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Rechercher élève..." className="w-48" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockReports.pending.map((report) => (
              <ModernCard key={report.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{report.studentName}</h4>
                      <p className="text-sm text-gray-600">{report.class}</p>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Moyenne générale</p>
                      <p className="text-lg font-bold text-blue-600">{report.average}/20</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Matières</p>
                      <p className="text-lg font-bold text-green-600">{report.subjects}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Enseignant: {report.teacher}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Soumis: {report.submittedDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{report.type}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportReview(report)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Examiner
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* Approved Reports Tab */}
      {activeTab === 'approved' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bulletins Approuvés</h3>
            
            <div className="space-y-4">
              {mockReports.approved.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <h4 className="font-medium">{report.studentName}</h4>
                      <p className="text-sm text-gray-600">{report.class} - {report.term}</p>
                      <p className="text-xs text-gray-500">Approuvé le {report.approvedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{report.average}/20</p>
                      <p className="text-xs text-gray-500">{report.subjects} matières</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {/* Rejected Reports Tab */}
      {activeTab === 'rejected' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bulletins Rejetés</h3>
            
            <div className="space-y-4">
              {mockReports.rejected.map((report) => (
                <div key={report.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="w-8 h-8 text-red-500 mt-1" />
                      <div>
                        <h4 className="font-medium">{report.studentName}</h4>
                        <p className="text-sm text-gray-600">{report.class} - {report.term}</p>
                        <p className="text-xs text-gray-500">Rejeté le {report.rejectedDate}</p>
                        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                          <strong>Raison:</strong> {report.rejectionReason}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button size="sm">
                        Resoummettre
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">167</h3>
              <p className="text-sm text-gray-600">Total Bulletins</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">156</h3>
              <p className="text-sm text-gray-600">Approuvés (93%)</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-600">8</h3>
              <p className="text-sm text-gray-600">En Attente (5%)</p>
            </ModernCard>

            <ModernCard className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">3</h3>
              <p className="text-sm text-gray-600">Rejetés (2%)</p>
            </ModernCard>
          </div>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Délais de Validation</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Temps moyen de validation</span>
                <span className="font-bold text-blue-600">1.2 jours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Délai le plus rapide</span>
                <span className="font-bold text-green-600">2 heures</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Délai le plus long</span>
                <span className="font-bold text-orange-600">5 jours</span>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition par Niveau</h3>
            
            <div className="space-y-3">
              {[
                { level: 'Terminal', total: 45, approved: 42, pending: 2, rejected: 1 },
                { level: 'Première', total: 52, approved: 48, pending: 3, rejected: 1 },
                { level: 'Seconde', total: 48, approved: 45, pending: 2, rejected: 1 },
                { level: 'Troisième', total: 22, approved: 21, pending: 1, rejected: 0 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.level}</p>
                    <p className="text-sm text-gray-600">{item.total} bulletins</p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">{item.approved} ✓</span>
                    <span className="text-yellow-600">{item.pending} ⏳</span>
                    <span className="text-red-600">{item.rejected} ✗</span>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Examiner le Bulletin</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Élève</label>
                  <p className="text-lg font-semibold">{selectedReport.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Classe</label>
                  <p className="text-lg font-semibold">{selectedReport.class}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Période</label>
                  <p>{selectedReport.term}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Enseignant</label>
                  <p>{selectedReport.teacher}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Moyenne Générale</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedReport.average}/20</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Matières</p>
                  <p className="text-2xl font-bold text-green-600">{selectedReport.subjects}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Rang</p>
                  <p className="text-2xl font-bold text-purple-600">3e</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire de validation
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e?.target?.value)}
                  placeholder="Ajouter un commentaire (obligatoire pour le rejet)..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReject}
                  className="text-red-600 hover:text-red-700"
                  disabled={validateReportMutation.isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Rejeter
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={validateReportMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approuver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}