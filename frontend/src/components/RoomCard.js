import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
  Divider,
  Rating
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import PeopleIcon from '@mui/icons-material/People';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const getRoomTypeLabel = (type) => {
  switch (type) {
    case 'single':
      return 'Phòng Đơn';
    case 'double':
      return 'Phòng Đôi';
    case 'twin':
      return 'Phòng Twin';
    case 'suite':
      return 'Phòng Suite';
    case 'family':
      return 'Phòng Gia Đình';
    case 'deluxe':
      return 'Phòng Deluxe';
    default:
      return type;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'booked':
      return 'error';
    case 'maintenance':
      return 'warning';
    case 'cleaning':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'available':
      return 'Còn Trống';
    case 'booked':
      return 'Đã Đặt';
    case 'maintenance':
      return 'Bảo Trì';
    case 'cleaning':
      return 'Đang Dọn';
    default:
      return status;
  }
};

// Helper function to get a random image from the array or return default
const getRandomImage = (images) => {
  if (!images || images.length === 0) return null;
  
  // Select a random image from the array
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  
  // Placeholder image if none is provided
  const defaultImage = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80';
  
  // Get a random image from room images or use default
  const randomImage = room.images && room.images.length > 0 
    ? `http://localhost:5000${getRandomImage(room.images)}`
    : defaultImage;
  
  const handleViewDetails = () => {
    navigate(`/rooms/${room._id}`);
  };
  
  const handleBookNow = () => {
    navigate(`/booking/${room._id}`);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'visible',
        transition: 'all 0.4s ease',
        borderRadius: '16px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          '& .MuiCardMedia-root': {
            transform: 'scale(1.05)',
          },
          '& .room-price': {
            backgroundColor: '#e67e22',
            color: 'white',
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
        <CardMedia
          component="img"
          height="260"
          image={randomImage}
          alt={room.roomNumber}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.8s ease',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <Chip
          label={typeof room.type === 'object' ? getRoomTypeLabel(room.type.name) : getRoomTypeLabel(room.type)}
          color="secondary"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="caption" fontWeight={600}>
            Tầng {room.floor || '1'}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(room.status)}
          color={getStatusColor(room.status)}
          size="small"
          sx={{
            position: 'absolute',
            bottom: -12,
            right: 16,
            textTransform: 'capitalize',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        />
      </Box>
      
      <Box
        className="room-price"
        sx={{
          position: 'absolute',
          top: 230,
          left: 16,
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h6" 
          component="span" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
          <Typography component="span" variant="body2" sx={{ fontSize: '0.75rem', ml: 0.5, fontWeight: 400 }}>/đêm</Typography>
        </Typography>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 3, px: 3 }}>
        <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.dark',
              fontSize: '1.2rem',
            }}
          >
            Phòng {room.roomNumber}
          </Typography>
          
          <Rating 
            value={4.5} 
            precision={0.5} 
            size="small" 
            readOnly 
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.6,
            minHeight: '3.2em',
          }}
        >
          {room.description || 'Phòng nghỉ hiện đại với đầy đủ tiện nghi cao cấp, mang đến trải nghiệm lưu trú sang trọng và thoải mái.'}
        </Typography>
        
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'rgba(30, 78, 140, 0.08)', 
                borderRadius: '50%', 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'primary.main',
                mr: 1.5
              }}>
                <PeopleIcon fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {room.capacity} {room.capacity > 1 ? 'Khách' : 'Khách'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'rgba(30, 78, 140, 0.08)', 
                borderRadius: '50%', 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'primary.main',
                mr: 1.5
              }}>
                <BedIcon fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {typeof room.type === 'object' ? 
                  (room.type.name === 'double' || room.type.name === 'twin' ? '2 Giường' : '1 Giường') :
                  (room.type === 'double' || room.type === 'twin' ? '2 Giường' : '1 Giường')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'rgba(30, 78, 140, 0.08)', 
                borderRadius: '50%', 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'primary.main',
                mr: 1.5
              }}>
                <SquareFootIcon fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {room.size || '30'} m²
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.dark', fontWeight: 600 }}>
          Tiện Nghi
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {room.amenities && room.amenities.map((amenity, index) => (
            <Chip 
              key={index} 
              label={amenity} 
              variant="outlined" 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                borderRadius: '16px',
                borderColor: 'rgba(30, 78, 140, 0.3)',
                color: 'primary.main',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(30, 78, 140, 0.08)',
                }
              }}
            />
          ))}
          {(!room.amenities || room.amenities.length === 0) && (
            <>
              <Chip 
                icon={<WifiIcon fontSize="small" />} 
                label="WiFi" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: '16px',
                  borderColor: 'rgba(30, 78, 140, 0.3)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  }
                }}
              />
              <Chip 
                icon={<TvIcon fontSize="small" />} 
                label="TV" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: '16px',
                  borderColor: 'rgba(30, 78, 140, 0.3)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  }
                }}
              />
              <Chip 
                icon={<AcUnitIcon fontSize="small" />} 
                label="Điều Hòa" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: '16px',
                  borderColor: 'rgba(30, 78, 140, 0.3)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  }
                }}
              />
              <Chip 
                icon={<LocalBarIcon fontSize="small" />} 
                label="Mini Bar" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: '16px',
                  borderColor: 'rgba(30, 78, 140, 0.3)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  }
                }}
              />
              <Chip 
                icon={<RoomServiceIcon fontSize="small" />} 
                label="Dịch vụ phòng" 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: '16px',
                  borderColor: 'rgba(30, 78, 140, 0.3)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 78, 140, 0.08)',
                  }
                }}
              />
            </>
          )}
        </Box>
        
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Button 
            size="small" 
            color="primary"
            onClick={handleViewDetails}
            sx={{ 
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(30, 78, 140, 0.08)',
              }
            }}
          >
            Xem Chi Tiết
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            size="medium"
            disabled={room.status !== 'available'}
            onClick={handleBookNow}
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderRadius: '20px',
              px: 2,
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(230, 126, 34, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(230, 126, 34, 0.35)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.38)'
              }
            }}
          >
            Đặt Ngay
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;