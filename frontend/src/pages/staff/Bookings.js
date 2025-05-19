import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HotelIcon from '@mui/icons-material/Hotel';
import LogoutIcon from '@mui/icons-material/Logout';
import { DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const StaffBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [roomAssigned, setRoomAssigned] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Lấy dữ liệu đặt phòng từ API thực tế
        const response = await axios.get('/api/staff/bookings');
        setBookings(response.data);
        setFilteredBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let result = bookings;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => 
        booking.guestName.toLowerCase().includes(term) || 
        booking.email.toLowerCase().includes(term) ||
        booking.phone.includes(term) ||
        (booking.roomNumber && booking.roomNumber.includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      result = result.filter(booking => {
        const checkIn = format(parseISO(booking.checkIn), 'yyyy-MM-dd');
        const checkOut = format(parseISO(booking.checkOut), 'yyyy-MM-dd');
        return checkIn === filterDate || checkOut === filterDate;
      });
    }
    
    setFilteredBookings(result);
    setPage(0);
  }, [searchTerm, statusFilter, dateFilter, bookings]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdate(booking.status);
    setRoomAssigned(booking.roomNumber || '');
    setPaymentStatus(booking.paymentStatus);
    setNotes(booking.notes || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleCheckIn = async () => {
    if (!roomAssigned) {
      alert('Please assign a room before check-in');
      return;
    }

    try {
      // Cập nhật trạng thái đặt phòng thành checked-in thông qua API
      await axios.put(`/api/staff/bookings/${selectedBooking.id}/check-in`, {
        roomNumber: roomAssigned,
        notes: notes
      });
      
      // Lấy lại dữ liệu cập nhật
      const response = await axios.get('/api/staff/bookings');
      setBookings(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error checking in guest:', err);
      alert('Failed to check in guest. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      // Cập nhật trạng thái đặt phòng thành checked-out thông qua API
      await axios.put(`/api/staff/bookings/${selectedBooking.id}/check-out`, {
        notes: notes
      });
      
      // Lấy lại dữ liệu cập nhật
      const response = await axios.get('/api/staff/bookings');
      setBookings(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error checking out guest:', err);
      alert('Failed to check out guest. Please try again.');
    }
  };

  const handleUpdateBooking = async () => {
    try {
      // Cập nhật thông tin đặt phòng thông qua API
      await axios.put(`/api/staff/bookings/${selectedBooking.id}`, {
        status: statusUpdate,
        roomNumber: roomAssigned,
        paymentStatus: paymentStatus,
        notes: notes
      });
      
      // Lấy lại dữ liệu cập nhật
      const response = await axios.get('/api/staff/bookings');
      setBookings(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking. Please try again.');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <Chip label="Confirmed" color="primary" size="small" />;
      case 'checked-in':
        return <Chip label="Checked In" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'checked-out':
        return <Chip label="Checked Out" color="default" size="small" icon={<LogoutIcon />} />;
      case 'cancelled':
        return <Chip label="Cancelled" color="error" size="small" icon={<CancelIcon />} />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getPaymentChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Paid" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '70vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Booking Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search guest, email, phone or room"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end"><SearchIcon color="action" /></InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="checked-in">Checked In</MenuItem>
                <MenuItem value="checked-out">Checked Out</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Filter by Date"
              value={dateFilter}
              onChange={(newValue) => setDateFilter(newValue)}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter(null);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bookings Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="bookings table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow hover key={booking.id} onClick={() => handleOpenDialog(booking)}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{booking.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {booking.roomNumber ? (
                        <Chip 
                          icon={<HotelIcon />} 
                          label={`Room ${booking.roomNumber}`}
                          size="small" 
                          color="primary"
                        />
                      ) : (
                        <Typography variant="body2">{booking.roomType}</Typography>
                      )}
                    </TableCell>
                    <TableCell>{format(parseISO(booking.checkIn), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(booking.checkOut), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                    <TableCell>{getPaymentChip(booking.paymentStatus)}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(booking);
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Booking Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Booking #{selectedBooking.id} - {selectedBooking.guestName}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Guest Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedBooking.guestName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedBooking.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedBooking.phone}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>Booking Details</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Check In:</strong> {format(parseISO(selectedBooking.checkIn), 'EEEE, MMMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check Out:</strong> {format(parseISO(selectedBooking.checkOut), 'EEEE, MMMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Room Type:</strong> {selectedBooking.roomType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Guests:</strong> {selectedBooking.guests}
                    </Typography>
                    {selectedBooking.specialRequests && (
                      <Typography variant="body2">
                        <strong>Special Requests:</strong> {selectedBooking.specialRequests}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Manage Booking</Typography>
                  
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Booking Status</InputLabel>
                    <Select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      label="Booking Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="checked-in">Checked In</MenuItem>
                      <MenuItem value="checked-out">Checked Out</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Room Number"
                    variant="outlined"
                    value={roomAssigned}
                    onChange={(e) => setRoomAssigned(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={selectedBooking.status === 'checked-out'}
                  />
                  
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      label="Payment Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    variant="outlined"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
              
              {selectedBooking.status !== 'checked-in' && selectedBooking.status !== 'checked-out' && (
                <Button 
                  onClick={handleCheckIn} 
                  variant="contained" 
                  color="success"
                  disabled={!roomAssigned}
                >
                  Check In
                </Button>
              )}
              
              {selectedBooking.status === 'checked-in' && (
                <Button 
                  onClick={handleCheckOut} 
                  variant="contained" 
                  color="secondary"
                >
                  Check Out
                </Button>
              )}
              
              <Button onClick={handleUpdateBooking} variant="contained" color="primary">
                Update Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default StaffBookings; 