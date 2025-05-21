import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography,
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
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
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestFilter, setGuestFilter] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
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
  
  // Filter bookings based on status and guest type
  useEffect(() => {
    let filtered = bookings;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by guest type
    if (guestFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.isGuestBooking === (guestFilter === 'guest')
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, guestFilter]);
  
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
    if (!selectedBooking) {
      console.error('No booking selected for cancellation');
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Cancelling booking:', selectedBooking._id);
      
      const response = await bookingAPI.updateBookingStatus(selectedBooking._id, { status: 'cancelled' });
      
      if (response && response.data) {
        console.log('Booking cancelled successfully:', response.data);
        // Update the booking in the local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === selectedBooking._id 
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        handleCloseDialogs();
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ máy chủ');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Không thể hủy đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedBooking) {
      console.error('No booking selected for confirmation');
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Confirming booking:', selectedBooking._id);
      
      const response = await bookingAPI.updateBookingStatus(selectedBooking._id, { status: 'confirmed' });
      
      if (response && response.data) {
        console.log('Booking confirmed successfully:', response.data);
        // Update the booking in the local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === selectedBooking._id 
              ? { ...booking, status: 'confirmed' } 
              : booking
          )
        );
        handleCloseDialogs();
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ máy chủ');
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Không thể xác nhận đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh bookings
  const handleRefreshBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getAllBookings();
      
      if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
        console.log('Bookings refreshed successfully:', response.data.length, 'bookings loaded');
      } else {
        console.error('Invalid response format:', response);
        setError('Định dạng dữ liệu không hợp lệ. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError('Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to bookings
  useEffect(() => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply guest filter
    if (guestFilter === 'guest') {
      filtered = filtered.filter(booking => booking.isGuestBooking);
    } else if (guestFilter === 'user') {
      filtered = filtered.filter(booking => !booking.isGuestBooking);
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, guestFilter]);
  
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
      case 'checked-in':
        return 'primary';
      case 'checked-out':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'checked-in':
        return 'Đã nhận phòng';
      case 'checked-out':
        return 'Đã trả phòng';
      default:
        return status;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không xác định';
    }
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
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="subtitle1" component="div" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} />
              Lọc:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                <MenuItem value="checked-in">Đã nhận phòng</MenuItem>
                <MenuItem value="checked-out">Đã trả phòng</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="guest-filter-label">Loại khách</InputLabel>
              <Select
                labelId="guest-filter-label"
                id="guest-filter"
                value={guestFilter}
                label="Loại khách"
                onChange={(e) => setGuestFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="guest">Khách vãng lai</MenuItem>
                <MenuItem value="user">Tài khoản đã đăng ký</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              {filteredBookings.length} kết quả
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      

      
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
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {booking.isGuestBooking 
                      ? `Khách Vãng Lai (${booking.guestPhone})` 
                      : booking.user?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{booking.room?.roomNumber || 'Unknown'}</TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(booking.status)} 
                      color={getStatusColor(booking.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem chi tiết">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDetailDialog(booking)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {booking.status === 'pending' && (
                      <>
                        <Tooltip title="Xác nhận">
                          <IconButton 
                            color="success" 
                            onClick={() => handleOpenConfirmDialog(booking)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hủy bỏ">
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
          {selectedBooking ? (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Mã đặt phòng:</strong> {selectedBooking._id}
              </Typography>
              
              {selectedBooking.isGuestBooking ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Khách hàng:</strong> Khách Vãng Lai
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Tên:</strong> {selectedBooking.guestName || 'Không xác định'}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Số điện thoại:</strong> {selectedBooking.guestPhone || 'Không xác định'}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Email:</strong> {selectedBooking.guestEmail || 'Không xác định'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Khách hàng:</strong> {selectedBooking.user?.name || 'Không xác định'}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Email:</strong> {selectedBooking.user?.email || 'Không xác định'}
                  </Typography>
                </>
              )}
              
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
                <strong>Số đêm:</strong> {
                  selectedBooking.checkInDate && selectedBooking.checkOutDate ? 
                  Math.ceil((new Date(selectedBooking.checkOutDate) - new Date(selectedBooking.checkInDate)) / (1000 * 60 * 60 * 24)) : 
                  'Không xác định'
                }
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Số khách:</strong> {selectedBooking.numberOfGuests ? 
                  `${selectedBooking.numberOfGuests.adults || 0} người lớn, ${selectedBooking.numberOfGuests.children || 0} trẻ em` : 
                  'Không xác định'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBooking.totalPrice || 0)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Trạng thái:</strong> {getStatusText(selectedBooking.status)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Yêu cầu đặc biệt:</strong> {selectedBooking.specialRequests || 'Không'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Ngày tạo:</strong> {formatDate(selectedBooking.createdAt)}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <CircularProgress size={28} sx={{ mb: 2 }} />
              <Typography>Đang tải thông tin...</Typography>
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