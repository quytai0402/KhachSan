import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button
} from '@mui/material';
import {
  SpaOutlined,
  RestaurantOutlined,
  LocalParkingOutlined,
  WifiOutlined,
  FitnessCenterOutlined,
  PoolOutlined,
  LocalLaundryServiceOutlined,
  AirportShuttleOutlined
} from '@mui/icons-material';

const services = [
  {
    id: 1,
    title: 'Luxury Spa & Wellness',
    description: 'Indulge in our award-winning spa treatments and wellness services designed for ultimate relaxation and rejuvenation.',
    icon: <SpaOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 2,
    title: 'Fine Dining Experience',
    description: 'Savor exquisite culinary delights at our restaurant featuring international cuisine prepared by world-class chefs.',
    icon: <RestaurantOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 3,
    title: 'Secure Parking',
    description: 'Enjoy peace of mind with our 24/7 secure parking facilities available for all guests during their stay.',
    icon: <LocalParkingOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 4,
    title: 'High-Speed WiFi',
    description: 'Stay connected with complimentary high-speed internet access available throughout the hotel.',
    icon: <WifiOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 5,
    title: 'Fitness Center',
    description: 'Maintain your fitness routine in our state-of-the-art gym equipped with the latest exercise machines and free weights.',
    icon: <FitnessCenterOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 6,
    title: 'Swimming Pool',
    description: 'Relax and unwind in our indoor and outdoor swimming pools with lounging areas and poolside service.',
    icon: <PoolOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 7,
    title: 'Laundry Service',
    description: 'Keep your wardrobe fresh with our professional laundry and dry-cleaning services available daily.',
    icon: <LocalLaundryServiceOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 8,
    title: 'Airport Shuttle',
    description: 'Enjoy convenient transportation with our complimentary airport shuttle service for all guests.',
    icon: <AirportShuttleOutlined fontSize="large" />,
    image: 'https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  }
];

const Services = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Our Services
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Experience the finest amenities and services designed to make your stay truly exceptional.
          From relaxing spa treatments to exquisite dining, we offer everything you need for a memorable experience.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service.id}>
            <Card sx={{ 
              display: 'flex', 
              flexDirection: {xs: 'column', sm: 'row'},
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 200, sm: '100%' }
                }}
                image={service.image}
                alt={service.title}
              />
              <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {service.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Button size="small" color="primary">
                    Learn More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Need Something Special?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We're happy to accommodate special requests to make your stay perfect.
        </Typography>
        <Button variant="contained" size="large" href="/contact">
          Contact Us
        </Button>
      </Box>
    </Container>
  );
};

export default Services; 