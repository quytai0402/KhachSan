import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto'
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              HOTEL MANAGEMENT
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Luxury and comfort at affordable prices. Experience the best hospitality with us.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Link href="#" color="inherit">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit">
                <TwitterIcon />
              </Link>
              <Link href="#" color="inherit">
                <InstagramIcon />
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/rooms" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Rooms & Suites
            </Link>
            <Link component={RouterLink} to="/services" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Services
            </Link>
            <Link component={RouterLink} to="/promotions" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Promotions
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">
                123 Hotel Street, City Name, Country
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">
                +1 234 567 890
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">
                info@hotelmanagement.com
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Subscribe to our newsletter for the latest updates and offers.
            </Typography>
            {/* Simplified newsletter form without actual functionality */}
            <Box sx={{ 
              display: 'flex', 
              bgcolor: 'white', 
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box 
                component="input" 
                placeholder="Your Email" 
                sx={{ 
                  border: 'none', 
                  outline: 'none',
                  p: 1,
                  flexGrow: 1,
                  fontSize: '0.875rem'
                }} 
              />
              <Box 
                component="button"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  border: 'none',
                  p: 1,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                Subscribe
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 3 }} />
        
        <Typography variant="body2" align="center" sx={{ pt: 2 }}>
          © {new Date().getFullYear()} Hotel Management. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 