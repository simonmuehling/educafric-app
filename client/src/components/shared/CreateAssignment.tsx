import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookOpen, Calendar, Clock, FileText, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CreateAssignment = () => {
  const { language } = useLanguage();
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
    dueTime: '',
    type: '',
    instructions: ''
  });

  const text = {
    fr: {
      title: 'Créer un Devoir',
      assignmentTitle: 'Titre du Devoir',
      description: 'Description',
      subject: 'Matière',
      class: 'Classe',
      dueDate: 'Date d\'échéance',
      dueTime: 'Heure limite',
      type: 'Type de devoir',
      instructions: 'Instructions détaillées',
      selectSubject: 'Sélectionner une matière',
      selectClass: 'Sélectionner une classe',
      selectType: 'Sélectionner le type',
      homework: 'Devoir à la maison',
      classwork: 'Travail en classe',
      project: 'Projet',
      test: 'Test/Contrôle',
      create: 'Créer le Devoir',
      cancel: 'Annuler'
    },
    en: {
      title: 'Create Assignment',
      assignmentTitle: 'Assignment Title',
      description: 'Description',
      subject: 'Subject',
      class: 'Class',
      dueDate: 'Due Date',
      dueTime: 'Due Time',
      type: 'Assignment Type',
      instructions: 'Detailed Instructions',
      selectSubject: 'Select a subject',
      selectClass: 'Select a class',
      selectType: 'Select type',
      homework: 'Homework',
      classwork: 'Classwork',
      project: 'Project',
      test: 'Test/Quiz',
      create: 'Create Assignment',
      cancel: 'Cancel'
    }
  };

  const t = text[language as keyof typeof text];

  const subjects = ['Mathématiques', 'Français', 'Anglais', 'Sciences', 'Histoire', 'Géographie'];
  const classes = ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B'];
  const types = [t.homework, t.classwork, t.project, t.test];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate assignment creation
    alert(language === 'fr' 
      ? `Devoir "${assignment.title || ''}" créé avec succès pour la classe ${assignment.class}!`
      : `Assignment "${assignment.title || ''}" created successfully for class ${assignment.class}!`
    );
    // Reset form
    setAssignment({
      title: '',
      description: '',
      subject: '',
      class: '',
      dueDate: '',
      dueTime: '',
      type: '',
      instructions: ''
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          {t.title || ''}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t.assignmentTitle}</Label>
              <Input
                id="title"
                value={assignment.title || ''}
                onChange={(e) => setAssignment({...assignment, title: e?.target?.value})}
                placeholder={language === 'fr' ? 'Ex: Exercices de géométrie' : 'Ex: Geometry exercises'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t.subject}</Label>
              <Select onValueChange={(value) => setAssignment({...assignment, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectSubject} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(subjects) ? subjects : []).map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">{t.class}</Label>
              <Select onValueChange={(value) => setAssignment({...assignment, class: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(classes) ? classes : []).map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t.type}</Label>
              <Select onValueChange={(value) => setAssignment({...assignment, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectType} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(types) ? types : []).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t.dueDate}</Label>
              <Input
                id="dueDate"
                type="date"
                value={assignment.dueDate}
                onChange={(e) => setAssignment({...assignment, dueDate: e?.target?.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">{t.dueTime}</Label>
              <Input
                id="dueTime"
                type="time"
                value={assignment.dueTime}
                onChange={(e) => setAssignment({...assignment, dueTime: e?.target?.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description || ''}</Label>
            <Textarea
              id="description"
              value={assignment.description || ''}
              onChange={(e) => setAssignment({...assignment, description: e?.target?.value})}
              placeholder={language === 'fr' ? 'Description courte du devoir...' : 'Brief description of the assignment...'}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">{t.instructions}</Label>
            <Textarea
              id="instructions"
              value={assignment.instructions}
              onChange={(e) => setAssignment({...assignment, instructions: e?.target?.value})}
              placeholder={language === 'fr' 
                ? 'Instructions détaillées, ressources nécessaires, critères d\'évaluation...' 
                : 'Detailed instructions, required resources, evaluation criteria...'}
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              {t.create}
            </Button>
            <Button type="button" variant="outline">
              {t.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAssignment;