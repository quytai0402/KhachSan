import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Badge, Box, Button, Drawer, IconButton, List, ListItem, ListItemText, Snackbar, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { formatDistanceToNow } from 'date-fns';

const NotificationComponent = () => {
  const { notifications, removeNotification, clearNotifications } = useSocket();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [badgeContent, setBadgeContent] = useState(0);

  // Update badge content when notifications change
  useEffect(() => {
    setBadgeContent(notifications.length);
    
    // Show snackbar for the newest notification
    if (notifications.length > 0 && !drawerOpen) {
      const latestNotification = notifications[0];
      setSnackbar({
        open: true,
        message: latestNotification.message
      });
    }
  }, [notifications, drawerOpen]);

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    if (!drawerOpen) {
      // Reset badge when opening drawer
      setBadgeContent(0);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'just now';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={toggleDrawer}>
        <Badge badgeContent={badgeContent} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <Button onClick={clearNotifications} color="primary" size="small">
              Clear All
            </Button>
          </Box>

          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              No notifications
            </Typography>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <ListItem 
                  key={index}
                  divider
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeNotification(index)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ 
                    bgcolor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } 
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={formatTime(notification.timestamp)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default NotificationComponent; 