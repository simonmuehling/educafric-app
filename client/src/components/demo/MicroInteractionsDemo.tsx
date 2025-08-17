import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MousePointer, 
  Zap, 
  Sparkles, 
  Heart, 
  Star,
  Play,
  Download,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MicroInteractionsDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDemoAction = (actionName: string) => {
    toast({
      title: `🎯 Micro Interaction: ${actionName}`,
      description: "Animation déclenchée avec succès !",
      duration: 2000,
    });
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎭 Micro Interactions Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les animations subtiles qui rendent EDUCAFRIC plus vivant et engageant
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Hover Lift Cards */}
          <Card className="hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-blue-500" />
                Hover Lift Effect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Survolez cette carte pour voir l'effet de levée 3D
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <code className="text-xs">hover-lift</code>
              </div>
            </CardContent>
          </Card>

          {/* Click Bounce Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Click Bounce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="click-bounce w-full"
                onClick={() => handleDemoAction("Click Bounce")}
              >
                Cliquez-moi !
              </Button>
              <Button 
                variant="outline" 
                className="click-bounce w-full"
                onClick={() => handleDemoAction("Outline Bounce")}
              >
                Ou moi !
              </Button>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <code className="text-xs">click-bounce</code>
              </div>
            </CardContent>
          </Card>

          {/* Gradient Hover Animation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Gradient Hover
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="gradient-hover w-full text-white"
                onClick={() => handleDemoAction("Gradient Animation")}
              >
                Gradient magique
              </Button>
              <div className="bg-purple-50 p-3 rounded-lg">
                <code className="text-xs">gradient-hover</code>
              </div>
            </CardContent>
          </Card>

          {/* Focus Ring Animation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-500" />
                Focus Ring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input 
                placeholder="Cliquez ici pour voir le focus ring"
                className="focus-ring"
              />
              <Input 
                placeholder="Essayez Tab pour naviguer"
                className="focus-ring"
              />
              <div className="bg-green-50 p-3 rounded-lg">
                <code className="text-xs">focus-ring</code>
              </div>
            </CardContent>
          </Card>

          {/* Card Tilt Effect */}
          <Card className="card-tilt cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-indigo-500" />
                Card Tilt 3D
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Survolez pour voir l'effet de rotation 3D
              </p>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <code className="text-xs">card-tilt</code>
              </div>
            </CardContent>
          </Card>

          {/* Shimmer Loading Effect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-red-500" />
                Shimmer Loading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={simulateLoading}
                disabled={isLoading}
                className="w-full"
              >
                Démarrer le chargement
              </Button>
              
              {isLoading && (
                <div className="space-y-2">
                  <div className="shimmer h-4 rounded bg-gray-200"></div>
                  <div className="shimmer h-4 rounded bg-gray-200 w-3/4"></div>
                  <div className="shimmer h-4 rounded bg-gray-200 w-1/2"></div>
                </div>
              )}
              
              <div className="bg-red-50 p-3 rounded-lg">
                <code className="text-xs">shimmer</code>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Boutons d'Action EDUCAFRIC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="hover-lift click-bounce"
                onClick={() => handleDemoAction("Communications")}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              
              <Button 
                variant="outline"
                className="hover-lift click-bounce"
                onClick={() => handleDemoAction("Reply Message")}
              >
                Répondre
              </Button>
              
              <Button 
                variant="destructive"
                className="hover-lift click-bounce"
                onClick={() => handleDemoAction("Archive")}
              >
                Archiver
              </Button>
              
              <Button 
                className="gradient-hover click-bounce"
                onClick={() => handleDemoAction("Premium Action")}
              >
                Action Premium
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">🎯 Fonctionnalités testées :</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">hover-lift</Badge>
                <Badge variant="secondary">click-bounce</Badge>
                <Badge variant="secondary">gradient-hover</Badge>
                <Badge variant="secondary">focus-ring</Badge>
                <Badge variant="secondary">card-tilt</Badge>
                <Badge variant="secondary">shimmer</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Info */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">0.2-0.6s</div>
                <div className="text-sm text-gray-600">Durée optimale</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">60 FPS</div>
                <div className="text-sm text-gray-600">Performance fluide</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">CSS3</div>
                <div className="text-sm text-gray-600">Hardware accelerated</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default MicroInteractionsDemo;