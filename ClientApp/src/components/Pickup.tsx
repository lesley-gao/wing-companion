import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  LocalTaxi as TaxiIcon,
  Add as AddIcon,
  ContactMail as ContactIcon,
  LocationOn as LocationIcon,
  Flight as FlightIcon,
  Person as PersonIcon,
  Luggage as LuggageIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearError } from '../store/slices/pickupSlice';

// TypeScript Interfaces
interface PickupRequest {
  id: number;
  userId: number;
  flightNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  airport: string;
  destinationAddress: string;
  passengerName?: string;
  passengerPhone?: string;
  passengerCount: number;
  hasLuggage: boolean;
  offeredAmount: number;
  specialRequests?: string;
  isActive: boolean;
  isMatched: boolean;
  createdAt: string;
  matchedOfferId?: number;
  matchedOffer?: PickupOffer;
}

interface PickupOffer {
  id: number;
  userId: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  airport: string;
  vehicleType?: string;
  maxPassengers: number;
  canHandleLuggage: boolean;
  serviceArea?: string;
  baseRate: number;
  languages?: string;
  additionalServices?: string;
  isAvailable: boolean;
  createdAt: string;
  totalPickups: number;
  averageRating: number;
}

interface RequestFormData {
  flightNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  airport: string;
  destinationAddress: string;
  passengerName: string;
  passengerPhone: string;
  passengerCount: number;
  hasLuggage: boolean;
  offeredAmount: number;
  specialRequests: string;
}

interface OfferFormData {
  airport: string;
  vehicleType: string;
  maxPassengers: number;
  canHandleLuggage: boolean;
  serviceArea: string;
  baseRate: number;
  languages: string;
  additionalServices: string;
}

interface PickupProps {}

