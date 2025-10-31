import { BilingualPopup, useBilingualPopup } from './BilingualPopup';
import { Button } from '@/components/ui/button';
import { Info, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Exemples d'utilisation du BilingualPopup
 */

// Exemple 1: Popup d'information simple
export function InfoPopupExample() {
  const popup = useBilingualPopup();

  return (
    <>
      <Button onClick={popup.show} data-testid="button-info-example">
        <Info className="w-4 h-4 mr-2" />
        Information
      </Button>

      <BilingualPopup
        open={popup.open}
        onOpenChange={popup.setOpen}
        title={{
          fr: 'Information Importante',
          en: 'Important Information'
        }}
        description={{
          fr: 'Voici un message d\'information pour l\'utilisateur.',
          en: 'Here is an informational message for the user.'
        }}
        confirmText={{
          fr: 'Compris',
          en: 'Understood'
        }}
        onConfirm={() => {
          console.log('Info acknowledged');
        }}
      />
    </>
  );
}

// Exemple 2: Popup de confirmation de suppression
export function DeleteConfirmationExample() {
  const popup = useBilingualPopup();

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={popup.show}
        data-testid="button-delete-example"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer
      </Button>

      <BilingualPopup
        open={popup.open}
        onOpenChange={popup.setOpen}
        title={{
          fr: 'Confirmer la suppression',
          en: 'Confirm Deletion'
        }}
        description={{
          fr: 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
          en: 'Are you sure you want to delete this item? This action cannot be undone.'
        }}
        confirmText={{
          fr: 'Supprimer',
          en: 'Delete'
        }}
        cancelText={{
          fr: 'Annuler',
          en: 'Cancel'
        }}
        confirmVariant="destructive"
        onConfirm={() => {
          console.log('Item deleted');
        }}
      />
    </>
  );
}

// Exemple 3: Popup avec contenu personnalisé
export function CustomContentExample() {
  const popup = useBilingualPopup();

  return (
    <>
      <Button onClick={popup.show} data-testid="button-custom-example">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Contenu Personnalisé
      </Button>

      <BilingualPopup
        open={popup.open}
        onOpenChange={popup.setOpen}
        title={{
          fr: 'Détails Personnalisés',
          en: 'Custom Details'
        }}
        confirmText={{
          fr: 'Fermer',
          en: 'Close'
        }}
        showFooter={true}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Statistiques
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Total: 150 éléments</li>
              <li>• Actifs: 120 éléments</li>
              <li>• En attente: 30 éléments</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              ✅ Statut
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Tout fonctionne correctement
            </p>
          </div>
        </div>
      </BilingualPopup>
    </>
  );
}

// Exemple 4: Popup de succès
export function SuccessPopupExample() {
  const popup = useBilingualPopup();

  return (
    <>
      <Button 
        variant="default" 
        onClick={popup.show}
        className="bg-green-600 hover:bg-green-700"
        data-testid="button-success-example"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Succès
      </Button>

      <BilingualPopup
        open={popup.open}
        onOpenChange={popup.setOpen}
        title={{
          fr: 'Opération Réussie',
          en: 'Operation Successful'
        }}
        description={{
          fr: 'L\'opération s\'est terminée avec succès.',
          en: 'The operation completed successfully.'
        }}
        confirmText={{
          fr: 'Parfait',
          en: 'Great'
        }}
        showFooter={true}
      >
        <div className="flex items-center justify-center py-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
      </BilingualPopup>
    </>
  );
}

// Composant de démonstration avec tous les exemples
export function BilingualPopupDemoPage() {
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Popup Bilingue - Exemples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Différents exemples d'utilisation du composant BilingualPopup
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-4">Information Simple</h3>
          <InfoPopupExample />
        </div>

        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-4">Confirmation de Suppression</h3>
          <DeleteConfirmationExample />
        </div>

        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-4">Contenu Personnalisé</h3>
          <CustomContentExample />
        </div>

        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-4">Message de Succès</h3>
          <SuccessPopupExample />
        </div>
      </div>
    </div>
  );
}
