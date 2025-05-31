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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Backdrop,
  Fade,
  Slide,
  Zoom,
  LinearProgress,
  Badge,
  Tooltip
} from '@mui/material';
import {
  DatePicker,
  DateRangePicker
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  LocalOffer as OfferIcon,
  ConfirmationNumber as ConfirmationIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Room as RoomIcon,
  Hotel as HotelIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  Restaurant as RestaurantIcon,
  LocalParking as ParkingIcon,
  FitnessCenter as GymIcon,
  Pool as PoolIcon,
  Spa as SpaIcon,
  BusinessCenter as BusinessIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Money as CashIcon,
  Schedule as TimeIcon,
  Groups as GroupsIcon,
  ChildCare as ChildIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format, differenceInDays, addDays, isWithinInterval } from 'date-fns';
import { roomAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toastService from '../services/toastService';
import { vi } from 'date-fns/locale';

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Thông tin đặt phòng', 'Thông tin khách hàng', 'Xác nhận và thanh toán'];
  
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
    isGuestBooking: true,
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
  
  // Calculated values
  const dayCount = differenceInDays(bookingData.checkOutDate, bookingData.checkInDate);
  const totalPrice = room ? room.price * dayCount : 0;
  const taxAmount = totalPrice * 0.1; // 10% tax
  const serviceCharge = totalPrice * 0.05; // 5% service charge
  const totalAmount = totalPrice + taxAmount + serviceCharge;
  
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
        setError(null); // Clear any previous errors
        
        // First, validate the roomId format before making API call
        if (!roomId || roomId === 'undefined') {
          setError('ID phòng không hợp lệ. Vui lòng thử lại hoặc chọn phòng khác.');
          setLoading(false);
          return;
        }
        
        const response = await roomAPI.getRoomById(roomId);
        
        // Extract room data correctly from API response
        const roomData = response.data.data || response.data;
        
        // Verify that we received valid room data
        if (!roomData || !roomData._id) {
          setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
          setLoading(false);
          return;
        }
        
        // Store room data
        setRoom(roomData);
        
        // Initialize adults with room capacity or 1
        setBookingData(prev => ({
          ...prev,
          adults: roomData.capacity || 1
        }));
        
        // Fetch room availability after getting room data
        await fetchRoomAvailability(roomId);
        
        // Show success message
        toastService.success(`Phòng ${roomData.roomNumber} hiện có sẵn để đặt!`);
      } catch (err) {
        console.error('Error fetching room data:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response,
          isNetworkError: err.isNetworkError
        });
        setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchRoomData();
    } else {
      setLoading(false);
      setError('Không tìm thấy ID phòng. Vui lòng quay lại và chọn phòng.');
    }
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
    } else {
      // For non-authenticated users, default to guest booking
      setBookingData(prev => ({
        ...prev,
        isGuestBooking: true
      }));
    }
  }, [user, isAuthenticated]);
  
  // Form date change handler
  const handleDateChange = (field, newDate) => {
    if (field === 'checkInDate') {
      const newCheckOutDate = addDays(new Date(newDate), 1);
      
      setBookingData(prev => ({
        ...prev,
        [field]: newDate,
        checkOutDate: newCheckOutDate
      }));
      
      // Clear any validation errors for dates
      setValidationErrors(prev => ({
        ...prev,
        checkInDate: null,
        checkOutDate: null
      }));
    } else if (field === 'checkOutDate') {
      setBookingData(prev => ({
        ...prev,
        [field]: newDate
      }));
      
      // Clear validation error
      setValidationErrors(prev => ({
        ...prev,
        checkOutDate: null
      }));
    }
  };
  
  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };
  
  // Checkbox field change handler
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    setBookingData(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Clear the validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };
  
  // Navigation between steps
  const handleNext = () => {
    // Validate current step before proceeding
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };
  
  // Step validation
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      // Validate booking details
      if (!bookingData.checkInDate) {
        errors.checkInDate = 'Vui lòng chọn ngày check-in';
      }
      
      if (!bookingData.checkOutDate) {
        errors.checkOutDate = 'Vui lòng chọn ngày check-out';
      } else if (differenceInDays(bookingData.checkOutDate, bookingData.checkInDate) < 1) {
        errors.checkOutDate = 'Ngày check-out phải sau ngày check-in ít nhất 1 ngày';
      }
      
      if (bookingData.adults < 1) {
        errors.adults = 'Phải có ít nhất 1 người lớn';
      }
      
      if (bookingData.adults + bookingData.children > (room?.capacity || 1)) {
        errors.adults = `Tổng số người vượt quá sức chứa tối đa của phòng (${room.capacity})`;
      }
    } else if (step === 1) {
      // Validate guest information
      if (bookingData.isGuestBooking) {
        if (!bookingData.guestName) {
          errors.guestName = 'Vui lòng nhập tên khách hàng';
        }
        
        if (!bookingData.guestEmail) {
          errors.guestEmail = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail)) {
          errors.guestEmail = 'Vui lòng nhập email hợp lệ';
        }
        
        if (!bookingData.guestPhone) {
          errors.guestPhone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9+\s-]{10,15}$/.test(bookingData.guestPhone.replace(/\s/g, ''))) {
          errors.guestPhone = 'Vui lòng nhập số điện thoại hợp lệ';
        }
      }
    } else if (step === 2) {
      // Validate payment information
      if (!bookingData.paymentMethod) {
        errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
      }
      
      if (!bookingData.agreeToTerms) {
        errors.agreeToTerms = 'Bạn phải đồng ý với điều khoản và điều kiện';
      }
    }
    
    // Update validation errors
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };
  
  // Get the booking completion message
  const getBookingCompletionMessage = () => {
    // For guest bookings, include the phone number in the message
    if (bookingData.isGuestBooking) {
      return `Đặt phòng thành công! Số điện thoại ${bookingData.guestPhone} đã được ghi nhận. Bạn có thể sử dụng số điện thoại này để tra cứu đặt phòng sau này.`;
    }
    // For authenticated users
    return 'Đặt phòng thành công!';
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate final step
    if (!validateStep(activeStep)) return;
    
    // Prepare booking data
    const bookingPayload = {
      roomId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      adults: bookingData.adults,
      children: bookingData.children,
      specialRequests: bookingData.specialRequests,
      // Add guest information if it's a guest booking
      ...(bookingData.isGuestBooking && {
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        guestAddress: bookingData.guestAddress
      }),
      paymentMethod: bookingData.paymentMethod,
      totalAmount: totalAmount
    };
    
    try {
      setIsSubmitting(true);
      setBookingError(null);
      
      // Submit booking - use the appropriate API method based on whether it's a guest booking
      const response = bookingData.isGuestBooking 
        ? await bookingAPI.createGuestBooking(bookingPayload)
        : await bookingAPI.createBooking(bookingPayload);
      
      // Check for successful response
      if (response.data && response.data._id) {
        setBookingSuccess(true);
        
        // Show success message with phone number for guest bookings
        toastService.success(getBookingCompletionMessage());
        
        // Navigate to booking confirmation or user bookings page
        setTimeout(() => {
          if (isAuthenticated) {
            navigate(`/my-bookings?new=${response.data._id}`);
          } else {
            navigate(`/rooms?bookingSuccess=true&id=${response.data._id}`);
          }
        }, 3000);
      } else {
        throw new Error('Không nhận được xác nhận đặt phòng.');
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      setBookingError(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if a date should be disabled (due to unavailability)
  const isDateDisabled = (date) => {
    // Disable dates before today
    if (date < new Date().setHours(0,0,0,0)) {
      return true;
    }
    
    // Disable dates that are already booked
    return unavailableDates.some(unavailableDate => 
      date.getFullYear() === unavailableDate.getFullYear() &&
      date.getMonth() === unavailableDate.getMonth() &&
      date.getDate() === unavailableDate.getDate()
    );
  };
  
  // Increment/decrement guests
  const handleGuestCountChange = (type, operation) => {
    setBookingData(prev => {
      const currentValue = prev[type];
      let newValue;
      
      if (operation === 'increment') {
        newValue = currentValue + 1;
      } else {
        newValue = Math.max(type === 'adults' ? 1 : 0, currentValue - 1);
      }
      
      // Check if new total exceeds room capacity
      const otherType = type === 'adults' ? 'children' : 'adults';
      const totalGuests = newValue + prev[otherType];
      
      if (room && totalGuests > room.capacity) {
        toastService.warning(`Tổng số khách không thể vượt quá ${room.capacity} người`);
        return prev;
      }
      
      return {
        ...prev,
        [type]: newValue
      };
    });
  };
  
  // Add this function after the other functions
  const handleLookupBookingsByPhone = async () => {
    if (!bookingData.guestPhone || bookingData.guestPhone.trim() === '') {
      toastService.warning('Vui lòng nhập số điện thoại để tra cứu');
      return;
    }
    
    try {
      // Look up bookings by phone number
      const response = await bookingAPI.getBookingsByPhone(bookingData.guestPhone);
      
      if (response.data && response.data.length > 0) {
        // Auto-fill the guest information from the most recent booking
        const latestBooking = response.data[0]; // Assuming sorted by date descending
        
        setBookingData(prev => ({
          ...prev,
          guestName: latestBooking.guestName,
          guestEmail: latestBooking.guestEmail,
          guestAddress: latestBooking.guestAddress || prev.guestAddress
        }));
        
        // Show success message with booking count
        toastService.success(`Tìm thấy ${response.data.length} đặt phòng trước đây. Đã điền thông tin khách hàng.`);
      } else {
        // No bookings found - just continue with new customer information
        toastService.info('Không tìm thấy đặt phòng trước đây với số điện thoại này.');
      }
    } catch (err) {
      console.error('Error looking up bookings by phone:', err);
      // Don't show error to user, just continue with booking
    }
  };
  
  // Step content rendering
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 4,
              p: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                width: 56,
                height: 56
              }}>
                <CalendarIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
                  Chi Tiết Đặt Phòng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chọn ngày và số khách cho chuyến đi của bạn
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.15)'
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <TimeIcon color="primary" />
                    Thời gian lưu trú
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                          label="Ngày check-in"
                          value={bookingData.checkInDate}
                          onChange={(newDate) => handleDateChange('checkInDate', newDate)}
                          shouldDisableDate={isDateDisabled}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth 
                              margin="normal" 
                              error={Boolean(validationErrors.checkInDate)}
                              helperText={validationErrors.checkInDate}
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderWidth: '2px',
                                  }
                                }
                              }}
                            />
                          )}
                          disablePast
                          minDate={new Date()}
                        />
                      </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                          label="Ngày check-out"
                          value={bookingData.checkOutDate}
                          onChange={(newDate) => handleDateChange('checkOutDate', newDate)}
                          shouldDisableDate={isDateDisabled}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth 
                              margin="normal" 
                              error={Boolean(validationErrors.checkOutDate)}
                              helperText={validationErrors.checkOutDate}
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderWidth: '2px',
                                  }
                                }
                              }}
                            />
                          )}
                          disablePast
                          minDate={addDays(bookingData.checkInDate, 1)}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.15)'
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <GroupsIcon color="primary" />
                    Số lượng khách
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        textAlign: 'center'
                      }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <PersonIcon color="primary" />
                          Người lớn
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleGuestCountChange('adults', 'decrement')}
                            disabled={bookingData.adults <= 1}
                            sx={{
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="h4" sx={{ 
                            mx: 3, 
                            minWidth: '60px', 
                            textAlign: 'center',
                            fontWeight: 700,
                            color: 'primary.main'
                          }}>
                            {bookingData.adults}
                          </Typography>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleGuestCountChange('adults', 'increment')}
                            sx={{
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        {validationErrors.adults && (
                          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                            {validationErrors.adults}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(118, 75, 162, 0.05)',
                        border: '1px solid rgba(118, 75, 162, 0.1)',
                        textAlign: 'center'
                      }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <ChildIcon sx={{ color: '#764ba2' }} />
                          Trẻ em
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                          <IconButton 
                            onClick={() => handleGuestCountChange('children', 'decrement')}
                            disabled={bookingData.children <= 0}
                            sx={{
                              color: '#764ba2',
                              backgroundColor: 'rgba(118, 75, 162, 0.1)',
                              '&:hover': {
                                backgroundColor: '#764ba2',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="h4" sx={{ 
                            mx: 3, 
                            minWidth: '60px', 
                            textAlign: 'center',
                            fontWeight: 700,
                            color: '#764ba2'
                          }}>
                            {bookingData.children}
                          </Typography>
                          <IconButton 
                            onClick={() => handleGuestCountChange('children', 'increment')}
                            sx={{
                              color: '#764ba2',
                              backgroundColor: 'rgba(118, 75, 162, 0.1)',
                              '&:hover': {
                                backgroundColor: '#764ba2',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ 
                  p: 3,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.15)'
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <InfoIcon color="primary" />
                    Yêu cầu đặc biệt
                  </Typography>
                  
                  <TextField
                    name="specialRequests"
                    label="Chia sẻ với chúng tôi về yêu cầu đặc biệt của bạn"
                    multiline
                    rows={4}
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    placeholder="Ví dụ: Phòng tầng cao, view biển, giường đôi, không hút thuốc..."
                    helperText="Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn dựa trên tình trạng sẵn có"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: '2px',
                        }
                      }
                    }}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 4,
              p: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                width: 56,
                height: 56
              }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
                  Thông Tin Khách Hàng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cung cấp thông tin liên hệ để hoàn tất đặt phòng
                </Typography>
              </Box>
            </Box>
            
            {isAuthenticated ? (
              <Box>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 4,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    '& .MuiAlert-icon': {
                      color: 'success.main'
                    }
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>
                    Chào mừng {user?.name}! 👋
                  </AlertTitle>
                  Bạn đang đặt phòng với tư cách thành viên đã đăng nhập. Thông tin cá nhân của bạn sẽ được sử dụng cho đặt phòng này.
                </Alert>
                
                <Card sx={{ 
                  p: 4, 
                  mb: 3,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.15)'
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3
                  }}>
                    <PersonIcon color="primary" />
                    Thông tin tài khoản
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Họ và tên
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {user.name}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {user.email}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            name="isGuestBooking" 
                            checked={bookingData.isGuestBooking} 
                            onChange={handleCheckboxChange} 
                            color="primary"
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Đặt phòng cho người khác
                          </Typography>
                        }
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Card>
                
                {bookingData.isGuestBooking && (
                  <Card sx={{ 
                    p: 4,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(118, 75, 162, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(118, 75, 162, 0.15)'
                    }
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3,
                      color: '#764ba2'
                    }}>
                      <PersonIcon sx={{ color: '#764ba2' }} />
                      Thông tin khách hàng
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestName"
                          label="Tên khách hàng"
                          value={bookingData.guestName}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          error={Boolean(validationErrors.guestName)}
                          helperText={validationErrors.guestName}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: '#764ba2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#764ba2',
                                borderWidth: '2px',
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#764ba2'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestEmail"
                          label="Email khách hàng"
                          type="email"
                          value={bookingData.guestEmail}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          error={Boolean(validationErrors.guestEmail)}
                          helperText={validationErrors.guestEmail}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: '#764ba2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#764ba2',
                                borderWidth: '2px',
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#764ba2'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestPhone"
                          label="Số điện thoại khách hàng"
                          value={bookingData.guestPhone}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          error={Boolean(validationErrors.guestPhone)}
                          helperText={validationErrors.guestPhone}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: '#764ba2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#764ba2',
                                borderWidth: '2px',
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#764ba2'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestAddress"
                          label="Địa chỉ khách hàng"
                          value={bookingData.guestAddress}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: '#764ba2',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#764ba2',
                                borderWidth: '2px',
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#764ba2'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                )}
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 4,
                      borderRadius: '16px',
                      backgroundColor: 'rgba(33, 150, 243, 0.05)',
                      border: '1px solid rgba(33, 150, 243, 0.2)',
                      '& .MuiAlert-icon': {
                        color: 'info.main'
                      }
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 600 }}>
                      Đặt phòng với tư cách Khách Vãng Lai
                    </AlertTitle>
                    Vui lòng nhập chính xác số điện thoại của bạn để tra cứu đặt phòng sau này.
                    <Box mt={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        href="/login"
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 500
                        }}
                      >
                        Đăng nhập nếu bạn đã có tài khoản
                      </Button>
                    </Box>
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <Card sx={{ 
                    p: 4,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.15)'
                    }
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3
                    }}>
                      <PersonIcon color="primary" />
                      Thông tin liên hệ
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestName"
                          label="Họ và tên"
                          value={bookingData.guestName}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          error={Boolean(validationErrors.guestName)}
                          helperText={validationErrors.guestName}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderWidth: '2px',
                              }
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestEmail"
                          label="Địa chỉ email"
                          type="email"
                          value={bookingData.guestEmail}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          error={Boolean(validationErrors.guestEmail)}
                          helperText={validationErrors.guestEmail}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderWidth: '2px',
                              }
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <TextField
                            name="guestPhone"
                            label="Số điện thoại"
                            value={bookingData.guestPhone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={Boolean(validationErrors.guestPhone)}
                            helperText={validationErrors.guestPhone || "Số điện thoại để nhận diện và tra cứu đặt phòng"}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderWidth: '2px',
                                }
                              }
                            }}
                          />
                          <Tooltip title="Tra cứu thông tin từ đặt phòng trước">
                            <Button
                              variant="outlined"
                              color="primary"
                              sx={{ 
                                mt: 2, 
                                ml: 1, 
                                height: 56,
                                minWidth: 'auto',
                                px: 2,
                                borderRadius: '12px',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                              onClick={handleLookupBookingsByPhone}
                              disabled={!bookingData.guestPhone}
                            >
                              <PersonIcon />
                            </Button>
                          </Tooltip>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="guestAddress"
                          label="Địa chỉ"
                          value={bookingData.guestAddress}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderWidth: '2px',
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        );
        
      case 2:
        return (
          <Box>
            {/* Modern Header Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              p: 4,
              mb: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <PaymentIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Xác Nhận và Thanh Toán
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Xem lại thông tin đặt phòng và hoàn tất thanh toán
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Booking Details Card */}
            <Card sx={{ 
              mb: 4, 
              borderRadius: '16px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    width: 40,
                    height: 40
                  }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Chi Tiết Đặt Phòng
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e3e8ff'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Phòng
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {room?.name} (Số phòng: {room?.roomNumber})
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e3e8ff'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Loại phòng
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {room?.roomType?.name || 'Standard'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Check-in
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        {format(new Date(bookingData.checkInDate), 'dd/MM/yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#fef3f2',
                      border: '1px solid #fecaca'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Check-out
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="error.main">
                        {format(new Date(bookingData.checkOutDate), 'dd/MM/yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fed7aa'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Số đêm
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="warning.main">
                        {dayCount} đêm
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Số khách
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="info.main">
                        {bookingData.adults} người lớn, {bookingData.children} trẻ em
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {bookingData.specialRequests && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    borderRadius: '12px', 
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff'
                  }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                      Yêu cầu đặc biệt
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{bookingData.specialRequests}"
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                    width: 40,
                    height: 40
                  }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Thông Tin Khách Hàng
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e3e8ff'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Họ tên
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookingData.isGuestBooking ? bookingData.guestName : user?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e3e8ff'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookingData.isGuestBooking ? bookingData.guestEmail : user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e3e8ff'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookingData.isGuestBooking ? bookingData.guestPhone : user?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Billing Details Card */}
            <Card sx={{ 
              mb: 4, 
              borderRadius: '16px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #4ade80 30%, #22c55e 90%)',
                    width: 40,
                    height: 40
                  }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Hóa Đơn Chi Tiết
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#fafafa', 
                  borderRadius: '12px', 
                  p: 3,
                  border: '1px solid #e0e0e0'
                }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        Giá phòng x {dayCount} đêm
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Thuế (10%)
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Phí dịch vụ (5%)
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(serviceCharge)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: 'primary.main',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <Typography variant="h6" fontWeight={700}>
                        Tổng cộng
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
            
            {/* Payment Methods Card */}
            <Card sx={{ 
              mb: 4, 
              borderRadius: '16px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #f59e0b 30%, #eab308 90%)',
                    width: 40,
                    height: 40
                  }}>
                    <CreditCardIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Phương Thức Thanh Toán
                  </Typography>
                </Box>
                
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Card sx={{ 
                        border: bookingData.paymentMethod === 'creditCard' ? '2px solid #667eea' : '1px solid #e0e0e0',
                        backgroundColor: bookingData.paymentMethod === 'creditCard' ? '#f8f9ff' : 'white',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#667eea',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <FormControlLabel 
                            value="creditCard" 
                            control={
                              <Radio 
                                color="primary" 
                                sx={{ 
                                  '& .MuiSvgIcon-root': {
                                    fontSize: 20,
                                  },
                                }}
                              />
                            } 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CreditCardIcon color="primary" />
                                <Box>
                                  <Typography variant="body1" fontWeight={600}>
                                    Thẻ tín dụng/ghi nợ
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Visa, MasterCard, JCB
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ 
                        border: bookingData.paymentMethod === 'bankTransfer' ? '2px solid #667eea' : '1px solid #e0e0e0',
                        backgroundColor: bookingData.paymentMethod === 'bankTransfer' ? '#f8f9ff' : 'white',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#667eea',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <FormControlLabel 
                            value="bankTransfer" 
                            control={
                              <Radio 
                                color="primary" 
                                sx={{ 
                                  '& .MuiSvgIcon-root': {
                                    fontSize: 20,
                                  },
                                }}
                              />
                            } 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AccountBalanceIcon color="primary" />
                                <Box>
                                  <Typography variant="body1" fontWeight={600}>
                                    Chuyển khoản ngân hàng
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Chuyển khoản trực tiếp qua ngân hàng
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ 
                        border: bookingData.paymentMethod === 'payAtHotel' ? '2px solid #667eea' : '1px solid #e0e0e0',
                        backgroundColor: bookingData.paymentMethod === 'payAtHotel' ? '#f8f9ff' : 'white',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#667eea',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <FormControlLabel 
                            value="payAtHotel" 
                            control={
                              <Radio 
                                color="primary" 
                                sx={{ 
                                  '& .MuiSvgIcon-root': {
                                    fontSize: 20,
                                  },
                                }}
                              />
                            } 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <HotelIcon color="primary" />
                                <Box>
                                  <Typography variant="body1" fontWeight={600}>
                                    Thanh toán tại khách sạn
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Thanh toán khi nhận phòng
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>
                    </Box>
                  </RadioGroup>
                  
                  {validationErrors.paymentMethod && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationErrors.paymentMethod}
                    </Alert>
                  )}
                </FormControl>
              </CardContent>
            </Card>
            
            {/* Terms and Conditions */}
            <Card sx={{ 
              mb: 4, 
              borderRadius: '16px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: bookingData.agreeToTerms ? '2px solid #4ade80' : '1px solid #e0e0e0',
              backgroundColor: bookingData.agreeToTerms ? '#f0fdf4' : 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Checkbox 
                    name="agreeToTerms" 
                    checked={bookingData.agreeToTerms} 
                    onChange={handleCheckboxChange} 
                    color="primary"
                    sx={{ 
                      mt: -1,
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                      },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      Điều khoản và điều kiện
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Tôi đồng ý với các điều khoản và điều kiện đặt phòng, chính sách hủy bỏ và các quy định của khách sạn.
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      Xem chi tiết điều khoản và điều kiện
                    </Typography>
                  </Box>
                </Box>
                
                {validationErrors.agreeToTerms && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.agreeToTerms}
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {bookingError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                {bookingError}
              </Alert>
            )}
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/rooms')}
          startIcon={<ArrowBackIcon />}
        >
          Quay lại trang phòng
        </Button>
      </Container>
    );
  }
  
  if (bookingSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Đặt phòng thành công!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi. 
            {isAuthenticated 
              ? 'Chi tiết đặt phòng đã được gửi đến email của bạn.'
              : `Số điện thoại ${bookingData.guestPhone} đã được ghi nhận. Vui lòng lưu lại số điện thoại này để tra cứu đặt phòng sau này.`
            }
          </Typography>
          
          {!isAuthenticated && (
            <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: '80%', textAlign: 'left' }}>
              <AlertTitle>Lưu ý quan trọng</AlertTitle>
              <Typography variant="body2" paragraph>
                Bạn đã đặt phòng với tư cách Khách Vãng Lai. Để quản lý đặt phòng này:
              </Typography>
              <ul>
                <li>Lưu lại số điện thoại: <strong>{bookingData.guestPhone}</strong></li>
                <li>Khi đến khách sạn, vui lòng cung cấp số điện thoại này cho lễ tân</li>
                <li>Tất cả các đặt phòng trước đây với số điện thoại này sẽ được liên kết với nhau</li>
              </ul>
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Bạn sẽ được chuyển hướng đến trang {isAuthenticated ? 'đặt phòng của bạn' : 'danh sách phòng'} trong vài giây...
          </Typography>
          
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
      }
    }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/rooms')}
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Quay lại trang phòng
            </Button>
            
            <Box sx={{ 
              textAlign: 'center',
              mb: 4,
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                fontSize: '2rem'
              }}>
                <HotelIcon fontSize="large" />
              </Avatar>
              
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Đặt Phòng {room?.name}
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  opacity: 0.8,
                  fontWeight: 400,
                  letterSpacing: '0.5px'
                }}
              >
                Trải nghiệm đặt phòng hiện đại và tiện lợi
              </Typography>
            </Box>
            
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel 
                sx={{ 
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#4caf50',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#667eea',
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: '#e0e0e0',
                    borderTopWidth: 2,
                  },
                  '& .Mui-completed .MuiStepConnector-line': {
                    borderColor: '#4caf50',
                  },
                  '& .Mui-active .MuiStepConnector-line': {
                    borderColor: '#667eea',
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel 
                      sx={{ 
                        '& .MuiStepLabel-label': {
                          fontWeight: 600,
                          fontSize: '1rem'
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Box>
        </Fade>
      
        <Slide direction="up" in={true} timeout={600}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ 
                p: { xs: 3, sm: 4, md: 5 }, 
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: { xs: 3, md: 0 },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 35px 100px rgba(0,0,0,0.15)'
                }
              }}>
                <Box sx={{ position: 'relative' }}>
                  {isCheckingAvailability && (
                    <LinearProgress 
                      sx={{ 
                        position: 'absolute',
                        top: -20,
                        left: -20,
                        right: -20,
                        borderRadius: '20px 20px 0 0',
                        height: 4
                      }} 
                    />
                  )}
                  
                  {getStepContent(activeStep)}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 5,
                    pt: 3,
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1.5,
                        borderColor: 'rgba(0,0,0,0.2)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Quay lại
                    </Button>
                    
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                          },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.2)',
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: '12px',
                          px: 4,
                          py: 1.5,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Tiếp theo
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Zoom in={true} timeout={800}>
                <Card sx={{ 
                  borderRadius: '20px',
                  position: 'sticky',
                  top: 24,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 35px 100px rgba(0,0,0,0.15)'
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={room.images && room.images[0] ? room.images[0] : '/placeholder-room.jpg'}
                      alt={room.name}
                      height="240"
                      sx={{
                        filter: 'brightness(1.1) contrast(1.1)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      px: 2,
                      py: 1,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Phòng {room.roomNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" component="h3" sx={{ 
                        fontWeight: 700,
                        mb: 1,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {room.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <StarIcon sx={{ color: '#ffd700', fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          Phòng cao cấp
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<PersonIcon fontSize="small" />} 
                        label={`${room.capacity} khách`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: 'primary.main',
                          fontWeight: 600
                        }}
                      />
                      {room.features && Array.isArray(room.features) && room.features.slice(0, 2).map((feature, index) => (
                        <Chip 
                          key={index}
                          label={feature?.name || feature}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="body2" paragraph sx={{ 
                      opacity: 0.8,
                      lineHeight: 1.6,
                      mb: 3
                    }}>
                      {room.description?.substring(0, 120)}...
                    </Typography>
                    
                    <Divider sx={{ my: 3, opacity: 0.6 }} />
                    
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <CreditCardIcon color="primary" fontSize="small" />
                        Chi tiết giá
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)} × {dayCount} đêm
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Thuế & phí dịch vụ
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount + serviceCharge)}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Divider sx={{ my: 2, opacity: 0.6 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <Typography variant="h6" fontWeight={700}>
                          Tổng cộng
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Slide>
      </Container>
    </Box>
  );
};

export default BookingForm;