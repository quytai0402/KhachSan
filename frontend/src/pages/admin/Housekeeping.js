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
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import { DashboardLayout } from '../../components/dashboard';

const AdminHousekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('assign'); // assign, create, edit
  const [selectedTask, setSelectedTask] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [taskFormData, setTaskFormData] = useState({
    roomNumber: '',
    taskType: 'cleaning',
    priority: 'medium',
    notes: ''
  });
  const [formError, setFormError] = useState(null);
  const { user } = useAuth();

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasksData = await taskService.getTasks();
        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Không thể tải danh sách nhiệm vụ");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchStaff = async () => {
      try {
        // Ideally this would call a staffService.getStaff() method
        // For now we'll use sample data
        setStaffMembers([
          { _id: 'staff1', name: 'Nguyễn Thị Hương', role: 'housekeeper' },
          { _id: 'staff2', name: 'Lê Văn Minh', role: 'housekeeper' },
          { _id: 'staff3', name: 'Trần Văn Lực', role: 'maintenance' },
          { _id: 'staff4', name: 'Phạm Thị Mai', role: 'housekeeper' },
          { _id: 'staff5', name: 'Hoàng Văn Bình', role: 'maintenance' }
        ]);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    
    fetchTasks();
    fetchStaff();
  }, []);

  // Filter tasks based on search/filter criteria
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, typeFilter, tabValue]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Apply tab filter first
    if (tabValue === 1) {
      filtered = filtered.filter(task => task.status === 'pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(task => task.status === 'in-progress');
    } else if (tabValue === 3) {
      filtered = filtered.filter(task => task.status === 'completed');
    }

    // Filter by search term (room number or notes)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.roomNumber.toLowerCase().includes(lowerSearchTerm) ||
          (task.notes && task.notes.toLowerCase().includes(lowerSearchTerm)) ||
          (task.assignedTo && (
            typeof task.assignedTo === 'string' 
              ? task.assignedTo.toLowerCase().includes(lowerSearchTerm)
              : task.assignedTo.name && task.assignedTo.name.toLowerCase().includes(lowerSearchTerm)
          ))
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const tasksData = await taskService.getTasks();
      if (tasksData) {
        setTasks(tasksData);
        toast.success('Danh sách nhiệm vụ đã được cập nhật');
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
      toast.error("Không thể cập nhật danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, task = null) => {
    setDialogMode(mode);
    setSelectedTask(task);
    
    if (mode === 'assign' && task) {
      setAssignedStaff(task.assignedTo ? 
        (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id) 
        : '');
    } else if (mode === 'create') {
      setTaskFormData({
        roomNumber: '',
        taskType: 'cleaning',
        priority: 'medium',
        notes: ''
      });
    } else if (mode === 'edit' && task) {
      setTaskFormData({
        roomNumber: task.roomNumber || '',
        taskType: task.taskType || 'cleaning',
        priority: task.priority || 'medium',
        notes: task.notes || ''
      });
    }
    
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
    setAssignedStaff('');
    setTaskFormData({
      roomNumber: '',
      taskType: 'cleaning',
      priority: 'medium',
      notes: ''
    });
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignTask = async () => {
    try {
      const result = await taskService.assignTask(selectedTask._id, assignedStaff);
      if (result) {
        // Update the task in the local state
        const updatedTasks = tasks.map(task => 
          task._id === selectedTask._id 
            ? { ...task, assignedTo: assignedStaff, status: 'in-progress' } 
            : task
        );
        setTasks(updatedTasks);
        toast.success('Đã phân công nhiệm vụ thành công');
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("Không thể phân công nhiệm vụ");
    }
    handleCloseDialog();
  };

  const handleCreateTask = async () => {
    // Validate form
    if (!taskFormData.roomNumber) {
      setFormError("Vui lòng nhập số phòng");
      return;
    }
    
    try {
      const result = await taskService.createTask(taskFormData);
      if (result) {
        setTasks(prev => [result, ...prev]);
        toast.success('Đã tạo nhiệm vụ mới thành công');
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setFormError(error.message || "Không thể tạo nhiệm vụ mới");
    }
  };

  const handleEditTask = async () => {
    // Validate form
    if (!taskFormData.roomNumber) {
      setFormError("Vui lòng nhập số phòng");
      return;
    }
    
    try {
      const result = await taskService.updateTask(selectedTask._id, taskFormData);
      if (result) {
        const updatedTasks = tasks.map(task => 
          task._id === selectedTask._id 
            ? { ...task, ...taskFormData } 
            : task
        );
        setTasks(updatedTasks);
        toast.success('Đã cập nhật nhiệm vụ thành công');
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setFormError(error.message || "Không thể cập nhật nhiệm vụ");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(prev => prev.filter(task => task._id !== taskId));
        toast.success('Đã xóa nhiệm vụ thành công');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Không thể xóa nhiệm vụ");
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await taskService.completeTask(taskId);
      if (result) {
        const updatedTasks = tasks.map(task => 
          task._id === taskId 
            ? { ...task, status: 'completed' } 
            : task
        );
        setTasks(updatedTasks);
        toast.success('Đã đánh dấu nhiệm vụ hoàn thành');
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Không thể hoàn thành nhiệm vụ");
    }
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
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Quản Lý Dịch Vụ Phòng
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Tạo Nhiệm Vụ Mới
          </Button>
        </Box>

        <Paper elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
              sx={{ px: 2, pt: 1 }}
            >
              <Tab label="Tất cả" />
              <Tab label="Chờ xử lý" />
              <Tab label="Đang thực hiện" />
              <Tab label="Hoàn thành" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Tìm kiếm theo phòng, ghi chú..."
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
              <Grid item xs={12} sm={2.5}>
                <FormControl fullWidth size="small" variant="outlined">
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
              <Grid item xs={12} sm={2.5}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Loại nhiệm vụ</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Loại nhiệm vụ"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="cleaning">Dọn phòng</MenuItem>
                    <MenuItem value="maintenance">Bảo trì</MenuItem>
                    <MenuItem value="service">Dịch vụ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          </Box>
          
          <TableContainer>
            <Table aria-label="housekeeping tasks table">
              <TableHead sx={{ bgcolor: 'background.default' }}>
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
                          {task.taskType === 'cleaning' ? 'Dọn phòng' : 
                           task.taskType === 'maintenance' ? 'Bảo trì' : 'Dịch vụ'}
                        </TableCell>
                        <TableCell>{getPriorityChip(task.priority)}</TableCell>
                        <TableCell>{getStatusChip(task.status)}</TableCell>
                        <TableCell>
                          {task.assignedTo ? (
                            typeof task.assignedTo === 'string' ? task.assignedTo :
                            task.assignedTo.name || 'N/A'
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Chưa phân công
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            sx={{
                              maxWidth: 200,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {task.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {task.createdAt ? format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {task.status !== 'completed' && !task.assignedTo && (
                              <Tooltip title="Phân công">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenDialog('assign', task)}
                                  color="primary"
                                >
                                  <AssignmentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {task.status !== 'completed' && (
                              <Tooltip title="Đánh dấu hoàn thành">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleCompleteTask(task._id)}
                                  color="success"
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Chỉnh sửa">
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenDialog('edit', task)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Xóa">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteTask(task._id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Dòng mỗi trang:"
          />
        </Paper>
        
        {/* Assign Task Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            {dialogMode === 'assign' ? 'Phân Công Nhiệm Vụ' :
             dialogMode === 'create' ? 'Tạo Nhiệm Vụ Mới' :
             'Chỉnh Sửa Nhiệm Vụ'}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {formError}
              </Alert>
            )}
            
            {dialogMode === 'assign' && selectedTask && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Phòng: <strong>{selectedTask.roomNumber}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedTask.notes || 'Không có ghi chú'}
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel id="assign-staff-label">Nhân viên</InputLabel>
                  <Select
                    labelId="assign-staff-label"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    label="Nhân viên"
                  >
                    <MenuItem value="">
                      <em>Không phân công</em>
                    </MenuItem>
                    {staffMembers
                      .filter(
                        (staff) =>
                          !selectedTask ||
                          (selectedTask.taskType === 'cleaning' && staff.role === 'housekeeper') ||
                          (selectedTask.taskType === 'maintenance' && staff.role === 'maintenance') ||
                          (selectedTask.taskType === 'service')
                      )
                      .map((staff) => (
                        <MenuItem key={staff._id} value={staff._id}>
                          {staff.name} ({staff.role === 'housekeeper' ? 'Dọn phòng' : 
                                        staff.role === 'maintenance' ? 'Bảo trì' : staff.role})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            {(dialogMode === 'create' || dialogMode === 'edit') && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="roomNumber"
                  label="Số phòng"
                  fullWidth
                  required
                  value={taskFormData.roomNumber}
                  onChange={handleFormChange}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Loại nhiệm vụ</InputLabel>
                  <Select
                    name="taskType"
                    value={taskFormData.taskType}
                    onChange={handleFormChange}
                    label="Loại nhiệm vụ"
                  >
                    <MenuItem value="cleaning">Dọn phòng</MenuItem>
                    <MenuItem value="maintenance">Bảo trì</MenuItem>
                    <MenuItem value="service">Dịch vụ</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleFormChange}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="high">Cao</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="low">Thấp</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  name="notes"
                  label="Ghi chú"
                  fullWidth
                  multiline
                  rows={3}
                  value={taskFormData.notes}
                  onChange={handleFormChange}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            {dialogMode === 'assign' && (
              <Button
                onClick={handleAssignTask}
                variant="contained"
                color="primary"
              >
                Xác nhận
              </Button>
            )}
            {dialogMode === 'create' && (
              <Button
                onClick={handleCreateTask}
                variant="contained"
                color="primary"
              >
                Tạo mới
              </Button>
            )}
            {dialogMode === 'edit' && (
              <Button
                onClick={handleEditTask}
                variant="contained"
                color="primary"
              >
                Cập nhật
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default AdminHousekeeping;
