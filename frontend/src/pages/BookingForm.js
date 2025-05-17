import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, addDays } from 'date-fns';
import { roomAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toastService from '../services/toastService';

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Form steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Booking Details', 'Guest Information', 'Review & Payment'];
  
  // State for room data
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkInDate: new Date(),
    checkOutDate: addDays(new Date(), 1),
    adults: 1,
    children: 0,
    specialRequests: '',
    isGuestBooking: false,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestAddress: '',
    paymentMethod: 'creditCard',
    agreeToTerms: false
  });
  
  // Loading and submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  // Add form validation error state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Add this state at the top with other state variables
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  // Add this function to fetch unavailable dates for the room
  const fetchRoomAvailability = async (roomId) => {
    try {
      setIsCheckingAvailability(true);
      // Call API to get room bookings
      const response = await bookingAPI.getRoomBookings(roomId);
      
      // Process bookings to get unavailable date ranges
      const bookedDates = [];
      
      if (response.data && response.data.length > 0) {
        response.data.forEach(booking => {
          const start = new Date(booking.checkInDate);
          const end = new Date(booking.checkOutDate);
          
          // Add all dates between start and end to the bookedDates array
          let currentDate = new Date(start);
          while (currentDate < end) {
            bookedDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
      }
      
      setUnavailableDates(bookedDates);
    } catch (err) {
      console.error('Error fetching room availability:', err);
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  
  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getRoomById(roomId);
        setRoom(response.data);
        
        // Initialize adults with room capacity or 1
        setBookingData(prev => ({
          ...prev,
          adults: response.data.capacity || 1
        }));
        
        // Fetch room availability after getting room data
        await fetchRoomAvailability(roomId);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details. Please try again later.');
        toastService.error('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [roomId]);
  
  // Pre-fill user information if authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      setBookingData(prev => ({
        ...prev,
        isGuestBooking: false,
        guestName: user.name || '',
        guestEmail: user.email || '',
        guestPhone: user.phone || ''
      }));
    }
  }, [user, isAuthenticated]);
  
  // Calculate stay duration and total price
  const calculateStayDetails = () => {
    if (!room) return { nights: 0, totalPrice: 0 };
    
    const nights = differenceInDays(bookingData.checkOutDate, bookingData.checkInDate);
    const totalPrice = nights * room.price;
    
    return { nights, totalPrice };
  };
  
  const { nights, totalPrice } = calculateStayDetails();
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (name, value) => {
    // Clear validation error when date changes
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (name === 'checkInDate') {
      // When check-in date changes, ensure check-out date is at least the day after
      setBookingData(prev => ({
        ...prev,
        [name]: value,
        // If current checkout is before or same as new checkin, set checkout to next day
        checkOutDate: prev.checkOutDate <= value ? addDays(value, 1) : prev.checkOutDate
      }));
    } else if (name === 'checkOutDate') {
      // When check-out date changes
      if (value <= bookingData.checkInDate) {
        // If selected checkout is before or same as checkin, show error
        const errorMsg = 'Check-out date must be after check-in date';
        setValidationErrors(prev => ({
          ...prev,
          checkOutDate: errorMsg
        }));
        toastService.warning(errorMsg);
        return; // Don't update state
      }
      
      // Check if selected date range overlaps with any unavailable dates
      const isOverlapping = checkDateRangeOverlap(
        bookingData.checkInDate, 
        value, 
        unavailableDates
      );
      
      if (isOverlapping) {
        const errorMsg = 'Selected date range includes already booked dates';
        setValidationErrors(prev => ({
          ...prev,
          checkOutDate: errorMsg
        }));
        toastService.warning(errorMsg);
        return; // Don't update state
      }
      
      // Update state if everything is valid
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Show success message for valid date selection
      toastService.success('Selected dates are available!');
    }
  };
  
  // Helper function to check if a date range overlaps with unavailable dates
  const checkDateRangeOverlap = (startDate, endDate, unavailableDates) => {
    if (!unavailableDates || unavailableDates.length === 0) {
      return false; // No unavailable dates, so no overlap
    }
    
    // Check each day in range
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      // Check if current date is in unavailable dates
      const isUnavailable = unavailableDates.some(unavailableDate => 
        unavailableDate.getFullYear() === currentDate.getFullYear() &&
        unavailableDate.getMonth() === currentDate.getMonth() &&
        unavailableDate.getDate() === currentDate.getDate()
      );
      
      if (isUnavailable) {
        return true; // Found an overlap
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return false; // No overlap found
  };
  
  // Add this helper function to check if a date range would conflict with booked dates
  // This is specifically for the checkout date picker
  const checkDateRangeConflict = (startDate, endDate, unavailableDates) => {
    if (!unavailableDates || unavailableDates.length === 0 || !startDate || !endDate) {
      return false;
    }
    
    // For the checkout date picker, we need to check if selecting this date
    // would create a range that includes any unavailable date
    
    // First, check if the date itself is unavailable
    const isDateUnavailable = unavailableDates.some(unavailableDate => 
      endDate.getFullYear() === unavailableDate.getFullYear() &&
      endDate.getMonth() === unavailableDate.getMonth() &&
      endDate.getDate() === unavailableDate.getDate()
    );
    
    if (isDateUnavailable) {
      return true;
    }
    
    // Then check if any unavailable date falls between start and end
    return unavailableDates.some(unavailableDate => {
      return unavailableDate > startDate && unavailableDate < endDate;
    });
  };
  
  // Navigation between steps
  const handleNext = () => {
    // Check validation before proceeding
    const isValid = validateCurrentStep();
    
    if (isValid) {
      if (activeStep === steps.length - 1) {
        handleSubmitBooking();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // Clear validation errors when moving to next step
        setValidationErrors({});
      }
    } else {
      // Set validation errors based on current step
      if (activeStep === 0) {
        const errors = {};
        if (!bookingData.checkInDate) errors.checkInDate = 'Check-in date is required';
        if (!bookingData.checkOutDate) errors.checkOutDate = 'Check-out date is required';
        if (nights <= 0) errors.checkOutDate = 'Check-out date must be after check-in date';
        if (bookingData.adults <= 0) errors.adults = 'At least 1 adult is required';
        if (bookingData.adults + bookingData.children > (room?.capacity || 1)) {
          errors.adults = `Maximum ${room?.capacity} guests in total`;
        }
        setValidationErrors(errors);
      } else if (activeStep === 1) {
        const errors = {};
        if (!bookingData.guestName.trim()) errors.guestName = 'Name is required';
        if (!bookingData.guestEmail.trim()) errors.guestEmail = 'Email is required';
        if (!bookingData.guestPhone.trim()) errors.guestPhone = 'Phone number is required';
        if (!bookingData.guestAddress.trim()) errors.guestAddress = 'Address is required';
        setValidationErrors(errors);
      } else if (activeStep === 2) {
        const errors = {};
        if (!bookingData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
        setValidationErrors(errors);
      }
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Form validation for each step
  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: // Booking Details
        return (
          bookingData.checkInDate && 
          bookingData.checkOutDate && 
          nights > 0 && 
          bookingData.adults > 0 && 
          bookingData.adults + bookingData.children <= (room?.capacity || 1)
        );
      
      case 1: // Guest Information
        if (bookingData.isGuestBooking || isAuthenticated) {
          return (
            bookingData.guestName.trim() !== '' && 
            bookingData.guestEmail.trim() !== '' && 
            bookingData.guestPhone.trim() !== '' &&
            bookingData.guestAddress.trim() !== ''
          );
        }
        return false;
      
      case 2: // Review & Payment
        return bookingData.agreeToTerms;
      
      default:
        return true;
    }
  };
  
  // Submit booking
  const handleSubmitBooking = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    setBookingError(null);
    
    try {
      // Prepare booking data
      const bookingPayload = {
        room: roomId,
        checkInDate: format(bookingData.checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(bookingData.checkOutDate, 'yyyy-MM-dd'),
        numberOfGuests: {
          adults: bookingData.adults,
          children: bookingData.children
        },
        totalPrice,
        specialRequests: bookingData.specialRequests,
        // For guest bookings
        isGuestBooking: bookingData.isGuestBooking,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        guestAddress: bookingData.guestAddress
      };
      
      // Submit booking
      const response = await bookingAPI.createBooking(bookingPayload);
      
      // Handle success
      setBookingSuccess(true);
      toastService.success('Booking completed successfully!');
      
      setTimeout(() => {
        navigate(`/booking-confirmation/${response.data._id}`);
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create booking. Please try again.';
      setBookingError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render room not found state
  if (!room) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">
          <AlertTitle>Room Not Found</AlertTitle>
          The requested room could not be found.
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/rooms')}>
            Browse Available Rooms
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render success state
  if (bookingSuccess) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="success">
          <AlertTitle>Booking Successful!</AlertTitle>
          Your booking has been confirmed. Redirecting to confirmation page...
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      </Container>
    );
  }
  
  // Step content rendering
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Stay Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-in Date"
                    value={bookingData.checkInDate}
                    onChange={(newValue) => handleDateChange('checkInDate', newValue)}
                    disablePast
                    format="MM/dd/yyyy"
                    shouldDisableDate={(date) => 
                      unavailableDates.some(unavailableDate => 
                        date.getFullYear() === unavailableDate.getFullYear() &&
                        date.getMonth() === unavailableDate.getMonth() &&
                        date.getDate() === unavailableDate.getDate()
                      )
                    }
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        variant: 'outlined', 
                        required: true,
                        error: Boolean(validationErrors.checkInDate),
                        helperText: validationErrors.checkInDate || ''
                      },
                      day: {
                        // Custom styling for unavailable dates
                        unavailableDateClassName: 'unavailable-date'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-out Date"
                    value={bookingData.checkOutDate}
                    onChange={(newValue) => handleDateChange('checkOutDate', newValue)}
                    disablePast
                    format="MM/dd/yyyy"
                    minDate={addDays(bookingData.checkInDate, 1)}
                    shouldDisableDate={(date) => 
                      // For checkout, we need to disable dates that would cause an overlap
                      checkDateRangeConflict(bookingData.checkInDate, date, unavailableDates)
                    }
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        variant: 'outlined', 
                        required: true,
                        error: Boolean(validationErrors.checkOutDate),
                        helperText: validationErrors.checkOutDate || ''
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Adults"
                  name="adults"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: room.capacity } }}
                  value={bookingData.adults}
                  onChange={handleChange}
                  helperText={validationErrors.adults || `Maximum ${room.capacity} guests in total`}
                  error={Boolean(validationErrors.adults)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Children"
                  name="children"
                  type="number"
                  InputProps={{ 
                    inputProps: { 
                      min: 0, 
                      max: Math.max(0, room.capacity - bookingData.adults) 
                    } 
                  }}
                  value={bookingData.children}
                  onChange={handleChange}
                  error={Boolean(validationErrors.children)}
                  helperText={validationErrors.children || `Ages 0-17`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests"
                  name="specialRequests"
                  multiline
                  rows={4}
                  value={bookingData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or requirements for your stay..."
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Guest Information
            </Typography>
            
            {!isAuthenticated && (
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isGuestBooking"
                      checked={bookingData.isGuestBooking}
                      onChange={handleChange}
                    />
                  }
                  label="Book as a guest"
                />
                
                {!bookingData.isGuestBooking && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    You need to <Button onClick={() => navigate('/login')} size="small">login</Button> to continue.
                  </Alert>
                )}
              </Box>
            )}
            
            {(bookingData.isGuestBooking || isAuthenticated) && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="guestName"
                    value={bookingData.guestName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={isAuthenticated && !bookingData.isGuestBooking}
                    error={Boolean(validationErrors.guestName)}
                    helperText={validationErrors.guestName || ''}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="guestEmail"
                    type="email"
                    value={bookingData.guestEmail}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    disabled={isAuthenticated && !bookingData.isGuestBooking}
                    error={Boolean(validationErrors.guestEmail)}
                    helperText={validationErrors.guestEmail || ''}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Phone Number"
                    name="guestPhone"
                    value={bookingData.guestPhone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    disabled={isAuthenticated && !bookingData.isGuestBooking}
                    error={Boolean(validationErrors.guestPhone)}
                    helperText={validationErrors.guestPhone || ''}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Address"
                    name="guestAddress"
                    value={bookingData.guestAddress}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    error={Boolean(validationErrors.guestAddress)}
                    helperText={validationErrors.guestAddress || ''}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Booking
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Check-in</Typography>
                      <Typography variant="body1">{format(bookingData.checkInDate, 'MMMM d, yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Check-out</Typography>
                      <Typography variant="body1">{format(bookingData.checkOutDate, 'MMMM d, yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Guests</Typography>
                      <Typography variant="body1">
                        {bookingData.adults} {bookingData.adults === 1 ? 'Adult' : 'Adults'}
                        {bookingData.children > 0 && `, ${bookingData.children} ${bookingData.children === 1 ? 'Child' : 'Children'}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Duration</Typography>
                      <Typography variant="body1">{nights} {nights === 1 ? 'Night' : 'Nights'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Payment Method
                </Typography>
                
                <FormControl component="fieldset">
                  <RadioGroup 
                    name="paymentMethod" 
                    value={bookingData.paymentMethod} 
                    onChange={handleChange}
                  >
                    <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" />
                    <FormControlLabel value="payAtHotel" control={<Radio />} label="Pay at Hotel" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Price Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Room Rate</Typography>
                  <Typography variant="body1">${room.price} per night</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Duration</Typography>
                  <Typography variant="body1">{nights} {nights === 1 ? 'night' : 'nights'}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total Price</Typography>
                  <Typography variant="h6" color="primary">${totalPrice}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      name="agreeToTerms" 
                      checked={bookingData.agreeToTerms} 
                      onChange={handleChange}
                      required
                    />
                  }
                  label="I agree to the terms and conditions*"
                />
                {validationErrors.agreeToTerms && (
                  <Typography color="error" variant="caption" display="block">
                    {validationErrors.agreeToTerms}
                  </Typography>
                )}
              </Grid>
              
              {bookingError && (
                <Grid item xs={12}>
                  <Alert severity="error">{bookingError}</Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Book Your Stay
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={handleBack} 
                disabled={activeStep === 0}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateCurrentStep() || isSubmitting || (!isAuthenticated && !bookingData.isGuestBooking && activeStep === 1)}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === steps.length - 1 ? (
                  'Complete Booking'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Room Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardMedia
              component="img"
              height="200"
              image={(() => {
                if (room.images && room.images.length > 0) {
                  // Select a random image only once
                  const randomIndex = Math.floor(Math.random() * room.images.length);
                  const selectedImage = room.images[randomIndex];
                  return selectedImage.startsWith('http') 
                    ? selectedImage 
                    : `http://localhost:5000${selectedImage}`;
                }
                return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80';
              })()}
              alt={`Room ${room.roomNumber}`}
              sx={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80';
              }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room {room.roomNumber}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={`${room.capacity} Guests`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Floor ${room.floor || 1}`} 
                  size="small" 
                  variant="outlined" 
                />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                {room.description.substring(0, 100)}...
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Price Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Room Rate</Typography>
                <Typography variant="body2">${room.price} per night</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Duration</Typography>
                <Typography variant="body2">{nights} {nights === 1 ? 'night' : 'nights'}</Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ${totalPrice}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingForm; 