import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Badge,
  IconButton
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  NotificationsOutlined as NotificationIcon,
  Refresh as RefreshIcon,
  DashboardCustomize as DashboardIcon,
  EscalatorWarning as GuestIcon,
  CleaningServices as CleaningIcon,
  RoomService as RoomServiceIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { StatsCard, QuickAccessCard, DashboardLayout } from '../../components/dashboard';
import dashboardService from '../../services/dashboardService';
import taskService from '../../services/taskService';
import { useActivityTracker, ACTION_TYPES } from '../../utils/activityTracker';
import ActivityLog from '../../components/ActivityLog';
import { withDashboardLayout } from '../../utils/layoutHelpers';

// Empty data structure for staff dashboard
const emptyDashboardData = {
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
    active: 0 
  },
  revenue: { 
    today: 0, 
    thisWeek: 0, 
    thisMonth: 0 
  },
  totalRooms: 0,
  availableRooms: 0,
  todayBookings: 0,
  activeGuests: 0,
  todayCheckins: 0,
  todayCheckouts: 0,
  tasks: { 
    total: 0, 
    rooms: 0, 
    services: 0 
  }
};

// Helper function to format booking activities
const formatBookingActivity = (booking) => {
  return {
    _id: booking._id,
    type: 'booking',
    roomNumber: booking.room?.roomNumber || 'N/A',
    guestName: booking.guestName || (booking.user && booking.user.name) || 'N/A',
    status: booking.status,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    createdAt: booking.createdAt
  };
};

