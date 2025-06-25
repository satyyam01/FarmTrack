import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Animal } from "@/types/animal";
import { animalApi } from "@/services/api";
import { returnLogApi, ReturnLog } from "@/services/api";

export function NightReturnTrackerPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tagId, setTagId] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [returnLogs, setReturnLogs] = useState<ReturnLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format date for display
  const formattedDate = format(date, "MMMM d, yyyy");

  // Load animals and return logs
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [animalsData, returnLogsData] = await Promise.all([
          animalApi.getAll(),
          returnLogApi.getByDate(format(date, "yyyy-MM-dd"))
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

  // Get animals that haven't returned for the selected date
  const getMissingAnimals = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    // Get IDs of animals that have been marked as returned for this date
    const returnedAnimalIds = returnLogs
      .filter(log => log.date === dateStr && log.returned === true)
      .map(log => log.animal_id);
    
    // Return all animals that don't have a return log with returned=true for this date
    return animals.filter(animal => !returnedAnimalIds.includes(Number(animal.id)));
  };

  // Get animals that have returned for the selected date
  const getReturnedAnimals = () => {
    const dateStr = format(date, "yyyy-MM-dd");
    const returnedAnimalIds = returnLogs
      .filter(log => log.date === dateStr && log.returned === true)
      .map(log => log.animal_id);
    
    return animals.filter(animal => returnedAnimalIds.includes(Number(animal.id)));
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

      const dateStr = format(date, "yyyy-MM-dd");
      const existingLog = returnLogs.find(
        log => log.animal_id === Number(animal.id) && log.date === dateStr
      );

      if (existingLog) {
        // Update existing log
        await returnLogApi.update(existingLog.id, { returned: true });
        setReturnLogs(prev => 
          prev.map(log => 
            log.id === existingLog.id ? { ...log, returned: true } : log
          )
        );
      } else {
        // Create new log
        const newLog = await returnLogApi.create({
          animal_id: Number(animal.id),
          date: dateStr,
          returned: true
        });
        setReturnLogs(prev => [...prev, newLog]);
      }

      toast.success(`${animal.name} has been marked as returned`);
      setTagId("");
    } catch (error) {
      console.error("Error marking animal as returned:", error);
      toast.error("Failed to mark animal as returned");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Night Return Tracker</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                disabled={(date) => date > new Date()}
                initialFocus
                className="rounded-md border shadow"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                    "h-8 w-8 text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                  ),
                  day: cn(
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
                  ),
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Animals Summary */}
      <div className="flex flex-wrap gap-2">
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

      {/* Animal Return Logging Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Animal as Returned</CardTitle>
          <CardDescription>
            Enter the animal's tag ID to mark it as returned for {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Tag ID"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleMarkAsReturned();
                }
              }}
            />
            <Button onClick={handleMarkAsReturned} type="button">
              Mark as Returned
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animals Status Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      ) : animals.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No animals found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <CardFooter className="pt-0">
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Returned</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}