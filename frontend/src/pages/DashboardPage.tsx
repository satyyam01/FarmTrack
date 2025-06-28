import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { animalApi, returnLogApi, authApi } from "@/services/api";
import { yieldApi } from "@/services/yieldApi";
import { format } from "date-fns";
import { Animal } from "@/types/animal";
import { YieldOverview } from "@/types/yield";
import { ReturnLog } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, HeartPulse, LayoutGrid, MapPin, Building2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

export function DashboardPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [yields, setYields] = useState<YieldOverview | null>(null);
  const [returnLogs, setReturnLogs] = useState<ReturnLog[]>([]);
  const [farmInfo, setFarmInfo] = useState<any>(null);
  
  // Use UserContext instead of localStorage
  const { user } = useUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Always fetch animals data
        const animalsData = await animalApi.getAll();
        setAnimals(animalsData);

        // Only fetch yield and return data for non-veterinarian roles
        if (user?.role !== 'veterinarian') {
          const [yieldsData, returnLogsData] = await Promise.all([
            yieldApi.getOverview(),
            returnLogApi.getByDate(format(new Date(), "yyyy-MM-dd"))
          ]);
          setYields(yieldsData);
          setReturnLogs(returnLogsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  useEffect(() => {
    // Fetch farm information if user has a farm_id
    const fetchFarmInfo = async () => {
      if (user?.farm_id) {
        try {
          const farmData = await authApi.getFarmById(user.farm_id);
          setFarmInfo(farmData);
        } catch (error) {
          console.error("Error fetching farm info:", error);
          toast.error("Failed to load farm information");
        }
      }
    };

    fetchFarmInfo();
  }, [user?.farm_id]);

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

  if (!animals.length && !yields && !returnLogs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <div className="w-full max-w-3xl">
          <div className="shadow-xl rounded-2xl border bg-white/90">
            <div className="space-y-4 text-center border-b pb-6 pt-6 px-6">
              <div className="flex justify-center mb-2">
                <LayoutGrid className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                {farmInfo ? (
                  <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <Building2 className="h-5 w-5" />
                    <span className="font-semibold text-green-700">{farmInfo.name}</span>
                    {farmInfo.location && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{farmInfo.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : user?.farm_id ? (
                  <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <Building2 className="h-5 w-5 animate-pulse" />
                    <span className="text-gray-500">Loading farm information...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <Building2 className="h-5 w-5" />
                    <span className="text-gray-500">No farm assigned</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 flex flex-col items-center">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <div className="w-full max-w-7xl">
        <div className="shadow-xl rounded-2xl border bg-white/90">
          {/* Enhanced Header with Farm Name */}
          <div className="space-y-4 text-center border-b pb-6 pt-6 px-6">
            <div className="flex justify-center mb-2">
              <LayoutGrid className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
              {farmInfo ? (
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-green-700">{farmInfo.name}</span>
                  {farmInfo.location && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{farmInfo.location}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : user?.farm_id ? (
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5 animate-pulse" />
                  <span className="text-gray-500">Loading farm information...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span className="text-gray-500">No farm assigned</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 space-y-10">
            {/* Animal Overview Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Animals Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{animalStats.total}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">Cows: {animalStats.byType.Cow}</Badge>
                      <Badge variant="outline">Goats: {animalStats.byType.Goat}</Badge>
                      <Badge variant="outline">Hens: {animalStats.byType.Hen}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Animal Health</CardTitle>
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{animalStats.total} Animals</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checkups & Medications
                    </p>
                    <Link to="/health">
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        View Health Records
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Show yield and return cards only for non-veterinarian roles */}
                {user?.role !== 'veterinarian' && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Farm ID Section for Admins */}
            {user?.role === 'admin' && user?.farm_id && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Farm Management</h2>
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Farm ID</CardTitle>
                    <CardDescription className="text-blue-700">
                      Share this ID with users who want to join your farm
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-3 py-2 rounded border text-sm font-mono">
                        {user.farm_id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (user?.farm_id) {
                            navigator.clipboard.writeText(user.farm_id);
                          }
                          toast.success("Farm ID copied to clipboard!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Users can register with this farm ID to join your farm
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Production Trends - Hidden for veterinarians */}
            {user?.role !== 'veterinarian' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
