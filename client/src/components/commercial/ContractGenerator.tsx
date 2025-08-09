import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, Download, Eye, Plus, Building2, User, MapPin, DollarSign, Target, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contractSchema = z.object({
  // Informations du partenaire
  partnerName: z.string().min(2, 'Nom requis'),
  partnerAddress: z.string().min(5, 'Adresse requise'),
  partnerPhone: z.string().min(8, 'Téléphone requis'),
  partnerEmail: z.string().email('Email invalide'),
  
  // Territoire
  territoryType: z.enum(['cameroon', 'region', 'city']),
  specificTerritory: z.string().optional(),
  
  // Rémunération
  compensationType: z.enum(['fixed', 'commission', 'mixed']),
  fixedSalary: z.number().optional(),
  commissionSchoolPublic: z.number().min(0, 'Commission requise'),
  commissionSchoolPrivate: z.number().min(0, 'Commission requise'),
  commissionFreelancer: z.number().min(0, 'Commission requise'),
  
  // Méthode de paiement
  paymentMethod: z.enum(['bank', 'mobile_money', 'cash']),
  
  // Objectifs
  monthlyContactsTarget: z.number().min(1, 'Objectif requis'),
  monthlyDemosTarget: z.number().min(1, 'Objectif requis'),
  monthlyContractsTarget: z.number().min(1, 'Objectif requis'),
  monthlyRevenueTarget: z.number().min(1, 'Objectif requis'),
  
  // Bonus
  performanceBonus: z.number().min(0, 'Bonus requis'),
  
  // Durée
  contractDuration: z.enum(['3', '6', '12']),
  
  // Options spéciales
  hasNonCompete: z.boolean().default(true),
  nonCompetePeriod: z.number().default(6),
  hasTraining: z.boolean().default(true),
  hasMarketingMaterials: z.boolean().default(true)
});

type ContractForm = z.infer<typeof contractSchema>;

