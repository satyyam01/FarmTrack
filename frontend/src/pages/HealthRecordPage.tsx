import { useState, useEffect } from "react";
import { toast } from "sonner";
import { animalApi } from "@/services/api";
import checkupApi from "@/services/checkupApi";
import medicationApi from "@/services/medicationApi";
import { Animal } from "@/types/animal";
import { AnimalHealthCard } from "@/components/AnimalHealthCard";
import { CheckupModal } from "@/components/CheckupModal";
import { MedicationModal } from "@/components/MedicationModal";

// Combined type for state
interface AnimalWithCounts extends Animal {
    checkupCount: number;
    medicationCount: number;
}

export function HealthRecordPage() {
  const [animalsWithCounts, setAnimalsWithCounts] = useState<AnimalWithCounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for managing modals
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState<boolean>(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState<boolean>(false);
  const [currentAnimalForModal, setCurrentAnimalForModal] = useState<Animal | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(user?.role || null);
    } catch {
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    const loadAnimalsAndCounts = async () => {
      setLoading(true);
      try {
        const animalsData = await animalApi.getAll();
        
        // Fetch counts for each animal
        const animalsWithDataPromises = animalsData.map(async (animal) => {
            try {
                const [checkups, medications] = await Promise.all([
                    checkupApi.getByAnimal(animal.id),
                    medicationApi.getByAnimal(animal.id)
                ]);
                return {
                    ...animal,
                    checkupCount: checkups.length,
                    medicationCount: medications.length
                };
            } catch (countError) {
                console.error(`Error fetching counts for animal ${animal.id}:`, countError);
                // Return animal data with 0 counts if fetching counts fails
                return {
                    ...animal,
                    checkupCount: 0,
                    medicationCount: 0
                };
            }
        });

        let animalsWithData = await Promise.all(animalsWithDataPromises);

        // Sort animals by type alphabetically
        animalsWithData.sort((a, b) => a.type.localeCompare(b.type));

        setAnimalsWithCounts(animalsWithData);

      } catch (error) {
        console.error("Error loading animals:", error);
        toast.error("Failed to load animals");
        setAnimalsWithCounts([]); // Clear on error
      } finally {
        setLoading(false);
      }
    };
    loadAnimalsAndCounts();
  }, []);

  // Functions to open modals
  const handleOpenCheckupModal = (animal: Animal) => {
    setCurrentAnimalForModal(animal);
    setIsCheckupModalOpen(true);
  };

  const handleOpenMedicationModal = (animal: Animal) => {
    setCurrentAnimalForModal(animal);
    setIsMedicationModalOpen(true);
  };
  
  // Function to potentially refresh data after modal closes (optional for now)
  const handleModalClose = () => {
      // Could enhance this to refetch counts for the specific animal if needed
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading animal health data...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Animal Health Overview</h1>

      {animalsWithCounts.length === 0 && !loading && (
          <p className="text-muted-foreground">No animals found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animalsWithCounts.map(animal => (
          <AnimalHealthCard 
            key={animal.id} 
            animal={animal}
            checkupCount={animal.checkupCount}
            medicationCount={animal.medicationCount}
            onAddCheckup={() => handleOpenCheckupModal(animal)}
            onAddMedication={() => handleOpenMedicationModal(animal)}
          />
        ))}
      </div>

      {/* Checkup Modal */}
      {currentAnimalForModal && (
        <CheckupModal
          animal={currentAnimalForModal}
          isOpen={isCheckupModalOpen}
          onClose={() => {
              setIsCheckupModalOpen(false);
              setCurrentAnimalForModal(null);
              handleModalClose();
          }}
          userRole={userRole}
        />
      )}

      {/* Medication Modal */}
       {currentAnimalForModal && (
        <MedicationModal
          animal={currentAnimalForModal}
          isOpen={isMedicationModalOpen}
          onClose={() => {
              setIsMedicationModalOpen(false);
              setCurrentAnimalForModal(null);
              handleModalClose();
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
} 