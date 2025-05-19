import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

// Styled Avatar Upload Button
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
  
  // Sample user booking/activity history 
  const [userBookings] = useState([
    {
      id: 'b1',
      roomNumber: '301',
      checkIn: new Date(2025, 4, 5),
      checkOut: new Date(2025, 4, 10),
      status: 'completed',
      totalAmount: 4750000
    },
    {
      id: 'b2',
      roomNumber: '205',
      checkIn: new Date(2025, 2, 15),
      checkOut: new Date(2025, 2, 18),
      status: 'completed',
      totalAmount: 2850000
    },
    {
      id: 'b3',
      roomNumber: '402',
      checkIn: new Date(2025, 7, 20),
      checkOut: new Date(2025, 7, 25),
      status: 'upcoming',
      totalAmount: 3750000
    }
  ]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
    }
  }, [isAuthenticated, navigate]);
  
  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        preferences: user.preferences || {
          newsletter: true,
          specialOffers: true,
          roomPreferences: '',
          dietaryRequirements: ''
        }
      });
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const [parent, child] = name.split('.');
    
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: checked
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Update user profile
      await userAPI.updateProfile(profileData);
      setSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password dialog open/close
  const handlePasswordDialogOpen = () => {
    setChangePasswordOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };
  
  const handlePasswordDialogClose = () => {
    setChangePasswordOpen(false);
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password inputs
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, make API call to change password
      // await userAPI.changePassword(passwordData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess(true);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handlePasswordDialogClose();
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordErrors({
        general: err.response?.data?.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hồ Sơ Cá Nhân
      </Typography>
      
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'background.paper', 
              border: '1px solid rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Avatar with upload button */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    component="label" 
                    sx={{ 
                      bgcolor: '#1e4e8c', 
                      color: 'white',
                      '&:hover': { bgcolor: '#15385f' }
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <VisuallyHiddenInput type="file" accept="image/*" />
                  </IconButton>
                }
              >
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    border: '4px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  alt={user.name}
                  src={user.profileImage || "/static/images/avatar/1.jpg"}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Badge>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            
            <Chip 
              label={
                user.role === 'admin' ? 'Quản trị viên' :
                user.role === 'staff' ? 'Nhân viên' : 
                'Khách hàng'
              }
              color={user.role === 'admin' ? 'error' : user.role === 'staff' ? 'primary' : 'success'}
              size="small"
              sx={{ mt: 1, mb: 3 }}
            />
            
            <Typography variant="caption" color="text.secondary">
              Thành viên từ {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}
            </Typography>
            
            <Box sx={{ width: '100%', mt: 4 }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={tabValue}
                onChange={handleTabChange}
                sx={{ 
                  borderRight: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left'
                  }
                }}
              >
                <Tab 
                  label="Thông tin cá nhân" 
                  icon={<PersonIcon />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Đặt phòng" 
                  icon={<HistoryIcon />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Tùy chọn" 
                  icon={<SettingsIcon />} 
                  iconPosition="start" 
                />
              </Tabs>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Personal Information Tab */}
          <Box hidden={tabValue !== 0}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Cá Nhân
                </Typography>
                
                <Button 
                  variant="outlined" 
                  startIcon={<LockIcon />}
                  onClick={handlePasswordDialogOpen}
                >
                  Đổi Mật Khẩu
                </Button>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Hồ sơ đã được cập nhật thành công!
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      variant="outlined"
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      variant="outlined"
                      multiline
                      rows={2}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ 
                          bgcolor: '#1e4e8c', 
                          '&:hover': { bgcolor: '#15385f' } 
                        }}
                      >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
          
          {/* Bookings Tab */}
          <Box hidden={tabValue !== 1}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Lịch Sử Đặt Phòng
              </Typography>
              
              {userBookings.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Bạn chưa có đặt phòng nào.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ 
                      mt: 2,
                      bgcolor: '#1e4e8c', 
                      '&:hover': { bgcolor: '#15385f' } 
                    }}
                    onClick={() => navigate('/rooms')}
                  >
                    Đặt phòng ngay
                  </Button>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Grid container spacing={2}>
                    {userBookings.map(booking => (
                      <Grid item xs={12} key={booking.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            borderRadius: 2,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={6}>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    Phòng {booking.roomNumber}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {booking.checkIn.toLocaleDateString('vi-VN')} - {booking.checkOut.toLocaleDateString('vi-VN')}
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={6} sm={3}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Trạng thái
                                  </Typography>
                                  <Chip 
                                    label={booking.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'} 
                                    color={booking.status === 'completed' ? 'success' : 'primary'}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              </Grid>
                              
                              <Grid item xs={6} sm={3} textAlign="right">
                                <Typography variant="body2" color="text.secondary">
                                  Tổng thanh toán
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={500} color="primary">
                                  {booking.totalAmount.toLocaleString('vi-VN')} ₫
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Box>
          
          {/* Preferences Tab */}
          <Box hidden={tabValue !== 2}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Tùy Chọn Và Sở Thích
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sở thích phòng
                    </Typography>
                    <TextField
                      fullWidth
                      name="preferences.roomPreferences"
                      value={profileData.preferences?.roomPreferences || ''}
                      onChange={handleChange}
                      placeholder="VD: Phòng yên tĩnh, tầng cao, gần thang máy..."
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Yêu cầu ăn uống đặc biệt
                    </Typography>
                    <TextField
                      fullWidth
                      name="preferences.dietaryRequirements"
                      value={profileData.preferences?.dietaryRequirements || ''}
                      onChange={handleChange}
                      placeholder="VD: Ăn chay, dị ứng hải sản..."
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ 
                          bgcolor: '#1e4e8c', 
                          '&:hover': { bgcolor: '#15385f' } 
                        }}
                      >
                        {loading ? 'Đang lưu...' : 'Lưu tùy chọn'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
        </Grid>
      </Grid>
      
      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={handlePasswordDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        
        <DialogContent>
          {passwordErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordErrors.general}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Mật khẩu đã được cập nhật thành công!
            </Alert>
          )}
          
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              label="Mật khẩu hiện tại"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={Boolean(passwordErrors.currentPassword)}
              helperText={passwordErrors.currentPassword}
              variant="outlined"
            />
            
            <TextField
              margin="dense"
              label="Mật khẩu mới"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={Boolean(passwordErrors.newPassword)}
              helperText={passwordErrors.newPassword}
              variant="outlined"
            />
            
            <TextField
              margin="dense"
              label="Xác nhận mật khẩu mới"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={Boolean(passwordErrors.confirmPassword)}
              helperText={passwordErrors.confirmPassword}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handlePasswordDialogClose} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handlePasswordSubmit} 
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
            sx={{ 
              bgcolor: '#1e4e8c', 
              '&:hover': { bgcolor: '#15385f' } 
            }}
          >
            {loading ? 'Đang xử lý...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;