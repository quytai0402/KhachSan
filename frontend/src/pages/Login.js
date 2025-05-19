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
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, isAuthenticated } = useAuth();
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    setFormError('');
    setIsSubmitting(true);
    
    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/');
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      setFormError('An error occurred during login');
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              background: 'linear-gradient(135deg, rgba(30, 78, 140, 0.8), rgba(76, 122, 192, 0.75))',
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
              boxShadow: '0 10px 30px rgba(30, 78, 140, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2670&auto=format&fit=crop)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2,
                zIndex: 0,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, fontSize: '1.1rem' }}>
                Sign in to continue your luxury hotel experience with exclusive benefits and personalized service
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
                    color: 'primary.main',
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
            <Box sx={{ maxWidth: 400, width: '100%' }}>
              <Typography 
                component="h1" 
                variant="h4" 
                align="center" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.dark',
                  mb: 1,
                }}
              >
                Sign In
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                align="center" 
                sx={{ mb: 4 }}
              >
                Welcome back! Please enter your credentials to continue.
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
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
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
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary.main">
                    Forgot password?
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ 
                    mt: 1, 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 10px rgba(30, 78, 140, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(30, 78, 140, 0.3)',
                    }
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    OR
                  </Typography>
                </Divider>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        borderColor: '#3b5998', 
                        color: '#3b5998',
                        '&:hover': { 
                          borderColor: '#3b5998',
                          bgcolor: 'rgba(59, 89, 152, 0.04)'
                        }
                      }}
                    >
                      <FacebookIcon />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        borderColor: '#1DA1F2', 
                        color: '#1DA1F2',
                        '&:hover': { 
                          borderColor: '#1DA1F2',
                          bgcolor: 'rgba(29, 161, 242, 0.04)'
                        }
                      }}
                    >
                      <TwitterIcon />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        borderColor: '#db4a39', 
                        color: '#db4a39',
                        '&:hover': { 
                          borderColor: '#db4a39',
                          bgcolor: 'rgba(219, 74, 57, 0.04)'
                        }
                      }}
                    >
                      <Email />
                    </Button>
                  </Grid>
                </Grid>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" align="center" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/register" 
                        sx={{ 
                          color: 'secondary.main', 
                          fontWeight: 500,
                          '&:hover': {
                            color: 'secondary.dark'
                          }
                        }}
                      >
                        Register now
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

export default Login;