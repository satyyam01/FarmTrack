import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import simulationApi from "@/services/simulationApi"; // Import the simulation service

const locationOptions = [
  { value: "BARN_ENTRANCE", label: "Barn Entrance (Night Return)" },
  { value: "MILKING_STATION", label: "Milking Station (Yield)" },
  { value: "EGG_COLLECTION", label: "Egg Collection (Yield)" },
  { value: "HEALTH_CHECK_AREA", label: "Health Check Area (Info)" },
  { value: "GENERAL_IDENTIFICATION", label: "General ID Scan (Info)" },
];

// Define unit options for the dropdown
const unitOptions = [
    { value: "Liters", label: "Liters" },
    { value: "count", label: "Count" },
    { value: "kg", label: "kg (Other)" }, // Example, add more if needed
];

export function SimulationPage() {
  const [tagNumber, setTagNumber] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [payloadQuantity, setPayloadQuantity] = useState<string>("");
  const [payloadUnit, setPayloadUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isLoading) {
      setProgressValue(10);
      intervalId = setInterval(() => {
        setProgressValue((prev) => {
          const nextVal = prev + Math.random() * 15;
          return nextVal >= 95 ? 10 : nextVal;
        });
      }, 600);
    } else {
      setProgressValue(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  const handleSimulateScan = async () => {
    if (!tagNumber || !selectedLocation) {
      toast.error("Please enter a Tag Number and select a Location.");
      return;
    }

    setIsLoading(true);
    setLastResponse(null);

    let payload: any = undefined;
    if (["MILKING_STATION", "EGG_COLLECTION"].includes(selectedLocation) && payloadQuantity) {
      const quantity = parseFloat(payloadQuantity);
      if (isNaN(quantity)) {
        toast.error("Quantity must be a valid number.");
        setIsLoading(false);
        return;
      }
       if (!payloadUnit) {
         toast.error("Unit is required for yield scans.");
         setIsLoading(false);
         return;
       }
      payload = { quantity, unit: payloadUnit };
    }

    try {
      const params = { 
        tag_number: tagNumber,
        location_id: selectedLocation,
        payload
      };
      const response = await simulationApi.simulateScan(params);
      toast.success(`Simulation Successful: ${response.message}`);
      setLastResponse(JSON.stringify(response, null, 2));
    } catch (error: any) {
      toast.error(`Simulation Failed: ${error.message || "Unknown error"}`);
      setLastResponse(`Error: ${error.message || "Unknown error"}\n${JSON.stringify(error.errors || {}, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showPayload = ["MILKING_STATION", "EGG_COLLECTION"].includes(selectedLocation);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">RFID Scan Simulator</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simulate Scan Event</CardTitle>
          <CardDescription>
            Enter RFID Tag Number and select the location where the scan occurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagNumber">RFID Tag Number <div>[ONLY FOR SIMULATION]</div></Label>
            <Input 
              id="tagNumber" 
              placeholder="Enter tag number (e.g., YOUR_ANIMAL_TAG)" 
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Scan Location <div>[ONLY FOR SIMULATION]</div></Label>
            <Select 
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              disabled={isLoading}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a scan location..." />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {locationOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showPayload && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Yield)</Label>
                <Input 
                  id="quantity"
                  type="number"
                  placeholder="e.g., 8.5 or 1"
                  value={payloadQuantity}
                  onChange={(e) => setPayloadQuantity(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit (Yield)</Label>
                <Select 
                  value={payloadUnit}
                  onValueChange={setPayloadUnit} 
                  disabled={isLoading}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {unitOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button onClick={handleSimulateScan} disabled={isLoading} className="w-full">
            {isLoading ? "Simulating..." : "Simulate Scan"}
          </Button>

          {isLoading && (
              <div className="pt-2">
                 <Progress value={progressValue} className="w-full" />
              </div>
          )}

          {lastResponse && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
                <Label className="block text-sm font-medium mb-2">Last API Response:</Label>
                <pre className="text-xs whitespace-pre-wrap break-all"><code>{lastResponse}</code></pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 