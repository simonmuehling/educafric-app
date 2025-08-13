import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  source: string;
}

interface ErrorEntry {
  id: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: Date;
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  timestamp: Date;
  duration?: number;
  error?: string;
  headers?: Record<string, string>;
}

// Safe WebInspector that avoids fetch interference
export default function SafeWebInspector() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only intercept console methods, avoiding fetch interception completely
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

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

    // Monitor errors without fetch interception
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
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date()
      };

      setErrors(prev => [...prev.slice(-29), errorEntry]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Add note about network monitoring being disabled
    console.log('[SafeWebInspector] Console monitoring active, network interception disabled to prevent PWA analytics interference');

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
      
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isVisible) return null;

  const clearLogs = () => setLogs([]);
  const clearErrors = () => setErrors([]);
  const clearNetwork = () => setNetworkRequests([]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg rounded-lg z-50 ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-96'
    }`}>
      <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg">
        <h3 className="text-sm font-semibold text-gray-800">Safe Web Inspector</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X size={12} />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="h-84 p-2">
          <Tabs defaultValue="console" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="console" className="text-xs">
                Console
                {logs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {logs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-xs">
                Errors
                {errors.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {errors.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="network" className="text-xs">
                Network
                <Badge variant="outline" className="ml-1 text-xs">
                  Disabled
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="console" className="h-72">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  Console Messages ({logs.length})
                </span>
                <Button size="sm" variant="outline" onClick={clearLogs} className="text-xs h-6">
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-60">
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`text-xs p-2 rounded border-l-2 ${
                        log.level === 'error' ? 'border-red-500 bg-red-50' :
                        log.level === 'warn' ? 'border-yellow-500 bg-yellow-50' :
                        log.level === 'info' ? 'border-blue-500 bg-blue-50' :
                        'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-mono text-xs ${
                          log.level === 'error' ? 'text-red-700' :
                          log.level === 'warn' ? 'text-yellow-700' :
                          log.level === 'info' ? 'text-blue-700' :
                          'text-gray-700'
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs mt-1 text-gray-800">
                        {log.message}
                      </pre>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="errors" className="h-72">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  JavaScript Errors ({errors.length})
                </span>
                <Button size="sm" variant="outline" onClick={clearErrors} className="text-xs h-6">
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {errors.map((error) => (
                    <div key={error.id} className="text-xs p-2 rounded border-l-2 border-red-500 bg-red-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-red-700">Error</span>
                        <span className="text-xs text-gray-500">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-red-800 font-medium mb-1">{error.message}</div>
                      {error.filename && (
                        <div className="text-gray-600">
                          {error.filename}:{error.lineno}:{error.colno}
                        </div>
                      )}
                      {error.stack && (
                        <pre className="mt-1 text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="network" className="h-72">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  Network Requests (Disabled)
                </span>
                <Button size="sm" variant="outline" onClick={clearNetwork} className="text-xs h-6">
                  Clear
                </Button>
              </div>
              <div className="h-60 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm font-medium">Network Monitoring Disabled</p>
                  <p className="text-xs mt-1">
                    Fetch interception disabled to prevent<br/>
                    interference with PWA analytics tracking
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}