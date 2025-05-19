import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, Button, TextField, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        pt: 8,
        pb: 4,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #e67e22, #f39c12, #1e4e8c, #4c7ac0)',
        }
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #e67e22, #f39c12)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              mb: 2
            }}>
              LUXURY HOTEL
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, lineHeight: 1.7 }}>
              Luxury and comfort at affordable prices. Experience the best hospitality with us.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
              <IconButton size="small" sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'secondary.main',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s'
              }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'secondary.main',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s'
              }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'secondary.main',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s'
              }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'secondary.main',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s'
              }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              mb: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'secondary.main'
              }
            }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              <Link 
                component={RouterLink} 
                to="/" 
                color="inherit" 
                underline="none" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    pl: 0.5, 
                    color: 'secondary.main'
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} /> Home
              </Link>
              <Link 
                component={RouterLink} 
                to="/rooms" 
                color="inherit" 
                underline="none" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    pl: 0.5, 
                    color: 'secondary.main'
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} /> Rooms & Suites
              </Link>
              <Link 
                component={RouterLink} 
                to="/services" 
                color="inherit" 
                underline="none" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    pl: 0.5, 
                    color: 'secondary.main'
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} /> Services
              </Link>
              <Link 
                component={RouterLink} 
                to="/promotions" 
                color="inherit" 
                underline="none" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    pl: 0.5, 
                    color: 'secondary.main'
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} /> Promotions
              </Link>
              <Link 
                component={RouterLink} 
                to="/contact" 
                color="inherit" 
                underline="none" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    pl: 0.5, 
                    color: 'secondary.main'
                  }
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} /> Contact Us
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              mb: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'secondary.main'
              }
            }}>
              Contact Us
            </Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    mr: 2, 
                    mt: 0.5, 
                    backgroundColor: 'rgba(230, 126, 34, 0.15)', 
                    borderRadius: '50%', 
                    width: 32, 
                    height: 32, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'secondary.main'
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  123 Hotel Street, City Name, Country
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    mr: 2, 
                    mt: 0.5, 
                    backgroundColor: 'rgba(230, 126, 34, 0.15)', 
                    borderRadius: '50%', 
                    width: 32, 
                    height: 32, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'secondary.main'
                  }}
                >
                  <PhoneIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Support Hotline:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    +1 234 567 890
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    mr: 2, 
                    mt: 0.5, 
                    backgroundColor: 'rgba(230, 126, 34, 0.15)', 
                    borderRadius: '50%', 
                    width: 32, 
                    height: 32, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'secondary.main'
                  }}
                >
                  <EmailIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Email us:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    info@luxuryhotel.com
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              mb: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'secondary.main'
              }
            }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.7 }}>
              Subscribe to our newsletter to receive exclusive offers and the latest news on our services.
            </Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                fullWidth
                placeholder="Your Email Address"
                variant="outlined"
                size="small"
                sx={{ 
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                  input: { color: 'white' }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth
                sx={{ 
                  py: 1, 
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(230, 126, 34, 0.4)'
                  }
                }}
              >
                Subscribe Now
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, sm: 0 }, opacity: 0.7 }}>
            © {new Date().getFullYear()} Luxury Hotel. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link component={RouterLink} to="/terms" color="inherit" underline="hover" sx={{ fontSize: '0.875rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
              Terms & Conditions
            </Link>
            <Link component={RouterLink} to="/privacy" color="inherit" underline="hover" sx={{ fontSize: '0.875rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 