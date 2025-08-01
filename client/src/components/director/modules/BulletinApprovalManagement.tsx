import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle, Clock, XCircle, FileText, Eye, Download, Send } from 'lucide-react';

const BulletinApprovalManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);

  const text = {
    fr: {
      title: 'Validation Bulletins',
      subtitle: 'Approbation et distribution des bulletins scolaires',
      totalBulletins: 'Bulletins Totaux',
      pendingApproval: 'En Attente d\'Approbation',
      approved: 'Approuvés',
      distributed: 'Distribués',
      studentName: 'Élève',
      class: 'Classe',
      quarter: 'Trimestre',
      teacher: 'Enseignant',
      status: 'Statut',
      average: 'Moyenne',
      actions: 'Actions',
      pending: 'En attente',
      draft: 'Brouillon',
      review: 'À réviser',
      approve: 'Approuver',
      reject: 'Rejeter',
      view: 'Voir',
      download: 'Télécharger',
      distribute: 'Distribuer',
      bulletinApproved: 'Bulletin approuvé!',
      bulletinRejected: 'Bulletin rejeté',
      bulletinDistributed: 'Bulletin distribué aux parents'
    },
    en: {
      title: 'Bulletin Approval',
      subtitle: 'School report card approval and distribution',
      totalBulletins: 'Total Bulletins',
      pendingApproval: 'Pending Approval',
      approved: 'Approved',
      distributed: 'Distributed',
      studentName: 'Student',
      class: 'Class',
      quarter: 'Quarter',
      teacher: 'Teacher',
      status: 'Status',
      average: 'Average',
      actions: 'Actions',
      pending: 'Pending',
      draft: 'Draft',
      review: 'Under Review',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      download: 'Download',
      distribute: 'Distribute',
      bulletinApproved: 'Bulletin approved!',
      bulletinRejected: 'Bulletin rejected',
      bulletinDistributed: 'Bulletin distributed to parents'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock data for demonstration
  const bulletins = [
    {
      id: 1,
      studentName: 'Junior Kamga',
      class: '6ème A',
      quarter: 'Trimestre 1',
      teacher: 'Marie Nguesso',
      status: 'pending',
      average: 16.75,
      submittedDate: '2025-01-28',
      subjects: 8
    },
    {
      id: 2,
      studentName: 'Marie Nkomo',
      class: '5ème B',
      quarter: 'Trimestre 1',
      teacher: 'Paul Mvondo',
      status: 'approved',
      average: 14.25,
      submittedDate: '2025-01-27',
      subjects: 9
    },
    {
      id: 3,
      studentName: 'Paul Essomba',
      class: '4ème C',
      quarter: 'Trimestre 1',
      teacher: 'Sophie Biya',
      status: 'review',
      average: 12.50,
      submittedDate: '2025-01-26',
      subjects: 10
    }
  ];

  const handleApproveBulletin = (bulletin: any) => {
    toast({
      title: t.bulletinApproved,
      description: `${bulletin.studentName} - ${bulletin.class}: ${language === 'fr' ? 'Moyenne' : 'Average'} ${bulletin.average}/20`
    });
  };

  const handleRejectBulletin = (bulletin: any) => {
    toast({
      title: t.bulletinRejected,
      description: `${bulletin.studentName} - ${language === 'fr' ? 'Renvoyé pour correction' : 'Sent back for correction'}`
    });
  };

  const handleDistributeBulletin = (bulletin: any) => {
    toast({
      title: t.bulletinDistributed,
      description: `${bulletin.studentName}: ${language === 'fr' ? 'Bulletin envoyé aux parents par email et SMS' : 'Bulletin sent to parents via email and SMS'}`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      review: 'bg-blue-100 text-blue-800',
      distributed: 'bg-purple-100 text-purple-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-green-600 font-bold';
    if (average >= 12) return 'text-blue-600 font-bold';
    if (average >= 10) return 'text-orange-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                {t.title || ''}
              </h2>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.totalBulletins}</p>
                <p className="text-2xl font-bold">{(Array.isArray(bulletins) ? bulletins.length : 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.pendingApproval}</p>
                <p className="text-2xl font-bold">{(Array.isArray(bulletins) ? bulletins : []).filter(b => b.status === 'pending' || b.status === 'review').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.approved}</p>
                <p className="text-2xl font-bold">{(Array.isArray(bulletins) ? bulletins : []).filter(b => b.status === 'approved').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.distributed}</p>
                <p className="text-2xl font-bold">{(Array.isArray(bulletins) ? bulletins : []).filter(b => b.status === 'distributed').length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bulletins Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">{t.studentName}</th>
                  <th className="text-left p-4 font-semibold">{t.class}</th>
                  <th className="text-left p-4 font-semibold">{t.quarter}</th>
                  <th className="text-left p-4 font-semibold">{t.teacher}</th>
                  <th className="text-left p-4 font-semibold">{t.average}</th>
                  <th className="text-left p-4 font-semibold">{t.status}</th>
                  <th className="text-left p-4 font-semibold">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(bulletins) ? bulletins : []).map((bulletin) => (
                  <tr key={bulletin.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {bulletin?.studentName?.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{bulletin.studentName}</span>
                      </div>
                    </td>
                    <td className="p-4">{bulletin.class}</td>
                    <td className="p-4">{bulletin.quarter}</td>
                    <td className="p-4">{bulletin.teacher}</td>
                    <td className="p-4">
                      <span className={getAverageColor(bulletin.average)}>
                        {bulletin.average}/20
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(bulletin.status)}>
                        {t[bulletin.status as keyof typeof t]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {bulletin.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleApproveBulletin(bulletin)}
                              className="text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRejectBulletin(bulletin)}
                              className="text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {bulletin.status === 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDistributeBulletin(bulletin)}
                            className="text-purple-600"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BulletinApprovalManagement;