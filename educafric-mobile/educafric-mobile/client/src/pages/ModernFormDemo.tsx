import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernFormWrapper, modernInputClasses, modernLabelClasses, modernButtonClasses } from '@/components/ui/ModernFormWrapper';
import { User, Mail, Phone, BookOpen, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModernFormDemo() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    subject: '',
    bio: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Full ModernFormWrapper Demo */}
        <ModernFormWrapper
          title="Teacher Registration"
          subtitle="Add a new teacher to your school system"
          icon={User}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={modernLabelClasses}>First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e?.target?.value)}
                  className={modernInputClasses}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className={modernLabelClasses}>Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e?.target?.value)}
                  className={modernInputClasses}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={modernLabelClasses}>Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school?.edu?.cm"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e?.target?.value)}
                  className={cn(modernInputClasses, "pl-10")}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={modernLabelClasses}>Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 XXX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e?.target?.value)}
                  className={cn(modernInputClasses, "pl-10")}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className={modernLabelClasses}>Teaching Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className="bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin_teacher">Admin Teacher</SelectItem>
                    <SelectItem value="head_teacher">Head Teacher</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className={modernLabelClasses}>City</Label>
                <Select value={formData.city} onValueChange={(value) => handleChange('city', value)}>
                  <SelectTrigger className="bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yaounde">Yaoundé</SelectItem>
                    <SelectItem value="douala">Douala</SelectItem>
                    <SelectItem value="bafoussam">Bafoussam</SelectItem>
                    <SelectItem value="bamenda">Bamenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className={modernLabelClasses}>Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your teaching experience..."
                value={formData.bio}
                onChange={(e) => handleChange('bio', e?.target?.value)}
                className="bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all resize-none"
                rows={4}
              />
            </div>

            <Button type="submit" className={modernButtonClasses}>
              <Save className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </form>
        </ModernFormWrapper>

        {/* Compact Modern Form in Card */}
        <Card className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
          <CardHeader className="text-center relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              Quick Add Student
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={modernLabelClasses}>Student Name</Label>
                <Input 
                  placeholder="Full name"
                  className={modernInputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label className={modernLabelClasses}>Class</Label>
                <Select>
                  <SelectTrigger className="bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6eme">6ème</SelectItem>
                    <SelectItem value="5eme">5ème</SelectItem>
                    <SelectItem value="4eme">4ème</SelectItem>
                    <SelectItem value="3eme">3ème</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 hover:from-blue-600 hover:via-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </CardContent>
        </Card>

        {/* Simple inline form demo */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
          <h3 className="text-xl font-bold text-white/90 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="Email address"
              className={modernInputClasses}
            />
            <Input 
              placeholder="Phone number"
              className={modernInputClasses}
            />
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
              Save Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}