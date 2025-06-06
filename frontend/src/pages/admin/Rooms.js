import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Tooltip,
  ImageList,
  ImageListItem,
  FormHelperText
} from '@mui/material';
import { formatVND, getVietnameseRoomType } from '../../utils/formatCurrency';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { roomAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toastService from '../../services/toastService';
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Text, 
  TranslatedButton as Button, 
  TranslatedDialogTitle as DialogTitle,
  TranslatedTextField as TextField
} from '../../components/TranslatedComponents';

// Room type options will now come from backend
// Status options
const roomStatuses = [
  { value: 'available', label: 'Còn trống' },
  { value: 'booked', label: 'Đã đặt' },
  { value: 'maintenance', label: 'Bảo trì' }
];

// Generate room numbers for each floor (1-10)
const generateRoomNumbers = () => {
  const roomNumbers = [];
  for (let floor = 1; floor <= 10; floor++) {
    for (let room = 1; room <= 20; room++) {
      // Create format like: 101, 102, ..., 110, 201, 202, etc.
      const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
      roomNumbers.push(roomNumber);
    }
  }
  return roomNumbers;
};

const roomNumberOptions = generateRoomNumbers();

// Common amenities
const commonAmenities = [
  "Wi-Fi",
  "Điều hòa",
  "TV màn hình phẳng",
  "Phòng tắm riêng",
  "Minibar",
  "Máy pha cà phê",
  "Két sắt",
  "Máy sấy tóc",
  "Bàn là",
  "Bàn làm việc",
  "Tủ quần áo",
  "Dịch vụ phòng"
];

