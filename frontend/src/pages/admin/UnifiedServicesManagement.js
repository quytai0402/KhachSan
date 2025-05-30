import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  SpaOutlined,
  RestaurantOutlined,
  LocalParkingOutlined,
  WifiOutlined,
  FitnessCenterOutlined,
  PoolOutlined,
  LocalLaundryServiceOutlined,
  AirportShuttleOutlined,
  RoomServiceOutlined,
  BusinessCenterOutlined
} from '@mui/icons-material';
import { serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Text,
  TranslatedButton as Button,
  TranslatedDialogTitle as DialogTitle
} from '../../components/TranslatedComponents';

// Feature Types for the dropdown
const FEATURE_TYPES = [
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'dining', label: 'Dining' },
  { value: 'parking', label: 'Parking' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'pool', label: 'Pool' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'transport', label: 'Transport' },
  { value: 'roomservice', label: 'Room Service' },
  { value: 'business', label: 'Business Center' },
  { value: 'room', label: 'Room Features' },
  { value: 'other', label: 'Other' }
];

// Service Categories for the dropdown
const SERVICE_CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'spa', label: 'Spa' },
  { value: 'gym', label: 'Gym' },
  { value: 'pool', label: 'Pool' },
  { value: 'transport', label: 'Transport' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'other', label: 'Other' }
];

const UnifiedServicesManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  
  // Features state
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  
  // Services state
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // General state
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    order: 1,
    isActive: true,
    // Service specific fields
    name: '',
    price: '',
    category: '',
    isAvailable: true
  });
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState('feature'); // 'feature' or 'service'
  
  // Check if user is authenticated and is admin
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
  const fetchFeatures = async () => {
    try {
      setFeaturesLoading(true);
      setError(null);
      const response = await serviceAPI.getFeatures();
      const featuresData = response.data?.data || response.data || [];
      setFeatures(Array.isArray(featuresData) ? featuresData : []);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError('Không thể tải danh sách tiện nghi. Vui lòng thử lại sau.');
      setFeatures([]);
    } finally {
      setFeaturesLoading(false);
    }
  };
  
  // Fetch services
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
  
  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchFeatures();
      fetchServices();
    }
  }, [isAuthenticated, user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setError(null);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Open add dialog
  const handleOpenAddDialog = (mode) => {
    setEditMode(mode);
    setFormData({
      title: '',
      description: '',
      type: '',
      order: 1,
      isActive: true,
      name: '',
      price: '',
      category: '',
      isAvailable: true
    });
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (item, mode) => {
    setEditMode(mode);
    setSelectedItem(item);
    if (mode === 'feature') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        type: item.type || '',
        order: item.order || 1,
        isActive: item.isActive !== false,
        name: '',
        price: '',
        category: '',
        isAvailable: true
      });
    } else {
      setFormData({
        title: '',
        description: item.description || '',
        type: '',
        order: 1,
        isActive: true,
        name: item.name || '',
        price: item.price || '',
        category: item.category || '',
        isAvailable: item.isAvailable !== false
      });
    }
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (item, mode) => {
    setEditMode(mode);
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedItem(null);
    setEditMode('feature');
  };
  
  // Add item (feature or service)
  const handleAddItem = async () => {
    try {
      setSubmitting(true);
      if (editMode === 'feature') {
        const featureData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          order: formData.order,
          isActive: formData.isActive
        };
        const response = await serviceAPI.createFeature(featureData);
        setFeatures(prev => [...prev, response.data]);
      } else {
        const serviceData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          isAvailable: formData.isAvailable
        };
        const response = await serviceAPI.createService(serviceData);
        setServices(prev => [...prev, response.data]);
      }
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error(`Error adding ${editMode}:`, err);
      setError(err.response?.data?.message || `Failed to add ${editMode}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update item (feature or service)
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    try {
      setSubmitting(true);
      if (editMode === 'feature') {
        const featureData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          order: formData.order,
          isActive: formData.isActive
        };
        const response = await serviceAPI.updateFeature(selectedItem._id, featureData);
        setFeatures(prev =>
          prev.map(feature =>
            feature._id === selectedItem._id ? response.data : feature
          )
        );
      } else {
        const serviceData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          isAvailable: formData.isAvailable
        };
        const response = await serviceAPI.updateService(selectedItem._id, serviceData);
        setServices(prev =>
          prev.map(service =>
            service._id === selectedItem._id ? response.data : service
          )
        );
      }
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error(`Error updating ${editMode}:`, err);
      setError(err.response?.data?.message || `Failed to update ${editMode}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete item (feature or service)
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setSubmitting(true);
      if (editMode === 'feature') {
        await serviceAPI.deleteFeature(selectedItem._id);
        setFeatures(prev => prev.filter(feature => feature._id !== selectedItem._id));
      } else {
        await serviceAPI.deleteService(selectedItem._id);
        setServices(prev => prev.filter(service => service._id !== selectedItem._id));
      }
      setError(null);
      handleCloseDialogs();
    } catch (err) {
      console.error(`Error deleting ${editMode}:`, err);
      setError(err.response?.data?.message || `Failed to delete ${editMode}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh data
  const handleRefreshData = async () => {
    if (currentTab === 0) {
      await fetchFeatures();
    } else {
      await fetchServices();
    }
  };
  
  // Get icon for feature type
  const getFeatureIcon = (type) => {
    switch (type) {
      case 'spa':
        return <SpaOutlined />;
      case 'dining':
        return <RestaurantOutlined />;
      case 'parking':
        return <LocalParkingOutlined />;
      case 'wifi':
        return <WifiOutlined />;
      case 'fitness':
        return <FitnessCenterOutlined />;
      case 'pool':
        return <PoolOutlined />;
      case 'laundry':
        return <LocalLaundryServiceOutlined />;
      case 'transport':
        return <AirportShuttleOutlined />;
      case 'roomservice':
        return <RoomServiceOutlined />;
      case 'business':
        return <BusinessCenterOutlined />;
      default:
        return <SpaOutlined />;
    }
  };
  
  // Render loading state
  if ((featuresLoading && currentTab === 0) || (servicesLoading && currentTab === 1)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Text variant="h4" component="h1">
          Quản Lý Dịch Vụ & Tiện Nghi
        </Text>
        <Box>
          <Button 
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            sx={{ mr: 2 }}
          >
            {t('refresh')}
          </Button>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddDialog(currentTab === 0 ? 'feature' : 'service')}
          >
            {currentTab === 0 ? 'Thêm Tiện Nghi' : 'Thêm Dịch Vụ'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="service management tabs">
          <Tab label="Tiện Nghi Khách Sạn" />
          <Tab label="Dịch Vụ Có Tính Phí" />
        </Tabs>
      </Paper>

      {/* Features Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {features.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Chưa có tiện nghi nào được tạo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Nhấn "Thêm Tiện Nghi" để tạo tiện nghi đầu tiên
                </Typography>
              </Paper>
            </Grid>
          ) : (
            features.map((feature) => (
              <Grid item xs={12} md={6} lg={4} key={feature._id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getFeatureIcon(feature.type)}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {feature.title}
                      </Typography>
                      <Chip 
                        label={feature.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        color={feature.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Thứ tự: {feature.order}
                      </Typography>
                      <Box>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(feature, 'feature')}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(feature, 'feature')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Services Tab */}
      {currentTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên Dịch Vụ</TableCell>
                <TableCell>Mô Tả</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Danh Mục</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell align="right">Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Chưa có dịch vụ nào được tạo
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {service.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={service.category || 'Other'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={service.isAvailable ? 'Có sẵn' : 'Không có sẵn'}
                        color={service.isAvailable ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(service, 'service')}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(service, 'service')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openAddDialog || openEditDialog}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openAddDialog 
            ? (editMode === 'feature' ? 'Thêm Tiện Nghi Mới' : 'Thêm Dịch Vụ Mới')
            : (editMode === 'feature' ? 'Chỉnh Sửa Tiện Nghi' : 'Chỉnh Sửa Dịch Vụ')
          }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {editMode === 'feature' ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="title"
                    label="Tiêu Đề"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Mô Tả"
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
                    <InputLabel>Loại Tiện Nghi</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Loại Tiện Nghi"
                    >
                      {FEATURE_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="order"
                    label="Thứ Tự Hiển Thị"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 1 }}
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
                    label="Hiển thị tiện nghi này"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Tên Dịch Vụ"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Mô Tả"
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
                    name="price"
                    label="Giá (VND)"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh Mục</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Danh Mục"
                    >
                      {SERVICE_CATEGORIES.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    label="Dịch vụ có sẵn"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Hủy
          </Button>
          <Button 
            onClick={openAddDialog ? handleAddItem : handleUpdateItem}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (openAddDialog ? 'Thêm' : 'Cập Nhật')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>
          Xác Nhận Xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa {editMode === 'feature' ? 'tiện nghi' : 'dịch vụ'} "{selectedItem?.title || selectedItem?.name}" không? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Hủy
          </Button>
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

export default withDashboardLayout(UnifiedServicesManagement);