import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, CheckCircle, Users, Award, Calendar, School } from 'lucide-react';

const TestBulletinPDF: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadTestBulletin = async () => {
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      
      const response = await fetch('/api/bulletins/test-bulletin/pdf');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'test-bulletin-amina-kouakou-2024.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error downloading test bulletin:', error);
      alert('Erreur lors du téléchargement du bulletin test');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Bulletin PDF EDUCAFRIC
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Téléchargez un exemple de bulletin scolaire généré avec des données d'une école africaine réaliste.
            Ce bulletin démontre la qualité professionnelle et les fonctionnalités de sécurité d'EDUCAFRIC.
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <School className="w-6 h-6" />
              Bulletin Test - Collège Excellence Africaine
            </CardTitle>
            <CardDescription className="text-blue-100">
              Exemple réaliste d'un bulletin scolaire généré par EDUCAFRIC
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Student Info Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Informations Élève
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nom:</span> Amina Kouakou</p>
                  <p><span className="font-medium">Classe:</span> 3ème A</p>
                  <p><span className="font-medium">École:</span> Collège Excellence Africaine</p>
                  <p><span className="font-medium">Lieu:</span> Yaoundé, Cameroun</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Résultats Académiques
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Moyenne Générale:</span> 15.43/20</p>
                  <p><span className="font-medium">Rang:</span> 3ème sur 42 élèves</p>
                  <p><span className="font-medium">Période:</span> 1er Trimestre</p>
                  <p><span className="font-medium">Année:</span> 2024-2025</p>
                </div>
              </div>
            </div>

            {/* Subjects Preview */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Matières Enseignées
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Mathématiques (16.5/20)',
                  'Français (14.0/20)', 
                  'Anglais (15.5/20)',
                  'Histoire-Géo (13.5/20)',
                  'Sciences Physiques (17.0/20)',
                  'Sciences Naturelles (16.0/20)',
                  'Éducation Physique (18.0/20)',
                  'Arts Plastiques (15.0/20)'
                ].map((subject, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                    {subject}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">
                Fonctionnalités du Bulletin EDUCAFRIC
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Calculs automatiques des moyennes
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Signatures numériques sécurisées
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Code QR d'authentification
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Personnalisation avec logo école
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Commentaires détaillés par matière
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Format PDF professionnel
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center">
              <Button 
                onClick={handleDownloadTestBulletin}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                data-testid="button-download-test-bulletin"
              >
                {downloading ? (
                  <>
                    <FileText className="w-5 h-5 text-white animate-pulse mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le Bulletin Test
                  </>
                )}
              </Button>
              
              {downloadSuccess && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Bulletin téléchargé avec succès !</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full mt-1">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-2">À propos de ce bulletin test</h4>
                <p className="text-sm text-amber-800">
                  Ce bulletin contient des données fictives mais réalistes d'une école africaine. 
                  Il démontre toutes les fonctionnalités d'EDUCAFRIC : calculs automatiques, 
                  sécurité numérique, personnalisation, et mise en page professionnelle adaptée 
                  au système éducatif africain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestBulletinPDF;