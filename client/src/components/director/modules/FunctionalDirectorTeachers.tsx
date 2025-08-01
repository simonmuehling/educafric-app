import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModernCard } from '../../ui/ModernCard';
import { Users, Mail, Phone, BookOpen, Award, Clock } from 'lucide-react';

interface TeacherData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjects?: string[];
  experience?: number;
  status: string;
}

export function FunctionalDirectorTeachers() {
  const { data: teachersData = [], isLoading, error } = useQuery<TeacherData[]>({
    queryKey: ['/api/director/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch director teachers');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Gestion des Enseignants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-56"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur de Chargement
        </h3>
        <p className="text-red-600">
          Impossible de charger les données des enseignants.
        </p>
      </div>
    );
  }

  // Default teachers data for demo  
  const defaultTeachers = [
    {
      id: 1,
      firstName: "Pierre",
      lastName: "Fouda", 
      email: "pierre.fouda@educafric.com",
      phone: "+237 655 123 456",
      subjects: ["Mathématiques", "Physique"],
      experience: 8,
      status: "active"
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Nkomo",
      email: "marie.nkomo@educafric.com", 
      phone: "+237 651 234 567",
      subjects: ["Français", "Littérature"],
      experience: 12,
      status: "active"
    },
    {
      id: 3,
      firstName: "Emmanuel",
      lastName: "Nyong",
      email: "emmanuel.nyong@educafric.com",
      phone: "+237 652 345 678", 
      subjects: ["Histoire", "Géographie"],
      experience: 6,
      status: "active"
    }
  ];

  const displayData = (Array.isArray(teachersData) ? teachersData.length : 0) > 0 ? teachersData : defaultTeachers;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestion des Enseignants
          </h2>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {(Array.isArray(displayData) ? displayData.length : 0)} enseignant{(Array.isArray(displayData) ? displayData.length : 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(displayData) ? displayData : []).map((teacher) => (
            <ModernCard key={teacher.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(teacher.status)}`}>
                    {getStatusText(teacher.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {teacher.firstName || ''} {teacher.lastName || ''}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{teacher.email || ''}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {teacher.phone}
                    </div>
                  )}
                  {teacher.experience && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      {teacher.experience} ans d'expérience
                    </div>
                  )}
                </div>

                {teacher.subjects && teacher.(Array.isArray(subjects) ? subjects.length : 0) > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Matières enseignées
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="w-4 h-4 mr-1" />
                    Enseignant
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>


      </div>
    </div>
  );
}