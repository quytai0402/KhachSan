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
  Grid
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import PeopleIcon from '@mui/icons-material/People';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import AcUnitIcon from '@mui/icons-material/AcUnit';

const getRoomTypeLabel = (type) => {
  switch (type) {
    case 'single':
      return 'Single Room';
    case 'double':
      return 'Double Room';
    case 'twin':
      return 'Twin Room';
    case 'suite':
      return 'Suite';
    case 'family':
      return 'Family Room';
    case 'deluxe':
      return 'Deluxe Room';
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
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={randomImage}
          alt={room.roomNumber}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={getRoomTypeLabel(room.type)}
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontWeight: 'bold'
          }}
        />
        <Chip
          label={`Floor ${room.floor || '1'}`}
          color="default"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.8)',
            color: 'text.primary'
          }}
        />
        <Chip
          label={room.status}
          color={getStatusColor(room.status)}
          size="small"
          sx={{
            position: 'absolute',
            bottom: -12,
            right: 16,
            textTransform: 'capitalize'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography variant="h5" component="div" gutterBottom>
          Room {room.roomNumber}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {room.description}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BedIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {room.type === 'double' || room.type === 'twin' ? '2 Beds' : '1 Bed'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {room.amenities && room.amenities.map((amenity, index) => (
            <Chip 
              key={index} 
              label={amenity} 
              variant="outlined" 
              size="small" 
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {(!room.amenities || room.amenities.length === 0) && (
            <>
              <Chip icon={<WifiIcon fontSize="small" />} label="WiFi" variant="outlined" size="small" />
              <Chip icon={<TvIcon fontSize="small" />} label="TV" variant="outlined" size="small" />
              <Chip icon={<AcUnitIcon fontSize="small" />} label="AC" variant="outlined" size="small" />
            </>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="h6" color="primary.main">
            ${room.price}<Typography component="span" variant="body2">/night</Typography>
          </Typography>
          
          <Box>
            <Button 
              size="small" 
              onClick={handleViewDetails}
              sx={{ mr: 1 }}
            >
              Details
            </Button>
            <Button 
              variant="contained" 
              size="small"
              disabled={room.status !== 'available'}
              onClick={handleBookNow}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard; 