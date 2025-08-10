import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, Upload, Mic, MicOff, Play, Pause, Square, Download,
  Calendar, Users, FileText, Image, Video, AudioLines, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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

const ImprovedCreateAssignment = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    subject: 'mathematiques',
    class: '6eme-a',
    dueDate: '',
    dueTime: '23:59',
    type: 'homework',
    instructions: ''
  });
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const text = {
    fr: {
      title: 'Créer un Devoir',
      assignmentTitle: 'Titre du Devoir',
      description: 'Description courte',
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
      composition: 'Composition',
      create: 'Créer le Devoir',
      cancel: 'Annuler',
      addFiles: 'Ajouter des fichiers',
      recordAudio: 'Enregistrer audio',
      stopRecording: 'Arrêter l\'enregistrement',
      playAudio: 'Écouter l\'audio',
      pauseAudio: 'Mettre en pause',
      deleteAudio: 'Supprimer l\'audio',
      downloadAudio: 'Télécharger l\'audio',
      audioInstructions: 'Instructions audio',
      fileAttachments: 'Fichiers joints',
      removeFile: 'Supprimer le fichier',
      recording: 'Enregistrement...',
      recordingTime: 'Durée'
    },
    en: {
      title: 'Create Assignment',
      assignmentTitle: 'Assignment Title',
      description: 'Short Description',
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
      composition: 'Exam',
      create: 'Create Assignment',
      cancel: 'Cancel',
      addFiles: 'Add Files',
      recordAudio: 'Record Audio',
      stopRecording: 'Stop Recording',
      playAudio: 'Play Audio',
      pauseAudio: 'Pause Audio',
      deleteAudio: 'Delete Audio',
      downloadAudio: 'Download Audio',
      audioInstructions: 'Audio Instructions',
      fileAttachments: 'File Attachments',
      removeFile: 'Remove File',
      recording: 'Recording...',
      recordingTime: 'Duration'
    }
  };

  const t = text[language as keyof typeof text];

  const subjects = [
    { id: 'mathematiques', name: 'Mathématiques' },
    { id: 'francais', name: 'Français' },
    { id: 'anglais', name: 'Anglais' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'histoire', name: 'Histoire-Géographie' },
    { id: 'physique', name: 'Physique-Chimie' },
    { id: 'svt', name: 'SVT' },
    { id: 'education', name: 'Éducation Civique' }
  ];

  const classes = [
    { id: '6eme-a', name: '6ème A' },
    { id: '6eme-b', name: '6ème B' },
    { id: '5eme-a', name: '5ème A' },
    { id: '5eme-b', name: '5ème B' },
    { id: '4eme-a', name: '4ème A' },
    { id: '3eme-a', name: '3ème A' }
  ];

  const assignmentTypes = [
    { id: 'homework', name: t.homework },
    { id: 'classwork', name: t.classwork },
    { id: 'project', name: t.project },
    { id: 'test', name: t.test },
    { id: 'composition', name: t.composition }
  ];

  // Gestion de l'enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event?.data?.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setRecordedAudio(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Nettoyer le stream
        if (streamRef.current) {
          streamRef?.current?.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Démarrer le chronomètre
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: language === 'fr' ? 'Enregistrement commencé' : 'Recording started',
        description: language === 'fr' ? 'Parlez maintenant...' : 'Speak now...'
      });
      
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
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
        description: language === 'fr' ? 'Audio sauvegardé avec succès' : 'Audio saved successfully'
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef?.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef?.current?.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordedAudio(null);
    setIsPlaying(false);
    
    toast({
      title: language === 'fr' ? 'Audio supprimé' : 'Audio deleted',
      description: language === 'fr' ? 'L\'enregistrement a été supprimé' : 'Recording has been deleted'
    });
  };

  const downloadAudio = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instruction-audio-${Date.now()}.webm`;
      document?.body?.appendChild(a);
      a.click();
      document?.body?.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: language === 'fr' ? 'Audio téléchargé' : 'Audio downloaded',
        description: language === 'fr' ? 'Le fichier a été téléchargé' : 'File has been downloaded'
      });
    }
  };

  // Gestion des fichiers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!assignment.title || !assignment.description || !assignment.dueDate) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    setShowConfirmDialog(true);
  };

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
      
      // Ajouter l'audio si disponible
      if (recordedAudio) {
        formData.append('audio_instructions', recordedAudio, 'instructions.webm');
      }
      
      await apiRequest('POST', '/api/assignments', formData);
      
      toast({
        title: language === 'fr' ? 'Devoir créé' : 'Assignment created',
        description: language === 'fr' ? 'Le devoir a été créé avec succès' : 'Assignment has been created successfully'
      });
      
      // Réinitialiser le formulaire
      setAssignment({
        title: '',
        description: '',
        subject: 'mathematiques',
        class: '6eme-a',
        dueDate: '',
        dueTime: '23:59',
        type: 'homework',
        instructions: ''
      });
      setMediaFiles([]);
      deleteAudio();
      setShowConfirmDialog(false);
      
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer le devoir' : 'Failed to create assignment',
        variant: 'destructive'
      });
      setShowConfirmDialog(false);
    }
  };

  // Cleanup de l'audio à la fermeture
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef?.current?.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">Créer un nouveau devoir avec instructions multimédia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {t.create}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de base */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.assignmentTitle} *</label>
              <Input
                value={assignment.title || ''}
                onChange={(e) => setAssignment(prev => ({ ...prev, title: e?.target?.value }))}
                placeholder="Ex: Exercices de mathématiques chapitre 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.description || ''} *</label>
              <Textarea
                value={assignment.description || ''}
                onChange={(e) => setAssignment(prev => ({ ...prev, description: e?.target?.value }))}
                placeholder="Description courte du devoir..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.subject}</label>
                <select
                  value={assignment.subject}
                  onChange={(e) => setAssignment(prev => ({ ...prev, subject: e?.target?.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Array.isArray(subjects) ? subjects : []).map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name || ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.class}</label>
                <select
                  value={assignment.class}
                  onChange={(e) => setAssignment(prev => ({ ...prev, class: e?.target?.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Array.isArray(classes) ? classes : []).map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.dueDate} *</label>
                <Input
                  type="date"
                  value={assignment.dueDate}
                  onChange={(e) => setAssignment(prev => ({ ...prev, dueDate: e?.target?.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t.dueTime}</label>
                <Input
                  type="time"
                  value={assignment.dueTime}
                  onChange={(e) => setAssignment(prev => ({ ...prev, dueTime: e?.target?.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.type}</label>
              <select
                value={assignment.type}
                onChange={(e) => setAssignment(prev => ({ ...prev, type: e?.target?.value }))}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Array.isArray(assignmentTypes) ? assignmentTypes : []).map(type => (
                  <option key={type.id} value={type.id}>{type.name || ''}</option>
                ))}
              </select>
            </div>
          </div>
        </ModernCard>

        {/* Instructions et médias */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions et médias</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.instructions}</label>
              <Textarea
                value={assignment.instructions}
                onChange={(e) => setAssignment(prev => ({ ...prev, instructions: e?.target?.value }))}
                placeholder="Instructions détaillées pour les élèves..."
                rows={4}
              />
            </div>

            {/* Section Audio */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.audioInstructions}</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                {!audioUrl ? (
                  <div className="text-center">
                    <AudioLines className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      Enregistrez des instructions audio pour vos élèves
                    </p>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          {t.stopRecording}
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          {t.recordAudio}
                        </>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <div className="mt-3">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">
                            {t.recording} {formatTime(recordingTime)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AudioLines className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Instructions audio</span>
                        <Badge variant="outline">{formatTime(recordingTime)}</Badge>
                      </div>
                      <Button
                        onClick={deleteAudio}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                    
                    <div className="flex gap-2">
                      <Button onClick={playAudio} size="sm" variant="outline">
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            {t.pauseAudio}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            {t.playAudio}
                          </>
                        )}
                      </Button>
                      <Button onClick={downloadAudio} size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        {t.downloadAudio}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Fichiers */}
            <div>
              <label className="block text-sm font-medium mb-2">{t.fileAttachments}</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center mb-3">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Documents, images, vidéos...
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.addFiles}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {(Array.isArray(mediaFiles) ? mediaFiles.length : 0) > 0 && (
                  <div className="space-y-2">
                    {(Array.isArray(mediaFiles) ? mediaFiles : []).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm truncate">{file.name || ''}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'fr' ? 'Confirmer la création du devoir' : 'Confirm Assignment Creation'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'fr' ? 'Êtes-vous sûr de vouloir créer ce devoir ? Cette action enverra des notifications aux élèves.' : 'Are you sure you want to create this assignment? This action will send notifications to students.'}
                <br /><br />
                <strong>{language === 'fr' ? 'Titre:' : 'Title:'}</strong> {assignment.title}
                <br />
                <strong>{language === 'fr' ? 'Classe:' : 'Class:'}</strong> {assignment.class}
                <br />
                <strong>{language === 'fr' ? 'Matière:' : 'Subject:'}</strong> {assignment.subject}
                <br />
                <strong>{language === 'fr' ? 'Échéance:' : 'Due Date:'}</strong> {assignment.dueDate} {assignment.dueTime}
                <br />
                <strong>{language === 'fr' ? 'Fichiers attachés:' : 'Attached Files:'}</strong> {mediaFiles.length}
                <br />
                <strong>{language === 'fr' ? 'Instructions audio:' : 'Audio Instructions:'}</strong> {recordedAudio ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}
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
    </div>
  );
};

export default ImprovedCreateAssignment;