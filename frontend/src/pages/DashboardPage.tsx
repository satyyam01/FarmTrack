import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { animalApi, returnLogApi } from "@/services/api";
import { yieldApi } from "@/services/yieldApi";
import { format } from "date-fns";
import { Animal } from "@/types/animal";
import { YieldOverview } from "@/types/yield";
import { ReturnLog } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function DashboardPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [yields, setYields] = useState<YieldOverview | null>(null);
  const [returnLogs, setReturnLogs] = useState<ReturnLog[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [animalsData, yieldsData, returnLogsData] = await Promise.all([
          animalApi.getAll(),
          yieldApi.getOverview(),
          returnLogApi.getByDate(format(new Date(), "yyyy-MM-dd"))
        ]);

        setAnimals(animalsData);
        setYields(yieldsData);
        setReturnLogs(returnLogsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate animal statistics
  const animalStats = {
    total: animals.length,
    byType: {
      Cow: animals.filter(a => a.type === "Cow").length,
      Goat: animals.filter(a => a.type === "Goat").length,
      Hen: animals.filter(a => a.type === "Hen").length
    }
  };

  // Calculate return statistics
  const returnStats = {
    total: animals.length,
    returned: returnLogs.filter(log => log.returned).length,
    missing: animals.length - returnLogs.filter(log => log.returned).length,
    returnRate: animals.length ? (returnLogs.filter(log => log.returned).length / animals.length) * 100 : 0
  };

  // Calculate yield statistics
  const calculateTotalsByType = (stats: any) => {
    if (!stats?.yields) return { cowMilk: 0, goatMilk: 0, henEggs: 0 };

    return stats.yields.reduce((acc: any, yieldItem: any) => {
      if (yieldItem.animal?.type === 'Cow') {
        acc.cowMilk += Number(yieldItem.quantity);
      } else if (yieldItem.animal?.type === 'Goat') {
        acc.goatMilk += Number(yieldItem.quantity);
      } else if (yieldItem.animal?.type === 'Hen') {
        acc.henEggs += Number(yieldItem.quantity);
      }
      return acc;
    }, { cowMilk: 0, goatMilk: 0, henEggs: 0 });
  };

  const todayYields = calculateTotalsByType(yields?.daily);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Animal Overview Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Animals Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{animalStats.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Cows: {animalStats.byType.Cow}</Badge>
                <Badge variant="outline">Goats: {animalStats.byType.Goat}</Badge>
                <Badge variant="outline">Hens: {animalStats.byType.Hen}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Milk Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Cow Milk</div>
                  <div className="text-xl font-bold">{todayYields.cowMilk.toFixed(2)} L</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Goat Milk</div>
                  <div className="text-xl font-bold">{todayYields.goatMilk.toFixed(2)} L</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Egg Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayYields.henEggs.toFixed(0)} eggs</div>
              <p className="text-xs text-muted-foreground mt-2">
                From {yields?.daily?.animalsByType?.Hen || 0} hens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Night Return Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnStats.returnRate.toFixed(1)}%</div>
              <Progress value={returnStats.returnRate} className="mt-2" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{returnStats.returned}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{returnStats.missing}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production Trends */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Production Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Production</CardTitle>
              <CardDescription>Last 7 days overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cow Milk</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.weekly).cowMilk.toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goat Milk</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.weekly).goatMilk.toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Eggs</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.weekly).henEggs.toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Production</CardTitle>
              <CardDescription>This month's overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cow Milk</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.monthly).cowMilk.toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goat Milk</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.monthly).goatMilk.toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Eggs</span>
                  <span className="font-medium">
                    {calculateTotalsByType(yields?.monthly).henEggs.toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Animals Producing Today</CardTitle>
              <CardDescription>Active producers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cows</span>
                  <span className="font-medium">
                    {yields?.daily?.animalsByType?.Cow || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goats</span>
                  <span className="font-medium">
                    {yields?.daily?.animalsByType?.Goat || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hens</span>
                  <span className="font-medium">
                    {yields?.daily?.animalsByType?.Hen || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
