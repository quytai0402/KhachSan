import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { toast } from 'react-toastify';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { promotionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const Promotions = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Promotions state
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    validUntil: '',
    discount: '',
    code: '',
    image: '',
    isActive: true
  });
  
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/promotions');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await promotionAPI.getAllPromotions();
        // Extract data from the new API format { success: true, data: [...] }
        const promotionsData = response.data?.data || response.data || [];
        setPromotions(promotionsData);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError('Failed to load promotions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchPromotions();
    }
  }, [isAuthenticated, user]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      title: '',
      description: '',
      validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      discount: '20%',  // Default discount
      code: '',
      image: null,
      isActive: true
    });
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (promotion) => {
    setSelectedPromotion(promotion);
    
    // Format promotion data for the form
    const discountStr = promotion.discountType === 'percentage' ? 
      `${promotion.discountValue}%` : 
      `${promotion.discountValue} VND`;
      
    setFormData({
      title: promotion.title || promotion.name || '',
      description: promotion.description || '',
      validUntil: promotion.validTo ? format(new Date(promotion.validTo), 'yyyy-MM-dd') : '',
      discount: promotion.discountPercent ? `${promotion.discountPercent}%` : discountStr,
      code: promotion.code || '',
      image: promotion.image || null,
      isActive: promotion.isActive !== false
    });
    
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setOpenDeleteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedPromotion(null);
  };
  
  // Add promotion
  const handleAddPromotion = async () => {
    try {
      setSubmitting(true);
      
      // Format data according to backend requirements
      const promotionData = {
        ...formData,
        // Convert title to name if needed
        name: formData.title,
        // Format discount as discountValue and discountType
        discountValue: parseInt(formData.discount.replace(/[^0-9]/g, '')),
        discountType: formData.discount.toLowerCase().includes('%') ? 'percentage' : 'fixed',
        // Format dates
        validFrom: new Date(),
        validTo: formData.validUntil === 'Ongoing' ? 
          new Date(new Date().getFullYear() + 1, 0, 1) : // One year from now if ongoing
          new Date(formData.validUntil)
      };
      
      const response = await promotionAPI.createPromotion(promotionData);
      setPromotions(prev => [...prev, response.data]);
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding promotion:', err);
      setError(err.response?.data?.message || 'Failed to add promotion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update promotion
  const handleUpdatePromotion = async () => {
    if (!selectedPromotion) return;
    
    try {
      setSubmitting(true);
      
      // Format data according to backend requirements
      const promotionData = {
        ...formData,
        // Convert title to name if needed
        name: formData.title,
        // Format discount as discountValue and discountType
        discountValue: parseInt(formData.discount.replace(/[^0-9]/g, '')),
        discountType: formData.discount.toLowerCase().includes('%') ? 'percentage' : 'fixed',
        // Format dates if necessary
        validTo: formData.validUntil === 'Ongoing' ? 
          new Date(new Date().getFullYear() + 1, 0, 1) : // One year from now if ongoing
          new Date(formData.validUntil)
      };
      
      const response = await promotionAPI.updatePromotion(selectedPromotion._id, promotionData);
      setPromotions(prev => 
        prev.map(promotion => 
          promotion._id === selectedPromotion._id ? response.data : promotion
        )
      );
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating promotion:', err);
      setError(err.response?.data?.message || 'Failed to update promotion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete promotion
  const handleDeletePromotion = async () => {
    if (!selectedPromotion) {
      setError("Không tìm thấy khuyến mãi để xóa");
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await promotionAPI.deletePromotion(selectedPromotion._id);
      
      if (response && response.data) {
        setPromotions(prev => prev.filter(promotion => promotion._id !== selectedPromotion._id));
        setError(null);
        toast.success(`Đã xóa khuyến mãi ${selectedPromotion.name} thành công`);
        handleCloseDialogs();
      } else {
        throw new Error("Không nhận được phản hồi từ máy chủ");
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete promotion. Please try again.';
      setError(errorMsg);
      toast.error(`Không thể xóa khuyến mãi: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh promotions
  const handleRefreshPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionAPI.getAllPromotions();
      setPromotions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing promotions:', err);
      setError('Failed to refresh promotions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if promotion is expired
  const isExpired = (validUntil) => {
    if (validUntil === 'Ongoing') return false;
    return new Date(validUntil) < new Date();
  };
  
  // Render loading state
  if (loading && promotions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quản Lý Khuyến Mãi
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefreshPromotions}
            sx={{ mr: 2 }}
          >
            Làm Mới
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAddDialog}
          >
            Thêm Khuyến Mãi
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Grid view for promotions */}
      <Grid container spacing={3}>
        {promotions.length > 0 ? (
          promotions.map((promotion) => {
            const expired = isExpired(promotion.validUntil);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={promotion._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  opacity: expired ? 0.7 : 1
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={promotion.image ? `http://localhost:5000${promotion.image}` : 'https://via.placeholder.com/300x140?text=Promotion+Image'}
                    alt={promotion.title}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {promotion.title}
                      </Typography>
                      <Chip 
                        label={promotion.discount}
                        color="error"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {promotion.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color={expired ? 'error.main' : 'text.secondary'}>
                        {expired ? 'Đã hết hạn: ' : 'Có hiệu lực đến: '}{promotion.validUntil}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="subtitle2">
                        Mã khuyến mãi: <strong>{promotion.code}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(promotion)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(promotion)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {expired && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      Đã hết hạn
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Không tìm thấy khuyến mãi nào. Thêm khuyến mãi để bắt đầu.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Add Promotion Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Khuyến Mãi Mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tên Khuyến Mãi"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mô Tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                fullWidth
                required
                placeholder="e.g. 20% OFF"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Promo Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Có Hiệu Lực Đến"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Định dạng: YYYY-MM-DD"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCameraIcon />}
                sx={{ height: '56px', textTransform: 'none' }}
              >
                Tải Ảnh Lên
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData(prev => ({
                        ...prev,
                        image: e.target.files[0]
                      }));
                    }
                  }}
                />
              </Button>
              {formData.image && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {formData.image instanceof File ? 
                    `Selected: ${formData.image.name}` : 
                    `Current image: ${formData.image}`}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleAddPromotion} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Thêm Khuyến Mãi'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Promotion Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh Sửa Khuyến Mãi</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tên Khuyến Mãi"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mô Tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                fullWidth
                required
                placeholder="e.g. 20% OFF"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Promo Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Có Hiệu Lực Đến"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Định dạng: YYYY-MM-DD"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCameraIcon />}
                sx={{ height: '56px', textTransform: 'none' }}
              >
                Cập Nhật Ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData(prev => ({
                        ...prev,
                        image: e.target.files[0]
                      }));
                    }
                  }}
                />
              </Button>
              {formData.image && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {formData.image instanceof File ? 
                    `Selected: ${formData.image.name}` : 
                    `Current image: ${formData.image}`}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdatePromotion} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Cập Nhật Khuyến Mãi'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Promotion Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xóa Khuyến Mãi</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa khuyến mãi "{selectedPromotion?.title}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePromotion} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(Promotions, "Quản Lý Khuyến Mãi");