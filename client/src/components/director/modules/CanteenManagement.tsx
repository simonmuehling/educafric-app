import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  UtensilsCrossed, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  DollarSign 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect } from "react";

export default function CanteenManagement() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [menuDate, setMenuDate] = useState("");
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  // Keep both language values to preserve bilingual data
  const [mealNameFr, setMealNameFr] = useState("");
  const [mealNameEn, setMealNameEn] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const schoolId = user?.schoolId;

  // Sync visible fields with language-specific fields when language or data changes
  useEffect(() => {
    setMealName(language === 'fr' ? mealNameFr : mealNameEn);
    setDescription(language === 'fr' ? descriptionFr : descriptionEn);
  }, [language, mealNameFr, mealNameEn, descriptionFr, descriptionEn]);

  // Handler to update name - updates both visible field and appropriate language field
  const handleMealNameChange = (value: string) => {
    setMealName(value);
    if (language === 'fr') {
      setMealNameFr(value);
    } else {
      setMealNameEn(value);
    }
  };

  // Handler to update description - updates both visible field and appropriate language field
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (language === 'fr') {
      setDescriptionFr(value);
    } else {
      setDescriptionEn(value);
    }
  };

  // Fetch menus
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ["/api/canteen/menus", schoolId],
    enabled: !!schoolId,
  });

  // Fetch all reservations for the school
  const { data: allReservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["/api/canteen/reservations/school", schoolId],
    queryFn: async () => {
      // Aggregate reservations from all menus
      const menusData = menus as any[];
      if (!Array.isArray(menusData) || menusData.length === 0) return [];
      
      const reservationsPromises = menusData.map(async (menu: any) => {
        const response = await fetch(`/api/canteen/reservations/menu/${menu.id}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data;
      });
      
      const reservationsArrays = await Promise.all(reservationsPromises);
      return reservationsArrays.flat();
    },
    enabled: !!schoolId && Array.isArray(menus) && menus.length > 0,
  });

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: async (menuData: any) => {
      return apiRequest("POST", "/api/canteen/menus", menuData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/menus"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Menu créé avec succès' : 'Menu created successfully',
      });
      resetForm();
      setIsMenuDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la création du menu' : 'Failed to create menu',
        variant: "destructive",
      });
    },
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/canteen/menus/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/menus"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Menu modifié avec succès' : 'Menu updated successfully',
      });
      resetForm();
      setIsMenuDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la modification du menu' : 'Failed to update menu',
        variant: "destructive",
      });
    },
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/canteen/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/menus"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Menu supprimé avec succès' : 'Menu deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la suppression du menu' : 'Failed to delete menu',
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedMenu(null);
    setMenuDate("");
    setMealName("");
    setDescription("");
    setMealNameFr("");
    setMealNameEn("");
    setDescriptionFr("");
    setDescriptionEn("");
    setPrice("");
    setItems([]);
    setNewItem("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsMenuDialogOpen(true);
  };

  const openEditDialog = (menu: any) => {
    setSelectedMenu(menu);
    setMenuDate(menu.date?.split('T')[0] || "");
    // Load both language values to preserve bilingual data
    setMealNameFr(menu.mealNameFr || "");
    setMealNameEn(menu.mealNameEn || "");
    setDescriptionFr(menu.descriptionFr || "");
    setDescriptionEn(menu.descriptionEn || "");
    // Set visible fields based on current language
    setMealName(language === 'fr' ? (menu.mealNameFr || menu.mealNameEn || "") : (menu.mealNameEn || menu.mealNameFr || ""));
    setDescription(language === 'fr' ? (menu.descriptionFr || menu.descriptionEn || "") : (menu.descriptionEn || menu.descriptionFr || ""));
    setPrice(menu.price || "");
    setItems(Array.isArray(menu.items) ? menu.items : []);
    setIsMenuDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!menuDate || !mealName || !price || !schoolId) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: "destructive",
      });
      return;
    }

    // Preserve both language values - use existing values or current input if creating new
    const menuData = {
      schoolId,
      date: menuDate,
      mealNameFr: mealNameFr || mealName,
      mealNameEn: mealNameEn || mealName,
      descriptionFr: descriptionFr || description,
      descriptionEn: descriptionEn || description,
      price: parseFloat(price),
      items,
      isAvailable: true,
    };

    if (selectedMenu) {
      updateMenuMutation.mutate({ id: selectedMenu.id, data: menuData });
    } else {
      createMenuMutation.mutate(menuData);
    }
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <UtensilsCrossed className="h-8 w-8" />
            {language === 'fr' ? 'Gestion de la Cantine' : 'Canteen Management'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'fr' ? 'Gérez les menus et réservations de la cantine' : 'Manage canteen menus and reservations'}
          </p>
        </div>
        
        <Button onClick={openCreateDialog} data-testid="button-create-menu">
          <Plus className="h-4 w-4 mr-2" />
          {language === 'fr' ? 'Nouveau Menu' : 'New Menu'}
        </Button>
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList>
          <TabsTrigger value="menus" data-testid="tab-menus">
            {language === 'fr' ? 'Menus' : 'Menus'}
          </TabsTrigger>
          <TabsTrigger value="reservations" data-testid="tab-reservations">
            {language === 'fr' ? 'Réservations' : 'Reservations'}
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="tab-statistics">
            {language === 'fr' ? 'Statistiques' : 'Statistics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menus" className="space-y-4">
          {menusLoading ? (
            <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          ) : !Array.isArray(menus) || menus.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'fr' ? 'Aucun menu disponible. Créez votre premier menu!' : 'No menus available. Create your first menu!'}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus.map((menu: any) => (
                <Card key={menu.id} data-testid={`card-menu-${menu.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5" />
                        {new Date(menu.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </CardTitle>
                      <Badge variant="secondary">{menu.price} FCFA</Badge>
                    </div>
                    <CardDescription>
                      {language === 'fr' ? menu.mealNameFr : menu.mealNameEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr' ? menu.descriptionFr : menu.descriptionEn}
                    </p>
                    {Array.isArray(menu.items) && menu.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          {language === 'fr' ? 'Éléments:' : 'Items:'}
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {menu.items.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(menu)}
                        data-testid={`button-edit-${menu.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMenuMutation.mutate(menu.id)}
                        disabled={deleteMenuMutation.isPending}
                        data-testid={`button-delete-${menu.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {language === 'fr' ? 'Supprimer' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          {reservationsLoading ? (
            <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          ) : !Array.isArray(allReservations) || allReservations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'fr' ? 'Aucune réservation' : 'No reservations'}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{language === 'fr' ? 'Réservations' : 'Reservations'}</CardTitle>
                <CardDescription>
                  {allReservations.length} {language === 'fr' ? 'réservation(s)' : 'reservation(s)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'fr' ? 'Date' : 'Date'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Élève' : 'Student'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Menu' : 'Menu'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Prix' : 'Price'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReservations.map((reservation: any) => (
                      <TableRow key={reservation.id} data-testid={`row-reservation-${reservation.id}`}>
                        <TableCell>
                          {new Date(reservation.menuDate || reservation.reservedDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </TableCell>
                        <TableCell>{reservation.studentName || reservation.studentId}</TableCell>
                        <TableCell>{reservation.menuDescription}</TableCell>
                        <TableCell>{reservation.price} FCFA</TableCell>
                        <TableCell>
                          <Badge variant={reservation.isPaid ? "default" : "secondary"}>
                            {reservation.isPaid ? (language === 'fr' ? 'Payé' : 'Paid') : (language === 'fr' ? 'Non payé' : 'Unpaid')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  {language === 'fr' ? 'Total Menus' : 'Total Menus'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="stat-total-menus">
                  {Array.isArray(menus) ? menus.length : 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {language === 'fr' ? 'Total Réservations' : 'Total Reservations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="stat-total-reservations">
                  {Array.isArray(allReservations) ? allReservations.length : 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {language === 'fr' ? 'Revenu Total' : 'Total Revenue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="stat-total-revenue">
                  {Array.isArray(allReservations) 
                    ? allReservations.reduce((sum: number, r: any) => sum + (parseFloat(r.price) || 0), 0).toFixed(0)
                    : 0
                  } FCFA
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMenu 
                ? (language === 'fr' ? 'Modifier le Menu' : 'Edit Menu') 
                : (language === 'fr' ? 'Nouveau Menu' : 'New Menu')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Remplissez les informations du menu de la cantine' 
                : 'Fill in the canteen menu information'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="menuDate">{language === 'fr' ? 'Date du Menu' : 'Menu Date'} *</Label>
              <Input
                id="menuDate"
                type="date"
                value={menuDate}
                onChange={(e) => setMenuDate(e.target.value)}
                data-testid="input-menu-date"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mealName">{language === 'fr' ? 'Nom du repas' : 'Meal Name'} *</Label>
              <Input
                id="mealName"
                value={mealName}
                onChange={(e) => handleMealNameChange(e.target.value)}
                placeholder={language === 'fr' ? 'Déjeuner' : 'Lunch'}
                data-testid="input-meal-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{language === 'fr' ? 'Description' : 'Description'}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder={language === 'fr' ? 'Description du menu...' : 'Menu description...'}
                data-testid="input-description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">{language === 'fr' ? 'Prix (FCFA)' : 'Price (FCFA)'} *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1000"
                data-testid="input-price"
              />
            </div>

            <div className="grid gap-2">
              <Label>{language === 'fr' ? 'Éléments du Menu' : 'Menu Items'}</Label>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder={language === 'fr' ? 'Ajouter un élément...' : 'Add an item...'}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                  data-testid="input-new-item"
                />
                <Button type="button" onClick={addItem} data-testid="button-add-item">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {items.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-muted rounded" data-testid={`item-${index}`}>
                      <span>{item}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
              data-testid="button-submit-menu"
            >
              {createMenuMutation.isPending || updateMenuMutation.isPending
                ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (language === 'fr' ? 'Enregistrer' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
