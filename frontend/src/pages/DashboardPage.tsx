import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import api from "@/services/api";
import { 
  CheckCircle, 
  AlertCircle, 
  HeartPulse, 
  LayoutGrid, 
  MapPin, 
  Building2, 
  Bell, 
  ShieldAlert, 
  Moon, 
  Clock,
  Activity,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/dashboard/overview");
        setDashboard(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <div className="w-full max-w-3xl">
          <div className="shadow-xl rounded-2xl border bg-white/90">
            <div className="space-y-4 text-center border-b pb-6 pt-6 px-6">
              <div className="flex justify-center mb-2">
                <LayoutGrid className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Overview</h1>
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5 animate-pulse" />
                  <span className="text-gray-500">Loading farm information...</span>
                </div>
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

  if (!dashboard) {
    return <div className="p-8">No dashboard data available.</div>;
  }

  // Extract data from dashboard
  const { animals, yields, returnLogs, notifications, nightCheckSchedule } = dashboard;

  // Calculate animal statistics
  const animalStats = {
    total: animals.length,
    byType: {
      Cow: animals.filter((a: any) => a.type === "Cow").length,
      Goat: animals.filter((a: any) => a.type === "Goat").length,
      Hen: animals.filter((a: any) => a.type === "Hen").length,
    },
  };

  // Calculate return statistics
  const returnStats = {
    total: animals.length,
    returned: returnLogs.filter((log: any) => log.returned).length,
    missing: animals.length - returnLogs.filter((log: any) => log.returned).length,
    returnRate: animals.length
      ? (returnLogs.filter((log: any) => log.returned).length / animals.length) * 100
      : 0,
  };

  // Calculate yield statistics
  const calculateTotalsByType = (stats: any) => {
    if (!stats?.yields) return { cowMilk: 0, goatMilk: 0, henEggs: 0 };
    return stats.yields.reduce(
      (acc: any, yieldItem: any) => {
        if (yieldItem.animal?.type === "Cow") {
          acc.cowMilk += Number(yieldItem.quantity);
        } else if (yieldItem.animal?.type === "Goat") {
          acc.goatMilk += Number(yieldItem.quantity);
        } else if (yieldItem.animal?.type === "Hen") {
          acc.henEggs += Number(yieldItem.quantity);
        }
        return acc;
      },
      { cowMilk: 0, goatMilk: 0, henEggs: 0 }
    );
  };

  const todayYields = calculateTotalsByType(yields);

  // Get recent notifications
  const recentNotifications = notifications.slice(0, 3);
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  // Get fencing alerts
  const fencingAlerts = notifications.filter((n: any) => n.title === "Fencing Alert").slice(0, 3);
  const nightReturnAlerts = notifications.filter((n: any) => n.title === "Night Return Alert").slice(0, 3);

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
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Overview</h1>
              {user?.farm_id ? (
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-green-700">{dashboard.farmInfo?.name}</span>
                  {dashboard.farmInfo?.location && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{dashboard.farmInfo?.location}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <Building2 className="h-5 w-5 animate-pulse" />
                  <span className="text-gray-500">Loading farm information...</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 space-y-10">
            {/* Quick Stats Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Stats</h2>
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
                    <Link to="/dashboard/health">
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        View Vet Care
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
                        <CardTitle className="text-sm font-medium">Night Check Status</CardTitle>
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

            {/* Alerts & Notifications Section - Only for admin and user roles */}
            {(user?.role === 'admin' || user?.role === 'user') && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Recent Notifications */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{notifications.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {unreadNotifications} unread
                      </p>
                      {recentNotifications.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {recentNotifications.map((notification: any, idx: number) => (
                            <div key={notification._id} className="text-xs p-2 bg-gray-50 rounded">
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-gray-600 truncate">{notification.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Fencing Alerts */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Watchguard Alerts</CardTitle>
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{fencingAlerts.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recent boundary alerts
                      </p>
                      {fencingAlerts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {fencingAlerts.map((alert: any, idx: number) => (
                            <div key={alert._id} className="text-xs p-2 bg-yellow-50 rounded border border-yellow-200">
                              <div className="font-medium text-yellow-800">Fencing Alert</div>
                              <div className="text-yellow-700 truncate">{alert.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link to="/dashboard/fencing-alerts">
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          View Watchguard
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Night Check Alerts */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Night Check Alerts</CardTitle>
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{nightReturnAlerts.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Missing animals alerts
                      </p>
                      {user?.role === 'admin' && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Scheduled: {nightCheckSchedule}
                        </div>
                      )}
                      {nightReturnAlerts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {nightReturnAlerts.map((alert: any, idx: number) => (
                            <div key={alert._id} className="text-xs p-2 bg-red-50 rounded border border-red-200">
                              <div className="font-medium text-red-800">Night Return Alert</div>
                              <div className="text-red-700 truncate">{alert.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link to="/dashboard/night-returns">
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          View Night Check
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Farm Management Section for Admins */}
            {user?.role === 'admin' && user?.farm_id && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Farm Management</h2>
                <div className="grid gap-4 md:grid-cols-2">
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

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900">Night Check Schedule</CardTitle>
                      <CardDescription className="text-green-700">
                        Automated night return monitoring
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-700" />
                        <span className="text-lg font-semibold text-green-800">{nightCheckSchedule}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Automatic checks run daily at this time
                      </p>
                      <Link to="/dashboard/night-returns">
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          Manage Schedule
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
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

            {/* Quick Actions Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/dashboard/animals">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-semibold">Manage Livestock</div>
                          <div className="text-sm text-muted-foreground">Add, edit, view animals</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/dashboard/health">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <HeartPulse className="h-8 w-8 text-red-600" />
                        <div>
                          <div className="font-semibold">Vet Care</div>
                          <div className="text-sm text-muted-foreground">Health records & medications</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {user?.role !== 'veterinarian' && (
                  <>
                    <Link to="/dashboard/yields">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div>
                              <div className="font-semibold">Production</div>
                              <div className="text-sm text-muted-foreground">Track yields & output</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/dashboard/night-returns">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Moon className="h-8 w-8 text-purple-600" />
                            <div>
                              <div className="font-semibold">Night Check</div>
                              <div className="text-sm text-muted-foreground">Monitor returns</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
