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
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={promo.image ? `http://localhost:5000${promo.image}` : 'https://source.unsplash.com/random/300x200/?hotel'}
                alt={promo.title || promo.name}
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
                    Có hiệu lực đến: {promo.validUntil}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mã Khuyến Mãi:
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
                  variant="outlined" 
                  color="primary" 
                  sx={{ mr: 1 }}
                  href={`/promotions/${promo._id || promo.id}`}
                >
                  Xem chi tiết
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  href="/rooms"
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