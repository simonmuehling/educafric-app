import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Lock, Phone, Smartphone, CheckCircle, XCircle, Wifi, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';
import { useQuery } from '@tanstack/react-query';
import PWANotificationManager from '@/components/shared/PWANotificationManager';
import EnhancedPWAManager from '@/components/pwa/EnhancedPWAManager';

const ParentSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [pwaConnectionStatus, setPwaConnectionStatus] = useState<any>(null);
  
  // Fetch PWA subscription info
  const { data: pwaSubscription, refetch: refetchPwaSubscription } = useQuery({
    queryKey: ['pwa-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch('/api/analytics/pwa/user-subscription');
      if (!response.ok) return null;
      const result = await response.json();
      return result.subscription;
    },
    enabled: !!user?.id
  });
  
  // Track PWA connection status
  useEffect(() => {
    const checkPWAStatus = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isStandalone = (navigator as any)?.standalone === true;
      const isInstalled = isPWA || isStandalone;
      
      setPwaConnectionStatus({
        isInstalled,
        isPWA,
        isStandalone,
        supportsPush: 'Notification' in window,
        permission: 'Notification' in window ? Notification.permission : 'not-supported',
        connectionType: isInstalled ? 'PWA' : 'Web Browser'
      });
    };
    
    checkPWAStatus();
    
    // Listen for PWA installation events
    window.addEventListener('beforeinstallprompt', checkPWAStatus);
    window.addEventListener('appinstalled', checkPWAStatus);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkPWAStatus);
      window.removeEventListener('appinstalled', checkPWAStatus);
    };
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la demande de suppression');
      }

      toast({
        title: language === 'fr' ? 'Compte supprimé' : 'Account deleted',
        description: language === 'fr' 
          ? 'Votre compte a été supprimé avec succès. Vous serez déconnecté dans 3 secondes.'
          : 'Your account has been successfully deleted. You will be logged out in 3 seconds.',
        variant: 'default'
      });

      // Disconnect after 3 seconds
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Une erreur est survenue lors de la demande de suppression.'
          : 'An error occurred while requesting account deletion.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const text = {
    fr: {
      title: 'Paramètres Parent',
      subtitle: 'Gérez vos préférences et informations personnelles',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      pwaTitle: 'Connexion PWA',
      pwaSubtitle: 'État de votre connexion Progressive Web App',
      connectionType: 'Type de connexion',
      pwaStatus: 'Statut PWA',
      installed: 'Installée',
      notInstalled: 'Non installée',
      webBrowser: 'Navigateur Web',
      pushNotifications: 'Notifications Push',
      subscriptionInfo: 'Informations d\'abonnement',
      subscribedSince: 'Abonné depuis',
      deviceInfo: 'Informations appareil',
      refreshStatus: 'Actualiser le statut',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      save: 'Sauvegarder',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      whatsappNotifications: 'Notifications WhatsApp',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      deleteAccount: 'Suppression du compte',
      deleteAccountDesc: 'Supprimer définitivement votre compte et toutes vos données',
      requestDeletion: 'Supprimer mon compte',
      deleteDialogTitle: 'Confirmer la suppression du compte',
      deleteDialogDesc: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront supprimées immédiatement. Vous serez déconnecté automatiquement.',
      cancel: 'Annuler',
      confirmDelete: 'Confirmer la suppression'
    },
    en: {
      title: 'Parent Settings',
      subtitle: 'Manage your preferences and personal information',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      privacy: 'Privacy',
      pwaTitle: 'PWA Connection',
      pwaSubtitle: 'Your Progressive Web App connection status',
      connectionType: 'Connection Type',
      pwaStatus: 'PWA Status',
      installed: 'Installed',
      notInstalled: 'Not Installed',
      webBrowser: 'Web Browser',
      pushNotifications: 'Push Notifications',
      subscriptionInfo: 'Subscription Info',
      subscribedSince: 'Subscribed since',
      deviceInfo: 'Device Information',
      refreshStatus: 'Refresh Status',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      save: 'Save',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      whatsappNotifications: 'WhatsApp Notifications',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      deleteAccount: 'Account Deletion',
      deleteAccountDesc: 'Permanently delete your account and all your data',
      requestDeletion: 'Delete My Account',
      deleteDialogTitle: 'Confirm Account Deletion',
      deleteDialogDesc: 'Are you sure you want to delete your account? This action is irreversible and all your data will be deleted immediately. You will be automatically logged out.',
      cancel: 'Cancel',
      confirmDelete: 'Confirm Deletion'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'privacy', label: t.privacy, icon: Lock }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Unified Icon Navigation for All Devices */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input id="firstName" placeholder="Entrez votre prénom" />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input id="lastName" placeholder="Entrez votre nom" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" placeholder="parent@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="flex">
                  <select className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="+93">🇦🇫 Afghanistan +93</option>
                    <option value="+355">🇦🇱 Albania +355</option>
                    <option value="+213">🇩🇿 Algeria +213</option>
                    <option value="+1684">🇦🇸 American Samoa +1684</option>
                    <option value="+376">🇦🇩 Andorra +376</option>
                    <option value="+244">🇦🇴 Angola +244</option>
                    <option value="+1264">🇦🇮 Anguilla +1264</option>
                    <option value="+672">🇦🇶 Antarctica +672</option>
                    <option value="+1268">🇦🇬 Antigua and Barbuda +1268</option>
                    <option value="+54">🇦🇷 Argentina +54</option>
                    <option value="+374">🇦🇲 Armenia +374</option>
                    <option value="+297">🇦🇼 Aruba +297</option>
                    <option value="+61">🇦🇺 Australia +61</option>
                    <option value="+43">🇦🇹 Austria +43</option>
                    <option value="+994">🇦🇿 Azerbaijan +994</option>
                    <option value="+1242">🇧🇸 Bahamas +1242</option>
                    <option value="+973">🇧🇭 Bahrain +973</option>
                    <option value="+880">🇧🇩 Bangladesh +880</option>
                    <option value="+1246">🇧🇧 Barbados +1246</option>
                    <option value="+375">🇧🇾 Belarus +375</option>
                    <option value="+32">🇧🇪 Belgium +32</option>
                    <option value="+501">🇧🇿 Belize +501</option>
                    <option value="+229">🇧🇯 Benin +229</option>
                    <option value="+1441">🇧🇲 Bermuda +1441</option>
                    <option value="+975">🇧🇹 Bhutan +975</option>
                    <option value="+591">🇧🇴 Bolivia +591</option>
                    <option value="+387">🇧🇦 Bosnia and Herzegovina +387</option>
                    <option value="+267">🇧🇼 Botswana +267</option>
                    <option value="+55">🇧🇷 Brazil +55</option>
                    <option value="+246">🇮🇴 British Indian Ocean Territory +246</option>
                    <option value="+673">🇧🇳 Brunei +673</option>
                    <option value="+359">🇧🇬 Bulgaria +359</option>
                    <option value="+226">🇧🇫 Burkina Faso +226</option>
                    <option value="+257">🇧🇮 Burundi +257</option>
                    <option value="+855">🇰🇭 Cambodia +855</option>
                    <option value="+237" selected>🇨🇲 Cameroon +237</option>
                    <option value="+1">🇨🇦 Canada +1</option>
                    <option value="+238">🇨🇻 Cape Verde +238</option>
                    <option value="+1345">🇰🇾 Cayman Islands +1345</option>
                    <option value="+236">🇨🇫 Central African Republic +236</option>
                    <option value="+235">🇹🇩 Chad +235</option>
                    <option value="+56">🇨🇱 Chile +56</option>
                    <option value="+86">🇨🇳 China +86</option>
                    <option value="+61">🇨🇽 Christmas Island +61</option>
                    <option value="+61">🇨🇨 Cocos Islands +61</option>
                    <option value="+57">🇨🇴 Colombia +57</option>
                    <option value="+269">🇰🇲 Comoros +269</option>
                    <option value="+242">🇨🇬 Congo +242</option>
                    <option value="+243">🇨🇩 Congo (DRC) +243</option>
                    <option value="+682">🇨🇰 Cook Islands +682</option>
                    <option value="+506">🇨🇷 Costa Rica +506</option>
                    <option value="+225">🇨🇮 Côte d'Ivoire +225</option>
                    <option value="+385">🇭🇷 Croatia +385</option>
                    <option value="+53">🇨🇺 Cuba +53</option>
                    <option value="+599">🇨🇼 Curaçao +599</option>
                    <option value="+357">🇨🇾 Cyprus +357</option>
                    <option value="+420">🇨🇿 Czech Republic +420</option>
                    <option value="+45">🇩🇰 Denmark +45</option>
                    <option value="+253">🇩🇯 Djibouti +253</option>
                    <option value="+1767">🇩🇲 Dominica +1767</option>
                    <option value="+1809">🇩🇴 Dominican Republic +1809</option>
                    <option value="+593">🇪🇨 Ecuador +593</option>
                    <option value="+20">🇪🇬 Egypt +20</option>
                    <option value="+503">🇸🇻 El Salvador +503</option>
                    <option value="+240">🇬🇶 Equatorial Guinea +240</option>
                    <option value="+291">🇪🇷 Eritrea +291</option>
                    <option value="+372">🇪🇪 Estonia +372</option>
                    <option value="+268">🇸🇿 Eswatini +268</option>
                    <option value="+251">🇪🇹 Ethiopia +251</option>
                    <option value="+500">🇫🇰 Falkland Islands +500</option>
                    <option value="+298">🇫🇴 Faroe Islands +298</option>
                    <option value="+679">🇫🇯 Fiji +679</option>
                    <option value="+358">🇫🇮 Finland +358</option>
                    <option value="+33">🇫🇷 France +33</option>
                    <option value="+594">🇬🇫 French Guiana +594</option>
                    <option value="+689">🇵🇫 French Polynesia +689</option>
                    <option value="+241">🇬🇦 Gabon +241</option>
                    <option value="+220">🇬🇲 Gambia +220</option>
                    <option value="+995">🇬🇪 Georgia +995</option>
                    <option value="+49">🇩🇪 Germany +49</option>
                    <option value="+233">🇬🇭 Ghana +233</option>
                    <option value="+350">🇬🇮 Gibraltar +350</option>
                    <option value="+30">🇬🇷 Greece +30</option>
                    <option value="+299">🇬🇱 Greenland +299</option>
                    <option value="+1473">🇬🇩 Grenada +1473</option>
                    <option value="+590">🇬🇵 Guadeloupe +590</option>
                    <option value="+1671">🇬🇺 Guam +1671</option>
                    <option value="+502">🇬🇹 Guatemala +502</option>
                    <option value="+44">🇬🇬 Guernsey +44</option>
                    <option value="+224">🇬🇳 Guinea +224</option>
                    <option value="+245">🇬🇼 Guinea-Bissau +245</option>
                    <option value="+592">🇬🇾 Guyana +592</option>
                    <option value="+509">🇭🇹 Haiti +509</option>
                    <option value="+504">🇭🇳 Honduras +504</option>
                    <option value="+852">🇭🇰 Hong Kong +852</option>
                    <option value="+36">🇭🇺 Hungary +36</option>
                    <option value="+354">🇮🇸 Iceland +354</option>
                    <option value="+91">🇮🇳 India +91</option>
                    <option value="+62">🇮🇩 Indonesia +62</option>
                    <option value="+98">🇮🇷 Iran +98</option>
                    <option value="+964">🇮🇶 Iraq +964</option>
                    <option value="+353">🇮🇪 Ireland +353</option>
                    <option value="+44">🇮🇲 Isle of Man +44</option>
                    <option value="+972">🇮🇱 Israel +972</option>
                    <option value="+39">🇮🇹 Italy +39</option>
                    <option value="+1876">🇯🇲 Jamaica +1876</option>
                    <option value="+81">🇯🇵 Japan +81</option>
                    <option value="+44">🇯🇪 Jersey +44</option>
                    <option value="+962">🇯🇴 Jordan +962</option>
                    <option value="+7">🇰🇿 Kazakhstan +7</option>
                    <option value="+254">🇰🇪 Kenya +254</option>
                    <option value="+686">🇰🇮 Kiribati +686</option>
                    <option value="+850">🇰🇵 North Korea +850</option>
                    <option value="+82">🇰🇷 South Korea +82</option>
                    <option value="+965">🇰🇼 Kuwait +965</option>
                    <option value="+996">🇰🇬 Kyrgyzstan +996</option>
                    <option value="+856">🇱🇦 Laos +856</option>
                    <option value="+371">🇱🇻 Latvia +371</option>
                    <option value="+961">🇱🇧 Lebanon +961</option>
                    <option value="+266">🇱🇸 Lesotho +266</option>
                    <option value="+231">🇱🇷 Liberia +231</option>
                    <option value="+218">🇱🇾 Libya +218</option>
                    <option value="+423">🇱🇮 Liechtenstein +423</option>
                    <option value="+370">🇱🇹 Lithuania +370</option>
                    <option value="+352">🇱🇺 Luxembourg +352</option>
                    <option value="+853">🇲🇴 Macau +853</option>
                    <option value="+389">🇲🇰 North Macedonia +389</option>
                    <option value="+261">🇲🇬 Madagascar +261</option>
                    <option value="+265">🇲🇼 Malawi +265</option>
                    <option value="+60">🇲🇾 Malaysia +60</option>
                    <option value="+960">🇲🇻 Maldives +960</option>
                    <option value="+223">🇲🇱 Mali +223</option>
                    <option value="+356">🇲🇹 Malta +356</option>
                    <option value="+692">🇲🇭 Marshall Islands +692</option>
                    <option value="+596">🇲🇶 Martinique +596</option>
                    <option value="+222">🇲🇷 Mauritania +222</option>
                    <option value="+230">🇲🇺 Mauritius +230</option>
                    <option value="+262">🇾🇹 Mayotte +262</option>
                    <option value="+52">🇲🇽 Mexico +52</option>
                    <option value="+691">🇫🇲 Micronesia +691</option>
                    <option value="+373">🇲🇩 Moldova +373</option>
                    <option value="+377">🇲🇨 Monaco +377</option>
                    <option value="+976">🇲🇳 Mongolia +976</option>
                    <option value="+382">🇲🇪 Montenegro +382</option>
                    <option value="+1664">🇲🇸 Montserrat +1664</option>
                    <option value="+212">🇲🇦 Morocco +212</option>
                    <option value="+258">🇲🇿 Mozambique +258</option>
                    <option value="+95">🇲🇲 Myanmar +95</option>
                    <option value="+264">🇳🇦 Namibia +264</option>
                    <option value="+674">🇳🇷 Nauru +674</option>
                    <option value="+977">🇳🇵 Nepal +977</option>
                    <option value="+31">🇳🇱 Netherlands +31</option>
                    <option value="+687">🇳🇨 New Caledonia +687</option>
                    <option value="+64">🇳🇿 New Zealand +64</option>
                    <option value="+505">🇳🇮 Nicaragua +505</option>
                    <option value="+227">🇳🇪 Niger +227</option>
                    <option value="+234">🇳🇬 Nigeria +234</option>
                    <option value="+683">🇳🇺 Niue +683</option>
                    <option value="+672">🇳🇫 Norfolk Island +672</option>
                    <option value="+1670">🇲🇵 Northern Mariana Islands +1670</option>
                    <option value="+47">🇳🇴 Norway +47</option>
                    <option value="+968">🇴🇲 Oman +968</option>
                    <option value="+92">🇵🇰 Pakistan +92</option>
                    <option value="+680">🇵🇼 Palau +680</option>
                    <option value="+970">🇵🇸 Palestine +970</option>
                    <option value="+507">🇵🇦 Panama +507</option>
                    <option value="+675">🇵🇬 Papua New Guinea +675</option>
                    <option value="+595">🇵🇾 Paraguay +595</option>
                    <option value="+51">🇵🇪 Peru +51</option>
                    <option value="+63">🇵🇭 Philippines +63</option>
                    <option value="+48">🇵🇱 Poland +48</option>
                    <option value="+351">🇵🇹 Portugal +351</option>
                    <option value="+1787">🇵🇷 Puerto Rico +1787</option>
                    <option value="+974">🇶🇦 Qatar +974</option>
                    <option value="+262">🇷🇪 Réunion +262</option>
                    <option value="+40">🇷🇴 Romania +40</option>
                    <option value="+7">🇷🇺 Russia +7</option>
                    <option value="+250">🇷🇼 Rwanda +250</option>
                    <option value="+590">🇧🇱 Saint Barthélemy +590</option>
                    <option value="+290">🇸🇭 Saint Helena +290</option>
                    <option value="+1869">🇰🇳 Saint Kitts and Nevis +1869</option>
                    <option value="+1758">🇱🇨 Saint Lucia +1758</option>
                    <option value="+590">🇲🇫 Saint Martin +590</option>
                    <option value="+508">🇵🇲 Saint Pierre and Miquelon +508</option>
                    <option value="+1784">🇻🇨 Saint Vincent and the Grenadines +1784</option>
                    <option value="+685">🇼🇸 Samoa +685</option>
                    <option value="+378">🇸🇲 San Marino +378</option>
                    <option value="+239">🇸🇹 São Tomé and Príncipe +239</option>
                    <option value="+966">🇸🇦 Saudi Arabia +966</option>
                    <option value="+221">🇸🇳 Senegal +221</option>
                    <option value="+381">🇷🇸 Serbia +381</option>
                    <option value="+248">🇸🇨 Seychelles +248</option>
                    <option value="+232">🇸🇱 Sierra Leone +232</option>
                    <option value="+65">🇸🇬 Singapore +65</option>
                    <option value="+1721">🇸🇽 Sint Maarten +1721</option>
                    <option value="+421">🇸🇰 Slovakia +421</option>
                    <option value="+386">🇸🇮 Slovenia +386</option>
                    <option value="+677">🇸🇧 Solomon Islands +677</option>
                    <option value="+252">🇸🇴 Somalia +252</option>
                    <option value="+27">🇿🇦 South Africa +27</option>
                    <option value="+500">🇬🇸 South Georgia and the South Sandwich Islands +500</option>
                    <option value="+211">🇸🇸 South Sudan +211</option>
                    <option value="+34">🇪🇸 Spain +34</option>
                    <option value="+94">🇱🇰 Sri Lanka +94</option>
                    <option value="+249">🇸🇩 Sudan +249</option>
                    <option value="+597">🇸🇷 Suriname +597</option>
                    <option value="+4779">🇸🇯 Svalbard and Jan Mayen +4779</option>
                    <option value="+46">🇸🇪 Sweden +46</option>
                    <option value="+41">🇨🇭 Switzerland +41</option>
                    <option value="+963">🇸🇾 Syria +963</option>
                    <option value="+886">🇹🇼 Taiwan +886</option>
                    <option value="+992">🇹🇯 Tajikistan +992</option>
                    <option value="+255">🇹🇿 Tanzania +255</option>
                    <option value="+66">🇹🇭 Thailand +66</option>
                    <option value="+670">🇹🇱 Timor-Leste +670</option>
                    <option value="+228">🇹🇬 Togo +228</option>
                    <option value="+690">🇹🇰 Tokelau +690</option>
                    <option value="+676">🇹🇴 Tonga +676</option>
                    <option value="+1868">🇹🇹 Trinidad and Tobago +1868</option>
                    <option value="+216">🇹🇳 Tunisia +216</option>
                    <option value="+90">🇹🇷 Turkey +90</option>
                    <option value="+993">🇹🇲 Turkmenistan +993</option>
                    <option value="+1649">🇹🇨 Turks and Caicos Islands +1649</option>
                    <option value="+688">🇹🇻 Tuvalu +688</option>
                    <option value="+256">🇺🇬 Uganda +256</option>
                    <option value="+380">🇺🇦 Ukraine +380</option>
                    <option value="+971">🇦🇪 United Arab Emirates +971</option>
                    <option value="+44">🇬🇧 United Kingdom +44</option>
                    <option value="+1">🇺🇸 United States +1</option>
                    <option value="+598">🇺🇾 Uruguay +598</option>
                    <option value="+998">🇺🇿 Uzbekistan +998</option>
                    <option value="+678">🇻🇺 Vanuatu +678</option>
                    <option value="+39">🇻🇦 Vatican City +39</option>
                    <option value="+58">🇻🇪 Venezuela +58</option>
                    <option value="+84">🇻🇳 Vietnam +84</option>
                    <option value="+1284">🇻🇬 British Virgin Islands +1284</option>
                    <option value="+1340">🇻🇮 U.S. Virgin Islands +1340</option>
                    <option value="+681">🇼🇫 Wallis and Futuna +681</option>
                    <option value="+212">🇪🇭 Western Sahara +212</option>
                    <option value="+967">🇾🇪 Yemen +967</option>
                    <option value="+260">🇿🇲 Zambia +260</option>
                    <option value="+263">🇿🇼 Zimbabwe +263</option>
                  </select>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">{t.newPassword}</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Lock className="w-4 h-4 mr-2" />
                {t.changePassword}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* PWA Connection & Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                {t.pwaTitle}
              </CardTitle>
              <p className="text-sm text-gray-600">{t.pwaSubtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {pwaConnectionStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.connectionType}:</span>
                      <Badge variant={pwaConnectionStatus.isInstalled ? "default" : "secondary"}>
                        <Wifi className="w-3 h-3 mr-1" />
                        {pwaConnectionStatus.connectionType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.pwaStatus}:</span>
                      {pwaConnectionStatus.isInstalled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.installed}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t.notInstalled}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.pushNotifications}:</span>
                      <Badge variant={pwaConnectionStatus.permission === 'granted' ? "default" : "secondary"}>
                        {pwaConnectionStatus.permission === 'granted' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {pwaConnectionStatus.permission === 'granted' ? 'Activées' : 
                         pwaConnectionStatus.permission === 'denied' ? 'Bloquées' : 'En attente'}
                      </Badge>
                    </div>
                  </div>
                  
                  {pwaSubscription && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">{t.subscriptionInfo}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.subscribedSince}:</span>
                          <span className="font-medium">
                            {new Date(pwaSubscription.subscribedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endpoint:</span>
                          <span className="font-medium text-green-600">
                            {pwaSubscription.subscriptionEndpoint}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t pt-4">
                <EnhancedPWAManager 
                  userId={user?.id} 
                  userRole={user?.role}
                  onConfigurationComplete={(success, method) => {
                    refetchPwaSubscription();
                    // Refresh PWA status
                    setPwaConnectionStatus((prev: any) => ({ 
                      ...prev, 
                      permission: 'Notification' in window ? Notification.permission : 'not-supported',
                      method: method,
                      configured: success
                    }));
                    
                    if (success) {
                      toast({
                        title: method === 'pwa' ? "Notifications PWA activées" : "Notifications SMS configurées",
                        description: "Votre système de notifications est maintenant actif."
                      });
                    }
                  }}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  refetchPwaSubscription();
                  toast({
                    title: "Statut actualisé",
                    description: "Les informations de connexion PWA ont été mises à jour."
                  });
                }}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.refreshStatus}
              </Button>
            </CardContent>
          </Card>
          
          {/* Traditional Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifs">{t.emailNotifications}</Label>
                <Switch id="emailNotifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifs">{t.smsNotifications}</Label>
                <Switch id="smsNotifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsappNotifs">{t.whatsappNotifications}</Label>
                <Switch id="whatsappNotifs" defaultChecked />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Bell className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          {/* Data Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Confidentialité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Partage des données avec l'école</Label>
                  <p className="text-sm text-gray-600">Autoriser le partage des informations avec l'administration scolaire</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Géolocalisation de l'enfant</Label>
                  <p className="text-sm text-gray-600">Partager la position GPS avec les enseignants pour la sécurité</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Historique des connexions</Label>
                  <p className="text-sm text-gray-600">Conserver l'historique des connexions PWA et navigateur</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Communication Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Confidentialité des Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Messages avec les enseignants</Label>
                  <p className="text-sm text-gray-600">Autoriser les enseignants à vous contacter directement</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Notifications push</Label>
                  <p className="text-sm text-gray-600">Recevoir des notifications push sur vos appareils</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Partage numéro WhatsApp</Label>
                  <p className="text-sm text-gray-600">Permettre à l'école d'utiliser WhatsApp pour les urgences</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Account Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Confidentialité du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibilité du profil</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-full" name="visibility" value="full" defaultChecked />
                    <label htmlFor="visibility-full" className="text-sm">Visible par tous les membres de l'école</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-teachers" name="visibility" value="teachers" />
                    <label htmlFor="visibility-teachers" className="text-sm">Visible uniquement par les enseignants</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-admin" name="visibility" value="admin" />
                    <label htmlFor="visibility-admin" className="text-sm">Visible uniquement par l'administration</label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-red-600">{t.deleteAccount}</Label>
                    <p className="text-sm text-gray-600">{t.deleteAccountDesc}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    data-testid="button-request-account-deletion"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.requestDeletion}
                  </Button>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                <Lock className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres de confidentialité
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Deletion Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              {t.deleteDialogTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t.deleteDialogDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} data-testid="button-cancel-deletion">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-deletion"
            >
              {isDeleting ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'En cours...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.confirmDelete}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ParentSettings;