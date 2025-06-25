import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import medicationApi from "@/services/medicationApi";
import { Animal } from "@/types/animal";
import { Trash2 } from 'lucide-react';

// Interfaces (copied/adapted)
interface Medication {
  id: number;
  animal_id: number;
  medicine_name: string;
  dosage: string;
  start_date: string; 
  end_date?: string | null; 
  createdAt?: string;
  updatedAt?: string;
}
interface NewMedicationData {
    medicine_name: string;
    dosage: string;
    start_date: string;
    end_date: string; 
}

interface MedicationModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MedicationModal({ animal, isOpen, onClose }: MedicationModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const initialMedicationState: NewMedicationData = { medicine_name: '', dosage: '', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '' };
  const [newMedication, setNewMedication] = useState<NewMedicationData>(initialMedicationState);

  const fetchMedications = async () => {
    if (!animal) return;
    setLoading(true);
    try {
      const data: Medication[] = await medicationApi.getByAnimal(animal.id);
      setMedications(data);
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast.error("Failed to load medication records.");
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && animal) {
      fetchMedications();
    } else {
      setMedications([]);
      setNewMedication(initialMedicationState);
    }
  }, [isOpen, animal]);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!animal) return;
    
    if (!/\d+\s*\w*/.test(newMedication.dosage)) {
        toast.error("Dosage format is invalid. Expected format like '10ml' or '5 mg'.");
        return;
    }

    try {
      const medicationToAdd: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
          ...newMedication,
          animal_id: animal.id,
          start_date: newMedication.start_date || format(new Date(), 'yyyy-MM-dd'),
          end_date: newMedication.end_date || null
      };
      const addedMedication: Medication = await medicationApi.create(medicationToAdd);
      setMedications([...medications, addedMedication]);
      setNewMedication(initialMedicationState); 
      toast.success("Medication added successfully");
    } catch (error: any) {
      console.error("Error adding medication:", error);
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to add medication: ${message}`);
    }
  };

  const handleDeleteMedication = async (id: number) => {
      if (!confirm("Are you sure you want to delete this medication record?")) return;
      try {
          await medicationApi.delete(id);
          setMedications(medications.filter(m => m.id !== id));
          toast.success("Medication deleted successfully");
      } catch (error: any) {
          console.error("Error deleting medication:", error);
          const message = error.response?.data?.error || error.response?.data?.message || error.message;
          toast.error(`Failed to delete medication: ${message}`);
      }
  }

  const handleMedicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setNewMedication(prevState => ({ ...prevState, [id]: value }));
  };

  if (!animal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Medication Records for {animal.name}</DialogTitle>
          <DialogDescription>View past medications and add new records.</DialogDescription>
        </DialogHeader>

        {/* Display Existing Medications */}
        <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {loading && <p>Loading records...</p>}
            {!loading && medications.length === 0 && <p className="text-muted-foreground">No medication records found.</p>}
            {!loading && medications.map((medication) => (
                <div key={medication.id} className="border rounded-md p-3 text-sm relative group bg-gray-50/50">
                    <p><strong>Medicine:</strong> {medication.medicine_name}</p>
                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                    <p><strong>Start:</strong> {format(new Date(medication.start_date), "PP")}</p>
                    <p><strong>End:</strong> {medication.end_date ? format(new Date(medication.end_date), "PP") : 'Ongoing'}</p>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMedication(medication.id)}
                        aria-label="Delete medication"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>

        {/* Add New Medication Form */}
        <form onSubmit={handleAddMedication} className="mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Add New Medication</h3>
            <div>
                <label htmlFor="medicine_name" className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <Input id="medicine_name" placeholder="e.g., Penicillin" value={newMedication.medicine_name} onChange={handleMedicationChange} required />
            </div>
            <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <Input id="dosage" placeholder="e.g., 10ml or 5 mg" value={newMedication.dosage} onChange={handleMedicationChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input id="start_date" type="date" value={newMedication.start_date} onChange={handleMedicationChange} required />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date (Opt.)</label>
                    <Input id="end_date" type="date" value={newMedication.end_date} onChange={handleMedicationChange} />
                </div>
            </div>
             <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Medication</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 