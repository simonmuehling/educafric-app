import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, Upload, Mic, Camera, Paperclip, 
  Save, X, Play, Pause, Square, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernCard } from '@/components/ui/ModernCard';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EnhancedCreateAssignment = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
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
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      cancel: 'Annuler',
      addMedia: 'Ajouter des médias',
      recordAudio: 'Enregistrer audio',
      takePicture: 'Prendre une photo',
      uploadFiles: 'Télécharger fichiers',
      startRecording: 'Commencer l\'enregistrement',
      stopRecording: 'Arrêter l\'enregistrement',
      playRecording: 'Écouter l\'enregistrement',
      deleteRecording: 'Supprimer l\'enregistrement',
      attachedFiles: 'Fichiers joints',
      voiceInstructions: 'Instructions vocales',
      multimedia: 'Contenu multimédia'
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
      cancel: 'Cancel',
      addMedia: 'Add Media',
      recordAudio: 'Record Audio',
      takePicture: 'Take Picture',
      uploadFiles: 'Upload Files',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      playRecording: 'Play Recording',
      deleteRecording: 'Delete Recording',
      attachedFiles: 'Attached Files',
      voiceInstructions: 'Voice Instructions',
      multimedia: 'Multimedia Content'
    }
  };

  const t = text[language as keyof typeof text];

  const subjects = ['Mathématiques', 'Français', 'Anglais', 'Sciences', 'Histoire', 'Géographie'];
  const classes = ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B'];
  const types = [t.homework, t.classwork, t.project, t.test];

  const startRecording = async () => {
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: language === 'fr' ? 'Enregistrement démarré' : 'Recording started',
        description: language === 'fr' ? 'Parlez maintenant...' : 'Speak now...'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'accéder au microphone' : 'Cannot access microphone',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef?.current?.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      toast({
        title: language === 'fr' ? 'Enregistrement terminé' : 'Recording completed',
        description: language === 'fr' ? 'Audio sauvegardé' : 'Audio saved'
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.target?.files || []);
    setMediaFiles(prev => [...prev, ...files]);
    toast({
      title: language === 'fr' ? 'Fichiers ajoutés' : 'Files added',
      description: `${(Array.isArray(files) ? files.length : 0)} ${language === 'fr' ? 'fichier(s) ajouté(s)' : 'file(s) added'}`
    });
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => (Array.isArray(prev) ? prev : []).filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  // Mutation pour créer un assignment
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: FormData) => {
      return await apiRequest('/api/assignments', 'POST', assignmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/assignments'] });
      toast({
        title: language === 'fr' ? 'Devoir créé!' : 'Assignment created!',
        description: language === 'fr' 
          ? `"${assignment.title || ''}" créé avec succès et notifications envoyées`
          : `"${assignment.title || ''}" created successfully and notifications sent`
      });
      
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
      setMediaFiles([]);
      setAudioUrl(null);
      setRecordingTime(0);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer le devoir' : 'Failed to create assignment',
        variant: 'destructive'
      });
      setShowConfirmDialog(false);
    }
  });

  const confirmCreateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append('title', assignment.title);
      formData.append('description', assignment.description);
      formData.append('subject', assignment.subject);
      formData.append('class', assignment.class);
      formData.append('dueDate', assignment.dueDate);
      formData.append('dueTime', assignment.dueTime);
      formData.append('type', assignment.type);
      formData.append('instructions', assignment.instructions);
      
      // Ajouter les fichiers
      mediaFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      // Ajouter l'audio si disponible (blob audio depuis l'enregistrement)
      if (audioUrl) {
        const audioBlob = await fetch(audioUrl).then(r => r.blob());
        formData.append('audio_instructions', audioBlob, 'instructions.webm');
      }
      
      createAssignmentMutation.mutate(formData);
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de préparer les données' : 'Failed to prepare data',
        variant: 'destructive'
      });
      setShowConfirmDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          {t.title || ''}
        </h2>
        <p className="text-gray-600 mt-2">
          {language === 'fr' ? 'Créez un devoir avec du contenu multimédia' : 'Create an assignment with multimedia content'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {language === 'fr' ? 'Informations de base' : 'Basic Information'}
          </h3>
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
              <select 
                value={assignment.subject}
                onChange={(e) => setAssignment({...assignment, subject: e?.target?.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t.selectSubject}</option>
                {(Array.isArray(subjects) ? subjects : []).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">{t.class}</Label>
              <select 
                value={assignment.class}
                onChange={(e) => setAssignment({...assignment, class: e?.target?.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t.selectClass}</option>
                {(Array.isArray(classes) ? classes : []).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t.type}</Label>
              <select 
                value={assignment.type}
                onChange={(e) => setAssignment({...assignment, type: e?.target?.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t.selectType}</option>
                {(Array.isArray(types) ? types : []).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

          <div className="mt-4 space-y-2">
            <Label htmlFor="description">{t.description || ''}</Label>
            <Textarea
              id="description"
              value={assignment.description || ''}
              onChange={(e) => setAssignment({...assignment, description: e?.target?.value})}
              placeholder={language === 'fr' ? 'Description courte du devoir' : 'Short description of the assignment'}
              rows={3}
            />
          </div>
        </ModernCard>

        {/* Multimedia Content */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            {t.multimedia}
          </h3>

          {/* Voice Recording */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              {t.voiceInstructions}
            </h4>
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {t.startRecording}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {t.stopRecording}
                </Button>
              )}
              
              {isRecording && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </div>
              )}

              {audioUrl && (
                <div className="flex items-center gap-2">
                  <audio controls src={audioUrl} className="h-8">
                    Your browser does not support audio recording.
                  </audio>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setAudioUrl(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              {t.attachedFiles}
            </h4>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.uploadFiles}
              </Button>

              {(Array.isArray(mediaFiles) ? mediaFiles.length : 0) > 0 && (
                <div className="space-y-2">
                  {(Array.isArray(mediaFiles) ? mediaFiles : []).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name || ''}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModernCard>

        {/* Instructions */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {t.instructions}
          </h3>
          <Textarea
            value={assignment.instructions}
            onChange={(e) => setAssignment({...assignment, instructions: e?.target?.value})}
            placeholder={language === 'fr' ? 'Instructions détaillées pour les élèves...' : 'Detailed instructions for students...'}
            rows={4}
          />
        </ModernCard>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline">
            <X className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {t.create}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer la création du devoir' : 'Confirm Assignment Creation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' ? 'Êtes-vous sûr de vouloir créer ce devoir ?' : 'Are you sure you want to create this assignment?'}
              <br /><br />
              <strong>{language === 'fr' ? 'Titre:' : 'Title:'}</strong> {assignment.title}
              <br />
              <strong>{language === 'fr' ? 'Classe:' : 'Class:'}</strong> {assignment.class}
              <br />
              <strong>{language === 'fr' ? 'Matière:' : 'Subject:'}</strong> {assignment.subject}
              <br />
              <strong>{language === 'fr' ? 'Échéance:' : 'Due Date:'}</strong> {assignment.dueDate} {assignment.dueTime}
              <br />
              <strong>{language === 'fr' ? 'Fichiers:' : 'Files:'}</strong> {mediaFiles.length}
              <br />
              <strong>{language === 'fr' ? 'Audio:' : 'Audio:'}</strong> {audioUrl ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreateAssignment}>
              {language === 'fr' ? 'Créer le devoir' : 'Create Assignment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnhancedCreateAssignment;