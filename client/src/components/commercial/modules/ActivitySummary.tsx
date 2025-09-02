import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActivitySummaryProps {
  commercialId?: number;
  days?: number;
}

export default function ActivitySummary({ commercialId, days = 30 }: ActivitySummaryProps) {
  const { language, t } = useLanguage();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['commercial-activity-summary', commercialId, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (commercialId) params.append('commercialId', commercialId.toString());
      params.append('days', days.toString());
      
      const response = await fetch(`/api/commercial/activity-summary?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity summary');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: true
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['commercial-activities', commercialId, 10],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (commercialId) params.append('commercialId', commercialId.toString());
      params.append('limit', '10');
      
      const response = await fetch(`/api/commercial/activities?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: true
  });

  if (isLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <Activity className="w-5 h-5 mr-2" />
            <span>
              {language === 'fr' 
                ? 'Erreur lors du chargement de l\'activité' 
                : 'Error loading activity data'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'fr' ? 'Résumé d\'Activité' : 'Activity Summary'}
        </h2>
        <span className="text-sm text-gray-500">
          {language === 'fr' ? `Derniers ${days} jours` : `Last ${days} days`}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Total Activités' : 'Total Activities'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {summary?.totalActivities || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Connexions' : 'Logins'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {summary?.loginCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Jours Actifs' : 'Active Days'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {summary?.uniqueDaysCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Jour le Plus Actif' : 'Most Active Day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-900">
              {summary?.mostActiveDay ? new Date(summary.mostActiveDay).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Types Breakdown */}
      {summary?.activitiesByType && Object.keys(summary.activitiesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Types d\'Activités' : 'Activity Types'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.activitiesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">
                    {type === 'login' ? (language === 'fr' ? 'Connexions' : 'Logins') :
                     type === 'profile_update' ? (language === 'fr' ? 'Mises à jour profil' : 'Profile Updates') :
                     type === 'document_access' ? (language === 'fr' ? 'Accès documents' : 'Document Access') :
                     type}
                  </span>
                  <span className="font-bold text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Activités Récentes' : 'Recent Activities'}
            </CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Dernières 10 activités' : 'Last 10 activities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.activityType === 'login' ? 'bg-green-500' :
                      activity.activityType === 'profile_update' ? 'bg-blue-500' :
                      activity.activityType === 'document_access' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.activityType === 'login' ? (language === 'fr' ? 'Connexion' : 'Login') :
                         activity.activityType === 'profile_update' ? (language === 'fr' ? 'Mise à jour profil' : 'Profile Update') :
                         activity.activityType === 'document_access' ? (language === 'fr' ? 'Accès document' : 'Document Access') :
                         activity.activityType}
                      </div>
                      {activity.description && (
                        <div className="text-sm text-gray-500">{activity.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US') : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Login Info */}
      {summary?.lastLogin && (
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-800 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Dernière Connexion' : 'Last Login'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-indigo-700">
              <div className="flex justify-between">
                <span className="font-medium">
                  {language === 'fr' ? 'Date:' : 'Date:'}
                </span>
                <span>
                  {new Date(summary.lastLogin.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>
              {summary.lastLogin.ipAddress && (
                <div className="flex justify-between">
                  <span className="font-medium">IP:</span>
                  <span className="font-mono text-sm">{summary.lastLogin.ipAddress}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}