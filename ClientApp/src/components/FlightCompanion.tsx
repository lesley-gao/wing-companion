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
} from '@mui/material';
import {
  Flight as FlightIcon,
  Add as AddIcon,
  ContactMail as ContactIcon,
  Help as HelpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearError } from '../store/slices/flightCompanionSlice';

// TypeScript Interfaces
interface FlightCompanionRequest {
  id: number;
  userId: number;
  flightNumber: string;
  airline: string;
  flightDate: string;
  departureAirport: string;
  arrivalAirport: string;
  travelerName?: string;
  travelerAge?: string;
  specialNeeds?: string;
  offeredAmount: number;
  additionalNotes?: string;
  isActive: boolean;
  isMatched: boolean;
  createdAt: string;
}

interface FlightCompanionOffer {
  id: number;
  userId: number;
  flightNumber: string;
  airline: string;
  flightDate: string;
  departureAirport: string;
  arrivalAirport: string;
  availableServices?: string;
  languages?: string;
  requestedAmount: number;
  additionalInfo?: string;
  isAvailable: boolean;
  helpedCount: number;
  createdAt: string;
}

interface RequestFormData {
  userId: number;
  flightNumber: string;
  airline: string;
  flightDate: string;
  departureAirport: string;
  arrivalAirport: string;
  travelerName: string;
  travelerAge: string;
  specialNeeds: string;
  offeredAmount: number;
  additionalNotes: string;
}

interface FlightCompanionProps {}

