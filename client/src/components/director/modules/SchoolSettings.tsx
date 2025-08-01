import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, School, Mail, Phone, MapPin, Calendar, Users, Settings, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SchoolSettings: React.FC = () => {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  // Load real school data on component mount
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        setLoading(true);
        console.log('[SCHOOL_SETTINGS] 📡 Loading real school data...');
        
        const response = await fetch('/api/school/1/settings', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const realSchoolData = await response.json();
          console.log('[SCHOOL_SETTINGS] ✅ Real school data loaded:', realSchoolData);
          setSchoolData(realSchoolData);
        } else {
          console.error('[SCHOOL_SETTINGS] ❌ Failed to load school data:', response.status);
          // Use fallback data only if API fails
          setSchoolData({
            name: "École Excellence Yaoundé",
            address: "Avenue Kennedy, Bastos, Yaoundé",
            phone: "+237 656 200 472",
            email: "contact@excellence-yaounde?.edu?.cm",
            website: "www.excellence-yaounde?.edu?.cm",
            director: "Demo Director",
            studentsCount: 1247,
            teachersCount: 85,
            classesCount: 24,
            establishmentType: "Privé",
            academicYear: "2024-2025"
          });
        }
      } catch (error) {
        console.error('[SCHOOL_SETTINGS] ❌ Error loading school data:', error);
        // Use fallback data
        setSchoolData({
          name: "École Excellence Yaoundé",
          address: "Avenue Kennedy, Bastos, Yaoundé",
          phone: "+237 656 200 472",
          email: "contact@excellence-yaounde?.edu?.cm",
          website: "www.excellence-yaounde?.edu?.cm",
          director: "Demo Director",
          studentsCount: 1247,
          teachersCount: 85,
          classesCount: 24,
          establishmentType: "Privé",
          academicYear: "2024-2025"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchoolData();
  }, []);

  const [schoolData, setSchoolData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    director: "",
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    establishmentType: "",
    academicYear: ""
  });
  const [loading, setLoading] = useState(true);

  const handleSave = async () => {
    try {
      console.log('💾 Saving school settings:', schoolData);
      
      // Call API to save school settings
      const response = await fetch('/api/school/1/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(schoolData)
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setSchoolData(updatedSettings);
        console.log('✅ School settings saved successfully');
      } else {
        console.error('❌ Failed to save school settings');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error saving school settings:', error);
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* School Information Card */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {language === 'fr' ? 'Informations Générales' : 'General Information'}
            </h2>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Enregistrer' : 'Save'}
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Modifier' : 'Edit'}
                </>
              )}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">
                    {language === 'fr' ? 'Nom de l\'École' : 'School Name'}
                  </Label>
                  {isEditing ? (
                    <Input
                      value={schoolData.name || ''}
                      onChange={(e) => setSchoolData({...schoolData, name: e?.target?.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{schoolData.name || 'Non défini'}</p>
                  )}
                </div>

              <div>
                <Label className="text-gray-700 font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Adresse' : 'Address'}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({...schoolData, address: e?.target?.value})}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{schoolData.address}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Téléphone' : 'Phone'}
                </Label>
                {isEditing ? (
                  <Input
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({...schoolData, phone: e?.target?.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-mono">{schoolData.phone}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Email' : 'Email'}
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={schoolData.email || ''}
                    onChange={(e) => setSchoolData({...schoolData, email: e?.target?.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-mono">{schoolData.email || ''}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">
                  {language === 'fr' ? 'Type d\'Établissement' : 'Institution Type'}
                </Label>
                <p className="mt-1 text-gray-900 font-medium">{schoolData.establishmentType}</p>
              </div>

              <div>
                <Label className="text-gray-700 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Année Académique' : 'Academic Year'}
                </Label>
                <p className="mt-1 text-gray-900 font-medium">{schoolData.academicYear}</p>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">
                  {language === 'fr' ? 'Directeur' : 'Director'}
                </Label>
                <p className="mt-1 text-gray-900 font-medium">{schoolData.director}</p>
              </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Enregistrer les Modifications' : 'Save Changes'}
              </Button>
            </div>
          )}
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  {language === 'fr' ? 'Total Élèves' : 'Total Students'}
                </p>
                <p className="text-3xl font-bold">{schoolData?.studentsCount?.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  {language === 'fr' ? 'Enseignants' : 'Teachers'}
                </p>
                <p className="text-3xl font-bold">{schoolData.teachersCount}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  {language === 'fr' ? 'Classes' : 'Classes'}
                </p>
                <p className="text-3xl font-bold">{schoolData.classesCount}</p>
              </div>
              <School className="w-10 h-10 text-purple-200" />
            </div>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default SchoolSettings;