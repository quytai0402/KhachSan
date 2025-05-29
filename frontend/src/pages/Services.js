import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import {
  SpaOutlined,
  RestaurantOutlined,
  LocalParkingOutlined,
  WifiOutlined,
  FitnessCenterOutlined,
  PoolOutlined,
  LocalLaundryServiceOutlined,
  AirportShuttleOutlined
} from '@mui/icons-material';
import { serviceAPI } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceAPI.getAllServices();
        setServices(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Không thể tải dịch vụ');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Function to get icon component based on icon name
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'spa':
        return <SpaOutlined fontSize="large" />;
      case 'restaurant':
        return <RestaurantOutlined fontSize="large" />;
      case 'parking':
        return <LocalParkingOutlined fontSize="large" />;
      case 'wifi':
        return <WifiOutlined fontSize="large" />;
      case 'fitness':
        return <FitnessCenterOutlined fontSize="large" />;
      case 'pool':
        return <PoolOutlined fontSize="large" />;
      case 'laundry':
        return <LocalLaundryServiceOutlined fontSize="large" />;
      case 'shuttle':
        return <AirportShuttleOutlined fontSize="large" />;
      default:
        return <SpaOutlined fontSize="large" />;
    }
  };

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
          Dịch Vụ Của Chúng Tôi
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Trải nghiệm các tiện nghi và dịch vụ tuyệt vời được thiết kế để làm cho kỳ nghỉ của bạn thực sự đặc biệt.
          Từ các liệu pháp spa thư giãn đến ẩm thực tinh tế, chúng tôi cung cấp mọi thứ bạn cần cho một trải nghiệm đáng nhớ.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service._id || service.id}>
            <Card sx={{ 
              display: 'flex', 
              flexDirection: {xs: 'column', sm: 'row'},
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 200, sm: '100%' }
                }}
                image={service.image}
                alt={service.title}
              />
              <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {getServiceIcon(service.icon)}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {service.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Button size="small" color="primary">
                    Tìm Hiểu Thêm
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Bạn Cần Điều Gì Đặc Biệt?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Chúng tôi luôn sẵn sàng đáp ứng các yêu cầu đặc biệt để làm cho kỳ nghỉ của bạn hoàn hảo.
        </Typography>
        <Button variant="contained" size="large" href="/contact">
          Liên Hệ Chúng Tôi
        </Button>
      </Box>
    </Container>
  );
};

export default Services; 