import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import medicationApi from "@/services/medicationApi";
import { Animal } from "@/types/animal";
import { Trash2, Edit, Save, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Interfaces (copied/adapted)
interface Medication {
  id: string;
  animal_id: string;
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
  userRole?: string | null;
}

export function MedicationModal({ animal, isOpen, onClose, userRole }: MedicationModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<NewMedicationData>({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
  const initialMedicationState: NewMedicationData = { medicine_name: '', dosage: '', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '' };
  const [newMedication, setNewMedication] = useState<NewMedicationData>(initialMedicationState);
  const editingIdRef = useRef<string | null>(null);

  const fetchMedications = async () => {
    if (!animal) return;
    setLoading(true);
    try {
      const data: Medication[] = await medicationApi.getByAnimal(String(animal.id));
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
    console.log('useEffect triggered - isOpen:', isOpen, 'animal:', animal?.id);
    if (isOpen && animal) {
      console.log('Fetching medications for animal:', animal.id);
      fetchMedications();
    } else if (!isOpen) {
      // Only clear state when modal is actually closed
      console.log('Clearing state - modal closed');
      setMedications([]);
      setNewMedication(initialMedicationState);
      setEditingId(null);
      editingIdRef.current = null; // Clear ref too
      setEditingMedication({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
    }
  }, [isOpen, animal?.id]);

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
          animal_id: String(animal.id),
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

  const handleDeleteMedication = async (id: string) => {
      try {
          await medicationApi.delete(id);
          setMedications(medications.filter(m => (m as any)._id !== id && m.id !== id));
          toast.success("Medication deleted successfully");
      } catch (error: any) {
          console.error("Error deleting medication:", error);
          const message = error.response?.data?.error || error.response?.data?.message || error.message;
          toast.error(`Failed to delete medication: ${message}`);
      }
  }

  const handleEndMedication = async (id: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const medicationToUpdate = medications.find(m => (m as any)._id === id || m.id === id);
      
      if (!medicationToUpdate) {
        toast.error("Medication not found");
        return;
      }

      const updatedMedication = await medicationApi.update(id, {
        ...medicationToUpdate,
        end_date: today
      });

      setMedications(medications.map(m => 
        (m as any)._id === id || m.id === id ? updatedMedication : m
      ));
      toast.success("Medication ended successfully");
    } catch (error: any) {
      console.error("Error ending medication:", error);
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to end medication: ${message}`);
    }
  }

  const handleEditMedication = (medication: Medication) => {
    console.log('handleEditMedication called with medication:', medication);
    const medicationId = (medication as any)._id || medication.id; // Use _id for MongoDB, fallback to id
    console.log('Setting editingId to:', medicationId);
    setEditingId(medicationId);
    editingIdRef.current = medicationId; // Also store in ref
    console.log('editingIdRef.current set to:', editingIdRef.current);
    
    // Ensure dates are in YYYY-MM-DD format
    let formattedStartDate = medication.start_date;
    let formattedEndDate = medication.end_date || '';
    
    if (medication.start_date && medication.start_date.includes('T')) {
      formattedStartDate = medication.start_date.split('T')[0];
    }
    if (medication.end_date && medication.end_date.includes('T')) {
      formattedEndDate = medication.end_date.split('T')[0];
    }
    
    setEditingMedication({
      medicine_name: medication.medicine_name,
      dosage: medication.dosage,
      start_date: formattedStartDate,
      end_date: formattedEndDate
    });
    console.log('State set, editingId should be:', medicationId);
    console.log('Formatted start date:', formattedStartDate);
    console.log('Formatted end date:', formattedEndDate);
  };

  const handleUpdateMedication = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('handleUpdateMedication called');
    console.log('editingId at start:', editingId);
    console.log('editingIdRef.current:', editingIdRef.current);
    console.log('editingMedication:', editingMedication);
    
    const currentEditingId = editingId || editingIdRef.current;
    
    if (!currentEditingId) {
      console.log('No editingId, returning');
      toast.error('No medication selected for editing');
      return;
    }

    // Simple validation
    if (!editingMedication.medicine_name.trim()) {
      toast.error('Medicine name is required');
      return;
    }

    if (!editingMedication.dosage.trim()) {
      toast.error('Dosage is required');
      return;
    }

    if (!/\d+\s*\w*/.test(editingMedication.dosage)) {
      toast.error("Dosage format is invalid. Expected format like '10ml' or '5 mg'.");
      return;
    }

    console.log('Validation passed, proceeding with update...');
    console.log('currentEditingId after validation:', currentEditingId);

    try {
      console.log('Calling medicationApi.update with:', currentEditingId, editingMedication);
      
      // Test the API call first
      const testData = {
        ...editingMedication,
        end_date: editingMedication.end_date || null
      };
      console.log('Test data being sent:', testData);
      
      const updatedMedication = await medicationApi.update(currentEditingId, testData);
      
      console.log('Update successful:', updatedMedication);
      setMedications(medications.map(m => 
        (m as any)._id === currentEditingId || m.id === currentEditingId ? updatedMedication : m
      ));
      setEditingId(null);
      editingIdRef.current = null;
      setEditingMedication({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
      toast.success("Medication updated successfully");
    } catch (error: any) {
      console.error("Error updating medication:", error);
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to update medication: ${message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editingIdRef.current = null;
    setEditingMedication({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
  };

  const handleMedicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setNewMedication(prevState => ({ ...prevState, [id]: value }));
  };

  const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditingMedication(prevState => ({ ...prevState, [id]: value }));
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
                <div key={(medication as any)._id || medication.id} className="border rounded-md p-3 text-sm relative group bg-gray-50/50">
                    {editingId === ((medication as any)._id || medication.id) ? (
                      // Edit Form
                      <form onSubmit={handleUpdateMedication} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                          <Input 
                            value={editingMedication.medicine_name} 
                            onChange={handleEditingChange} 
                            id="medicine_name"
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <Input 
                            value={editingMedication.dosage} 
                            onChange={handleEditingChange} 
                            id="dosage"
                            placeholder="e.g., 10ml or 5 mg"
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <Input 
                              type="date" 
                              value={editingMedication.start_date} 
                              onChange={handleEditingChange} 
                              id="start_date"
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Opt.)</label>
                            <Input 
                              type="date" 
                              value={editingMedication.end_date} 
                              onChange={handleEditingChange} 
                              id="end_date"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="bg-black hover:bg-gray-800 text-white"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Display Mode
                      <>
                        <p><strong>Medicine:</strong> {medication.medicine_name}</p>
                        <p><strong>Dosage:</strong> {medication.dosage}</p>
                        <p><strong>Start:</strong> {format(new Date(medication.start_date), "PP")}</p>
                        <p><strong>End:</strong> {medication.end_date ? format(new Date(medication.end_date), "PP") : 'Ongoing'}</p>
                        {(userRole === 'admin' || userRole === 'veterinarian') && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleEditMedication(medication)}
                              aria-label="Edit medication"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(!medication.end_date || (medication.end_date && new Date(medication.end_date) >= new Date())) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-orange-600"
                                    aria-label="End medication"
                                  >
                                    ✓
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>End Medication</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to end this medication? This will set the end date to today.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleEndMedication((medication as any)._id || medication.id)}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      End Medication
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {userRole === 'admin' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-destructive"
                                    aria-label="Delete medication"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this medication record? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteMedication((medication as any)._id || medication.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </>
                    )}
                </div>
            ))}
        </div>

        {/* Add New Medication Form */}
        {(userRole === 'admin' || userRole === 'veterinarian') && (
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
        )}
      </DialogContent>
    </Dialog>
  );
} 