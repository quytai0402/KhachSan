import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Rating,
  styled,
  Skeleton,
  useTheme,
  useMediaQuery,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import axios from 'axios';

import HotelIcon from '@mui/icons-material/Hotel';
import SpaIcon from '@mui/icons-material/Spa';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PoolIcon from '@mui/icons-material/Pool';

import RoomCard from '../components/RoomCard';

const heroImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

const SearchFormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 10,
  marginTop: -40,
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  [theme.breakpoints.down('md')]: {
    marginTop: -20,
    padding: theme.spacing(2),
  },
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: 30,
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 28,
    left: 20,
    width: 40,
    height: 40,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%231e4e8c15\'%3E%3Cpath d=\'M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144-.377.13-.892.354-1.432.623-.543.226-1.193.478-1.813.894-.344.209-.645.473-.952.754-.239.29-.527.526-.739.876-.255.325-.537.612-.754.976-.219.323-.376.684-.513 1.037-.148.353-.29.684-.36 1.037-.107.348-.168.635-.168.635l.003.021c-.17.21-.03.43-.03.653 0 2.306 1.794 4.1 4.1 4.1 2.306 0 4.1-1.794 4.1-4.1S8.806 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L19.758 4.03c0 0-.218.052-.597.144-.377.13-.892.354-1.432.623-.543.226-1.193.478-1.813.894-.344.209-.645.473-.952.754-.239.29-.527.526-.739.876-.255.325-.537.612-.754.976-.219.323-.376.684-.513 1.037-.148.353-.29.684-.36 1.037-.107.348-.168.635-.168.635l.003.021c-.17.21-.03.43-.03.653 0 2.306 1.794 4.1 4.1 4.1 2.306 0 4.1-1.794 4.1-4.1S19.806 10 17.5 10z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    opacity: 0.5,
  }
}));

const PromotionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  overflow: 'hidden',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
  }
}));

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  // Variables for responsive design - we'll use them in the JSX
  // eslint-disable-next-line no-unused-vars
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm')); 
  // eslint-disable-next-line no-unused-vars
  const isTabletView = useMediaQuery(theme.breakpoints.down('md'));
  
  // Search form state
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 1));
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState('');

  // Generate realistic example rooms if no real rooms are found
  const generateExampleRooms = () => {
    return [
      {
        _id: 'example1',
        roomNumber: '101',
        type: 'deluxe',
        status: 'available',
        capacity: 2,
        price: 1800000,
        size: 32,
        amenities: ['Wifi', 'TV', 'Điều hòa', 'Mini bar', 'Két sắt'],
        description: 'Phòng Deluxe sang trọng với không gian rộng rãi, thiết kế hiện đại và ban công riêng nhìn ra thành phố.',
      },
      {
        _id: 'example2',
        roomNumber: '205',
        type: 'suite',
        status: 'available',
        capacity: 4,
        price: 3500000,
        size: 55,
        amenities: ['Wifi', 'TV', 'Điều hòa', 'Mini bar', 'Bồn tắm', 'Phòng khách'],
        description: 'Phòng Suite cao cấp với phòng khách riêng biệt, phòng ngủ rộng rãi và tầm nhìn panorama đẹp mắt.',
      },
      {
        _id: 'example3',
        roomNumber: '308',
        type: 'family',
        status: 'available',
        capacity: 5,
        price: 2500000,
        size: 45,
        amenities: ['Wifi', 'TV', 'Điều hòa', 'Tủ lạnh', '2 phòng ngủ'],
        description: 'Phòng Gia Đình lý tưởng với 2 phòng ngủ liền kề, thích hợp cho gia đình có trẻ em.',
      },
      {
        _id: 'example4',
        roomNumber: '412',
        type: 'twin',
        status: 'available',
        capacity: 2,
        price: 1500000,
        size: 30,
        amenities: ['Wifi', 'TV', 'Điều hòa', 'Bàn làm việc', '2 giường đơn'],
        description: 'Phòng Twin với hai giường đơn tiện nghi, trang bị đầy đủ tiện nghi hiện đại.',
      }
    ];
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Load featured rooms
        const roomsResponse = await axios.get(`${API_URL}/api/rooms/featured`);
        if (roomsResponse.data && roomsResponse.data.length > 0) {
          setFeaturedRooms(roomsResponse.data);
        } else {
          // If no real rooms found, use example rooms
          setFeaturedRooms(generateExampleRooms());
        }
        
        // Load promotions
        const promotionsResponse = await axios.get(`${API_URL}/api/promotions`);
        setPromotions(promotionsResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setFeaturedRooms(generateExampleRooms()); // Use example rooms on error
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    searchParams.append('checkIn', format(checkIn, 'yyyy-MM-dd'));
    searchParams.append('checkOut', format(checkOut, 'yyyy-MM-dd'));
    searchParams.append('guests', guests);
    if (roomType) searchParams.append('roomType', roomType);
    
    navigate(`/rooms?${searchParams.toString()}`);
  };

  // Example services data
  const hotelServices = [
    { 
      icon: <HotelIcon />, 
      title: 'Phòng Cao Cấp', 
      description: 'Các loại phòng nghỉ sang trọng với nội thất hiện đại, đem đến trải nghiệm lưu trú tuyệt vời.' 
    },
    { 
      icon: <LocalDiningIcon />, 
      title: 'Nhà Hàng', 
      description: 'Thưởng thức ẩm thực đa dạng từ các đầu bếp hàng đầu trong không gian tinh tế.' 
    },
    { 
      icon: <SpaIcon />, 
      title: 'Spa & Wellness', 
      description: 'Dịch vụ spa chất lượng cao giúp thư giãn và phục hồi năng lượng tuyệt vời.' 
    },
    { 
      icon: <PoolIcon />, 
      title: 'Hồ Bơi', 
      description: 'Hồ bơi vô cực với tầm nhìn tuyệt đẹp, mang đến trải nghiệm nghỉ dưỡng hoàn hảo.' 
    },
  ];

  // Example testimonials
  const testimonials = [
    {
      text: 'Khách sạn tuyệt vời với dịch vụ chuyên nghiệp. Phòng nghỉ rộng rãi và sạch sẽ. Tôi sẽ quay lại lần sau!',
      author: 'Nguyễn Văn A',
      position: 'Doanh nhân',
      rating: 5
    },
    {
      text: 'Chúng tôi đã có kỳ nghỉ tuyệt vời tại đây. Đặc biệt ấn tượng với nhà hàng và dịch vụ phòng.',
      author: 'Trần Thị B',
      position: 'Giáo viên',
      rating: 4.5
    },
    {
      text: 'Vị trí thuận tiện, phòng nghỉ sang trọng và nhân viên thân thiện. Đáng giá từng đồng bỏ ra.',
      author: 'Lê Văn C',
      position: 'Kỹ sư',
      rating: 5
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: { xs: '80vh', md: '90vh' },
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.9)',
            animation: 'zoomEffect 20s infinite alternate',
            '@keyframes zoomEffect': {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.1)' }
            }
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              height: '100%',
              color: 'white',
              pt: { xs: 10, md: 0 }
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Trải Nghiệm Nghỉ Dưỡng <br/> Đẳng Cấp Năm Sao
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                maxWidth: '600px',
                fontWeight: 400,
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Khám phá không gian nghỉ dưỡng sang trọng với các tiện nghi hiện đại và dịch vụ chu đáo tại Luxury Hotel
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large" 
                component={RouterLink} 
                to="/rooms"
                sx={{ 
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(230, 126, 34, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(230, 126, 34, 0.6)',
                  }
                }}
              >
                Đặt Phòng Ngay
              </Button>
              
              <Button 
                variant="outlined" 
                size="large" 
                component={RouterLink} 
                to="/services"
                sx={{ 
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Khám Phá Dịch Vụ
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Search Form Section */}
      <Container maxWidth="lg">
        <SearchFormPaper elevation={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày nhận phòng"
                  value={checkIn}
                  onChange={(newValue) => setCheckIn(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày trả phòng"
                  value={checkOut}
                  onChange={(newValue) => setCheckOut(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                  minDate={addDays(checkIn, 1)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Số khách</InputLabel>
                <Select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  label="Số khách"
                  startAdornment={<PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  {[1,2,3,4,5,6].map((num) => (
                    <MenuItem key={num} value={num}>{num} khách</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Loại phòng</InputLabel>
                <Select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  label="Loại phòng"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="single">Phòng Đơn</MenuItem>
                  <MenuItem value="double">Phòng Đôi</MenuItem>
                  <MenuItem value="twin">Phòng Twin</MenuItem>
                  <MenuItem value="suite">Phòng Suite</MenuItem>
                  <MenuItem value="family">Phòng Gia Đình</MenuItem>
                  <MenuItem value="deluxe">Phòng Deluxe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                size="large"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: '8px',
                }}
              >
                Tìm Kiếm
              </Button>
            </Grid>
          </Grid>
        </SearchFormPaper>
      </Container>

      {/* Featured Rooms Section */}
      <Box sx={{ py: 8, bgcolor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.5rem' } 
              }}
            >
              Phòng Nổi Bật
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' } 
              }}
            >
              Khám phá các loại phòng cao cấp với tiện nghi hiện đại và dịch vụ đẳng cấp
            </Typography>
          </Box>

          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                  <Box sx={{ pt: 1.5 }}>
                    <Skeleton variant="text" width="80%" height={40} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
          ) : featuredRooms.length > 0 ? (
            <Grid container spacing={4}>
              {featuredRooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Hiện không có phòng nào khả dụng. Vui lòng quay lại sau.
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink} 
              to="/rooms"
              size="large"
              sx={{
                borderRadius: 8,
                px: 4,
                py: 1,
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Xem Tất Cả Phòng
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.5rem' } 
              }}
            >
              Dịch Vụ Của Chúng Tôi
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' } 
              }}
            >
              Trải nghiệm dịch vụ đẳng cấp 5 sao với đội ngũ nhân viên chuyên nghiệp
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {hotelServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ServiceCard>
                  <IconWrapper>
                    {service.icon}
                  </IconWrapper>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {service.description}
                  </Typography>
                </ServiceCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink} 
              to="/services"
              size="large"
              sx={{
                borderRadius: 8,
                px: 4,
                py: 1,
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Khám Phá Thêm
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Promotions Section */}
      <Box sx={{ py: 8, bgcolor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.5rem' } 
              }}
            >
              Ưu Đãi Đặc Biệt
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' } 
              }}
            >
              Khám phá các gói ưu đãi hấp dẫn cho kỳ nghỉ của bạn
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading ? (
              [1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  <Box sx={{ pt: 1.5 }}>
                    <Skeleton variant="text" width="80%" height={40} />
                    <Skeleton variant="text" width="90%" />
                  </Box>
                </Grid>
              ))
            ) : promotions && promotions.length > 0 ? (
              promotions.map((promo) => (
                <Grid item xs={12} md={4} key={promo._id}>
                  <PromotionCard>
                    <CardMedia
                      component="img"
                      sx={{ width: 180 }}
                      image={promo.image || 'https://source.unsplash.com/random/300x200/?hotel'}
                      alt={promo.title}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Chip 
                        label={`Tiết kiệm ${promo.discountPercent}%`} 
                        color="secondary" 
                        size="small" 
                        sx={{ alignSelf: 'flex-start', mb: 1 }}
                      />
                      <Typography component="div" variant="h6" fontWeight={600}>
                        {promo.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {promo.description?.slice(0, 100)}...
                      </Typography>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/promotions/${promo._id}`}
                        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
                      >
                        Xem chi tiết
                      </Button>
                    </Box>
                  </PromotionCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Hiện không có ưu đãi nào khả dụng
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Vui lòng quay lại sau để cập nhật các chương trình khuyến mãi mới nhất
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink} 
              to="/promotions"
              size="large"
              sx={{
                borderRadius: 8,
                px: 4,
                py: 1,
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Xem Tất Cả Ưu Đãi
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.5rem' } 
              }}
            >
              Khách Hàng Nói Gì Về Chúng Tôi
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' } 
              }}
            >
              Những đánh giá chân thực từ khách hàng đã trải nghiệm dịch vụ của chúng tôi
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialCard>
                  <Rating value={testimonial.rating} precision={0.5} readOnly sx={{ mb: 2 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3, 
                      fontStyle: 'italic', 
                      minHeight: 100,
                      color: 'text.secondary'
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 45, height: 45 }}>
                      {testimonial.author.charAt(0)}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {testimonial.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.position}
                      </Typography>
                    </Box>
                  </Box>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10, 
          backgroundImage: 'linear-gradient(135deg, #1e4e8c 0%, #3a8eff 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 3 }}>
              Sẵn Sàng Đặt Phòng Cho Kỳ Nghỉ Của Bạn?
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9 }}>
              Trải nghiệm dịch vụ lưu trú đẳng cấp 5 sao với đội ngũ nhân viên chuyên nghiệp và nhiều tiện ích hiện đại
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/rooms"
              sx={{
                px: 6,
                py: 2,
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 15px 25px rgba(0,0,0,0.2)',
                }
              }}
            >
              Đặt Phòng Ngay
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;