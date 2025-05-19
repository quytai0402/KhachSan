import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  ReceiptLong as ReceiptIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'checked-in':
      return 'info';
    case 'checked-out':
      return 'default';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bookings-tabpanel-${index}`}
      aria-labelledby={`bookings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Cancellation dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-bookings');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getUserBookings();
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Không thể tải thông tin đặt phòng của bạn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open cancel dialog
  const handleOpenCancelDialog = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };
  
  // Close cancel dialog
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };
  
  // Cancel booking
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancelling(true);
    
    try {
      // Update the booking status to cancelled
      await bookingAPI.updateBooking(bookingToCancel._id, {
        status: 'cancelled'
      });
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingToCancel._id
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      // Close the dialog
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Không thể hủy đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };
  
  // Filter bookings based on tab value
  const getFilteredBookings = () => {
    switch (tabValue) {
      case 0: // All bookings
        return bookings;
      case 1: // Upcoming bookings
        return bookings.filter(booking => 
          booking.status === 'confirmed' || 
          booking.status === 'pending'
        );
      case 2: // Past bookings
        return bookings.filter(booking => 
          booking.status === 'checked-out' || 
          booking.status === 'cancelled'
        );
      default:
        return bookings;
    }
  };
  
  const filteredBookings = getFilteredBookings();
  
  // Check if booking can be cancelled
  const canCancelBooking = (booking) => {
    return booking.status === 'confirmed' || booking.status === 'pending';
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Đặt Phòng Của Tôi
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Tất Cả" />
            <Tab label="Sắp Tới" />
            <Tab label="Đã Qua" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {filteredBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Không tìm thấy đặt phòng nào
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bạn chưa có đặt phòng nào.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/rooms"
              >
                Xem Các Phòng
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleOpenCancelDialog}
                    canCancel={canCancelBooking}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {filteredBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Không có đặt phòng sắp tới
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bạn không có đặt phòng sắp tới nào.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/rooms"
              >
                Đặt Phòng
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleOpenCancelDialog}
                    canCancel={canCancelBooking}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {filteredBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Không có đặt phòng đã qua
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bạn không có đặt phòng đã qua nào.
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/rooms"
              >
                Đặt Phòng
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <BookingCard 
                    booking={booking} 
                    onCancel={handleOpenCancelDialog}
                    canCancel={canCancelBooking}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      {/* Cancellation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>
          Hủy Đặt Phòng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đặt phòng này? Hành động này không thể hoàn tác.
          </DialogContentText>
          {bookingToCancel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Chi tiết đặt phòng:
              </Typography>
              <Typography variant="body2">
                Nhận phòng: {format(new Date(bookingToCancel.checkInDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2">
                Trả phòng: {format(new Date(bookingToCancel.checkOutDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2">
                Phòng: {bookingToCancel.room.roomNumber}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseCancelDialog} 
            disabled={cancelling}
          >
            Giữ Đặt Phòng
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {cancelling ? 'Đang hủy...' : 'Hủy Đặt Phòng'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Booking card component
const BookingCard = ({ booking, onCancel, canCancel }) => {
  // Format dates
  const checkInDate = format(new Date(booking.checkInDate), 'EEE, MMM dd, yyyy');
  const checkOutDate = format(new Date(booking.checkOutDate), 'EEE, MMM dd, yyyy');
  
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Đặt phòng #{booking._id.substring(booking._id.length - 6).toUpperCase()}
          </Typography>
          <Chip 
            label={booking.status} 
            color={getStatusColor(booking.status)} 
            size="small"
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            Phòng {booking.room.roomNumber}, {booking.room.type} Room
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            {checkInDate} đến {checkOutDate}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            {booking.numberOfGuests.adults} {booking.numberOfGuests.adults === 1 ? 'Người lớn' : 'Người lớn'}
            {booking.numberOfGuests.children > 0 && `, ${booking.numberOfGuests.children} ${booking.numberOfGuests.children === 1 ? 'Trẻ em' : 'Trẻ em'}`}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ReceiptIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            Tổng: ${booking.totalPrice}
          </Typography>
        </Box>
        
        {booking.specialRequests && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Yêu cầu đặc biệt:</strong> {booking.specialRequests}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button 
          component={RouterLink}
          to={`/booking-details/${booking._id}`}
          startIcon={<CheckCircleIcon />}
        >
          Xem Chi Tiết
        </Button>
        
        {canCancel(booking) ? (
          <Button 
            color="error" 
            startIcon={<CancelIcon />}
            onClick={() => onCancel(booking)}
          >
            Hủy
          </Button>
        ) : (
          <Button 
            startIcon={<EditIcon />}
            disabled={booking.status === 'cancelled' || booking.status === 'checked-out'}
          >
            Chỉnh Sửa
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default MyBookings; 