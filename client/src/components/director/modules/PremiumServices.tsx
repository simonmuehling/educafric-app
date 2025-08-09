import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, Smartphone, Users, Shield, Settings, BarChart3, AlertTriangle, Eye, Zap, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PremiumServices = () => {
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState('');

  const text = {
    fr: {
      title: 'Géolocalisation',
      subtitle: 'Système de géolocalisation et suivi des élèves en temps réel',
      geolocation: 'Géolocalisation',
      deviceTracking: 'Suivi Appareils',
      parentalControl: 'Contrôle Parental',
      emergencyAlerts: 'Alertes Urgence',
      activeDevices: 'Appareils Actifs',
      trackedStudents: 'Élèves Suivis',
      safeZones: 'Zones Sécurisées',
      recentAlerts: 'Alertes Récentes',
      configureGeolocation: 'Configurer Géolocalisation',
      viewMap: 'Voir Carte',
      deviceList: 'Liste Appareils',
      safeZoneSettings: 'Configuration Zones',
      batteryMonitoring: 'Suivi Batterie',
      active: 'Actif',
      inactive: 'Inactif',
      enabled: 'Activé',
      disabled: 'Désactivé',
      inSchool: 'À l\'École',
      outOfSchool: 'Hors École',
      lowBattery: 'Batterie Faible',
      emergencyPanic: 'Alerte Panique',
      schoolZone: 'Zone École',
      homeZone: 'Zone Maison',
      location: 'Localisation',
      lastUpdate: 'Dernière MAJ',
      batteryLevel: 'Niveau Batterie',
      addSafeZone: 'Ajouter Zone',
      editZone: 'Modifier Zone',
      deleteZone: 'Supprimer Zone',
      configureAlerts: 'Config. Alertes',
      viewHistory: 'Voir Historique'
    },
    en: {
      title: 'Geolocation',
      subtitle: 'Real-time student geolocation and tracking system',
      geolocation: 'Geolocation',
      deviceTracking: 'Device Tracking',
      parentalControl: 'Parental Control',
      emergencyAlerts: 'Emergency Alerts',
      activeDevices: 'Active Devices',
      trackedStudents: 'Tracked Students',
      safeZones: 'Safe Zones',
      recentAlerts: 'Recent Alerts',
      configureGeolocation: 'Configure Geolocation',
      viewMap: 'View Map',
      deviceList: 'Device List',
      safeZoneSettings: 'Zone Settings',
      batteryMonitoring: 'Battery Monitoring',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      inSchool: 'In School',
      outOfSchool: 'Out of School',
      lowBattery: 'Low Battery',
      emergencyPanic: 'Emergency Panic',
      schoolZone: 'School Zone',
      homeZone: 'Home Zone',
      location: 'Location',
      lastUpdate: 'Last Update',
      batteryLevel: 'Battery Level',
      addSafeZone: 'Add Zone',
      editZone: 'Edit Zone',
      deleteZone: 'Delete Zone',
      configureAlerts: 'Config. Alerts',
      viewHistory: 'View History'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch premium services status
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/premium-services'],
    queryFn: async () => {
      const response = await fetch('/api/premium-services');
      if (!response.ok) throw new Error('Failed to fetch premium services');
      return response.json();
    }
  });

  // Fetch geolocation stats
  const { data: geoStats = {}, isLoading: geoLoading } = useQuery({
    queryKey: ['/api/geolocation/stats'],
    queryFn: async () => {
      const response = await fetch('/api/geolocation/stats');
      if (!response.ok) throw new Error('Failed to fetch geolocation stats');
      return response.json();
    }
  });

  const queryClient = useQueryClient();

  // Service configuration mutation
  const configureServiceMutation = useMutation({
    mutationFn: async ({ serviceId, enabled, settings }: { serviceId: string, enabled: boolean, settings?: any }) => {
      const response = await fetch(`/api/premium-services/${serviceId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, settings })
      });
      if (!response.ok) throw new Error('Failed to configure service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/premium-services'] });
    }
  });

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    configureServiceMutation.mutate({ serviceId, enabled });
  };

  if (servicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des services premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Services Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ModernStatsCard
          title={t.activeDevices}
          value={services.find(s => s.id === 'geolocation')?.activeDevices?.toString() || '0'}
          icon={<Smartphone className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
          gradient="blue"
        />
        <ModernStatsCard
          title={t.trackedStudents}
          value={services.find(s => s.id === 'geolocation')?.trackedStudents?.toString() || '0'}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          gradient="green"
        />
        <ModernStatsCard
          title={t.alertsSent}
          value={(Array.isArray(services) ? services : []).reduce((sum, s) => sum + (s.alertsSent || 0), 0).toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{ value: 5, isPositive: false }}
          gradient="orange"
        />
        <ModernStatsCard
          title={t.batteryAlerts}
          value={services.find(s => s.id === 'geolocation')?.batteryAlerts?.toString() || '0'}
          icon={<Zap className="w-5 h-5" />}
          trend={{ value: 2, isPositive: false }}
          gradient="red"
        />
      </div>

      {/* Premium Services Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Array.isArray(services) ? services : []).map((service) => (
          <ModernCard key={service.id} gradient="default" className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    service.id === 'geolocation' ? 'bg-blue-100' :
                    service.id === 'device-tracking' ? 'bg-green-100' :
                    service.id === 'parental-control' ? 'bg-purple-100' :
                    'bg-red-100'
                  }`}>
                    {service.id === 'geolocation' && <MapPin className="w-6 h-6 text-blue-600" />}
                    {service.id === 'device-tracking' && <Smartphone className="w-6 h-6 text-green-600" />}
                    {service.id === 'parental-control' && <Shield className="w-6 h-6 text-purple-600" />}
                    {service.id === 'emergency-alerts' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{service.name || ''}</h3>
                    <p className="text-sm text-gray-600">{service.description || ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={service.enabled}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                    disabled={configureServiceMutation.isPending}
                  />
                  <Badge className={service.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {service.enabled ? t.enabled : t.disabled}
                  </Badge>
                </div>
              </div>

              {/* Service Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités:</h4>
                <div className="flex flex-wrap gap-1">
                  {service.features?.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {service.features?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{Array.isArray(service.features) ? service.features.length - 3 : 0} autres
                    </Badge>
                  )}
                </div>
              </div>

              {/* Service Stats */}
              {service.enabled && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {service.id === 'geolocation' && (
                    <>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{service.activeDevices}</p>
                        <p className="text-xs text-gray-600">Appareils Actifs</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{service.trackedStudents}</p>
                        <p className="text-xs text-gray-600">Élèves Suivis</p>
                      </div>
                    </>
                  )}
                  {service.id === 'device-tracking' && (
                    <>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{service.connectedTablets}</p>
                        <p className="text-xs text-gray-600">Tablettes</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{service.smartwatches}</p>
                        <p className="text-xs text-gray-600">Smartwatches</p>
                      </div>
                    </>
                  )}
                  {service.id === 'parental-control' && (
                    <>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{service.activeParents}</p>
                        <p className="text-xs text-gray-600">Parents Actifs</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{service.restrictedApps}</p>
                        <p className="text-xs text-gray-600">Apps Restreintes</p>
                      </div>
                    </>
                  )}
                  {service.id === 'emergency-alerts' && (
                    <>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{service.alertsSent}</p>
                        <p className="text-xs text-gray-600">Alertes Envoyées</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{service.successRate}%</p>
                        <p className="text-xs text-gray-600">Taux de Succès</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedService(service.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t.viewDetails}
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t.configure}
                </Button>
              </div>

              {/* Pricing Info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coût mensuel</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {service.pricing?.monthly} {service.pricing?.currency}
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Detailed Service View */}
      {selectedService && (
        <ModernCard gradient="default">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Détails - {services.find(s => s.id === selectedService)?.name}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedService('')}
              >
                Fermer
              </Button>
            </div>
            <p className="text-gray-600 mb-4">
              Configuration avancée et statistiques détaillées pour ce service premium.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Interface de configuration détaillée en cours de développement.
              </p>
            </div>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default PremiumServices;