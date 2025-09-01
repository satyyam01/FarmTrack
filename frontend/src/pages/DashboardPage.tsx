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
  TrendingUp,
  Sparkles,
  Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { AnimalsPage } from "./AnimalsPage";

function UpgradeToProModal({ open, onOpenChange, farmId, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, farmId: string, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create order
      const res = await api.post("/payments/create-order", { farmId, amount: 99 });
      const order = res.data.order;
      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FarmTrack Pro",
        description: "Upgrade to Pro",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              farmId,
              amount: 99,
            });
            if (verifyRes.data.success) {
              onOpenChange(false);
              onSuccess();
            } else {
              setError("Payment verification failed!");
            }
          } catch (err) {
            setError("Payment verification failed!");
          }
        },
        prefill: {},
        theme: { color: "#f59e42" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <Card className="bg-white/95 border-yellow-300">
          <CardHeader className="flex flex-col items-center pb-2">
            <Badge variant="default" className="mb-2 bg-yellow-400 text-yellow-900">Pro</Badge>
            <CardTitle className="text-2xl text-yellow-800 flex items-center gap-2 font-bold">
              <Star className="h-7 w-7 text-yellow-600" /> Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-yellow-700 mt-2 font-medium text-center">
              <span className="text-lg font-bold">Just ₹99/month</span>
              <br />
              <span className="text-yellow-800">Unlock all premium features for your farm:</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-none space-y-3 mb-6 mt-2">
              <li className="flex items-center gap-2 text-yellow-900 font-medium"><Sparkles className="h-5 w-5 text-yellow-500" /> Multiple user roles (vet, worker)</li>
              <li className="flex items-center gap-2 text-yellow-900 font-medium"><Sparkles className="h-5 w-5 text-yellow-500" /> Add more than 10 animals</li>
              <li className="flex items-center gap-2 text-yellow-900 font-medium"><Sparkles className="h-5 w-5 text-yellow-500" /> RAG AI assistant</li>
            </ul>
            {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
            <Button onClick={handlePay} disabled={loading} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold w-full shadow text-base py-3">
              {loading ? "Processing..." : "Pay with Razorpay"}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

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

  // After fetching dashboard, add a refresh function
  const refreshDashboard = async () => {
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

  // Use new backend fields for daily, weekly, monthly yields
  const dailyMilk = yields?.daily?.milk || 0;
  const dailyEgg = yields?.daily?.egg || 0;
  const weeklyMilk = yields?.weekly?.milk || 0;
  const weeklyEgg = yields?.weekly?.egg || 0;
  const monthlyMilk = yields?.monthly?.milk || 0;
  const monthlyEgg = yields?.monthly?.egg || 0;

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
                  {dashboard.farmInfo && (
                    dashboard.farmInfo.isPremium ? (
                      <Badge variant="default" className="bg-yellow-400 text-yellow-900 flex items-center gap-1 mr-2">Pro <Star className="h-4 w-4 ml-1" /></Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 mr-2">Basic</Badge>
                    )
                  )}
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
            {/* Upgrade to Pro Promo */}
            {dashboard.farmInfo && !dashboard.farmInfo.isPremium && (
              <Card className="mb-6 border-yellow-300 bg-white/95">
                <CardHeader className="flex flex-row items-center gap-4 p-6">
                  <div className="flex flex-col items-start flex-1">
                    <Badge variant="default" className="mb-2 bg-yellow-400 text-yellow-900">Pro</Badge>
                    <CardTitle className="text-2xl text-yellow-800 flex items-center gap-2 font-bold">
                      <TrendingUp className="h-7 w-7 text-yellow-600" />
                      Upgrade to Pro
                    </CardTitle>
                    <CardDescription className="text-yellow-700 mt-2 font-medium">
                      <span className="text-lg font-bold">Just ₹99/month</span>
                      <br />
                      <span className="text-yellow-800">Unlock premium features for your farm.</span>
                    </CardDescription>
                  </div>
                  <Button variant="default" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold shadow text-base px-6 py-3" onClick={() => setUpgradeModalOpen(true)}>
                    Upgrade Now
                  </Button>
                </CardHeader>
              </Card>
            )}
            <UpgradeToProModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} farmId={dashboard.farmInfo?.subscription ? dashboard.farmInfo.subscription : user?.farm_id} onSuccess={refreshDashboard} />
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
                        <CardTitle className="text-sm font-medium">Milk Production (Today)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{dailyMilk.toFixed(2)} L</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Egg Production (Today)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{dailyEgg.toFixed(0)} eggs</div>
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
            {user && user.role === 'admin' && user.farm_id && dashboard.farmInfo?.isPremium && (
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
                          <span className="text-sm text-muted-foreground">Milk</span>
                          <span className="font-medium">{weeklyMilk.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Eggs</span>
                          <span className="font-medium">{weeklyEgg.toFixed(0)}</span>
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
                          <span className="text-sm text-muted-foreground">Milk</span>
                          <span className="font-medium">{monthlyMilk.toFixed(2)} L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Eggs</span>
                          <span className="font-medium">{monthlyEgg.toFixed(0)}</span>
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
      {/* Only show assistant widget for Pro farms */}
      
    </div>
  );
}
