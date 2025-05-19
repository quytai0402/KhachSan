import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Send as SendIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên của bạn';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email của bạn';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9+\s-]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Vui lòng nhập tiêu đề tin nhắn';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Vui lòng nhập nội dung tin nhắn';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Không thể gửi tin nhắn của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ 
      background: 'linear-gradient(to bottom, rgba(30, 78, 140, 0.05) 0%, rgba(255, 255, 255, 1) 100%)'
    }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700, 
              color: '#1e4e8c',
              fontSize: { xs: '2.2rem', md: '3rem' }
            }}
          >
            Liên Hệ Với Chúng Tôi
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            paragraph 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: '1.1rem'
            }}
          >
            Bạn có câu hỏi về phòng, dịch vụ hoặc cần hỗ trợ đặt phòng?
            Liên hệ với đội ngũ thân thiện của chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
          </Typography>
        </Box>
        
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 3, 
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(230, 230, 230, 0.5)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ color: '#1e4e8c', fontWeight: 600 }}>
                Gửi Tin Nhắn
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm!
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={Boolean(formErrors.name)}
                      helperText={formErrors.name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Địa chỉ Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={Boolean(formErrors.email)}
                      helperText={formErrors.email}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      error={Boolean(formErrors.phone)}
                      helperText={formErrors.phone}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tiêu đề"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={Boolean(formErrors.subject)}
                      helperText={formErrors.subject}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Tin nhắn của bạn"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={6}
                      fullWidth
                      required
                      error={Boolean(formErrors.message)}
                      helperText={formErrors.message}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{ 
                        py: 1.5,
                        px: 4,
                        bgcolor: '#1e4e8c',
                        '&:hover': { bgcolor: '#15385f' }
                      }}
                    >
                      {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Card 
              sx={{ 
                mb: 4, 
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(230, 230, 230, 0.5)',
              }}
              elevation={0}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#1e4e8c', fontWeight: 600 }}>
                  Thông Tin Liên Hệ
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <PhoneIcon sx={{ color: '#1e4e8c' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" color="text.secondary">Số Điện Thoại</Typography>}
                      secondary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          +84 (28) 3823 4999
                        </Typography>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          bgcolor: '#e8f5e9', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <EmailIcon sx={{ color: '#2e7d32' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" color="text.secondary">Email</Typography>}
                      secondary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          info@luxehotel.vn
                        </Typography>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          bgcolor: '#fff3e0', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <LocationIcon sx={{ color: '#e67e22' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" color="text.secondary">Địa Chỉ</Typography>}
                      secondary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                        </Typography>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          bgcolor: '#f3e5f5', 
                          borderRadius: '50%', 
                          width: 40, 
                          height: 40, 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <AccessTimeIcon sx={{ color: '#9c27b0' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" color="text.secondary">Giờ Lễ Tân</Typography>}
                      secondary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          24/7, 365 ngày trong năm
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <IconButton 
                    color="primary" 
                    sx={{ 
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: '#E1306C',
                      bgcolor: 'rgba(225, 48, 108, 0.1)',
                      '&:hover': { bgcolor: 'rgba(225, 48, 108, 0.2)' }
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: '#1DA1F2',
                      bgcolor: 'rgba(29, 161, 242, 0.1)',
                      '&:hover': { bgcolor: 'rgba(29, 161, 242, 0.2)' }
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: '#25D366',
                      bgcolor: 'rgba(37, 211, 102, 0.1)',
                      '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.2)' }
                    }}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
            
            <Card 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(230, 230, 230, 0.5)',
              }}
              elevation={0}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#1e4e8c', fontWeight: 600 }}>
                  Vị Trí
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Map Embed - Updated with Vietnam location */}
                <Box 
                  component="iframe"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325637331779!2d106.70209971523729!3d10.785777192317598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zTmd1eeG7hW4gSHXhu4csIELhur9uIE5naMOpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1653208249742!5m2!1svi!2s"
                  width="100%"
                  height={isMobile ? 200 : 280}
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Location"
                ></Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ 
                    mt: 3, 
                    borderColor: '#1e4e8c',
                    color: '#1e4e8c',
                    '&:hover': { 
                      borderColor: '#15385f',
                      bgcolor: 'rgba(30, 78, 140, 0.04)'
                    },
                    py: 1.2
                  }}
                  href="https://goo.gl/maps/U6JoY83sXPXkzxJTA"
                  target="_blank"
                >
                  Chỉ Đường
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;