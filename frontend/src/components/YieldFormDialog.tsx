import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Animal } from "../types/animal";
import { animalApi } from "../services/api";
import { toast } from "sonner";
import { YieldFormData } from "@/types/yield";

interface YieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: YieldFormData) => void;
}

export function YieldFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: YieldFormDialogProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAnimals();
      // Reset form when dialog opens
      setSelectedAnimal("");
      setQuantity("");
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const fetchAnimals = async () => {
    try {
      setIsLoading(true);
      const data = await animalApi.getAll();
      // Filter animals that have had a pregnancy
      const filteredAnimals = data.filter(animal => 
        animal.is_producing_yield === true
      );
      setAnimals(filteredAnimals);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast.error("Failed to fetch animals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnimal) {
      toast.error("Please select an animal");
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const selectedAnimalData = animals.find(a => a.id.toString() === selectedAnimal);
    if (!selectedAnimalData) {
      toast.error("Selected animal not found");
      return;
    }

    const unitType = selectedAnimalData.type === 'Cow' || selectedAnimalData.type === 'Goat' ? 'milk' : 'egg';
    console.log('Selected animal type:', selectedAnimalData.type, 'Unit type:', unitType);

    setIsSubmitting(true);
    try {
      const formData: YieldFormData = {
        animal_id: Number(selectedAnimal),
        quantity: Number(quantity),
        date,
        unit_type: unitType
      };
      console.log('Submitting form data:', formData);

      await onSubmit(formData);
      console.log('Form submission successful');
    } catch (error) {
      console.error("Error submitting yield:", error);
      toast.error("Failed to add yield. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Yield</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animal">Animal</Label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading animals..." : "Select an animal"} />
              </SelectTrigger>
              <SelectContent>
                {animals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id.toString()}>
                    {animal.name} ({animal.tag_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Adding..." : "Add Yield"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 