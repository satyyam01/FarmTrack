import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { YieldType, YieldPeriod, YieldOverview, YieldFormData, Yield } from "../types/yield";
import { yieldApi } from "../services/yieldApi";
import { toast } from "sonner";
import { YieldFormDialog } from "../components/YieldFormDialog";
import { format, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface YieldStats {
  total: number;
  yields: Yield[];
  animalsByType: {
    Cow: number;
    Goat: number;
    Hen: number;
  };
}

export function YieldsPage() {
  const [selectedType, setSelectedType] = useState<YieldType | "all">("all");
  const [selectedPeriod, setSelectedPeriod] = useState<YieldPeriod>("day");
  const [overview, setOverview] = useState<YieldOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());
  const [search, setSearch] = useState("");
  const [editingYield, setEditingYield] = useState<Yield | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    const dateStr = selectedDate || getTodayLocal();
    console.log('=== Date Selection Debug ===');
    console.log('selectedDate:', selectedDate);
    console.log('formatted dateStr:', dateStr);
    fetchOverview(dateStr, dateStr);
    // Get user role from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(user?.role || null);
    } catch {
      setUserRole(null);
    }
  }, [selectedType, selectedDate]);

  const fetchOverview = async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('=== fetchOverview Debug ===');
      console.log('Fetching overview with type:', selectedType, 'Start:', start, 'End:', end);
      console.log('Start date type:', typeof start, 'Value:', start);
      console.log('End date type:', typeof end, 'Value:', end);
      const typeParam = selectedType === "all" ? undefined : selectedType;
      const data = await yieldApi.getOverview(typeParam, start, end);
      console.log('Received overview data:', data);
      console.log('Daily yields count:', data.daily?.yields?.length || 0);
      if (data.daily?.yields) {
        data.daily.yields.forEach((yieldItem, index) => {
          console.log(`Yield ${index + 1}: date="${yieldItem.date}", animal="${yieldItem.animal?.name}"`);
        });
      }
      
      // Initialize empty arrays if they don't exist
      const processedData: YieldOverview = {
        daily: {
          total: data.daily?.total || 0,
          average: data.daily?.average || 0,
          animalCount: data.daily?.animalCount || 0,
          yields: data.daily?.yields || [],
          animals: data.daily?.animals || [],
          animalsByType: data.daily?.animalsByType || { Cow: 0, Goat: 0, Hen: 0 }
        },
        weekly: {
          total: data.weekly?.total || 0,
          average: data.weekly?.average || 0,
          animalCount: data.weekly?.animalCount || 0,
          yields: data.weekly?.yields || [],
          animals: data.weekly?.animals || [],
          animalsByType: data.weekly?.animalsByType || { Cow: 0, Goat: 0, Hen: 0 }
        },
        monthly: {
          total: data.monthly?.total || 0,
          average: data.monthly?.average || 0,
          animalCount: data.monthly?.animalCount || 0,
          yields: data.monthly?.yields || [],
          animals: data.monthly?.animals || [],
          animalsByType: data.monthly?.animalsByType || { Cow: 0, Goat: 0, Hen: 0 }
        },
        animals: data.animals || []
      };
      
      setOverview(processedData);
    } catch (error) {
      console.error("Error fetching yield overview:", error);
      setError("Failed to load yield data");
      toast.error("Failed to load yield data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteYield = async (id: string) => {
    try {
      await yieldApi.delete(id);
      toast.success("Yield deleted successfully");
      fetchOverview(selectedDate ? formatDate(selectedDate) : undefined, selectedDate ? formatDate(selectedDate) : undefined);
    } catch (error) {
      console.error("Error deleting yield:", error);
      toast.error("Failed to delete yield");
    }
  };

  const calculateTotalsByType = (stats: YieldStats | undefined) => {
    const totals = {
      cowMilk: 0,
      goatMilk: 0,
      henEggs: 0
    };

    if (!stats?.yields) return totals;

    stats.yields.forEach(yieldItem => {
      if (yieldItem.animal?.type === 'Cow') {
        totals.cowMilk += Number(yieldItem.quantity);
      } else if (yieldItem.animal?.type === 'Goat') {
        totals.goatMilk += Number(yieldItem.quantity);
      } else if (yieldItem.animal?.type === 'Hen') {
        totals.henEggs += Number(yieldItem.quantity);
      }
    });

    return totals;
  };

  const handleAddYield = async (data: YieldFormData) => {
    try {
      console.log('Submitting yield data:', data);
      const response = await yieldApi.create(data);
      console.log('Created yield response:', response);
      fetchOverview(selectedDate ? formatDate(selectedDate) : undefined, selectedDate ? formatDate(selectedDate) : undefined);
      toast.success("Yield added successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding yield:", error);
      toast.error("Failed to add yield. Please try again.");
    }
  };

  const getYieldUnit = (type: YieldType) => {
    switch (type) {
      case "Cow":
      case "Goat":
        return "Liters";
      case "Hen":
        return "Eggs";
      default:
        return "";
    }
  };

  // Helper to get today's date in YYYY-MM-DD
  function getTodayLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper to format date as YYYY-MM-DD (local timezone)
  function formatDate(date: string | undefined): string | undefined {
    if (!date) return undefined;
    const year = date.split('-')[0];
    const month = date.split('-')[1];
    const day = date.split('-')[2];
    return `${year}-${month}-${day}`;
  }

  // Helper to go to previous/next day
  function goToPrevDay() {
    setSelectedDate(prev => {
      const prevDate = format(addDays(parseISO(prev), -1), 'yyyy-MM-dd');
      return prevDate;
    });
  }
  function goToNextDay() {
    setSelectedDate(prev => {
      const nextDate = format(addDays(parseISO(prev), 1), 'yyyy-MM-dd');
      return nextDate;
    });
  }

  const handleEditYield = (yieldEntry: Yield) => {
    setEditingYield(yieldEntry);
    setEditQuantity(yieldEntry.quantity.toString());
  };

  const handleEditSubmit = async () => {
    if (!editingYield) return;
    if (!editQuantity || isNaN(Number(editQuantity)) || Number(editQuantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    setIsEditSubmitting(true);
    try {
      await yieldApi.update(editingYield.id, {
        animal_id: editingYield.animal_id,
        quantity: Number(editQuantity),
        date: editingYield.date,
        unit_type: editingYield.unit_type,
      });
      toast.success("Yield updated successfully");
      setEditingYield(null);
      setEditQuantity("");
      fetchOverview(selectedDate ? formatDate(selectedDate) : undefined, selectedDate ? formatDate(selectedDate) : undefined);
    } catch (error) {
      toast.error("Failed to update yield");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <Card className="w-full max-w-3xl shadow-xl rounded-2xl border bg-white/90">
          <CardHeader className="space-y-2 text-center border-b pb-4">
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Production Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchOverview(selectedDate ? formatDate(selectedDate) : undefined, selectedDate ? formatDate(selectedDate) : undefined)}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <Card className="w-full max-w-3xl shadow-xl rounded-2xl border bg-white/90">
          <CardHeader className="space-y-2 text-center border-b pb-4">
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Production Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <Card className="w-full max-w-7xl shadow-xl rounded-2xl border bg-white/90">
        <CardHeader className="space-y-2 text-center border-b pb-4">
          <div className="flex justify-center mb-2">
            <BarChart3 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Production Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-[160px]"
              />
              <Button variant="outline" size="icon" onClick={goToPrevDay} aria-label="Previous day">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextDay} aria-label="Next day">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(getTodayLocal())}>
                Today
              </Button>
            </div>
            <div className="flex gap-2">
              {(userRole === "admin" || userRole === "farm_worker") && (
                <Button onClick={() => setIsDialogOpen(true)}>Add Yield</Button>
              )}
            </div>
          </div>

          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as YieldPeriod)}>
            <TabsList>
              <TabsTrigger value="day">Daily</TabsTrigger>
              <TabsTrigger value="week">Weekly</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="day">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Cow Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.daily).cowMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.daily.animalsByType.Cow || 0} cows producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Today's Goat Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.daily).goatMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.daily.animalsByType.Goat || 0} goats producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Today's Hen Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.daily).henEggs.toFixed(0)} Eggs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.daily.animalsByType.Hen || 0} hens producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="week">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Cow Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.weekly).cowMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.weekly.animalsByType.Cow || 0} cows producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Goat Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.weekly).goatMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.weekly.animalsByType.Goat || 0} goats producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Hen Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.weekly).henEggs.toFixed(0)} Eggs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.weekly.animalsByType.Hen || 0} hens producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="month">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Cow Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.monthly).cowMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.monthly.animalsByType.Cow || 0} cows producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Goat Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.monthly).goatMilk.toFixed(2)} Liters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.monthly.animalsByType.Goat || 0} goats producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Hen Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {calculateTotalsByType(overview?.monthly).henEggs.toFixed(0)} Eggs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {overview?.monthly.animalsByType.Hen || 0} hens producing
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Today's Yield Entries</h2>
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <Input
                placeholder="Search by animal name, tag, or type"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select 
                value={selectedType} 
                onValueChange={(value) => setSelectedType(value as YieldType | "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Cow">Cow</SelectItem>
                  <SelectItem value="Goat">Goat</SelectItem>
                  <SelectItem value="Hen">Hen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal Name</TableHead>
                  <TableHead>Tag ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !overview?.daily.yields || overview.daily.yields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No yields found</TableCell>
                  </TableRow>
                ) : (
                  overview.daily.yields
                    .filter(yieldEntry => {
                      if (!search.trim()) return true;
                      const lower = search.toLowerCase();
                      return (
                        (yieldEntry.animal?.name?.toLowerCase().includes(lower) || "") ||
                        (yieldEntry.animal?.tag_number?.toLowerCase().includes(lower) || "") ||
                        (yieldEntry.animal?.type?.toLowerCase().includes(lower) || "")
                      );
                    })
                    .map((yieldEntry) => (
                      <TableRow key={yieldEntry.id}>
                        <TableCell>{yieldEntry.animal?.name}</TableCell>
                        <TableCell>{yieldEntry.animal?.tag_number}</TableCell>
                        <TableCell>{yieldEntry.animal?.type}</TableCell>
                        <TableCell>
                          {yieldEntry.quantity.toFixed(2)} {getYieldUnit(yieldEntry.animal?.type as YieldType)}
                        </TableCell>
                        <TableCell>{yieldEntry.date}</TableCell>
                        <TableCell>
                          {(userRole === "admin" || userRole === "farm_worker") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Yield Entry</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this yield entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteYield(yieldEntry.id.toString())}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {(userRole === "admin" || userRole === "farm_worker") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={() => handleEditYield(yieldEntry)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          <YieldFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleAddYield}
          />

          <Dialog open={!!editingYield} onOpenChange={open => { if (!open) setEditingYield(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Yield</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Animal</label>
                  <Input value={editingYield?.animal?.name + (editingYield?.animal?.tag_number ? ` (${editingYield.animal.tag_number})` : "")} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input value={editingYield?.date} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={editQuantity}
                    onChange={e => setEditQuantity(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingYield(null)} disabled={isEditSubmitting}>Cancel</Button>
                <Button onClick={handleEditSubmit} disabled={isEditSubmitting}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
