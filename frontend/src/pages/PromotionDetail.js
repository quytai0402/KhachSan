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
  Info as InfoIcon,
  Hotel as HotelIcon
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          onClick={() => navigate('/promotions')} 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ 
            borderRadius: '12px',
            borderWidth: 2,
            px: 2,
            py: 1,
            fontWeight: 600,
            mr: 3,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: 'rgba(30, 78, 140, 0.04)'
            }
          }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1" fontWeight={700} color="primary.dark">
          Chi tiết khuyến mãi
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            mb: 3, 
            borderRadius: '20px', 
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            {promotion.image && (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="360"
                  image={promotion.image.startsWith('http') ? promotion.image : `http://localhost:5000${promotion.image}`}
                  alt={promotion.title || promotion.name}
                  sx={{ 
                    objectFit: 'cover',
                    filter: 'brightness(0.95)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    borderRadius: '50px',
                    padding: '10px 24px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {promotion.discountType === 'percentage' ? 
                    `Giảm ${promotion.discountValue}%` : 
                    `Giảm ${promotion.discountValue.toLocaleString()} VNĐ`
                  }
                </Box>
              </Box>
            )}
            
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    color: 'primary.dark',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
                  }}
                >
                  {promotion.title || promotion.name}
                </Typography>
                <Chip 
                  label={isPromotionValid() ? 'Đang áp dụng' : 'Hết hạn'}
                  color={isPromotionValid() ? 'success' : 'error'}
                  variant="filled"
                  size="large"
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 1,
                    fontSize: '0.9rem',
                    borderRadius: '8px'
                  }}
                />
              </Box>

              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                p: 2, 
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: '1px dashed',
                borderColor: 'primary.light'
              }}>
                <EventIcon sx={{ fontSize: '1.7rem', color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Thời hạn ưu đãi:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(promotion.validFrom)} - {formatDate(promotion.validTo)}
                  </Typography>
                </Box>
              </Box>

              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  fontSize: '1.1rem', 
                  lineHeight: 1.8,
                  color: 'text.primary',
                  mb: 4,
                  textAlign: 'justify'
                }}
              >
                {promotion.description}
              </Typography>

              {promotion.conditions && (
                <Box sx={{ 
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'rgba(30, 78, 140, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    Điều kiện áp dụng
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {promotion.conditions}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h6" gutterBottom fontWeight={700} sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'primary.dark', 
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <LocalOfferIcon sx={{ mr: 1 }} />
              Thông tin khuyến mãi
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                MÃ KHUYẾN MÃI
              </Typography>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'primary.dark',
                color: 'white'
              }}>
                <Typography variant="h5" fontFamily="monospace" letterSpacing={2} fontWeight={700}>
                  {promotion.code}
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  sx={{ 
                    borderRadius: '8px',
                    minWidth: 0,
                    px: 2,
                    fontWeight: 600,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(promotion.code);
                    alert('Mã khuyến mãi đã được sao chép!');
                  }}
                >
                  Sao chép
                </Button>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Hiệu lực từ
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(promotion.validFrom)}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  width: '1px', 
                  height: '30px', 
                  backgroundColor: 'divider',
                  mx: 2
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Hiệu lực đến
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(promotion.validTo)}
                </Typography>
              </Box>
            </Box>

            {promotion.minimumStay && promotion.minimumStay > 1 && (
              <Box sx={{ 
                p: 2, 
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,0.015)',
                border: '1px solid',
                borderColor: 'divider',
                mt: 3
              }}>
                <Box 
                  sx={{
                    mr: 2,
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.light',
                    color: 'primary.main'
                  }}
                >
                  <HotelIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    Số đêm tối thiểu
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ color: 'primary.dark' }}>
                    {promotion.minimumStay} đêm
                  </Typography>
                </Box>
              </Box>
            )}

            {promotion.applicableRoomTypes && promotion.applicableRoomTypes.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
                  LOẠI PHÒNG ÁP DỤNG
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.015)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                  {promotion.applicableRoomTypes.map((roomType, index) => (
                    <Chip 
                      key={index}
                      label={roomType === 'all' ? 'Tất cả loại phòng' : roomType}
                      color="primary"
                      variant="outlined"
                      size="medium"
                      sx={{ 
                        borderRadius: '8px', 
                        fontWeight: 500,
                        borderWidth: roomType === 'all' ? 2 : 1,
                        backgroundColor: roomType === 'all' ? 'rgba(30, 78, 140, 0.08)' : 'transparent'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e4e8c 0%, #3071d9 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(30, 78, 140, 0.3)'
          }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Đặt phòng ngay
            </Typography>
            <Typography variant="body1" paragraph sx={{ opacity: 0.9, mb: 3 }}>
              Sử dụng mã khuyến mãi này khi đặt phòng để được hưởng ưu đãi tốt nhất cho kỳ nghỉ của bạn.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              size="large"
              onClick={() => navigate('/booking')}
              disabled={!isPromotionValid()}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '10px',
                boxShadow: '0 6px 15px rgba(230, 126, 34, 0.3)',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(230, 126, 34, 0.4)',
                  transform: 'translateY(-3px)'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                },
                transition: 'all 0.3s ease'
              }}
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