import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  User, UserPlus, Mail, Phone, MapPin, Calendar, GraduationCap, 
  Users, Plus, Trash2, Eye, EyeOff, Save, X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface Parent {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: 'father' | 'mother' | 'guardian' | 'tutor';
  address?: string;
  profession?: string;
  isPrimary: boolean;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address: string;
  classId: number | null;
  emergencyContact: string;
  medicalInfo?: string;
  previousSchool?: string;
  parents: Parent[];
  notes?: string;
}

interface EnhancedStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  student?: any;
  mode: 'create' | 'edit';
}

const EnhancedStudentForm: React.FC<EnhancedStudentFormProps> = ({
  isOpen,
  onClose,
  student,
  mode
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<StudentFormData>({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dateOfBirth: student?.dateOfBirth || '',
    address: student?.address || '',
    classId: student?.classId || null,
    emergencyContact: student?.emergencyContact || '',
    medicalInfo: student?.medicalInfo || '',
    previousSchool: student?.previousSchool || '',
    notes: student?.notes || '',
    parents: student?.parents || [{
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: 'father',
      address: '',
      profession: '',
      isPrimary: true
    }]
  });

  const [showParentDetails, setShowParentDetails] = useState<Record<string, boolean>>({});

  const text = {
    fr: {
      title: mode === 'create' ? 'Ajouter un Élève' : 'Modifier l\'Élève',
      studentInfo: 'Informations de l\'Élève',
      parentsInfo: 'Informations des Parents/Tuteurs',
      firstName: 'Prénom',
      lastName: 'Nom de famille',
      email: 'Email',
      phone: 'Téléphone',
      dateOfBirth: 'Date de naissance',
      address: 'Adresse',
      class: 'Classe',
      selectClass: 'Sélectionner une classe',
      emergencyContact: 'Contact d\'urgence',
      medicalInfo: 'Informations médicales',
      previousSchool: 'École précédente',
      notes: 'Notes additionnelles',
      
      // Parents
      addParent: 'Ajouter Parent/Tuteur',
      parentDetails: 'Détails du Parent',
      relationship: 'Relation',
      profession: 'Profession',
      primaryContact: 'Contact principal',
      relationships: {
        father: 'Père',
        mother: 'Mère',
        guardian: 'Tuteur légal',
        tutor: 'Tuteur'
      },
      
      // Actions
      save: 'Enregistrer',
      cancel: 'Annuler',
      saving: 'Enregistrement...',
      required: 'Champ obligatoire',
      
      // Validation
      atLeastOneParent: 'Au moins un parent/tuteur est requis',
      onePrimaryContact: 'Un seul contact principal autorisé',
      validEmail: 'Email valide requis',
      
      // Success messages
      studentCreated: 'Élève créé avec succès',
      studentUpdated: 'Élève modifié avec succès'
    },
    en: {
      title: mode === 'create' ? 'Add Student' : 'Edit Student',
      studentInfo: 'Student Information',
      parentsInfo: 'Parents/Guardians Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      class: 'Class',
      selectClass: 'Select a class',
      emergencyContact: 'Emergency Contact',
      medicalInfo: 'Medical Information',
      previousSchool: 'Previous School',
      notes: 'Additional Notes',
      
      // Parents
      addParent: 'Add Parent/Guardian',
      parentDetails: 'Parent Details',
      relationship: 'Relationship',
      profession: 'Profession',
      primaryContact: 'Primary Contact',
      relationships: {
        father: 'Father',
        mother: 'Mother',
        guardian: 'Legal Guardian',
        tutor: 'Tutor'
      },
      
      // Actions
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      required: 'Required field',
      
      // Validation
      atLeastOneParent: 'At least one parent/guardian is required',
      onePrimaryContact: 'Only one primary contact allowed',
      validEmail: 'Valid email required',
      
      // Success messages
      studentCreated: 'Student created successfully',
      studentUpdated: 'Student updated successfully'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes for selection
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/classes'],
    queryFn: async () => {
      const response = await fetch('/api/classes', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Create/Update student mutation
  const saveStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormData) => {
      const endpoint = mode === 'create' ? '/api/students' : `/api/students/${student?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) throw new Error(`Failed to ${mode} student`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: mode === 'create' ? t.studentCreated : t.studentUpdated
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const addParent = () => {
    const newParent: Parent = {
      id: `temp_${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: 'mother',
      address: formData.address, // Pre-fill with student address
      profession: '',
      isPrimary: (Array.isArray(formData.parents) ? (Array.isArray(parents) ? parents.length : 0) : 0) === 0 // First parent is primary by default
    };
    
    setFormData({
      ...formData,
      parents: [...formData.parents, newParent]
    });
  };

  const removeParent = (index: number) => {
    const newParents = (Array.isArray(formData.parents) ? formData.parents : []).filter((_, i) => i !== index);
    
    // If we removed the primary contact, make the first remaining parent primary
    if (formData.parents[index].isPrimary && (Array.isArray(newParents) ? newParents.length : 0) > 0) {
      newParents[0].isPrimary = true;
    }
    
    setFormData({
      ...formData,
      parents: newParents
    });
  };

  const updateParent = (index: number, updates: Partial<Parent>) => {
    const newParents = [...formData.parents];
    
    // Handle primary contact logic
    if (updates.isPrimary === true) {
      // Set all others to false
      newParents.forEach((parent, i) => {
        if (i !== index) parent.isPrimary = false;
      });
    }
    
    newParents[index] = { ...newParents[index], ...updates };
    
    setFormData({
      ...formData,
      parents: newParents
    });
  };

  const validateForm = (): boolean => {
    if (!formData?.firstName?.trim() || !formData?.lastName?.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: t.required,
        variant: 'destructive'
      });
      return false;
    }

    if ((Array.isArray(formData.parents) ? (Array.isArray(parents) ? parents.length : 0) : 0) === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: t.atLeastOneParent,
        variant: 'destructive'
      });
      return false;
    }

    const primaryContacts = (Array.isArray(formData.parents) ? formData.parents : []).filter(p => p.isPrimary);
    if ((Array.isArray(primaryContacts) ? primaryContacts.length : 0) !== 1) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: t.onePrimaryContact,
        variant: 'destructive'
      });
      return false;
    }

    // Validate parent emails
    for (const parent of formData.parents) {
      if (parent.email && !parent?.email?.includes('@')) {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: t.validEmail,
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      saveStudentMutation.mutate(formData);
    }
  };

  const toggleParentDetails = (parentId: string) => {
    setShowParentDetails(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t.title || ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.studentInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center gap-1">
                    {t.firstName || ''} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e?.target?.value})}
                    data-testid="input-student-firstname"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="flex items-center gap-1">
                    {t.lastName || ''} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e?.target?.value})}
                    data-testid="input-student-lastname"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t.email || ''}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                    data-testid="input-student-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e?.target?.value})}
                    data-testid="input-student-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e?.target?.value})}
                    data-testid="input-student-dob"
                  />
                </div>

                <div>
                  <Label htmlFor="class">{t.class}</Label>
                  <Select
                    value={formData.classId?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, classId: parseInt(value)})}
                  >
                    <SelectTrigger data-testid="select-student-class">
                      <SelectValue placeholder={t.selectClass} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(classes) ? classes : []).map((cls: any) => (
                        <SelectItem key={cls.id} value={cls?.id?.toString()}>
                          {cls.name || ''} - {cls.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t.address}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e?.target?.value})}
                  rows={2}
                  data-testid="input-student-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">{t.emergencyContact}</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e?.target?.value})}
                    data-testid="input-student-emergency"
                  />
                </div>

                <div>
                  <Label htmlFor="previousSchool">{t.previousSchool}</Label>
                  <Input
                    id="previousSchool"
                    value={formData.previousSchool || ''}
                    onChange={(e) => setFormData({...formData, previousSchool: e?.target?.value})}
                    data-testid="input-student-previous-school"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medicalInfo">{t.medicalInfo}</Label>
                <Textarea
                  id="medicalInfo"
                  value={formData.medicalInfo || ''}
                  onChange={(e) => setFormData({...formData, medicalInfo: e?.target?.value})}
                  rows={2}
                  data-testid="input-student-medical"
                />
              </div>
            </CardContent>
          </Card>

          {/* Parents/Guardians Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.parentsInfo}
                </CardTitle>
                <Button
                  onClick={addParent}
                  variant="outline"
                  size="sm"
                  data-testid="button-add-parent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addParent}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Array.isArray(formData.parents) ? formData.parents : []).map((parent, index) => (
                <Card key={parent.id || index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={parent.isPrimary ? "default" : "secondary"}>
                          {parent.isPrimary ? t.primaryContact : t.relationships[parent.relationship]}
                        </Badge>
                        <span className="font-medium">
                          {parent.firstName || parent.lastName 
                            ? `${parent.firstName || ''} ${parent.lastName || ''}`.trim()
                            : `Parent ${index + 1}`
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleParentDetails(parent.id || `${index}`)}
                          variant="ghost"
                          size="sm"
                        >
                          {showParentDetails[parent.id || `${index}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {(Array.isArray(formData.parents) ? (Array.isArray(parents) ? parents.length : 0) : 0) > 1 && (
                          <Button
                            onClick={() => removeParent(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-remove-parent-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>{t.firstName || ''}</Label>
                        <Input
                          value={parent.firstName || ''}
                          onChange={(e) => updateParent(index, { firstName: e?.target?.value })}
                          data-testid={`input-parent-firstname-${index}`}
                        />
                      </div>

                      <div>
                        <Label>{t.lastName || ''}</Label>
                        <Input
                          value={parent.lastName || ''}
                          onChange={(e) => updateParent(index, { lastName: e?.target?.value })}
                          data-testid={`input-parent-lastname-${index}`}
                        />
                      </div>

                      <div>
                        <Label>{t.relationship}</Label>
                        <Select
                          value={parent.relationship}
                          onValueChange={(value: any) => updateParent(index, { relationship: value })}
                        >
                          <SelectTrigger data-testid={`select-parent-relationship-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(t.relationships).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={parent.isPrimary}
                          onChange={(e) => updateParent(index, { isPrimary: e?.target?.checked })}
                          data-testid={`checkbox-parent-primary-${index}`}
                        />
                        <Label>{t.primaryContact}</Label>
                      </div>
                    </div>

                    {showParentDetails[parent.id || `${index}`] && (
                      <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>{t.email || ''}</Label>
                            <Input
                              type="email"
                              value={parent.email || ''}
                              onChange={(e) => updateParent(index, { email: e?.target?.value })}
                              data-testid={`input-parent-email-${index}`}
                            />
                          </div>

                          <div>
                            <Label>{t.phone}</Label>
                            <Input
                              value={parent.phone}
                              onChange={(e) => updateParent(index, { phone: e?.target?.value })}
                              data-testid={`input-parent-phone-${index}`}
                            />
                          </div>

                          <div>
                            <Label>{t.profession}</Label>
                            <Input
                              value={parent.profession || ''}
                              onChange={(e) => updateParent(index, { profession: e?.target?.value })}
                              data-testid={`input-parent-profession-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>{t.address}</Label>
                          <Textarea
                            value={parent.address || ''}
                            onChange={(e) => updateParent(index, { address: e?.target?.value })}
                            rows={2}
                            data-testid={`input-parent-address-${index}`}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardContent className="pt-4">
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e?.target?.value})}
                  rows={3}
                  data-testid="input-student-notes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={saveStudentMutation.isPending}
              className="flex-1"
              data-testid="button-save-student"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveStudentMutation.isPending ? t.saving : t.save}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-student"
            >
              <X className="w-4 h-4 mr-2" />
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedStudentForm;