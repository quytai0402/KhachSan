import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
        // Extract data from the new API format { success: true, data: [...] }
        const promotionsData = response.data?.data || response.data || [];
        setPromotions(promotionsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Không thể tải khuyến mãi');
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
          Ưu Đãi & Khuyến Mãi Đặc Biệt
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Tận dụng các ưu đãi và khuyến mãi độc quyền của chúng tôi để nâng cao kỳ nghỉ của bạn.
          Đặt phòng trực tiếp để có mức giá tốt nhất và ưu đãi đặc biệt.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {promotions.map((promo) => (
          <Grid item xs={12} md={6} lg={4} key={promo._id || promo.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={promo.image ? `http://localhost:5000${promo.image}` : 'https://source.unsplash.com/random/300x200/?hotel'}
                  alt={promo.title || promo.name}
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                />
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box component="span" 
                    sx={{ 
                      display: 'inline-block',
                      animation: 'pulse 1.5s infinite',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'white'
                    }}
                  />
                  Tiết kiệm {promo.discountPercent}%
                </Box>
              </Box>
              
              <CardContent sx={{ 
                flexGrow: 1, 
                p: 3, 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '10%',
                  width: '80%',
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent)',
                }
              }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    color: 'primary.dark',
                    fontSize: '1.4rem'
                  }}
                >
                  {promo.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  paragraph 
                  sx={{ 
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}
                >
                  {promo.description?.slice(0, 120)}{promo.description?.length > 120 ? '...' : ''}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Có hiệu lực đến: {new Date(promo.validTo).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
                    mb: 2
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      MÃ ƯU ĐÃI
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                        fontWeight: 700,
                        color: 'primary.main',
                        fontSize: '1.2rem'
                      }}
                    >
                      {promo.code}
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderRadius: '8px',
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      fontWeight: 600,
                      px: 1.5,
                      minWidth: 0,
                      '&:hover': {
                        borderWidth: 2,
                        borderStyle: 'dashed',
                      }
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      alert('Mã đã được sao chép vào clipboard!');
                    }}
                  >
                    Sao chép
                  </Button>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  fullWidth
                  component={RouterLink}
                  to={`/promotions/${promo._id || promo.id}`}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(30, 78, 140, 0.04)'
                    }
                  }}
                >
                  Xem chi tiết
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  component={RouterLink}
                  to="/rooms"
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(30, 78, 140, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(30, 78, 140, 0.3)',
                    }
                  }}
                >
                  Đặt Ngay
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
          Đăng Ký Nhận Ưu Đãi Độc Quyền
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 700, mx: 'auto' }}>
          Tham gia danh sách nhận thông báo của chúng tôi để nhận thông tin về các khuyến mãi đặc biệt, ưu đãi theo mùa và các ưu đãi độc quyền chỉ dành cho người đăng ký.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          href="/contact"
        >
          Đăng Ký Ngay
        </Button>
      </Box>
    </Container>
  );
};

export default Promotions; 