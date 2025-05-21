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
  useMediaQuery
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
  Remove as RemoveIcon
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
        
        // Verify that we received valid room data
        if (!response.data || !response.data._id) {
          setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
          setLoading(false);
          return;
        }
        
        // Store room data
        setRoom(response.data);
        
        // Initialize adults with room capacity or 1
        setBookingData(prev => ({
          ...prev,
          adults: response.data.capacity || 1
        }));
        
        // Fetch room availability after getting room data
        await fetchRoomAvailability(roomId);
        
        // Show success message
        toastService.success(`Phòng ${response.data.roomNumber} hiện có sẵn để đặt!`);
      } catch (err) {
        console.error('Error fetching room data:', err);
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
            <Typography variant="h6" gutterBottom>
              Chi Tiết Đặt Phòng
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
                      />
                    )}
                    disablePast
                    minDate={addDays(bookingData.checkInDate, 1)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Người lớn
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleGuestCountChange('adults', 'decrement')}
                    disabled={bookingData.adults <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                    {bookingData.adults}
                  </Typography>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleGuestCountChange('adults', 'increment')}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                {validationErrors.adults && (
                  <Typography color="error" variant="caption">
                    {validationErrors.adults}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Trẻ em
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleGuestCountChange('children', 'decrement')}
                    disabled={bookingData.children <= 0}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                    {bookingData.children}
                  </Typography>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleGuestCountChange('children', 'increment')}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="specialRequests"
                  label="Yêu cầu đặc biệt"
                  multiline
                  rows={3}
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  helperText="Vui lòng cho chúng tôi biết nếu bạn có bất kỳ yêu cầu đặc biệt nào"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thông Tin Khách Hàng
            </Typography>
            
            {isAuthenticated ? (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Chào {user?.name}</AlertTitle>
                  Bạn đang đặt phòng với tư cách thành viên đã đăng nhập. Thông tin cá nhân của bạn sẽ được sử dụng cho đặt phòng này.
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1">
                        {user.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user.email}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          name="isGuestBooking" 
                          checked={bookingData.isGuestBooking} 
                          onChange={handleCheckboxChange} 
                          color="primary"
                        />
                      }
                      label="Đặt phòng cho người khác"
                    />
                  </Grid>
                  
                  {bookingData.isGuestBooking && (
                    <>
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
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <AlertTitle>Thông báo</AlertTitle>
                    Bạn đang đặt phòng với tư cách Khách Vãng Lai. Vui lòng nhập chính xác số điện thoại của bạn để tra cứu đặt phòng sau này. 
                    <Box mt={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        href="/login"
                      >
                        Đăng nhập nếu bạn đã có tài khoản
                      </Button>
                    </Box>
                  </Alert>
                </Grid>
                
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
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="guestEmail"
                    label="Email"
                    type="email"
                    value={bookingData.guestEmail}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={Boolean(validationErrors.guestEmail)}
                    helperText={validationErrors.guestEmail}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start">
                    <TextField
                      name="guestPhone"
                      label="Số điện thoại"
                      value={bookingData.guestPhone}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      error={Boolean(validationErrors.guestPhone)}
                      helperText={validationErrors.guestPhone || "Số điện thoại sẽ được sử dụng để nhận diện khách hàng"}
                      required
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 2, ml: 1, height: 40 }}
                      onClick={handleLookupBookingsByPhone}
                      disabled={!bookingData.guestPhone}
                    >
                      Tra cứu
                    </Button>
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
              Xác Nhận và Thanh Toán
            </Typography>
            
            <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Chi Tiết Đặt Phòng
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phòng
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {room?.name} (Số phòng: {room?.roomNumber})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loại phòng
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {room?.roomType?.name || 'Standard'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Check-in
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(new Date(bookingData.checkInDate), 'dd/MM/yyyy')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Check-out
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(new Date(bookingData.checkOutDate), 'dd/MM/yyyy')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số đêm
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {dayCount} đêm
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số khách
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bookingData.adults} người lớn, {bookingData.children} trẻ em
                  </Typography>
                </Grid>
              </Grid>
              
              {bookingData.specialRequests && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Yêu cầu đặc biệt
                  </Typography>
                  <Typography variant="body1">
                    {bookingData.specialRequests}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Thông Tin Khách Hàng
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bookingData.isGuestBooking ? bookingData.guestName : user?.name || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bookingData.isGuestBooking ? bookingData.guestEmail : user?.email || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bookingData.isGuestBooking ? bookingData.guestPhone : user?.phone || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Hóa Đơn Chi Tiết
              </Typography>
              
              <TableContainer component={Box}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>
                        Giá phòng x {dayCount} đêm
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', pr: 0 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>
                        Thuế (10%)
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', pr: 0 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>
                        Phí dịch vụ (5%)
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', pr: 0 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(serviceCharge)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, pt: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Tổng cộng
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 0, pt: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Phương Thức Thanh Toán
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  name="paymentMethod"
                  value={bookingData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <FormControlLabel 
                    value="creditCard" 
                    control={<Radio color="primary" />} 
                    label="Thẻ tín dụng/ghi nợ"
                  />
                  <FormControlLabel 
                    value="bankTransfer" 
                    control={<Radio color="primary" />} 
                    label="Chuyển khoản ngân hàng"
                  />
                  <FormControlLabel 
                    value="payAtHotel" 
                    control={<Radio color="primary" />} 
                    label="Thanh toán tại khách sạn"
                  />
                </RadioGroup>
                
                {validationErrors.paymentMethod && (
                  <Typography color="error" variant="caption">
                    {validationErrors.paymentMethod}
                  </Typography>
                )}
              </FormControl>
            </Paper>
            
            <Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="agreeToTerms" 
                    checked={bookingData.agreeToTerms} 
                    onChange={handleCheckboxChange} 
                    color="primary"
                  />
                }
                label="Tôi đồng ý với các điều khoản và điều kiện đặt phòng"
              />
              
              {validationErrors.agreeToTerms && (
                <Typography color="error" variant="caption" display="block">
                  {validationErrors.agreeToTerms}
                </Typography>
              )}
            </Box>
            
            {bookingError && (
              <Alert severity="error" sx={{ mt: 2 }}>
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
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/rooms')}
          sx={{ mb: 2 }}
        >
          Quay lại trang phòng
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Đặt Phòng {room?.name}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }} >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: '12px', mb: { xs: 3, md: 0 } }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
              >
                Quay lại
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={24} /> : <CheckCircleIcon />}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Tiếp theo
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: '12px',
            position: 'sticky',
            top: 24,
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
            }
          }}>
            <CardMedia
              component="img"
              image={room.images && room.images[0] ? room.images[0] : '/placeholder-room.jpg'}
              alt={room.name}
              height="200"
            />
            
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  {room.name}
                </Typography>
                <Chip 
                  label={`Phòng ${room.roomNumber}`}
                  size="small"
                  color="primary"
                  sx={{ bgcolor: '#1e4e8c' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<HotelIcon fontSize="small" />} 
                  label={`${room.capacity} khách`}
                  size="small"
                  variant="outlined"
                />
                {room.features && room.features.slice(0, 2).map((feature, index) => (
                  <Chip 
                    key={index}
                    label={feature.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Typography variant="body2" paragraph>
                {room.description?.substring(0, 100)}...
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Chi tiết giá
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)} x {dayCount} đêm
                </Typography>
                <Typography variant="body2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Thuế & phí
                </Typography>
                <Typography variant="body2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount + serviceCharge)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">
                  Tổng cộng
                </Typography>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
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