const Rooms = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // const { t } = useLanguage(); // Translation function currently unused
  
  // Rooms state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Room types state
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(true);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    price: '',
    capacity: 1,
    floor: 1,
    status: 'available',
    description: '',
    amenities: [],
    images: []
  });
  
  // Preview images
  const [imagePreview, setImagePreview] = useState([]);
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Replace the error state with more detailed errors object
  const [errors, setErrors] = useState({});
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/rooms');
      return;
    }
    
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setRoomTypesLoading(true);
        const response = await roomAPI.getRoomTypes();
        const roomTypesData = response.data.data || response.data || [];
        setRoomTypes(roomTypesData);
        // If we have room types, set the first one as default in form
        if (roomTypesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            type: roomTypesData[0]._id
          }));
        }
      } catch (err) {
        console.error('Error fetching room types:', err);
        setError('Failed to load room types. Please try again.');
      } finally {
        setRoomTypesLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchRoomTypes();
    }
  }, [isAuthenticated, user]);
  
  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAllRooms();
        // Extract data from the new API format { success: true, data: [...] }
        const roomsData = response.data?.data || response.data || [];
        setRooms(roomsData);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user && user.role === 'admin') {
      fetchRooms();
    }
  }, [isAuthenticated, user]);
  
  // Update handleChange to clear errors for the field being changed
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle amenities change
  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
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
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Generate preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    setFormData(prev => {
      // Get existing files if any, or initialize empty array
      const existingFiles = prev.images || [];
      
      // Combine with new files
      return {
        ...prev,
        images: [...existingFiles, ...files]
      };
    });
    
    // Clear error if exists
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };
  
  // Remove image from preview
  const handleRemoveImage = (index) => {
    setImagePreview(prev => {
      const newPreviews = [...prev];
      // Revoke URL to avoid memory leak
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    // Also remove from formData
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
    
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };
  
  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      roomNumber: '',
      type: '',
      price: '',
      capacity: 1,
      floor: 1,
      status: 'available',
      description: '',
      amenities: [],
      images: []
    });
    setImagePreview([]);
    setOpenAddDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type._id,
      price: room.price,
      capacity: room.capacity,
      floor: room.floor || 1,
      status: room.status,
      description: room.description || '',
      amenities: room.amenities || [],
      images: []
    });
    
    // If room has existing images, show them in preview
    if (room.images && room.images.length > 0) {
      setImagePreview(
        room.images.map(image => ({
          preview: `http://localhost:5000${image}`,
          existing: true,
          path: image
        }))
      );
    } else {
      setImagePreview([]);
    }
    
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (room) => {
    setSelectedRoom(room);
    setOpenDeleteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedRoom(null);
    setError(null);
    setErrors({}); // Clear field-specific errors
    // Clear image previews to avoid memory leaks
    imagePreview.forEach(img => URL.revokeObjectURL(img.preview));
    setImagePreview([]);
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room Number is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    if (!formData.floor || formData.floor <= 0) newErrors.floor = 'Floor must be greater than 0';
    if (!formData.type) newErrors.type = 'Room Type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Focus first error field
  const focusFirstError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Update handleAddRoom with validation and toast notification
  const handleAddRoom = async () => {
    if (!validateForm()) {
      setTimeout(focusFirstError, 100); // Small delay to ensure DOM is updated
      toastService.error('Please correct the errors in the form.');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await roomAPI.createRoom(formData);
      setRooms(prev => [...prev, response.data]);
      handleCloseDialogs();
      setErrors({});
      toastService.success(`Room ${response.data.roomNumber} has been added successfully.`);
    } catch (err) {
      console.error('Error adding room:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add room. Please try again.';
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update handleUpdateRoom with validation and toast notification
  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    
    if (!validateForm()) {
      setTimeout(focusFirstError, 100);
      toastService.error('Please correct the errors in the form.');
      return;
    }
    
    try {
      setSubmitting(true);
      // Add existing images paths to keep
      const dataToSend = {...formData};
      
      // Only update with new images if any were added
      if (dataToSend.images && dataToSend.images.length === 0) {
        delete dataToSend.images;
      }
      
      const response = await roomAPI.updateRoom(selectedRoom._id, dataToSend);
      setRooms(prev => 
        prev.map(room => 
          room._id === selectedRoom._id ? response.data : room
        )
      );
      handleCloseDialogs();
      setErrors({});
      toastService.success(`Room ${response.data.roomNumber} has been updated successfully.`);
    } catch (err) {
      console.error('Error updating room:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update room. Please try again.';
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete room with toast notification
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    
    try {
      setSubmitting(true);
      // Make API call with error handling
      const response = await roomAPI.deleteRoom(selectedRoom._id);
      
      // Check if deletion was successful
      if (response && response.data) {
        // Update local state to remove the deleted room
        setRooms(prev => prev.filter(room => room._id !== selectedRoom._id));
        handleCloseDialogs();
        setError(null);
        toastService.success(`Phòng ${selectedRoom.roomNumber} đã được xóa thành công.`);
      } else {
        throw new Error('No response from server');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      // Extract error message from response if available
      const errorMsg = err.response?.data?.message || 'Không thể xóa phòng. Vui lòng thử lại.';
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh rooms with toast notification
  const handleRefreshRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAllRooms();
      setRooms(response.data);
      setError(null);
      toastService.info('Danh sách phòng đã được làm mới.');
    } catch (err) {
      console.error('Error refreshing rooms:', err);
      const errorMsg = 'Không thể làm mới danh sách phòng. Vui lòng thử lại.';
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'primary';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Function to get room type name by ID
  const getRoomTypeName = (typeId) => {
    const foundType = roomTypes.find(type => type._id === typeId);
    return foundType ? foundType.name : 'Unknown';
  };
  
  // Render loading state
  if (loading && rooms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, pb: 3 }}>
      {/* Page Title and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Text variant="h4" component="h1" gutterBottom>
          Quản Lý Phòng
        </Text>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ mr: 1 }}
          >
            Thêm Phòng
          </Button>
          <IconButton
            color="primary"
            onClick={handleRefreshRooms}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Số Phòng</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Sức Chứa</TableCell>
              <TableCell>Tầng</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room._id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>
                    {typeof room.type === 'object' ? 
                      getVietnameseRoomType(room.type?.name || "Unknown") : 
                      getVietnameseRoomType(getRoomTypeName(room.type)) || "Unknown"}
                  </TableCell>
                  <TableCell>{formatVND(room.price)}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.floor || 1}</TableCell>
                  <TableCell>
                    <Chip 
                      label={room.status === 'available' ? 'Trống' : 
                             room.status === 'booked' ? 'Đã đặt' : 
                             room.status === 'occupied' ? 'Đang ở' :
                             room.status === 'maintenance' ? 'Bảo trì' : room.status} 
                      color={getStatusColor(room.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(room)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(room)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không tìm thấy phòng nào. Thêm phòng để bắt đầu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add Room Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Phòng Mới</DialogTitle>
        <DialogContent>
          {roomTypesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomTypes.length === 0 ? (
            <Alert severity="error" sx={{ my: 2 }}>
              Không tìm thấy loại phòng nào. Vui lòng tạo loại phòng trước.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.roomNumber)}>
                  <InputLabel>Số Phòng</InputLabel>
                  <Select
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    label="Số Phòng"
                    autoFocus
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {roomNumberOptions.map((roomNum) => (
                      <MenuItem key={roomNum} value={roomNum}>
                        {roomNum}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roomNumber && (
                    <FormHelperText error>{errors.roomNumber}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.type)}>
                  <InputLabel>Loại Phòng</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Loại Phòng"
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {getVietnameseRoomType(type.name)} - {formatVND(type.basePrice)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Giá Mỗi Đêm"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.price)}
                  helperText={errors.price || ''}
                  InputProps={{
                    startAdornment: 'VND'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.capacity)}
                  helperText={errors.capacity || ''}
                  InputProps={{
                    inputProps: { min: 1, max: 10 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.floor)}
                  helperText={errors.floor || ''}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {roomStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Text variant="subtitle1" sx={{ mb: 1 }}>Amenities</Text>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {commonAmenities.map(amenity => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      color={formData.amenities.includes(amenity) ? "primary" : "default"}
                      onClick={() => handleAmenityToggle(amenity)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Text variant="subtitle1" sx={{ mb: 1 }}>Hình Ảnh Phòng</Text>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  color="primary"
                >
                  Tải lên hình ảnh
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {imagePreview.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <ImageList cols={3} gap={8}>
                      {imagePreview.map((img, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={img.preview}
                            alt={`Room preview ${index + 1}`}
                            loading="lazy"
                            style={{ height: '120px', objectFit: 'cover' }}
                          />
                          <IconButton
                            onClick={() => handleRemoveImage(index)}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  error={Boolean(errors.description)}
                  helperText={errors.description || ''}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        {Object.keys(errors).length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Text variant="subtitle2" color="error" gutterBottom>
              Vui lòng sửa các lỗi sau:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {Object.values(errors).map((error, index) => (
                <li key={index}>
                  <Text variant="body2" color="error.dark">
                    {error}
                  </Text>
                </li>
              ))}
            </ul>
          </Box>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleAddRoom} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Thêm Phòng'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Room Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh Sửa Phòng</DialogTitle>
        <DialogContent>
          {roomTypesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomTypes.length === 0 ? (
            <Alert severity="error" sx={{ my: 2 }}>
              Không tìm thấy loại phòng nào. Vui lòng tạo loại phòng trước.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.roomNumber)}>
                  <InputLabel>Số Phòng</InputLabel>
                  <Select
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    label="Số Phòng"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {roomNumberOptions.map((roomNum) => (
                      <MenuItem key={roomNum} value={roomNum}>
                        {roomNum}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roomNumber && (
                    <FormHelperText error>{errors.roomNumber}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.type)}>
                  <InputLabel>Loại Phòng</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Loại Phòng"
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name} - {formatVND(type.basePrice)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Giá mỗi đêm"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.price)}
                  helperText={errors.price || ''}
                  InputProps={{
                    startAdornment: 'VND'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.capacity)}
                  helperText={errors.capacity || ''}
                  InputProps={{
                    inputProps: { min: 1, max: 10 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.floor)}
                  helperText={errors.floor || ''}
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {roomStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Text variant="subtitle1" sx={{ mb: 1 }}>Tiện nghi</Text>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {commonAmenities.map(amenity => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      color={formData.amenities.includes(amenity) ? "primary" : "default"}
                      onClick={() => handleAmenityToggle(amenity)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Text variant="subtitle1" sx={{ mb: 1 }}>Hình ảnh phòng</Text>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                >
                  Tải hình ảnh mới
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {imagePreview.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <ImageList cols={3} gap={8}>
                      {imagePreview.map((img, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={img.preview}
                            alt={`Room preview ${index + 1}`}
                            loading="lazy"
                            style={{ height: '120px', objectFit: 'cover' }}
                          />
                          <IconButton
                            onClick={() => handleRemoveImage(index)}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                ) : (
                  <Text variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Chưa có ảnh nào được tải lên
                  </Text>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  error={Boolean(errors.description)}
                  helperText={errors.description || ''}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        {Object.keys(errors).length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Text variant="subtitle2" color="error" gutterBottom>
              Vui lòng sửa các lỗi sau:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {Object.values(errors).map((error, index) => (
                <li key={index}>
                  <Text variant="body2" color="error.dark">
                    {error}
                  </Text>
                </li>
              ))}
            </ul>
          </Box>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateRoom} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Cập Nhật Phòng'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Room Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xóa Phòng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa Phòng {selectedRoom?.roomNumber}? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteRoom} 
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

export default withDashboardLayout(Rooms, "Quản Lý Phòng");