import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Date range state
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  
  // Report data
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalGuests: 0,
    occupancyRate: 0,
    revenueByMonth: [],
    bookingsByRoomType: [],
    recentBookings: []
  });
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/reports');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd have APIs for these reports
        // For now we'll simulate with booking data
        const bookingsResponse = await bookingAPI.getAllBookings();
        const bookings = bookingsResponse.data;
        
        // Calculate summary metrics
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const totalGuests = bookings.reduce((sum, booking) => 
          sum + (booking.numberOfGuests?.adults || 0) + (booking.numberOfGuests?.children || 0), 0);
        
        // Simulate occupancy rate
        const occupancyRate = Math.min(85, Math.round((totalBookings / 30) * 100)); // Just a simulation
        
        setReportData({
          totalRevenue,
          totalBookings,
          totalGuests,
          occupancyRate,
          revenueByMonth: generateMockMonthlyData(),
          bookingsByRoomType: generateMockRoomTypeData(),
          recentBookings: bookings.slice(0, 5) // Just the 5 most recent bookings
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchReportData();
    }
  }, [isAuthenticated, user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Generate mock monthly data for the chart
  const generateMockMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 5000
    }));
  };
  
  // Generate mock room type data
  const generateMockRoomTypeData = () => {
    const roomTypes = ['single', 'double', 'twin', 'suite', 'family', 'deluxe'];
    return roomTypes.map(type => ({
      type,
      bookings: Math.floor(Math.random() * 30) + 10
    }));
  };
  
  // Handle date changes
  const handleDateChange = () => {
    // In a real app, this would trigger a new API call with the date range
    console.log('Date range changed:', {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    });
  };
  
  // Generate a summary card
  const SummaryCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box 
              sx={{ 
                bgcolor: `${color}.light`, 
                color: `${color}.main`,
                p: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
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
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Analytics & Reports
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filter Reports
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
              <Button variant="contained" onClick={handleDateChange}>
                Apply
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                value="all"
                label="Report Type"
              >
                <MenuItem value="all">All Reports</MenuItem>
                <MenuItem value="bookings">Booking Reports</MenuItem>
                <MenuItem value="revenue">Revenue Reports</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Revenue" 
            value={`$${reportData.totalRevenue.toLocaleString()}`} 
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Bookings" 
            value={reportData.totalBookings} 
            icon={<EventAvailableIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Guests" 
            value={reportData.totalGuests} 
            icon={<PeopleIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Occupancy Rate" 
            value={`${reportData.occupancyRate}%`} 
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Revenue" />
          <Tab label="Bookings" />
          <Tab label="Guests" />
        </Tabs>
        <Divider />
        
        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Overview Report
              </Typography>
              <Typography paragraph>
                This dashboard provides an overview of your hotel's performance. 
                Use the filters above to adjust the date range for more detailed analysis.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                In a production environment, this page would include interactive charts and detailed analytics
                for booking trends, revenue forecasts, and occupancy rates.
              </Alert>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Revenue Report
              </Typography>
              <Typography paragraph>
                Revenue analytics would be displayed here with charts showing monthly trends,
                revenue by room type, and other financial metrics.
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bookings Report
              </Typography>
              <Typography paragraph>
                Booking analytics would be displayed here with information about
                booking sources, cancellation rates, and popular booking periods.
              </Typography>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Guest Report
              </Typography>
              <Typography paragraph>
                Guest analytics would be displayed here with demographics, 
                returning guest rates, and guest satisfaction metrics.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Reports; 