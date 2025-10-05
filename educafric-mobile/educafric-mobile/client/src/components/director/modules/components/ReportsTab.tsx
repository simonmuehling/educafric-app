import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Filter, Target, FileText, CheckCircle2, TrendingUp, Timer, PieChart, 
  LineChart, Activity, Mail, Phone, MessageSquare, AlertCircle, History, Plus, 
  CheckCircle, UserCheck, FileSignature, Zap, ChevronDown, FileDown, RefreshCw, 
  Loader2
} from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

// Lazy loaded chart components
const DistributionPieChart = React.lazy(() => import('./DistributionPieChart'));
const SuccessRateBarChart = React.lazy(() => import('./SuccessRateBarChart'));
const TimelineLineChart = React.lazy(() => import('./TimelineLineChart'));

interface ReportsTabProps {
  reportFilters: any;
  handleFilterChange: (key: string, value: string) => void;
  classes: any[];
  overviewReport: any;
  distributionStats: any;
  timelineReport: any;
  loadingOverview: boolean;
  loadingDistribution: boolean;
  loadingTimelineReport: boolean;
  exportingReport: boolean;
  handleExportReport: (format: string, type: string) => void;
  refetchOverview: () => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  reportFilters,
  handleFilterChange,
  classes,
  overviewReport,
  distributionStats,
  timelineReport,
  loadingOverview,
  loadingDistribution,
  loadingTimelineReport,
  exportingReport,
  handleExportReport,
  refetchOverview
}) => {
  const statusColors = {
    pending: '#f59e0b',
    approved: '#10b981',
    sent: '#3b82f6',
    failed: '#ef4444'
  };

  const channelColors = {
    email: '#3b82f6',
    sms: '#f59e0b',
    whatsapp: '#10b981'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Rapports et Statistiques
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble complète des bulletins, distributions et historique des actions
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtres de rapport */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Trimestre</Label>
              <Select value={reportFilters.term} onValueChange={(value) => handleFilterChange('term', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les trimestres</SelectItem>
                  <SelectItem value="T1">Trimestre 1</SelectItem>
                  <SelectItem value="T2">Trimestre 2</SelectItem>
                  <SelectItem value="T3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={reportFilters.classId} onValueChange={(value) => handleFilterChange('classId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les classes</SelectItem>
                  {classes?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={reportFilters.channel} onValueChange={(value) => handleFilterChange('channel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les canaux</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Année Scolaire</Label>
              <Select value={reportFilters.academicYear} onValueChange={(value) => handleFilterChange('academicYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="2024-2025" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={reportFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={reportFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Vue d'ensemble - Métriques */}
        {overviewReport && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Vue d'ensemble
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bulletins</p>
                      <p className="text-2xl font-bold">{overviewReport.totalBulletins}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Envoyés</p>
                      <p className="text-2xl font-bold text-green-600">{overviewReport.statusBreakdown?.sent || 0}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taux Réussite Global</p>
                      <p className="text-2xl font-bold text-purple-600">{overviewReport.distributionRates?.overall || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Temps Moyen (h)</p>
                      <p className="text-2xl font-bold text-orange-600">{overviewReport.averageProcessingTime || 0}</p>
                    </div>
                    <Timer className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique des statuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Répartition par Statut
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSkeleton type="chart" height={300} />}>
                    <DistributionPieChart 
                      data={overviewReport} 
                      statusColors={statusColors}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Taux de Réussite par Canal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSkeleton type="chart" height={300} />}>
                    <SuccessRateBarChart 
                      data={overviewReport} 
                      channelColors={channelColors}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Stats détaillées par Canal */}
        {overviewReport?.detailedChannelStats && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Détails par Canal
            </h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Canal</th>
                        <th className="text-left p-2">Envoyés</th>
                        <th className="text-left p-2">Réussis</th>
                        <th className="text-left p-2">Échecs</th>
                        <th className="text-left p-2">Taux Réussite</th>
                        <th className="text-left p-2">Temps Moyen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(overviewReport.detailedChannelStats).map(([channel, stats]: [string, any]) => (
                        <tr key={channel} className="border-b">
                          <td className="p-2 font-medium">{channel}</td>
                          <td className="p-2">{stats.sent}</td>
                          <td className="p-2 text-green-600">{stats.success}</td>
                          <td className="p-2 text-red-600">{stats.failed}</td>
                          <td className="p-2">
                            <Badge variant="outline" className={stats.successRate >= 80 ? 'text-green-600' : stats.successRate >= 60 ? 'text-orange-600' : 'text-red-600'}>
                              {stats.successRate}%
                            </Badge>
                          </td>
                          <td className="p-2">{stats.avgTime}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistiques de distribution détaillées */}
        {distributionStats && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Statistiques de Distribution
            </h3>

            {/* Statistiques par canal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-lg font-bold">{distributionStats.channelStats?.email?.sent || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {distributionStats.channelStats?.email?.failed || 0} échecs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {distributionStats.successRates?.email || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Réussite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">SMS</span>
                      </div>
                      <p className="text-lg font-bold">{distributionStats.channelStats?.sms?.sent || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {distributionStats.channelStats?.sms?.failed || 0} échecs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        {distributionStats.successRates?.sms || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Réussite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">WhatsApp</span>
                      </div>
                      <p className="text-lg font-bold">{distributionStats.channelStats?.whatsapp?.sent || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {distributionStats.channelStats?.whatsapp?.failed || 0} échecs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {distributionStats.successRates?.whatsapp || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Réussite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution quotidienne */}
            {distributionStats.dailyDistribution && distributionStats.dailyDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Distribution Quotidienne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSkeleton type="chart" height={300} />}>
                    <TimelineLineChart data={distributionStats.dailyDistribution} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Analyse des erreurs */}
            {distributionStats.errorAnalysis && distributionStats.errorAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Top 10 des Erreurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {distributionStats.errorAnalysis.map((error: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">{error.error}</span>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {error.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Timeline et historique */}
        {timelineReport && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              Timeline et Historique
            </h3>

            {timelineReport.timeline && timelineReport.timeline.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {timelineReport.timeline.map((event: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-3 border-l-2 border-blue-200 bg-gray-50 rounded-r">
                        <div className="flex-shrink-0">
                          {event.action === 'created' && <Plus className="h-4 w-4 text-blue-500" />}
                          {event.action === 'submitted' && <CheckCircle className="h-4 w-4 text-orange-500" />}
                          {event.action === 'approved' && <UserCheck className="h-4 w-4 text-green-500" />}
                          {event.action === 'signed' && <FileSignature className="h-4 w-4 text-purple-500" />}
                          {event.action === 'distributed' && <Zap className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{event.description}</p>
                            <Badge variant="outline">
                              Bulletin #{event.bulletinId}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Étudiant #{event.studentId}</span>
                            <span>Classe {event.classId}</span>
                            <span>{event.term}</span>
                            <span>{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                          {event.userName && (
                            <p className="text-xs text-gray-600 mt-1">Par: {event.userName}</p>
                          )}
                          {event.metadata && (
                            <div className="flex gap-2 mt-2">
                              {event.metadata.channels?.email && (
                                <Badge variant="outline" className="text-xs">
                                  Email: {event.metadata.channels.email.success}✓ {event.metadata.channels.email.failed}✗
                                </Badge>
                              )}
                              {event.metadata.channels?.sms && (
                                <Badge variant="outline" className="text-xs">
                                  SMS: {event.metadata.channels.sms.success}✓ {event.metadata.channels.sms.failed}✗
                                </Badge>
                              )}
                              {event.metadata.channels?.whatsapp && (
                                <Badge variant="outline" className="text-xs">
                                  WhatsApp: {event.metadata.channels.whatsapp.success}✓ {event.metadata.channels.whatsapp.failed}✗
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination de timeline */}
                  {timelineReport.pagination && timelineReport.pagination.hasMore && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Charger plus d'événements
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement trouvé pour la période sélectionnée</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Export et Actions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <FileDown className="h-4 w-4" />
            Export et Actions
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportReport('csv', 'overview')}
              disabled={exportingReport}
              data-testid="export-overview-csv"
            >
              {exportingReport ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              Vue d'ensemble CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportReport('csv', 'distribution')}
              disabled={exportingReport}
              data-testid="export-distribution-csv"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Distribution CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportReport('csv', 'timeline')}
              disabled={exportingReport}
              data-testid="export-timeline-csv"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Timeline CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => refetchOverview()}
              disabled={loadingOverview}
              data-testid="refresh-reports"
            >
              {loadingOverview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Actualiser
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>💡 <strong>Astuce:</strong> Utilisez les filtres ci-dessus pour personnaliser vos rapports avant l'export.</p>
            <p>📊 Les graphiques sont interactifs - cliquez sur les légendes pour masquer/afficher des éléments.</p>
          </div>
        </div>

        {/* États de chargement */}
        {(loadingOverview || loadingDistribution || loadingTimelineReport) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des données de rapport...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTab;