import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Paper,
  Avatar,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { formatVND, getVietnameseRoomType } from '../../utils/formatCurrency';
import {
  Search as SearchIcon,
  CleaningServices as CleaningServicesIcon,
  MeetingRoom as MeetingRoomIcon,
  DoNotDisturb as DoNotDisturbIcon,
  CheckCircle as CheckCircleIcon,
  HotelOutlined as HotelIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ActionModal } from '../../components/dashboard';
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { staffAPI } from '../../services/api';
import toastService from '../../services/toastService';

// Sample data in case API fails
const sampleRooms = [
  { 
    _id: 'r1',
    roomNumber: '101',
    type: 'Phòng Đơn',
    status: 'available',
    cleaningStatus: 'cleaned',
    floor: 1,
    notes: '',
    price: 750000,
    features: ['Điều hòa', 'TV', 'Minibar'],
    lastCleaned: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    _id: 'r2',
    roomNumber: '102',
    type: 'Phòng Đôi',
    status: 'booked',
    cleaningStatus: 'cleaned',
    floor: 1,
    notes: 'Check-in lúc 14:00',
    price: 950000,
    features: ['Điều hòa', 'TV', 'Minibar', 'Bồn tắm'],
    guestName: 'Nguyễn Văn A',
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    _id: 'r3',
    roomNumber: '201',
    type: 'Phòng Đơn',
    status: 'occupied',
    cleaningStatus: 'needs-cleaning',
    floor: 2,
    notes: 'Khách cần thêm khăn tắm',
    price: 750000,
    features: ['Điều hòa', 'TV', 'Minibar'],
    guestName: 'Trần Thị B',
    checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    _id: 'r4',
    roomNumber: '202',
    type: 'Phòng Đôi',
    status: 'maintenance',
    cleaningStatus: 'cleaned',
    floor: 2,
    notes: 'Đang sửa điều hòa',
    price: 950000,
    features: ['Điều hòa', 'TV', 'Minibar', 'Bồn tắm'],
    maintenanceReason: 'Sửa chữa điều hòa'
  },
  { 
    _id: 'r5',
    roomNumber: '301',
    type: 'Phòng Suite',
    status: 'available',
    cleaningStatus: 'cleaned',
    floor: 3,
    notes: '',
    price: 1750000,
    features: ['Điều hòa', 'TV', 'Minibar', 'Bồn tắm', 'Phòng khách'],
    lastCleaned: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  { 
    _id: 'r6',
    roomNumber: '302',
    type: 'Phòng Đôi',
    status: 'occupied',
    cleaningStatus: 'cleaning',
    floor: 3,
    notes: 'Check-out muộn được phép',
    price: 950000,
    features: ['Điều hòa', 'TV', 'Minibar', 'Bồn tắm'],
    guestName: 'Lê Văn C',
    checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    _id: 'r7',
    roomNumber: '401',
    type: 'Phòng Đơn',
    status: 'out-of-order',
    cleaningStatus: 'needs-cleaning',
    floor: 4,
    notes: 'Đang cải tạo',
    price: 750000,
    features: ['Điều hòa', 'TV', 'Minibar'],
    maintenanceReason: 'Cải tạo nội thất'
  },
  { 
    _id: 'r8',
    roomNumber: '402',
    type: 'Phòng Đơn',
    status: 'available',
    cleaningStatus: 'cleaned',
    floor: 4,
    notes: '',
    price: 750000,
    features: ['Điều hòa', 'TV', 'Minibar'],
    lastCleaned: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

const StaffRooms = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [cleaningFilter, setCleaningFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);
  
  // For room action modal
  const [openActionModal, setOpenActionModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Lấy dữ liệu phòng từ API thực tế
        const response = await staffAPI.getStaffRooms();
        setRooms(response.data);
        setFilteredRooms(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        
        // Initialize with empty arrays instead of sample data
        setRooms([]);
        setFilteredRooms([]);
        setError('Không thể tải dữ liệu phòng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, []);
  
  // Effect to filter rooms based on search and filters
  useEffect(() => {
    let result = [...rooms];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room.notes && room.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(room => room.status === statusFilter);
    }
    
    // Apply floor filter
    if (floorFilter !== 'all') {
      result = result.filter(room => room.floor === parseInt(floorFilter));
    }
    
    // Apply cleaning filter
    if (cleaningFilter !== 'all') {
      result = result.filter(room => room.cleaningStatus === cleaningFilter);
    }
    
    // Filter by tab
    if (currentTab === 1) { // Available
      result = result.filter(room => room.status === 'available');
    } else if (currentTab === 2) { // Occupied
      result = result.filter(room => room.status === 'occupied');
    } else if (currentTab === 3) { // Booked
      result = result.filter(room => room.status === 'booked');
    } else if (currentTab === 4) { // Maintenance
      result = result.filter(room => room.status === 'maintenance' || room.status === 'out-of-order');
    }
    
    setFilteredRooms(result);
  }, [rooms, searchTerm, statusFilter, floorFilter, cleaningFilter, currentTab]);
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    
    // Set the appropriate action type based on room status
    if (room.status === 'available') {
      setActionType('check-in');
    } else if (room.status === 'occupied') {
      setActionType('check-out');
    } else if (room.cleaningStatus === 'needs-cleaning') {
      setActionType('cleaning');
    } else {
      setActionType('update');
    }
    
    setOpenActionModal(true);
  };
  
  const handleCloseActionModal = () => {
    setOpenActionModal(false);
    setSelectedRoom(null);
    setActionType('');
    setActionError(null);
  };
  
  const handleActionSubmit = async (formData) => {
    setActionLoading(true);
    setActionError(null);
    
    try {
      // Prepare the update data based on action type
      const updateData = {
        status: actionType === 'check-in' ? 'occupied' :
                actionType === 'check-out' ? 'available' :
                formData.status || selectedRoom.status,
        cleaningStatus: actionType === 'cleaning' ? 'cleaned' : 
                        actionType === 'check-out' ? 'needs-cleaning' :
                        formData.cleaningStatus || selectedRoom.cleaningStatus,
        notes: formData.notes || selectedRoom.notes
      };
      
      // Additional data for check-in/check-out actions 
      if (actionType === 'check-in' && formData.guestName) {
        updateData.guestName = formData.guestName;
      }
      
      // Make API call to update room
      const response = await staffAPI.updateStaffRoom(selectedRoom._id, updateData);
      
      if (response.data) {
        // Update the room in local state with the server response
        const updatedRooms = rooms.map(room => {
          if (room._id === selectedRoom._id) {
            return response.data;
          }
          return room;
        });
        
        setRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
        
        // Show success message
        toastService.success(
          actionType === 'check-in' ? 'Check-in thành công!' :
          actionType === 'check-out' ? 'Check-out thành công!' :
          actionType === 'cleaning' ? 'Cập nhật trạng thái dọn phòng thành công!' :
          'Cập nhật thành công!'
        );
        
        // Close the modal
        handleCloseActionModal();
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setActionError(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Make actual API call to fetch latest data
      const response = await staffAPI.getStaffRooms();
      setRooms(response.data);
      setFilteredRooms(response.data);
      setError(null);
      toastService.info('Đã cập nhật danh sách phòng');
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      setError('Không thể tải dữ liệu phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const getModalFields = (actionType, room) => {
    switch (actionType) {
      case 'check-in':
        return [
          { type: 'display', name: 'roomNumber', label: 'Số phòng', defaultValue: room?.roomNumber || '' },
          { type: 'text', name: 'guestName', label: 'Tên khách hàng', required: true },
          { type: 'text', name: 'guestPhone', label: 'Số điện thoại', required: true },
          { type: 'text', name: 'guestEmail', label: 'Email', inputType: 'email' },
          { type: 'select', name: 'paymentMethod', label: 'Phương thức thanh toán', required: true, 
            options: [
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'card', label: 'Thẻ tín dụng/ghi nợ' },
              { value: 'transfer', label: 'Chuyển khoản' },
            ]
          },
          { type: 'text', name: 'notes', label: 'Ghi chú', multiline: true, rows: 3 }
        ];
        
      case 'check-out':
        return [
          { type: 'display', name: 'roomNumber', label: 'Số phòng', defaultValue: room?.roomNumber || '' },
          { type: 'display', name: 'guestName', label: 'Tên khách hàng', defaultValue: room?.guestName || '' },
          { type: 'select', name: 'cleaningStatus', label: 'Trạng thái dọn dẹp', required: true, 
            options: [
              { value: 'needs-cleaning', label: 'Cần dọn dẹp' },
              { value: 'cleaning', label: 'Đang dọn dẹp' },
              { value: 'cleaned', label: 'Đã dọn dẹp' }
            ],
            defaultValue: 'needs-cleaning'
          },
          { type: 'text', name: 'notes', label: 'Ghi chú', multiline: true, rows: 3 }
        ];
        
      case 'cleaning':
        return [
          { type: 'display', name: 'roomNumber', label: 'Số phòng', defaultValue: room?.roomNumber || '' },
          { type: 'select', name: 'cleaningStatus', label: 'Trạng thái dọn dẹp', required: true,
            options: [
              { value: 'needs-cleaning', label: 'Cần dọn dẹp' },
              { value: 'cleaning', label: 'Đang dọn dẹp' },
              { value: 'cleaned', label: 'Đã dọn dẹp' }
            ],
            defaultValue: room?.cleaningStatus || 'needs-cleaning'
          },
          { type: 'text', name: 'cleanedBy', label: 'Người thực hiện' },
          { type: 'text', name: 'notes', label: 'Ghi chú', multiline: true, rows: 3 }
        ];
      
      default: // update
        return [
          { type: 'display', name: 'roomNumber', label: 'Số phòng', defaultValue: room?.roomNumber || '' },
          { type: 'select', name: 'status', label: 'Trạng thái phòng', required: true,
            options: [
              { value: 'available', label: 'Trống' },
              { value: 'occupied', label: 'Đang sử dụng' },
              { value: 'booked', label: 'Đã đặt' },
              { value: 'maintenance', label: 'Bảo trì' },
              { value: 'out-of-order', label: 'Ngưng hoạt động' }
            ],
            defaultValue: room?.status || 'available'
          },
          { type: 'select', name: 'cleaningStatus', label: 'Trạng thái dọn dẹp', required: true,
            options: [
              { value: 'needs-cleaning', label: 'Cần dọn dẹp' },
              { value: 'cleaning', label: 'Đang dọn dẹp' },
              { value: 'cleaned', label: 'Đã dọn dẹp' }
            ],
            defaultValue: room?.cleaningStatus || 'needs-cleaning'
          },
          { type: 'text', name: 'notes', label: 'Ghi chú', multiline: true, rows: 3, 
            defaultValue: room?.notes || '' }
        ];
    }
  };
  
  // Get color for room status
  const getRoomStatusColor = (status, cleaningStatus) => {
    switch (status) {
      case 'available':
        return cleaningStatus === 'cleaned' ? '#2e7d32' : '#ff9800';
      case 'occupied':
        return '#1e4e8c';
      case 'booked':
        return '#9c27b0';
      case 'maintenance':
      case 'out-of-order':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };
  
  // Helper function to get translated status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Đang sử dụng';
      case 'booked': return 'Đã đặt';
      case 'maintenance': return 'Bảo trì';
      case 'out-of-order': return 'Ngưng hoạt động';
      default: return status;
    }
  };
  
  // Helper function to get translated cleaning status
  const getCleaningStatusLabel = (status) => {
    switch (status) {
      case 'cleaned': return 'Đã dọn dẹp';
      case 'needs-cleaning': return 'Cần dọn dẹp';
      case 'cleaning': return 'Đang dọn dẹp';
      default: return status;
    }
  };
  
  // Helper function to generate room badge content
  const getRoomBadgeContent = (room) => {
    if (room.status === 'available') {
      if (room.cleaningStatus === 'cleaned') {
        return <CheckCircleIcon />;
      } else {
        return <CleaningServicesIcon />;
      }
    } else if (room.status === 'occupied') {
      return <MeetingRoomIcon />;
    } else if (room.status === 'booked') {
      return <EventAvailableIcon />;
    } else {
      return <DoNotDisturbIcon />;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ p: { xs: 0, md: 0 } }}>
        {/* Header with search and actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 3, 
          gap: 2 
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quản Lý Phòng
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ bgcolor: '#1e4e8c', '&:hover': { bgcolor: '#15385f' } }}
              disabled={loading}
            >
              Làm mới
            </Button>
            <FormControlLabel
              control={
                <Switch 
                  checked={showGrid} 
                  onChange={() => setShowGrid(prev => !prev)} 
                  color="primary"
                />
              }
              label={showGrid ? "Hiển thị dạng lưới" : "Hiển thị dạng bảng"}
            />
          </Box>
        </Box>
        
        {/* Filters and search */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm phòng, khách hàng..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="available">Trống</MenuItem>
                  <MenuItem value="occupied">Đang sử dụng</MenuItem>
                  <MenuItem value="booked">Đã đặt</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="out-of-order">Ngưng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="floor-filter-label">Tầng</InputLabel>
                <Select
                  labelId="floor-filter-label"
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  label="Tầng"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="1">Tầng 1</MenuItem>
                  <MenuItem value="2">Tầng 2</MenuItem>
                  <MenuItem value="3">Tầng 3</MenuItem>
                  <MenuItem value="4">Tầng 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="cleaning-filter-label">Dọn dẹp</InputLabel>
                <Select
                  labelId="cleaning-filter-label"
                  value={cleaningFilter}
                  onChange={(e) => setCleaningFilter(e.target.value)}
                  label="Dọn dẹp"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="cleaned">Đã dọn dẹp</MenuItem>
                  <MenuItem value="needs-cleaning">Cần dọn dẹp</MenuItem>
                  <MenuItem value="cleaning">Đang dọn dẹp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<FilterIcon />}
                onClick={() => {
                  // Reset filters
                  setStatusFilter('all');
                  setFloorFilter('all');
                  setCleaningFilter('all');
                  setSearchTerm('');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Tabs for quick filtering */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>Tất cả</Box>
                  <Chip 
                    label={rooms.length} 
                    size="small" 
                    color="default"
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>Trống</Box>
                  <Chip 
                    label={rooms.filter(r => r.status === 'available').length} 
                    size="small" 
                    color="success"
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>Đang sử dụng</Box>
                  <Chip 
                    label={rooms.filter(r => r.status === 'occupied').length} 
                    size="small" 
                    color="primary"
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>Đã đặt</Box>
                  <Chip 
                    label={rooms.filter(r => r.status === 'booked').length} 
                    size="small" 
                    sx={{ bgcolor: '#9c27b0', color: 'white' }}
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>Bảo trì</Box>
                  <Chip 
                    label={rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order').length} 
                    size="small" 
                    color="error"
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        ) : filteredRooms.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.
          </Alert>
        ) : showGrid ? (
          <Grid container spacing={2}>
            {filteredRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    borderLeft: `4px solid ${getRoomStatusColor(room.status, room.cleaningStatus)}`
                  }}
                  onClick={() => handleRoomClick(room)}
                >
                  <CardActionArea sx={{ height: '100%', p: 0 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h5" component="div" gutterBottom>
                          {room.roomNumber}
                        </Typography>
                        
                        <Badge 
                          color={
                            room.status === 'available' ? 
                              room.cleaningStatus === 'cleaned' ? 'success' : 'warning'
                            : room.status === 'occupied' ? 'primary'
                            : room.status === 'booked' ? 'secondary'
                            : 'error'
                          }
                          badgeContent={getRoomBadgeContent(room)}
                        >
                          <Avatar sx={{ 
                            bgcolor: getRoomStatusColor(room.status, room.cleaningStatus) + '20',
                            color: getRoomStatusColor(room.status, room.cleaningStatus),
                          }}>
                            <HotelIcon />
                          </Avatar>
                        </Badge>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Loại phòng
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {getVietnameseRoomType(room.type)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip
                            label={getStatusLabel(room.status)}
                            size="small"
                            sx={{
                              bgcolor: getRoomStatusColor(room.status, room.cleaningStatus),
                              color: 'white'
                            }}
                          />
                          <Chip
                            label={getCleaningStatusLabel(room.cleaningStatus)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        {room.guestName && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Khách hàng
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {room.guestName}
                            </Typography>
                          </>
                        )}
                        
                        {room.notes && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Ghi chú
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ 
                              fontSize: '0.85rem', 
                              fontStyle: 'italic',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {room.notes}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0}>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid rgba(224, 224, 224, 1)' 
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Số phòng</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Loại phòng</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Trạng thái</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Dọn dẹp</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Tầng</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Khách hàng</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Ghi chú</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr 
                      key={room._id} 
                      style={{ 
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        cursor: 'pointer',
                        backgroundColor: room.status === 'out-of-order' ? '#ffebee' : 'inherit'
                      }}
                      onClick={() => handleRoomClick(room)}
                    >
                      <td style={{ padding: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={room.roomNumber}
                            size="small"
                            sx={{
                              bgcolor: getRoomStatusColor(room.status, room.cleaningStatus),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </td>
                      <td style={{ padding: 12 }}>{room.type}</td>
                      <td style={{ padding: 12 }}>{getStatusLabel(room.status)}</td>
                      <td style={{ padding: 12 }}>{getCleaningStatusLabel(room.cleaningStatus)}</td>
                      <td style={{ padding: 12 }}>{room.floor}</td>
                      <td style={{ padding: 12 }}>{room.guestName || '—'}</td>
                      <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.notes || '—'}
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleRoomClick(room);
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}
      </Box>
      
      {/* Action Modal */}
      <ActionModal
        open={openActionModal}
        onClose={handleCloseActionModal}
        title={
          actionType === 'check-in' ? 'Check-in Khách Hàng' :
          actionType === 'check-out' ? 'Check-out Khách Hàng' :
          actionType === 'cleaning' ? 'Cập Nhật Trạng Thái Dọn Dẹp' :
          'Cập Nhật Thông Tin Phòng'
        }
        actionType={actionType}
        data={selectedRoom}
        onSubmit={handleActionSubmit}
        loading={actionLoading}
        error={actionError}
        fields={getModalFields(actionType, selectedRoom)}
      />
    </Box>
  );
};

export default withDashboardLayout(StaffRooms, "Quản Lý Phòng");