import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { RefreshCw, Server, Activity, Gauge, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSandboxAutoscale } from '@/hooks/useSandboxAutoscale';

interface ServerAutoscaleStatus {
  isActive: boolean;
  metrics: {
    duplicatesRemoved: number;
    lastRefresh: Date;
    totalRefreshes: number;
    activeComponents: number;
    memoryCleared: number;
    cacheEntries: number;
  };
  nextRefreshIn: number;
  duplicateQueueSize: number;
}

export const AutoscaleServerIntegration: React.FC = () => {
  const { toast } = useToast();
  const { refreshSandbox, isRefreshing } = useSandboxAutoscale();

  // Query server autoscale status
  const { data: serverStatus, isLoading } = useQuery<ServerAutoscaleStatus>({
    queryKey: ['/api/sandbox/autoscale/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mutation to force server refresh
  const forceServerRefresh = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/autoscale/refresh', 'POST', {});
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Autoscale Refresh Completed',
        description: `Server refresh successful - ${data.metrics?.duplicatesRemoved || 0} duplicates removed, ${(data.metrics?.memoryCleared || 0).toFixed(1)}MB cleared`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Server Refresh Failed',
        description: 'Unable to refresh server autoscale',
        variant: 'destructive',
      });
    },
  });

  const handleFullRefresh = () => {
    // Trigger both client and server refresh
    refreshSandbox();
    forceServerRefresh.mutate();
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Imminent';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Connecting to autoscale service...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Server className="w-5 h-5" />
          Sandbox Autoscale Service
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            {serverStatus?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Metrics */}
        {serverStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-gray-600">Duplicates</span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {serverStatus.metrics.duplicatesRemoved}
              </div>
              <div className="text-xs text-gray-500">
                Queue: {serverStatus.duplicateQueueSize}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Refreshes</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {serverStatus.metrics.totalRefreshes}
              </div>
              <div className="text-xs text-gray-500">
                Components: {serverStatus.metrics.activeComponents}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-gray-600">Memory</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {serverStatus.metrics.memoryCleared.toFixed(0)}MB
              </div>
              <div className="text-xs text-gray-500">
                Cache: {serverStatus.metrics.cacheEntries}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-gray-600">Next Auto</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatTime(serverStatus.nextRefreshIn)}
              </div>
              <div className="text-xs text-gray-500">
                Last: {new Date(serverStatus.metrics.lastRefresh).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleFullRefresh}
            disabled={isRefreshing || forceServerRefresh.isPending}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            data-testid="button-full-autoscale-refresh"
          >
            {(isRefreshing || forceServerRefresh.isPending) ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Full Refresh (Client + Server)
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => forceServerRefresh.mutate()}
            disabled={forceServerRefresh.isPending}
            className="border-green-300 text-green-700 hover:bg-green-100"
            data-testid="button-server-only-refresh"
          >
            {forceServerRefresh.isPending ? (
              <>
                <Server className="w-4 h-4 mr-1 animate-pulse" />
                Server...
              </>
            ) : (
              <>
                <Server className="w-4 h-4 mr-1" />
                Server Only
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-green-700 bg-green-100 rounded p-2">
          <strong>🔄 Full Autoscale Features:</strong>
          <ul className="ml-4 mt-1 space-y-0.5">
            <li>• Client-side duplicate prevention and cache clearing</li>
            <li>• Server-side memory optimization and component cleanup</li>
            <li>• Synchronized refresh cycles every 5 minutes</li>
            <li>• Real-time metrics and performance monitoring</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};