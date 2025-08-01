import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Lock, Phone, Trash2 } from 'lucide-react';
import { ModernFormWrapper, modernInputClasses, modernLabelClasses, modernButtonClasses } from '@/components/ui/ModernFormWrapper';
import { cn } from '@/lib/utils';

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  gender?: string;
};

export default function ModernProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <ModernFormWrapper
      title="Profile Settings"
      subtitle="Manage your account information and security settings"
      icon={User}
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white/20">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white/20">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={modernLabelClasses}>First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName || ''}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e?.target?.value })}
                  className={modernInputClasses}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className={modernLabelClasses}>Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName || ''}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e?.target?.value })}
                  className={modernInputClasses}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={modernLabelClasses}>Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 XXX XXX XXX"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e?.target?.value })}
                  className={cn(modernInputClasses, "pl-10")}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className={modernLabelClasses}>Gender</Label>
              <Select 
                value={profileData.gender} 
                onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
              >
                <SelectTrigger className="bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className={modernButtonClasses}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className={modernLabelClasses}>Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e?.target?.value })}
                  className={cn(modernInputClasses, "pl-10")}
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className={modernLabelClasses}>New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e?.target?.value })}
                  className={cn(modernInputClasses, "pl-10")}
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={modernLabelClasses}>Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e?.target?.value })}
                  className={cn(modernInputClasses, "pl-10")}
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <Button 
              type="submit" 
              className={modernButtonClasses}
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </ModernFormWrapper>
  );
}