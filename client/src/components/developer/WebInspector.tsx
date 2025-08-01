import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Terminal, 
  Network, 
  Bug, 
  Activity, 
  Trash2, 
  Copy, 
  Download,
  Settings,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  stack?: string;
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  timestamp: Date;
  duration?: number;
  headers?: Record<string, string>;
  response?: any;
  error?: string;
}

interface ErrorEntry {
  id: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: Date;
  resolved?: boolean;
}

const WebInspector = () => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState('console');
  const [logFilter, setLogFilter] = useState<string[]>(['log', 'info', 'warn', 'error', 'debug']);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize logging interception
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Intercept console methods
    const interceptConsole = (level: keyof typeof originalConsole) => {
      console[level] = (...args: any[]) => {
        originalConsole[level](...args);
        
        const logEntry: LogEntry = {
          id: Date.now().toString() + Math.random(),
          timestamp: new Date(),
          level: level === 'debug' ? 'debug' : level,
          message: (Array.isArray(args) ? args : []).map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          source: 'console'
        };

        setLogs(prev => [...prev.slice(-99), logEntry]);
      };
    };

    Object.keys(originalConsole).forEach(level => {
      interceptConsole(level as keyof typeof originalConsole);
    });

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const requestId = Date.now().toString() + Math.random();
      const startTime = Date.now();

      const networkRequest: NetworkRequest = {
        id: requestId,
        url: typeof url === 'string' ? url : url.toString(),
        method: options?.method || 'GET',
        timestamp: new Date(),
        headers: options?.headers as Record<string, string>
      };

      setNetworkRequests(prev => [...prev.slice(-49), networkRequest]);

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        setNetworkRequests(prev => 
          (Array.isArray(prev) ? prev : []).map(req => 
            req.id === requestId 
              ? { ...req, status: response.status, duration }
              : req
          )
        );

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setNetworkRequests(prev => 
          (Array.isArray(prev) ? prev : []).map(req => 
            req.id === requestId 
              ? { ...req, error: error instanceof Error ? error.message : 'Network error', duration }
              : req
          )
        );

        throw error;
      }
    };

    // Intercept errors
    const handleError = (event: ErrorEvent) => {
      const errorEntry: ErrorEntry = {
        id: Date.now().toString() + Math.random(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date()
      };

      setErrors(prev => [...prev.slice(-29), errorEntry]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorEntry: ErrorEntry = {
        id: Date.now().toString() + Math.random(),
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date()
      };

      setErrors(prev => [...prev.slice(-29), errorEntry]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Restore original methods
      Object.assign(console, originalConsole);
      window.fetch = originalFetch;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Auto-scroll to latest log
  useEffect(() => {
    if (selectedTab === 'console') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, selectedTab]);

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "Logs effacés",
      description: "Tous les logs console ont été supprimés"
    });
  };

  const clearNetwork = () => {
    setNetworkRequests([]);
    toast({
      title: "Requêtes effacées",
      description: "Toutes les requêtes réseau ont été supprimées"
    });
  };

  const clearErrors = () => {
    setErrors([]);
    toast({
      title: "Erreurs effacées",
      description: "Toutes les erreurs ont été supprimées"
    });
  };

  const exportLogs = () => {
    const data = {
      logs: logs,
      network: networkRequests,
      errors: errors,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `web-inspector-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Les logs ont été exportés avec succès"
    });
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Bug className="w-4 h-4 text-purple-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter(log => logFilter.includes(log.level));

  if (!isVisible) {
    return null; // Hide the inspector button completely
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border rounded-lg shadow-2xl flex flex-col" data-testid="web-inspector-panel">
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-800">Inspecteur Web - Debug Tools</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            data-testid="button-export-logs"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
            data-testid="button-close-inspector"
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Fermer
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="console" className="flex items-center space-x-1">
            <Terminal className="w-4 h-4" />
            <span>Console ({logs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center space-x-1">
            <Network className="w-4 h-4" />
            <span>Network ({networkRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center space-x-1">
            <Bug className="w-4 h-4" />
            <span>Errors ({errors.length})</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="flex space-x-1">
                {['log', 'info', 'warn', 'error', 'debug'].map(level => (
                  <Button
                    key={level}
                    variant={logFilter.includes(level) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLogFilter(prev => 
                        prev.includes(level) 
                          ? (Array.isArray(prev) ? prev : []).filter(l => l !== level)
                          : [...prev, level]
                      );
                    }}
                    className="capitalize"
                    data-testid={`filter-${level}`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearLogs} data-testid="button-clear-logs">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1 font-mono text-sm">
              {(Array.isArray(filteredLogs) ? filteredLogs : []).map(log => (
                <div
                  key={log.id}
                  className="flex items-start space-x-2 p-2 rounded hover:bg-slate-50"
                  data-testid={`log-entry-${log.level}`}
                >
                  {getLogIcon(log.level)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <div className="mt-1 whitespace-pre-wrap break-words">
                      {log.message}
                    </div>
                    {log.stack && (
                      <details className="mt-1">
                        <summary className="text-xs text-slate-500 cursor-pointer">Stack trace</summary>
                        <pre className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="network" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="text-sm text-slate-600">
              {networkRequests.length} requêtes
            </div>
            <Button variant="outline" size="sm" onClick={clearNetwork} data-testid="button-clear-network">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {(Array.isArray(networkRequests) ? networkRequests : []).map(request => (
                <div
                  key={request.id}
                  className="flex items-center space-x-3 p-3 hover:bg-slate-50 border-b"
                  data-testid={`network-request-${(request.method || '').toLowerCase()}`}
                >
                  <Badge variant="outline" className="text-xs">
                    {request.method}
                  </Badge>
                  <div 
                    className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {request.url}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span>{request.timestamp.toLocaleTimeString()}</span>
                      {request.status && <span>Status: {request.status}</span>}
                      {request.duration && <span>{request.duration}ms</span>}
                      {request.error && <span className="text-red-500">{request.error}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="text-sm text-slate-600">
              {errors.length} erreurs détectées
            </div>
            <Button variant="outline" size="sm" onClick={clearErrors} data-testid="button-clear-errors">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {(Array.isArray(errors) ? errors : []).map(error => (
                <Card key={error.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-800">
                          {error.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 space-x-3">
                          <span>{error.timestamp.toLocaleString()}</span>
                          {error.filename && (
                            <span>{error.filename}:{error.lineno}:{error.colno}</span>
                          )}
                        </div>
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-500 cursor-pointer">
                              Stack trace
                            </summary>
                            <pre className="text-xs text-slate-600 mt-1 whitespace-pre-wrap bg-slate-50 p-2 rounded">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 flex flex-col p-4">
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Métriques de Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(performance.now())}ms
                  </div>
                  <div className="text-sm text-slate-600">Temps d'exécution</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {typeof (performance as any).memory?.usedJSHeapSize === 'number' ? 
                      Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB' : 
                      'N/A'
                    }
                  </div>
                  <div className="text-sm text-slate-600">Mémoire utilisée</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {networkRequests.length}
                  </div>
                  <div className="text-sm text-slate-600">Requêtes HTTP</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {errors.length}
                  </div>
                  <div className="text-sm text-slate-600">Erreurs JS</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebInspector;