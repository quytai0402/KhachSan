import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  CircularProgress
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
import { serviceAPI } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceAPI.getAllServices();
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Function to get icon component based on icon name
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'spa':
        return <SpaOutlined fontSize="large" />;
      case 'restaurant':
        return <RestaurantOutlined fontSize="large" />;
      case 'parking':
        return <LocalParkingOutlined fontSize="large" />;
      case 'wifi':
        return <WifiOutlined fontSize="large" />;
      case 'fitness':
        return <FitnessCenterOutlined fontSize="large" />;
      case 'pool':
        return <PoolOutlined fontSize="large" />;
      case 'laundry':
        return <LocalLaundryServiceOutlined fontSize="large" />;
      case 'shuttle':
        return <AirportShuttleOutlined fontSize="large" />;
      default:
        return <SpaOutlined fontSize="large" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" color="error">{error}</Typography>
      </Box>
    );
  }

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
          <Grid item xs={12} md={6} key={service._id || service.id}>
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
                    {getServiceIcon(service.icon)}
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