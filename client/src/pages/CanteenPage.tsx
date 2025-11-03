import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, UtensilsCrossed, Wallet, Plus, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CanteenPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");

  // Get school ID from user context
  const schoolId = user?.schoolId;
  const studentId = user?.role === "Student" ? user?.id : null;
  const isStaff = user?.role === "Director" || user?.role === "Teacher";

  // Fetch menus for the school
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ["/api/canteen/menus", schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/canteen/menus/${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch menus");
      return response.json();
    },
    enabled: !!schoolId,
  });

  // Fetch student reservations
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["/api/canteen/reservations/student", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/canteen/reservations/student/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch reservations");
      return response.json();
    },
    enabled: !!studentId,
  });

  // Fetch student balance
  const { data: balance } = useQuery({
    queryKey: ["/api/canteen/balance", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/canteen/balance/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch balance");
      return response.json();
    },
    enabled: !!studentId,
  });

  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: async (menu: any) => {
      return apiRequest("POST", "/api/canteen/reservations", {
        menuId: menu.id,
        studentId,
        reservedDate: menu.menuDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/reservations/student"] });
      toast({
        title: t("success"),
        description: t("makeReservation") + " " + t("success").toLowerCase(),
      });
      setIsReservationOpen(false);
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Failed to create reservation",
        variant: "destructive",
      });
    },
  });

  // Cancel reservation mutation
  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId: number) => {
      return apiRequest("DELETE", `/api/canteen/reservations/${reservationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/reservations/student"] });
      toast({
        title: t("success"),
        description: t("cancelReservation") + " " + t("success").toLowerCase(),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Failed to cancel reservation",
        variant: "destructive",
      });
    },
  });

  // Add balance mutation
  const addBalanceMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", `/api/canteen/balance/${studentId}/add`, {
        amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen/balance"] });
      toast({
        title: t("success"),
        description: t("addBalance") + " " + t("success").toLowerCase(),
      });
      setIsBalanceOpen(false);
      setBalanceAmount("");
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Failed to add balance",
        variant: "destructive",
      });
    },
  });

  const handleMakeReservation = (menu: any) => {
    setSelectedMenu(menu);
    setIsReservationOpen(true);
  };

  const confirmReservation = () => {
    if (selectedMenu) {
      createReservationMutation.mutate(selectedMenu);
    }
  };

  const handleAddBalance = () => {
    if (balanceAmount && parseFloat(balanceAmount) > 0) {
      addBalanceMutation.mutate(balanceAmount);
    }
  };

  const isMenuReserved = (menuId: number) => {
    return Array.isArray(reservations) && reservations.some((r: any) => r.menuId === menuId);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <UtensilsCrossed className="h-8 w-8" />
            {t("canteenManagement")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("canteenManagement")}</p>
        </div>
        
        {studentId && (
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {t("canteenBalance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" data-testid="text-balance">
                  {(balance as any)?.balance || "0"} FCFA
                </span>
                <Dialog open={isBalanceOpen} onOpenChange={setIsBalanceOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" data-testid="button-add-balance">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("addBalance")}</DialogTitle>
                      <DialogDescription>
                        {t("amount")} (FCFA)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">{t("amount")}</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="5000"
                          value={balanceAmount}
                          onChange={(e) => setBalanceAmount(e.target.value)}
                          data-testid="input-balance-amount"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddBalance}
                        disabled={addBalanceMutation.isPending}
                        data-testid="button-confirm-add-balance"
                      >
                        {addBalanceMutation.isPending ? t("sending") : t("confirm")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList>
          <TabsTrigger value="menus" data-testid="tab-menus">{t("menus")}</TabsTrigger>
          {studentId && (
            <TabsTrigger value="reservations" data-testid="tab-reservations">
              {t("reservations")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="menus" className="space-y-4">
          {menusLoading ? (
            <p>Loading menus...</p>
          ) : !Array.isArray(menus) || menus.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No menus available
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus.map((menu: any) => (
                <Card key={menu.id} data-testid={`card-menu-${menu.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {new Date(menu.menuDate).toLocaleDateString()}
                      </CardTitle>
                      {isMenuReserved(menu.id) && (
                        <Badge variant="secondary">
                          <Check className="h-3 w-3 mr-1" />
                          {t("reserved")}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{menu.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{t("menuItems")}:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {Array.isArray(menu.items) && menu.items.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-lg font-bold">{menu.price} FCFA</span>
                      {studentId && !isMenuReserved(menu.id) && (
                        <Button
                          size="sm"
                          onClick={() => handleMakeReservation(menu)}
                          data-testid={`button-reserve-${menu.id}`}
                        >
                          {t("makeReservation")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {studentId && (
          <TabsContent value="reservations" className="space-y-4">
            {reservationsLoading ? (
              <p>Loading reservations...</p>
            ) : !Array.isArray(reservations) || reservations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t("reservations")} {t("available").toLowerCase()}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {Array.isArray(reservations) && reservations.map((reservation: any) => (
                  <Card key={reservation.id} data-testid={`card-reservation-${reservation.id}`}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">
                          {new Date(reservation.menuDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.menuDescription}
                        </p>
                        <p className="text-sm mt-1">
                          <Badge variant={reservation.isPaid ? "default" : "secondary"}>
                            {reservation.isPaid ? t("paid") : t("unpaid")}
                          </Badge>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{reservation.price} FCFA</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelReservationMutation.mutate(reservation.id)}
                          disabled={cancelReservationMutation.isPending}
                          data-testid={`button-cancel-${reservation.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("makeReservation")}</DialogTitle>
            <DialogDescription>
              {t("confirm")} {t("makeReservation").toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedMenu && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-semibold">{t("menuDate")}:</p>
                <p>{new Date(selectedMenu.menuDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">{t("menuItems")}:</p>
                <ul className="list-disc list-inside">
                  {Array.isArray(selectedMenu.items) && selectedMenu.items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">{t("price")}:</p>
                <p className="text-lg font-bold">{selectedMenu.price} FCFA</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={confirmReservation}
              disabled={createReservationMutation.isPending}
              data-testid="button-confirm-reservation"
            >
              {createReservationMutation.isPending ? t("sending") : t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
