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
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
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
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  FormHelperText
} from '@mui/material';
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

// Room type options will now come from backend
// Status options
const roomStatuses = [
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' }
];

// Common amenities
const commonAmenities = [
  "Wi-Fi",
  "Air conditioning",
  "Flat-screen TV",
  "Private bathroom",
  "Minibar",
  "Coffee maker",
  "Safe",
  "Hairdryer",
  "Iron",
  "Desk",
  "Wardrobe",
  "Room service"
];

const Rooms = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
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
        setRoomTypes(response.data);
        // If we have room types, set the first one as default in form
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            type: response.data[0]._id
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
        setRooms(response.data);
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
    
    // Generate preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...files]
    }));
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
      await roomAPI.deleteRoom(selectedRoom._id);
      setRooms(prev => prev.filter(room => room._id !== selectedRoom._id));
      handleCloseDialogs();
      setError(null);
      toastService.success(`Room ${selectedRoom.roomNumber} has been deleted.`);
    } catch (err) {
      console.error('Error deleting room:', err);
      const errorMsg = 'Failed to delete room. Please try again.';
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
      toastService.info('Room list has been refreshed.');
    } catch (err) {
      console.error('Error refreshing rooms:', err);
      const errorMsg = 'Failed to refresh rooms. Please try again.';
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
        <Typography variant="h4" component="h1" gutterBottom>
          Quản Lý Phòng
        </Typography>
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
              <TableCell>Room Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room._id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>
                    {typeof room.type === 'object' ? 
                      (room.type?.name || "Unknown") : 
                      getRoomTypeName(room.type) || "Unknown"}
                  </TableCell>
                  <TableCell>${room.price}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.floor || 1}</TableCell>
                  <TableCell>
                    <Chip 
                      label={room.status} 
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
                  No rooms found. Add a room to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add Room Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          {roomTypesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomTypes.length === 0 ? (
            <Alert severity="error" sx={{ my: 2 }}>
              No room types found. Please create room types first.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Room Number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.roomNumber)}
                  helperText={errors.roomNumber || ''}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.type)}>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Room Type"
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name} - ${type.basePrice}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price per Night"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.price)}
                  helperText={errors.price || ''}
                  InputProps={{
                    startAdornment: '$'
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
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Amenities</Typography>
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
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Room Images</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                >
                  Upload Images
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
                  label="Description"
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
            <Typography variant="subtitle2" color="error" gutterBottom>
              Please correct the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {Object.values(errors).map((error, index) => (
                <li key={index}>
                  <Typography variant="body2" color="error.dark">
                    {error}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddRoom} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Room'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Room Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          {roomTypesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomTypes.length === 0 ? (
            <Alert severity="error" sx={{ my: 2 }}>
              No room types found. Please create room types first.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Room Number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.roomNumber)}
                  helperText={errors.roomNumber || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.type)}>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Room Type"
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name} - ${type.basePrice}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price per Night"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.price)}
                  helperText={errors.price || ''}
                  InputProps={{
                    startAdornment: '$'
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
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Amenities</Typography>
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
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Room Images</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                >
                  Upload New Images
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
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No images uploaded yet
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
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
            <Typography variant="subtitle2" color="error" gutterBottom>
              Please correct the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {Object.values(errors).map((error, index) => (
                <li key={index}>
                  <Typography variant="body2" color="error.dark">
                    {error}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRoom} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Update Room'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Room Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Room {selectedRoom?.roomNumber}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRoom} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(Rooms, "Quản Lý Phòng"); 