interface ContractGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  commercialId?: number;
  onContractGenerated?: (contractData: any) => void;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({
  isOpen,
  onClose,
  commercialId,
  onContractGenerated
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string | null>(null);

  const form = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      territoryType: 'cameroon',
      compensationType: 'mixed',
      fixedSalary: 150000,
      commissionSchoolPublic: 25000,
      commissionSchoolPrivate: 35000,
      commissionFreelancer: 12500,
      paymentMethod: 'mobile_money',
      monthlyContactsTarget: 20,
      monthlyDemosTarget: 10,
      monthlyContractsTarget: 3,
      monthlyRevenueTarget: 300000,
      performanceBonus: 50000,
      contractDuration: '3',
      hasNonCompete: true,
      nonCompetePeriod: 6,
      hasTraining: true,
      hasMarketingMaterials: true
    }
  });

  const generateContract = async (data: ContractForm) => {
    setIsGenerating(true);
    
    try {
      const contractHtml = generateContractHTML(data);
      setGeneratedContract(contractHtml);
      
      // Simuler l'enregistrement en base
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const contractData = {
        id: Date.now(),
        commercialId: commercialId || null,
        partnerName: data.partnerName,
        type: 'commercial_partnership',
        status: 'generated',
        createdAt: new Date().toISOString(),
        content: contractHtml
      };

      if (onContractGenerated) {
        onContractGenerated(contractData);
      }

      toast({
        title: 'Contrat généré avec succès',
        description: `Contrat commercial créé pour ${data.partnerName}`,
      });

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le contrat',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContractHTML = (data: ContractForm): string => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    const territoryText = {
      cameroon: 'Cameroun (tout le territoire)',
      region: `Région spécifique : ${data.specificTerritory}`,
      city: `Ville spécifique : ${data.specificTerritory}`
    }[data.territoryType];

    const compensationText = {
      fixed: `Salaire mensuel fixe : ${data.fixedSalary?.toLocaleString()} CFA/mois`,
      commission: 'Commission uniquement',
      mixed: `Salaire fixe ${data.fixedSalary?.toLocaleString()} CFA + Commission`
    }[data.compensationType];

    const paymentMethodText = {
      bank: 'Virement bancaire',
      mobile_money: 'Mobile Money',
      cash: 'Espèces'
    }[data.paymentMethod];

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat de Partenariat Commercial - EduConnect Africa</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; font-size: 11pt; }
        .header { text-align: center; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 24pt; font-weight: bold; }
        .header p { margin: 10px 0 0 0; font-size: 12pt; opacity: 0.9; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .party-box { border: 2px solid #22c55e; padding: 15px; border-radius: 8px; background: #f0fdf4; }
        .party-title { font-weight: bold; color: #22c55e; font-size: 14pt; margin-bottom: 10px; }
        .article { margin-bottom: 25px; page-break-inside: avoid; }
        .article h2 { color: #22c55e; font-size: 14pt; border-bottom: 2px solid #22c55e; padding-bottom: 5px; margin-bottom: 15px; }
        .highlight-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .compensation-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .compensation-table th, .compensation-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .compensation-table th { background: #22c55e; color: white; font-weight: bold; }
        .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .signature-box { border: 2px solid #22c55e; padding: 20px; border-radius: 8px; min-height: 120px; }
        .signature-title { font-weight: bold; color: #22c55e; margin-bottom: 15px; }
        .footer { text-align: center; color: #6b7280; font-size: 9pt; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .legal-info { background: #1f2937; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .legal-info h3 { color: #22c55e; margin-top: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRAT DE PARTENARIAT COMMERCIAL</h1>
        <p>EduConnect Africa - Afro Metaverse Marketing SARL</p>
    </div>

    <div class="legal-info">
        <h3>INFORMATIONS LÉGALES</h3>
        <p><strong>Propriétaire de la marque :</strong> Afro Metaverse Marketing SARL</p>
        <p><strong>Siège social :</strong> Douala, Cameroun</p>
        <p><strong>Marque déposée :</strong> EduConnect Africa - Brevet de droit d'auteur enregistré à l'OAPI du Cameroun</p>
        <p><strong>Téléphone :</strong> +237 656 200 472 | <strong>Email :</strong> info@educafric.com</p>
    </div>

    <div class="article">
        <h2>IDENTIFICATION DES PARTIES</h2>
        <div class="parties">
            <div class="party-box">
                <div class="party-title">L'ENTREPRISE</div>
                <p><strong>Afro Metaverse Marketing SARL</strong><br>
                Propriétaire de la marque EduConnect Africa<br>
                Adresse : Douala, Cameroun<br>
                Téléphone : +237 656 200 472<br>
                Email : info@educafric.com<br>
                Ci-après dénommée "L'ENTREPRISE"</p>
            </div>
            <div class="party-box">
                <div class="party-title">LE PARTENAIRE COMMERCIAL</div>
                <p>Nom complet : <strong>${data.partnerName}</strong><br>
                Adresse : <strong>${data.partnerAddress}</strong><br>
                Téléphone : <strong>${data.partnerPhone}</strong><br>
                Email : <strong>${data.partnerEmail}</strong><br>
                Ci-après dénommé "LE PARTENAIRE"</p>
            </div>
        </div>
        <p><strong>Date du contrat :</strong> ${currentDate}</p>
    </div>

    <div class="article">
        <h2>ARTICLE 1 - OBJET DU CONTRAT</h2>
        <p>Ce contrat établit un partenariat commercial pour la promotion et la vente des services de la plateforme de gestion éducative EduConnect Africa auprès des écoles et institutions éducatives.</p>
        
        <div class="highlight-box">
            <h3>Territoire d'intervention</h3>
            <p><strong>${territoryText}</strong></p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE 2 - STRUCTURE DE RÉMUNÉRATION</h2>
        
        <table class="compensation-table">
            <thead>
                <tr>
                    <th>Type de Contrat</th>
                    <th>Commission Fixe</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>École Publique (50,000 CFA/an)</td>
                    <td><strong>${data.commissionSchoolPublic.toLocaleString()} CFA</strong></td>
                </tr>
                <tr>
                    <td>École Privée (75,000 CFA/an)</td>
                    <td><strong>${data.commissionSchoolPrivate.toLocaleString()} CFA</strong></td>
                </tr>
                <tr>
                    <td>Enseignant Freelance (25,000 CFA/an)</td>
                    <td><strong>${data.commissionFreelancer.toLocaleString()} CFA</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="highlight-box">
            <h3>Modalités de Paiement</h3>
            <p><strong>Type de rémunération :</strong> ${compensationText}</p>
            <p><strong>Mode de paiement :</strong> ${paymentMethodText}</p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE 3 - OBJECTIFS ET PERFORMANCES</h2>
        
        <h3>Objectifs Mensuels</h3>
        <ul>
            <li>Nombre d'institutions contactées : <strong>${data.monthlyContactsTarget}</strong></li>
            <li>Nombre de démonstrations effectuées : <strong>${data.monthlyDemosTarget}</strong></li>
            <li>Nombre de contrats signés (objectif) : <strong>${data.monthlyContractsTarget}</strong></li>
            <li>Chiffre d'affaires généré (objectif) : <strong>${data.monthlyRevenueTarget.toLocaleString()} CFA</strong></li>
        </ul>

        <div class="highlight-box">
            <h3>Bonus de Performance</h3>
            <p>Dépassement d'objectifs : <strong>${data.performanceBonus.toLocaleString()} CFA par contrat supplémentaire</strong></p>
        </div>
    </div>

    <div class="article">
        <h2>ARTICLE 4 - DURÉE DU CONTRAT</h2>
        <p>Ce contrat est valide pour <strong>${data.contractDuration} mois</strong> à compter de la date de signature.</p>
        <p>Renouvellement automatique pour des périodes de ${data.contractDuration} mois, sauf résiliation avec préavis de 30 jours.</p>
    </div>

    ${data.hasNonCompete ? `
    <div class="article">
        <h2>ARTICLE 5 - CLAUSE DE NON-CONCURRENCE</h2>
        <p>Pendant la durée du contrat et <strong>${data.nonCompetePeriod} mois</strong> après sa résiliation, LE PARTENAIRE s'engage à ne pas travailler pour des concurrents directs d'EduConnect Africa.</p>
    </div>` : ''}

    <div class="article">
        <h2>ARTICLE 6 - CONFIDENTIALITÉ ET PROPRIÉTÉ INTELLECTUELLE</h2>
        <div class="highlight-box">
            <ul>
                <li>Toutes les informations échangées sont strictement confidentielles</li>
                <li>La propriété intellectuelle reste avec L'ENTREPRISE</li>
                <li>L'usage de la marque EduConnect Africa nécessite une autorisation écrite</li>
                <li>Protection sous brevet OAPI et législation OHADA</li>
            </ul>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-title">L'ENTREPRISE</div>
            <p>Afro Metaverse Marketing SARL</p>
            <p>Représentée par :</p>
            <br><br>
            <p>Date : _____________</p>
            <p>Signature : _____________</p>
        </div>
        <div class="signature-box">
            <div class="signature-title">LE PARTENAIRE</div>
            <p>${data.partnerName}</p>
            <br><br><br>
            <p>Date : _____________</p>
            <p>Signature : _____________</p>
        </div>
    </div>

    <div class="footer">
        <p>EduConnect Africa - Contrat généré automatiquement le ${currentDate}</p>
        <p>Afro Metaverse Marketing SARL - Douala, Cameroun - +237 656 200 472</p>
    </div>
</body>
</html>`;
  };

  const downloadContract = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrat_commercial_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewContract = () => {
    if (!generatedContract) return;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(generatedContract);
      newWindow.document.close();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générateur de Contrat Commercial
          </DialogTitle>
        </DialogHeader>

        {!generatedContract ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateContract)} className="space-y-6">
              {/* Informations du Partenaire */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informations du Partenaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="partnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Jean Baptiste Talla" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+237 6XX XXX XXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Adresse complète" className="min-h-[60px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Territoire */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Territoire d'intervention
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="territoryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de territoire</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cameroon">Tout le Cameroun</SelectItem>
                            <SelectItem value="region">Région spécifique</SelectItem>
                            <SelectItem value="city">Ville spécifique</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(form.watch('territoryType') === 'region' || form.watch('territoryType') === 'city') && (
                    <FormField
                      control={form.control}
                      name="specificTerritory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch('territoryType') === 'region' ? 'Région' : 'Ville'}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Centre, Littoral, Douala, Yaoundé..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Rémunération */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Structure de Rémunération
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="compensationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de rémunération</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Salaire fixe uniquement</SelectItem>
                              <SelectItem value="commission">Commission uniquement</SelectItem>
                              <SelectItem value="mixed">Salaire + Commission</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Méthode de paiement</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="bank">Virement bancaire</SelectItem>
                              <SelectItem value="cash">Espèces</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {(form.watch('compensationType') === 'fixed' || form.watch('compensationType') === 'mixed') && (
                    <FormField
                      control={form.control}
                      name="fixedSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salaire mensuel fixe (CFA)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="150000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="commissionSchoolPublic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission École Publique (CFA)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="25000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commissionSchoolPrivate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission École Privée (CFA)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="35000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commissionFreelancer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Freelancer (CFA)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="12500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objectifs de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthlyContactsTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacts mensuels</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyDemosTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Démonstrations mensuelles</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyContractsTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contrats mensuels</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="3"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyRevenueTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chiffre d'affaires mensuel (CFA)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="300000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="performanceBonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus par contrat supplémentaire (CFA)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="50000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée du contrat</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3">3 mois</SelectItem>
                            <SelectItem value="6">6 mois</SelectItem>
                            <SelectItem value="12">12 mois</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Options du Contrat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasNonCompete"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Clause de non-concurrence</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('hasNonCompete') && (
                    <FormField
                      control={form.control}
                      name="nonCompetePeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Période de non-concurrence (mois)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="6"
                              className="max-w-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasTraining"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Formation incluse</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasMarketingMaterials"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Matériel marketing fourni</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? 'Génération...' : 'Générer le Contrat'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          // Contract Generated View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-700">Contrat généré avec succès !</h3>
                <p className="text-sm text-gray-600">Le contrat commercial a été créé et est prêt à être utilisé.</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Généré
              </Badge>
            </div>

            <div className="flex space-x-3">
              <Button onClick={previewContract} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </Button>
              <Button onClick={downloadContract}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger HTML
              </Button>
              <Button onClick={() => setGeneratedContract(null)} variant="outline">
                Créer un nouveau contrat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContractGenerator;