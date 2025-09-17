import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useAuth } from '@/contexts/AuthContext';

export const WebSocketTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'failed';
    message: string;
    timestamp: Date;
  }>>([]);

  const {
    isConnected,
    isConnecting,
    hasError,
    error,
    connect,
    disconnect,
    sendMessage,
    connectedUsers,
    lastEventTime
  } = useRealTimeUpdates({
    enableToasts: false, // Disable toasts for testing
    onGradeStatusUpdate: (event) => {
      addTestResult('Grade Status Update', 'success', `Received event: ${JSON.stringify(event)}`);
    },
    onUserPresenceUpdate: (event) => {
      addTestResult('User Presence Update', 'success', `User: ${event.userName} - ${event.action}`);
    }
  });

  const addTestResult = (test: string, status: 'success' | 'failed', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const runWebSocketTests = async () => {
    setTestResults([]);
    
    // Test 1: URL Construction
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let host = window.location.host;
      
      // Handle cases where host might be undefined or empty
      if (!host) {
        const hostname = window.location.hostname || 'localhost';
        const port = window.location.port || '5000';
        host = `${hostname}:${port}`;
      }
      
      // Remove insecure sessionToken from URL - authentication should be handled via headers or cookies
      const testUrl = `${protocol}//${host}/ws?userId=${user?.id}`;
      
      addTestResult(
        'URL Construction', 
        testUrl.includes('undefined') ? 'failed' : 'success', 
        `Generated URL: ${testUrl}`
      );
    } catch (error) {
      addTestResult('URL Construction', 'failed', `Error: ${error}`);
    }

    // Test 2: Connection Test
    if (user?.id) {
      connect();
      setTimeout(() => {
        if (isConnected) {
          addTestResult('WebSocket Connection', 'success', 'Successfully connected to WebSocket server');
        } else if (hasError) {
          addTestResult('WebSocket Connection', 'failed', `Connection failed: ${error}`);
        } else {
          addTestResult('WebSocket Connection', 'failed', 'Connection timeout');
        }
      }, 3000);
    } else {
      addTestResult('WebSocket Connection', 'failed', 'No user logged in for testing');
    }
  };

  const testSendMessage = () => {
    if (isConnected) {
      sendMessage('TEST_MESSAGE', { 
        message: 'WebSocket test message',
        timestamp: new Date().toISOString()
      });
      addTestResult('Send Message', 'success', 'Test message sent successfully');
    } else {
      addTestResult('Send Message', 'failed', 'Not connected to WebSocket');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" data-testid="websocket-test-container">
      <CardHeader>
        <CardTitle>🔌 WebSocket Connection Test</CardTitle>
        <CardDescription>
          Test and debug the real-time WebSocket connection system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <Badge variant={isConnected ? 'default' : hasError ? 'destructive' : 'secondary'}>
                  {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : hasError ? 'Error' : 'Disconnected'}
                </Badge>
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connected Users</span>
                <Badge variant="outline">{connectedUsers.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Event</span>
                <Badge variant="outline">
                  {lastEventTime ? new Date(lastEventTime).toLocaleTimeString() : 'None'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runWebSocketTests}
            data-testid="button-run-tests"
          >
            🧪 Run Tests
          </Button>
          <Button 
            variant="outline" 
            onClick={connect}
            disabled={isConnected || isConnecting}
            data-testid="button-connect"
          >
            🔌 Connect
          </Button>
          <Button 
            variant="outline" 
            onClick={disconnect}
            disabled={!isConnected}
            data-testid="button-disconnect"
          >
            ⏹️ Disconnect
          </Button>
          <Button 
            variant="outline" 
            onClick={testSendMessage}
            disabled={!isConnected}
            data-testid="button-send-test"
          >
            📤 Send Test Message
          </Button>
        </div>

        {/* Current URL Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🌐 Current Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Protocol:</strong> {window.location.protocol}
              </div>
              <div>
                <strong>Host:</strong> {window.location.host || 'undefined'}
              </div>
              <div>
                <strong>Hostname:</strong> {window.location.hostname || 'undefined'}
              </div>
              <div>
                <strong>Port:</strong> {window.location.port || '(not specified)'}
              </div>
              <div>
                <strong>User ID:</strong> {user?.id || 'Not logged in'}
              </div>
              <div>
                <strong>Expected WebSocket Protocol:</strong> {window.location.protocol === 'https:' ? 'wss:' : 'ws:'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
                    data-testid={`test-result-${index}`}
                  >
                    <Badge 
                      variant={result.status === 'success' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏳'}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Users */}
        {connectedUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Connected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {connectedUsers.map((connectedUser, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{connectedUser.userName}</span>
                    <Badge variant="outline">{connectedUser.userRole}</Badge>
                    {connectedUser.currentModule && (
                      <span className="text-sm text-gray-600">in {connectedUser.currentModule}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};