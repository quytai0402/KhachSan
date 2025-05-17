import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HotelIcon from '@mui/icons-material/Hotel';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const publicPages = [
    { title: 'Home', path: '/' },
    { title: 'Rooms', path: '/rooms' },
    { title: 'Services', path: '/services' },
    { title: 'Promotions', path: '/promotions' },
    { title: 'Contact', path: '/contact' }
  ];

  const userPages = [
    { title: 'My Bookings', path: '/my-bookings' }
  ];

  const adminPages = [
    { title: 'Dashboard', path: '/admin/dashboard' },
    { title: 'Manage Rooms', path: '/admin/rooms' },
    { title: 'Manage Bookings', path: '/admin/bookings' },
    { title: 'Manage Users', path: '/admin/users' },
    { title: 'Manage Services', path: '/admin/services' },
    { title: 'Manage Promotions', path: '/admin/promotions' },
    { title: 'Reports', path: '/admin/reports' }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography
        variant="h6"
        sx={{ my: 2 }}
        component={RouterLink}
        to="/"
        color="inherit"
        underline="none"
        style={{ textDecoration: 'none' }}
      >
        HOTEL MANAGEMENT
      </Typography>
      <Divider />
      <List>
        {publicPages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton 
              sx={{ textAlign: 'center' }}
              component={RouterLink}
              to={page.path}
            >
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ textAlign: 'center' }}
                component={RouterLink}
                to="/login"
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ textAlign: 'center' }}
                component={RouterLink}
                to="/register"
              >
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            {user?.role === 'user' && userPages.map((page) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton 
                  sx={{ textAlign: 'center' }}
                  component={RouterLink}
                  to={page.path}
                >
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            ))}
            {user?.role === 'admin' && (
              <>
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 2 }}>
                    Admin Panel
                  </Typography>
                </ListItem>
                {[
                  { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
                  { text: 'Rooms', path: '/admin/rooms', icon: <HotelIcon fontSize="small" /> },
                  { text: 'Bookings', path: '/admin/bookings', icon: <BookIcon fontSize="small" /> },
                  { text: 'Users', path: '/admin/users', icon: <PeopleIcon fontSize="small" /> },
                  { text: 'Services', path: '/admin/services', icon: <RoomServiceIcon fontSize="small" /> },
                  { text: 'Promotions', path: '/admin/promotions', icon: <LocalOfferIcon fontSize="small" /> },
                  { text: 'Reports', path: '/admin/reports', icon: <AssessmentIcon fontSize="small" /> }
                ].map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      sx={{ 
                        textAlign: 'left',
                        pl: 3
                      }}
                    >
                      {item.icon}
                      <ListItemText primary={item.text} sx={{ ml: 1 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
              </>
            )}
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ textAlign: 'center' }}
                onClick={handleLogout}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile View */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
              }}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HOTEL
          </Typography>

          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HOTEL MANAGEMENT
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {publicPages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Desktop Right Side Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {!isAuthenticated ? (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  color="inherit"
                  variant="outlined"
                  sx={{ mx: 1 }}
                >
                  Register
                </Button>
              </Box>
            ) : (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
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
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  
                  {user?.role === 'user' && userPages.map((page) => (
                    <MenuItem 
                      key={page.title} 
                      component={RouterLink} 
                      to={page.path}
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{page.title}</Typography>
                    </MenuItem>
                  ))}
                  
                  {user?.role === 'admin' && (
                    <>
                      <ListItem>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 2 }}>
                          Admin Panel
                        </Typography>
                      </ListItem>
                      {[
                        { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
                        { text: 'Rooms', path: '/admin/rooms', icon: <HotelIcon fontSize="small" /> },
                        { text: 'Bookings', path: '/admin/bookings', icon: <BookIcon fontSize="small" /> },
                        { text: 'Users', path: '/admin/users', icon: <PeopleIcon fontSize="small" /> },
                        { text: 'Services', path: '/admin/services', icon: <RoomServiceIcon fontSize="small" /> },
                        { text: 'Promotions', path: '/admin/promotions', icon: <LocalOfferIcon fontSize="small" /> },
                        { text: 'Reports', path: '/admin/reports', icon: <AssessmentIcon fontSize="small" /> }
                      ].map((item) => (
                        <ListItem key={item.text} disablePadding>
                          <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            sx={{ 
                              textAlign: 'left',
                              pl: 3
                            }}
                          >
                            {item.icon}
                            <ListItemText primary={item.text} sx={{ ml: 1 }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      <Divider sx={{ my: 1 }} />
                    </>
                  )}
                  
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 