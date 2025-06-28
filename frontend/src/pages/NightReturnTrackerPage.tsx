import { useState, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Animal } from "@/types/animal";
import { animalApi } from "@/services/api";
import { returnLogApi, ReturnLog } from "@/services/api";

export function NightReturnTrackerPage() {
  const [date, setDate] = useState<string>(getTodayLocal());
  const [tagId, setTagId] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [returnLogs, setReturnLogs] = useState<ReturnLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  // Load animals and return logs
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [animalsData, returnLogsData] = await Promise.all([
          animalApi.getAll(),
          returnLogApi.getByDate(date)
        ]);
        
        setAnimals(animalsData);
        setReturnLogs(returnLogsData);
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
    // Get IDs of animals that have been marked as returned for this date
    const returnedAnimalIds = returnLogs
      .filter(log => log.date && log.date.slice(0, 10) === dateStr && log.returned === true)
      .map(log => getAnimalIdFromLog(log));
    
    // Return all animals that don't have a return log with returned=true for this date
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
      toast.error("Please enter a tag ID");
      return;
    }

    try {
      const animal = animals.find(a => a.tag_number.toLowerCase() === tagId.toLowerCase());
      if (!animal) {
        toast.error("Animal not found");
        return;
      }

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
        await returnLogApi.update(String(logId), { returned: true });
        setReturnLogs(prev => 
          prev.map(log => 
            (log._id || log.id) === logId ? { ...log, returned: true } : log
          )
        );
      } else {
        await returnLogApi.create({
          animal_id: animalId,
          date: dateStr,
          returned: true
        });
        // Refetch logs to ensure UI is up to date
        const logs = await returnLogApi.getByDate(dateStr);
        setReturnLogs(logs);
      }

      toast.success(`${animal.name} has been marked as returned`);
      setTagId("");
    } catch (error: any) {
      console.error("Error marking animal as returned:", error);
      toast.error(error?.response?.data?.error || error?.message || "Failed to mark animal as returned");
    }
  };

  const handleMarkAsNotReturned = async (animal: Animal) => {
    try {
      const dateStr = date;
      const animalId = String(animal._id || animal.id);
      
      // Find the existing return log for this animal and date
      const existingLog = returnLogs.find(
        log => getAnimalIdFromLog(log) === animalId && log.date && log.date.slice(0, 10) === dateStr
      );

      if (existingLog) {
        const logId = existingLog._id || existingLog.id;
        if (!logId) {
          toast.error("Invalid return log ID");
          return;
        }
        // Delete the return log
        await returnLogApi.delete(String(logId));
        toast.success(`${animal.name} has been marked as not returned`);
        
        // Refetch logs to ensure UI is up to date
        const logs = await returnLogApi.getByDate(dateStr);
        setReturnLogs(logs);
      } else {
        toast.error("No return log found for this animal");
      }
    } catch (error: any) {
      console.error("Error marking animal as not returned:", error);
      toast.error(error?.response?.data?.error || error?.message || "Failed to mark animal as not returned");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl shadow-xl rounded-2xl border bg-white/90">
          <CardHeader className="space-y-2 text-center border-b pb-4">
            <div className="flex justify-center mb-2">
              <Moon className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Night Return Tracker</CardTitle>
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
      <Card className="w-full shadow-xl rounded-2xl border bg-white/90">
        <CardHeader className="space-y-2 text-center border-b pb-4">
          <div className="flex justify-center mb-2">
            <Moon className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Night Return Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {/* Date Selector and Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
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
            <div className="flex flex-wrap gap-2 justify-end">
              {Object.entries(missingAnimalsByType).map(([type, animals]) => (
                <Badge key={type} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {type}s: {animals.length} missing
                </Badge>
              ))}
              {Object.entries(returnedAnimalsByType).map(([type, animals]) => (
                <Badge key={type} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {type}s: {animals.length} returned
                </Badge>
              ))}
            </div>
          </div>

          {/* Mark as Returned Input (admin only) */}
          {userRole === 'admin' ? (
            <Card className="max-w-lg mx-auto border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Mark Animal as Returned</CardTitle>
                <CardDescription>for {formattedDate}.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); handleMarkAsReturned(); }} className="flex gap-2 items-center">
                  <Input
                    placeholder="Enter tag number"
                    value={tagId}
                    onChange={e => setTagId(e.target.value)}
                    className="w-40"
                  />
                  <Button type="submit">Mark Returned</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div>
            </div>
          )}

          {/* Animals Status Section */}
          {animals.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">No animals found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Not Returned Animals */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-red-600">Not Returned</h2>
                {Object.entries(missingAnimalsByType).map(([type, animals]) => (
                  <div key={type} className="space-y-4">
                    <h3 className="text-xl font-semibold">{type}s</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {animals.map(animal => (
                        <Card 
                          key={animal.id} 
                          className="border-red-400 hover:scale-105 transition-transform duration-200"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{animal.name}</CardTitle>
                            <CardDescription>{animal.tag_number}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gender:</span>
                                <span>{animal.gender}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Age:</span>
                                <span>{animal.age} years</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>Not returned</span>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Returned Animals */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-600">Returned</h2>
                {Object.entries(returnedAnimalsByType).map(([type, animals]) => (
                  <div key={type} className="space-y-4">
                    <h3 className="text-xl font-semibold">{type}s</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {animals.map(animal => (
                        <Card 
                          key={animal.id} 
                          className="border-green-400 hover:scale-105 transition-transform duration-200"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{animal.name}</CardTitle>
                            <CardDescription>{animal.tag_number}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gender:</span>
                                <span>{animal.gender}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Age:</span>
                                <span>{animal.age} years</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2 flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-green-500 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span>Returned</span>
                            </div>
                            {userRole === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsNotReturned(animal)}
                                className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                              >
                                Not Returned
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}