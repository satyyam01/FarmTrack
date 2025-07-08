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
import { PawPrint } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

// Helper function to group animals by type
const animalTypes: AnimalType[] = ["Cow", "Goat", "Hen", "Horse", "Sheep"];
const groupAnimalsByType = (animals: Animal[]) => {
  const grouped: Record<AnimalType, Animal[]> = {
    Cow: [],
    Goat: [],
    Hen: [],
    Horse: [],
    Sheep: []
  };
  animals.forEach(animal => {
    if (animal.type in grouped) {
      grouped[animal.type as AnimalType].push(animal);
    }
  });
  return grouped;
};

// Helper to get user role from localStorage
function getUserRole(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [animalLimit, setAnimalLimit] = useState(10);
  const [isPremium, setIsPremium] = useState(false);

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
    // Fetch farm info for animal limit and premium status
    async function fetchFarmInfo() {
      try {
        const res = await api.get("/dashboard/overview");
        setAnimalLimit(res.data.farmInfo?.animalLimit ?? 10);
        setIsPremium(res.data.farmInfo?.isPremium ?? false);
      } catch {
        setAnimalLimit(10);
        setIsPremium(false);
      }
    }
    fetchFarmInfo();
  }, []);

  // Get user role on component mount
  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  // Filter animals based on type and search query
  useEffect(() => {
    let result = animals;
    
    // Filter by type
    if (selectedType !== "all") {
      result = result.filter(animal => animal.type === selectedType);
    }
    
    // Filter by tag number or name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(animal => 
        animal.tag_number.toLowerCase().includes(query) ||
        animal.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredAnimals(result);
  }, [animals, selectedType, searchQuery]);

  const handleAddAnimal = () => {
    if (!isPremium && animals.length >= animalLimit) {
      setShowLimitAlert(true);
      return;
    }
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
      const animalId = (animalToDelete as any)._id || animalToDelete.id;
      await animalApi.delete(animalId.toString());
      setAnimals(prev => prev.filter(animal => {
        const currentId = (animal as any)._id || animal.id;
        return currentId !== animalId;
      }));
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
        const animalId = (editingAnimal as any)._id || editingAnimal.id;
        const updatedAnimal = await animalApi.update(animalId.toString(), data);
        setAnimals(prev => 
          prev.map(animal => {
            const currentId = (animal as any)._id || animal.id;
            return currentId === animalId ? updatedAnimal : animal;
          })
        );
        toast.success("Animal updated successfully");
      } else {
        // Create new animal
        const newAnimal = await animalApi.create(data);
        setAnimals(prev => [...prev, newAnimal]);
        toast.success("Animal added successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving animal:", error);
      if (error?.response?.data?.error && error.response.data.error.includes('Tag number')) {
        toast.error(error.response.data.error);
      } else {
      toast.error("Failed to save animal");
      }
    }
  };

  // Render animal cards grouped by type
  const renderAnimalGroups = () => {
    const groupedAnimals = groupAnimalsByType(filteredAnimals);
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
                key={(animal as any)._id || animal.id} 
                animal={animal} 
                onEdit={handleEditAnimal}
                onDelete={handleDeleteClick}
                userRole={userRole}
              />
            ))}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl">
          <div className="shadow-xl rounded-2xl border bg-white/90">
            <div className="space-y-2 text-center border-b pb-4 pt-6">
              <div className="flex justify-center mb-2">
                <PawPrint className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
            </div>
            <div className="p-8 flex flex-col items-center">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <div className="w-full max-w-7xl">
        <div className="shadow-xl rounded-2xl border bg-white/90">
          <div className="space-y-2 text-center border-b pb-4 pt-6">
            <div className="flex justify-center mb-2">
              <PawPrint className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex gap-2 items-center w-full md:w-auto">
                <Input
                  placeholder="Search by tag or name"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                />
                <Select value={selectedType} onValueChange={value => setSelectedType(value as AnimalType | "all") }>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {animalTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userRole === "admin" && (
                  <Button onClick={handleAddAnimal}>
                    Add Animal
                  </Button>
                )}
              </div>
            </div>
            {filteredAnimals.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">No animals found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {renderAnimalGroups()}
              </div>
            )}
          </div>
        </div>
      </div>
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
      <AlertDialog open={showLimitAlert} onOpenChange={setShowLimitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-700"><PawPrint className="h-5 w-5 text-yellow-500" /> Max Animal Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have reached the maximum of {animalLimit} animals allowed on the free plan.<br />
              <span className="font-semibold text-yellow-800">Switch to Pro to add more animals!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold" onClick={() => window.location.href = '/dashboard'}>
                Upgrade to Pro
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
