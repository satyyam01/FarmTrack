import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import simulationApi from "@/services/simulationApi";
import { Cpu, Search, Info } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { animalApi } from "@/services/api";

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
    { value: "kg", label: "kg (Other)" },
];

export function SimulationPage() {
  const [tagNumber, setTagNumber] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [payloadQuantity, setPayloadQuantity] = useState<string>("");
  const [payloadUnit, setPayloadUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [availableAnimals, setAvailableAnimals] = useState<any[]>([]);
  const [showAnimalSuggestions, setShowAnimalSuggestions] = useState<boolean>(false);
  const { user } = useUser();

  // Fetch available animals for this farm
  useEffect(() => {
    const fetchAnimals = async () => {
    try {
        const animals = await animalApi.getAll();
        setAvailableAnimals(animals);
      } catch (error) {
        console.error("Error fetching animals:", error);
        toast.error("Failed to load farm animals");
      }
    };

    if (user?.farm_id) {
      fetchAnimals();
    }
  }, [user?.farm_id]);

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

  useEffect(() => {
    // Set payloadUnit automatically based on selectedLocation
    if (selectedLocation === "MILKING_STATION") {
      setPayloadUnit("Liters");
    } else if (selectedLocation === "EGG_COLLECTION") {
      setPayloadUnit("Count");
    } else {
      setPayloadUnit("");
    }
  }, [selectedLocation]);

  // Filter animals based on tag number input
  const filteredAnimals = availableAnimals.filter(animal =>
    animal.tag_number?.toLowerCase().includes(tagNumber.toLowerCase()) ||
    animal.name?.toLowerCase().includes(tagNumber.toLowerCase())
  );

  const handleAnimalSelect = (animal: any) => {
    setTagNumber(animal.tag_number);
    setShowAnimalSuggestions(false);
  };

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
      
      // Clear form after successful simulation
      setTagNumber("");
      setPayloadQuantity("");
      setSelectedLocation("");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
      toast.error(`Simulation Failed: ${errorMessage}`);
      setLastResponse(`Error: ${errorMessage}\n${JSON.stringify(error?.response?.data || {}, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showPayload = ["MILKING_STATION", "EGG_COLLECTION"].includes(selectedLocation);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <Card className="w-full max-w-lg shadow-xl rounded-2xl border bg-white/90">
          <CardHeader className="space-y-2 text-center border-b pb-4">
            <div className="flex justify-center mb-2">
              <Cpu className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">RFID Scan Simulator</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Only admins can access the simulation page.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-w-md mx-auto p-6 bg-muted/40 rounded text-lg text-muted-foreground text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>Only farm administrators can access the RFID simulation tools.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border bg-white/90">
        <CardHeader className="space-y-2 text-center border-b pb-4">
          <div className="flex justify-center mb-2">
            <Cpu className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">RFID Scan Simulator</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Simulate RFID scan events for animals in your farm
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSimulateScan(); }}>
            <div className="space-y-2">
              <Label htmlFor="tagNumber">
                RFID Tag Number <span className="text-xs text-muted-foreground">[Simulation Only]</span>
              </Label>
              <div className="relative w-full">
              <Input 
                id="tagNumber" 
                  placeholder="Enter tag number or animal name..." 
                value={tagNumber}
                  onChange={(e) => {
                    setTagNumber(e.target.value);
                    setShowAnimalSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowAnimalSuggestions(tagNumber.length > 0)}
                disabled={isLoading}
              />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                
                {/* Animal suggestions */}
                {showAnimalSuggestions && filteredAnimals.length > 0 && (
                  <div className="absolute z-10 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredAnimals.slice(0, 5).map((animal) => (
                      <div
                        key={animal.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleAnimalSelect(animal)}
                      >
                        <div className="font-medium">{animal.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Tag: {animal.tag_number} • Type: {animal.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Available animals info */}
              {availableAnimals.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {availableAnimals.length} animals available in your farm
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Scan Location</Label>
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
                    step="0.1"
                    placeholder="e.g., 8.5 or 1"
                    value={payloadQuantity}
                    onChange={(e) => setPayloadQuantity(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-muted text-sm flex items-center">
                    {payloadUnit}
                  </div>
                </div>
              </div>
            )}

            {lastResponse && (
              <div className="p-4 border rounded-md bg-muted">
                <Label className="block text-sm font-medium mb-2">Last API Response:</Label>
                <pre className="text-xs whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                  <code>{lastResponse}</code>
                </pre>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full text-base font-semibold">
              {isLoading ? "Simulating..." : "Simulate Scan"}
            </Button>

            {isLoading && (
              <div className="pt-2">
                <Progress value={progressValue} className="w-full" />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 