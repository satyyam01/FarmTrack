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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [overview, setOverview] = useState<YieldOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview(startDate, endDate);
  }, [selectedType, startDate, endDate]);

  const fetchOverview = async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching overview with type:', selectedType, 'Start:', start, 'End:', end);
      const typeParam = selectedType === "all" ? undefined : selectedType;
      const data = await yieldApi.getOverview(typeParam, start, end);
      console.log('Received overview data:', data);
      
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
      fetchOverview();
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
      
      // Fetch updated overview data
      fetchOverview();
      
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

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL yield entries? This cannot be undone.')) {
      try {
        await yieldApi.clearAll();
        toast.success("All yields cleared successfully");
        fetchOverview();
      } catch (error) {
        console.error("Error clearing yields:", error);
        toast.error("Failed to clear yields");
      }
    }
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    // The useEffect hook will automatically refetch with cleared dates
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchOverview(startDate, endDate)}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Yields Overview</h1>
        <div className="flex gap-2">
          {/* <Button variant="destructive" onClick={handleClearAll}>Clear All</Button> */}
          <Button onClick={() => setIsDialogOpen(true)}>Add Yield</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select 
            value={selectedType} 
            onValueChange={(value) => setSelectedType(value as YieldType | "all")}
          >
            <SelectTrigger>
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

        <div className="flex gap-2 items-center flex-wrap">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="w-auto"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="w-auto"
          />
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={handleClearDates}>
              Clear Dates
            </Button>
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
              overview.daily.yields.map((yieldEntry) => (
                <TableRow key={yieldEntry.id}>
                  <TableCell>{yieldEntry.animal?.name}</TableCell>
                  <TableCell>{yieldEntry.animal?.tag_number}</TableCell>
                  <TableCell>{yieldEntry.animal?.type}</TableCell>
                  <TableCell>
                    {yieldEntry.quantity.toFixed(2)} {getYieldUnit(yieldEntry.animal?.type as YieldType)}
                  </TableCell>
                  <TableCell>{new Date(yieldEntry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this yield entry?')) {
                          handleDeleteYield(yieldEntry.id.toString());
                        }
                      }}
                    >
                      Delete
                    </Button>
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
    </div>
  );
}
