import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Users, School, User, Clock, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Communications = () => {
  const { language } = useLanguage();
  const [messageType, setMessageType] = useState('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Communications',
      subtitle: 'Messagerie école - parents, élèves et enseignants',
      composeMessage: 'Composer Message',
      messageType: 'Type de message',
      classSpecific: 'Classe spécifique',
      schoolWide: 'Toute l\'école',
      individual: 'Individuel',
      teacherSpecific: 'Enseignant spécifique',
      parentSpecific: 'Parent d\'élève',
      selectClass: 'Sélectionner classe',
      selectRecipient: 'Sélectionner destinataire',
      messageSubject: 'Objet du message',
      messageContent: 'Contenu du message',
      send: 'Envoyer',
      messageSent: 'Message envoyé!',
      recentMessages: 'Messages récents',
      messageHistory: 'Historique des messages',
      recipients: 'Destinataires',
      sentAt: 'Envoyé le',
      status: 'Statut',
      delivered: 'Livré',
      pending: 'En attente',
      failed: 'Échec'
    },
    en: {
      title: 'Communications',
      subtitle: 'School messaging - parents, students and teachers',
      composeMessage: 'Compose Message',
      messageType: 'Message type',
      classSpecific: 'Class specific',
      schoolWide: 'School wide',
      individual: 'Individual',
      teacherSpecific: 'Specific teacher',
      parentSpecific: 'Student parent',
      selectClass: 'Select class',
      selectRecipient: 'Select recipient',
      messageSubject: 'Message subject',
      messageContent: 'Message content',
      send: 'Send',
      messageSent: 'Message sent!',
      recentMessages: 'Recent messages',
      messageHistory: 'Message history',
      recipients: 'Recipients',
      sentAt: 'Sent on',
      status: 'Status',
      delivered: 'Delivered',
      pending: 'Pending',
      failed: 'Failed'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes for message targeting
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/classes'],
    queryFn: async () => {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Fetch teachers list
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teachers/school'],
    queryFn: async () => {
      const response = await fetch('/api/teachers/school');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Fetch students list
  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  // Fetch message history
  const { data: messageHistory = [], isLoading } = useQuery({
    queryKey: ['/api/communications/history'],
    queryFn: async () => {
      const response = await fetch('/api/communications/history');
      if (!response.ok) throw new Error('Failed to fetch message history');
      return response.json();
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      alert(t.messageSent);
      setMessage('');
      setSubject('');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !subject.trim()) {
      alert('Veuillez remplir le sujet et le contenu du message');
      return;
    }

    const messageData = {
      type: messageType,
      classId: messageType === 'class' ? selectedClass : null,
      subject,
      content: message,
      recipients: getRecipients()
    };

    sendMessageMutation.mutate(messageData);
  };

  const getRecipients = () => {
    switch (messageType) {
      case 'class':
        return selectedClass ? ['class_parents', 'class_students'] : [];
      case 'school':
        return ['all_parents', 'all_students', 'all_teachers'];
      case 'teacher':
        return selectedTeacher ? [`teacher_${selectedTeacher}`] : [];
      case 'parent':
        return selectedStudent ? [`parent_of_student_${selectedStudent}`] : [];
      default:
        return [];
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">{t.delivered}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t.pending}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">{t.failed}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const stats = [
    {
      title: 'Messages envoyés',
      value: (Array.isArray(messageHistory) ? messageHistory.length : 0).toString(),
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 5, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: 'Taux de livraison',
      value: '98%',
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: 'Classes actives',
      value: (Array.isArray(classes) ? classes.length : 0).toString(),
      icon: <School className="w-5 h-5" />,
      trend: { value: 0, isPositive: true },
      gradient: 'purple' as const
    },
    {
      title: 'Réponses reçues',
      value: '24',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 8, isPositive: true },
      gradient: 'orange' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Compose Message */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.composeMessage}</h3>
        
        <div className="space-y-4">
          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.messageType}
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="class"
                  checked={messageType === 'class'}
                  onChange={(e) => setMessageType(e?.target?.value)}
                  className="mr-2"
                />
                {t.classSpecific}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="school"
                  checked={messageType === 'school'}
                  onChange={(e) => setMessageType(e?.target?.value)}
                  className="mr-2"
                />
                {t.schoolWide}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="teacher"
                  checked={messageType === 'teacher'}
                  onChange={(e) => setMessageType(e?.target?.value)}
                  className="mr-2"
                />
                {t.teacherSpecific}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="parent"
                  checked={messageType === 'parent'}
                  onChange={(e) => setMessageType(e?.target?.value)}
                  className="mr-2"
                />
                {t.parentSpecific}
              </label>
            </div>
          </div>

          {/* Class Selection (only for class-specific messages) */}
          {messageType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.selectClass}
              </label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e?.target?.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">{t.selectClass}</option>
                {(Array.isArray(classes) ? classes : []).map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || ''} - {cls.level} ({cls.studentCount} élèves)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher Selection */}
          {messageType === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner enseignant
              </label>
              <select 
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e?.target?.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choisir un enseignant</option>
                {(Array.isArray(teachers) ? teachers : []).map((teacher: any) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name || ''} - {(teacher.subjects && Array.isArray(teacher.subjects)) ? teacher?.subjects?.join(', ') : 'Aucune matière'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Selection for Parent Messages */}
          {messageType === 'parent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner élève (parent sera contacté)
              </label>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e?.target?.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choisir un élève</option>
                {(Array.isArray(students) ? students : []).map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.name || ''} - {student.className || 'Classe non définie'} (Parent: {student.parentName || 'Non spécifié'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.messageSubject}
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e?.target?.value)}
              placeholder="Objet du message..."
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.messageContent}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e?.target?.value)}
              placeholder="Tapez votre message ici..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.send}
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Message History */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.messageHistory}</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement de l'historique...
            </div>
          ) : (Array.isArray(messageHistory) ? messageHistory.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun message envoyé
            </div>
          ) : (
            (Array.isArray(messageHistory) ? messageHistory : []).map((msg: any) => (
              <div key={msg.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{msg.subject}</h4>
                  {getStatusBadge(msg.status)}
                </div>
                <p className="text-gray-600 text-sm mb-2">{msg.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{t.recipients}: {msg.recipientCount}</span>
                  <span>{t.sentAt}: {new Date(msg.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
};

export default Communications;