import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock, 
  Email,
  Person,
  Phone,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle API error
  useEffect(() => {
    if (error) {
      setFormError(error);
      setIsSubmitting(false);
    }
  }, [error]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    // Check for empty fields
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/');
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      setFormError('An error occurred during registration');
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <Container component="main" maxWidth="md">
      <Grid container sx={{ minHeight: '80vh' }}>
        <Grid item xs={12} md={6} sx={{ 
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          p: 4,
        }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.8), rgba(243, 156, 18, 0.75))',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(230, 126, 34, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2970&auto=format&fit=crop)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2,
                zIndex: 0,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
                Join Us Today
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, fontSize: '1.1rem' }}>
                Create an account to enjoy exclusive benefits, special rates, and personalized service at our luxury hotel
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center', 
                mt: 4,
                '& .MuiIconButton-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: 'secondary.main',
                    transform: 'translateY(-3px)',
                  }
                }
              }}>
                <IconButton>
                  <FacebookIcon />
                </IconButton>
                <IconButton>
                  <TwitterIcon />
                </IconButton>
                <IconButton>
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              marginTop: { xs: 4, md: 8 },
              marginBottom: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: { xs: 2, sm: 4 },
            }}
          >
            <Box sx={{ maxWidth: 450, width: '100%' }}>
              <Typography 
                component="h1" 
                variant="h4" 
                align="center" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: 'secondary.dark',
                  mb: 1,
                }}
              >
                Create Account
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                align="center" 
                sx={{ mb: 4 }}
              >
                Enter your details to create your account and start your journey with us.
              </Typography>
              
              {formError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  {formError}
                </Alert>
              )}
              
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  mt: 1,
                  '& .MuiTextField-root': {
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      },
                    },
                  }
                }}
              >
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone (optional)"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Password must be at least 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ 
                    mt: 2, 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 10px rgba(230, 126, 34, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(230, 126, 34, 0.3)',
                    }
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" align="center" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login" 
                        sx={{ 
                          color: 'primary.main', 
                          fontWeight: 500,
                          '&:hover': {
                            color: 'primary.dark'
                          }
                        }}
                      >
                        Sign in
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register;