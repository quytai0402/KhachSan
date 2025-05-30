import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  EventNote as EventNoteIcon,
  PeopleAlt as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  CleaningServices as CleaningServicesIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarMonthIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';

const drawerWidth = 240;

export const staffMenuItems = [
  { text: 'Tổng Quan', path: '/staff/dashboard', icon: <DashboardIcon /> },
  { text: 'Quản Lý Phòng', path: '/staff/rooms', icon: <HotelIcon /> },
  { text: 'Đặt Phòng', path: '/staff/bookings', icon: <EventNoteIcon /> },
  { text: 'Lịch Trình', path: '/staff/schedule', icon: <CalendarMonthIcon /> },
  { text: 'Khách Hàng', path: '/staff/guests', icon: <PeopleIcon /> },
  { text: 'Dịch Vụ Phòng', path: '/staff/housekeeping', icon: <CleaningServicesIcon /> },
  { text: 'Khuyến Mãi', path: '/staff/promotions', icon: <LocalOfferIcon /> },
];

export const adminMenuItems = [
  { text: 'Tổng Quan', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { text: 'Quản Lý Phòng', path: '/admin/rooms', icon: <HotelIcon /> },
  { text: 'Đặt Phòng', path: '/admin/bookings', icon: <EventNoteIcon /> },
  { text: 'Người Dùng', path: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Dịch Vụ Phòng', path: '/admin/housekeeping', icon: <CleaningServicesIcon /> },
  { text: 'Quản Lý Dịch Vụ', path: '/admin/services-management', icon: <SettingsIcon /> },
  { text: 'Khuyến Mãi', path: '/admin/promotions', icon: <LocalOfferIcon /> },
  { text: 'Báo Cáo', path: '/admin/reports', icon: <AssessmentIcon /> },
];

const DashboardLayout = ({ children, title }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { notifications, systemAlerts, bookingUpdates } = useSocket();
  
  // Hợp nhất các loại thông báo để hiển thị
  const allNotifications = [
    ...notifications.map(n => ({
      id: n.id || Math.random().toString(36).substr(2, 9),
      text: n.message || n.text,
      time: n.timestamp ? format(new Date(n.timestamp), 'dd/MM/yyyy HH:mm') : 'Mới',
      read: n.read || false
    })),
    ...systemAlerts.map(n => ({
      id: n.id || Math.random().toString(36).substr(2, 9),
      text: n.message || n.text,
      time: n.timestamp ? format(new Date(n.timestamp), 'dd/MM/yyyy HH:mm') : 'Mới',
      read: n.read || false,
      isSystemAlert: true
    })),
    ...bookingUpdates.map(n => ({
      id: n.id || Math.random().toString(36).substr(2, 9),
      text: `Đặt phòng ${n.type === 'updated' ? 'được cập nhật' : n.type === 'canceled' ? 'đã bị hủy' : 'mới'}: ${n.booking?.roomNumber || ''}`,
      time: n.timestamp ? format(new Date(n.timestamp), 'dd/MM/yyyy HH:mm') : 'Mới',
      read: false
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));
  
  const unreadCount = allNotifications.filter(n => !n.read).length;
  
  // Always keep the drawer open, regardless of screen size
  // This ensures sidebar is always visible in admin and staff panels
  useEffect(() => {
    setOpen(true);
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleBackToSite = () => {
    navigate('/');
  };

  // Determine menu items based on user role
  const menuItems = user?.role === 'admin' ? adminMenuItems : staffMenuItems;
  const panelTitle = user?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          zIndex: theme.zIndex.drawer + 1,
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: drawerWidth,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {title || panelTitle}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Quay Lại Website">
              <IconButton 
                color="inherit" 
                onClick={handleBackToSite}
                sx={{ mr: 1 }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Thông Báo">
              <IconButton 
                color="inherit" 
                sx={{ mr: 1 }}
                onClick={handleNotificationsOpen}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.name || 'Tài Khoản'}>
              <IconButton 
                color="inherit" 
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name || 'User'} 
                  sx={{ width: 32, height: 32, bgcolor: '#1e4e8c' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: { 
            width: 200, 
            mt: 1.5,
            '& .MuiMenuItem-root': {
              py: 1
            }
          },
        }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Thông tin cá nhân
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Đăng xuất</Typography>
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        id="notifications-menu"
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: { 
            width: 320, 
            mt: 1.5,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" fontSize="1rem" fontWeight={600}>
            Thông Báo ({allNotifications.length})
          </Typography>
        </Box>
        {allNotifications.length > 0 ? (
          allNotifications.map(notification => (
            <MenuItem 
              key={notification.id}
              onClick={handleNotificationsClose}
              sx={{ 
                borderLeft: notification.read ? 'none' : (notification.isSystemAlert ? '3px solid #d32f2f' : '3px solid #1e4e8c'),
                py: 1.5,
                px: 2,
                bgcolor: notification.read ? 'inherit' : (notification.isSystemAlert ? 'rgba(211, 47, 47, 0.04)' : 'rgba(30, 78, 140, 0.04)')
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                  {notification.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary" align="center">
              Không có thông báo mới
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem 
          onClick={handleNotificationsClose}
          sx={{ 
            justifyContent: 'center', 
            color: 'primary.main',
            fontWeight: 500
          }}
        >
          Xem tất cả
        </MenuItem>
      </Menu>
      
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          px: [1],
          backgroundColor: '#1e4e8c', 
          color: 'white',
          minHeight: '64px'
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {panelTitle}
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ mt: 2, mx: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 1, 
            bgcolor: 'rgba(30, 78, 140, 0.1)'
          }}>
            <Avatar 
              src={user?.avatar} 
              alt={user?.name || 'User'} 
              sx={{ width: 40, height: 40, bgcolor: '#1e4e8c' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.name || 'Người Dùng'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 1 }} />
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={window.location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  position: 'relative',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(30, 78, 140, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(30, 78, 140, 0.20)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 5,
                      bottom: 5,
                      width: 4,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: '#1e4e8c',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  color: window.location.pathname === item.path ? '#1e4e8c' : 'inherit',
                  minWidth: '40px'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: window.location.pathname === item.path ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#f44336', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Đăng xuất" 
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
          </ListItemButton>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: `calc(100% - ${drawerWidth}px)` },
          marginLeft: 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;