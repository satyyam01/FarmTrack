import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { animalApi } from "@/services/api";
import checkupApi from "@/services/checkupApi";
import medicationApi from "@/services/medicationApi";
import { Animal } from "@/types/animal";
import { AnimalHealthCard } from "@/components/AnimalHealthCard";
import { CheckupModal } from "@/components/CheckupModal";
import { MedicationModal } from "@/components/MedicationModal";
import { Input } from "@/components/ui/input";
import { Dialog as Modal, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogTitle as ModalTitle, DialogFooter as ModalFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Stethoscope } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Combined type for state
interface AnimalWithCounts extends Animal {
    checkupCount: number;
    ongoingMedicationCount: number;
}

export function HealthRecordPage() {
  const [animalsWithCounts, setAnimalsWithCounts] = useState<AnimalWithCounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for managing modals
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState<boolean>(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState<boolean>(false);
  const [currentAnimalForModal, setCurrentAnimalForModal] = useState<Animal | null>(null);
  const [search, setSearch] = useState("");

  // State for Add Record and View History modals
  const [addRecordAnimal, setAddRecordAnimal] = useState<Animal | null>(null);
  const [viewHistoryAnimal, setViewHistoryAnimal] = useState<Animal | null>(null);
  const [addRecordForm, setAddRecordForm] = useState({
    vet_name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    diagnosis: "",
    addMedication: false,
    medication_name: "",
    medication_dosage: "",
    medication_start: format(new Date(), "yyyy-MM-dd"),
    medication_end: ""
  });
  const [addRecordLoading, setAddRecordLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMedications, setHistoryMedications] = useState<any[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordForm, setEditingRecordForm] = useState({ vet_name: "", date: "", diagnosis: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Add state for editing medication
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [editingMedicationForm, setEditingMedicationForm] = useState({
    medicine_name: '',
    dosage: '',
    start_date: '',
    end_date: ''
  });
  const [editMedicationLoading, setEditMedicationLoading] = useState(false);

  const [showPastMeds, setShowPastMeds] = useState(false);

  // Use UserContext instead of localStorage
  const { user } = useUser();

  useEffect(() => {
    const loadAnimalsAndCounts = async () => {
      setLoading(true);
      try {
        const animalsData = await animalApi.getAll();
        
        // Fetch counts for each animal
        const animalsWithDataPromises = animalsData.map(async (animal) => {
            try {
                const [checkups, medications] = await Promise.all([
                    checkupApi.getByAnimal(String(animal._id || animal.id)),
                    medicationApi.getByAnimal(String(animal._id || animal.id))
                ]);
                const todayStr = format(new Date(), "yyyy-MM-dd");
                const ongoingMedications = medications.filter((med: any) => {
                    const hasEndDate = !!med.end_date;
                    if (!hasEndDate) return true; // No end date = ongoing
                    
                    // Convert end_date to date string (YYYY-MM-DD) for comparison
                    const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
                    return !endDateStr || endDateStr > todayStr;
                });
                return {
                    ...animal,
                    checkupCount: checkups.length,
                    ongoingMedicationCount: ongoingMedications.length
                };
            } catch (countError) {
                console.error(`Error fetching counts for animal ${animal.id}:`, countError);
                // Return animal data with 0 counts if fetching counts fails
                return {
                    ...animal,
                    checkupCount: 0,
                    ongoingMedicationCount: 0
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

  // Function to potentially refresh data after modal closes (optional for now)
  const handleModalClose = () => {
      // Could enhance this to refetch counts for the specific animal if needed
  }

  // Group animals by type
  const groupedAnimals = useMemo(() => {
    const groups: { [type: string]: AnimalWithCounts[] } = {};
    animalsWithCounts.forEach(animal => {
      if (!groups[animal.type]) groups[animal.type] = [];
      groups[animal.type].push(animal);
    });
    return groups;
  }, [animalsWithCounts]);

  // Filter animals by search
  const filteredGroupedAnimals = useMemo(() => {
    if (!search.trim()) return groupedAnimals;
    const lower = search.toLowerCase();
    const filtered: { [type: string]: AnimalWithCounts[] } = {};
    Object.entries(groupedAnimals).forEach(([type, list]) => {
      const filteredList = list.filter(animal =>
        animal.name.toLowerCase().includes(lower) ||
        animal.tag_number.toLowerCase().includes(lower)
      );
      if (filteredList.length > 0) filtered[type] = filteredList;
    });
    return filtered;
  }, [groupedAnimals, search]);

  // Handler to toggle under_treatment
  const handleToggleTreatment = async (animal: Animal) => {
    try {
      const updated = await animalApi.update(String(animal._id || animal.id), {
        ...animal,
        is_producing_yield: animal.is_producing_yield ?? false,
        under_treatment: !animal.under_treatment
      });
      setAnimalsWithCounts(prev => prev.map(a => String(a._id || a.id) === String(animal._id || animal.id) ? { ...a, under_treatment: updated.under_treatment } : a));
      toast.success(`Animal marked as ${updated.under_treatment ? 'under treatment' : 'not under treatment'}`);
    } catch (error) {
      toast.error('Failed to update treatment status');
    }
  };

  // Add Record handlers
  const handleAddRecord = (animal: Animal) => {
    setAddRecordAnimal(animal);
    setAddRecordForm({ vet_name: "", date: format(new Date(), "yyyy-MM-dd"), diagnosis: "", addMedication: false, medication_name: "", medication_dosage: "", medication_start: format(new Date(), "yyyy-MM-dd"), medication_end: "" });
  };
  const handleViewHistory = async (animal: Animal) => {
    setViewHistoryAnimal(animal);
    setHistoryLoading(true);
    try {
      const records = await checkupApi.getByAnimal(String(animal._id || animal.id));
      setHistoryRecords(records
        .map((r: any) => ({ ...r, id: r.id || r._id }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      // Fetch medications
      const meds = await medicationApi.getByAnimal(String(animal._id || animal.id));
      setHistoryMedications(meds);
    } catch {
      setHistoryRecords([]);
      setHistoryMedications([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  const handleSubmitAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRecordAnimal) return;
    setAddRecordLoading(true);
    try {
      const newRecord = await checkupApi.create({
        animal_id: String(addRecordAnimal._id || addRecordAnimal.id),
        vet_name: addRecordForm.vet_name,
        date: addRecordForm.date,
        diagnosis: addRecordForm.diagnosis
      });
      if (addRecordForm.addMedication) {
        await medicationApi.create({
          animal_id: String(addRecordAnimal._id || addRecordAnimal.id),
          medicine_name: addRecordForm.medication_name,
          dosage: addRecordForm.medication_dosage,
          start_date: addRecordForm.medication_start,
          end_date: addRecordForm.medication_end || undefined
        });
      }
      toast.success("Record added");
      setAddRecordAnimal(null);
      setViewHistoryAnimal(addRecordAnimal);
      setHistoryRecords(prev => [newRecord, ...prev]);
      if (addRecordAnimal) {
        const meds = await medicationApi.getByAnimal(String(addRecordAnimal._id || addRecordAnimal.id));
        setHistoryMedications(meds);
        await refreshAnimalCounts(String(addRecordAnimal._id || addRecordAnimal.id));
      }
    } catch {
      toast.error("Failed to add record");
    } finally {
      setAddRecordLoading(false);
    }
  };

  // Edit handlers
  const handleEditRecord = (record: any) => {
    const today = format(new Date(), "yyyy-MM-dd");
    setEditingRecordId(record.id || record._id);
    setEditingRecordForm({
      vet_name: record.vet_name,
      date: record.date ? record.date.slice(0, 10) : today,
      diagnosis: record.diagnosis || ""
    });
  };
  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditingRecordForm({ vet_name: "", date: "", diagnosis: "" });
  };
  const handleSaveEdit = async (id: string) => {
    setEditLoading(true);
    try {
      const updated = await checkupApi.update(id, {
        vet_name: editingRecordForm.vet_name,
        date: editingRecordForm.date,
        diagnosis: editingRecordForm.diagnosis
      });
      // Refetch all records for the animal to ensure UI is up to date
      if (viewHistoryAnimal) {
        await handleViewHistory(viewHistoryAnimal);
      }
      setEditingRecordId(null);
      setEditingRecordForm({ vet_name: "", date: "", diagnosis: "" });
      toast.success("Record updated");
      if (viewHistoryAnimal) {
        await refreshAnimalCounts(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
      }
    } catch {
      toast.error("Failed to update record");
    } finally {
      setEditLoading(false);
    }
  };
  const handleDeleteRecord = async (id: string) => {
    setEditLoading(true);
    try {
      await checkupApi.delete(id);
      setHistoryRecords(prev => prev.filter(r => r.id !== id));
      toast.success("Record deleted");
      if (viewHistoryAnimal) {
        await refreshAnimalCounts(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
      }
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setEditLoading(false);
    }
  };

  // Handler to open medication edit form
  const handleEditMedication = (med: any) => {
    const today = format(new Date(), "yyyy-MM-dd");
    setEditingMedicationId(med.id || med._id);
    setEditingMedicationForm({
      medicine_name: med.medicine_name,
      dosage: med.dosage,
      start_date: med.start_date ? med.start_date.slice(0, 10) : today,
      end_date: med.end_date ? med.end_date.slice(0, 10) : ''
    });
  };
  const handleCancelEditMedication = () => {
    setEditingMedicationId(null);
    setEditingMedicationForm({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
  };
  const handleSaveEditMedication = async (id: string) => {
    setEditMedicationLoading(true);
    try {
      await medicationApi.update(id, {
        medicine_name: editingMedicationForm.medicine_name,
        dosage: editingMedicationForm.dosage,
        start_date: editingMedicationForm.start_date,
        end_date: editingMedicationForm.end_date || undefined
      });
      // Refetch medications for the animal
      if (viewHistoryAnimal) {
        const meds = await medicationApi.getByAnimal(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
        setHistoryMedications(meds);
      }
      setEditingMedicationId(null);
      setEditingMedicationForm({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
      toast.success('Medication updated');
      if (viewHistoryAnimal) {
        await refreshAnimalCounts(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
      }
    } catch {
      toast.error('Failed to update medication');
    } finally {
      setEditMedicationLoading(false);
    }
  };
  const handleEndMedication = async (id: string) => {
    setEditMedicationLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await medicationApi.update(id, { end_date: today });
      if (viewHistoryAnimal) {
        const meds = await medicationApi.getByAnimal(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
        setHistoryMedications(meds);
      }
      setEditingMedicationId(null);
      setEditingMedicationForm({ medicine_name: '', dosage: '', start_date: '', end_date: '' });
      toast.success('Medication ended');
      if (viewHistoryAnimal) {
        await refreshAnimalCounts(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
      }
      // Stay in the history view instead of returning to main view
    } catch (error) {
      console.error('Error ending medication:', error);
      toast.error('Failed to end medication');
    } finally {
      setEditMedicationLoading(false);
    }
  };
  const handleDeleteMedication = async (id: string) => {
    setEditMedicationLoading(true);
    try {
      await medicationApi.delete(id);
      if (viewHistoryAnimal) {
        const meds = await medicationApi.getByAnimal(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
        setHistoryMedications(meds);
        await refreshAnimalCounts(String(viewHistoryAnimal._id || viewHistoryAnimal.id));
      }
      toast.success('Medication deleted');
    } catch {
      toast.error('Failed to delete medication');
    } finally {
      setEditMedicationLoading(false);
    }
  };

  // Add this function to refresh counts for a single animal
  const refreshAnimalCounts = async (animalId: string) => {
    try {
      const [checkups, medications] = await Promise.all([
        checkupApi.getByAnimal(String(animalId)),
        medicationApi.getByAnimal(String(animalId))
      ]);
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const ongoingMedications = medications.filter((med: any) => {
        const hasEndDate = !!med.end_date;
        if (!hasEndDate) return true; // No end date = ongoing
        
        // Convert end_date to date string (YYYY-MM-DD) for comparison
        const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
        return !endDateStr || endDateStr > todayStr;
      });
      setAnimalsWithCounts(prev =>
        prev.map(a =>
          String(a._id || a.id) === animalId
            ? { ...a, checkupCount: checkups.length, ongoingMedicationCount: ongoingMedications.length }
            : a
        )
      );
    } catch (error) {
      // Optionally handle error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <div className="w-full max-w-3xl">
          <div className="shadow-xl rounded-2xl border bg-white/90">
            <div className="space-y-2 text-center border-b pb-4 pt-6">
              <div className="flex justify-center mb-2">
                <Stethoscope className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
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
              <Stethoscope className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <Input
                placeholder="Search by animal name or tag"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {/* Animal Cards Section */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading animals...</p>
              </div>
            ) : Object.keys(filteredGroupedAnimals).length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">No animals found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(filteredGroupedAnimals).map(([type, animals]) => (
                  <div key={type} className="space-y-2">
                    <h2 className="text-xl font-semibold mb-2">{type}s</h2>
                    <div className="flex flex-row gap-6 overflow-x-auto pb-2">
                      {animals.map(animal => (
                        <AnimalHealthCard
                          key={animal.id || animal._id}
                          animal={animal}
                          checkupCount={animal.checkupCount}
                          medicationCount={animal.ongoingMedicationCount}
                          userRole={user?.role || null}
                          onAddRecord={handleAddRecord}
                          onViewHistory={handleViewHistory}
                          onToggleTreatment={handleToggleTreatment}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
          userRole={user?.role || null}
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
          userRole={user?.role || null}
        />
      )}

      {/* Add Record Modal */}
      {addRecordAnimal && (
        <Modal open={!!addRecordAnimal} onOpenChange={open => !open && setAddRecordAnimal(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Health Record for {addRecordAnimal.name}</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleSubmitAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vet Name</label>
                <Input
                  value={addRecordForm.vet_name}
                  onChange={e => setAddRecordForm(f => ({ ...f, vet_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={addRecordForm.date}
                  onChange={e => setAddRecordForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                <Textarea
                  value={addRecordForm.diagnosis}
                  onChange={e => setAddRecordForm(f => ({ ...f, diagnosis: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addMedication"
                  checked={addRecordForm.addMedication}
                  onChange={e => setAddRecordForm(f => ({ ...f, addMedication: e.target.checked }))}
                />
                <label htmlFor="addMedication" className="text-sm font-medium">Add Medication</label>
              </div>
              {addRecordForm.addMedication && (
                <div className="space-y-2 border rounded p-3 bg-muted/30">
                  <div>
                    <label className="block text-sm font-medium mb-1">Medicine Name</label>
                    <Input
                      value={addRecordForm.medication_name}
                      onChange={e => setAddRecordForm(f => ({ ...f, medication_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dosage</label>
                    <Input
                      value={addRecordForm.medication_dosage}
                      onChange={e => setAddRecordForm(f => ({ ...f, medication_dosage: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={addRecordForm.medication_start}
                        onChange={e => setAddRecordForm(f => ({ ...f, medication_start: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                      <Input
                        type="date"
                        value={addRecordForm.medication_end}
                        onChange={e => setAddRecordForm(f => ({ ...f, medication_end: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              <ModalFooter>
                <Button type="button" variant="outline" onClick={() => setAddRecordAnimal(null)} disabled={addRecordLoading}>Cancel</Button>
                <Button type="submit" disabled={addRecordLoading}>{addRecordLoading ? "Adding..." : "Add Record"}</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
      {/* View History Modal */}
      {viewHistoryAnimal && (
        <Modal open={!!viewHistoryAnimal} onOpenChange={open => !open && setViewHistoryAnimal(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>History for {viewHistoryAnimal.name}</ModalTitle>
            </ModalHeader>
            <div className="max-h-[400px] overflow-y-auto space-y-3 mt-2">
              {/* Ongoing Medications */}
              {historyMedications.filter((med: any) => {
                const hasEndDate = !!med.end_date;
                if (!hasEndDate) return true; // No end date = ongoing
                
                // Convert end_date to date string (YYYY-MM-DD) for comparison
                const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
                const todayStr = format(new Date(), "yyyy-MM-dd");
                
                const isOngoing = !endDateStr || endDateStr > todayStr;
                return isOngoing;
              }).length > 0 && (
                <div className="mb-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div className="font-semibold mb-1 text-blue-900">Ongoing Medication(s):</div>
                  {historyMedications.filter((med: any) => {
                    const hasEndDate = !!med.end_date;
                    if (!hasEndDate) return true; // No end date = ongoing
                    
                    // Convert end_date to date string (YYYY-MM-DD) for comparison
                    const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
                    const todayStr = format(new Date(), "yyyy-MM-dd");
                    
                    const isOngoing = !endDateStr || endDateStr > todayStr;
                    return isOngoing;
                  }).map((med: any) => {
                    const medId = med.id || med._id;
                    const isEditing = editingMedicationId === medId;
                    return (
                      <div key={medId} className="mb-2 border rounded p-2 bg-white/80 relative group">
                        {isEditing && (user?.role === 'admin' || user?.role === 'veterinarian') ? (
                          <form onSubmit={e => { e.preventDefault(); handleSaveEditMedication(medId); }} className="space-y-1">
                            <div>
                              <label className="block text-xs font-medium mb-1">Medicine Name</label>
                              <Input
                                value={editingMedicationForm.medicine_name}
                                onChange={e => setEditingMedicationForm(f => ({ ...f, medicine_name: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Dosage</label>
                              <Input
                                value={editingMedicationForm.dosage}
                                onChange={e => setEditingMedicationForm(f => ({ ...f, dosage: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1">Start Date</label>
                                <Input
                                  type="date"
                                  value={editingMedicationForm.start_date}
                                  onChange={e => setEditingMedicationForm(f => ({ ...f, start_date: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1">End Date (optional)</label>
                                <Input
                                  type="date"
                                  value={editingMedicationForm.end_date}
                                  onChange={e => setEditingMedicationForm(f => ({ ...f, end_date: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button type="submit" size="sm" disabled={editMedicationLoading}>Save</Button>
                              <Button type="button" size="sm" variant="outline" onClick={handleCancelEditMedication} disabled={editMedicationLoading}>Cancel</Button>
                              {(user?.role === 'admin' || user?.role === 'veterinarian') && (!med.end_date || new Date(med.end_date) >= new Date()) && (
                                <Button type="button" size="sm" variant="destructive" onClick={() => handleEndMedication(medId)} disabled={editMedicationLoading}>End</Button>
                              )}
                            </div>
                          </form>
                        ) : (
                          <>
                            <div><strong>Name:</strong> {med.medicine_name}</div>
                            <div><strong>Dosage:</strong> {med.dosage}</div>
                            <div><strong>Start:</strong> {med.start_date ? med.start_date.slice(0, 10) : ''}</div>
                            <div><strong>End:</strong> {med.end_date ? med.end_date.slice(0, 10) : <span className="italic">Ongoing</span>}</div>
                            {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditMedication(med)}
                                  aria-label="Edit medication"
                                  disabled={editMedicationLoading}
                                >
                                  ✎
                                </Button>
                                {user?.role === 'admin' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive"
                                      aria-label="Delete medication"
                                      disabled={editMedicationLoading}
                                    >
                                      🗑️
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
                                        onClick={() => handleDeleteMedication(medId)}
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
                    );
                  })}
                </div>
              )}
              {/* View Past Medications Button (always show if any past meds) */}
              {historyMedications.filter((med: any) => {
                const hasEndDate = !!med.end_date;
                if (!hasEndDate) return false; // No end date = not past
                
                // Convert end_date to date string (YYYY-MM-DD) for comparison
                const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
                const todayStr = format(new Date(), "yyyy-MM-dd");
                
                return endDateStr && endDateStr <= todayStr;
              }).length > 0 && (
                <Button variant="secondary" size="sm" className="mb-4" onClick={() => setShowPastMeds(true)}>
                  View Past Medications
                </Button>
              )}
              {/* Checkup Records */}
              {historyLoading && <p>Loading...</p>}
              {!historyLoading && historyRecords.length === 0 && <p className="text-muted-foreground">No records found.</p>}
              {!historyLoading && historyRecords.map((record, idx) => {
                const isFirstEdit =
                  editingRecordId === (record.id || record._id) &&
                  historyRecords.findIndex(r => (r.id || r._id) === (record.id || record._id)) === idx;
                return (
                  <div key={(record.id || record._id) + '-' + idx} className="border rounded-md p-3 text-sm bg-gray-50/50 relative group">
                    {isFirstEdit && user?.role === 'admin' ? (
                      <form onSubmit={e => { e.preventDefault(); handleSaveEdit(record.id || record._id); }} className="space-y-1">
                        <div>
                          <label className="block text-xs font-medium mb-1">Vet Name</label>
                          <Input
                            value={editingRecordForm.vet_name}
                            onChange={e => setEditingRecordForm(f => ({ ...f, vet_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Date</label>
                          <Input
                            type="date"
                            value={editingRecordForm.date}
                            onChange={e => setEditingRecordForm(f => ({ ...f, date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Diagnosis</label>
                          <Textarea
                            value={editingRecordForm.diagnosis}
                            onChange={e => setEditingRecordForm(f => ({ ...f, diagnosis: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button type="submit" size="sm" disabled={editLoading}>Save</Button>
                          <Button type="button" size="sm" variant="outline" onClick={handleCancelEdit} disabled={editLoading}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div><strong>Vet:</strong> {record.vet_name}</div>
                        <div><strong>Date:</strong> {record.date ? record.date.slice(0, 10) : ''}</div>
                        <div><strong>Diagnosis:</strong> {record.diagnosis || ''}</div>
                        {user?.role === 'admin' && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditRecord(record)}
                              aria-label="Edit record"
                              disabled={editLoading}
                            >
                              ✎
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  aria-label="Delete record"
                                  disabled={editLoading}
                                >
                                  🗑️
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this checkup record? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteRecord(record.id || record._id)}
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
                );
              })}
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setViewHistoryAnimal(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      {/* Past Medications Dialog */}
      <Modal open={showPastMeds} onOpenChange={setShowPastMeds}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Past Medications</ModalTitle>
          </ModalHeader>
          <div className="max-h-[350px] overflow-y-auto space-y-3 mt-2">
            {historyMedications.filter((med: any) => {
              const hasEndDate = !!med.end_date;
              if (!hasEndDate) return false; // No end date = not past
              
              // Convert end_date to date string (YYYY-MM-DD) for comparison
              const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
              const todayStr = format(new Date(), "yyyy-MM-dd");
              
              return endDateStr && endDateStr <= todayStr;
            }).length === 0 && (
              <div className="text-muted-foreground">No past medications found.</div>
            )}
            {historyMedications.filter((med: any) => {
              const hasEndDate = !!med.end_date;
              if (!hasEndDate) return false; // No end date = not past
              
              // Convert end_date to date string (YYYY-MM-DD) for comparison
              const endDateStr = med.end_date ? med.end_date.slice(0, 10) : null;
              const todayStr = format(new Date(), "yyyy-MM-dd");
              
              return endDateStr && endDateStr <= todayStr;
            }).map((med: any) => {
              const medId = med.id || med._id;
              const isEditing = editingMedicationId === medId;
              return (
                <div key={medId} className="mb-2 border rounded p-2 bg-white/80 relative group">
                  {isEditing && (user?.role === 'admin' || user?.role === 'veterinarian') ? (
                    <form onSubmit={e => { e.preventDefault(); handleSaveEditMedication(medId); }} className="space-y-1">
                      <div>
                        <label className="block text-xs font-medium mb-1">Medicine Name</label>
                        <Input
                          value={editingMedicationForm.medicine_name}
                          onChange={e => setEditingMedicationForm(f => ({ ...f, medicine_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Dosage</label>
                        <Input
                          value={editingMedicationForm.dosage}
                          onChange={e => setEditingMedicationForm(f => ({ ...f, dosage: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">Start Date</label>
                          <Input
                            type="date"
                            value={editingMedicationForm.start_date}
                            onChange={e => setEditingMedicationForm(f => ({ ...f, start_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">End Date (optional)</label>
                          <Input
                            type="date"
                            value={editingMedicationForm.end_date}
                            onChange={e => setEditingMedicationForm(f => ({ ...f, end_date: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button type="submit" size="sm" disabled={editMedicationLoading}>Save</Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleCancelEditMedication} disabled={editMedicationLoading}>Cancel</Button>
                        {(user?.role === 'admin' || user?.role === 'veterinarian') && (!med.end_date || new Date(med.end_date) >= new Date()) && (
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleEndMedication(medId)} disabled={editMedicationLoading}>End</Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <>
                      <div><strong>Name:</strong> {med.medicine_name}</div>
                      <div><strong>Dosage:</strong> {med.dosage}</div>
                      <div><strong>Start:</strong> {med.start_date ? med.start_date.slice(0, 10) : ''}</div>
                      <div><strong>End:</strong> {med.end_date ? med.end_date.slice(0, 10) : <span className="italic">Ongoing</span>}</div>
                      {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditMedication(med)}
                            aria-label="Edit medication"
                            disabled={editMedicationLoading}
                          >
                            ✎
                          </Button>
                          {user?.role === 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                aria-label="Delete medication"
                                disabled={editMedicationLoading}
                              >
                                🗑️
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
                                  onClick={() => handleDeleteMedication(medId)}
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
              );
            })}
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowPastMeds(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 