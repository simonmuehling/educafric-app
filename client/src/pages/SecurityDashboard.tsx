import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Shield, AlertTriangle, Activity, Ban, Eye, RefreshCw } from 'lucide-react';

interface SecurityStats {
  total_events_24h: number;
  total_events_1h: number;
  critical_events_24h: number;
  blocked_ips: number;
  high_risk_ips: number;
  event_types_24h: Record<string, number>;
  top_threat_ips: Array<{ ip: string; score: number }>;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  endpoint: string;
  threat_score: number;
  details: Record<string, any>;
}

export default function SecurityDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Security stats query
  const { data: securityData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/security/dashboard', refreshKey],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Recent security events query
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/security/events', refreshKey],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const stats: SecurityStats = (securityData as any)?.stats || {
    total_events_24h: 0,
    total_events_1h: 0,
    critical_events_24h: 0,
    blocked_ips: 0,
    high_risk_ips: 0,
    event_types_24h: {},
    top_threat_ips: []
  };

  const events: SecurityEvent[] = (eventsData as any) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-600' };
    if (score >= 50) return { level: 'High', color: 'text-orange-600' };
    if (score >= 20) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Security Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time security monitoring for Educafric platform
            </p>
          </div>
          <Button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Alert Banner for Critical Events */}
        {stats.critical_events_24h > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{stats.critical_events_24h} critical security events</strong> detected in the last 24 hours. 
              Immediate review recommended.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events (24h)</CardTitle>
              <Activity className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_events_24h}</div>
              <p className="text-xs text-gray-600">
                {stats.total_events_1h} in last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical_events_24h}</div>
              <p className="text-xs text-gray-600">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <Ban className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.blocked_ips}</div>
              <p className="text-xs text-gray-600">
                {stats.high_risk_ips} high-risk IPs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Eye className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-green-600">Monitoring Active</div>
              <p className="text-xs text-gray-600">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.event_types_24h).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(stats.event_types_24h).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No events recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Threat IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Threat IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_threat_ips?.slice(0, 5).map((threat, index) => {
                  const threatInfo = getThreatLevel(threat.score);
                  return (
                    <div key={threat.ip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{threat.ip}</span>
                        <Badge 
                          variant="outline" 
                          className={threatInfo.color}
                        >
                          {threatInfo.level}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{threat.score}</span>
                    </div>
                  );
                })}
                {(!stats?.top_threat_ips || stats.top_threat_ips.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No threats detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 20).map((event) => (
                <div key={event.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event?.severity?.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {event?.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Score: {event.threat_score}</span>
                      <span>•</span>
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>IP:</strong> {event.ip}</div>
                    <div><strong>Endpoint:</strong> {event.endpoint}</div>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-2">
                        <strong>Details:</strong>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(Array.isArray(events) ? events.length : 0) === 0 && !eventsLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No security events recorded</p>
                  <p className="text-sm">System is running securely</p>
                </div>
              )}
              
              {eventsLoading && (
                <div className="text-center py-8 text-gray-500">
                  Loading security events...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}