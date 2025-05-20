import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Badge, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Typography, 
  Box, 
  Tabs, 
  Tab
} from '@mui/material';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';

/**
 * Notification system component that shows real-time updates across roles
 * Used in Header component to be accessible from all pages
 */
const SystemNotification = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const { isAdmin, isStaff } = useAuth();
  
  const { 
    notifications, 
    clearNotifications,
    systemAlerts,
    staffActivity,
    adminActivity,
    bookingUpdates
  } = useSocket();

  // Handle new notifications and update unread count
  useEffect(() => {
    // Set unread count based on all notifications
    setUnreadCount(notifications.length + systemAlerts.length);
    
    // Show latest system alert as a snackbar
    if (systemAlerts.length > 0 && systemAlerts[0] !== latestAlert) {
      setLatestAlert(systemAlerts[0]);
      setShowAlert(true);
    }
  }, [notifications, systemAlerts, latestAlert]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
    if (!drawerOpen) {
      // Reset unread count when opening drawer
      setUnreadCount(0);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return format(date, 'MMM dd, HH:mm');
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleDrawerToggle}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Thông báo</Typography>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="Tất cả" />
            {isAdmin && <Tab label="Hoạt động nhân viên" />}
            {isStaff && <Tab label="Cập nhật từ quản trị" />}
            <Tab label="Đặt phòng" />
          </Tabs>

          {activeTab === 0 && (
            <List>
              {systemAlerts.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="primary" sx={{ mt: 1, mb: 1 }}>
                    Thông báo hệ thống
                  </Typography>
                  {systemAlerts.map((alert, index) => (
                    <ListItem key={`alert-${index}`} divider>
                      <ListItemIcon>
                        <Alert severity={alert.severity || "info"} sx={{ minWidth: 0, p: 0 }}></Alert>
                      </ListItemIcon>
                      <ListItemText 
                        primary={alert.message} 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="caption">{formatTime(alert.timestamp)}</Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 1 }} />
                </>
              )}

              {notifications.map((notification, index) => (
                <ListItem key={`notification-${index}`} divider>
                  <ListItemText 
                    primary={notification.title || notification.message} 
                    secondary={
                      <>
                        {notification.title && <Typography variant="body2">{notification.message}</Typography>}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">{formatTime(notification.timestamp)}</Typography>
                        </Box>
                      </>
                    } 
                  />
                </ListItem>
              ))}

              {notifications.length === 0 && systemAlerts.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                  Không có thông báo nào
                </Typography>
              )}
            </List>
          )}

          {activeTab === 1 && isAdmin && (
            <List>
              {staffActivity.map((activity, index) => (
                <ListItem key={`staff-${index}`} divider>
                  <ListItemText 
                    primary={`${activity.userName}: ${activity.action}`}
                    secondary={
                      <>
                        {activity.data && <Typography variant="body2">{JSON.stringify(activity.data)}</Typography>}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">{formatTime(activity.timestamp)}</Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {staffActivity.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                  Không có hoạt động nhân viên nào để hiển thị
                </Typography>
              )}
            </List>
          )}

          {activeTab === (isAdmin ? 2 : 1) && isStaff && (
            <List>
              {adminActivity.map((activity, index) => (
                <ListItem key={`admin-${index}`} divider>
                  <ListItemText 
                    primary={`Admin ${activity.userName}: ${activity.action}`}
                    secondary={
                      <>
                        {activity.data && <Typography variant="body2">{JSON.stringify(activity.data)}</Typography>}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">{formatTime(activity.timestamp)}</Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {adminActivity.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                  Không có cập nhật từ quản trị viên
                </Typography>
              )}
            </List>
          )}

          {activeTab === (isAdmin ? 3 : isStaff ? 2 : 1) && (
            <List>
              {bookingUpdates.map((update, index) => (
                <ListItem key={`booking-${index}`} divider>
                  <ListItemText 
                    primary={`Đặt phòng ${update.type === 'updated' ? 'cập nhật' : 
                                          update.type === 'created' ? 'mới' : 
                                          update.type === 'canceled' ? 'đã hủy' : 
                                          update.type}: Phòng ${update.booking.room?.roomNumber || 'N/A'}`}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Khách: {update.booking.guestName || update.booking.user?.name || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">{formatTime(update.timestamp)}</Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {bookingUpdates.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                  Không có cập nhật đặt phòng nào
                </Typography>
              )}
            </List>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={latestAlert?.severity || "info"} sx={{ width: '100%' }}>
          {latestAlert?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SystemNotification; 