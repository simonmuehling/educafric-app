import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOfflineAcademicData } from '@/hooks/offline/useOfflineAcademicData';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { Loader2, Plus, Edit, Trash2, WifiOff, Wifi, Database } from 'lucide-react';

export default function OfflineAcademicTest() {
  const { toast } = useToast();
  const { isOnline, hasOfflineAccess } = useOfflinePremium();
  const {
    academicData,
    loading,
    error,
    createBulletin,
    updateBulletin,
    deleteBulletin,
    getBulletinsByClass
  } = useOfflineAcademicData();

  const [formData, setFormData] = useState({
    studentId: 1,
    classId: 1,
    term: 'T1',
    studentName: 'Test Student',
    classLabel: '6ème A',
    academicYear: '2024-2025',
    subjects: [
      { name: 'Math', grade: 15, coefficient: 4 },
      { name: 'Français', grade: 14, coefficient: 4 }
    ]
  });

  const handleCreate = async () => {
    const result = await createBulletin({
      type: 'bulletin',
      studentId: formData.studentId,
      classId: formData.classId,
      term: formData.term,
      data: {
        studentName: formData.studentName,
        classLabel: formData.classLabel,
        academicYear: formData.academicYear,
        subjects: formData.subjects,
        discipline: { conduct: 18, absences: 2 }
      }
    });

    if (result) {
      toast({
        title: '✅ Bulletin créé',
        description: `ID: ${result.id} - ${isOnline ? 'Sync en cours' : 'Sera sync à la reconnexion'}`
      });
    }
  };

  const handleUpdate = async (id: number) => {
    const success = await updateBulletin(id, {
      data: {
        subjects: [
          { name: 'Math', grade: 16, coefficient: 4 },
          { name: 'Français', grade: 15, coefficient: 4 }
        ]
      }
    });

    if (success) {
      toast({
        title: '✅ Bulletin modifié',
        description: `ID: ${id} mis à jour`
      });
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteBulletin(id);
    if (success) {
      toast({
        title: '✅ Bulletin supprimé',
        description: `ID: ${id} retiré`
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🧪 Test Offline Academic Data</span>
            <div className="flex gap-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant={hasOfflineAccess ? "default" : "secondary"}>
                <Database className="w-4 h-4 mr-1" />
                {hasOfflineAccess ? 'Premium Active' : 'No Access'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{academicData.length}</p>
              <p className="text-sm text-muted-foreground">Bulletins en cache</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{academicData.filter(b => b.syncStatus === 'pending').length}</p>
              <p className="text-sm text-muted-foreground">En attente de sync</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{academicData.filter(b => b.localOnly).length}</p>
              <p className="text-sm text-muted-foreground">Créés offline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Créer un bulletin (test)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input
                type="number"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                data-testid="input-student-id"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Class ID</label>
              <Input
                type="number"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: parseInt(e.target.value) })}
                data-testid="input-class-id"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                data-testid="input-student-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Term</label>
              <Input
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                data-testid="input-term"
              />
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full" data-testid="button-create-bulletin">
            <Plus className="w-4 h-4 mr-2" />
            Créer Bulletin
          </Button>
        </CardContent>
      </Card>

      {/* Bulletin List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Bulletins en cache IndexedDB</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Chargement...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          {!loading && !error && academicData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun bulletin en cache. Créez-en un pour tester !
            </div>
          )}

          {!loading && !error && academicData.length > 0 && (
            <div className="space-y-2">
              {academicData.map((bulletin) => (
                <div
                  key={bulletin.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  data-testid={`bulletin-item-${bulletin.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ID: {bulletin.id} - {bulletin.data?.studentName || 'Unknown'}
                      </span>
                      <Badge variant={bulletin.syncStatus === 'synced' ? 'default' : 'secondary'}>
                        {bulletin.syncStatus}
                      </Badge>
                      {bulletin.localOnly && (
                        <Badge variant="outline">Local Only</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {bulletin.data?.classLabel} - {bulletin.term} - {bulletin.data?.academicYear}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Subjects: {bulletin.data?.subjects?.length || 0} | 
                      Modified: {new Date(bulletin.lastModified).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdate(bulletin.id)}
                      data-testid={`button-update-${bulletin.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(bulletin.id)}
                      data-testid={`button-delete-${bulletin.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify({ 
              isOnline,
              hasOfflineAccess,
              totalBulletins: academicData.length,
              pending: academicData.filter(b => b.syncStatus === 'pending').length,
              bulletins: academicData.map(b => ({
                id: b.id,
                type: b.type,
                studentId: b.studentId,
                syncStatus: b.syncStatus,
                localOnly: b.localOnly
              }))
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
