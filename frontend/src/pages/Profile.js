import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Badge,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CardActions,
  styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
  DateRange as DateRangeIcon,
  LocationOn as LocationOnIcon,
  ReceiptLong as ReceiptIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingAPI } from '../services/api';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Status colors for bookings
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

// Status labels for bookings
const getStatusLabel = (status) => {
  switch (status) {
    case 'confirmed':
      return 'Đã Xác Nhận';
    case 'pending':
      return 'Đang Chờ';
    case 'checked-in':
      return 'Đã Nhận Phòng';
    case 'checked-out':
      return 'Đã Trả Phòng';
    case 'cancelled':
      return 'Đã Hủy';
    default:
      return status;
  }
};

// TabPanel component for booking tabs
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`booking-tabpanel-${index}`}
    aria-labelledby={`booking-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// BookingCard component
const BookingCard = ({ booking, onCancel }) => {
  const canCancel = (booking) => {
    if (booking.status === 'cancelled' || booking.status === 'checked-out') {
      return false;
    }
    
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkInDate > today;
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {booking.hotelName || 'Hotel'}
          </Typography>
          <Chip 
            label={getStatusLabel(booking.status)} 
            color={getStatusColor(booking.status)}
            size="small"
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {format(new Date(booking.checkInDate), 'dd/MM/yyyy')} - {format(new Date(booking.checkOutDate), 'dd/MM/yyyy')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {booking.roomType} - {booking.roomNumber || 'Chưa phân phòng'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>
        
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      newsletter: true,
      specialOffers: true,
      roomPreferences: '',
      dietaryRequirements: ''
    }
  });
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Bookings related state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingTabValue, setBookingTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadProfileData();
    loadBookings();
  }, [isAuthenticated, navigate]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      setError('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data || []);
    } catch (error) {
      setBookingsError('Không thể tải danh sách đặt phòng');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      await userAPI.updateProfile(profileData);
      setSuccess(true);
    } catch (error) {
      setError('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
    }
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    try {
      await bookingAPI.cancelBooking(bookingToCancel._id);
      loadBookings(); // Reload bookings
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    } catch (error) {
      setBookingsError('Không thể hủy đặt phòng');
    }
  };

  const filterBookings = (status) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (status) {
      case 'all':
        return bookings;
      case 'upcoming':
        return bookings.filter(booking => {
          const checkInDate = new Date(booking.checkInDate);
          return checkInDate >= today && booking.status !== 'cancelled';
        });
      case 'past':
        return bookings.filter(booking => {
          const checkOutDate = new Date(booking.checkOutDate);
          return checkOutDate < today || booking.status === 'checked-out';
        });
      default:
        return bookings;
    }
  };

  const getFilteredBookings = () => {
    switch (bookingTabValue) {
      case 0:
        return filterBookings('all');
      case 1:
        return filterBookings('upcoming');
      case 2:
        return filterBookings('past');
      default:
        return bookings;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
          Tài Khoản Của Tôi
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<PersonIcon />} label="Thông tin cá nhân" />
          <Tab icon={<HistoryIcon />} label="Đặt phòng" />
          <Tab icon={<SettingsIcon />} label="Tùy chọn" />
        </Tabs>

        {/* Personal Information Tab */}
        {tabValue === 0 && (
          <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Cập nhật thành công!</Alert>}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    src={profileData.avatar}
                  >
                    {profileData.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ mb: 2 }}
                  >
                    Thay đổi ảnh
                    <VisuallyHiddenInput type="file" accept="image/*" />
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Bookings Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Đặt Phòng Của Tôi
            </Typography>

            <Tabs
              value={bookingTabValue}
              onChange={(e, newValue) => setBookingTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Tất Cả" />
              <Tab label="Sắp Tới" />
              <Tab label="Đã Qua" />
            </Tabs>

            {bookingsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : bookingsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>{bookingsError}</Alert>
            ) : (
              <TabPanel value={bookingTabValue} index={bookingTabValue}>
                {getFilteredBookings().length > 0 ? (
                  getFilteredBookings().map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Không có đặt phòng nào
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/hotels"
                      variant="contained"
                      sx={{ mt: 2 }}
                    >
                      Đặt phòng ngay
                    </Button>
                  </Box>
                )}
              </TabPanel>
            )}
          </Box>
        )}

        {/* Settings Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Tùy Chọn
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Nhận thông báo email"
                  secondary="Nhận thông tin về đặt phòng và ưu đãi"
                />
                <Button
                  variant={profileData.preferences.newsletter ? "contained" : "outlined"}
                  onClick={() => setProfileData({
                    ...profileData,
                    preferences: {
                      ...profileData.preferences,
                      newsletter: !profileData.preferences.newsletter
                    }
                  })}
                >
                  {profileData.preferences.newsletter ? 'Bật' : 'Tắt'}
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Ưu đãi đặc biệt"
                  secondary="Nhận thông báo về các chương trình khuyến mãi"
                />
                <Button
                  variant={profileData.preferences.specialOffers ? "contained" : "outlined"}
                  onClick={() => setProfileData({
                    ...profileData,
                    preferences: {
                      ...profileData.preferences,
                      specialOffers: !profileData.preferences.specialOffers
                    }
                  })}
                >
                  {profileData.preferences.specialOffers ? 'Bật' : 'Tắt'}
                </Button>
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Sở thích phòng"
                multiline
                rows={3}
                value={profileData.preferences.roomPreferences}
                onChange={(e) => setProfileData({
                  ...profileData,
                  preferences: {
                    ...profileData.preferences,
                    roomPreferences: e.target.value
                  }
                })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Yêu cầu ăn uống đặc biệt"
                multiline
                rows={3}
                value={profileData.preferences.dietaryRequirements}
                onChange={(e) => setProfileData({
                  ...profileData,
                  preferences: {
                    ...profileData.preferences,
                    dietaryRequirements: e.target.value
                  }
                })}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
        <DialogTitle>Đổi Mật Khẩu</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu mới"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Xác nhận mật khẩu mới"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Hủy</Button>
          <Button onClick={handleChangePassword} variant="contained">Đổi mật khẩu</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Xác Nhận Hủy Đặt Phòng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đặt phòng này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Không</Button>
          <Button onClick={confirmCancelBooking} variant="contained" color="error">
            Hủy đặt phòng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={passwordSuccess}
        autoHideDuration={3000}
        onClose={() => setPasswordSuccess(false)}
      >
        <Alert severity="success" onClose={() => setPasswordSuccess(false)}>
          Đổi mật khẩu thành công!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
