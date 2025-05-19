import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { withDashboardLayout } from '../../utils/layoutHelpers';

const Services = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Services state
  const [services, setServices] = useState([]);
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
    icon: '',
    image: '',
    isActive: true
  });
  
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/services');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceAPI.getAllServices();
        setServices(response.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchServices();
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
      icon: '',
      image: '',
      isActive: true
    });
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
      image: service.image || '',
      isActive: service.isActive !== false
    });
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (service) => {
    setSelectedService(service);
    setOpenDeleteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedService(null);
  };
  
  // Add service
  const handleAddService = async () => {
    try {
      setSubmitting(true);
      const response = await serviceAPI.createService(formData);
      setServices(prev => [...prev, response.data]);
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.response?.data?.message || 'Failed to add service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update service
  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    try {
      setSubmitting(true);
      const response = await serviceAPI.updateService(selectedService._id, formData);
      setServices(prev => 
        prev.map(service => 
          service._id === selectedService._id ? response.data : service
        )
      );
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || 'Failed to update service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete service
  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      setSubmitting(true);
      await serviceAPI.deleteService(selectedService._id);
      setServices(prev => prev.filter(service => service._id !== selectedService._id));
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.message || 'Failed to delete service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh services
  const handleRefreshServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getAllServices();
      setServices(response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing services:', err);
      setError('Failed to refresh services. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading && services.length === 0) {
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
          Quản Lý Dịch Vụ
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefreshServices}
            sx={{ mr: 2 }}
          >
            Làm Mới
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAddDialog}
          >
            Thêm Dịch Vụ
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Grid view for services */}
      <Grid container spacing={3}>
        {services.length > 0 ? (
          services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={service.image || 'https://via.placeholder.com/300x140?text=Service+Image'}
                  alt={service.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Edit">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenEditDialog(service)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(service)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                {!service.isActive && (
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
                    Inactive
                  </Box>
                )}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Không tìm thấy dịch vụ nào. Thêm một dịch vụ để bắt đầu.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Add Service Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Dịch Vụ Mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tiêu Đề Dịch Vụ"
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
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên Biểu Tượng (Material Icon)"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                fullWidth
                helperText="VD: SpaOutlined, RestaurantOutlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="URL Hình Ảnh"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                required
                helperText="Nhập URL hình ảnh hợp lệ"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleAddService} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Thêm Dịch Vụ'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh Sửa Dịch Vụ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tiêu Đề Dịch Vụ"
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
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên Biểu Tượng (Material Icon)"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                fullWidth
                helperText="VD: SpaOutlined, RestaurantOutlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="URL Hình Ảnh"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                required
                helperText="Nhập URL hình ảnh hợp lệ"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateService} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Cập Nhật Dịch Vụ'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Service Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xóa Dịch Vụ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa dịch vụ "{selectedService?.title}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteService} 
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

export default withDashboardLayout(Services, "Quản Lý Dịch Vụ");