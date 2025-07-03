import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Save, Edit, X, Shield, ArrowLeft, Trash2, AlertTriangle, Building2, Database, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import { requestEmailChangeOTP, verifyEmailChangeOTP, requestPasswordChangeOTP, changePasswordWithOTP } from '@/services/settingsApi';

export function ProfileSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [emailStep, setEmailStep] = useState<'form' | 'otp' | 'success'>('form');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeStep, setPasswordChangeStep] = useState<'form' | 'otp' | 'success'>('form');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordResendTimer, setPasswordResendTimer] = useState(60);
  // Password validation regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  const passwordValid = passwordRegex.test(newPassword);
  const navigate = useNavigate();
  const { user, updateUser, logout } = useUser();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailStep === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailStep, resendTimer]);

  // Password resend timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPasswordChange && passwordChangeStep === 'otp' && passwordResendTimer > 0) {
      timer = setTimeout(() => setPasswordResendTimer(passwordResendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showPasswordChange, passwordChangeStep, passwordResendTimer]);

  const handleSave = async () => {
    try {
      if (user && formData.email !== user.email) {
        // Email changed, start OTP flow
        setNewEmail(formData.email);
        setOtp('');
        setOtpError('');
        setOtpLoading(true);
        await requestEmailChangeOTP(formData.email, localStorage.getItem('token')!);
        setEmailStep('otp');
        setResendTimer(60);
        toast.success('OTP sent to new email. Please verify.');
        setOtpLoading(false);
        return;
      }
      // Call the backend API to update profile
      const response = await authApi.updateProfile(formData.name, formData.email);
      
      // Update localStorage with new user data and token
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      // Update global user context (this will update navbar automatically)
      updateUser(response.user);
      setIsEditing(false);
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      setOtpLoading(false);
      // Handle specific error cases
      if (error?.response?.data?.error?.includes('Email is already in use by another user')) {
        toast.error("Email already registered. Please use a different email.");
      } else {
        toast.error(error?.response?.data?.error || "Failed to update profile");
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      await verifyEmailChangeOTP(newEmail, otp, localStorage.getItem('token')!);
      // Update user context and localStorage
      const updatedUser = { ...user, email: newEmail };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEmailStep('success');
      toast.success('Email updated successfully!');
      setTimeout(() => {
        setEmailStep('form');
        setIsEditing(false);
        setOtp('');
        setNewEmail('');
        setFormData({ ...formData, email: newEmail });
      }, 2000);
    } catch (err: any) {
      setOtpError(err?.response?.data?.error || 'OTP verification failed');
      toast.error(err?.response?.data?.error || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await requestEmailChangeOTP(newEmail, localStorage.getItem('token')!);
      setResendTimer(60);
      toast.success('OTP resent to your new email.');
    } catch (err: any) {
      setOtpError(err?.response?.data?.error || 'Failed to resend OTP');
      toast.error(err?.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Password change handlers
  const handleRequestPasswordOtp = async () => {
    setPasswordChangeError("");
    if (!passwordValid) {
      setPasswordChangeError("Password does not meet requirements.");
      return;
    }
    setPasswordChangeLoading(true);
    try {
      await requestPasswordChangeOTP(localStorage.getItem('token')!);
      setPasswordChangeStep('otp');
      setPasswordResendTimer(60);
      toast.success('OTP sent to your email.');
    } catch (err: any) {
      setPasswordChangeError(err?.response?.data?.error || 'Failed to send OTP');
      toast.error(err?.response?.data?.error || 'Failed to send OTP');
    } finally {
      setPasswordChangeLoading(false);
    }
  };
  const handleVerifyPasswordOtp = async () => {
    setPasswordChangeError("");
    setPasswordChangeLoading(true);
    try {
      await changePasswordWithOTP(newPassword, passwordOtp, localStorage.getItem('token')!);
      setPasswordChangeStep('success');
      toast.success('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordChangeStep('form');
        setNewPassword("");
        setPasswordOtp("");
      }, 2000);
    } catch (err: any) {
      setPasswordChangeError(err?.response?.data?.error || 'Failed to change password');
      toast.error(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordChangeLoading(false);
    }
  };
  const handleResendPasswordOtp = async () => {
    setPasswordChangeError("");
    setPasswordChangeLoading(true);
    try {
      await requestPasswordChangeOTP(localStorage.getItem('token')!);
      setPasswordResendTimer(60);
      toast.success('OTP resent to your email.');
    } catch (err: any) {
      setPasswordChangeError(err?.response?.data?.error || 'Failed to resend OTP');
      toast.error(err?.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || ""
    });
    setIsEditing(false);
    // Reset OTP state when canceling
    setEmailStep('form');
    setOtp('');
    setOtpError('');
    setNewEmail('');
  };

  const getDeleteWarningMessage = () => {
    if (!user) return {
      title: "",
      description: "",
      items: [],
      severity: "medium" as const
    };
    
    switch (user.role) {
      case 'admin':
        if (user.farm_id) {
          return {
            title: "Farm Owner Account Deletion",
            description: "This will permanently delete your account AND your entire farm, including:",
            items: [
              "All animals in your farm",
              "All yield records",
              "All health records and medications",
              "All checkup records",
              "All return logs",
              "All other users associated with your farm",
              "The farm itself"
            ],
            severity: "critical" as const
          };
        } else {
          return {
            title: "System Admin Account Deletion",
            description: "This will permanently delete your admin account. Note:",
            items: [
              "You cannot delete the last admin account",
              "Only your user account will be removed",
              "No farm or animal data will be affected"
            ],
            severity: "high" as const
          };
        }
      case 'veterinarian':
        return {
          title: "Veterinarian Account Deletion",
          description: "This will permanently delete your account. Note:",
          items: [
            "Your account will be removed",
            "Any health records you created will remain",
            "Other users can still access the data"
          ],
          severity: "medium" as const
        };
      case 'farm_worker':
        return {
          title: "Farm Worker Account Deletion",
          description: "This will permanently delete your account. Note:",
          items: [
            "Your account will be removed",
            "Any records you created will remain",
            "Other users can still access the data"
          ],
          severity: "medium" as const
        };
      default:
        return {
          title: "User Account Deletion",
          description: "This will permanently delete your account. Note:",
          items: [
            "Your account will be removed",
            "Any records you created will remain",
            "Other users can still access the data"
          ],
          severity: "medium" as const
        };
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update context
      logout();
      
      toast.success("Account deleted successfully");
      
      // Redirect to login
      navigate('/login');
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      if (error?.response?.data?.error?.includes('last admin account')) {
        toast.error("Cannot delete the last admin account. Please create another admin account first.");
      } else {
        toast.error(error?.response?.data?.error || "Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const warningMessage = getDeleteWarningMessage();

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
            <User className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Profile Settings</CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {user ? (
            <>
              {/* Profile Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
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
                    <Label htmlFor="user-name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="user-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="user-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Change OTP Step */}
                  {emailStep === 'otp' && (
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          className="text-center text-base font-mono tracking-wider"
                          maxLength={6}
                        />
                      </div>
                      {otpError && (
                        <div className="text-red-500 text-sm text-center">{otpError}</div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={handleVerifyOtp}
                          className="flex-1"
                          disabled={otpLoading}
                        >
                          {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0 || otpLoading}
                        >
                          {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Success Step */}
                  {emailStep === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center max-w-sm mx-auto">
                      <Mail className="h-5 w-5 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 text-sm font-medium">Email updated successfully!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Role</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">User ID</span>
                    </div>
                    <code className="text-xs font-mono text-muted-foreground">
                      {user.id || user._id}
                    </code>
                  </div>

                  {user.farm_id && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Farm ID</span>
                      </div>
                      <code className="text-xs font-mono text-muted-foreground">
                        {user.farm_id}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Security & Danger Zone Side by Side */}
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                {/* Security Section */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">Security</h3>
                  {!showPasswordChange ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-700 border-yellow-300"
                        onClick={() => setShowPasswordChange(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
                      {passwordChangeStep === 'form' && (
                        <>
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative mb-2">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                              onClick={() => setShowNewPassword(prev => !prev)}
                              tabIndex={-1}
                            >
                              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <ul className={`text-xs mt-1 ml-1 list-disc pl-5 ${newPassword && !passwordValid ? 'text-red-500' : 'text-muted-foreground'}`}>
                            <li>At least 8 characters long</li>
                            <li>At least 1 uppercase letter</li>
                            <li>At least 1 digit</li>
                            <li>At least 1 special character</li>
                          </ul>
                          {passwordChangeError && (
                            <div className="text-red-500 text-xs font-medium mt-2">{passwordChangeError}</div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button
                              type="button"
                              onClick={handleRequestPasswordOtp}
                              disabled={passwordChangeLoading}
                              className="flex-1"
                            >
                              {passwordChangeLoading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPasswordChange(false);
                                setPasswordChangeStep('form');
                                setNewPassword("");
                                setPasswordOtp("");
                                setPasswordChangeError("");
                              }}
                              disabled={passwordChangeLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}
                      {passwordChangeStep === 'otp' && (
                        <>
                          <Label htmlFor="password-otp">Enter OTP</Label>
                          <Input
                            id="password-otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={passwordOtp}
                            onChange={e => setPasswordOtp(e.target.value)}
                            required
                            className="text-center text-base font-mono tracking-wider"
                            maxLength={6}
                          />
                          {passwordChangeError && (
                            <div className="text-red-500 text-xs font-medium mt-2">{passwordChangeError}</div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button
                              type="button"
                              onClick={handleVerifyPasswordOtp}
                              disabled={passwordChangeLoading}
                              className="flex-1"
                            >
                              {passwordChangeLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleResendPasswordOtp}
                              disabled={passwordResendTimer > 0 || passwordChangeLoading}
                            >
                              {passwordResendTimer > 0 ? `Resend (${passwordResendTimer}s)` : 'Resend OTP'}
                            </Button>
                          </div>
                        </>
                      )}
                      {passwordChangeStep === 'success' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center max-w-sm mx-auto">
                          <Shield className="h-5 w-5 text-green-600 mx-auto mb-2" />
                          <p className="text-green-700 text-sm font-medium">Password changed successfully!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Danger Zone */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">Danger Zone</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex-1 w-full flex flex-col items-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                          setShowDeleteConfirmation(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Account Confirmation Dialog */}
              {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-full ${
                        warningMessage.severity === 'critical' ? 'bg-red-100' : 
                        warningMessage.severity === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          warningMessage.severity === 'critical' ? 'text-red-600' : 
                          warningMessage.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800">{warningMessage.title}</h3>
                        <p className="text-sm text-red-600">This action cannot be undone</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-red-700 mb-3">{warningMessage.description}</p>
                      <ul className="space-y-1">
                        {warningMessage.items.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {user.role === 'admin' && user.farm_id && (
                      <div className="p-4 bg-red-100 border border-red-300 rounded-lg mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4 text-red-600" />
                          <span className="font-semibold text-red-800">Critical Warning</span>
                        </div>
                        <p className="text-sm text-red-700">
                          As a farm owner, deleting your account will permanently remove your entire farm and all associated data. 
                          This includes all animals, records, and other users in your farm. This action is irreversible.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirmation(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            I Understand, Delete My Account
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No user information available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 