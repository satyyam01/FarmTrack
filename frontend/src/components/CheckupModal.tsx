import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import checkupApi from "@/services/checkupApi";
import { Animal } from "@/types/animal";
import { Trash2 } from 'lucide-react'; // Import delete icon

// Interfaces (copied from HealthRecordPage for consistency, consider centralizing types)
interface Checkup {
  id: number;
  animal_id: number;
  date: string; 
  vet_name: string;
  notes?: string;
  diagnosis?: string;
  createdAt?: string; 
  updatedAt?: string;
}
interface NewCheckupData {
    date: string;
    vet_name: string;
    notes: string;
    diagnosis: string;
}

interface CheckupModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckupModal({ animal, isOpen, onClose }: CheckupModalProps) {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const initialCheckupState: NewCheckupData = { date: format(new Date(), 'yyyy-MM-dd'), vet_name: '', notes: '', diagnosis: '' };
  const [newCheckup, setNewCheckup] = useState<NewCheckupData>(initialCheckupState);

  const fetchCheckups = async () => {
    if (!animal) return;
    setLoading(true);
    try {
      const data: Checkup[] = await checkupApi.getByAnimal(animal.id);
      setCheckups(data);
    } catch (error) {
      console.error("Error fetching checkups:", error);
      toast.error("Failed to load checkup records.");
      setCheckups([]); // Clear on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && animal) {
      fetchCheckups();
    } else {
        // Clear state when modal is closed or animal is null
        setCheckups([]);
        setNewCheckup(initialCheckupState);
    }
  }, [isOpen, animal]); // Refetch when modal opens or animal changes

  const handleAddCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;
    try {
      const checkupToAdd: Omit<Checkup, 'id' | 'createdAt' | 'updatedAt'> = {
        ...newCheckup,
        animal_id: animal.id,
        date: newCheckup.date || format(new Date(), 'yyyy-MM-dd'),
        notes: newCheckup.notes || undefined,
        diagnosis: newCheckup.diagnosis || undefined
      };
      const addedCheckup: Checkup = await checkupApi.create(checkupToAdd);
      setCheckups([...checkups, addedCheckup]); // Add to local state
      setNewCheckup(initialCheckupState); // Reset form
      toast.success("Checkup added successfully");
    } catch (error: any) {
      console.error("Error adding checkup:", error);
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to add checkup: ${message}`);
    }
  };

  const handleDeleteCheckup = async (id: number) => {
      if (!confirm("Are you sure you want to delete this checkup record?")) return;
      try {
          await checkupApi.delete(id);
          setCheckups(checkups.filter(c => c.id !== id)); // Remove from local state
          toast.success("Checkup deleted successfully");
      } catch (error: any) {
          console.error("Error deleting checkup:", error);
          const message = error.response?.data?.error || error.response?.data?.message || error.message;
          toast.error(`Failed to delete checkup: ${message}`);
      }
  }

  const handleCheckupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewCheckup(prevState => ({ ...prevState, [id]: value }));
  };

  // Prevent rendering if no animal
  if (!animal) return null; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Checkup Records for {animal.name}</DialogTitle>
          <DialogDescription>View past checkups and add new records.</DialogDescription>
        </DialogHeader>
        
        {/* Display Existing Checkups */}
        <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {loading && <p>Loading records...</p>}
          {!loading && checkups.length === 0 && <p className="text-muted-foreground">No checkup records found.</p>}
          {!loading && checkups.map((checkup) => (
            <div key={checkup.id} className="border rounded-md p-3 text-sm relative group bg-gray-50/50">
                <p><strong>Date:</strong> {format(new Date(checkup.date), "PP")}</p> {/* Using PP for shorter date format */}
                <p><strong>Vet:</strong> {checkup.vet_name}</p>
                {checkup.diagnosis && <p><strong>Diagnosis:</strong> {checkup.diagnosis}</p>}
                {checkup.notes && <p><strong>Notes:</strong> {checkup.notes}</p>}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteCheckup(checkup.id)}
                    aria-label="Delete checkup"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          ))}
        </div>

        {/* Add New Checkup Form */}
        <form onSubmit={handleAddCheckup} className="mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Add New Checkup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input id="date" type="date" value={newCheckup.date} onChange={handleCheckupChange} required />
                </div>
                <div>
                    <label htmlFor="vet_name" className="block text-sm font-medium text-gray-700 mb-1">Vet Name</label>
                    <Input id="vet_name" placeholder="Dr. Smith" value={newCheckup.vet_name} onChange={handleCheckupChange} required />
                </div>
            </div>
            <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Diagnosis (Opt.)</label>
                <Textarea id="diagnosis" placeholder="Diagnosis details..." value={newCheckup.diagnosis} onChange={handleCheckupChange} />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Opt.)</label>
                <Textarea id="notes" placeholder="Additional notes..." value={newCheckup.notes} onChange={handleCheckupChange} />
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Checkup</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 