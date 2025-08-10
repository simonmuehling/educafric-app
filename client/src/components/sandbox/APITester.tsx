import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Play, Copy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface APIResponse {
  status: number;
  statusText: string;
  data: any;
  responseTime: number;
}

const APITester = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [endpoint, setEndpoint] = useState('/api/auth/me');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    // Authentication Endpoints
    { value: '/api/auth/me', label: language === 'fr' ? 'Profil utilisateur' : 'User Profile' },
    { value: '/api/auth/login', label: language === 'fr' ? 'Connexion' : 'Login' },
    { value: '/api/auth/register', label: language === 'fr' ? 'Inscription' : 'Register' },
    
    // 🎯 BACKEND APIS 100% FONCTIONNELLES (Post-Fix Drizzle)
    { value: '/api/parent/children', label: language === 'fr' ? '✅ Parent API (1 enfant)' : '✅ Parent API (1 child)' },
    { value: '/api/student/grades', label: language === 'fr' ? '✅ Student API (5 notes)' : '✅ Student API (5 grades)' },
    { value: '/api/teacher/students', label: language === 'fr' ? '✅ Teacher Students API (2 étudiants)' : '✅ Teacher Students API (2 students)' },
    { value: '/api/teacher/classes', label: language === 'fr' ? '🎯 Teacher Classes API (FIXÉE!)' : '🎯 Teacher Classes API (FIXED!)' },
    
    // Core Educational Endpoints
    { value: '/api/users', label: language === 'fr' ? 'Utilisateurs' : 'Users' },
    { value: '/api/schools', label: language === 'fr' ? 'Écoles' : 'Schools' },
    { value: '/api/students', label: language === 'fr' ? 'Étudiants' : 'Students' },
    { value: '/api/teachers', label: language === 'fr' ? 'Enseignants' : 'Teachers' },
    { value: '/api/grades', label: language === 'fr' ? 'Notes' : 'Grades' },
    { value: '/api/attendance', label: language === 'fr' ? 'Présences' : 'Attendance' },
    { value: '/api/homework', label: language === 'fr' ? 'Devoirs' : 'Homework' },
    
    // Geolocation Endpoints - Parent
    { value: '/api/parent/children', label: language === 'fr' ? 'Enfants Parent' : 'Parent Children' },
    { value: '/api/parent/safe-zones', label: language === 'fr' ? 'Zones Sécurisées Parent' : 'Parent Safe Zones' },
    { value: '/api/parent/children/1/location', label: language === 'fr' ? 'Position Enfant' : 'Child Location' },
    { value: '/api/parent/children/1/alerts', label: language === 'fr' ? 'Alertes Enfant' : 'Child Alerts' },
    
    // Geolocation Endpoints - Freelancer
    { value: '/api/freelancer/students', label: language === 'fr' ? 'Élèves Freelancer' : 'Freelancer Students' },
    { value: '/api/freelancer/teaching-zones', label: language === 'fr' ? 'Zones Enseignement' : 'Teaching Zones' },
    
    // Director/Admin Endpoints
    { value: '/api/geolocation/overview', label: language === 'fr' ? 'Vue Géolocalisation' : 'Geolocation Overview' },
    { value: '/api/school/1/administrators', label: language === 'fr' ? 'Administrateurs École' : 'School Administrators' },
    { value: '/api/permissions/modules', label: language === 'fr' ? 'Modules Permissions' : 'Permission Modules' }
  ];

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const sampleBodies = {
    '/api/auth/login': JSON.stringify({
      email: "parent.demo@test?.educafric?.com",
      password: "password"
    }, null, 2),
    '/api/auth/register': JSON.stringify({
      email: "test@educafric.com",
      password: "password",
      firstName: "Test",
      lastName: "User",
      role: "student"
    }, null, 2),
    '/api/students': JSON.stringify({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@educafric.com",
      dateOfBirth: "2005-03-15",
      schoolId: 1,
      classId: 1
    }, null, 2),
    '/api/grades': JSON.stringify({
      studentId: 1,
      subjectId: 1,
      grade: 85,
      maxGrade: 100,
      comment: "Excellent travail"
    }, null, 2),
    '/api/parent/safe-zones': JSON.stringify({
      name: "École Test Sandbox",
      type: "school",
      coordinates: { lat: 3.848, lng: 11.5021 },
      radius: 100,
      description: "Zone école créée via sandbox"
    }, null, 2),
    '/api/freelancer/teaching-zones': JSON.stringify({
      name: "Centre Formation Sandbox",
      type: "teaching_center", 
      coordinates: { lat: 3.857, lng: 11.520 },
      radius: 150,
      description: "Zone d'enseignement créée via sandbox"
    }, null, 2)
  };

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    if (sampleBodies[newEndpoint as keyof typeof sampleBodies]) {
      setRequestBody(sampleBodies[newEndpoint as keyof typeof sampleBodies]);
    }
  };

  // Mutation pour tester les API endpoints avec vrai backend
  const testApiMutation = useMutation({
    mutationFn: async ({ endpoint, method, body, headers }: { endpoint: string, method: string, body: any, headers: any }) => {
      return await apiRequest(endpoint, method as any, body, headers);
    },
    onSuccess: (response, variables) => {
      const responseTime = Date.now() - startTime;
      setResponse({
        status: response.status || 200,
        statusText: response.statusText || 'OK',
        data: response,
        responseTime
      });
      setLoading(false);
    },
    onError: (error: any, variables) => {
      const responseTime = Date.now() - startTime;
      setResponse({
        status: error.status || 500,
        statusText: error.statusText || 'Error',
        data: { error: error.message || 'Request failed' },
        responseTime
      });
      setLoading(false);
    }
  });

  let startTime = 0;

  const sendRequest = async () => {
    setLoading(true);
    startTime = Date.now();
    
    try {
      let parsedHeaders = {};
      let parsedBody = null;

      // Parse headers
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      // Parse body for non-GET requests
      if (method !== 'GET' && requestBody.trim()) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      // Use mutation for real backend testing
      testApiMutation.mutate({
        endpoint,
        method,
        body: parsedBody,
        headers: parsedHeaders
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        responseTime
      });
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator?.clipboard?.writeText(JSON.stringify(response.data, null, 2));
      toast({
        title: language === 'fr' ? 'Copié!' : 'Copied!',
        description: language === 'fr' ? 'Réponse copiée dans le presse-papiers' : 'Response copied to clipboard',
        duration: 2000,
      });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status >= 400) return <XCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Configuration de la Requête' : 'Request Configuration'}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Point de terminaison' : 'Endpoint'}
              </label>
              <select 
                value={endpoint}
                onChange={(e) => handleEndpointChange(e?.target?.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(Array.isArray(endpoints) ? endpoints : []).map((ep) => (
                  <option key={ep.value} value={ep.value}>
                    {ep.value} - {ep.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Méthode' : 'Method'}
              </label>
              <select 
                value={method}
                onChange={(e) => setMethod(e?.target?.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(Array.isArray(methods) ? methods : []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Action' : 'Action'}
              </label>
              <button
                onClick={sendRequest}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {loading 
                  ? (language === 'fr' ? 'Envoi...' : 'Sending...') 
                  : (language === 'fr' ? 'Envoyer' : 'Send')
                }
              </button>
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'fr' ? 'En-têtes (JSON)' : 'Headers (JSON)'}
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e?.target?.value)}
              className="w-full h-20 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder='{"Authorization": "Bearer token", "Custom-Header": "value"}'
            />
          </div>

          {/* Request Body */}
          {method !== 'GET' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Corps de la requête (JSON)' : 'Request Body (JSON)'}
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e?.target?.value)}
                className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'fr' 
                  ? 'Entrez le JSON ici...' 
                  : 'Enter JSON here...'
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Réponse' : 'Response'}
              </h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(response.status)}
                <span className={`font-mono text-sm ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {response.responseTime}ms
              </div>
            </div>
            <button
              onClick={copyResponse}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              {language === 'fr' ? 'Copier' : 'Copy'}
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(response.data, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APITester;