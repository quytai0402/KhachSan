import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import axios from 'axios';

const StaffGuests = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [openGuestDialog, setOpenGuestDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequestData, setNewRequestData] = useState({
    type: 'room_service',
    details: '',
    priority: 'normal'
  });
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchGuestsAndRequests = async () => {
      try {
        // Lấy dữ liệu từ API thực tế
        const guestsResponse = await axios.get('/api/staff/guests');
        const requestsResponse = await axios.get('/api/staff/guest-requests');
        
        // Phân loại yêu cầu dựa trên trạng thái
        const allRequests = requestsResponse.data;
        const active = allRequests.filter(req => req.status !== 'completed');
        const completed = allRequests.filter(req => req.status === 'completed');
        
        setGuests(guestsResponse.data);
        setFilteredGuests(guestsResponse.data);
        setActiveRequests(active);
        setCompletedRequests(completed);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchGuestsAndRequests();
  }, []);

  useEffect(() => {
    // Lọc khách theo tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = guests.filter(
        guest =>
          guest.name.toLowerCase().includes(term) ||
          guest.roomNumber.includes(term) ||
          guest.phone.includes(term) ||
          guest.email.toLowerCase().includes(term)
      );
      setFilteredGuests(filtered);
    } else {
      setFilteredGuests(guests);
    }
  }, [searchTerm, guests]);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenGuestDialog = (guest) => {
    setSelectedGuest(guest);
    setOpenGuestDialog(true);
  };

  const handleCloseGuestDialog = () => {
    setOpenGuestDialog(false);
    setSelectedGuest(null);
  };

  const handleOpenRequestDialog = (request) => {
    setSelectedRequest(request);
    setStatusUpdate(request.status);
    setNotes(request.notes || '');
    setOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
    setSelectedRequest(null);
  };

  const handleNewRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequestData({
      ...newRequestData,
      [name]: value
    });
  };

  const handleUpdateRequestStatus = async () => {
    try {
      // Cập nhật trạng thái yêu cầu thông qua API
      await axios.put(`/api/staff/guest-requests/${selectedRequest.id}`, {
        status: statusUpdate,
        notes
      });
      
      // Lấy lại dữ liệu cập nhật sau khi thay đổi
      const requestsResponse = await axios.get('/api/staff/guest-requests');
      const allRequests = requestsResponse.data;
      
      // Phân loại lại yêu cầu
      const active = allRequests.filter(req => req.status !== 'completed');
      const completed = allRequests.filter(req => req.status === 'completed');
      
      setActiveRequests(active);
      setCompletedRequests(completed);
      
      handleCloseRequestDialog();
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  const handleSubmitNewRequest = async () => {
    if (!selectedGuest || !newRequestData.details) return;
    
    try {
      // Gửi yêu cầu mới thông qua API
      await axios.post('/api/staff/guest-requests', { 
        ...newRequestData, 
        guestId: selectedGuest.id 
      });
      
      // Lấy lại dữ liệu cập nhật
      const requestsResponse = await axios.get('/api/staff/guest-requests');
      const allRequests = requestsResponse.data;
      
      // Phân loại lại yêu cầu
      const active = allRequests.filter(req => req.status !== 'completed');
      const completed = allRequests.filter(req => req.status === 'completed');
      
      setActiveRequests(active);
      setCompletedRequests(completed);
      
      // Reset form
      setNewRequestData({
        type: 'room_service',
        details: '',
        priority: 'normal'
      });
      
      // Đóng dialog
      handleCloseGuestDialog();
    } catch (err) {
      console.error('Error creating new request:', err);
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'room_service':
        return <RoomServiceIcon />;
      case 'housekeeping':
        return <CleaningServicesIcon />;
      case 'laundry':
        return <LocalLaundryServiceIcon />;
      case 'food':
        return <RestaurantIcon />;
      default:
        return <RoomServiceIcon />;
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case 'room_service':
        return 'Dịch vụ phòng';
      case 'housekeeping':
        return 'Dọn phòng';
      case 'laundry':
        return 'Giặt ủi';
      case 'food':
        return 'Đồ ăn';
      default:
        return 'Khác';
    }
  };

  const getRequestStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<HourglassEmptyIcon />} label="Đang chờ" color="warning" size="small" />;
      case 'in_progress':
        return <Chip icon={<HourglassEmptyIcon />} label="Đang xử lý" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Hoàn thành" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getRequestsList = (requests) => {
    if (requests.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Không có yêu cầu nào
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {requests.map((request) => (
          <React.Fragment key={request.id}>
            <ListItem button onClick={() => handleOpenRequestDialog(request)}>
              <ListItemAvatar>
                <Avatar>
                  {getRequestTypeIcon(request.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${request.guestName} - Phòng ${request.roomNumber}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {getRequestTypeText(request.type)}
                    </Typography>
                    {` — ${request.details}`}
                  </>
                }
              />
              <ListItemSecondaryAction>
                {getRequestStatusChip(request.status)}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quản Lý Khách và Yêu Cầu
      </Typography>

      <Grid container spacing={3}>
        {/* Danh sách khách đang ở */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Khách Đang Ở ({filteredGuests.length})
              </Typography>
              <TextField
                placeholder="Tìm khách..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <Card key={guest.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {guest.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Phòng {guest.roomNumber} - {guest.guestCount} khách
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Nhận: {guest.checkIn}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Trả: {guest.checkOut}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenGuestDialog(guest)}
                    >
                      Chi tiết
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      onClick={() => {
                        setSelectedGuest(guest);
                        setOpenGuestDialog(true);
                      }}
                    >
                      Tạo yêu cầu
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  Không tìm thấy khách nào
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Danh sách yêu cầu */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                label={`Yêu cầu đang xử lý (${activeRequests.length})`} 
                icon={<HourglassEmptyIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`Đã hoàn thành (${completedRequests.length})`}
                icon={<CheckCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
            <Box sx={{ p: 0 }}>
              {activeTab === 0 && getRequestsList(activeRequests)}
              {activeTab === 1 && getRequestsList(completedRequests)}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog chi tiết khách và tạo yêu cầu */}
      <Dialog open={openGuestDialog} onClose={handleCloseGuestDialog} maxWidth="md" fullWidth>
        {selectedGuest && (
          <>
            <DialogTitle>
              {selectedGuest.name} - Phòng {selectedGuest.roomNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Thông tin khách
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedGuest.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Điện thoại:</strong> {selectedGuest.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Số khách:</strong> {selectedGuest.guestCount}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nhận phòng:</strong> {selectedGuest.checkIn}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Trả phòng:</strong> {selectedGuest.checkOut}
                  </Typography>
                  {selectedGuest.specialRequests && (
                    <Typography variant="body2">
                      <strong>Yêu cầu đặc biệt:</strong> {selectedGuest.specialRequests}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tạo yêu cầu mới
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Loại yêu cầu</InputLabel>
                    <Select
                      name="type"
                      value={newRequestData.type}
                      onChange={handleNewRequestChange}
                      label="Loại yêu cầu"
                    >
                      <MenuItem value="room_service">Dịch vụ phòng</MenuItem>
                      <MenuItem value="housekeeping">Dọn phòng</MenuItem>
                      <MenuItem value="laundry">Giặt ủi</MenuItem>
                      <MenuItem value="food">Đồ ăn & đồ uống</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Độ ưu tiên</InputLabel>
                    <Select
                      name="priority"
                      value={newRequestData.priority}
                      onChange={handleNewRequestChange}
                      label="Độ ưu tiên"
                    >
                      <MenuItem value="high">Cao</MenuItem>
                      <MenuItem value="normal">Bình thường</MenuItem>
                      <MenuItem value="low">Thấp</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="details"
                    label="Chi tiết yêu cầu"
                    value={newRequestData.details}
                    onChange={handleNewRequestChange}
                    placeholder="Nhập chi tiết yêu cầu..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseGuestDialog} color="inherit">
                Hủy
              </Button>
              <Button 
                onClick={handleSubmitNewRequest}
                variant="contained" 
                color="primary"
                disabled={!newRequestData.details}
              >
                Tạo yêu cầu
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog chi tiết và cập nhật yêu cầu */}
      <Dialog open={openRequestDialog} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>
              {getRequestTypeText(selectedRequest.type)} - {selectedRequest.guestName}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" gutterBottom>
                Thông tin yêu cầu
              </Typography>
              <Typography variant="body2">
                <strong>Phòng:</strong> {selectedRequest.roomNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Khách:</strong> {selectedRequest.guestName}
              </Typography>
              <Typography variant="body2">
                <strong>Loại yêu cầu:</strong> {getRequestTypeText(selectedRequest.type)}
              </Typography>
              <Typography variant="body2">
                <strong>Chi tiết:</strong> {selectedRequest.details}
              </Typography>
              <Typography variant="body2">
                <strong>Độ ưu tiên:</strong> {selectedRequest.priority === 'high' ? 'Cao' : selectedRequest.priority === 'normal' ? 'Bình thường' : 'Thấp'}
              </Typography>
              <Typography variant="body2">
                <strong>Tạo lúc:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </Typography>
              {selectedRequest.completedAt && (
                <Typography variant="body2">
                  <strong>Hoàn thành lúc:</strong> {new Date(selectedRequest.completedAt).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Phân công:</strong> {selectedRequest.assignedTo}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Cập nhật trạng thái
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant={statusUpdate === 'pending' ? 'contained' : 'outlined'} 
                  color="warning"
                  onClick={() => setStatusUpdate('pending')}
                  disabled={selectedRequest.status === 'completed'}
                >
                  Đang chờ
                </Button>
                <Button 
                  variant={statusUpdate === 'in_progress' ? 'contained' : 'outlined'} 
                  color="primary"
                  onClick={() => setStatusUpdate('in_progress')}
                  disabled={selectedRequest.status === 'completed'}
                >
                  Đang xử lý
                </Button>
                <Button 
                  variant={statusUpdate === 'completed' ? 'contained' : 'outlined'} 
                  color="success"
                  onClick={() => setStatusUpdate('completed')}
                  disabled={selectedRequest.status === 'completed'}
                >
                  Hoàn thành
                </Button>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Ghi chú"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm ghi chú về xử lý..."
                disabled={selectedRequest.status === 'completed'}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRequestDialog} color="inherit">
                Đóng
              </Button>
              {selectedRequest.status !== 'completed' && (
                <Button 
                  onClick={handleUpdateRequestStatus} 
                  variant="contained" 
                  color="primary"
                >
                  Cập nhật
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default StaffGuests; 