import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import checkupApi from "@/services/checkupApi";
import { Animal } from "@/types/animal";
import { Trash2, Edit, Save, X } from 'lucide-react'; // Import edit icons
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Interfaces (copied from HealthRecordPage for consistency, consider centralizing types)
interface Checkup {
  id: string;
  animal_id: string;
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
  userRole?: string | null;
}

export function CheckupModal({ animal, isOpen, onClose, userRole }: CheckupModalProps) {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCheckup, setEditingCheckup] = useState<NewCheckupData>({ date: '', vet_name: '', notes: '', diagnosis: '' });
  const initialCheckupState: NewCheckupData = { date: format(new Date(), 'yyyy-MM-dd'), vet_name: '', notes: '', diagnosis: '' };
  const [newCheckup, setNewCheckup] = useState<NewCheckupData>(initialCheckupState);
  const editingIdRef = useRef<string | null>(null);

  const fetchCheckups = async () => {
    if (!animal) return;
    setLoading(true);
    try {
      const data: Checkup[] = await checkupApi.getByAnimal(String(animal.id));
      setCheckups(data);
    } catch (error) {
      toast.error("Failed to load checkup records.");
      setCheckups([]); // Clear on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && animal) {
      fetchCheckups();
    } else if (!isOpen) {
      // Only clear state when modal is actually closed
      setCheckups([]);
      setNewCheckup(initialCheckupState);
      setEditingId(null);
      editingIdRef.current = null; // Clear ref too
      setEditingCheckup({ date: '', vet_name: '', notes: '', diagnosis: '' });
    }
  }, [isOpen, animal?.id]); // Changed dependency to animal.id to avoid unnecessary resets

  const handleAddCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;
    try {
      const checkupToAdd: Omit<Checkup, 'id' | 'createdAt' | 'updatedAt'> = {
        ...newCheckup,
        animal_id: String(animal.id),
        date: newCheckup.date || format(new Date(), 'yyyy-MM-dd'),
        notes: newCheckup.notes || undefined,
        diagnosis: newCheckup.diagnosis || undefined
      };
      const addedCheckup: Checkup = await checkupApi.create(checkupToAdd);
      setCheckups([...checkups, addedCheckup]); // Add to local state
      setNewCheckup(initialCheckupState); // Reset form
      toast.success("Checkup added successfully");
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to add checkup: ${message}`);
    }
  };

  const handleDeleteCheckup = async (id: string) => {
      try {
          await checkupApi.delete(id);
          setCheckups(checkups.filter(c => (c as any)._id !== id && c.id !== id)); // Remove from local state
          toast.success("Checkup deleted successfully");
      } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || error.message;
          toast.error(`Failed to delete checkup: ${message}`);
      }
  }

  const handleEditCheckup = (checkup: Checkup) => {
    const checkupId = (checkup as any)._id || checkup.id; // Use _id for MongoDB, fallback to id
    setEditingId(checkupId);
    editingIdRef.current = checkupId; // Also store in ref
    
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = checkup.date;
    if (checkup.date && checkup.date.includes('T')) {
      // If date is in ISO format, extract just the date part
      formattedDate = checkup.date.split('T')[0];
    }
    
    setEditingCheckup({
      date: formattedDate,
      vet_name: checkup.vet_name,
      notes: checkup.notes || '',
      diagnosis: checkup.diagnosis || ''
    });
  };

  // Add a useEffect to monitor editingId changes
  useEffect(() => {
  }, [editingId]);

  const handleUpdateCheckup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const currentEditingId = editingId || editingIdRef.current;
    
    if (!currentEditingId) {
      toast.error('No checkup selected for editing');
      return;
    }

    // Simple validation
    if (!editingCheckup.date) {
      toast.error('Date is required');
      return;
    }

    if (!editingCheckup.vet_name.trim()) {
      toast.error('Vet name is required');
      return;
    }

    try {
      
      // Test the API call first
      const testData = {
        ...editingCheckup,
        notes: editingCheckup.notes || undefined,
        diagnosis: editingCheckup.diagnosis || undefined
      };
      
      const updatedCheckup = await checkupApi.update(currentEditingId, testData);
      
      setCheckups(checkups.map(c => 
        (c as any)._id === currentEditingId || c.id === currentEditingId ? updatedCheckup : c
      ));
      setEditingId(null);
      editingIdRef.current = null; // Clear ref too
      setEditingCheckup({ date: '', vet_name: '', notes: '', diagnosis: '' });
      toast.success("Checkup updated successfully");
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to update checkup: ${message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editingIdRef.current = null; // Clear ref too
    setEditingCheckup({ date: '', vet_name: '', notes: '', diagnosis: '' });
  };

  const handleCheckupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewCheckup(prevState => ({ ...prevState, [id]: value }));
  };

  const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditingCheckup(prevState => ({ ...prevState, [id]: value }));
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
            <div key={(checkup as any)._id || checkup.id} className="border rounded-md p-3 text-sm relative group bg-gray-50/50">
                {editingId === ((checkup as any)._id || checkup.id) ? (
                  // Edit Form
                  <form onSubmit={handleUpdateCheckup} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <Input 
                          type="date" 
                          value={editingCheckup.date} 
                          onChange={handleEditingChange} 
                          id="date"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vet Name</label>
                        <Input 
                          value={editingCheckup.vet_name} 
                          onChange={handleEditingChange} 
                          id="vet_name"
                          placeholder="Dr. Smith"
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis (Opt.)</label>
                      <Textarea 
                        value={editingCheckup.diagnosis} 
                        onChange={handleEditingChange} 
                        id="diagnosis"
                        placeholder="Diagnosis details..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Opt.)</label>
                      <Textarea 
                        value={editingCheckup.notes} 
                        onChange={handleEditingChange} 
                        id="notes"
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={() => {
                          try {
                            handleUpdateCheckup();
                          } catch (error) {
                          }
                        }}
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
                    <p><strong>Date:</strong> {format(new Date(checkup.date), "PP")}</p> {/* Using PP for shorter date format */}
                    <p><strong>Vet:</strong> {checkup.vet_name}</p>
                    {checkup.diagnosis && <p><strong>Diagnosis:</strong> {checkup.diagnosis}</p>}
                    {checkup.notes && <p><strong>Notes:</strong> {checkup.notes}</p>}
                    {userRole === 'admin' && (
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => {
                            handleEditCheckup(checkup);
                          }}
                          aria-label="Edit checkup"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              aria-label="Delete checkup"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Checkup</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this checkup record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteCheckup((checkup as any)._id || checkup.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </>
                )}
            </div>
          ))}
        </div>

        {/* Add New Checkup Form */}
        {(userRole === 'admin' || userRole === 'veterinarian') && (
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
        )}
      </DialogContent>
    </Dialog>
  );
} 