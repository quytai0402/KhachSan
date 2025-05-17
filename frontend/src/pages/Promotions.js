import React from 'react';
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
  Divider
} from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

const promotions = [
  {
    id: 1,
    title: 'Weekend Escape',
    description: 'Enjoy a relaxing weekend getaway with 20% off our best available rates. Includes complimentary breakfast and late checkout.',
    validUntil: 'December 31, 2023',
    discount: '20%',
    code: 'WEEKEND20',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 2,
    title: 'Stay Longer, Save More',
    description: 'Book 4 nights or more and receive 25% off your entire stay. Perfect for extended vacations or business trips.',
    validUntil: 'January 15, 2024',
    discount: '25%',
    code: 'EXTRASTAY',
    image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 3,
    title: 'Early Bird Special',
    description: 'Plan ahead and save! Book at least 30 days in advance to receive 15% off your room rate.',
    validUntil: 'Ongoing',
    discount: '15%',
    code: 'EARLYBIRD',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 4,
    title: 'Spa & Wellness Package',
    description: 'Book any room and add our premium spa package at 30% off. Includes a 60-minute massage and facial treatment.',
    validUntil: 'November 30, 2023',
    discount: '30%',
    code: 'SPADELUXE',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 5,
    title: 'Family Fun Package',
    description: 'Bring the whole family and enjoy spacious accommodations with 20% off when booking two rooms. Kids eat free!',
    validUntil: 'February 28, 2024',
    discount: '20%',
    code: 'FAMILY20',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  },
  {
    id: 6,
    title: 'Honeymoon Special',
    description: 'Celebrate your new beginning with our romantic package including champagne, chocolate-covered strawberries, and rose petal turndown service.',
    validUntil: 'Ongoing',
    discount: '25%',
    code: 'HONEYMOON',
    image: 'https://images.unsplash.com/photo-1519011985187-444d62641929?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
  }
];

const Promotions = () => {
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
          <Grid item xs={12} md={6} lg={4} key={promo.id}>
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