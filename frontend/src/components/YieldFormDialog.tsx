import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Animal } from "@/types/animal";
import { animalApi } from "@/services/api";
import { YieldFormData } from "@/types/yield";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

interface YieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: YieldFormData) => void;
}

// Helper to get today's date in local time (YYYY-MM-DD)
function getTodayLocal(): string {
  const now = new Date();
  // Use local year, month, day (no offset)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function YieldFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: YieldFormDialogProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayLocal());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchAnimals();
      // Reset form when dialog opens
      setSelectedAnimal("");
      setQuantity("");
      setDate(getTodayLocal());
    }
  }, [open]);

  // Focus search input when popover opens
  useEffect(() => {
    if (popoverOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [popoverOpen]);

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
      toast.error("Failed to fetch animals");
    } finally {
      setIsLoading(false);
    }
  };

  // Group animals by type
  const groupedAnimals = useMemo(() => {
    const groups: { [type: string]: Animal[] } = {};
    animals.forEach(animal => {
      if (!groups[animal.type]) groups[animal.type] = [];
      groups[animal.type].push(animal);
    });
    return groups;
  }, [animals]);

  // Filter animals by search
  const filteredGroupedAnimals = useMemo(() => {
    if (!search.trim()) return groupedAnimals;
    const lower = search.toLowerCase();
    const filtered: { [type: string]: Animal[] } = {};
    Object.entries(groupedAnimals).forEach(([type, list]) => {
      const filteredList = list.filter(animal =>
        animal.name.toLowerCase().includes(lower) ||
        animal.tag_number.toLowerCase().includes(lower)
      );
      if (filteredList.length > 0) filtered[type] = filteredList;
    });
    return filtered;
  }, [groupedAnimals, search]);

  const handleSubmit = async () => {
    if (!selectedAnimal) {
      toast.error("Please select an animal");
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const selectedAnimalData = animals.find(a => String(a.id) === selectedAnimal);
    if (!selectedAnimalData) {
      toast.error("Selected animal not found");
      return;
    }

    const unitType = selectedAnimalData.type === 'Cow' || selectedAnimalData.type === 'Goat' ? 'milk' : 'egg';

    setIsSubmitting(true);
    try {
      const formData: YieldFormData = {
        animal_id: selectedAnimal,
        quantity: Number(quantity),
        date: date,
        unit_type: unitType
      };

      await onSubmit(formData);
    } catch (error) {
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
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  aria-expanded={popoverOpen}
                >
                  {isLoading
                    ? "Loading animals..."
                    : selectedAnimal
                      ? (() => {
                          const animal = animals.find(a => String(a.id) === selectedAnimal);
                          return animal ? `${animal.name} (${animal.tag_number})` : "Select an animal";
                        })()
                      : "Select an animal"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px]">
                <div className="p-2 border-b">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search by name or tag"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {Object.entries(filteredGroupedAnimals).length === 0 && (
                    <div className="px-4 py-6 text-center text-muted-foreground">No animals found</div>
                  )}
                  {Object.entries(filteredGroupedAnimals).map(([type, list]) => (
                    <div key={type}>
                      <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase bg-muted sticky top-0 z-10">{type}</div>
                      {list.map(animal => (
                        <button
                          key={animal.id}
                          type="button"
                          className={`w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none ${selectedAnimal === String(animal.id) ? 'bg-accent' : ''}`}
                          onClick={() => {
                            setSelectedAnimal(String(animal.id));
                            setPopoverOpen(false);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedAnimal(String(animal.id));
                              setPopoverOpen(false);
                            }
                          }}
                        >
                          {animal.name} ({animal.tag_number})
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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