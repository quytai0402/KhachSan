import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip
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

const ServicesManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // Features state
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  
  // Services state
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Common state
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    name: '',
    description: '',
    isActive: true,
    
    // Feature specific
    type: 'other',
    order: 1,
    
    // Service specific
    price: '',
    category: 'other',
    isAvailable: true,
    image: null
  });
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [itemType, setItemType] = useState('feature'); // 'feature' or 'service'
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/services-management');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setFeaturesLoading(true);
        setError(null);
        const response = await serviceAPI.getFeatures();
        const featuresData = response.data?.data || response.data || [];
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
      } catch (err) {
        console.error('Error fetching features:', err);
        setError('Không thể tải danh sách tiện ích. Vui lòng thử lại sau.');
        setFeatures([]);
      } finally {
        setFeaturesLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchFeatures();
    }
  }, [isAuthenticated, user]);
  
  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setError(null);
        const response = await serviceAPI.getAllServices();
        const servicesData = response.data?.data || response.data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchServices();
    }
  }, [isAuthenticated, user]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };
  
  // Open add dialog
  const handleOpenAddDialog = (type) => {
    setItemType(type);
    setFormData({
      title: '',
      name: '',
      description: '',
      isActive: true,
      type: 'other',
      order: 1,
      price: '',
      category: 'other',
      isAvailable: true,
      image: null
    });
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    
    if (type === 'feature') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        type: item.type || 'other',
        order: item.order || 1,
        isActive: item.isActive !== false,
        // Reset service fields
        name: '',
        price: '',
        category: 'other',
        isAvailable: true,
        image: null
      });
    } else {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || 'other',
        isAvailable: item.isAvailable !== false,
        image: null,
        // Reset feature fields
        title: '',
        type: 'other',
        order: 1,
        isActive: true
      });
    }
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDeleteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };
  
  // Add item
  const handleAddItem = async () => {
    try {
      setSubmitting(true);
      
      if (itemType === 'feature') {
        // TODO: Add API method for creating features
        console.log('Adding feature:', formData);
        // const response = await serviceAPI.createFeature(formData);
        // setFeatures(prev => [...prev, response.data]);
      } else {
        const response = await serviceAPI.createService(formData);
        setServices(prev => [...prev, response.data?.data || response.data]);
      }
      
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.response?.data?.message || 'Không thể thêm mục. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update item
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    try {
      setSubmitting(true);
      
      if (itemType === 'feature') {
        // TODO: Add API method for updating features
        console.log('Updating feature:', formData);
        // const response = await serviceAPI.updateFeature(selectedItem._id, formData);
        // setFeatures(prev => prev.map(f => f._id === selectedItem._id ? response.data : f));
      } else {
        const response = await serviceAPI.updateService(selectedItem._id, formData);
        setServices(prev => prev.map(s => s._id === selectedItem._id ? (response.data?.data || response.data) : s));
      }
      
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật mục. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setSubmitting(true);
      
      if (itemType === 'feature') {
        // TODO: Add API method for deleting features
        console.log('Deleting feature:', selectedItem._id);
        // await serviceAPI.deleteFeature(selectedItem._id);
        // setFeatures(prev => prev.filter(f => f._id !== selectedItem._id));
      } else {
        await serviceAPI.deleteService(selectedItem._id);
        setServices(prev => prev.filter(s => s._id !== selectedItem._id));
      }
      
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.response?.data?.message || 'Không thể xóa mục. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh data
  const handleRefresh = async () => {
    if (activeTab === 0) {
      setFeaturesLoading(true);
      try {
        const response = await serviceAPI.getFeatures();
        const featuresData = response.data?.data || response.data || [];
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        setError(null);
      } catch (err) {
        setError('Không thể làm mới danh sách tiện ích.');
      } finally {
        setFeaturesLoading(false);
      }
    } else {
      setServicesLoading(true);
      try {
        const response = await serviceAPI.getAllServices();
        const servicesData = response.data?.data || response.data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setError(null);
      } catch (err) {
        setError('Không thể làm mới danh sách dịch vụ.');
      } finally {
        setServicesLoading(false);
      }
    }
  };
  
  const loading = activeTab === 0 ? featuresLoading : servicesLoading;
  const currentData = activeTab === 0 ? features : services;
  
  if (loading && currentData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản Lý Dịch Vụ & Tiện Ích
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Làm Mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddDialog(activeTab === 0 ? 'feature' : 'service')}
          >
            {activeTab === 0 ? 'Thêm Tiện Ích' : 'Thêm Dịch Vụ'}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Tiện Ích Khách Sạn (${features.length})`} />
          <Tab label={`Dịch Vụ Có Phí (${services.length})`} />
        </Tabs>
      </Paper>
      
      {/* Content Grid */}
      <Grid container spacing={3}>
        {currentData.length > 0 ? (
          currentData.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.title || item.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small"
                        color="primary" 
                        onClick={() => handleOpenEditDialog(item, activeTab === 0 ? 'feature' : 'service')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(item, activeTab === 0 ? 'feature' : 'service')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {activeTab === 0 ? (
                      <>
                        <Chip label={`Loại: ${item.type}`} size="small" />
                        <Chip label={`Thứ tự: ${item.order}`} size="small" />
                        <Chip 
                          label={item.isActive ? 'Hoạt động' : 'Không hoạt động'} 
                          size="small" 
                          color={item.isActive ? 'success' : 'error'}
                        />
                      </>
                    ) : (
                      <>
                        <Chip 
                          label={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} 
                          size="small" 
                          color="primary"
                        />
                        <Chip label={`Danh mục: ${item.category}`} size="small" />
                        <Chip 
                          label={item.isAvailable ? 'Có sẵn' : 'Không có sẵn'} 
                          size="small" 
                          color={item.isAvailable ? 'success' : 'error'}
                        />
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                {activeTab === 0 ? 'Chưa có tiện ích nào được tạo.' : 'Chưa có dịch vụ nào được tạo.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openAddDialog || openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          {openAddDialog 
            ? (itemType === 'feature' ? 'Thêm Tiện Ích Mới' : 'Thêm Dịch Vụ Mới')
            : (itemType === 'feature' ? 'Sửa Tiện Ích' : 'Sửa Dịch Vụ')
          }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {itemType === 'feature' ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Tiêu đề"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mô tả"
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
                  <FormControl fullWidth>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Loại"
                    >
                      <MenuItem value="room">Phòng</MenuItem>
                      <MenuItem value="spa">Spa</MenuItem>
                      <MenuItem value="dining">Ăn uống</MenuItem>
                      <MenuItem value="roomservice">Dịch vụ phòng</MenuItem>
                      <MenuItem value="wifi">WiFi</MenuItem>
                      <MenuItem value="fitness">Phòng gym</MenuItem>
                      <MenuItem value="pool">Hồ bơi</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Thứ tự hiển thị"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                    }
                    label="Hoạt động"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Tên dịch vụ"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mô tả"
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
                    label="Giá (VNĐ)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Danh mục"
                    >
                      <MenuItem value="spa">Spa</MenuItem>
                      <MenuItem value="dining">Ăn uống</MenuItem>
                      <MenuItem value="transport">Vận chuyển</MenuItem>
                      <MenuItem value="entertainment">Giải trí</MenuItem>
                      <MenuItem value="business">Doanh nghiệp</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type="file"
                    label="Hình ảnh"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: 'image/*' }}
                    onChange={handleFileChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                      />
                    }
                    label="Có sẵn"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Hủy</Button>
          <Button 
            onClick={openAddDialog ? handleAddItem : handleUpdateItem}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (openAddDialog ? 'Thêm' : 'Cập nhật')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa {itemType === 'feature' ? 'tiện ích' : 'dịch vụ'} này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Hủy</Button>
          <Button 
            onClick={handleDeleteItem}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(ServicesManagement);
