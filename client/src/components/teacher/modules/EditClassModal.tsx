import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Save, Users, Clock, MapPin, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  onSave: (updatedClass: any) => void;
}

const EditClassModal = ({ isOpen, onClose, classData, onSave }: EditClassModalProps) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    subject: classData?.subject || '',
    room: classData?.room || '',
    maxStudents: classData?.students || 30,
    schedule: classData?.schedule || '',
    description: classData?.description || ''
  });

  const text = {
    fr: {
      title: 'Modifier la Classe',
      className: 'Nom de la classe',
      subject: 'Matière',
      room: 'Salle',
      maxStudents: 'Nombre max d\'élèves',
      schedule: 'Emploi du temps',
      description: 'Description',
      save: 'Enregistrer',
      cancel: 'Annuler',
      placeholders: {
        className: 'Ex: 6ème A',
        subject: 'Ex: Mathématiques',
        room: 'Ex: Salle 101',
        schedule: 'Ex: Lun-Mer-Ven 8h30',
        description: 'Description optionnelle de la classe'
      }
    },
    en: {
      title: 'Edit Class',
      className: 'Class name',
      subject: 'Subject',
      room: 'Room',
      maxStudents: 'Max students',
      schedule: 'Schedule',
      description: 'Description',
      save: 'Save',
      cancel: 'Cancel',
      placeholders: {
        className: 'Ex: 6th A',
        subject: 'Ex: Mathematics',
        room: 'Ex: Room 101',
        schedule: 'Ex: Mon-Wed-Fri 8:30 AM',
        description: 'Optional class description'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Nom et matière sont requis' : 'Name and subject are required',
        variant: 'destructive'
      });
      return;
    }

    const updatedClass = {
      ...classData,
      ...formData
    };

    onSave(updatedClass);
    toast({
      title: language === 'fr' ? 'Classe modifiée' : 'Class updated',
      description: language === 'fr' ? `${formData.name || ''} a été modifiée avec succès` : `${formData.name || ''} has been updated successfully`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Class Name */}
          <div>
            <Label htmlFor="className" className="text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4 inline mr-2" />
              {t.className}
            </Label>
            <Input
              id="className"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              placeholder={t?.placeholders?.className}
              className="mt-1"
            />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4 inline mr-2" />
              {t.subject}
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e?.target?.value)}
              placeholder={t?.placeholders?.subject}
              className="mt-1"
            />
          </div>

          {/* Room and Max Students */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="room" className="text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 inline mr-2" />
                {t.room}
              </Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e?.target?.value)}
                placeholder={t?.placeholders?.room}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxStudents" className="text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 inline mr-2" />
                {t.maxStudents}
              </Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e?.target?.value))}
                min="10"
                max="50"
                className="mt-1"
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <Label htmlFor="schedule" className="text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 inline mr-2" />
              {t.schedule}
            </Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => handleInputChange('schedule', e?.target?.value)}
              placeholder={t?.placeholders?.schedule}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              {t.description || ''}
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              placeholder={t?.placeholders?.description}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;