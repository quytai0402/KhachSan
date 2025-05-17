import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Hotel as HotelIcon,
  EventNote as EventNoteIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { roomAPI, bookingAPI, userAPI } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Stats state
  const [stats, setStats] = useState({
    rooms: { total: 0, available: 0, booked: 0, maintenance: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, checkedIn: 0, cancelled: 0 },
    users: { total: 0, active: 0 },
    revenue: { today: 0, thisWeek: 0, thisMonth: 0 }
  });
  
  // Recent activity
  const [recentBookings, setRecentBookings] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/dashboard');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user || user.role !== 'admin') return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch rooms
        const roomsResponse = await roomAPI.getAllRooms();
        const rooms = roomsResponse.data;
        
        // Fetch bookings
        const bookingsResponse = await bookingAPI.getAllBookings();
        const bookings = bookingsResponse.data;
        
        // Fetch users
        const usersResponse = await userAPI.getAllUsers();
        const users = usersResponse.data;
        
        // Calculate stats
        const roomStats = {
          total: rooms.length,
          available: rooms.filter(room => room.status === 'available').length,
          booked: rooms.filter(room => room.status === 'booked').length,
          maintenance: rooms.filter(room => room.status === 'maintenance').length
        };
        
        const bookingStats = {
          total: bookings.length,
          pending: bookings.filter(booking => booking.status === 'pending').length,
          confirmed: bookings.filter(booking => booking.status === 'confirmed').length,
          checkedIn: bookings.filter(booking => booking.status === 'checked-in').length,
          cancelled: bookings.filter(booking => booking.status === 'cancelled').length
        };
        
        const userStats = {
          total: users.length,
          active: users.filter(user => user.isActive).length
        };
        
        // Mock revenue data for now
        const revenueStats = {
          today: 1250,
          thisWeek: 8750,
          thisMonth: 35000
        };
        
        // Update stats
        setStats({
          rooms: roomStats,
          bookings: bookingStats,
          users: userStats,
          revenue: revenueStats
        });
        
        // Get recent bookings (last 5)
        const sortedBookings = [...bookings].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentBookings(sortedBookings.slice(0, 5));
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, user]);
  
  // Redirect if not authorized
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Rooms */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Rooms"
            icon={<HotelIcon fontSize="large" sx={{ color: 'primary.main' }} />}
            primaryStat={stats.rooms.total}
            primaryLabel="Total Rooms"
            secondaryStats={[
              { label: 'Available', value: stats.rooms.available },
              { label: 'Booked', value: stats.rooms.booked },
              { label: 'Maintenance', value: stats.rooms.maintenance }
            ]}
            linkText="Manage Rooms"
            linkUrl="/admin/rooms"
          />
        </Grid>
        
        {/* Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Bookings"
            icon={<EventNoteIcon fontSize="large" sx={{ color: 'secondary.main' }} />}
            primaryStat={stats.bookings.total}
            primaryLabel="Total Bookings"
            secondaryStats={[
              { label: 'Pending', value: stats.bookings.pending },
              { label: 'Confirmed', value: stats.bookings.confirmed },
              { label: 'Checked In', value: stats.bookings.checkedIn }
            ]}
            linkText="Manage Bookings"
            linkUrl="/admin/bookings"
          />
        </Grid>
        
        {/* Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Users"
            icon={<PeopleIcon fontSize="large" sx={{ color: 'success.main' }} />}
            primaryStat={stats.users.total}
            primaryLabel="Total Users"
            secondaryStats={[
              { label: 'Active', value: stats.users.active },
              { label: 'Inactive', value: stats.users.total - stats.users.active }
            ]}
            linkText="Manage Users"
            linkUrl="/admin/users"
          />
        </Grid>
        
        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Revenue"
            icon={<MoneyIcon fontSize="large" sx={{ color: 'warning.main' }} />}
            primaryStat={`$${stats.revenue.thisMonth}`}
            primaryLabel="This Month"
            secondaryStats={[
              { label: 'Today', value: `$${stats.revenue.today}` },
              { label: 'This Week', value: `$${stats.revenue.thisWeek}` }
            ]}
            linkText="View Reports"
            linkUrl="/admin/reports"
          />
        </Grid>
      </Grid>
      
      {/* Recent Activity & Tasks */}
      <Grid container spacing={4}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <React.Fragment key={booking._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`Room ${booking.room.roomNumber} - ${booking.guestName || (booking.user && booking.user.name)}`}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                            </Typography>
                            {` — Status: ${booking.status}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentBookings.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No recent bookings to display.
                </Typography>
              )}
            </List>
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/admin/bookings')}
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Important Tasks (Placeholder) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Important Tasks
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Process pending bookings" 
                  secondary={`${stats.bookings.pending} bookings waiting for confirmation`}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Check-ins today" 
                  secondary="5 guests expected to check in"
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Check-outs today" 
                  secondary="3 rooms need cleaning"
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Maintenance required" 
                  secondary={`${stats.rooms.maintenance} rooms need maintenance`}
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small"
              >
                View All Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  icon, 
  primaryStat, 
  primaryLabel, 
  secondaryStats, 
  linkText, 
  linkUrl 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {icon}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
          {primaryStat}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {primaryLabel}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ mt: 1.5 }}>
          {secondaryStats.map((stat, index) => (
            <Typography key={index} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <span>{stat.label}:</span>
              <span style={{ fontWeight: 'bold' }}>{stat.value}</span>
            </Typography>
          ))}
        </Box>
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="text" 
          size="small"
          onClick={() => navigate(linkUrl)}
        >
          {linkText}
        </Button>
      </Box>
    </Card>
  );
};

export default Dashboard; 