import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ShieldAlert, PawPrint, RefreshCw } from "lucide-react";
import { notificationApi } from "@/services/notificationApi";
import { Animal } from "@/types/animal";
import { animalApi, alertApi } from "@/services/api";
import { toast } from "sonner";
import { AnimalSelectDropdown } from "@/components/AnimalSelectDropdown";

export function FencingAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagNumber, setTagNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch fencing alerts
  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const all = await notificationApi.getAll();
      setAlerts(all.filter((n) => n.title === "Fencing Alert"));
    } catch (error) {
      toast.error("Failed to load fencing alerts");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch animals for tag suggestions
  const fetchAnimals = async () => {
    try {
      const data = await animalApi.getAll();
      setAnimals(data);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchAnimals();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(user?.role || null);
    } catch {
      setUserRole(null);
    }
  }, []);

  // Manually trigger a fencing alert
  const handleTriggerAlert = async () => {
    if (!tagNumber.trim()) {
      toast.error("Please enter a tag number");
      return;
    }

    // Check permissions: only admin can trigger alerts
    if (userRole !== 'admin') {
      toast.error("Only farm owners can trigger fencing alerts");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await alertApi.triggerFencingAlert(tagNumber);
      toast.success(result.message);
      setTagNumber("");
      fetchAlerts();
      
      // Immediately refresh the notification bell
      if ((window as any).refreshNotifications) {
        (window as any).refreshNotifications();
      }
    } catch (error: any) {
      console.error("Error triggering alert:", error);
      toast.error(error?.response?.data?.error || "Failed to trigger alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ShieldAlert className="h-6 w-6 text-yellow-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fencing Alerts</h1>
            <p className="text-muted-foreground">Monitor and test animal boundary alerts</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAlerts}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Trigger Fencing Alert and Fencing Alerts List Side by Side */}
      {userRole === 'admin' ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Trigger Fencing Alert Card */}
          <Card className="bg-muted/40 border border-muted-200 w-full md:w-[500px] flex-shrink-0">
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-2">
                <PawPrint className="h-5 w-5 text-primary" />
                <span className="font-semibold">Trigger Fencing Alert (Test)</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-64">
                  <AnimalSelectDropdown
                    animals={animals}
                    value={tagNumber}
                    onChange={setTagNumber}
                    placeholder="Select animal by name or tag"
                    disabled={isSubmitting}
                  />
                </div>
                <Button onClick={handleTriggerAlert} disabled={isSubmitting}>
                  {isSubmitting ? "Triggering..." : "Trigger Alert"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This will create a fencing alert for the selected animal in your farm.
              </p>
            </CardContent>
          </Card>
          {/* Fencing Alerts List Card */}
          <Card className="flex-1 bg-muted/40 border border-muted-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-yellow-700" />
                <span className="font-semibold">Recent Fencing Alerts</span>
              </div>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading fencing alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No fencing alerts found.</div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map(alert => (
                    <div key={alert._id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-800">{alert.message}</p>
                        <p className="text-xs text-yellow-600 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">New</Badge>
                        )}
                        {userRole === 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await notificationApi.delete(alert._id);
                                toast.success("Alert deleted successfully");
                                fetchAlerts();
                              } catch (error) {
                                console.error("Error deleting alert:", error);
                                toast.error("Failed to delete alert");
                              }
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Non-admin users see only the alerts list as before
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-700" />
              Recent Fencing Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading fencing alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No fencing alerts found.</div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 10).map(alert => (
                  <div key={alert._id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-800">{alert.message}</p>
                      <p className="text-xs text-yellow-600 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 