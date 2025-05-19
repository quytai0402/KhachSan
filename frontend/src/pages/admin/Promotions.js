import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon
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
        setPromotions(response.data);
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
      discount: '',
      code: '',
      image: '',
      isActive: true
    });
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      validUntil: promotion.validUntil || '',
      discount: promotion.discount || '',
      code: promotion.code || '',
      image: promotion.image || '',
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
      const response = await promotionAPI.createPromotion(formData);
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
      const response = await promotionAPI.updatePromotion(selectedPromotion._id, formData);
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
    if (!selectedPromotion) return;
    
    try {
      setSubmitting(true);
      await promotionAPI.deletePromotion(selectedPromotion._id);
      setPromotions(prev => prev.filter(promotion => promotion._id !== selectedPromotion._id));
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError(err.response?.data?.message || 'Failed to delete promotion. Please try again.');
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                    image={promotion.image || 'https://via.placeholder.com/300x140?text=Promotion+Image'}
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
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(promotion)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
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
        <DialogTitle>Add New Promotion</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Promotion Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
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
                label="Valid Until"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                fullWidth
                required
                placeholder="YYYY-MM-DD or 'Ongoing'"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPromotion} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Promotion'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Promotion Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Promotion</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Promotion Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
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
                label="Valid Until"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                fullWidth
                required
                placeholder="YYYY-MM-DD or 'Ongoing'"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePromotion} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Update Promotion'}
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
    </Container>
  );
};

export default Promotions; 