import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Upload, Download, FileText, CheckCircle, AlertCircle, Users, GraduationCap, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  created: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data?: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: 'teachers' | 'students' | 'parents';
  onImportComplete?: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, importType, onImportComplete }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const translations = {
    fr: {
      title: {
        teachers: 'Importer des Enseignants',
        students: 'Importer des Élèves',
        parents: 'Importer des Parents'
      },
      downloadTemplate: 'Télécharger le modèle',
      selectFile: 'Sélectionner le fichier',
      fileFormats: 'Formats supportés: Excel (.xlsx) ou CSV',
      importButton: 'Importer',
      importing: 'Import en cours...',
      cancel: 'Annuler',
      close: 'Fermer',
      results: 'Résultats de l\'import',
      created: 'créés',
      errors: 'erreurs',
      warnings: 'avertissements',
      success: 'Import réussi !',
      error: 'Erreur lors de l\'import',
      dragDrop: 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner',
      fileSelected: 'Fichier sélectionné:'
    },
    en: {
      title: {
        teachers: 'Import Teachers',
        students: 'Import Students', 
        parents: 'Import Parents'
      },
      downloadTemplate: 'Download Template',
      selectFile: 'Select File',
      fileFormats: 'Supported formats: Excel (.xlsx) or CSV',
      importButton: 'Import',
      importing: 'Importing...',
      cancel: 'Cancel',
      close: 'Close',
      results: 'Import Results',
      created: 'created',
      errors: 'errors', 
      warnings: 'warnings',
      success: 'Import successful!',
      error: 'Import error',
      dragDrop: 'Drag and drop your file here or click to select',
      fileSelected: 'File selected:'
    }
  };

  const t = translations[language];
  
  const getIcon = () => {
    switch(importType) {
      case 'teachers': return <Users className="w-6 h-6" />;
      case 'students': return <GraduationCap className="w-6 h-6" />;
      case 'parents': return <User className="w-6 h-6" />;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/director/import/template/${importType}`);
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${importType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: language === 'fr' ? 'Modèle téléchargé' : 'Template downloaded',
        description: language === 'fr' 
          ? 'Le fichier modèle a été téléchargé avec succès'
          : 'Template file downloaded successfully'
      });
    } catch (error) {
      toast({
        title: t.error,
        description: language === 'fr'
          ? 'Erreur lors du téléchargement du modèle'
          : 'Error downloading template',
        variant: 'destructive'
      });
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t.error,
        description: language === 'fr'
          ? 'Format de fichier non supporté. Utilisez Excel (.xlsx) ou CSV.'
          : 'Unsupported file format. Use Excel (.xlsx) or CSV.',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch(`/api/director/import/${importType}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }
      
      setImportResult(data.result);
      setShowResults(true);
      
      if (data.result.success) {
        toast({
          title: t.success,
          description: `${data.result.created} ${t.created}`,
        });
        
        // Call callback to refresh data
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        toast({
          title: language === 'fr' ? 'Import terminé avec des erreurs' : 'Import completed with errors',
          description: `${data.result.created} ${t.created}, ${data.result.errors.length} ${t.errors}`,
          variant: 'destructive'
        });
      }
      
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowResults(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t.title[importType]}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showResults ? (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="text-center">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadTemplate}
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t.fileFormats}
                </p>
              </div>

              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {t.dragDrop}
                </p>
                
                {selectedFile && (
                  <div className="flex items-center justify-center gap-2 mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {t.fileSelected} {selectedFile.name}
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {importing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {importing ? t.importing : t.importButton}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results Header */}
              <div className="flex items-center gap-2">
                {importResult?.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <h3 className="text-lg font-semibold">{t.results}</h3>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult?.created || 0}</div>
                  <div className="text-sm text-green-600">{t.created}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult?.errors.length || 0}</div>
                  <div className="text-sm text-red-600">{t.errors}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult?.warnings.length || 0}</div>
                  <div className="text-sm text-yellow-600">{t.warnings}</div>
                </div>
              </div>

              {/* Errors Details */}
              {importResult?.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">{t.errors}:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300">
                        Ligne {error.row}: {error.message}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="text-sm text-red-600 italic">
                        ... et {importResult.errors.length - 10} autres erreurs
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings Details */}
              {importResult?.warnings && importResult.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t.warnings}:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.warnings.slice(0, 10).map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                        Ligne {warning.row}: {warning.message}
                      </div>
                    ))}
                    {importResult.warnings.length > 10 && (
                      <div className="text-sm text-yellow-600 italic">
                        ... et {importResult.warnings.length - 10} autres avertissements
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;