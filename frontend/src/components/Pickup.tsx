import React, { useState, useEffect } from "react";
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
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
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
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addNotification } from "../store/slices/uiSlice";
import { selectIsAuthenticated, selectAuthUser } from "../store/slices/authSelectors";
import {
  useGetPickupRequestsQuery,
  useGetPickupOffersQuery,
  useCreatePickupRequestMutation,
  type PickupRequest,
  type PickupOffer,
  type CreatePickupRequestData,
  useCreatePickupOfferMutation, // <-- add this
} from "../store/api/pickupApi";
import PickupRequestForm from "./forms/PickupRequestForm";
import PickupOfferForm from "./forms/PickupOfferForm";
import { useTheme } from "../themes/ThemeProvider";
import useIsDarkMode from "../themes/useIsDarkMode";
import { apiPut, handleApiResponse } from "../utils/api";

// TypeScript Interfaces
interface PickupProps {}

// Main Component
const Pickup: React.FC<PickupProps> = () => {
  // Redux State
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectAuthUser);

  // Add theme and dark mode detection
  const { muiTheme } = useTheme();
  const isDarkMode = useIsDarkMode();

  // RTK Query hooks replace manual fetch calls
  const {
    data: requests = [],
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useGetPickupRequestsQuery();

  const {
    data: offers = [],
    isLoading: offersLoading,
    error: offersError,
    refetch: refetchOffers,
  } = useGetPickupOffersQuery();

  const [createRequest, { isLoading: createRequestLoading }] =
    useCreatePickupRequestMutation();

  // Add the mutation hook
  const [createOffer, { isLoading: createOfferLoading }] = useCreatePickupOfferMutation();

  // Loading and error states
  const isLoading = requestsLoading || offersLoading;
  const error = requestsError || offersError;

  // Local State
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [formType, setFormType] = useState<"request" | "offer">("request");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [searchFilters, setSearchFilters] = useState<{
    airport: string;
    flightNumber: string;
  }>({
    airport: "",
    flightNumber: "",
  });
  const [searchParams, setSearchParams] = useState<{ airport?: string; flightNumber?: string } | null>(null);
  const [driverSearchFilters, setDriverSearchFilters] = useState<{
    airport: string;
    vehicleType: string;
  }>({
    airport: "",
    vehicleType: "",
  });
  const [driverSearchParams, setDriverSearchParams] = useState<{ airport?: string; vehicleType?: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Helper Functions
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ): void => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = (): void => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Event Handlers
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setActiveTab(newValue);
  };

  const handleRequestSubmit = async (data: any): Promise<void> => {
    try {
      const requestData: CreatePickupRequestData = {
        ...data,
        userId: 1, // Add userId for backend validation (temporary, for testing)
      };

      // Use RTK Query mutation instead of manual fetch
      await createRequest(requestData).unwrap();

      showSnackbar("Pickup request created successfully!", "success");
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating pickup request:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error creating pickup request";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleOfferSubmit = async (data: any): Promise<void> => {
    try {
      if (!currentUser?.id) {
        showSnackbar("User not authenticated. Please log in.", "error");
        return;
      }

      // Convert camelCase to PascalCase for C# backend
      const offerData = {
        userId: currentUser.id,
        airport: data.airport,
        vehicleType: data.vehicleType || null, // Handle empty string
        maxPassengers: data.maxPassengers,
        canHandleLuggage: data.canHandleLuggage,
        serviceArea: data.serviceArea || null, // Handle empty string
        baseRate: parseFloat(data.baseRate) || 0, // Ensure it's a number
        languages: data.languages || null, // Handle empty string
        additionalServices: data.additionalServices || null, // Handle empty string
      };

      await createOffer(offerData).unwrap();
      showSnackbar("Pickup offer created successfully!", "success");
      setShowCreateDialog(false);
      refetchOffers(); // Refresh the offers list
    } catch (error) {
      console.error("Error creating offer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error creating offer";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleContactDriver = (offer: PickupOffer): void => {
    showSnackbar(`Contacting driver for ${offer.vehicleType}`, "info");
  };

  const handleContactPassenger = (request: PickupRequest): void => {
    showSnackbar(`Contacting passenger for ${request.flightNumber}`, "info");
  };

  const handleOpenCreateDialog = (type: "request" | "offer"): void => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: "Please log in to use this feature.",
        severity: "warning",
      });
      return;
    }
    setFormType(type);
    setShowCreateDialog(true);
  };

  // Render Functions
  const renderRequestCard = (request: PickupRequest): JSX.Element => (
    <Card
      key={request.id}
      className="mb-4 hover:shadow-lg transition-shadow duration-200"
      style={{
        background: isDarkMode ? muiTheme.palette.background.paper : undefined,
      }}
    >
      <CardContent>
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex items-center space-x-3">
            <FlightIcon style={{ color: isDarkMode ? "#00BCD4" : "#0B3866" }} />
            <Box>
              <Typography
                variant="h6"
                className="font-semibold text-gray-900 dark:text-gray-100"
              >
                {request.flightNumber}
              </Typography>
              <Chip
                label={request.airport}
                size="small"
                className="bg-blue-100 text-blue-800"
                sx={{
                  backgroundColor: isDarkMode ? "#112233" : "#DBEAFE",
                  color: isDarkMode ? "#00BCD4" : "#0B3866",
                }}
              />
            </Box>
          </Box>
          <Chip
            label={`NZD $${request.offeredAmount}`}
            className="bg-green-100 text-green-800 font-semibold"
            sx={{
              backgroundColor: isDarkMode ? "#003C2F" : "#D1FAE5",
              color: isDarkMode ? "#00E676" : "#168046",
            }}
          />
        </Box>

        <Box className="space-y-3 ">
          <Box className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <Box className="flex items-center space-x-2">
              <ScheduleIcon fontSize="small" />
              <span>{new Date(request.arrivalDate).toLocaleDateString()}</span>
              <span>{request.arrivalTime}</span>
            </Box>
          </Box>

          <Box className="flex items-start space-x-2">
            <LocationIcon
              fontSize="small"
              className="text-gray-400 mt-1 dark:text-gray-300"
            />
            <Typography
              variant="body2"
              className="text-gray-700 dark:text-gray-300"
            >
              <strong>To:</strong> {request.destinationAddress}
            </Typography>
          </Box>

          <Box className="flex items-center space-x-4 text-sm dark:text-gray-300">
            <Box className="flex items-center space-x-1">
              <PersonIcon fontSize="small" className="text-gray-400 " />
              <span>
                <strong>Passengers:</strong> {request.passengerCount}
              </span>
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
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-300"
            >
              <strong>Contact:</strong> {request.passengerName}
            </Typography>
          )}

          {request.specialRequests && (
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-300"
            >
              <strong>Special Requests:</strong> {request.specialRequests}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions className="justify-between bg-gray-50 dark:bg-gray-800">
        <Chip
          label={request.isMatched ? "Driver Found" : "Looking for Driver"}
          color={request.isMatched ? "success" : "default"}
          variant={request.isMatched ? "filled" : "outlined"}
          sx={
            request.isMatched
              ? {
                  backgroundColor: isDarkMode ? "#FFD600" : undefined,
                  color: isDarkMode ? "#333" : undefined,
                }
              : {
                  color: isDarkMode ? "#00BCD4" : undefined,
                  borderColor: isDarkMode ? "#00BCD4" : undefined,
                }
          }
        />
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContactIcon />}
            onClick={() => handleContactPassenger(request)}
            sx={{
              color: isDarkMode ? "#00BCD4" : "#0B3866",
              borderColor: isDarkMode ? "#00BCD4" : "#0B3866",
              "&:hover": {
                backgroundColor: isDarkMode
                  ? "rgba(0, 188, 212, 0.1)"
                  : "rgba(11, 56, 102, 0.1)",
              },
            }}
          >
            Contact
          </Button>
          {activeTab === 1 && !request.isMatched && (
            <Button
              variant={selectedRequestId === request.id ? "contained" : "outlined"}
              size="small"
              sx={{
                color: selectedRequestId === request.id 
                  ? "#fff" 
                  : (isDarkMode ? "#00BCD4" : "#0B3866"),
                backgroundColor: selectedRequestId === request.id 
                  ? (isDarkMode ? "#00BCD4" : "#0B3866") 
                  : "transparent",
                borderColor: isDarkMode ? "#00BCD4" : "#0B3866",
                "&:hover": {
                  backgroundColor: selectedRequestId === request.id 
                    ? (isDarkMode ? "rgba(0, 188, 212, 0.9)" : "rgba(11, 56, 102, 0.9)")
                    : (isDarkMode ? "rgba(0, 188, 212, 0.1)" : "rgba(11, 56, 102, 0.1)"),
                },
              }}
              onClick={() => selectedRequestId === request.id 
                ? handleClearSelection() 
                : handleSelectRequest(request.id)
              }
            >
              {selectedRequestId === request.id ? "Selected" : "Select"}
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );

  const renderOfferCard = (offer: PickupOffer): JSX.Element => (
    <Card
      key={offer.id}
      className="mb-4 hover:shadow-lg transition-shadow duration-200"
      style={{
        background: isDarkMode ? muiTheme.palette.background.paper : undefined,
      }}
    >
      <CardContent>
        <Box className="flex justify-between items-start mb-4">
          <Box className="flex items-center space-x-3">
            <TaxiIcon className="text-[#168046]" />
            <Box>
              <Typography
                variant="h6"
                className="font-semibold text-gray-900 dark:text-gray-100"
              >
                {offer.vehicleType}
              </Typography>
              <Chip
                label={offer.airport}
                size="small"
                className="bg-green-100 text-green-800"
                sx={{
                  backgroundColor: isDarkMode ? "#003C2F" : "#D1FAE5",
                  color: isDarkMode ? "#00E676" : "#168046",
                }}
              />
            </Box>
          </Box>
          <Box className="flex items-center space-x-1">
            <StarIcon className="text-yellow-500" fontSize="small" />
            <Typography variant="body2" className="font-medium">
              {offer.rating}
            </Typography>
          </Box>
        </Box>

        <Box className="space-y-2 mb-3">
          <Typography
            variant="body2"
            className="text-gray-600 dark:text-gray-300"
          >
            <strong>Capacity:</strong> {offer.maxPassengers} passengers max
          </Typography>

          <Typography
            variant="body2"
            className="text-gray-600 dark:text-gray-300"
          >
            <strong>Service Area:</strong> {offer.serviceArea}
          </Typography>

          {offer.languages && (
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-300"
            >
              <strong>Languages:</strong> {offer.languages}
            </Typography>
          )}

          <Typography
            variant="body2"
            className="text-gray-600 dark:text-gray-300"
          >
            <strong>Experience:</strong> {offer.totalTrips} completed rides
          </Typography>

          {offer.additionalServices && (
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-300"
            >
              <strong>Services:</strong> {offer.additionalServices}
            </Typography>
          )}
        </Box>

        <Box className="flex justify-between items-center">
          <Chip
            label={`$${offer.baseRate}`}
            className="bg-green-100 text-green-800 font-semibold"
            sx={{
              backgroundColor: isDarkMode ? "#003C2F" : "#D1FAE5",
              color: isDarkMode ? "#00E676" : "#168046",
            }}
          />
          {offer.canHandleLuggage && (
            <Chip
              icon={<LuggageIcon />}
              label="Luggage OK"
              size="small"
              className="bg-blue-50 text-blue-700"
              sx={{
                backgroundColor: isDarkMode ? "#112233" : "#DBEAFE",
                color: isDarkMode ? "#00BCD4" : "#0B3866",
              }}
            />
          )}
        </Box>
      </CardContent>

      <CardActions className="justify-between bg-gray-50 dark:bg-gray-800 mt-auto">
        <Chip label="Available" color="success" variant="outlined" />
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContactIcon />}
          onClick={() => handleContactDriver(offer)}
          sx={{
            color: "#168046",
            borderColor: "#168046",
            "&:hover": {
              backgroundColor: "rgba(22, 128, 70, 0.1)",
            },
          }}
        >
          Contact
        </Button>
        {selectedRequestId && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePickupMatch(selectedRequestId, offer.id)}
          >
            Match
          </Button>
        )}
      </CardActions>
    </Card>
  );


  const handlePickupMatch = async (requestId: number, offerId: number) => {
    try {
      const response = await apiPut('/api/pickup/match', { requestId, offerId });
      await handleApiResponse(response);
  
      showSnackbar('Pickup match successful!', 'success');
      setSelectedRequestId(null); // Clear selection after successful match
      // Optionally refresh data here
      refetchRequests();
      refetchOffers();
    } catch (error) {
      showSnackbar('Error matching: ' + (error instanceof Error ? error.message : error), 'error');
    }
  };

  const handleSelectRequest = (requestId: number) => {
    setSelectedRequestId(requestId);
    showSnackbar('Request selected. Now choose an offer to match.', 'info');
  };

  const handleClearSelection = () => {
    setSelectedRequestId(null);
    showSnackbar('Selection cleared.', 'info');
  };

  // Search functionality
  const handleSearch = () => {
    // If both fields are empty, clear search and show all requests
    if (!searchFilters.airport && !searchFilters.flightNumber) {
      setSearchParams(null);
      showSnackbar("Showing all requests", "info");
      return;
    }

    // If at least one field has a value, perform search
    setSearchParams({
      airport: searchFilters.airport || undefined,
      flightNumber: searchFilters.flightNumber || undefined,
    });
    showSnackbar(`Searching for requests...`, "info");
  };

  // Auto-clear search when both fields are empty
  useEffect(() => {
    if (!searchFilters.airport && !searchFilters.flightNumber && searchParams) {
      setSearchParams(null);
    }
  }, [searchFilters.airport, searchFilters.flightNumber, searchParams]);

  // Filter requests based on search criteria
  const filteredRequests = searchParams 
    ? requests.filter(request => {
        const airportMatch = !searchParams.airport || 
          request.airport.toLowerCase().includes(searchParams.airport.toLowerCase());
        const flightMatch = !searchParams.flightNumber || 
          request.flightNumber.toLowerCase().includes(searchParams.flightNumber.toLowerCase());
        
        return airportMatch && flightMatch;
      })
    : requests;

  // Driver search functionality
  const handleDriverSearch = () => {
    // If both fields are empty, clear search and show all offers
    if (!driverSearchFilters.airport && !driverSearchFilters.vehicleType) {
      setDriverSearchParams(null);
      showSnackbar("Showing all drivers", "info");
      return;
    }

    // If at least one field has a value, perform search
    setDriverSearchParams({
      airport: driverSearchFilters.airport || undefined,
      vehicleType: driverSearchFilters.vehicleType || undefined,
    });
    showSnackbar(`Searching for drivers...`, "info");
  };

  // Auto-clear driver search when both fields are empty
  useEffect(() => {
    if (!driverSearchFilters.airport && !driverSearchFilters.vehicleType && driverSearchParams) {
      setDriverSearchParams(null);
    }
  }, [driverSearchFilters.airport, driverSearchFilters.vehicleType, driverSearchParams]);

  // Filter offers based on search criteria
  const filteredOffers = driverSearchParams 
    ? offers.filter(offer => {
        const airportMatch = !driverSearchParams.airport || 
          offer.airport.toLowerCase().includes(driverSearchParams.airport.toLowerCase());
        const vehicleMatch = !driverSearchParams.vehicleType || 
          offer.vehicleType.toLowerCase().includes(driverSearchParams.vehicleType.toLowerCase());
        
        return airportMatch && vehicleMatch;
      })
    : offers;

  // Early return for error state
  if (error) {
    return (
      <Container maxWidth={false} className="py-8">
        <Paper
          className="p-6 text-center"
          style={{
            background: isDarkMode ? muiTheme.palette.background.paper : undefined,
          }}
        >
          <Typography variant="h6" color="error" className="mb-4">
            Error loading data
          </Typography>
          <Typography variant="body2" className="mb-4">
            {error.toString()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              refetchRequests();
              refetchOffers();
            }}
            sx={{
              backgroundColor: isDarkMode ? "#00BCD4" : "#0B3866",
              color: "#fff",
              "&:hover": {
                backgroundColor: isDarkMode
                  ? "rgba(0, 188, 212, 0.9)"
                  : "rgba(11, 56, 102, 0.9)",
              },
            }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} className="py-20 mb-20">
      {/* Header */}
      <Paper
        elevation={0}
        className="mb-8 p-6 "
        style={{
          background: isDarkMode ? muiTheme.palette.background.paper : undefined,
        }}
      >
        <Box className="text-center">
          <Typography
            variant="h3"
            component="h1"
            className="font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            Airport Pickup Service
          </Typography>
          <Typography
            variant="body1"
            className="text-gray-600 dark:text-gray-300"
          >
            Connect with reliable drivers for airport transfers
          </Typography>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper
        elevation={1}
        className="mb-6"
        style={{
          background: isDarkMode ? muiTheme.palette.background.paper : undefined,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="border-b border-gray-200"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTabs-indicator": isDarkMode
              ? { backgroundColor: "#00BCD4" }
              : {},
          }}
        >
          <Tab
            icon={
              <FlightIcon
                style={{ color: isDarkMode ? "#00BCD4" : undefined }}
              />
            }
            label={`Pickup Requests (${requests.length})`}
            className="font-medium"
            sx={{
              color: isDarkMode ? "#fff" : undefined,
              "&.Mui-selected": isDarkMode ? { color: "#00BCD4" } : {},
            }}
          />
          <Tab
            icon={
              <TaxiIcon style={{ color: isDarkMode ? "#00BCD4" : undefined }} />
            }
            label={`Available Drivers (${offers.length})`}
            className="font-medium"
            sx={{
              color: isDarkMode ? "#fff" : undefined,
              "&.Mui-selected": isDarkMode ? { color: "#00BCD4" } : {},
            }}
          />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box className="min-h-96">
        {activeTab === 0 && (
          <Box>
            {/* Search Filters */}
            <Paper className="mb-6 p-4" style={{
              background: isDarkMode ? muiTheme.palette.background.paper : undefined,
            }}>
              <Typography variant="h6" className="mb-4">
                Search for Requests to Help
              </Typography>
              <Grid container spacing={2} alignItems="end">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Airport"
                    value={searchFilters.airport}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, airport: e.target.value }))}
                    placeholder="e.g., AKL"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Flight Number"
                    value={searchFilters.flightNumber}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, flightNumber: e.target.value }))}
                    placeholder="e.g., NZ289"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSearch}
                    sx={{
                      backgroundColor: isDarkMode ? "#00BCD4" : "#0B3866",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "rgba(0, 188, 212, 0.9)" : "rgba(11, 56, 102, 0.9)",
                      },
                      height: "56px", // Match the default TextField height
                    }}
                  >
                    Search Requests
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSearchFilters({ airport: "", flightNumber: "" });
                      setSearchParams(null);
                      showSnackbar("Search cleared", "info");
                    }}
                    sx={{
                      borderColor: isDarkMode ? "#00BCD4" : "#0B3866",
                      color: isDarkMode ? "#00BCD4" : "#0B3866",
                      "&:hover": {
                        borderColor: isDarkMode ? "rgba(0, 188, 212, 0.9)" : "rgba(11, 56, 102, 0.9)",
                        backgroundColor: isDarkMode ? "rgba(0, 188, 212, 0.1)" : "rgba(11, 56, 102, 0.1)",
                      },
                      height: "56px", // Match the default TextField height
                    }}
                  >
                    Clear Search
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Action Button */}
            <Box className="text-center mb-8">
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() =>
                  handleOpenCreateDialog(activeTab === 0 ? "request" : "offer")
                }
                sx={{
                  backgroundColor:
                    activeTab === 0
                      ? isDarkMode
                        ? "#00BCD4"
                        : "#0B3866"
                      : "#168046",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor:
                      activeTab === 0
                        ? isDarkMode
                          ? "rgba(0, 188, 212, 0.9)"
                          : "rgba(11, 56, 102, 0.9)"
                        : "rgba(22, 128, 70, 0.9)",
                  },
                }}
                className="px-8 py-3  my-3 text-white"
              >
                {activeTab === 0 ? "Request Pickup" : "Offer Service"}
              </Button>
            </Box>

            {isLoading && !requests.length ? (
              <Box className="flex justify-center items-center py-12">
                <CircularProgress size={40} />
              </Box>
            ) : filteredRequests.length === 0 ? (
              <Paper
                className="text-center py-12 bg-gray-50 dark:bg-gray-800"
                style={{
                  background: isDarkMode
                    ? muiTheme.palette.background.paper
                    : undefined,
                }}
              >
                <FlightIcon
                  sx={{
                    fontSize: 64,
                    color: isDarkMode ? "#00BCD4" : undefined,
                  }}
                  className="text-gray-400 mb-4"
                />
                <Typography
                  variant="h6"
                  className="text-gray-600 dark:text-gray-300"
                >
                  {searchParams ? "No matching requests found" : "No pickup requests yet"}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-500 dark:text-gray-400 mt-2"
                >
                  {searchParams ? "Try different search criteria" : "Be the first to request a pickup!"}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredRequests.map((request) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={4}
                    key={request.id}
                    className="flex flex-col"
                  >
                    {renderRequestCard(request)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Search Filters */}
            <Paper className="mb-6 p-4" style={{
              background: isDarkMode ? muiTheme.palette.background.paper : undefined,
            }}>
              <Typography variant="h6" className="mb-4">
                Search for Driver
              </Typography>
              <Grid container spacing={2} alignItems="end">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Airport"
                    value={driverSearchFilters.airport}
                    onChange={(e) => setDriverSearchFilters(prev => ({ ...prev, airport: e.target.value }))}
                    placeholder="e.g., AKL"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Vehicle Type"
                    value={driverSearchFilters.vehicleType}
                    onChange={(e) => setDriverSearchFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                    placeholder="e.g., Sedan"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleDriverSearch}
                    sx={{
                      backgroundColor: "#168046",
                      "&:hover": {
                        backgroundColor: "rgba(22, 128, 70, 0.9)",
                      },
                      height: "56px", // Match the default TextField height
                    }}
                  >
                    Search Drivers
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setDriverSearchFilters({ airport: "", vehicleType: "" });
                      setDriverSearchParams(null);
                      showSnackbar("Search cleared", "info");
                    }}
                    sx={{
                      borderColor: "#168046",
                      color: "#168046",
                      "&:hover": {
                        borderColor: "rgba(22, 128, 70, 0.9)",
                        backgroundColor: "rgba(22, 128, 70, 0.1)",
                      },
                      height: "56px", // Match the default TextField height
                    }}
                  >
                    Clear Search
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Action Button */}
            <Box className="text-center mb-8">
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCreateDialog("offer")}
                sx={{
                  backgroundColor: "#168046",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(22, 128, 70, 0.9)",
                  },
                }}
                className="px-8 py-3  my-3 text-white"
              >
                Offer Service
              </Button>
            </Box>

            {selectedRequestId && (
              <Paper className="mb-4 p-3 bg-blue-50 dark:bg-blue-900">
                <Box className="flex justify-between items-center">
                  <Typography variant="body2" className="text-blue-800 dark:text-blue-200">
                    Request selected. Choose an offer to match.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearSelection}
                  >
                    Clear Selection
                  </Button>
                </Box>
              </Paper>
            )}
            {isLoading && !offers.length ? (
              <Box className="flex justify-center items-center py-12">
                <CircularProgress size={40} />
              </Box>
            ) : filteredOffers.length === 0 ? (
              <Paper
                className="text-center py-12 bg-gray-50 dark:bg-gray-800"
                style={{
                  background: isDarkMode
                    ? muiTheme.palette.background.paper
                    : undefined,
                }}
              >
                <TaxiIcon
                  sx={{
                    fontSize: 64,
                    color: isDarkMode ? "#00BCD4" : undefined,
                  }}
                  className="text-gray-400 mb-4"
                />
                <Typography
                  variant="h6"
                  className="text-gray-600 dark:text-gray-300"
                >
                  {driverSearchParams ? "No matching drivers found" : "No drivers available yet"}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-500 dark:text-gray-400 mt-2"
                >
                  {driverSearchParams ? "Try different search criteria" : "Be the first to offer pickup services!"}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredOffers.map((offer) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={4}
                    key={offer.id}
                    className="flex flex-col"
                  >
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
        <DialogTitle
          style={{
            background: isDarkMode ? muiTheme.palette.background.paper : undefined,
          }}
        >
          {formType === "request"
            ? "Request Airport Pickup"
            : "Offer Pickup Service"}
        </DialogTitle>

        <DialogContent
          className="p-6"
          style={{
            background: isDarkMode
              ? muiTheme.palette.background.default
              : undefined,
          }}
        >
          {formType === "request" ? (
            <PickupRequestForm
              onSubmit={handleRequestSubmit}
              onCancel={() => setShowCreateDialog(false)}
              loading={createRequestLoading}
            />
          ) : (
            <PickupOfferForm
              onSubmit={handleOfferSubmit}
              onCancel={() => setShowCreateDialog(false)}
              loading={createOfferLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Pickup;
