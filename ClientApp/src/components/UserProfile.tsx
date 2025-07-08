// ClientApp/src/components/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  ContactPhone as EmergencyIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Input } from './ui';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// Zod validation schemas
const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+64\d{8,9}$/.test(val),
      'Phone number must be in format +64XXXXXXXX'
    ),
  
  preferredLanguage: z
    .enum(['English', 'Chinese'], {
      errorMap: () => ({ message: 'Please select a preferred language' }),
    }),
  
  emergencyContact: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 2 && val.length <= 100),
      'Emergency contact name must be between 2 and 100 characters'
    ),
  
  emergencyPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+64\d{8,9}$/.test(val),
      'Emergency phone must be in format +64XXXXXXXX'
    ),
});

const verificationSchema = z.object({
  documentReferences: z
    .string()
    .min(10, 'Document references must be at least 10 characters')
    .max(500, 'Document references must be less than 500 characters'),
});

// TypeScript interfaces
type UserProfileFormData = z.infer<typeof userProfileSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  preferredLanguage: string;
  isVerified: boolean;
  emergencyContact?: string;
  emergencyPhone?: string;
  rating: number;
  totalRatings: number;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserStats {
  totalFlightCompanionRequests: number;
  totalFlightCompanionOffers: number;
  totalPickupRequests: number;
  totalPickupOffers: number;
  completedServices: number;
  averageRating: number;
  totalRatings: number;
}

interface UserProfileProps {}

