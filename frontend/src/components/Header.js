import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
// Language switcher removed
import { useLanguage } from '../context/LanguageContext';
import SystemNotification from './SystemNotification';
import { ROLES } from '../utils/roles';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s',
  '&.scrolled': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(0)',
  },
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
});

const NavButton = styled(Button)(({ theme }) => ({
  margin: '0 5px',
  color: theme.palette.text.primary,
  fontWeight: 500,
  fontSize: '0.95rem',
  textTransform: 'none',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0',
    height: '2px',
    bottom: '0',
    left: '50%',
    background: theme.palette.primary.main,
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    '&::after': {
      width: '80%',
      left: '10%',
    },
  },
  '&.active': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    '&::after': {
      width: '80%',
      left: '10%',
    },
  },
}));

const UserMenu = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
      {/* Notification Icon - Only for authenticated users */}
      {user && <SystemNotification />}
      
      <Tooltip title="Mở hồ sơ">
        <IconButton 
          onClick={handleOpenUserMenu} 
          sx={{ 
            p: 0.5, 
            ml: 2,
            border: `2px solid ${theme.palette.primary.light}`,
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(30, 78, 140, 0.08)',
            }
          }}
        >
          <Avatar 
            alt={user?.name || "Người dùng"} 
            src={user?.profileImage} 
            sx={{ 
              width: 32, 
              height: 32,
              bgcolor: user?.profileImage ? 'transparent' : 'primary.main',
              fontSize: '1rem'
            }}
          >
            {!user?.profileImage && user?.name ? user.name.charAt(0).toUpperCase() : null}
          </Avatar>
        </IconButton>
      </Tooltip>
      
      <Menu
        sx={{ 
          mt: '45px',
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            '& .MuiMenu-list': {
              padding: '8px',
            },
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              margin: '4px 0',
              '&:hover': {
                backgroundColor: 'rgba(30, 78, 140, 0.08)',
              },
            },
          },
        }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
          <Typography textAlign="center">Hồ sơ</Typography>
        </MenuItem>
        
        {/* Show appropriate dashboard link based on user role */}
        {user?.role === ROLES.ADMIN && (
          <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/dashboard'); }}>
            <Typography textAlign="center">Bảng điều khiển Admin</Typography>
          </MenuItem>
        )}
        
        {user?.role === ROLES.STAFF && (
          <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/staff/dashboard'); }}>
            <Typography textAlign="center">Bảng điều khiển Nhân viên</Typography>
          </MenuItem>
        )}
        
        {/* Admin can also access staff interface */}
        {user?.role === ROLES.ADMIN && (
          <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/staff/dashboard'); }}>
            <Typography textAlign="center">Giao diện Nhân viên</Typography>
          </MenuItem>
        )}
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            color: 'error.main', 
            '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.08)' } 
          }}
        >
          <Typography textAlign="center">Đăng xuất</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage(); // Add language context
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to change header appearance on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if current page is a dashboard page (admin or staff)
  const isDashboardPage = location.pathname.includes('/admin/') || 
                          location.pathname.includes('/staff/');

  // Don't show the header on dashboard pages since they have their own navigation
  if (isDashboardPage) return null;
  
  // Check if the current route matches a nav item path
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const publicPages = [
    { title: 'Trang Chủ', path: '/' },
    { title: 'Phòng', path: '/rooms' },
    { title: 'Dịch Vụ', path: '/services' },
    { title: 'Khuyến Mãi', path: '/promotions' },
    { title: 'Liên Hệ', path: '/contact' }
  ];

  const userPages = [
    { title: 'Đặt Phòng Của Tôi', path: '/my-bookings' }
  ];

  const drawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                textDecoration: 'none',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              KHÁCH SẠN SANG TRỌNG
            </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, py: 2 }}>
        {publicPages.map((page) => (
          <ListItem key={page.path} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={page.path}
              selected={isActivePath(page.path)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.12)',
                  },
                },
              }}
            >
              <ListItemText 
                primary={page.title} 
                primaryTypographyProps={{
                  fontWeight: isActivePath(page.path) ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {isAuthenticated && userPages.map((page) => (
          <ListItem key={page.path} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={page.path}
              selected={isActivePath(page.path)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.12)',
                  },
                },
              }}
            >
              <ListItemText 
                primary={page.title}
                primaryTypographyProps={{
                  fontWeight: isActivePath(page.path) ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button 
              component={RouterLink} 
              to="/login"
              fullWidth
              variant="contained" 
              color="primary"
              sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}
            >
              Đăng Nhập
            </Button>
            <Button 
              component={RouterLink} 
              to="/register"
              fullWidth
              variant="outlined" 
              color="primary"
              sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}
            >
              Đăng Ký
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Đăng nhập với tư cách
            </Typography>
            <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
              {user?.name}
            </Typography>
          </Box>
        )}
        
        {/* Language switcher removed from mobile drawer */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          {/* Language switcher removed */}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar 
        position="sticky" 
        className={scrolled ? 'scrolled' : ''}
        elevation={0}
      >
        <Container maxWidth="lg">
          <StyledToolbar>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                letterSpacing: '.5px',
                color: 'primary.dark',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                transition: 'color 0.3s',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
            >
              KHÁCH SẠN SANG TRỌNG
            </Typography>
            
            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {publicPages.map((page) => (
                <NavButton
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  className={isActivePath(page.path) ? 'active' : ''}
                >
                  {page.title}
                </NavButton>
              ))}
              
              {isAuthenticated && userPages.map((page) => (
                <NavButton
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  className={isActivePath(page.path) ? 'active' : ''}
                >
                  {page.title}
                </NavButton>
              ))}
            </Box>
            
            {/* Mobile menu toggle */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="main menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* User authentication section */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {/* Language Switcher removed */}
              <Box sx={{ mr: 2 }}>
                {/* Language switcher removed */}
              </Box>
              
              {!isAuthenticated ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    color="inherit"
                    sx={{ 
                      mr: 1,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Đăng Nhập
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="secondary"
                    sx={{ 
                      borderRadius: '20px',
                      px: 2.5,
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(230, 126, 34, 0.25)'
                    }}
                  >
                    Đăng Ký
                  </Button>
                </>
              ) : (
                <UserMenu />
              )}
            </Box>
          </StyledToolbar>
        </Container>
      </StyledAppBar>            {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Language Switcher on Mobile - removed */}
    </Box>
  );
};

export default Header;