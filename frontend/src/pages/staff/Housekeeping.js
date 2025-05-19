import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

// Sample data for room cleaning tasks
const sampleCleaningTasks = [
  {
    _id: 'task1',
    roomNumber: '101',
    taskType: 'cleaning',
    priority: 'high',
    status: 'pending',
    notes: 'Guest checkout, deep cleaning required',
    assignedTo: 'Nguyễn Thị Hương',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'task2',
    roomNumber: '203',
    taskType: 'cleaning',
    priority: 'medium',
    status: 'in-progress',
    notes: 'Regular cleaning',
    assignedTo: 'Lê Văn Minh',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'task3',
    roomNumber: '305',
    taskType: 'maintenance',
    priority: 'low',
    status: 'completed',
    notes: 'Replace light bulbs',
    assignedTo: 'Trần Văn Lực',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'task4',
    roomNumber: '402',
    taskType: 'cleaning',
    priority: 'medium',
    status: 'pending',
    notes: 'Guest requested room cleaning',
    assignedTo: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    _id: 'task5',
    roomNumber: '506',
    taskType: 'maintenance',
    priority: 'high',
    status: 'pending',
    notes: 'AC not working properly',
    assignedTo: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

// Sample staff members for assignment
const sampleStaffMembers = [
  { _id: 'staff1', name: 'Nguyễn Thị Hương', role: 'housekeeper' },
  { _id: 'staff2', name: 'Lê Văn Minh', role: 'housekeeper' },
  { _id: 'staff3', name: 'Trần Văn Lực', role: 'maintenance' },
  { _id: 'staff4', name: 'Phạm Thị Mai', role: 'housekeeper' },
  { _id: 'staff5', name: 'Hoàng Văn Bình', role: 'maintenance' }
];

const StaffHousekeeping = () => {
  const [tasks, setTasks] = useState(sampleCleaningTasks);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [staffMembers, setStaffMembers] = useState(sampleStaffMembers);
  const [assignedStaff, setAssignedStaff] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, typeFilter]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by search term (room number or notes)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.roomNumber.toLowerCase().includes(lowerSearchTerm) ||
          task.notes.toLowerCase().includes(lowerSearchTerm) ||
          (task.assignedTo && task.assignedTo.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((task) => task.taskType === typeFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Danh sách nhiệm vụ đã được cập nhật');
    }, 1000);
  };

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setAssignedStaff(task.assignedTo || '');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTask(null);
    setAssignedStaff('');
  };

  const handleAssignTask = () => {
    // Update the selected task with the assigned staff
    const updatedTasks = tasks.map((task) =>
      task._id === selectedTask._id
        ? { ...task, assignedTo: assignedStaff, status: 'in-progress' }
        : task
    );

    setTasks(updatedTasks);
    toast.success('Đã phân công nhiệm vụ thành công');
    handleCloseDialog();
  };

  const handleCompleteTask = (taskId) => {
    // Update task status to completed
    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, status: 'completed' } : task
    );

    setTasks(updatedTasks);
    toast.success('Đã đánh dấu nhiệm vụ hoàn thành');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Đang chờ" color="warning" size="small" />;
      case 'in-progress':
        return <Chip label="Đang thực hiện" color="info" size="small" />;
      case 'completed':
        return <Chip label="Hoàn thành" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return <Chip label="Cao" color="error" size="small" />;
      case 'medium':
        return <Chip label="Trung bình" color="warning" size="small" />;
      case 'low':
        return <Chip label="Thấp" color="info" size="small" />;
      default:
        return <Chip label={priority} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Dịch Vụ Phòng
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Tìm kiếm theo số phòng hoặc ghi chú"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="pending">Đang chờ</MenuItem>
                <MenuItem value="in-progress">Đang thực hiện</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Loại nhiệm vụ</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Loại nhiệm vụ"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="cleaning">Dọn phòng</MenuItem>
                <MenuItem value="maintenance">Bảo trì</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={4} sx={{ display: 'flex', justifyContent: { xs: 'left', md: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
        
        <TableContainer>
          <Table aria-label="housekeeping tasks table">
            <TableHead>
              <TableRow>
                <TableCell>Phòng</TableCell>
                <TableCell>Loại nhiệm vụ</TableCell>
                <TableCell>Độ ưu tiên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người thực hiện</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell>Thời gian tạo</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Typography>Đang tải...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1">
                      Không có nhiệm vụ phù hợp với tìm kiếm
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {task.roomNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {task.taskType === 'cleaning' ? 'Dọn phòng' : 'Bảo trì'}
                      </TableCell>
                      <TableCell>{getPriorityChip(task.priority)}</TableCell>
                      <TableCell>{getStatusChip(task.status)}</TableCell>
                      <TableCell>
                        {task.assignedTo || (
                          <Typography variant="body2" color="text.secondary">
                            Chưa phân công
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{task.notes}</TableCell>
                      <TableCell>
                        {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {task.status !== 'completed' && (
                          <Box>
                            {!task.assignedTo && (
                              <Button
                                size="small"
                                startIcon={<AssignmentIcon />}
                                onClick={() => handleOpenDialog(task)}
                                sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                              >
                                Phân công
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="small"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleCompleteTask(task._id)}
                              >
                                Hoàn thành
                              </Button>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredTasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Dòng mỗi trang:"
        />
      </Paper>
      
      {/* Assign Task Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Phân công nhiệm vụ</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Phòng: <strong>{selectedTask?.roomNumber}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedTask?.notes}
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="assign-staff-label">Nhân viên</InputLabel>
              <Select
                labelId="assign-staff-label"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                label="Nhân viên"
              >
                {staffMembers
                  .filter(
                    (staff) =>
                      !selectedTask ||
                      (selectedTask.taskType === 'cleaning' && staff.role === 'housekeeper') ||
                      (selectedTask.taskType === 'maintenance' && staff.role === 'maintenance')
                  )
                  .map((staff) => (
                    <MenuItem key={staff._id} value={staff.name}>
                      {staff.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleAssignTask}
            variant="contained"
            disabled={!assignedStaff}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffHousekeeping;