const UserProfile: React.FC<UserProfileProps> = () => {
  // State Management
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Redux Integration
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Profile Form
  const profileForm = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      preferredLanguage: 'English',
      emergencyContact: '',
      emergencyPhone: '',
    },
  });

  // Verification Form
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentReferences: '',
    },
  });

  // Helper Functions
  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = (): void => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Data Fetching
  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data: UserProfile = await response.json();
      setProfile(data);

      // Update form with fetched data
      profileForm.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || '',
        preferredLanguage: data.preferredLanguage as 'English' | 'Chinese',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data: UserStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showSnackbar('Error loading statistics', 'error');
    }
  };

  // Event Handlers
  const handleEditToggle = (): void => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form to original values when canceling
      profileForm.reset({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phoneNumber: profile?.phoneNumber || '',
        preferredLanguage: (profile?.preferredLanguage as 'English' | 'Chinese') || 'English',
        emergencyContact: profile?.emergencyContact || '',
        emergencyPhone: profile?.emergencyPhone || '',
      });
    }
  };

  const handleProfileSubmit = async (data: UserProfileFormData): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile: UserProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      showSnackbar('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (data: VerificationFormData): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch('/api/user/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit verification');

      showSnackbar('Verification documents submitted successfully!', 'success');
      setShowVerificationDialog(false);
      verificationForm.reset();
      
      // Refresh profile to get updated verification status
      await fetchProfile();
    } catch (error) {
      console.error('Error submitting verification:', error);
      showSnackbar('Error submitting verification documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchStats();
    }
  }, [isAuthenticated]);

  // Render loading state
  if (loading && !profile) {
    return (
      <Container maxWidth="lg" className="py-6">
        <Box className="flex justify-center items-center py-12">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  // Render unauthenticated state
  if (!isAuthenticated || !profile) {
    return (
      <Container maxWidth="lg" className="py-6">
        <Alert severity="warning">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  // Render Stars for Rating
  const renderStars = (rating: number): JSX.Element => (
    <Box className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <Typography variant="body2" className="ml-2 text-gray-600">
        {rating.toFixed(1)} ({profile.totalRatings} reviews)
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Box className="mb-6">
        <Typography
          variant="h3"
          component="h1"
          className="mb-2 font-bold text-gray-800 dark:text-white"
        >
          User Profile
        </Typography>
        <Typography
          variant="h6"
          className="text-gray-600 dark:text-gray-300"
        >
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent className="p-6">
              <Box className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-semibold">
                  Profile Information
                </Typography>
                <Button
                  variant={isEditing ? "outlined" : "contained"}
                  startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" className="mb-3 text-gray-700 dark:text-gray-300">
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.TextField
                          {...field}
                          label="First Name"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.TextField
                          {...field}
                          label="Last Name"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Input.TextField
                      label="Email"
                      value={profile.email}
                      disabled={true}
                      fullWidth
                      helperText="Email cannot be changed"
                      startAdornment={<EmailIcon className="text-gray-400" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phoneNumber"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.TextField
                          {...field}
                          label="Phone Number"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || "Format: +64XXXXXXXX"}
                          fullWidth
                          placeholder="+64 21 123 4567"
                          startAdornment={<PhoneIcon className="text-gray-400" />}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferredLanguage"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.Select
                          {...field}
                          label="Preferred Language"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                          options={[
                            { value: 'English', label: 'English' },
                            { value: 'Chinese', label: 'Chinese' },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  {/* Emergency Contact */}
                  <Grid item xs={12}>
                    <Divider className="my-4" />
                    <Typography variant="h6" className="mb-3 text-gray-700 dark:text-gray-300">
                      Emergency Contact
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="emergencyContact"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.TextField
                          {...field}
                          label="Emergency Contact Name"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                          startAdornment={<EmergencyIcon className="text-gray-400" />}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="emergencyPhone"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <Input.TextField
                          {...field}
                          label="Emergency Contact Phone"
                          disabled={!isEditing}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || "Format: +64XXXXXXXX"}
                          fullWidth
                          placeholder="+64 21 123 4567"
                          startAdornment={<PhoneIcon className="text-gray-400" />}
                        />
                      )}
                    />
                  </Grid>

                  {/* Save Button */}
                  {isEditing && (
                    <Grid item xs={12}>
                      <Box className="flex justify-end gap-3 pt-4">
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Profile Summary */}
          <Card className="mb-4">
            <CardContent className="text-center p-6">
              <Avatar
                className="mx-auto mb-4 w-20 h-20 bg-blue-600"
                sx={{ width: 80, height: 80 }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" className="font-semibold mb-2">
                {profile.firstName} {profile.lastName}
              </Typography>
              
              <Box className="flex justify-center items-center gap-2 mb-3">
                {profile.isVerified ? (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<SecurityIcon />}
                    label="Unverified"
                    color="warning"
                    size="small"
                  />
                )}
                <Chip
                  icon={<LanguageIcon />}
                  label={profile.preferredLanguage}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {renderStars(profile.rating)}

              <Typography variant="body2" className="text-gray-600 mt-3">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </Typography>

              {!profile.isVerified && (
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setShowVerificationDialog(true)}
                  className="mt-4"
                  fullWidth
                >
                  Submit Verification
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card>
              <CardContent className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  Activity Statistics
                </Typography>
                
                <Box className="space-y-3">
                  <Box className="flex justify-between">
                    <Typography variant="body2">Requests Created:</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {stats.totalFlightCompanionRequests + stats.totalPickupRequests}
                    </Typography>
                  </Box>
                  
                  <Box className="flex justify-between">
                    <Typography variant="body2">Services Offered:</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {stats.totalFlightCompanionOffers + stats.totalPickupOffers}
                    </Typography>
                  </Box>
                  
                  <Box className="flex justify-between">
                    <Typography variant="body2">Completed Services:</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {stats.completedServices}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box className="flex justify-between">
                    <Typography variant="body2">Average Rating:</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {stats.averageRating.toFixed(1)}/5.0
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" className="flex items-center gap-2">
            <SecurityIcon />
            Submit Verification Documents
          </Typography>
        </DialogTitle>

        <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}>
          <DialogContent>
            <Typography variant="body2" className="mb-4 text-gray-600">
              Please provide references to your identification documents. This helps us verify your identity and build trust in our community.
            </Typography>

            <Controller
              name="documentReferences"
              control={verificationForm.control}
              render={({ field, fieldState }) => (
                <Input.TextField
                  {...field}
                  label="Document References"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || "e.g., Passport number, Driver's license number, etc."}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Please provide document references that can be used to verify your identity..."
                />
              )}
            />
          </DialogContent>

          <DialogActions className="p-4">
            <Button
              onClick={() => setShowVerificationDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;