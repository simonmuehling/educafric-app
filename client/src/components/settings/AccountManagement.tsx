import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Trash2, Key, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountManagement = () => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const text = {
    fr: {
      title: 'Gestion du Compte',
      changePassword: 'Changer le Mot de Passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le nouveau mot de passe',
      updatePassword: 'Mettre à jour le mot de passe',
      deleteAccount: 'Supprimer le Compte',
      deleteWarning: 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      deleteConfirmation: 'Tapez "SUPPRIMER" pour confirmer',
      confirmDelete: 'Confirmer la suppression',
      cancel: 'Annuler',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      accountDeleted: 'Compte supprimé avec succès',
      error: 'Une erreur s\'est produite',
      required: 'Ce champ est requis'
    },
    en: {
      title: 'Account Management',
      changePassword: 'Change Password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      updatePassword: 'Update password',
      deleteAccount: 'Delete Account',
      deleteWarning: 'This action is irreversible. All your data will be permanently deleted.',
      deleteConfirmation: 'Type "DELETE" to confirm',
      confirmDelete: 'Confirm deletion',
      cancel: 'Cancel',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters long',
      passwordUpdated: 'Password updated successfully',
      accountDeleted: 'Account deleted successfully',
      error: 'An error occurred',
      required: 'This field is required'
    }
  };

  const t = text[language as keyof typeof text];

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return apiRequest('/api/auth/change-password', 'PUT', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
    },
    onSuccess: () => {
      toast({
        title: t.passwordUpdated,
        description: 'Your password has been updated successfully.',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || 'Failed to update password',
        variant: 'destructive'
      });
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/delete-account', 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: t.accountDeleted,
        description: 'Your account has been deleted successfully.',
      });
      // Log out user and redirect
      logout();
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || 'Failed to delete account',
        variant: 'destructive'
      });
    }
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: t.error,
        description: t.required,
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t.error,
        description: t.passwordMismatch,
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: t.error,
        description: t.passwordTooShort,
        variant: 'destructive'
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== (language === 'fr' ? 'SUPPRIMER' : 'DELETE')) {
      toast({
        title: t.error,
        description: 'Please type the confirmation text exactly',
        variant: 'destructive'
      });
      return;
    }

    deleteAccountMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t.changePassword}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">{t.currentPassword}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">{t.newPassword}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="bg-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-white"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? 'Updating...' : t.updatePassword}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="bg-white border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            {t.deleteAccount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {t.deleteWarning}
            </AlertDescription>
          </Alert>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                {t.deleteAccount}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-red-600">{t.deleteAccount}</DialogTitle>
                <DialogDescription>
                  {t.deleteWarning}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deleteConfirmation">{t.deleteConfirmation}</Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={language === 'fr' ? 'SUPPRIMER' : 'DELETE'}
                    className="bg-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmation('');
                  }}
                >
                  {t.cancel}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? 'Deleting...' : t.confirmDelete}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagement;