import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Camera, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  X,
  Send,
  Loader2
} from 'lucide-react';

interface HomeworkSubmissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  homework: {
    id: number;
    title: string;
    subject: string;
    dueDate: string;
  } | null;
}

interface FileWithPreview {
  file: File;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  preview?: string;
}

const HomeworkSubmissionModal: React.FC<HomeworkSubmissionModalProps> = ({
  isOpen,
  onOpenChange,
  homework
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const submitHomeworkMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/student/homework/submit', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la soumission');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/homework'] });
      toast({
        title: 'Devoir soumis',
        description: `Votre devoir "${homework?.title}" a été soumis avec succès.`
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre le devoir.',
        variant: 'destructive'
      });
    }
  });

  const getFileType = (file: File): 'image' | 'document' | 'video' | 'audio' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Archive className="w-4 h-4" />;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FileWithPreview[] = [];
    const maxFiles = 5;
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: 'Limite atteinte',
        description: `Maximum ${maxFiles} fichiers autorisés.`,
        variant: 'destructive'
      });
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        toast({
          title: 'Fichier trop volumineux',
          description: `${file.name || ''} dépasse la limite de 50MB.`,
          variant: 'destructive'
        });
        return;
      }

      const fileType = getFileType(file);
      const fileWithPreview: FileWithPreview = { file, type: fileType };
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          setSelectedFiles(prev => [...prev, fileWithPreview]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(fileWithPreview);
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => (Array.isArray(prev) ? prev : []).filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!homework) return;
    
    if (!submissionText.trim() && selectedFiles.length === 0) {
      toast({
        title: 'Submission vide',
        description: 'Veuillez ajouter du texte ou des fichiers.',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('homeworkId', homework.id.toString());
    formData.append('submissionText', submissionText);
    formData.append('submissionSource', 'web');

    selectedFiles.forEach((fileWithPreview, index) => {
      formData.append('files', fileWithPreview.file);
    });

    submitHomeworkMutation.mutate(formData);
  };

  const handleClose = () => {
    setSubmissionText('');
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Soumettre le devoir
          </DialogTitle>
        </DialogHeader>

        {homework && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-900">{homework.title || ''}</h3>
            <p className="text-sm text-blue-700">Matière: {homework.subject}</p>
            <p className="text-sm text-blue-700">À rendre le: {homework.dueDate}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Text Submission */}
          <div>
            <Label htmlFor="submission-text" className="text-sm font-medium">
              Votre réponse
            </Label>
            <Textarea
              id="submission-text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Rédigez votre réponse ici..."
              rows={6}
              className="mt-2"
              data-testid="textarea-submission"
            />
            <p className="text-xs text-gray-500 mt-1">
              {submissionText.length}/5000 caractères
            </p>
          </div>

          {/* File Upload Area */}
          <div>
            <Label className="text-sm font-medium">Pièces jointes (optionnel)</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Glissez-déposez vos fichiers ici ou
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-files"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Parcourir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    data-testid="button-camera"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Max 5 fichiers, 50MB chacun. Images, documents, audio, vidéo autorisés.
                </p>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Fichiers sélectionnés</Label>
              <div className="mt-2 space-y-2">
                {(Array.isArray(selectedFiles) ? selectedFiles : []).map((fileWithPreview, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {fileWithPreview.preview ? (
                        <img 
                          src={fileWithPreview.preview} 
                          alt="Preview" 
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {getFileIcon(fileWithPreview.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(fileWithPreview.file.name || '')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileWithPreview.file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitHomeworkMutation.isPending || (!submissionText.trim() && selectedFiles.length === 0)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-submit-homework"
            >
              {submitHomeworkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Soumission...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre le devoir
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitHomeworkMutation.isPending}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkSubmissionModal;