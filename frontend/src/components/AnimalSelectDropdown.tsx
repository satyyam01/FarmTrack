import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Animal } from "@/types/animal";

interface AnimalSelectDropdownProps {
  animals: Animal[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AnimalSelectDropdown({
  animals,
  value,
  onChange,
  placeholder = "Select an animal",
  disabled = false,
}: AnimalSelectDropdownProps) {
  const [search, setSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (popoverOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [popoverOpen]);

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

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          aria-expanded={popoverOpen}
          disabled={disabled}
        >
          {value
            ? (() => {
                const animal = animals.find(a => String(a.id) === value || String(a._id) === value || a.tag_number === value);
                return animal ? `${animal.name} (${animal.tag_number})` : placeholder;
              })()
            : placeholder}
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
        <div
          className="max-h-60 overflow-y-auto pointer-events-auto"
          tabIndex={0}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {Object.entries(filteredGroupedAnimals).length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground">No animals found</div>
          )}
          {Object.entries(filteredGroupedAnimals).map(([type, list]) => (
            <div key={type}>
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase bg-muted sticky top-0 z-10">{type}</div>
              {list.map(animal => (
                <button
                  key={animal.id || animal._id}
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none ${value === String(animal.id) || value === String(animal._id) || value === animal.tag_number ? 'bg-accent' : ''}`}
                  onClick={() => {
                    onChange(animal.tag_number);
                    setPopoverOpen(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onChange(animal.tag_number);
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
  );
} 