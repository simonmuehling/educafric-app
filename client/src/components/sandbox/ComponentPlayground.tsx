import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  Settings, Bell, User, Calendar, Download, 
  Upload, Share, Search, Filter, Edit,
  Trash2, Eye, Play, Pause, RotateCcw
} from 'lucide-react';

const ComponentPlayground = () => {
  const { language } = useLanguage();
  const [selectedComponent, setSelectedComponent] = useState('buttons');

  // Fonctions pour les boutons d'exemple
  const handleDownload = () => {
    console.log('Téléchargement...');
    alert(language === 'fr' ? 'Téléchargement simulé' : 'Simulated download');
  };

  const handleUpload = () => {
    console.log('Téléversement...');
    alert(language === 'fr' ? 'Téléversement simulé' : 'Simulated upload');
  };

  const handleShare = () => {
    console.log('Partage...');
    alert(language === 'fr' ? 'Partage simulé' : 'Simulated share');
  };

  const handlePrimary = () => {
    alert(language === 'fr' ? 'Bouton principal cliqué' : 'Primary button clicked');
  };

  const handleSecondary = () => {
    alert(language === 'fr' ? 'Bouton secondaire cliqué' : 'Secondary button clicked');
  };

  const handleOutline = () => {
    alert(language === 'fr' ? 'Bouton contour cliqué' : 'Outline button clicked');
  };

  const handleDestructive = () => {
    alert(language === 'fr' ? 'Action destructive confirmée' : 'Destructive action confirmed');
  };

  const components = [
    { id: 'buttons', label: language === 'fr' ? 'Boutons' : 'Buttons' },
    { id: 'cards', label: language === 'fr' ? 'Cartes' : 'Cards' },
    { id: 'forms', label: language === 'fr' ? 'Formulaires' : 'Forms' },
    { id: 'modals', label: language === 'fr' ? 'Modales' : 'Modals' },
    { id: 'navigation', label: language === 'fr' ? 'Navigation' : 'Navigation' },
    { id: 'icons', label: language === 'fr' ? 'Icônes' : 'Icons' },
    { id: 'stats', label: language === 'fr' ? 'Statistiques' : 'Statistics' }
  ];

  const renderButtons = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4">
          {language === 'fr' ? 'Boutons Principaux' : 'Primary Buttons'}
        </h4>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handlePrimary} data-testid="button-primary">
            {language === 'fr' ? 'Bouton Principal' : 'Primary Button'}
          </Button>
          <Button variant="secondary" onClick={handleSecondary} data-testid="button-secondary">
            {language === 'fr' ? 'Bouton Secondaire' : 'Secondary Button'}
          </Button>
          <Button variant="outline" onClick={handleOutline} data-testid="button-outline">
            {language === 'fr' ? 'Bouton Contour' : 'Outline Button'}
          </Button>
          <Button variant="destructive" onClick={handleDestructive} data-testid="button-destructive">
            {language === 'fr' ? 'Bouton Destructif' : 'Destructive Button'}
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">
          {language === 'fr' ? 'Boutons avec Icônes' : 'Icon Buttons'}
        </h4>
        <div className="flex flex-wrap gap-4">
          <Button className="flex items-center gap-2" onClick={handleDownload} data-testid="button-download">
            <Download className="w-4 h-4" />
            {language === 'fr' ? 'Télécharger' : 'Download'}
          </Button>
          <Button variant="secondary" className="flex items-center gap-2" onClick={handleUpload} data-testid="button-upload">
            <Upload className="w-4 h-4" />
            {language === 'fr' ? 'Téléverser' : 'Upload'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleShare} data-testid="button-share">
            <Share className="w-4 h-4" />
            {language === 'fr' ? 'Partager' : 'Share'}
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">
          {language === 'fr' ? 'Tailles de Boutons' : 'Button Sizes'}
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">
            {language === 'fr' ? 'Petit' : 'Small'}
          </Button>
          <Button>
            {language === 'fr' ? 'Moyen' : 'Medium'}
          </Button>
          <Button size="lg">
            {language === 'fr' ? 'Grand' : 'Large'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold">
              {language === 'fr' ? 'Carte Simple' : 'Simple Card'}
            </h4>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Ceci est un exemple de carte simple avec du contenu de base.'
                : 'This is an example of a simple card with basic content.'}
            </p>
          </CardContent>
        </Card>

        <ModernCard className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">
                  {language === 'fr' ? 'Carte Moderne' : 'Modern Card'}
                </h4>
                <p className="text-sm text-blue-700">
                  {language === 'fr' ? 'Avec gradient' : 'With gradient'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">
                  {language === 'fr' ? 'Progression' : 'Progress'}
                </span>
                <span className="text-blue-900 font-medium">75%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </ModernCard>

        <ModernStatsCard
          title={language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users'}
          value="1,247"
          trend={{ value: 12, isPositive: true }}
          gradient="green"
          icon={<User className="w-4 h-4" />}
        />
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">
            {language === 'fr' ? 'Exemple de Formulaire' : 'Sample Form'}
          </h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'fr' ? 'Nom complet' : 'Full Name'}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'fr' ? 'Entrez votre nom' : 'Enter your name'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'fr' ? 'Adresse e-mail' : 'Email Address'}
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'fr' ? 'Entrez votre e-mail' : 'Enter your email'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'fr' ? 'Rôle' : 'Role'}
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>{language === 'fr' ? 'Sélectionner un rôle' : 'Select a role'}</option>
              <option>{language === 'fr' ? 'Étudiant' : 'Student'}</option>
              <option>{language === 'fr' ? 'Enseignant' : 'Teacher'}</option>
              <option>{language === 'fr' ? 'Parent' : 'Parent'}</option>
              <option>{language === 'fr' ? 'Administrateur' : 'Admin'}</option>
            </select>
          </div>
          <div className="flex gap-4">
            <Button className="flex-1">
              {language === 'fr' ? 'Sauvegarder' : 'Save'}
            </Button>
            <Button variant="outline" className="flex-1">
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIcons = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4">
          {language === 'fr' ? 'Icônes d\'Action' : 'Action Icons'}
        </h4>
        <div className="grid grid-cols-6 md:grid-cols-10 gap-4">
          {[
            { icon: <Settings className="w-6 h-6" />, name: 'Settings' },
            { icon: <Bell className="w-6 h-6" />, name: 'Bell' },
            { icon: <User className="w-6 h-6" />, name: 'User' },
            { icon: <Calendar className="w-6 h-6" />, name: 'Calendar' },
            { icon: <Download className="w-6 h-6" />, name: 'Download' },
            { icon: <Upload className="w-6 h-6" />, name: 'Upload' },
            { icon: <Share className="w-6 h-6" />, name: 'Share' },
            { icon: <Search className="w-6 h-6" />, name: 'Search' },
            { icon: <Filter className="w-6 h-6" />, name: 'Filter' },
            { icon: <Edit className="w-6 h-6" />, name: 'Edit' },
            { icon: <Trash2 className="w-6 h-6" />, name: 'Delete' },
            { icon: <Eye className="w-6 h-6" />, name: 'View' },
            { icon: <Play className="w-6 h-6" />, name: 'Play' },
            { icon: <Pause className="w-6 h-6" />, name: 'Pause' },
            { icon: <RotateCcw className="w-6 h-6" />, name: 'Reset' }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="text-gray-700">
                {item.icon}
              </div>
              <span className="text-xs text-gray-600">{item.name || ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatsCard
          title={language === 'fr' ? 'Revenus' : 'Revenue'}
          value="€45,231"
          trend={{ value: 20.1, isPositive: true }}
          gradient="green"
          icon={<Download className="w-4 h-4" />}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Utilisateurs' : 'Users'}
          value="2,350"
          trend={{ value: 15, isPositive: true }}
          gradient="blue"
          icon={<User className="w-4 h-4" />}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Commandes' : 'Orders'}
          value="12,234"
          trend={{ value: 8, isPositive: true }}
          gradient="purple"
          icon={<Calendar className="w-4 h-4" />}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Taux de Conversion' : 'Conversion Rate'}
          value="3.2%"
          trend={{ value: 2, isPositive: false }}
          gradient="orange"
          icon={<Eye className="w-4 h-4" />}
        />
      </div>
    </div>
  );

  const renderComponentContent = () => {
    switch (selectedComponent) {
      case 'buttons':
        return renderButtons();
      case 'cards':
        return renderCards();
      case 'forms':
        return renderForms();
      case 'icons':
        return renderIcons();
      case 'stats':
        return renderStats();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Sélectionnez un composant pour voir l\'aperçu'
                : 'Select a component to see preview'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Component Selector */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Sélecteur de Composants' : 'Component Selector'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(components) ? components : []).map((component) => (
              <button
                key={component.id}
                onClick={() => setSelectedComponent(component.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedComponent === component.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {component.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Aperçu du Composant' : 'Component Preview'}
          </h3>
        </CardHeader>
        <CardContent>
          {renderComponentContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentPlayground;