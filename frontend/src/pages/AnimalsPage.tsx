import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { AnimalCard } from "../components/AnimalCard";
import { AnimalFormDialog } from "../components/AnimalFormDialog";
import { Animal, AnimalFormData, AnimalType } from "../types/animal";
import { animalApi } from "../services/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

// Helper function to group animals by type
const groupAnimalsByType = (animals: Animal[]) => {
  const grouped: Record<AnimalType, Animal[]> = {
    Cow: [],
    Goat: [],
    Hen: []
  };

  animals.forEach(animal => {
    if (animal.type in grouped) {
      grouped[animal.type as AnimalType].push(animal);
    }
  });

  return grouped;
};

export function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [selectedType, setSelectedType] = useState<AnimalType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | undefined>(undefined);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch animals from API
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setIsLoading(true);
        const data = await animalApi.getAll();
        setAnimals(data);
        setFilteredAnimals(data);
      } catch (error) {
        console.error("Error fetching animals:", error);
        toast.error("Failed to load animals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  // Filter animals based on type and search query
  useEffect(() => {
    let result = animals;
    
    // Filter by type
    if (selectedType !== "all") {
      result = result.filter(animal => animal.type === selectedType);
    }
    
    // Filter by tag number
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(animal => 
        animal.tag_number.toLowerCase().includes(query)
      );
    }
    
    setFilteredAnimals(result);
  }, [animals, selectedType, searchQuery]);

  const handleAddAnimal = () => {
    setEditingAnimal(undefined);
    setIsDialogOpen(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (animal: Animal) => {
    setAnimalToDelete(animal);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!animalToDelete) return;
    
    try {
      await animalApi.delete(animalToDelete.id.toString());
      setAnimals(prev => prev.filter(animal => animal.id !== animalToDelete.id));
      toast.success("Animal deleted successfully");
    } catch (error) {
      console.error("Error deleting animal:", error);
      toast.error("Failed to delete animal");
    } finally {
      setIsDeleteDialogOpen(false);
      setAnimalToDelete(null);
    }
  };

  const handleSubmitAnimal = async (data: AnimalFormData) => {
    try {
      if (editingAnimal) {
        // Update existing animal
        const updatedAnimal = await animalApi.update(editingAnimal.id.toString(), data);
        setAnimals(prev => 
          prev.map(animal => 
            animal.id === editingAnimal.id ? updatedAnimal : animal
          )
        );
        toast.success("Animal updated successfully");
      } else {
        // Create new animal
        const newAnimal = await animalApi.create(data);
        setAnimals(prev => [...prev, newAnimal]);
        toast.success("Animal added successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving animal:", error);
      toast.error("Failed to save animal");
    }
  };

  // Render animal cards grouped by type
  const renderAnimalGroups = () => {
    const groupedAnimals = groupAnimalsByType(filteredAnimals);
    const animalTypes: AnimalType[] = ["Cow", "Goat", "Hen"];

    return animalTypes.map(type => {
      const animalsOfType = groupedAnimals[type];
      if (selectedType !== "all" && selectedType !== type) return null;
      if (animalsOfType.length === 0) return null;

      return (
        <div key={type} className="space-y-4">
          <h2 className="text-2xl font-semibold">{type}s</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animalsOfType.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                onEdit={handleEditAnimal}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Animals</h1>
        <Button onClick={handleAddAnimal}>Add Animal</Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
          <Select 
            value={selectedType} 
            onValueChange={(value) => setSelectedType(value as AnimalType | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Cow">Cow</SelectItem>
              <SelectItem value="Goat">Goat</SelectItem>
              <SelectItem value="Hen">Hen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by tag number"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading animals...</p>
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No animals found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderAnimalGroups()}
        </div>
      )}
      
      <AnimalFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitAnimal}
        animal={editingAnimal}
        title={editingAnimal ? "Edit Animal" : "Add Animal"}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the animal
              {animalToDelete && ` "${animalToDelete.name}"`} and all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