// Empty array for staff tasks
const emptyTasks = [];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { systemAlerts } = useSocket();
  const { trackAction } = useActivityTracker();
  const dashboardLoaded = useRef(false);
  
  // Stats state
  const [stats, setStats] = useState({
    rooms: { total: 0, available: 0, booked: 0, maintenance: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, checkedIn: 0, cancelled: 0 },
    users: { total: 0, active: 0 },
    revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
    totalRooms: 0,
    availableRooms: 0,
    todayBookings: 0,
    activeGuests: 0,
    tasks: { total: 0, rooms: 0, services: 0 }
  });
  
  // Recent activity
  const [recentBookings, setRecentBookings] = useState([]);
  
  // Tasks state
  const [tasks, setTasks] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick access menu items
  const quickAccessItems = [
    {
      title: 'Quản Lý Phòng',
      description: 'Xem và cập nhật trạng thái phòng',
      icon: 'hotel',
      path: '/staff/rooms',
      color: '#1e4e8c',
      badge: 'Mới',
    },
    {
      title: 'Đặt Phòng',
      description: 'Xử lý check-in, check-out',
      icon: 'event_note',
      path: '/staff/bookings',
      color: '#2e7d32',
      count: stats.bookings?.pending || 0
    },
    {
      title: 'Lịch Trình',
      description: 'Xem lịch làm việc',
      icon: 'calendar_today',
      path: '/staff/schedule',
      color: '#e67e22'
    },
    {
      title: 'Khách Hàng',
      description: 'Quản lý thông tin khách hàng',
      icon: 'people',
      path: '/staff/guests',
      color: '#9c27b0'
    },
  ];

  // Check if user is authenticated and is staff
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/staff/dashboard');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'staff' && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user || (user.role !== 'staff' && user.role !== 'admin')) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get data through dashboard service
        const dashboardData = await dashboardService.getStats('staff');
        
        // Get tasks data
        const taskStats = await taskService.getTaskStats();
        const tasksList = await taskService.getTasks({ status: 'pending,in-progress' });
        
        if (!dashboardData) {
          setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
          return;
        }
        
        // Always use real data, but provide fallbacks when fields are missing
        const combinedStats = {
          ...dashboardData,
          tasks: {
            total: taskStats ? taskStats.total : (dashboardData.tasks?.total || 0),
            rooms: taskStats ? taskStats.cleaning : (dashboardData.tasks?.rooms || 0),
            services: taskStats ? taskStats.service : (dashboardData.tasks?.services || 0)
          }
        };

        // Update state with the data
        setStats({
          ...combinedStats,
          rooms: combinedStats.rooms || {
            total: combinedStats.totalRooms || 0,
            available: combinedStats.availableRooms || 0,
            booked: (combinedStats.totalRooms || 0) - (combinedStats.availableRooms || 0),
            maintenance: 0
          },
          bookings: combinedStats.bookings || {
            total: combinedStats.bookings?.total || combinedStats.todayBookings || 0,
            pending: combinedStats.bookings?.pending || 0,
            confirmed: combinedStats.bookings?.confirmed || 0,
            checkedIn: combinedStats.bookings?.checkedIn || combinedStats.activeGuests || 0
          },
          tasks: combinedStats.tasks
        });
        
        setRecentBookings(combinedStats.bookingsData && combinedStats.bookingsData.length > 0 ? 
          combinedStats.bookingsData : []);
        
        // Format tasks data for display
        const formattedTasks = tasksList && tasksList.length > 0 ? 
          tasksList.slice(0, 3).map(task => ({
            id: task._id,
            title: `${task.taskType === 'cleaning' ? 'Dọn phòng' : 
                    task.taskType === 'maintenance' ? 'Bảo trì' : 'Dịch vụ'} phòng ${task.roomNumber}`,
            priority: task.priority,
            type: task.taskType,
            eta: new Date(task.estimatedTime || Date.now()).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
          })) : 
          emptyTasks;
        
        setTasks(formattedTasks);
        
        // Track activity (with rate limiting) - only when component first mounts
        if (!dashboardLoaded.current) {
          trackAction(ACTION_TYPES.STAFF_SCHEDULE_UPDATED, {
            entityType: 'dashboard',
            view: 'staff-dashboard'
          }, { uniqueKey: 'dashboard-view' });
          
          dashboardLoaded.current = true;
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchDashboardData();
    
    // Set up a refresh interval (every 2 minutes)
    const intervalId = setInterval(fetchDashboardData, 120000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, user, trackAction]);

  // Function to manually refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch both dashboard stats and tasks data
      const dashboardData = await dashboardService.getStats('staff');
      const taskStats = await taskService.getTaskStats();
      const tasksList = await taskService.getTasks({ status: 'pending,in-progress' });
      
      if (dashboardData) {
        // Combine data before updating state
        const combinedStats = {
          ...dashboardData,
          tasks: {
            total: taskStats ? taskStats.total : (dashboardData.tasks?.total || 0),
            rooms: taskStats ? taskStats.cleaning : (dashboardData.tasks?.rooms || 0),
            services: taskStats ? taskStats.service : (dashboardData.tasks?.services || 0)
          }
        };
        
        setStats({
          ...combinedStats,
          rooms: combinedStats.rooms || {
            total: combinedStats.totalRooms || 0,
            available: combinedStats.availableRooms || 0,
            booked: (combinedStats.totalRooms || 0) - (combinedStats.availableRooms || 0),
            maintenance: 0
          },
          bookings: combinedStats.bookings || {
            total: combinedStats.bookings?.total || combinedStats.todayBookings || 0,
            pending: combinedStats.bookings?.pending || 0,
            confirmed: combinedStats.bookings?.confirmed || 0,
            checkedIn: combinedStats.bookings?.checkedIn || combinedStats.activeGuests || 0
          },
          tasks: combinedStats.tasks
        });
        
        setRecentBookings(combinedStats.bookingsData && combinedStats.bookingsData.length > 0 ? 
          combinedStats.bookingsData : []);
          
        // Format tasks data for display
        // Format tasks data for display
        const formattedTasks = tasksList && tasksList.length > 0 ? 
          tasksList.slice(0, 3).map(task => ({
            id: task._id,
            title: `${task.taskType === 'cleaning' ? 'Dọn phòng' : 
                    task.taskType === 'maintenance' ? 'Bảo trì' : 'Dịch vụ'} phòng ${task.roomNumber}`,
            priority: task.priority,
            type: task.taskType,
            eta: new Date(task.estimatedTime || Date.now()).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
          })) : 
          emptyTasks;
        
        setTasks(formattedTasks);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Redirect if not authorized
  if (!isAuthenticated || (user && user.role !== 'staff' && user.role !== 'admin')) {
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
        {/* Welcome section with refresh button */}
        <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Xin chào, {user?.name || 'Staff'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} — Đây là tổng quan thông tin hôm nay.
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh} 
            variant="outlined" 
            color="primary" 
            disabled={isRefreshing}
            sx={{ height: 40, borderRadius: '10px' }}
          >
            {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
          </Button>
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
                { label: 'Bảo trì', value: stats.rooms.maintenance || 0 }
              ]}
              linkText="Xem tất cả phòng"
              linkUrl="/staff/rooms"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Đặt Phòng"
              mainStat={stats.bookings.total}
              icon="event_note"
              color="#e67e22"
              subStats={[
                { label: 'Chờ xác nhận', value: stats.bookings.pending },
                { label: 'Đã check-in', value: stats.bookings.checkedIn },
                { label: 'Hôm nay', value: stats.todayBookings || 0 }
              ]}
              linkText="Xem đặt phòng"
              linkUrl="/staff/bookings"
              trend={5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Khách Đang Lưu Trú"
              mainStat={stats.activeGuests || stats.bookings.checkedIn || 0}
              icon="people"
              color="#9c27b0"
              subStats={[
                { label: 'Check-in hôm nay', value: stats.todayCheckins || 5 },
                { label: 'Check-out hôm nay', value: stats.todayCheckouts || 3 }
              ]}
              linkText="Xem khách hàng"
              linkUrl="/staff/guests"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Công Việc"
              mainStat={stats.tasks?.total || 17}
              icon="assignment"
              color="#2e7d32"
              trend={-8}
              subStats={[
                { label: 'Dịch vụ phòng', value: stats.tasks?.services || 9 },
                { label: 'Vệ sinh', value: stats.tasks?.rooms || 8 }
              ]}
              linkText="Xem tất cả"
              linkUrl="/staff/schedule"
            />
          </Grid>
        </Grid>
        
        {/* Today's tasks */}
        <Box mb={4}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
            Nhiệm Vụ Hôm Nay
          </Typography>
          <Grid container spacing={2}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card 
                  sx={{ 
                    borderLeft: task.priority === 'high' ? '4px solid #f44336' : 
                             task.priority === 'medium' ? '4px solid #ff9800' : 
                             '4px solid #4caf50',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {task.title}
                      </Typography>
                      <Avatar
                        sx={{ 
                          bgcolor: 
                            task.type === 'cleaning' ? '#1e4e8c' : 
                            task.type === 'service' ? '#e67e22' : 
                            '#9c27b0',
                          width: 36,
                          height: 36
                        }}
                      >
                        {task.type === 'cleaning' && <CleaningIcon />}
                        {task.type === 'service' && <RoomServiceIcon />}
                        {task.type === 'maintenance' && <DashboardIcon />}
                      </Avatar>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {task.eta}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button variant="contained" size="small" 
                        sx={{ 
                          bgcolor: task.type === 'cleaning' ? '#1e4e8c' : 
                                   task.type === 'service' ? '#e67e22' : 
                                   '#9c27b0',
                          '&:hover': {
                            bgcolor: task.type === 'cleaning' ? '#173d70' : 
                                     task.type === 'service' ? '#d35400' : 
                                     '#7b1fa2'
                          }
                        }}
                      >
                        Hoàn Thành
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick access and Recent Activity */}
        <Grid container spacing={3}>
          {/* Quick Access */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Truy Cập Nhanh
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
                      badge={item.badge}
                      count={item.count}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <ActivityLog title="Hoạt Động Gần Đây" activities={recentBookings} />
          </Grid>
        </Grid>
      </Box>
  );
};

export default withDashboardLayout(StaffDashboard, "Dashboard");