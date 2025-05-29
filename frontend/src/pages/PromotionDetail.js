import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  LocalOffer as LocalOfferIcon,
  Event as EventIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { promotionAPI } from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PromotionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        setLoading(true);
        const response = await promotionAPI.getPromotionById(id);
        setPromotion(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promotion:', err);
        setError('Không thể tải thông tin khuyến mãi');
        setLoading(false);
      }
    };

    if (id) {
      fetchPromotion();
    }
  }, [id]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const isPromotionValid = () => {
    if (!promotion) return false;
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validTo = new Date(promotion.validTo);
    return now >= validFrom && now <= validTo && promotion.isActive;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !promotion) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Không tìm thấy thông tin khuyến mãi'}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/promotions')}>
            Quay lại danh sách khuyến mãi
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/promotions')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Chi tiết khuyến mãi
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            {promotion.image && (
              <CardMedia
                component="img"
                height="300"
                image={promotion.image.startsWith('http') ? promotion.image : `http://localhost:5000${promotion.image}`}
                alt={promotion.title || promotion.name}
              />
            )}
            
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                  {promotion.title || promotion.name}
                </Typography>
                <Chip 
                  label={isPromotionValid() ? 'Đang áp dụng' : 'Hết hạn'}
                  color={isPromotionValid() ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="h5" color="primary" gutterBottom>
                Giảm {promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : `${promotion.discountValue.toLocaleString()} VNĐ`}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {promotion.description}
              </Typography>

              {promotion.conditions && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Điều kiện áp dụng
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {promotion.conditions}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalOfferIcon sx={{ mr: 1 }} />
              Thông tin khuyến mãi
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mã khuyến mãi
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {promotion.code}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Hiệu lực từ
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(promotion.validFrom)}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Hiệu lực đến
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(promotion.validTo)}
              </Typography>
            </Box>

            {promotion.minimumStay && promotion.minimumStay > 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Số đêm tối thiểu
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {promotion.minimumStay} đêm
                </Typography>
              </Box>
            )}

            {promotion.applicableRoomTypes && promotion.applicableRoomTypes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Loại phòng áp dụng
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {promotion.applicableRoomTypes.map((roomType, index) => (
                    <Chip 
                      key={index}
                      label={roomType === 'all' ? 'Tất cả loại phòng' : roomType}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đặt phòng ngay
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Áp dụng mã khuyến mãi này khi đặt phòng để được ưu đãi tốt nhất.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={() => navigate('/booking')}
              disabled={!isPromotionValid()}
            >
              {isPromotionValid() ? 'Đặt phòng ngay' : 'Khuyến mãi đã hết hạn'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PromotionDetail;