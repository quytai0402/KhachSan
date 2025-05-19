import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
  Rating,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatVND, getVietnameseRoomType } from '../utils/formatCurrency';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PoolIcon from '@mui/icons-material/Pool';
import CheckIcon from '@mui/icons-material/Check';
import SpaIcon from '@mui/icons-material/Spa';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Map amenity names to icons
const amenityIcons = {
  'Wi-Fi': <WifiIcon />,
  'TV': <TvIcon />,
  'Điều hòa': <AcUnitIcon />,
  'Bãi đậu xe': <LocalParkingIcon />,
  'Bữa sáng': <RestaurantIcon />,
  'Giặt ủi': <DryCleaningIcon />,
  'Phòng tập': <FitnessCenterIcon />,
  'Hồ bơi': <PoolIcon />,
  'Spa': <SpaIcon />
};

const getRoomTypeLabel = (type) => {
  return getVietnameseRoomType(type);
  }
};

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getRoomById(id);
        setRoom(response.data);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetail();
  }, [id]);
  
  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(`/booking/${id}`);
    } else {
      navigate(`/login?redirect=/booking/${id}`);
    }
  };
  
  // Default placeholder images if none provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
  ];
  
  // Default amenities if none provided
  const defaultAmenities = [
    'Wi-Fi',
    'TV',
    'Air Conditioning',
    'Breakfast',
    'Minibar'
  ];
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!room) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Không tìm thấy phòng.</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          Trang chủ
        </Link>
        <Link component={RouterLink} to="/rooms" color="inherit">
          Phòng
        </Link>
        <Typography color="text.primary">{typeof room.type === 'object' ? 
          getRoomTypeLabel(room.type.name) : 
          getRoomTypeLabel(room.type)} {room.roomNumber}</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Room Images */}
          <Box sx={{ mb: 3 }}>
            <ImageList
              sx={{ 
                width: '100%', 
                borderRadius: 2,
                overflow: 'hidden',
                // Make first image larger
                '.MuiImageListItem-root:first-of-type': {
                  gridColumn: 'span 2',
                  gridRow: 'span 2',
                }
              }}
              variant="quilted"
              cols={3}
              rowHeight={200}
            >
              {(room.images && room.images.length > 0) ? 
                room.images.map((item, index) => (
                <ImageListItem key={index} cols={index === 0 ? 2 : 1} rows={index === 0 ? 2 : 1}>
                  <img
                    src={item.startsWith('http') ? item : `http://localhost:5000${item}`}
                    alt={`Room ${room.roomNumber} - View ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImages[index % defaultImages.length];
                    }}
                  />
                </ImageListItem>
              )) : defaultImages.map((item, index) => (
                <ImageListItem key={index} cols={index === 0 ? 2 : 1} rows={index === 0 ? 2 : 1}>
                  <img
                    src={item}
                    alt={`Room ${room.roomNumber} - View ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
          
          {/* Room Description */}
          <Typography variant="h4" component="h1" gutterBottom>
            {typeof room.type === 'object' ? 
              getRoomTypeLabel(room.type.name) : 
              getRoomTypeLabel(room.type)} {room.roomNumber}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`Tầng ${room.floor || 1}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`${room.capacity} ${room.capacity > 1 ? 'Khách' : 'Khách'}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={room.status === 'available' ? 'Còn trống' : 'Không có sẵn'} 
              size="small" 
              color={room.status === 'available' ? 'success' : 'error'} 
            />
            <Chip 
              label={typeof room.type === 'object' ? 
                (room.type.name === 'double' || room.type.name === 'twin' ? '2 Giường' : '1 Giường') : 
                (room.type === 'double' || room.type === 'twin' ? '2 Giường' : '1 Giường')} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body1" paragraph>
            {room.description}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Amenities */}
          <Typography variant="h6" gutterBottom>
            Tiện Nghi
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {(room.amenities && room.amenities.length > 0 ? room.amenities : defaultAmenities).map((amenity, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {amenityIcons[amenity] || <CheckIcon />}
                  </ListItemIcon>
                  <Typography variant="body2">{amenity}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Room Policies */}
          <Typography variant="h6" gutterBottom>
            Quy Định Phòng
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Giờ nhận phòng"
                secondary="Từ 14:00"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Giờ trả phòng"
                secondary="Đến 12:00"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Hủy phòng"
                secondary="Miễn phí hủy phòng đến 24 giờ trước khi nhận phòng"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Thanh toán"
                secondary="Thanh toán tại khách sạn hoặc trả trước"
              />
            </ListItem>
          </List>
        </Grid>
        
        {/* Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {formatVND(room.price)}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                mỗi đêm
              </Typography>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                4.5/5 (28 đánh giá)
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={3}>
              <Typography variant="body2">
                Đặt ngay để đảm bảo phòng với mức giá này.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleBookNow}
                disabled={room.status !== 'available'}
                startIcon={<BookmarkAddIcon />}
              >
                Đặt Ngay
              </Button>
              
              {room.status !== 'available' && (
                <Alert severity="warning">
                  Phòng này hiện không khả dụng để đặt.
                </Alert>
              )}
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Giá bao gồm:
                </Typography>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Wi-Fi miễn phí" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Hủy miễn phí (trước 24h)" />
                  </ListItem>
                  {typeof room.type === 'object' ? 
                    (room.type.name !== 'single' && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Bữa sáng cho 2 người" />
                      </ListItem>
                    )) : (
                    room.type !== 'single' && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Bữa sáng cho 2 người" />
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RoomDetail; 