// Main Component
const FlightCompanion: React.FC<FlightCompanionProps> = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<number>(0);
  const [requests, setRequests] = useState<FlightCompanionRequest[]>([]);
  const [offers, setOffers] = useState<FlightCompanionOffer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
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
  const { error } = useAppSelector((state) => state.flightCompanion);

  // Form Data
  const [formData, setFormData] = useState<RequestFormData>({
    userId: 1, // Temporary - will be from auth context
    flightNumber: '',
    airline: '',
    flightDate: '',
    departureAirport: '',
    arrivalAirport: '',
    travelerName: '',
    travelerAge: 'Adult',
    specialNeeds: '',
    offeredAmount: 0,
    additionalNotes: '',
  });

  // Airport Options
  const airportOptions = [
    { value: 'AKL', label: 'Auckland (AKL)' },
    { value: 'PVG', label: 'Shanghai (PVG)' },
    { value: 'PEK', label: 'Beijing (PEK)' },
    { value: 'CAN', label: 'Guangzhou (CAN)' },
  ];

  const travelerAgeOptions = [
    { value: 'Elderly', label: 'Elderly' },
    { value: 'Adult', label: 'Adult' },
    { value: 'Young Adult', label: 'Young Adult' },
  ];

  // Data Fetching
  const fetchRequests = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/flightcompanion/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showSnackbar('Error fetching requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/flightcompanion/offers');
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      showSnackbar('Error fetching offers', 'error');
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

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/flightcompanion/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          flightDate: new Date(formData.flightDate).toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create request');
      
      showSnackbar('Request created successfully!', 'success');
      setShowCreateForm(false);
      resetForm();
      await fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      showSnackbar('Error creating request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      userId: 1,
      flightNumber: '',
      airline: '',
      flightDate: '',
      departureAirport: '',
      arrivalAirport: '',
      travelerName: '',
      travelerAge: 'Adult',
      specialNeeds: '',
      offeredAmount: 0,
      additionalNotes: '',
    });
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ): void => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = (): void => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Render Components
  const renderRequestCard = (request: FlightCompanionRequest) => (
    <Card
      key={request.id}
      className="hover:shadow-lg transition-shadow duration-300"
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box className="flex justify-between items-start mb-3">
          <Box>
            <Typography variant="h6" className="flex items-center gap-2 text-gray-800 dark:text-white">
              <FlightIcon color="primary" />
              {request.flightNumber} - {request.airline}
            </Typography>
            <Typography variant="body2" color="primary" className="font-medium">
              {request.departureAirport} → {request.arrivalAirport}
            </Typography>
          </Box>
          <Chip
            label={`NZD $${request.offeredAmount}`}
            color="success"
            variant="filled"
            className="font-semibold"
          />
        </Box>

        <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
          <strong>Date:</strong> {new Date(request.flightDate).toLocaleDateString()}
        </Typography>

        {request.travelerName && (
          <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
            <PersonIcon className="inline w-4 h-4 mr-1" />
            <strong>Traveler:</strong> {request.travelerName}
          </Typography>
        )}

        {request.specialNeeds && (
          <Box className="mb-2">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
              <HelpIcon className="inline w-4 h-4 mr-1" />
              <strong>Help Needed:</strong>
            </Typography>
            <Typography variant="body2" className="ml-5 text-gray-700 dark:text-gray-200">
              {request.specialNeeds}
            </Typography>
          </Box>
        )}

        {request.additionalNotes && (
          <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
            <strong>Notes:</strong> {request.additionalNotes}
          </Typography>
        )}
      </CardContent>

      <CardActions className="justify-between bg-gray-50 dark:bg-gray-800">
        <Chip
          label={request.isMatched ? 'Matched' : 'Looking for Helper'}
          color={request.isMatched ? 'warning' : 'success'}
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<ContactIcon />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Contact
        </Button>
      </CardActions>
    </Card>
  );

  const renderOfferCard = (offer: FlightCompanionOffer) => (
    <Card
      key={offer.id}
      className="hover:shadow-lg transition-shadow duration-300"
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box className="flex justify-between items-start mb-3">
          <Box>
            <Typography variant="h6" className="flex items-center gap-2 text-gray-800 dark:text-white">
              <FlightIcon color="primary" />
              {offer.flightNumber} - {offer.airline}
            </Typography>
            <Typography variant="body2" color="primary" className="font-medium">
              {offer.departureAirport} → {offer.arrivalAirport}
            </Typography>
          </Box>
          <Chip
            label={`NZD $${offer.requestedAmount}`}
            color="success"
            variant="filled"
            className="font-semibold"
          />
        </Box>

        <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
          <strong>Date:</strong> {new Date(offer.flightDate).toLocaleDateString()}
        </Typography>

        <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
          <strong>Services:</strong> {offer.availableServices || 'General assistance'}
        </Typography>

        <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
          <strong>Languages:</strong> {offer.languages || 'Not specified'}
        </Typography>

        <Typography variant="body2" className="mb-2 text-gray-600 dark:text-gray-300">
          <strong>Experience:</strong> Helped {offer.helpedCount} travelers
        </Typography>
      </CardContent>

      <CardActions className="justify-between bg-gray-50 dark:bg-gray-800">
        <Chip
          label="Available"
          color="success"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<ContactIcon />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Contact Helper
        </Button>
      </CardActions>
    </Card>
  );

  const renderCreateForm = () => (
    <Dialog
      open={showCreateForm}
      onClose={() => setShowCreateForm(false)}
      maxWidth="md"
      fullWidth
      className="z-50"
    >
      <DialogTitle className="bg-primary-50 dark:bg-gray-800">
        <Typography variant="h5" className="flex items-center gap-2">
          <AddIcon />
          Request Flight Companion Help
        </Typography>
      </DialogTitle>

      <form onSubmit={handleFormSubmit}>
        <DialogContent className="space-y-4 pt-6">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="flightNumber"
                label="Flight Number"
                value={formData.flightNumber}
                onChange={handleInputChange}
                placeholder="e.g., NZ289"
                required
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="airline"
                label="Airline"
                value={formData.airline}
                onChange={handleInputChange}
                placeholder="e.g., Air New Zealand"
                required
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="flightDate"
                label="Flight Date"
                type="datetime-local"
                value={formData.flightDate}
                onChange={handleInputChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Traveler Age</InputLabel>
                <Select
                  name="travelerAge"
                  value={formData.travelerAge}
                  onChange={handleSelectChange}
                  label="Traveler Age"
                >
                  {travelerAgeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>From Airport</InputLabel>
                <Select
                  name="departureAirport"
                  value={formData.departureAirport}
                  onChange={handleSelectChange}
                  label="From Airport"
                >
                  {airportOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>To Airport</InputLabel>
                <Select
                  name="arrivalAirport"
                  value={formData.arrivalAirport}
                  onChange={handleSelectChange}
                  label="To Airport"
                >
                  {airportOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="travelerName"
                label="Traveler Name"
                value={formData.travelerName}
                onChange={handleInputChange}
                placeholder="e.g., My parents"
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="offeredAmount"
                label="Offered Amount (NZD)"
                type="number"
                value={formData.offeredAmount}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 500 }}
                placeholder="50"
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="specialNeeds"
                label="Special Needs/Help Required"
                value={formData.specialNeeds}
                onChange={handleInputChange}
                placeholder="e.g., Language translation, wheelchair assistance, airport navigation..."
                multiline
                rows={3}
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="additionalNotes"
                label="Additional Notes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any other information that might be helpful..."
                multiline
                rows={2}
                fullWidth
                className="bg-white dark:bg-gray-700"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="bg-gray-50 dark:bg-gray-800 p-4">
          <Button
            onClick={() => setShowCreateForm(false)}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  // Main Render
  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Box className="text-center mb-8">
        <Typography
          variant="h3"
          component="h1"
          className="mb-4 font-bold text-gray-800 dark:text-white"
        >
          Flight Companion Service
        </Typography>
        <Typography
          variant="h6"
          className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Connect with fellow travelers to help each other during flights
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper className="mb-6" elevation={1}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <Tab
            label={`Help Requests (${requests.length})`}
            className="font-medium"
          />
          <Tab
            label={`Available Helpers (${offers.length})`}
            className="font-medium"
          />
        </Tabs>
      </Paper>

      {/* Action Button */}
      <Box className="text-center mb-6">
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          {activeTab === 0 ? 'Request Help' : 'Offer to Help'}
        </Button>
      </Box>

      {/* Content */}
      <Box className="min-h-96">
        {loading && !requests.length && !offers.length ? (
          <Box className="flex justify-center items-center py-12">
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {/* Requests Tab */}
            {activeTab === 0 && (
              <Box>
                {requests.length === 0 ? (
                  <Paper className="text-center py-12 bg-gray-50 dark:bg-gray-800">
                    <HelpIcon
                      sx={{ fontSize: 64 }}
                      className="text-gray-400 mb-4"
                    />
                    <Typography
                      variant="h6"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      No help requests yet
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-500 dark:text-gray-400 mt-2"
                    >
                      Be the first to request help!
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {requests.map((request) => (
                      <Grid item xs={12} md={6} lg={4} key={request.id}>
                        {renderRequestCard(request)}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Offers Tab */}
            {activeTab === 1 && (
              <Box>
                {offers.length === 0 ? (
                  <Paper className="text-center py-12 bg-gray-50 dark:bg-gray-800">
                    <PersonIcon
                      sx={{ fontSize: 64 }}
                      className="text-gray-400 mb-4"
                    />
                    <Typography
                      variant="h6"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      No helpers available yet
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-500 dark:text-gray-400 mt-2"
                    >
                      Be the first to offer help!
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {offers.map((offer) => (
                      <Grid item xs={12} md={6} lg={4} key={offer.id}>
                        {renderOfferCard(offer)}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Create Form Dialog */}
      {renderCreateForm()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
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

export default FlightCompanion;