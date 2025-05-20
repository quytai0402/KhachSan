import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, parseISO } from 'date-fns';
import RoomCard from '../components/RoomCard';
import { roomAPI } from '../services/api';
import toastService from '../services/toastService';
import { formatVND, getVietnameseRoomType } from '../utils/formatCurrency';

const Rooms = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Filter state
  const [filters, setFilters] = useState({
    checkIn: searchParams.get('checkIn') ? parseISO(searchParams.get('checkIn')) : new Date(),
    checkOut: searchParams.get('checkOut') ? parseISO(searchParams.get('checkOut')) : addDays(new Date(), 1),
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')) : 1,
    priceRange: [0, 500], // Giá trị thanh trượt (0-500) tương ứng với 0-5.000.000 VND
    type: searchParams.get('type') || '',
    amenities: []
  });

  // Room state
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sort state
  const [sortOption, setSortOption] = useState('recommended');

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAllRooms();
        setRooms(response.data);
        setFilteredRooms(response.data);
        if (response.data.length === 0) {
          toastService.info('Hiện không có phòng nào khả dụng.');
        } else {
          toastService.success(`Tìm thấy ${response.data.length} phòng cho kỳ nghỉ của bạn.`);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        const errorMsg = 'Không thể tải thông tin phòng. Vui lòng thử lại sau.';
        setError(errorMsg);
        toastService.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Apply filters
  useEffect(() => {
    if (rooms.length === 0) return;
    
    let result = [...rooms];
    
    // Filter by type
    if (filters.type) {
      result = result.filter(room => room.type === filters.type);
    }
    
    // Filter by capacity (guests)
    if (filters.guests > 1) {
      result = result.filter(room => room.capacity >= filters.guests);
    }
    
    // Filter by price range - chuyển đổi giá trị thanh trượt thành VND
    result = result.filter(
      room => room.price >= filters.priceRange[0] * 10000 && room.price <= filters.priceRange[1] * 10000
    );
    
    // Filter by amenities
    if (filters.amenities.length > 0) {
      result = result.filter(room => 
        filters.amenities.every(amenity => 
          room.amenities?.includes(amenity)
        )
      );
    }
    
    // Filter by availability
    result = result.filter(room => room.status === 'available');
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'capacity':
        result.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'recommended':
      default:
        // Default sorting (could be based on ratings or other factors)
        break;
    }
    
    setFilteredRooms(result);
    
    // Show toast notification when filter changes yield significantly different results
    if (result.length === 0) {
      toastService.warning('Không có phòng nào phù hợp với bộ lọc hiện tại. Hãy điều chỉnh tiêu chí của bạn.');
    } else if (result.length < 3 && rooms.length > 5) {
      toastService.info(`Chỉ có ${result.length} phòng phù hợp với bộ lọc của bạn.`);
    }
  }, [rooms, filters, sortOption]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cập nhật hàm xử lý thay đổi giá để chuyển đổi từ giá trị thanh trượt sang giá tiền VND
  const handlePriceChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newValue
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => {
      const currentAmenities = [...prev.amenities];
      
      if (currentAmenities.includes(amenity)) {
        return {
          ...prev,
          amenities: currentAmenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenity]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
      guests: 1,
      priceRange: [0, 500], // Reset về khoảng giá 0-5.000.000 VND
      type: '',
      amenities: []
    });
    setSortOption('recommended');
    toastService.info('Bộ lọc đã được đặt lại.');
  };

  // Common amenities options
  const amenitiesOptions = [
    'Wi-Fi',
    'TV',
    'Điều hòa',
    'Bữa sáng',
    'Minibar',
    'Ban công',
    'Hướng biển',
    'Bồn tắm'
  ];
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Phòng & Suite
      </Typography>
      
      <Grid container spacing={4}>
        {/* Filter Section */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              position: { md: 'sticky' },
              top: { md: 24 },
              height: { md: 'fit-content' }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Bộ lọc
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nhận phòng / Trả phòng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Ngày nhận phòng"
                      value={filters.checkIn}
                      onChange={(newValue) => handleFilterChange('checkIn', newValue)}
                      disablePast
                      format="MM/dd/yyyy"
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Ngày trả phòng"
                      value={filters.checkOut}
                      onChange={(newValue) => handleFilterChange('checkOut', newValue)}
                      disablePast
                      format="MM/dd/yyyy"
                      minDate={addDays(filters.checkIn, 1)}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Khách
              </Typography>
              <TextField
                fullWidth
                label="Số lượng khách"
                type="number"
                variant="outlined"
                size="small"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', Math.max(1, parseInt(e.target.value) || 1))}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Loại phòng
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Loại</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Loại"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="standard">{getVietnameseRoomType('standard')}</MenuItem>
                  <MenuItem value="deluxe">{getVietnameseRoomType('deluxe')}</MenuItem>
                  <MenuItem value="suite">{getVietnameseRoomType('suite')}</MenuItem>
                  <MenuItem value="family">{getVietnameseRoomType('family')}</MenuItem>
                  <MenuItem value="single">{getVietnameseRoomType('single')}</MenuItem>
                  <MenuItem value="double">{getVietnameseRoomType('double')}</MenuItem>
                  <MenuItem value="twin">{getVietnameseRoomType('twin')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Khoảng giá (mỗi đêm)
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500}
                  step={10}
                  marks={[
                    { value: 0, label: '0₫' },
                    { value: 250, label: '2.500.000₫' },
                    { value: 500, label: '5.000.000₫' }
                  ]}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatVND(filters.priceRange[0] * 10000)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatVND(filters.priceRange[1] * 10000)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tiện nghi
              </Typography>
              <FormGroup>
                {amenitiesOptions.map((amenity, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox 
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        size="small"
                      />
                    }
                    label={amenity}
                  />
                ))}
              </FormGroup>
            </Box>
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={clearFilters}
              sx={{ mt: 2 }}
            >
              Xóa tất cả bộ lọc
            </Button>
          </Paper>
        </Grid>
        
        {/* Rooms Section */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography>
              Đã tìm thấy {filteredRooms.length} {filteredRooms.length === 1 ? 'phòng' : 'phòng'}
            </Typography>
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sắp xếp theo"
              >
                <MenuItem value="recommended">Đề xuất</MenuItem>
                <MenuItem value="price-low">Giá: Thấp đến Cao</MenuItem>
                <MenuItem value="price-high">Giá: Cao đến Thấp</MenuItem>
                <MenuItem value="capacity">Sức chứa</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Active filters */}
          {(filters.type || filters.amenities.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 500 || filters.guests > 1) && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                Bộ lọc đang áp dụng:
              </Typography>
              
              {filters.type && (
                <Chip 
                  label={`Loại: ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`}
                  onDelete={() => handleFilterChange('type', '')}
                  size="small"
                />
              )}
              
              {filters.guests > 1 && (
                <Chip 
                  label={`Khách: ${filters.guests}`}
                  onDelete={() => handleFilterChange('guests', 1)}
                  size="small"
                />
              )}
              
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
                <Chip 
                  label={`Giá: $${filters.priceRange[0]} - $${filters.priceRange[1]}`}
                  onDelete={() => handleFilterChange('priceRange', [0, 500])}
                  size="small"
                />
              )}
              
              {filters.amenities.map((amenity, index) => (
                <Chip 
                  key={index}
                  label={amenity}
                  onDelete={() => handleAmenityToggle(amenity)}
                  size="small"
                />
              ))}
            </Box>
          )}
          
          {/* Rooms grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
          ) : filteredRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" gutterBottom>
                Không có phòng nào phù hợp với tiêu chí của bạn
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hãy điều chỉnh bộ lọc để tìm phòng khả dụng
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 3 }}
                onClick={clearFilters}
              >
                Xóa tất cả bộ lọc
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredRooms.map((room) => (
                <Grid item xs={12} sm={6} lg={4} key={room._id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Rooms; 