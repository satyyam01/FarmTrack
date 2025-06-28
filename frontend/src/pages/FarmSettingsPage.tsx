import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Save, Edit, X, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FarmSettingsPage() {
  const [farmInfo, setFarmInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: ""
  });
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  useEffect(() => {
    // Check permissions first
    if (!user || user.role !== 'admin' || !user.farm_id) {
      toast.error("Access denied. Farm owner privileges required.");
      navigate('/dashboard');
      return;
    }
    fetchFarmInfo();
  }, [user, navigate]);

  const fetchFarmInfo = async () => {
    try {
      setIsLoading(true);
      
      if (user?.farm_id) {
        const farmData = await authApi.getFarmById(user.farm_id);
        setFarmInfo(farmData);
        setFormData({
          name: farmData.name || "",
          location: farmData.location || ""
        });
      }
    } catch (error) {
      console.error("Error fetching farm info:", error);
      toast.error("Failed to load farm information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Call the backend API to update farm
      const response = await authApi.updateFarm(farmInfo._id, formData.name, formData.location);
      
      // Update local state with new farm data
      setFarmInfo(response.farm);
      setIsEditing(false);
      
      toast.success("Farm settings updated successfully!");
    } catch (error: any) {
      console.error("Error updating farm:", error);
      toast.error(error?.response?.data?.error || "Failed to update farm settings");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: farmInfo?.name || "",
      location: farmInfo?.location || ""
    });
    setIsEditing(false);
  };

  const handleDeleteFarm = async () => {
    try {
      setIsDeleting(true);
      
      const response = await authApi.deleteFarm(farmInfo._id, false);
      
      toast.success(response.message);
      
      // Clear user data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error: any) {
      console.error("Error deleting farm:", error);
      toast.error(error?.response?.data?.error || "Failed to delete farm");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl border bg-white/90">
          <CardHeader className="space-y-2 text-center border-b pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex-1" />
            </div>
            <div className="flex justify-center mb-2">
              <Building2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Farm Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border bg-white/90">
        <CardHeader className="space-y-2 text-center border-b pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex justify-center mb-2">
            <Building2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Farm Settings</CardTitle>
          <CardDescription>Manage your farm information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {farmInfo ? (
            <>
              {/* Farm Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Farm Information</h3>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name</Label>
                    {isEditing ? (
                      <Input
                        id="farm-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter farm name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{farmInfo.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farm-location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="farm-location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter farm location"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{farmInfo.location || "No location specified"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farm ID Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Farm ID</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">
                    Share this ID with users who want to join your farm
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                      {farmInfo._id}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(farmInfo._id);
                        toast.success("Farm ID copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dangerous Actions Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-600">Dangerous Actions</h3>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                  <p className="text-sm text-red-600">
                    This will permanently remove all farm data. All users associated with this farm will be disconnected.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Delete Farm */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeleting}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete Farm"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Alert!
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-4">
                            <p className="text-sm text-gray-700">
                              This action will permanently delete your farm and all associated data including:
                            </p>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                              <ul className="text-sm text-red-700 space-y-1">
                                <li className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>All animals and their records</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>All yield data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>All medication and checkup records</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>All return logs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>All user associations with this farm</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                              <p className="text-sm font-semibold text-red-800 text-center">
                                ⚠️ This action cannot be undone!
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteFarm}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            I Understand. Delete Farm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No farm information available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 