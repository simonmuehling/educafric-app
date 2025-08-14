import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Calendar, MapPin, FileText, FolderOpen, Settings,
  Users, MessageSquare, BarChart3, Plus, Clock, Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CreateAssignment from './CreateAssignment';
import TimetableManager from './TimetableManager';
import GeolocationTracker from './GeolocationTracker';
import BulletinManager from './BulletinManager';
import ResourceManager from './ResourceManager';
import SettingsManager from './SettingsManager';

const ConsolidatedActions = ({ userRole = 'teacher' }) => {
  const { language } = useLanguage();
  const [activeAction, setActiveAction] = useState('assignments');

  const text = {
    fr: {
      title: 'Fonctionnalités Consolidées',
      assignments: 'Devoirs',
      timetable: 'Emploi du Temps',
      geolocation: 'Géolocalisation',
      bulletins: 'Bulletins',
      resources: 'Ressources',
      settings: 'Paramètres',
      communications: 'Communications',
      analytics: 'Analyses'
    },
    en: {
      title: 'Consolidated Features',
      assignments: 'Assignments',
      timetable: 'Timetable',
      geolocation: 'Geolocation',
      bulletins: 'Report Cards',
      resources: 'Resources',
      settings: 'Settings',
      communications: 'Communications',
      analytics: 'Analytics'
    }
  };

  const t = text[language as keyof typeof text];

  const actions = [
    { id: 'assignments', label: t.assignments, icon: <BookOpen className="w-4 h-4" />, component: <CreateAssignment /> },
    { id: 'timetable', label: t.timetable, icon: <Calendar className="w-4 h-4" />, component: <TimetableManager /> },
    { id: 'geolocation', label: t.geolocation, icon: <MapPin className="w-4 h-4" />, component: <GeolocationTracker /> },
    { id: 'bulletins', label: t.bulletins, icon: <Award className="w-4 h-4" />, component: <BulletinManager /> },
    { id: 'resources', label: t.resources, icon: <FolderOpen className="w-4 h-4" />, component: <ResourceManager /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-4 h-4" />, component: <SettingsManager /> }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeAction} onValueChange={setActiveAction} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6">
          {(Array.isArray(actions) ? actions : []).map((action) => (
            <TabsTrigger key={action.id} value={action.id} className="flex items-center gap-2">
              {action.icon}
              <span className="hidden md:inline">{action.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {(Array.isArray(actions) ? actions : []).map((action) => (
          <TabsContent key={action.id} value={action.id}>
            {action.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ConsolidatedActions;