import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Download, Eye, Share, Plus, Filter, Calendar, Building2, Trash2 } from 'lucide-react';
import DocumentManagement from '@/components/shared/DocumentManagement';

const DocumentsContracts = () => {
  // Utiliser le système de gestion documentaire intégré
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Documents & Contrats</h2>
        <p className="text-gray-600 mt-1">Hub documentaire commercial et gestion des contrats</p>
      </div>
      <DocumentManagement />
    </div>
  );
};

export default DocumentsContracts;