import React, { useState, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  HotelOutlined as RoomIcon,
  BookOnlineOutlined as BookingIcon,
  PersonOutlined as UserIcon,
  RoomServiceOutlined as ServiceIcon,
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const getActivityIcon = (activity) => {
  if (!activity) return <UserIcon />;
  
  const type = activity.type || activity.data?.entityType || '';
  
  switch (type) {
    case 'room':
      return <RoomIcon />;
    case 'booking':
      return <BookingIcon />;
    case 'user':
      return <UserIcon />;
    case 'service':
      return <ServiceIcon />;
    case 'success':
      return <CheckIcon />;
    case 'warning':
      return <WarningIcon />;
    default:
      return <UserIcon />;
  }
};

const getActivityColor = (activity) => {
  if (!activity) return '#e0e0e0';
  
  const type = activity.type || activity.data?.entityType || '';
  const status = activity.status || '';
  
  if (status === 'success') return '#c8e6c9';
  if (status === 'warning') return '#fff9c4';
  if (status === 'error') return '#ffcdd2';
  
  switch (type) {
    case 'room':
      return '#bbdefb';
    case 'booking':
      return '#c8e6c9';
    case 'user':
      return '#f8bbd0';
    case 'service':
      return '#fff9c4';
    default:
      return '#e0e0e0';
  }
};

/**
 * Activity Log component that shows real-time user activities
 * Works with both admin and staff dashboards
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.activities - Activities to display
 * @param {string} props.title - Title for the activity section
 * @param {number} props.maxItems - Maximum items to show
 */
const ActivityLog = ({ activities = [], title = "Hoạt Động Gần Đây", maxItems = 5 }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Limit and prepare activities for display
  const displayActivities = Array.isArray(activities) 
    ? activities.slice(0, maxItems)
    : [];
  
  const handleMenuOpen = (event, activity) => {
    setMenuAnchor(event.currentTarget);
    setSelectedActivity(activity);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedActivity(null);
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Render empty state
  if (!displayActivities || displayActivities.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom component="h2">
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Không có hoạt động nào gần đây
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom component="h2">
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 60px)' }}>
        {displayActivities.map((activity, index) => {
          const roomNumber = activity.roomNumber || activity.room?.roomNumber || 
                              activity.data?.roomNumber || '';
          const guestName = activity.guestName || activity.guest?.name || 
                            activity.user?.name || activity.data?.guestName || '';
          const statusText = activity.status === 'pending' ? 'Đang chờ' : 
                            activity.status === 'confirmed' ? 'Đã xác nhận' :
                            activity.status === 'checked-in' ? 'Đã check-in' :
                            activity.status === 'checked-out' ? 'Đã check-out' :
                            activity.status === 'cancelled' ? 'Đã hủy' : '';
                            
          return (
            <React.Fragment key={activity._id || `activity-${index}`}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Tooltip title="Thêm">
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, activity)}>
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity) }}>
                    {getActivityIcon(activity)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" component="span">
                        {roomNumber && `Phòng ${roomNumber}`}
                        {!roomNumber && (activity.title || 'Hoạt động')}
                      </Typography>
                      {statusText && (
                        <Chip 
                          label={statusText} 
                          size="small" 
                          color={
                            activity.status === 'confirmed' || activity.status === 'checked-in' 
                              ? 'success' 
                              : activity.status === 'cancelled' 
                                ? 'error' 
                                : 'default'
                          }
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary" component="span">
                        {guestName && `Khách: ${guestName}`}
                        {activity.checkInDate && activity.checkOutDate && 
                          ` • ${format(new Date(activity.checkInDate), 'dd/MM')} - ${format(new Date(activity.checkOutDate), 'dd/MM')}`}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatTime(activity.timestamp || activity.updatedAt || activity.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < displayActivities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Chi Tiết</MenuItem>
        {isAdmin && <MenuItem onClick={handleMenuClose}>Liên Hệ</MenuItem>}
        <MenuItem onClick={handleMenuClose}>Đánh Dấu Đã Đọc</MenuItem>
      </Menu>
    </Paper>
  );
};

export default memo(ActivityLog); 