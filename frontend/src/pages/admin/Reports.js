import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { adminAPI } from '../../services/api';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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
      if (!isAuthenticated || !user || user.role !== 'admin') return;
      
      setLoading(true);
      
      try {
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        
        // Get report data using adminAPI
        const response = await adminAPI.getReports(formattedStartDate, formattedEndDate);
        
        // Set the report data with safe defaults
        const responseData = response.data || {};
        setReportData({
          totalRevenue: responseData.totalRevenue || 0,
          totalBookings: responseData.totalBookings || 0,
          totalGuests: responseData.totalGuests || 0,
          occupancyRate: responseData.occupancyRate || 0,
          revenueByMonth: Array.isArray(responseData.revenueByMonth) ? responseData.revenueByMonth : [],
          bookingsByRoomType: Array.isArray(responseData.bookingsByRoomType) ? responseData.bookingsByRoomType : [],
          recentBookings: Array.isArray(responseData.recentBookings) ? responseData.recentBookings : []
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Không thể tải báo cáo. Vui lòng thử lại sau.');
        // Reset to default values on error
        setReportData({
          totalRevenue: 0,
          totalBookings: 0,
          totalGuests: 0,
          occupancyRate: 0,
          revenueByMonth: [],
          bookingsByRoomType: [],
          recentBookings: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchReportData();
    }
  }, [isAuthenticated, user, startDate, endDate]);
  
  // Process real revenue data by month
  const processRevenueByMonth = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const revenueByMonth = Array(12).fill(0);
    
    bookings.forEach(booking => {
      if (booking.status !== 'cancelled' && booking.createdAt) {
        const bookingDate = new Date(booking.createdAt);
        const monthIndex = bookingDate.getMonth();
        revenueByMonth[monthIndex] += (booking.totalPrice || 0);
      }
    });
    
    return months.map((month, index) => ({
      month,
      revenue: revenueByMonth[index]
    }));
  };
  
  // Process real bookings by room type
  const processBookingsByRoomType = (bookings, rooms) => {
    // Create a map of room IDs to room types
    const roomTypesMap = {};
    rooms.forEach(room => {
      roomTypesMap[room._id] = room.type?.name || 'Unknown';
    });
    
    // Count bookings by room type
    const bookingCounts = {};
    
    bookings.forEach(booking => {
      if (booking.room) {
        const roomType = roomTypesMap[booking.room] || 'Unknown';
        bookingCounts[roomType] = (bookingCounts[roomType] || 0) + 1;
      }
    });
    
    // Convert to array format needed for chart
    return Object.keys(bookingCounts).map(type => ({
      type,
      bookings: bookingCounts[type]
    }));
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Phân Tích & Báo Cáo
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
              Lọc Báo Cáo
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày Bắt Đầu"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                />
                <DatePicker
                  label="Ngày Kết Thúc"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
              <Button variant="contained" onClick={handleDateChange}>
                Áp Dụng
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại Báo Cáo</InputLabel>
              <Select
                value="all"
                label="Loại Báo Cáo"
              >
                <MenuItem value="all">Tất Cả Báo Cáo</MenuItem>
                <MenuItem value="bookings">Báo Cáo Đặt Phòng</MenuItem>
                <MenuItem value="revenue">Báo Cáo Doanh Thu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Tổng Doanh Thu" 
            value={`${(reportData?.totalRevenue || 0).toLocaleString()} VNĐ`} 
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Tổng Đặt Phòng" 
            value={reportData?.totalBookings || 0} 
            icon={<EventAvailableIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Tổng Khách" 
            value={reportData?.totalGuests || 0} 
            icon={<PeopleIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Tỷ Lệ Lấp Đầy" 
            value={`${(reportData?.occupancyRate || 0)}%`} 
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
          <Tab label="Tổng Quan" />
          <Tab label="Doanh Thu" />
          <Tab label="Đặt Phòng" />
          <Tab label="Khách Hàng" />
        </Tabs>
        <Divider />
        
        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Báo Cáo Tổng Quan
              </Typography>
              <Typography paragraph>
                Bảng điều khiển này cung cấp tổng quan về hiệu suất khách sạn của bạn. 
                Sử dụng bộ lọc ở trên để điều chỉnh phạm vi ngày để phân tích chi tiết hơn.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Trong môi trường sản xuất, trang này sẽ bao gồm các biểu đồ tương tác và phân tích chi tiết
                về xu hướng đặt phòng, dự báo doanh thu và tỷ lệ lấp đầy.
              </Alert>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Báo Cáo Doanh Thu
              </Typography>
              <Typography paragraph>
                Phân tích doanh thu sẽ được hiển thị ở đây với các biểu đồ thể hiện xu hướng hàng tháng,
                doanh thu theo loại phòng, và các chỉ số tài chính khác.
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Báo Cáo Đặt Phòng
              </Typography>
              <Typography paragraph>
                Phân tích đặt phòng sẽ được hiển thị ở đây với thông tin về
                nguồn đặt phòng, tỷ lệ hủy và thời gian đặt phòng phổ biến.
              </Typography>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Báo Cáo Khách Hàng
              </Typography>
              <Typography paragraph>
                Phân tích khách hàng sẽ được hiển thị ở đây với thông tin nhân khẩu học, 
                tỷ lệ khách hàng quay lại và các chỉ số hài lòng của khách hàng.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default withDashboardLayout(Reports, "Báo Cáo Khách Sạn"); 