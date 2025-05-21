import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  IconButton,
  Chip,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ViewList as ViewListIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  LocalHotel as LocalHotelIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  CleaningServices as CleaningServicesIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { StatsCard, QuickAccessCard, DashboardLayout } from '../../components/dashboard';
import dashboardService from '../../services/dashboardService';
import { useActivityTracker, ACTION_TYPES } from '../../utils/activityTracker';
import { withDashboardLayout } from '../../utils/layoutHelpers';

// Default empty data structure that will be populated from the API
const emptyStats = {
  rooms: { 
    total: 0, 
    available: 0, 
    booked: 0, 
    maintenance: 0 
  },
  bookings: { 
    total: 0, 
    pending: 0, 
    confirmed: 0, 
    checkedIn: 0, 
    cancelled: 0 
  },
  users: { 
    total: 0, 
    active: 0, 
    inactive: 0 
  },
  revenue: { 
    today: 0, 
    thisWeek: 0, 
    thisMonth: 0 
  },
  guestStatistics: {
    totalUniqueGuests: 0,
    frequentGuests: []
  }
};

// Chart component placeholder
const RevenueChart = ({ data }) => (
  <Box
    sx={{
      height: 220,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      p: 2,
      bgcolor: 'rgba(30, 78, 140, 0.04)',
      borderRadius: 2
    }}
  >
    {/* Monthly revenue representation */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">T1</Typography>
        <Typography variant="caption" color="text.secondary">T2</Typography>
        <Typography variant="caption" color="text.secondary">T3</Typography>
        <Typography variant="caption" color="text.secondary">T4</Typography>
        <Typography variant="caption" color="text.secondary">T5</Typography>
        <Typography variant="caption" color="text.secondary">T6</Typography>
        <Typography variant="caption" color="text.secondary">T7</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 1 }}>
        <Box sx={{ 
          height: '60%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '70%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '70%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '50%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '90%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '75%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '80%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '85%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '95%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '90%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
        <Box sx={{ 
          height: '100%', 
          width: '14%', 
          bgcolor: '#e3f2fd', 
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '95%',
            bgcolor: '#1e4e8c',
            borderRadius: '4px 4px 0 0',
          }
        }} />
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">Doanh thu tháng này: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data?.thisMonth || 0)}</Typography>
      <Chip 
        icon={<TrendingUpIcon fontSize="small" />} 
        label="Tăng 12%" 
        size="small" 
        color="success"
        variant="outlined"
        sx={{ height: 24 }}
      />
    </Box>
  </Box>
);

