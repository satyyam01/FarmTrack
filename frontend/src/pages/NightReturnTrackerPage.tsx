import { useState, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { 
  Moon, 
  Clock, 
  Play, 
  Settings, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Users,
  Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Animal } from "@/types/animal";
import { animalApi } from "@/services/api";
import { returnLogApi, ReturnLog } from "@/services/api";
import { notificationApi, Notification } from "@/services/notificationApi";
import { settingsApi } from "@/services/settingsApi";

export function NightReturnTrackerPage() {
  const [date, setDate] = useState<string>(getTodayLocal());
  const [tagId, setTagId] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [returnLogs, setReturnLogs] = useState<ReturnLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState("21:00"); // Default 9 PM

  // Format date for display
  const formattedDate = date ? format(parseISO(date), "MMMM d, yyyy") : "";

  // Helper to get today's date in YYYY-MM-DD
  function getTodayLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper to go to previous/next day
  function goToPrevDay() {
    setDate(prev => {
      const prevDate = format(addDays(parseISO(prev), -1), 'yyyy-MM-dd');
      return prevDate;
    });
  }
  
  function goToNextDay() {
    setDate(prev => {
      const nextDate = format(addDays(parseISO(prev), 1), 'yyyy-MM-dd');
      return nextDate;
    });
  }

  // Load animals, return logs, notifications, and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [animalsData, returnLogsData, notificationsData, scheduleData] = await Promise.all([
          animalApi.getAll(),
          returnLogApi.getByDate(date),
          notificationApi.getNightReturnAlerts(),
          settingsApi.getNightCheckSchedule()
        ]);
        
        setAnimals(animalsData);
        setReturnLogs(returnLogsData);
        setNotifications(notificationsData);
        setScheduledTime(scheduleData.schedule);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [date]);

  useEffect(() => {
    // Get user role from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(user?.role || null);
    } catch {
      setUserRole(null);
    }
  }, []);

  // Handle schedule time change
  const handleScheduleChange = async (newTime: string) => {
    if (userRole !== 'admin') {
      toast.error("Only farm owners can change the schedule");
      return;
    }

    try {
      setIsUpdatingSchedule(true);
      const result = await settingsApi.updateNightCheckSchedule(newTime);
      setScheduledTime(result.schedule);
      toast.success(result.message);
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast.error(error?.response?.data?.error || "Failed to update schedule");
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  // Run manual night check
  const handleRunNightCheck = async () => {
    if (userRole !== 'admin') {
      toast.error("Only farm owners can run night checks");
      return;
    }

    try {
      setIsChecking(true);
      const result = await notificationApi.runNightCheck();
      toast.success(result.message);
      
      // Refresh notifications
      const newNotifications = await notificationApi.getNightReturnAlerts();
      setNotifications(newNotifications);
      
      // Immediately refresh the notification bell
      if ((window as any).refreshNotifications) {
        (window as any).refreshNotifications();
      }
    } catch (error: any) {
      console.error("Error running night check:", error);
      toast.error(error?.response?.data?.error || "Failed to run night check");
    } finally {
      setIsChecking(false);
    }
  };

  // Helper to get animal id from log (handles both string and populated object)
  const getAnimalIdFromLog = (log: any): string => {
    if (typeof log.animal_id === 'object' && log.animal_id !== null) {
      return String(log.animal_id._id);
    }
    return String(log.animal_id);
  };

  // Get animals that haven't returned for the selected date
  const getMissingAnimals = () => {
    const dateStr = date;
    const returnedAnimalIds = returnLogs
      .filter(log => log.date && log.date.slice(0, 10) === dateStr && log.returned === true)
      .map(log => getAnimalIdFromLog(log));
    
    return animals.filter(animal => {
      const animalId = String(animal._id || animal.id);
      return !returnedAnimalIds.includes(animalId);
    });
  };

  // Get animals that have returned for the selected date
  const getReturnedAnimals = () => {
    const dateStr = date;
    const returnedAnimalIds = returnLogs
      .filter(log => log.date && log.date.slice(0, 10) === dateStr && log.returned === true)
      .map(log => getAnimalIdFromLog(log));
    
    return animals.filter(animal => {
      const animalId = String(animal._id || animal.id);
      return returnedAnimalIds.includes(animalId);
    });
  };

  // Group animals by type
  const groupAnimalsByType = (animalList: Animal[]) => {
    return animalList.reduce((acc, animal) => {
      if (!acc[animal.type]) {
        acc[animal.type] = [];
      }
      acc[animal.type].push(animal);
      return acc;
    }, {} as Record<string, Animal[]>);
  };

  // Get both missing and returned animals grouped by type
  const missingAnimalsByType = groupAnimalsByType(getMissingAnimals());
  const returnedAnimalsByType = groupAnimalsByType(getReturnedAnimals());

  // Handle marking an animal as returned
  const handleMarkAsReturned = async () => {
    if (!tagId.trim()) {
      toast.error("Please enter a tag number");
      return;
    }

    // Check permissions: only admin and farm_worker can mark as returned
    if (userRole !== 'admin' && userRole !== 'farm_worker') {
      toast.error("You don't have permission to mark animals as returned");
      return;
    }

    try {
      const animal = animals.find(a => a.tag_number === tagId.trim());
      if (!animal) {
        toast.error("Animal not found with this tag number");
        return;
      }

      const animalId = String(animal._id || animal.id);
      const dateStr = date;
      
      // Check if already marked as returned
      const existingLog = returnLogs.find(
        log => getAnimalIdFromLog(log) === animalId && log.date && log.date.slice(0, 10) === dateStr
      );

      if (existingLog && existingLog.returned) {
        toast.error(`${animal.name} is already marked as returned`);
        return;
      }

      if (existingLog) {
        // Update existing log
        const logId = existingLog._id || existingLog.id;
        if (!logId) {
          toast.error("Invalid return log ID");
          return;
        }
        await returnLogApi.update(String(logId), { returned: true });
        setReturnLogs(prev => prev.map(log => 
          (log._id || log.id) === logId ? { ...log, returned: true } : log
        ));
      } else {
        // Create new log
        const newLog = await returnLogApi.create({
          animal_id: animalId,
          date: dateStr,
          returned: true
        });
        setReturnLogs(prev => [...prev, newLog]);
      }

      toast.success(`${animal.name} has been marked as returned`);
      setTagId("");
    } catch (error: any) {
      console.error("Error marking animal as returned:", error);
      toast.error(error?.response?.data?.error || error?.message || "Failed to mark animal as returned");
    }
  };

  const handleMarkAsNotReturned = async (animal: Animal) => {
    // Check permissions: only admin can mark as not returned
    if (userRole !== 'admin') {
      toast.error("Only farm owners can mark animals as not returned");
      return;
    }

    try {
      const dateStr = date;
      const animalId = String(animal._id || animal.id);
      
      const existingLog = returnLogs.find(
        log => getAnimalIdFromLog(log) === animalId && log.date && log.date.slice(0, 10) === dateStr
      );

      if (existingLog) {
        const logId = existingLog._id || existingLog.id;
        if (!logId) {
          toast.error("Invalid return log ID");
          return;
        }
        await returnLogApi.delete(String(logId));
        setReturnLogs(prev => prev.filter(log => (log._id || log.id) !== logId));
        toast.success(`${animal.name} has been marked as not returned`);
      }
    } catch (error: any) {
      console.error("Error marking animal as not returned:", error);
      toast.error(error?.response?.data?.error || error?.message || "Failed to mark animal as not returned");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMarkAsReturned();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading night return data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Moon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Night Return Tracker</h1>
          </div>
        </div>
      </div>

      {/* Night Check Configuration Card - Only show for admin */}
      {userRole === 'admin' && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Run Night Check</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Check Time</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={scheduledTime} 
                    onValueChange={handleScheduleChange}
                    disabled={isUpdatingSchedule}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your daily night return check is set for {scheduledTime === '21:00' ? '9:00 PM' : scheduledTime}
                </p>
                {isUpdatingSchedule && (
                  <p className="text-xs text-blue-600">Updating schedule...</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Manual Check</label>
                <Button 
                  onClick={handleRunNightCheck} 
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Check...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Check Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Info Card - Show for non-admin users */}
      {userRole !== 'admin' && (
        <Card className="border-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Night Check Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Daily night return check is scheduled for {scheduledTime === '21:00' ? '9:00 PM' : scheduledTime}
              {userRole === 'user' && ' (View only)'}
              {userRole === 'farm_worker' && ' (You can mark animals as returned)'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Animals</span>
            </div>
            <p className="text-2xl font-bold">{animals.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Returned</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{getReturnedAnimals().length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Not Returned</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{getMissingAnimals().length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Alerts</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 items-center">
              <Input
                id="date-filter"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-[160px]"
              />
              <Button variant="outline" size="icon" onClick={goToPrevDay} aria-label="Previous day">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextDay} aria-label="Next day">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDate(getTodayLocal())}>
                Today
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Return Entry - Only show for admin and farm_worker */}
      {(userRole === 'admin' || userRole === 'farm_worker') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Return Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter animal tag number to mark as returned"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleMarkAsReturned}>
                Mark Returned
              </Button>
            </div>
            {userRole === 'farm_worker' && (
              <p className="text-xs text-muted-foreground mt-2">
                You can only mark animals as returned. Only farm owners can mark animals as not returned.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Recent Night Return Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">{notification.title}</p>
                      <p className="text-sm text-yellow-700 mt-1">{notification.message}</p>
                      <p className="text-xs text-yellow-600 mt-2">
                        {format(parseISO(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          New
                        </Badge>
                      )}
                      {userRole === 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await notificationApi.delete(notification._id);
                              toast.success("Alert deleted successfully");
                              // Refresh notifications
                              const newNotifications = await notificationApi.getNightReturnAlerts();
                              setNotifications(newNotifications);
                            } catch (error) {
                              console.error("Error deleting notification:", error);
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Animal Status by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Animals */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Missing Animals ({getMissingAnimals().length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(missingAnimalsByType).length > 0 ? (
              Object.entries(missingAnimalsByType).map(([type, animals]) => (
                <div key={type} className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{type}s</h4>
                  <div className="space-y-2">
                    {animals.map((animal) => (
                      <div key={animal._id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{animal.name}</p>
                          <p className="text-sm text-muted-foreground">Tag: {animal.tag_number}</p>
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Missing
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                All animals have returned! 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {/* Returned Animals */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Returned Animals ({getReturnedAnimals().length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(returnedAnimalsByType).length > 0 ? (
              Object.entries(returnedAnimalsByType).map(([type, animals]) => (
                <div key={type} className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{type}s</h4>
                  <div className="space-y-2">
                    {animals.map((animal) => (
                      <div key={animal._id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{animal.name}</p>
                          <p className="text-sm text-muted-foreground">Tag: {animal.tag_number}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Returned
                          </Badge>
                          {userRole === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsNotReturned(animal)}
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              Not Returned
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No animals have returned yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}