// Main Component
const Pickup: React.FC<PickupProps> = () => {
  // Redux State
  const dispatch = useAppDispatch();
  const { requests, offers, isLoading, error } = useAppSelector((state) => state.pickup);

  // Local State
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [formType, setFormType] = useState<'request' | 'offer'>('request');
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Form Data State
  const [requestFormData, setRequestFormData] = useState<RequestFormData>({
    flightNumber: '',
    arrivalDate: '',
    arrivalTime: '',
    airport: 'AKL',
    destinationAddress: '',
    passengerName: '',
    passengerPhone: '',
    passengerCount: 1,
    hasLuggage: true,
    offeredAmount: 0,
    specialRequests: '',
  });

  const [offerFormData, setOfferFormData] = useState<OfferFormData>({
    airport: 'AKL',
    vehicleType: '',
    maxPassengers: 4,
    canHandleLuggage: true,
    serviceArea: '',
    baseRate: 0,
    languages: '',
    additionalServices: '',
  });

  // Mock data for local state (replace with Redux actions in production)
  const [localRequests, setLocalRequests] = useState<PickupRequest[]>([]);
  const [localOffers, setLocalOffers] = useState<PickupOffer[]>([]);

  // Helper Functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info'): void => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = (): void => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resetRequestForm = (): void => {
    setRequestFormData({
      flightNumber: '',
      arrivalDate: '',
      arrivalTime: '',
      airport: 'AKL',
      destinationAddress: '',
      passengerName: '',
      passengerPhone: '',
      passengerCount: 1,
      hasLuggage: true,
      offeredAmount: 0,
      specialRequests: '',
    });
  };

  const resetOfferForm = (): void => {
    setOfferFormData({
      airport: 'AKL',
      vehicleType: '',
      maxPassengers: 4,
      canHandleLuggage: true,
      serviceArea: '',
      baseRate: 0,
      languages: '',
      additionalServices: '',
    });
  };

  // Data Fetching Functions
  const fetchRequests = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/pickup/requests');
      if (response.ok) {
        const data = await response.json();
        setLocalRequests(data);
      } else {
        showSnackbar('Failed to fetch pickup requests', 'error');
      }
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
      showSnackbar('Error fetching pickup requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/pickup/offers');
      if (response.ok) {
        const data = await response.json();
        setLocalOffers(data);
      } else {
        showSnackbar('Failed to fetch pickup offers', 'error');
      }
    } catch (error) {
      console.error('Error fetching pickup offers:', error);
      showSnackbar('Error fetching pickup offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchRequests();
    fetchOffers();
  }, []);

  useEffect(() => {
    if (error) {
      showSnackbar(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Event Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const handleRequestInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    
    setRequestFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleOfferInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    
    setOfferFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleRequestSelectChange = (event: SelectChangeEvent<string | number>): void => {
    const { name, value } = event.target;
    setRequestFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOfferSelectChange = (event: SelectChangeEvent<string | number>): void => {
    const { name, value } = event.target;
    setOfferFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateRequest = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/pickup/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestFormData,
          userId: 1, // Replace with actual user ID from auth
        }),
      });

      if (response.ok) {
        showSnackbar('Pickup request created successfully!', 'success');
        setShowCreateDialog(false);
        resetRequestForm();
        await fetchRequests();
      } else {
        showSnackbar('Failed to create pickup request', 'error');
      }
    } catch (error) {
      console.error('Error creating pickup request:', error);
      showSnackbar('Error creating pickup request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/pickup/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offerFormData,
          userId: 1, // Replace with actual user ID from auth
        }),
      });

      if (response.ok) {
        showSnackbar('Pickup offer created successfully!', 'success');
        setShowCreateDialog(false);
        resetOfferForm();
        await fetchOffers();
      } else {
        showSnackbar('Failed to create pickup offer', 'error');
      }
    } catch (error) {
      console.error('Error creating pickup offer:', error);
      showSnackbar('Error creating pickup offer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContactDriver = (offer: PickupOffer): void => {
    // Implement contact functionality
    showSnackbar(`Contacting driver for ${offer.vehicleType}`, 'info');
  };

  const handleContactPassenger = (request: PickupRequest): void => {
    // Implement contact functionality
    showSnackbar(`Contacting passenger for ${request.flightNumber}`, 'info');
  };

  const openCreateDialog = (type: 'request' | 'offer'): void => {
    setFormType(type);
    setShowCreateDialog(true);
  };

  // Render Functions
  const renderRequestCard = (request: PickupRequest): JSX.Element => (
    <Card key={request.id} className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent>
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex items-center space-x-3">
            <FlightIcon className="text-blue-600" />
            <Box>
              <Typography variant="h6" className="font-semibold text-gray-900">
                {request.flightNumber}
              </Typography>
              <Chip 
                label={request.airport} 
                size="small" 
                className="bg-blue-100 text-blue-800"
              />
            </Box>
          </Box>
          <Chip 
            label={`NZD $${request.offeredAmount}`}
            className="bg-green-100 text-green-800 font-semibold"
          />
        </Box>

        <Box className="space-y-3">
          <Box className="flex items-center justify-between text-sm text-gray-600">
            <Box className="flex items-center space-x-2">
              <ScheduleIcon fontSize="small" />
              <span>{new Date(request.arrivalDate).toLocaleDateString()}</span>
              <span>{request.arrivalTime}</span>
            </Box>
          </Box>

          <Box className="flex items-start space-x-2">
            <LocationIcon fontSize="small" className="text-gray-400 mt-1" />
            <Typography variant="body2" className="text-gray-700">
              <strong>To:</strong> {request.destinationAddress}
            </Typography>
          </Box>

          <Box className="flex items-center space-x-4 text-sm">
            <Box className="flex items-center space-x-1">
              <PersonIcon fontSize="small" className="text-gray-400" />
              <span><strong>Passengers:</strong> {request.passengerCount}</span>
            </Box>
            {request.hasLuggage && (
              <Chip 
                icon={<LuggageIcon />} 
                label="Has Luggage" 
                size="small"
                className="bg-blue-50 text-blue-700"
              />
            )}
          </Box>

          {request.passengerName && (
            <Typography variant="body2" className="text-gray-600">
              <strong>Contact:</strong> {request.passengerName}
            </Typography>
          )}

          {request.specialRequests && (
            <Typography variant="body2" className="text-gray-600">
              <strong>Special Requests:</strong> {request.specialRequests}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions className="justify-between bg-gray-50">
        <Chip 
          label={request.isMatched ? 'Driver Found' : 'Looking for Driver'}
          color={request.isMatched ? 'success' : 'default'}
          variant={request.isMatched ? 'filled' : 'outlined'}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContactIcon />}
          onClick={() => handleContactPassenger(request)}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          Contact
        </Button>
      </CardActions>
    </Card>
  );

  const renderOfferCard = (offer: PickupOffer): JSX.Element => (
    <Card key={offer.id} className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent>
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex items-center space-x-3">
            <TaxiIcon className="text-green-600" />
            <Box>
              <Typography variant="h6" className="font-semibold text-gray-900">
                {offer.vehicleType || 'Vehicle'}
              </Typography>
              <Chip 
                label={offer.airport} 
                size="small" 
                className="bg-blue-100 text-blue-800"
              />
            </Box>
          </Box>
          <Chip 
            label={`From NZD $${offer.baseRate}`}
            className="bg-green-100 text-green-800 font-semibold"
          />
        </Box>

        <Box className="space-y-3">
          <Box className="flex items-center space-x-4 text-sm">
            <span><strong>Capacity:</strong> {offer.maxPassengers} passengers</span>
            {offer.canHandleLuggage && (
              <Chip 
                icon={<LuggageIcon />} 
                label="Luggage OK" 
                size="small"
                className="bg-green-50 text-green-700"
              />
            )}
          </Box>

          {offer.serviceArea && (
            <Typography variant="body2" className="text-gray-600">
              <strong>Service Area:</strong> {offer.serviceArea}
            </Typography>
          )}

          {offer.languages && (
            <Typography variant="body2" className="text-gray-600">
              <strong>Languages:</strong> {offer.languages}
            </Typography>
          )}

          {offer.additionalServices && (
            <Typography variant="body2" className="text-gray-600">
              <strong>Additional Services:</strong> {offer.additionalServices}
            </Typography>
          )}

          <Box className="flex items-center space-x-2 text-sm text-gray-600">
            <span><strong>Experience:</strong> {offer.totalPickups} pickups completed</span>
            {offer.averageRating > 0 && (
              <Box className="flex items-center space-x-1">
                <StarIcon fontSize="small" className="text-yellow-500" />
                <span>{offer.averageRating.toFixed(1)}</span>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions className="justify-between bg-gray-50">
        <Chip 
          label="Available"
          color="success"
          variant="filled"
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<ContactIcon />}
          onClick={() => handleContactDriver(offer)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Contact Driver
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Header */}
      <Paper elevation={0} className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <Box className="text-center">
          <Typography variant="h3" component="h1" className="font-bold text-gray-900 mb-2">
            Airport Pickup Service
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Connect with reliable drivers for airport transfers
          </Typography>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={1} className="mb-6">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          className="border-b border-gray-200"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            icon={<FlightIcon />} 
            label={`Pickup Requests (${localRequests.length})`}
            className="text-gray-700 hover:text-blue-600"
          />
          <Tab 
            icon={<TaxiIcon />} 
            label={`Available Drivers (${localOffers.length})`}
            className="text-gray-700 hover:text-blue-600"
          />
        </Tabs>
      </Paper>

      {/* Action Buttons */}
      <Box className="flex justify-center mb-6">
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => openCreateDialog(activeTab === 0 ? 'request' : 'offer')}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-white font-semibold"
        >
          {activeTab === 0 ? 'Request Pickup' : 'Offer Pickup Service'}
        </Button>
      </Box>

      {/* Content */}
      <Box>
        {activeTab === 0 && (
          <Box>
            {loading ? (
              <Box className="flex justify-center py-8">
                <CircularProgress />
              </Box>
            ) : localRequests.length === 0 ? (
              <Paper className="p-12 text-center bg-gray-50">
                <FlightIcon className="text-gray-400 text-6xl mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  No pickup requests yet
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Be the first to request a pickup!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {localRequests.map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    {renderRequestCard(request)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {loading ? (
              <Box className="flex justify-center py-8">
                <CircularProgress />
              </Box>
            ) : localOffers.length === 0 ? (
              <Paper className="p-12 text-center bg-gray-50">
                <TaxiIcon className="text-gray-400 text-6xl mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  No drivers available yet
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Be the first to offer pickup services!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {localOffers.map((offer) => (
                  <Grid item xs={12} md={6} key={offer.id}>
                    {renderOfferCard(offer)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>

      {/* Create Request/Offer Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-gray-50 border-b">
          <Typography variant="h6" className="font-semibold">
            {formType === 'request' ? 'Request Airport Pickup' : 'Offer Pickup Service'}
          </Typography>
        </DialogTitle>

        <DialogContent className="p-6">
          {formType === 'request' ? (
            <form onSubmit={handleCreateRequest}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="flightNumber"
                    label="Flight Number"
                    value={requestFormData.flightNumber}
                    onChange={handleRequestInputChange}
                    fullWidth
                    required
                    placeholder="e.g., NZ289"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Airport</InputLabel>
                    <Select
                      name="airport"
                      value={requestFormData.airport}
                      onChange={handleRequestSelectChange}
                      label="Airport"
                    >
                      <MenuItem value="AKL">Auckland (AKL)</MenuItem>
                      <MenuItem value="WLG">Wellington (WLG)</MenuItem>
                      <MenuItem value="CHC">Christchurch (CHC)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="arrivalDate"
                    label="Arrival Date"
                    type="date"
                    value={requestFormData.arrivalDate}
                    onChange={handleRequestInputChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="arrivalTime"
                    label="Arrival Time"
                    type="time"
                    value={requestFormData.arrivalTime}
                    onChange={handleRequestInputChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="destinationAddress"
                    label="Destination Address"
                    value={requestFormData.destinationAddress}
                    onChange={handleRequestInputChange}
                    fullWidth
                    required
                    placeholder="e.g., 123 Queen Street, Auckland City"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="passengerName"
                    label="Passenger Name"
                    value={requestFormData.passengerName}
                    onChange={handleRequestInputChange}
                    fullWidth
                    placeholder="Name of person being picked up"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="passengerPhone"
                    label="Passenger Phone"
                    type="tel"
                    value={requestFormData.passengerPhone}
                    onChange={handleRequestInputChange}
                    fullWidth
                    placeholder="+64 21 123 4567"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Passengers</InputLabel>
                    <Select
                      name="passengerCount"
                      value={requestFormData.passengerCount}
                      onChange={handleRequestSelectChange}
                      label="Number of Passengers"
                    >
                      <MenuItem value={1}>1 person</MenuItem>
                      <MenuItem value={2}>2 people</MenuItem>
                      <MenuItem value={3}>3 people</MenuItem>
                      <MenuItem value={4}>4+ people</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="offeredAmount"
                    label="Offered Amount (NZD)"
                    type="number"
                    value={requestFormData.offeredAmount}
                    onChange={handleRequestInputChange}
                    fullWidth
                    inputProps={{ min: 0, max: 200 }}
                    placeholder="50"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasLuggage"
                        checked={requestFormData.hasLuggage}
                        onChange={handleRequestInputChange}
                      />
                    }
                    label="Has luggage"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="specialRequests"
                    label="Special Requests"
                    value={requestFormData.specialRequests}
                    onChange={handleRequestInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="e.g., Elderly passengers, large luggage, Chinese speaking driver preferred..."
                  />
                </Grid>
              </Grid>

              {/* Move the submit button inside the form */}
              <Box className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading && <CircularProgress size={20} className="mr-2" />}
                  Create Request
                </Button>
              </Box>
            </form>
          ) : (
            <form onSubmit={handleCreateOffer}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Airport</InputLabel>
                    <Select
                      name="airport"
                      value={offerFormData.airport}
                      onChange={handleOfferSelectChange}
                      label="Airport"
                    >
                      <MenuItem value="AKL">Auckland (AKL)</MenuItem>
                      <MenuItem value="WLG">Wellington (WLG)</MenuItem>
                      <MenuItem value="CHC">Christchurch (CHC)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="vehicleType"
                    label="Vehicle Type"
                    value={offerFormData.vehicleType}
                    onChange={handleOfferInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Sedan, SUV, Van"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="maxPassengers"
                    label="Maximum Passengers"
                    type="number"
                    value={offerFormData.maxPassengers}
                    onChange={handleOfferInputChange}
                    fullWidth
                    required
                    inputProps={{ min: 1, max: 8 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="baseRate"
                    label="Base Rate (NZD)"
                    type="number"
                    value={offerFormData.baseRate}
                    onChange={handleOfferInputChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, max: 200 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="serviceArea"
                    label="Service Area"
                    value={offerFormData.serviceArea}
                    onChange={handleOfferInputChange}
                    fullWidth
                    placeholder="e.g., Auckland City, North Shore, All Auckland"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="languages"
                    label="Languages"
                    value={offerFormData.languages}
                    onChange={handleOfferInputChange}
                    fullWidth
                    placeholder="e.g., Chinese, English"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="canHandleLuggage"
                        checked={offerFormData.canHandleLuggage}
                        onChange={handleOfferInputChange}
                      />
                    }
                    label="Can handle luggage"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="additionalServices"
                    label="Additional Services"
                    value={offerFormData.additionalServices}
                    onChange={handleOfferInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="e.g., Can help with shopping, Know Chinese areas, Airport meet and greet"
                  />
                </Grid>
              </Grid>

              {/* Move the submit button inside the form */}
              <Box className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading && <CircularProgress size={20} className="mr-2" />}
                  Create Offer
                </Button>
              </Box>
            </form>
          )}
        </DialogContent>

        {/* Remove DialogActions completely since buttons are now in the form */}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Pickup;