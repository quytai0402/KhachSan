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
  const [features, setFeatures] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both features and services
        const [featuresResponse, servicesResponse] = await Promise.all([
          serviceAPI.getFeatures(),
          serviceAPI.getAllServices()
        ]);
        
        // Handle features data
        const featuresData = featuresResponse.data?.data || featuresResponse.data || [];
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        
        // Handle services data  
        const servicesData = servicesResponse.data?.data || servicesResponse.data || [];
        setServices(Array.isArray(servicesData) ? servicesData.filter(s => s.isAvailable !== false) : []);
        
      } catch (err) {
        console.error('Error fetching services data:', err);
        setError('Không thể tải dịch vụ. Vui lòng thử lại sau.');
        setFeatures([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  // Function to get icon component based on icon name or type
  const getServiceIcon = (iconName, type) => {
    const iconType = iconName || type;
    switch (iconType) {
      case 'spa':
        return <SpaOutlined fontSize="large" />;
      case 'dining':
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
      case 'room':
      case 'roomservice':
        return <LocalLaundryServiceOutlined fontSize="large" />;
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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" color="error" gutterBottom>{error}</Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Thử Lại
          </Button>
        </Box>
      </Container>
    );
  }

  // Handle empty services case
  if ((!features || features.length === 0) && (!services || services.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" gutterBottom>
            Dịch Vụ Của Chúng Tôi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Hiện tại chưa có dịch vụ nào được cung cấp.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm thông tin.
          </Typography>
          <Button 
            variant="contained" 
            href="/contact"
            sx={{ mt: 3 }}
          >
            Liên Hệ Chúng Tôi
          </Button>
        </Box>
      </Container>
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
        {/* Display Features first */}
        {features.length > 0 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>
                Tiện Nghi Khách Sạn
              </Typography>
            </Grid>
            {features.map((feature) => (
              <Grid item xs={12} md={6} key={`feature-${feature._id || feature.id}`}>
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
                  <Box sx={{
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 200, sm: '100%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}>
                    {getServiceIcon(feature.icon, feature.type)}
                  </Box>
                  <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {feature.description}
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
          </>
        )}

        {/* Display Services (with pricing) */}
        {services.length > 0 && (
          <>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: features.length > 0 ? 4 : 2, mb: 2 }}>
                Dịch Vụ Có Tính Phí
              </Typography>
            </Grid>
            {services.map((service) => (
              <Grid item xs={12} md={6} key={`service-${service._id || service.id}`}>
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
                  {service.image ? (
                    <CardMedia
                      component="img"
                      sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: '100%' } }}
                      image={service.image}
                      alt={service.name}
                    />
                  ) : (
                    <Box sx={{
                      width: { xs: '100%', sm: 200 },
                      height: { xs: 200, sm: '100%' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'secondary.main',
                      color: 'white'
                    }}>
                      {getServiceIcon(service.icon, service.category)}
                    </Box>
                  )}
                  <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {service.name}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button size="small" color="primary">
                        Đặt Dịch Vụ
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Danh mục: {service.category}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
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