// Ongoing activities component
const OngoingActivities = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Không có hoạt động nào đang diễn ra
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Dữ liệu hoạt động sẽ xuất hiện ở đây khi có hoạt động mới
        </Typography>
      </Box>
    );
  }
  
  return (
    <List disablePadding>
      {activities.slice(0, 5).map((activity, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Divider />}
          <ListItem
            sx={{
              py: 1.5,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
            }}
            secondaryAction={
              <Chip
                label={activity.status || 'Đang xử lý'}
                size="small"
                sx={{
                  bgcolor: 
                    activity.status === 'completed' ? 'success.light' :
                    activity.status === 'pending' ? 'warning.light' :
                    'info.light',
                  color: 
                    activity.status === 'completed' ? 'success.dark' :
                    activity.status === 'pending' ? 'warning.dark' :
                    'info.dark',
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }}
              />
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: activity.color || '#1e4e8c' }}>
                {activity.icon || <EventIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.title || 'Hoạt động'}
              secondary={activity.description || 'Không có mô tả'}
              primaryTypographyProps={{ fontWeight: 500, variant: 'body2', mt: 0.3 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { systemAlerts: _ } = useSocket(); // Renamed to _ to avoid unused warning
  const { trackAction } = useActivityTracker();
  const theme = useTheme();

  // Helper function to determine icon based on activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'booking':
        return <PersonAddIcon />;
      case 'payment':
        return <CheckCircleIcon />;
      case 'cancellation':
        return <CancelIcon />;
      case 'checkin':
        return <LocalHotelIcon />;
      case 'service':
        return <EventIcon />;
      default:
        return <EventIcon />;
    }
  };
  
  // Helper function to determine color based on activity type
  const getActivityColor = (type) => {
    switch(type) {
      case 'booking':
        return '#1e4e8c';
      case 'payment':
        return '#2e7d32';
      case 'cancellation':
        return '#d32f2f';
      case 'checkin':
        return '#ed6c02';
      case 'service':
        return '#9c27b0';
      default:
        return '#1e4e8c';
    }
  };
  
  // Empty array for staff tasks instead of sample data
  const staffTasks = [
    {
      id: 'act1',
      title: 'Dọn phòng 205',
      description: 'Đang thực hiện bởi nhân viên Minh',
      timestamp: '10 phút trước',
      status: 'processing',
      icon: <CleaningServicesIcon />,
      color: '#1976d2'
    },
    {
      id: 'act2',
      title: 'Bảo trì điều hòa phòng 301',
      description: 'Đang thực hiện bởi kỹ thuật viên Hiếu',
      timestamp: '30 phút trước',
      status: 'processing',
      icon: <SettingsIcon />,
      color: '#ed6c02'
    },
    {
      id: 'act3',
      title: 'Đặt phòng mới #B-1234',
      description: 'Chờ xác nhận từ quản lý',
      timestamp: '1 giờ trước',
      status: 'pending',
      icon: <EventIcon />,
      color: '#9c27b0'
    },
    {
      id: 'act4',
      title: 'Cập nhật giá phòng',
      description: 'Đã hoàn thành 80%',
      timestamp: '2 giờ trước',
      status: 'processing',
      icon: <TrendingUpIcon />,
      color: '#2e7d32'
    }
  ];
  
  // Stats state
  const [stats, setStats] = useState(emptyStats);
  
  // Recent activity
  const [recentBookings, setRecentBookings] = useState([]);
  const [ongoingActivities, setOngoingActivities] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add dashboardLoaded ref near the beginning of the component
  const dashboardLoaded = useRef(false);

  // Quick access menu items
  const quickAccessItems = [
    {
      title: 'Quản Lý Phòng',
      description: 'Xem và quản lý các phòng',
      icon: <LocalHotelIcon />,
      path: '/admin/rooms',
      color: '#1e4e8c',
      count: stats.rooms.total
    },
    {
      title: 'Quản Lý Đặt Phòng',
      description: 'Xem và quản lý đặt phòng',
      icon: <EventIcon />,
      path: '/admin/bookings',
      color: '#2e7d32',
      count: stats.bookings.pending,
      badge: 'Mới'
    },
    {
      title: 'Báo Cáo',
      description: 'Xem báo cáo doanh thu và hoạt động',
      icon: <ViewListIcon />,
      path: '/admin/reports',
      color: '#ed6c02'
    },
    {
      title: 'Cài Đặt Hệ Thống',
      description: 'Quản lý cài đặt hệ thống',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      color: '#9c27b0'
    },
  ];
  
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
        // Get data through dashboard service 
        const dashboardData = await dashboardService.getStats('admin');
        
        // Also fetch recent activities for more complete data
        const recentActivitiesData = await dashboardService.getRecentActivities('admin');
        
        // Use only real data from API, with fallback to zeros if data is missing
        
        // Create processed stats object with explicit number conversion
        const processedStats = {
          rooms: {
            total: Number(dashboardData?.rooms?.total || 0),
            available: Number(dashboardData?.rooms?.available || 0),
            booked: Number(dashboardData?.rooms?.booked || 0),
            maintenance: Number(dashboardData?.rooms?.maintenance || 0)
          },
          bookings: {
            total: Number(dashboardData?.bookings?.total || 0),
            pending: Number(dashboardData?.bookings?.pending || 0),
            confirmed: Number(dashboardData?.bookings?.confirmed || 0),
            checkedIn: Number(dashboardData?.bookings?.checkedIn || 0),
            cancelled: Number(dashboardData?.bookings?.cancelled || 0)
          },
          users: {
            total: Number(dashboardData?.users?.total || 0),
            active: Number(dashboardData?.users?.active || 0),
            inactive: Number(dashboardData?.users?.inactive || 0)
          },
          revenue: {
            today: Number(dashboardData?.revenue?.today || 0),
            thisWeek: Number(dashboardData?.revenue?.thisWeek || 0),
            thisMonth: Number(dashboardData?.revenue?.thisMonth || 0)
          },
          guestStatistics: {
            totalUniqueGuests: Number(dashboardData?.guestStatistics?.totalUniqueGuests || 0),
            frequentGuests: dashboardData?.guestStatistics?.frequentGuests || []
          }
        };
        
        // Update state with the data
        setStats(processedStats);
        
        // Always use real data from API for bookings
        if (dashboardData && dashboardData.bookingsData) {
          setRecentBookings(dashboardData.bookingsData || []);
        }
        
        // Use real activities data from dedicated activities API if available
        if (recentActivitiesData && recentActivitiesData.length > 0) {
          setOngoingActivities(recentActivitiesData);
        }
        // Otherwise use dashboard activities data 
        else if (dashboardData && dashboardData.activities) {
          setOngoingActivities(dashboardData.activities || []);
        }
        // If still no data, use empty array
        else {
          setOngoingActivities([]);
        }
        
        // If no booking data is returned, initialize with empty array
        if (!dashboardData || !dashboardData.bookingsData) {
          setRecentBookings([]);
        }
        
        // Track activity (with rate limiting) - only when component first mounts
        if (!dashboardLoaded.current) {
          trackAction(ACTION_TYPES.SYSTEM_SETTINGS_UPDATED, {
            entityType: 'dashboard',
            view: 'admin-dashboard'
          }, { uniqueKey: 'dashboard-view' });
          
          dashboardLoaded.current = true;
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // On error, use empty data structures instead of sample data
        setStats(emptyStats);
        setRecentBookings([]);
        setOngoingActivities([]);
        setError('Không thể kết nối với API. Vui lòng kiểm tra kết nối của bạn hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up a refresh interval (but much less frequent - every 2 minutes)
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 120000);
    
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, trackAction]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Fetch latest data
    const fetchDashboardData = async () => {
      try {
        // Get data from both APIs
        const dashboardData = await dashboardService.getStats('admin');
        const recentActivitiesData = await dashboardService.getRecentActivities('admin');
        
        if (dashboardData) {
          // Process data similar to above
          const processedStats = {
            rooms: {
              total: Number(dashboardData.rooms?.total || 0) || stats.rooms.total,
              available: Number(dashboardData.rooms?.available || 0) || stats.rooms.available,
              booked: Number(dashboardData.rooms?.booked || 0) || stats.rooms.booked,
              maintenance: Number(dashboardData.rooms?.maintenance || 0) || stats.rooms.maintenance
            },
            bookings: {
              total: Number(dashboardData.bookings?.total || 0) || stats.bookings.total,
              pending: Number(dashboardData.bookings?.pending || 0) || stats.bookings.pending,
              confirmed: Number(dashboardData.bookings?.confirmed || 0) || stats.bookings.confirmed,
              checkedIn: Number(dashboardData.bookings?.checkedIn || 0) || stats.bookings.checkedIn,
              cancelled: Number(dashboardData.bookings?.cancelled || 0) || stats.bookings.cancelled
            },
            users: {
              total: Number(dashboardData.users?.total || 0) || stats.users.total,
              active: Number(dashboardData.users?.active || 0) || stats.users.active,
              inactive: Number(dashboardData.users?.inactive || 0) || stats.users.inactive
            },
            revenue: {
              today: Number(dashboardData.revenue?.today || 0) || stats.revenue.today,
              thisWeek: Number(dashboardData.revenue?.thisWeek || 0) || stats.revenue.thisWeek,
              thisMonth: Number(dashboardData.revenue?.thisMonth || 0) || stats.revenue.thisMonth
            },
            guestStatistics: {
              totalUniqueGuests: Number(dashboardData.guestStatistics?.totalUniqueGuests || 0) || stats.guestStatistics.totalUniqueGuests,
              frequentGuests: dashboardData.guestStatistics?.frequentGuests || stats.guestStatistics.frequentGuests
            }
          };
        
          setStats(processedStats);
          
          // Always use the data from API, even if empty
          setRecentBookings(dashboardData.bookingsData || []);
          
          // Use activities data from dedicated API if available, otherwise use dashboard activities
          if (recentActivitiesData && recentActivitiesData.length > 0) {
            setOngoingActivities(recentActivitiesData);
          } else {
            setOngoingActivities(dashboardData.activities || []);
          }
        }
      } catch (err) {
        console.error('Error refreshing dashboard data:', err);
      } finally {
        setRefreshing(false);
      }
    };
    
    fetchDashboardData();
  };

  // Redirect if not authorized
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }
  
  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state  
  if (error) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, pb: 3 }}>
        {/* Header with welcome and refresh button */}
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 3
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 1, 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                background: 'linear-gradient(45deg, #1e4e8c 30%, #3a8eff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Xin chào, {user?.name || 'Admin'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Tổng quan quản trị khách sạn ngày {new Date().toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: 'background.paper', 
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <RefreshIcon 
                  sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Phòng"
              mainStat={stats.rooms.total}
              icon="hotel"
              color="#1e4e8c"
              subStats={[
                { label: 'Trống', value: stats.rooms.available },
                { label: 'Đã đặt', value: stats.rooms.booked },
                { label: 'Bảo trì', value: stats.rooms.maintenance }
              ]}
              trend={5}
              description="Số lượng và trạng thái phòng"
              linkText="Xem chi tiết"
              linkUrl="/admin/rooms"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Đặt Phòng"
              mainStat={stats.bookings.total}
              icon="event_note"
              color="#2e7d32"
              subStats={[
                { label: 'Chờ xác nhận', value: stats.bookings.pending },
                { label: 'Đã check-in', value: stats.bookings.checkedIn },
                { label: 'Đã hủy', value: stats.bookings.cancelled }
              ]}
              trend={-2}
              description="Tổng số đặt phòng và trạng thái"
              linkText="Xem chi tiết"
              linkUrl="/admin/bookings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Người Dùng"
              mainStat={stats.users.total}
              icon="people"
              color="#9c27b0"
              subStats={[
                { label: 'Hoạt động', value: stats.users.active },
                { label: 'Không hoạt động', value: stats.users.inactive || (stats.users.total - stats.users.active) }
              ]}
              trend={8}
              description="Tài khoản người dùng trong hệ thống"
              linkText="Quản lý người dùng"
              linkUrl="/admin/users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Doanh Thu"
              mainStat={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue.thisMonth)}
              icon="payments"
              color="#ed6c02"
              subStats={[
                { 
                  label: 'Hôm nay', 
                  value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue.today)
                },
                { 
                  label: 'Tuần này', 
                  value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue.thisWeek)
                }
              ]}
              trend={12}
              description="Doanh thu tháng này"
              linkText="Xem báo cáo"
              linkUrl="/admin/reports"
            />
          </Grid>
        </Grid>

        {/* Guest Statistics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)' 
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Khách Vãng Lai
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thống kê khách đặt phòng không cần tài khoản
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Tổng số khách vãng lai: {stats.guestStatistics?.totalUniqueGuests || 0}
                </Typography>
              </Box>
              
              {stats.guestStatistics?.frequentGuests && stats.guestStatistics.frequentGuests.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight={500} mb={1}>
                    Khách thường xuyên đặt phòng:
                  </Typography>
                  <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {stats.guestStatistics.frequentGuests.map((guest, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <Chip 
                            label={`${guest.count} lần đặt`} 
                            size="small"
                            color="primary"
                          />
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#1e4e8c' }}>
                            {guest.name?.charAt(0) || "K"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={guest.name || "Khách"}
                          secondary={guest.phone}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Chưa có dữ liệu khách vãng lai.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Revenue chart and Quick access */}
        <Grid container spacing={3} mb={4}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)' 
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Biểu Đồ Doanh Thu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doanh thu trong 7 ngày qua
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small">
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CalendarTodayIcon fontSize="small" />} 
                  label="7 ngày qua" 
                  variant="outlined" 
                  color="primary" 
                />
                <Chip 
                  icon={<ViewListIcon fontSize="small" />} 
                  label="Theo tháng" 
                  variant="outlined" 
                />
              </Box>
              <RevenueChart data={stats.revenue} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, textAlign: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tổng Doanh Thu</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue.thisMonth)}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Tăng Trưởng</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="h6" fontWeight={600} color="success.main">12%</Typography>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">So Với Tháng Trước</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="h6" fontWeight={600} color="success.main">8%</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Ongoing Activities */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
              elevation={0}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: '#1e4e8c',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Hoạt Động Hiện Tại
                </Typography>
                <Chip 
                  label={ongoingActivities.length || 0} 
                  size="small" 
                  sx={{ bgcolor: 'white', color: '#1e4e8c', fontWeight: 'bold' }} 
                />
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <OngoingActivities activities={ongoingActivities} />
              </Box>
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                  onClick={() => navigate('/admin/reports')}
                >
                  Xem tất cả hoạt động
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Quick access and Recent Activity */}
        <Grid container spacing={3}>
          {/* Quick Access */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
              elevation={0}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Truy Cập Nhanh
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Các chức năng thường dùng trong hệ thống
              </Typography>
              <Grid container spacing={2} mt={1}>
                {quickAccessItems.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <QuickAccessCard
                      title={item.title}
                      description={item.description}
                      icon={item.icon}
                      path={item.path}
                      color={item.color}
                      count={item.count}
                      badge={item.badge}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
              elevation={0}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" fontWeight={600}>
                  Hoạt Động Gần Đây
                </Typography>
                <Tooltip title="Xem tất cả">
                  <IconButton size="small" onClick={() => navigate('/admin/reports')}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <List sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 430, py: 0 }}>
                {recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <React.Fragment key={booking._id || index}>
                      <ListItem alignItems="flex-start" sx={{
                        py: 1.5,
                        px: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                      }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: booking.color || 'primary.main' }}>
                            {booking.icon || <EventIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={booking.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block', fontSize: '0.8rem' }}
                              >
                                {booking.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.timestamp}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < recentBookings.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có hoạt động đặt phòng nào gần đây
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Dữ liệu đặt phòng sẽ xuất hiện ở đây khi có đơn đặt phòng mới
                    </Typography>
                  </Box>
                )}
              </List>
              
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                  onClick={() => navigate('/admin/bookings')}
                >
                  Xem tất cả đặt phòng
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default withDashboardLayout(AdminDashboard, "Tổng Quan");