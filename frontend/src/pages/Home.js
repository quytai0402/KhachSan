import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';

import HotelIcon from '@mui/icons-material/Hotel';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import SpaIcon from '@mui/icons-material/Spa';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

import { roomAPI, promotionAPI } from '../services/api';

const heroImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search form state
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 1));
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get featured rooms (using all rooms for now)
        const roomsResponse = await roomAPI.getAllRooms();
        setFeaturedRooms(roomsResponse.data.slice(0, 4)); // Just the first 4 rooms
        
        // Get promotions
        const promotionsResponse = await promotionAPI.getAllPromotions();
        setPromotions(promotionsResponse.data.slice(0, 3)); // Just the first 3 promotions
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback
        setFeaturedRooms([]);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    searchParams.append('checkIn', format(checkIn, 'yyyy-MM-dd'));
    searchParams.append('checkOut', format(checkOut, 'yyyy-MM-dd'));
    searchParams.append('guests', guests);
    if (roomType) searchParams.append('type', roomType);
    
    window.location.href = `/rooms?${searchParams.toString()}`;
  };
  
  // Mock features data
  const features = [
    {
      icon: <HotelIcon fontSize="large" />,
      title: 'Comfortable Rooms',
      description: 'Our rooms are designed with comfort in mind. High-quality bedding and amenities to make your stay perfect.'
    },
    {
      icon: <SpaIcon fontSize="large" />,
      title: 'Spa Services',
      description: 'Relax and rejuvenate with our premium spa services, featuring a range of treatments to suit your needs.'
    },
    {
      icon: <LocalDiningIcon fontSize="large" />,
      title: 'Gourmet Dining',
      description: 'Experience exquisite cuisine prepared by our world-class chefs using only the freshest ingredients.'
    },
    {
      icon: <RoomServiceIcon fontSize="large" />,
      title: '24/7 Room Service',
      description: 'Whatever you need, whenever you need it. Our dedicated staff is available around the clock.'
    }
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          height: { xs: '60vh', md: '80vh' },
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography
            variant="h2"
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }
            }}
          >
            Welcome to Our Luxury Hotel
          </Typography>
          <Typography 
            variant="h5" 
            component="p"
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Experience comfort, luxury, and exceptional service for an unforgettable stay
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="primary"
            component={RouterLink}
            to="/rooms"
            sx={{ 
              px: 4, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Explore Rooms
          </Button>
        </Container>
      </Box>
      
      {/* Search Bar */}
      <Container maxWidth="md" sx={{ mt: -5 }}>
        <Paper 
          elevation={3}
          component="form"
          onSubmit={handleSearch}
          sx={{ 
            p: 3,
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in Date"
                  value={checkIn}
                  onChange={(newValue) => setCheckIn(newValue)}
                  disablePast
                  format="MM/dd/yyyy"
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOut}
                  onChange={(newValue) => setCheckOut(newValue)}
                  disablePast
                  format="MM/dd/yyyy"
                  minDate={addDays(checkIn, 1)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Guests"
                type="number"
                variant="outlined"
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  label="Room Type"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="double">Double</MenuItem>
                  <MenuItem value="twin">Twin</MenuItem>
                  <MenuItem value="suite">Suite</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="deluxe">Deluxe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                fullWidth
                size="large"
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      
      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Our Services
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      height: 60,
                      width: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.lighter',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Rooms Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Featured Rooms
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Discover our most popular accommodations
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {loading ? (
              <Typography variant="body1" sx={{ m: 'auto', py: 4 }}>
                Loading rooms...
              </Typography>
            ) : featuredRooms.length > 0 ? (
              featuredRooms.map((room) => {
                // Get a random image from room images or use default
                const getRandomRoomImage = () => {
                  if (room.images && room.images.length > 0) {
                    // Select a random image
                    const randomIndex = Math.floor(Math.random() * room.images.length);
                    const selectedImage = room.images[randomIndex];
                    
                    // Check if the image path needs the server URL prefix
                    return selectedImage.startsWith('http') 
                      ? selectedImage 
                      : `http://localhost:5000${selectedImage}`;
                  }
                  return `https://source.unsplash.com/random/300x200/?hotel,room,${room.type}`;
                };
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={room._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="160"
                        image={getRandomRoomImage()}
                        alt={room.roomNumber}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/random/300x200/?hotel,room,${room.type}`;
                        }}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room {room.roomNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {room.description.slice(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            ${room.price}/night
                          </Typography>
                          <Button 
                            variant="outlined" 
                            component={RouterLink} 
                            to={`/rooms/${room._id}`}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Typography variant="body1" sx={{ m: 'auto', py: 4 }}>
                No rooms available at the moment.
              </Typography>
            )}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/rooms"
              size="large"
            >
              View All Rooms
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Promotions Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Special Offers
          </Typography>
          
          <Grid container spacing={4}>
            {loading ? (
              <Typography variant="body1" sx={{ m: 'auto', py: 4 }}>
                Loading promotions...
              </Typography>
            ) : promotions.length > 0 ? (
              promotions.map((promo) => {
                // Handle promo image with proper URL formatting
                const getPromoImage = () => {
                  if (promo.image) {
                    return promo.image.startsWith('http')
                      ? promo.image
                      : `http://localhost:5000${promo.image}`;
                  }
                  return `https://source.unsplash.com/random/600x400/?hotel,luxury,${promo.title}`;
                };
                
                return (
                  <Grid item xs={12} md={4} key={promo._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={getPromoImage()}
                        alt={promo.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/random/600x400/?hotel,luxury,${promo.title}`;
                        }}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="h3" gutterBottom>
                          {promo.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {promo.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Valid until: {promo.validUntil ? promo.validUntil : 'Ongoing'}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          component={RouterLink}
                          to={`/promotions/${promo._id}`}
                        >
                          View Offer
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="body1" sx={{ py: 4 }}>
                  No special offers available at the moment.
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/promotions"
              size="large"
            >
              View All Offers
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box
        sx={{
          py: 8,
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to experience luxury?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 'normal' }}>
            Book your stay now and enjoy exclusive benefits
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/rooms"
            sx={{ px: 4, py: 1.5 }}
          >
            Book Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 