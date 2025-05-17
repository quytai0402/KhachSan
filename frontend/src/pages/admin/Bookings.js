import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const Bookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/bookings');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getAllBookings();
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchBookings();
    }
  }, [isAuthenticated, user]);
  
  // Open detail dialog
  const handleOpenDetailDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenDetailDialog(true);
  };
  
  // Open cancel dialog
  const handleOpenCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenCancelDialog(true);
  };
  
  // Open confirm dialog
  const handleOpenConfirmDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenConfirmDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenDetailDialog(false);
    setOpenCancelDialog(false);
    setOpenConfirmDialog(false);
    setSelectedBooking(null);
  };
  
  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setSubmitting(true);
      await bookingAPI.updateBookingStatus(selectedBooking._id, { status: 'cancelled' });
      setBookings(prev => 
        prev.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      handleCloseDialogs();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setSubmitting(true);
      await bookingAPI.updateBookingStatus(selectedBooking._id, { status: 'confirmed' });
      setBookings(prev => 
        prev.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: 'confirmed' } 
            : booking
        )
      );
      handleCloseDialogs();
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh bookings
  const handleRefreshBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError('Failed to refresh bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Render loading state
  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Booking Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshBookings}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                  <TableCell>{booking.user?.name || 'Unknown'}</TableCell>
                  <TableCell>{booking.room?.roomNumber || 'Unknown'}</TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status} 
                      color={getStatusColor(booking.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDetailDialog(booking)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {booking.status === 'pending' && (
                      <>
                        <Tooltip title="Confirm">
                          <IconButton 
                            color="success" 
                            onClick={() => handleOpenConfirmDialog(booking)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenCancelDialog(booking)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* View Booking Details Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Booking ID:</strong> {selectedBooking._id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Guest:</strong> {selectedBooking.user?.name || 'Unknown'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Email:</strong> {selectedBooking.user?.email || 'Unknown'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Room:</strong> {selectedBooking.room?.roomNumber || 'Unknown'} ({selectedBooking.room?.type || 'Unknown'})
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Check In:</strong> {formatDate(selectedBooking.checkInDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Check Out:</strong> {formatDate(selectedBooking.checkOutDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Guests:</strong> {selectedBooking.numberOfGuests}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Total Price:</strong> ${selectedBooking.totalPrice}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong> {selectedBooking.status}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Special Requests:</strong> {selectedBooking.specialRequests || 'None'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Created At:</strong> {formatDate(selectedBooking.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            No, Keep It
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Booking Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to confirm this booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBooking} 
            color="success" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bookings; 