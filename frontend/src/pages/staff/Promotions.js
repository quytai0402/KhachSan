import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  LocalOffer as LocalOfferIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import axios from 'axios';

// Sample promotions data for the UI
const samplePromotions = [
  {
    _id: 'p1',
    title: 'Ưu đãi Nghỉ dưỡng Cuối tuần',
    description: 'Giảm 20% cho đặt phòng vào cuối tuần. Áp dụng cho tất cả các loại phòng.',
    discountType: 'percentage',
    discountValue: 20,
    code: 'WEEKEND20',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-07-31T23:59:59Z',
    status: 'active',
    minStay: 2,
    conditions: 'Chỉ áp dụng cho đặt phòng từ thứ 6 đến Chủ nhật',
    createdAt: '2025-04-01T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'
  },
  {
    _id: 'p2',
    title: 'Ưu đãi Kỳ nghỉ Hè',
    description: 'Giảm 15% cho tất cả các đặt phòng trong mùa hè. Thêm bữa sáng miễn phí cho 2 người.',
    discountType: 'percentage',
    discountValue: 15,
    code: 'SUMMER15',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    status: 'active',
    minStay: 3,
    conditions: 'Áp dụng cho đặt phòng từ 3 đêm trở lên',
    createdAt: '2025-04-15T14:30:00Z',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop'
  },
  {
    _id: 'p3',
    title: 'Đặt sớm - Tiết kiệm nhiều',
    description: 'Giảm 100,000 VNĐ cho mỗi đêm khi đặt phòng trước 30 ngày. Không hoàn hủy.',
    discountType: 'fixed',
    discountValue: 100000,
    code: 'EARLY30',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'active',
    minStay: 1,
    conditions: 'Đặt trước ít nhất 30 ngày, không áp dụng hoàn hủy',
    createdAt: '2025-04-20T09:15:00Z',
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    _id: 'p4',
    title: 'Gói Trăng mật',
    description: 'Giảm 25% cho phòng hạng sang và bao gồm bữa tối lãng mạn, dịch vụ Spa cho các cặp đôi.',
    discountType: 'percentage',
    discountValue: 25,
    code: 'HONEY25',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-09-30T23:59:59Z',
    status: 'active',
    minStay: 2,
    conditions: 'Chỉ áp dụng cho phòng hạng sang và phải đặt trước ít nhất 7 ngày',
    createdAt: '2025-05-01T11:45:00Z',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop'
  },
  {
    _id: 'p5',
    title: 'Ưu đãi Doanh nghiệp',
    description: 'Giảm 10% cho đặt phòng của doanh nghiệp. Áp dụng cho nhóm từ 5 phòng trở lên.',
    discountType: 'percentage',
    discountValue: 10,
    code: 'CORP10',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'active',
    minStay: 1,
    conditions: 'Chỉ áp dụng cho đặt phòng doanh nghiệp với ít nhất 5 phòng',
    createdAt: '2024-12-15T15:20:00Z',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000&auto=format&fit=crop'
  },
  {
    _id: 'p6',
    title: 'Ưu đãi dài hạn',
    description: 'Giảm 30% cho lưu trú từ 14 đêm trở lên. Bao gồm dịch vụ giặt là miễn phí.',
    discountType: 'percentage',
    discountValue: 30,
    code: 'LONG30',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    status: 'inactive',
    minStay: 14,
    conditions: 'Chỉ áp dụng cho lưu trú từ 14 đêm trở lên',
    createdAt: '2025-01-05T10:10:00Z',
    image: 'https://images.unsplash.com/photo-1562133567-b6a0a9c7e6eb?q=80&w=1000&auto=format&fit=crop'
  }
];

const StaffPromotions = () => {
  const [promotions, setPromotions] = useState(samplePromotions);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    filterPromotions();
  }, [promotions, searchTerm, statusFilter]);
  
  const filterPromotions = () => {
    let filtered = [...promotions];
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        promo => 
          promo.title.toLowerCase().includes(lowerSearchTerm) || 
          promo.code.toLowerCase().includes(lowerSearchTerm) ||
          promo.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(promo => promo.status === statusFilter);
    }
    
    setFilteredPromotions(filtered);
  };
  
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call to fetch promotions
    setTimeout(() => {
      setLoading(false);
      toast.success('Danh sách khuyến mãi đã được cập nhật');
    }, 1000);
  };
  
  const handleOpenDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromotion(null);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Đang áp dụng" color="success" size="small" />;
      case 'inactive':
        return <Chip label="Không áp dụng" color="default" size="small" />;
      case 'upcoming':
        return <Chip label="Sắp tới" color="info" size="small" />;
      case 'expired':
        return <Chip label="Hết hạn" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  const formatDiscount = (type, value) => {
    return type === 'percentage' ? `${value}%` : `${value.toLocaleString('vi-VN')} VNĐ`;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Khuyến Mãi
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Tìm kiếm khuyến mãi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang áp dụng</MenuItem>
                <MenuItem value="inactive">Không áp dụng</MenuItem>
                <MenuItem value="upcoming">Sắp tới</MenuItem>
                <MenuItem value="expired">Hết hạn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={5} sx={{ display: 'flex', justifyContent: { xs: 'left', md: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPromotions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Không tìm thấy khuyến mãi nào</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredPromotions.map((promotion) => (
              <Grid item xs={12} sm={6} md={4} key={promotion._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={promotion.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'}
                    alt={promotion.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {promotion.title}
                      </Typography>
                      {getStatusChip(promotion.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      {promotion.description.length > 100 
                        ? `${promotion.description.substring(0, 100)}...` 
                        : promotion.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        icon={<LocalOfferIcon fontSize="small" />} 
                        label={`Giảm ${formatDiscount(promotion.discountType, promotion.discountValue)}`} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip label={`Mã: ${promotion.code}`} variant="outlined" size="small" />
                    </Box>
                    <Typography variant="body2">
                      <strong>Hiệu lực:</strong> {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<InfoIcon />}
                      onClick={() => handleOpenDetails(promotion)}
                      fullWidth
                    >
                      Xem chi tiết
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Promotion Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedPromotion && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" component="div">
                {selectedPromotion.title}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getStatusChip(selectedPromotion.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body1" gutterBottom>
                  {selectedPromotion.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mã khuyến mãi
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedPromotion.code}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mức giảm giá
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDiscount(selectedPromotion.discountType, selectedPromotion.discountValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian bắt đầu
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPromotion.startDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian kết thúc
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPromotion.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Điều kiện áp dụng
                    </Typography>
                    <Typography variant="body1">
                      {selectedPromotion.conditions}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số đêm tối thiểu
                    </Typography>
                    <Typography variant="body1">
                      {selectedPromotion.minStay} đêm
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StaffPromotions;
