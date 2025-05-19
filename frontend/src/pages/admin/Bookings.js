import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { withDashboardLayout } from '../../utils/layoutHelpers';

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
    return format(new Date(dateString), 'dd/MM/yyyy');
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
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quản Lý Đặt Phòng
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshBookings}
        >
          Làm Mới
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
              <TableCell>Mã Đặt Phòng</TableCell>
              <TableCell>Khách Hàng</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Nhận Phòng</TableCell>
              <TableCell>Trả Phòng</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
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
                  Không tìm thấy đặt phòng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* View Booking Details Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Chi Tiết Đặt Phòng</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Mã đặt phòng:</strong> {selectedBooking._id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Khách hàng:</strong> {selectedBooking.user?.name || 'Không xác định'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Email:</strong> {selectedBooking.user?.email || 'Không xác định'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Phòng:</strong> {selectedBooking.room?.roomNumber || 'Không xác định'} ({selectedBooking.room?.type || 'Không xác định'})
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Nhận phòng:</strong> {formatDate(selectedBooking.checkInDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Trả phòng:</strong> {formatDate(selectedBooking.checkOutDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Số khách:</strong> {selectedBooking.numberOfGuests}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Tổng tiền:</strong> ${selectedBooking.totalPrice}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Trạng thái:</strong> {selectedBooking.status}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Yêu cầu đặc biệt:</strong> {selectedBooking.specialRequests || 'Không'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Ngày tạo:</strong> {formatDate(selectedBooking.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Hủy Đặt Phòng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đặt phòng này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Không, Giữ Lại
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Có, Hủy Bỏ'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Booking Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xác Nhận Đặt Phòng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xác nhận đặt phòng này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmBooking} 
            color="success" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(Bookings, "Quản Lý Đặt Phòng"); 