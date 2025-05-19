import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { promotionAPI } from '../services/api';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await promotionAPI.getAllPromotions();
        setPromotions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Failed to load promotions');
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

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
          Special Offers & Promotions
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Take advantage of our exclusive deals and promotions to enhance your stay with us.
          Book directly for the best rates and special perks.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {promotions.map((promo) => (
          <Grid item xs={12} md={6} lg={4} key={promo._id || promo.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={promo.image}
                alt={promo.title}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {promo.title}
                  </Typography>
                  <Chip 
                    label={`${promo.discount} OFF`}
                    color="error"
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {promo.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Valid until: {promo.validUntil}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Promo Code:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: 1
                    }}
                  >
                    {promo.code}
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  href="/rooms"
                >
                  Book Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ 
        mt: 8, 
        p: 4, 
        textAlign: 'center',
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
        borderRadius: 2
      }}>
        <Typography variant="h5" gutterBottom>
          Subscribe for Exclusive Offers
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 700, mx: 'auto' }}>
          Join our mailing list to receive updates on special promotions, seasonal offers, and exclusive deals available only to subscribers.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          href="/contact"
        >
          Subscribe Now
        </Button>
      </Box>
    </Container>
  );
};

export default Promotions; 