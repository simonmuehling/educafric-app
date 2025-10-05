import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignaturePad } from "../components/SignaturePad";
import { BulletinSignatureModal } from "../components/BulletinSignatureModal";
import { SchoolAssetUploader } from "../components/SchoolAssetUploader";
import { PenTool, FileText, School, Stamp, Award } from "lucide-react";

/**
 * Page de test pour les fonctionnalités de signature numérique
 * Permet de tester :
 * - Signature manuelle sur canvas
 * - Upload de fichier signature
 * - Signature de bulletins
 * - Gestion des assets d'école (logo, tampon, signature directeur)
 */
export default function SignatureTest() {
  const [showBulletinModal, setShowBulletinModal] = useState(false);

  // Mock user data
  const mockUser = {
    id: 1,
    role: "Director",
    firstName: "Marie",
    lastName: "Kouakou",
    schoolId: 1
  };

  // Mock bulletin data for testing
  const mockBulletin = {
    id: 1,
    studentName: "Jean Kouassi",
    className: "6ème A",
    generalAverage: 14.5,
    classRank: 3
  };

  const handleSignatureSave = (signature: string) => {
    console.log("Signature saved:", signature);
  };

  const handleBulletinSignComplete = () => {
    setShowBulletinModal(false);
    console.log("Bulletin signature completed");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Système de Signature Numérique
        </h1>
        <p className="text-gray-600">
          Test des fonctionnalités de signature pour Educafric
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <PenTool className="w-3 h-3" />
            Signatures Canvas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Upload Fichiers
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            Bulletins Numériques
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Signature Enseignant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600" />
              Signature Enseignant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignaturePad
              title="Ma Signature"
              userType="teacher"
              userId={mockUser.id}
              onSignatureSave={handleSignatureSave}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Section Signature Directeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-green-600" />
              Signature Directeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignaturePad
              title="Signature du Directeur"
              userType="director"
              userId={mockUser.id}
              onSignatureSave={handleSignatureSave}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Section Test Bulletin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Test Signature de Bulletin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Bulletin de Test</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Élève:</span> {mockBulletin.studentName}
              </div>
              <div>
                <span className="font-medium">Classe:</span> {mockBulletin.className}
              </div>
              <div>
                <span className="font-medium">Moyenne:</span> {mockBulletin.generalAverage}/20
              </div>
              <div>
                <span className="font-medium">Rang:</span> {mockBulletin.classRank}
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setShowBulletinModal(true)}
            className="w-full"
            data-testid="button-sign-bulletin"
          >
            <Award className="w-4 h-4 mr-2" />
            Signer ce Bulletin
          </Button>
        </CardContent>
      </Card>

      {/* Section Assets École */}
      <SchoolAssetUploader 
        schoolId={mockUser.schoolId}
        onAssetUploaded={(assetType, assetUrl) => {
          console.log(`Asset ${assetType} uploaded:`, assetUrl);
        }}
      />

      {/* Informations de Test */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Informations de Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Utilisateur:</strong> {mockUser.firstName} {mockUser.lastName}
            </div>
            <div>
              <strong>Rôle:</strong> {mockUser.role}
            </div>
            <div>
              <strong>ID Utilisateur:</strong> {mockUser.id}
            </div>
            <div>
              <strong>ID École:</strong> {mockUser.schoolId}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Signature de Bulletin */}
      {showBulletinModal && (
        <BulletinSignatureModal
          isOpen={showBulletinModal}
          onClose={() => setShowBulletinModal(false)}
          bulletinData={mockBulletin}
          userType="director"
          userId={mockUser.id}
          userName={`${mockUser.firstName} ${mockUser.lastName}`}
          onSignatureComplete={handleBulletinSignComplete}
        />
      )}
    </div>
  );
}