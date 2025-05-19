import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { withDashboardLayout } from '../../utils/layoutHelpers';
import { format, addDays, parseISO } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import axios from 'axios';

const StaffSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [schedule, setSchedule] = useState({
    arrivals: [],
    departures: [],
    cleanings: [],
    services: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Lấy dữ liệu từ API thực tế
        const response = await axios.get('/api/staff/schedule');
        const data = response.data;
        
        setSchedule(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (item, type) => {
    setSelectedItem({ ...item, type });
    setStatusUpdate(item.status);
    setNotes(item.notes || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleUpdateStatus = async () => {
    try {
      // Cập nhật trạng thái thông qua API
      await axios.put(`/api/staff/schedule/${selectedItem.type}/${selectedItem.id}`, {
        status: statusUpdate,
        notes
      });
      
      // Lấy lại dữ liệu cập nhật
      const response = await axios.get('/api/staff/schedule');
      setSchedule(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating status:', err);
      // Hiển thị thông báo lỗi nếu cần
    }
  };

  const getTabContent = () => {
    switch (selectedTab) {
      case 0: // Arrivals
        return (
          <List>
            {schedule.arrivals.length > 0 ? (
              schedule.arrivals.map((arrival) => (
                <React.Fragment key={arrival.id}>
                  <ListItem button onClick={() => handleOpenDialog(arrival, 'arrivals')}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <FlightLandIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${arrival.guestName} - Phòng ${arrival.roomNumber}`}
                      secondary={`${arrival.time} - ${arrival.guests} khách - ${arrival.specialRequests ? 'Yêu cầu đặc biệt' : 'Không có yêu cầu đặc biệt'}`}
                    />
                    <Box>
                      <Chip
                        label={arrival.status === 'confirmed' ? 'Đã xác nhận' : arrival.status === 'completed' ? 'Đã nhận phòng' : 'Đang chờ'}
                        color={arrival.status === 'confirmed' ? 'primary' : arrival.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có lịch nhận phòng" />
              </ListItem>
            )}
          </List>
        );

      case 1: // Departures
        return (
          <List>
            {schedule.departures.length > 0 ? (
              schedule.departures.map((departure) => (
                <React.Fragment key={departure.id}>
                  <ListItem button onClick={() => handleOpenDialog(departure, 'departures')}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <FlightTakeoffIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${departure.guestName} - Phòng ${departure.roomNumber}`}
                      secondary={`${departure.time} - Lưu trú ${departure.stayDuration} ngày`}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Chip
                        label={departure.status === 'confirmed' ? 'Đã xác nhận' : departure.status === 'completed' ? 'Đã trả phòng' : 'Đang chờ'}
                        color={departure.status === 'confirmed' ? 'primary' : departure.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {departure.outstandingBalance > 0 && (
                        <Chip
                          label={`Còn ${departure.outstandingBalance.toLocaleString('vi-VN')} VND`}
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>
                  </ListItem>
                  <Divider variant="inset" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có lịch trả phòng" />
              </ListItem>
            )}
          </List>
        );

      case 2: // Cleanings
        return (
          <List>
            {schedule.cleanings.length > 0 ? (
              schedule.cleanings.map((cleaning) => (
                <React.Fragment key={cleaning.id}>
                  <ListItem button onClick={() => handleOpenDialog(cleaning, 'cleanings')}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: cleaning.priority === 'high' ? 'error.main' : cleaning.priority === 'medium' ? 'warning.main' : 'info.main' }}>
                        <CleaningServicesIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Phòng ${cleaning.roomNumber} - ${cleaning.priority === 'high' ? 'Ưu tiên cao' : cleaning.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}`}
                      secondary={`${cleaning.notes} - Phân công: ${cleaning.assignedTo}`}
                    />
                    <Chip
                      label={cleaning.status === 'completed' ? 'Hoàn thành' : cleaning.status === 'in-progress' ? 'Đang dọn' : 'Chờ xử lý'}
                      color={cleaning.status === 'completed' ? 'success' : cleaning.status === 'in-progress' ? 'primary' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                  <Divider variant="inset" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có lịch dọn phòng" />
              </ListItem>
            )}
          </List>
        );

      case 3: // Services
        return (
          <List>
            {schedule.services.length > 0 ? (
              schedule.services.map((service) => (
                <React.Fragment key={service.id}>
                  <ListItem button onClick={() => handleOpenDialog(service, 'services')}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <RoomServiceIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${service.guestName} - Phòng ${service.roomNumber}`}
                      secondary={`${service.time} - ${service.requestType}: ${service.details}`}
                    />
                    <Box>
                      <Chip
                        label={service.status === 'completed' ? 'Hoàn thành' : service.status === 'in-progress' ? 'Đang xử lý' : 'Chờ xử lý'}
                        color={service.status === 'completed' ? 'success' : service.status === 'in-progress' ? 'primary' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có yêu cầu dịch vụ" />
              </ListItem>
            )}
          </List>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Lịch Trình Hôm Nay
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={`Nhận Phòng (${schedule.arrivals.length})`} 
            icon={<FlightLandIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Trả Phòng (${schedule.departures.length})`} 
            icon={<FlightTakeoffIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Dọn Phòng (${schedule.cleanings.length})`} 
            icon={<CleaningServicesIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Dịch Vụ (${schedule.services.length})`} 
            icon={<RoomServiceIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 0 }}>
        {getTabContent()}
      </Paper>

      {/* Dialog for detail view and status update */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        {selectedItem && (
          <>
            <DialogTitle>
              {selectedItem.type === 'arrivals' && `Nhận Phòng: ${selectedItem.guestName}`}
              {selectedItem.type === 'departures' && `Trả Phòng: ${selectedItem.guestName}`}
              {selectedItem.type === 'cleanings' && `Dọn Phòng: ${selectedItem.roomNumber}`}
              {selectedItem.type === 'services' && `Dịch Vụ: ${selectedItem.requestType}`}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                {/* Chi tiết khác nhau tùy thuộc vào loại mục */}
                {selectedItem.type === 'arrivals' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Thông tin khách hàng</Typography>
                      <Typography variant="body2">Tên: {selectedItem.guestName}</Typography>
                      <Typography variant="body2">SĐT: {selectedItem.phone}</Typography>
                      <Typography variant="body2">Số khách: {selectedItem.guests}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Thông tin phòng</Typography>
                      <Typography variant="body2">Phòng: {selectedItem.roomNumber}</Typography>
                      <Typography variant="body2">Loại: {selectedItem.roomType}</Typography>
                      <Typography variant="body2">Ngày nhận: {selectedItem.date}</Typography>
                    </Grid>
                    {selectedItem.specialRequests && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Yêu cầu đặc biệt</Typography>
                        <Typography variant="body2">{selectedItem.specialRequests}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                {selectedItem.type === 'departures' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Thông tin khách hàng</Typography>
                      <Typography variant="body2">Tên: {selectedItem.guestName}</Typography>
                      <Typography variant="body2">Thời gian lưu trú: {selectedItem.stayDuration} ngày</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Thông tin thanh toán</Typography>
                      <Typography variant="body2">Phòng: {selectedItem.roomNumber}</Typography>
                      <Typography variant="body2">Ngày trả: {selectedItem.date}</Typography>
                      <Typography variant="body2" color={selectedItem.outstandingBalance > 0 ? 'error' : 'inherit'}>
                        Còn lại: {selectedItem.outstandingBalance.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Grid>
                  </>
                )}

                {selectedItem.type === 'cleanings' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Thông tin dọn phòng</Typography>
                      <Typography variant="body2">Phòng: {selectedItem.roomNumber}</Typography>
                      <Typography variant="body2">
                        Mức ưu tiên: {
                          selectedItem.priority === 'high' ? 'Cao' : 
                          selectedItem.priority === 'medium' ? 'Trung bình' : 'Thấp'
                        }
                      </Typography>
                      <Typography variant="body2">Nhân viên: {selectedItem.assignedTo}</Typography>
                      <Typography variant="body2">Ghi chú: {selectedItem.notes}</Typography>
                    </Grid>
                  </>
                )}

                {selectedItem.type === 'services' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Thông tin dịch vụ</Typography>
                      <Typography variant="body2">Phòng: {selectedItem.roomNumber}</Typography>
                      <Typography variant="body2">Khách: {selectedItem.guestName}</Typography>
                      <Typography variant="body2">Loại yêu cầu: {selectedItem.requestType}</Typography>
                      <Typography variant="body2">Chi tiết: {selectedItem.details}</Typography>
                      <Typography variant="body2">Thời gian: {selectedItem.time}</Typography>
                      <Typography variant="body2">Nhân viên: {selectedItem.assignedTo}</Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Cập nhật trạng thái</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {selectedItem.type === 'arrivals' && (
                      <>
                        <Button 
                          variant={statusUpdate === 'pending' ? 'contained' : 'outlined'} 
                          color="warning" 
                          onClick={() => setStatusUpdate('pending')}
                        >
                          Đang chờ
                        </Button>
                        <Button 
                          variant={statusUpdate === 'confirmed' ? 'contained' : 'outlined'} 
                          color="primary" 
                          onClick={() => setStatusUpdate('confirmed')}
                        >
                          Đã xác nhận
                        </Button>
                        <Button 
                          variant={statusUpdate === 'completed' ? 'contained' : 'outlined'} 
                          color="success" 
                          onClick={() => setStatusUpdate('completed')}
                        >
                          Đã nhận phòng
                        </Button>
                      </>
                    )}

                    {selectedItem.type === 'departures' && (
                      <>
                        <Button 
                          variant={statusUpdate === 'pending' ? 'contained' : 'outlined'} 
                          color="warning" 
                          onClick={() => setStatusUpdate('pending')}
                        >
                          Đang chờ
                        </Button>
                        <Button 
                          variant={statusUpdate === 'confirmed' ? 'contained' : 'outlined'} 
                          color="primary" 
                          onClick={() => setStatusUpdate('confirmed')}
                        >
                          Đã xác nhận
                        </Button>
                        <Button 
                          variant={statusUpdate === 'completed' ? 'contained' : 'outlined'} 
                          color="success" 
                          onClick={() => setStatusUpdate('completed')}
                        >
                          Đã trả phòng
                        </Button>
                      </>
                    )}

                    {selectedItem.type === 'cleanings' && (
                      <>
                        <Button 
                          variant={statusUpdate === 'pending' ? 'contained' : 'outlined'} 
                          color="warning" 
                          onClick={() => setStatusUpdate('pending')}
                        >
                          Chờ xử lý
                        </Button>
                        <Button 
                          variant={statusUpdate === 'in-progress' ? 'contained' : 'outlined'} 
                          color="primary" 
                          onClick={() => setStatusUpdate('in-progress')}
                        >
                          Đang dọn
                        </Button>
                        <Button 
                          variant={statusUpdate === 'completed' ? 'contained' : 'outlined'} 
                          color="success" 
                          onClick={() => setStatusUpdate('completed')}
                        >
                          Hoàn thành
                        </Button>
                      </>
                    )}

                    {selectedItem.type === 'services' && (
                      <>
                        <Button 
                          variant={statusUpdate === 'pending' ? 'contained' : 'outlined'} 
                          color="warning" 
                          onClick={() => setStatusUpdate('pending')}
                        >
                          Chờ xử lý
                        </Button>
                        <Button 
                          variant={statusUpdate === 'in-progress' ? 'contained' : 'outlined'} 
                          color="primary" 
                          onClick={() => setStatusUpdate('in-progress')}
                        >
                          Đang xử lý
                        </Button>
                        <Button 
                          variant={statusUpdate === 'completed' ? 'contained' : 'outlined'} 
                          color="success" 
                          onClick={() => setStatusUpdate('completed')}
                        >
                          Hoàn thành
                        </Button>
                      </>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Ghi chú"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thêm ghi chú về xử lý..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
              <Button onClick={handleUpdateStatus} variant="contained" color="primary">
                Cập nhật
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(StaffSchedule, "Lịch Trình Làm Việc"); 