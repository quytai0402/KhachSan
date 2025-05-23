import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROLES } from './utils/roles';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (to be implemented later)
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import BookingForm from './pages/BookingForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Services from './pages/Services';
import Promotions from './pages/Promotions';
import Contact from './pages/Contact';

// Admin Pages (to be implemented later)
import AdminDashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminPromotions from './pages/admin/Promotions';
import AdminReports from './pages/admin/Reports';
import AdminHousekeeping from './pages/admin/Housekeeping';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffRooms from './pages/staff/Rooms';
import StaffBookings from './pages/staff/Bookings';
import StaffSchedule from './pages/staff/Schedule';
import StaffGuests from './pages/staff/Guests';
import StaffHousekeeping from './pages/staff/Housekeeping';
import StaffPromotions from './pages/staff/Promotions';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e4e8c',
      light: '#4c7ac0',
      dark: '#0d2d5e',
    },
    secondary: {
      main: '#e67e22',
      light: '#f39c12',
      dark: '#d35400',
    },
    success: {
      main: '#2ecc71',
      light: '#4cd964',
      dark: '#27ae60',
    },
    error: {
      main: '#e74c3c',
      light: '#ff6b6b',
      dark: '#c0392b',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <SocketProvider>
            <LanguageProvider>
              <Router basename="/">
                <ScrollToTop />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                  }}
                >
                  <Header />
                  <Box sx={{ flexGrow: 1 }}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/rooms/:id" element={<RoomDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/promotions" element={<Promotions />} />
                      <Route path="/contact" element={<Contact />} />
                      
                      {/* User Routes - Requires Authentication */}
                      <Route 
                        path="/booking/:roomId" 
                        element={
                          <ProtectedRoute>
                            <BookingForm />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/my-bookings" 
                        element={
                          <ProtectedRoute>
                            <MyBookings />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Staff Routes */}
                      <Route 
                        path="/staff/dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/rooms" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffRooms />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/bookings" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffBookings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/schedule" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffSchedule />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/guests" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffGuests />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/housekeeping" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffHousekeeping />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/promotions" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
                            <StaffPromotions />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Admin Routes - Only accessible for admins */}
                      <Route 
                        path="/admin/dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/rooms" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminRooms />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/bookings" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminBookings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminUsers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/housekeeping" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminHousekeeping />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/services" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminServices />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/promotions" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminPromotions />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/reports" 
                        element={
                          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminReports />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </Box>
                  <Footer />
                </Box>
                <ToastContainer position="bottom-right" autoClose={5000} />
              </Router>
            </LanguageProvider>
          </SocketProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
