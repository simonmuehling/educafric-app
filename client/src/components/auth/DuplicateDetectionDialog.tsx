import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Mail, Phone, Briefcase } from "lucide-react";

interface DuplicateDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUser: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    phone?: string;
  } | null;
  emailMatch: boolean;
  phoneMatch: boolean;
  onImport: () => void;
  onCancel: () => void;
}

export function DuplicateDetectionDialog({
  open,
  onOpenChange,
  existingUser,
  emailMatch,
  phoneMatch,
  onImport,
  onCancel
}: DuplicateDetectionDialogProps) {
  const { language, t } = useLanguage();

  if (!existingUser) return null;

  const userDisplayName = existingUser.firstName && existingUser.lastName
    ? `${existingUser.firstName} ${existingUser.lastName}`
    : existingUser.email;

  const duplicateType = emailMatch && phoneMatch 
    ? (language === 'fr' ? 'email et numéro de téléphone' : 'email and phone number')
    : emailMatch 
    ? (language === 'fr' ? 'email' : 'email')
    : (language === 'fr' ? 'numéro de téléphone' : 'phone number');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'fr' ? '📋 Informations existantes détectées' : '📋 Existing Information Detected'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400 space-y-4">
            <p className="text-base">
              {language === 'fr' 
                ? `Votre ${duplicateType} correspond à un profil existant dans EDUCAFRIC :`
                : `Your ${duplicateType} matches an existing profile in EDUCAFRIC:`
              }
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold" data-testid="text-existing-user-name">{userDisplayName}</span>
              </div>
              
              {emailMatch && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm" data-testid="text-existing-user-email">{existingUser.email}</span>
                </div>
              )}
              
              {phoneMatch && existingUser.phone && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm" data-testid="text-existing-user-phone">{existingUser.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium" data-testid="text-existing-user-role">
                  {t(`roles.${existingUser.role.toLowerCase()}`)}
                </span>
              </div>
            </div>

            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
              {language === 'fr' 
                ? 'Souhaitez-vous importer ces informations pour créer votre nouveau profil ?' 
                : 'Would you like to import this information to create your new profile?'
              }
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-md p-3">
              <p className="font-semibold mb-1">
                {language === 'fr' ? '✅ Si OUI :' : '✅ If YES:'}
              </p>
              <p>
                {language === 'fr' 
                  ? 'Vos informations existantes seront utilisées pour finaliser automatiquement votre inscription.'
                  : 'Your existing information will be used to automatically complete your registration.'
                }
              </p>
              
              <p className="font-semibold mt-3 mb-1">
                {language === 'fr' ? '❌ Si NON :' : '❌ If NO:'}
              </p>
              <p>
                {language === 'fr' 
                  ? 'Vous devrez utiliser un autre email ou numéro de téléphone pour vous inscrire.'
                  : 'You must use a different email or phone number to register.'
                }
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            onClick={onCancel}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            data-testid="button-cancel-import"
          >
            {language === 'fr' ? 'Non, utiliser d\'autres informations' : 'No, use different information'}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onImport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-confirm-import"
          >
            {language === 'fr' ? 'Oui, importer les informations' : 'Yes, import information'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
