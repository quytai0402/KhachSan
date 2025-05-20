import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
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
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { withDashboardLayout } from '../../utils/layoutHelpers';

const Users = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // Users state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    address: ''
  });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/users');
      return;
    }
    
    if (isAuthenticated && currentUser && currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Filter users based on search term and role
  useEffect(() => {
    if (!users) return;
    
    let result = [...users];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(lowerCaseSearch) ||
        user.email?.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, filterRole]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open view dialog
  const handleOpenViewDialog = (user) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      phone: user.phone || '',
      address: user.address || ''
    });
    setOpenEditDialog(true);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      phone: '',
      address: ''
    });
    setOpenAddDialog(true);
  };
  
  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenViewDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenAddDialog(false);
    setSelectedUser(null);
  };
  
  // Add new user
  const handleAddUser = async () => {
    try {
      setSubmitting(true);
      const response = await userAPI.createUser(formData);
      setUsers(prev => [...prev, response.data]);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Không thể thêm người dùng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      const response = await userAPI.updateUser(selectedUser._id, formData);
      setUsers(prev => 
        prev.map(user => 
          user._id === selectedUser._id ? response.data : user
        )
      );
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Không thể cập nhật người dùng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      const response = await userAPI.deleteUser(selectedUser._id);
      
      if (response && response.data) {
        setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
        toast.success(`Đã xóa người dùng ${selectedUser.name} thành công`);
        handleCloseDialogs();
      } else {
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      // Extract error message from response if available
      const errorMsg = err.response?.data?.message || 'Không thể xóa người dùng. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Refresh users
  const handleRefreshUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Không thể làm mới danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      return format(new Date(dateString), 'dd MMM, yyyy', { locale: vi });
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Ngày không hợp lệ';
    }
  };
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };
  
  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'staff':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  // Get role translation
  const getRoleTranslation = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'staff':
        return 'Nhân viên';
      case 'user':
        return 'Khách hàng';
      default:
        return role;
    }
  };
  
  // Get name initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!isAuthenticated || (currentUser && currentUser.role !== 'admin')) {
    return null;
  }
  
  return (
    <Box sx={{ flexGrow: 1, pb: 3 }}>
      {/* Page Title and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600, 
            background: 'linear-gradient(45deg, #1e4e8c 30%, #3a8eff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Quản Lý Người Dùng
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ mr: 1, bgcolor: '#1e4e8c' }}
            onClick={handleOpenAddDialog}
          >
            Thêm Người Dùng
          </Button>
          <Tooltip title="Làm mới danh sách">
            <IconButton 
              color="primary" 
              onClick={handleRefreshUsers}
              disabled={loading}
              sx={{ 
                bgcolor: 'background.paper', 
                boxShadow: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc email"
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={filterRole}
              onChange={handleRoleFilterChange}
              label="Vai trò"
            >
              <MenuItem value="all">Tất cả vai trò</MenuItem>
              <MenuItem value="admin">Quản trị viên</MenuItem>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="user">Khách hàng</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Hiển thị {filteredUsers.length} trên {users.length} người dùng
          </Typography>
        </Grid>
      </Grid>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Users Table */}
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}
        elevation={0}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày tham gia</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Không tìm thấy người dùng nào</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user._id} 
                      hover
                      sx={{
                        '&:hover': { bgcolor: 'rgba(30, 78, 140, 0.04)' },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell
                        onClick={() => handleOpenViewDialog(user)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: user.role === 'admin' ? '#e67e22' : 
                                     user.role === 'staff' ? '#2e7d32' : '#1e4e8c',
                              mr: 2 
                            }}
                            src={user.profileImage}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell onClick={() => handleOpenViewDialog(user)}>
                        {user.email}
                      </TableCell>
                      <TableCell onClick={() => handleOpenViewDialog(user)}>
                        <Chip 
                          label={getRoleTranslation(user.role)} 
                          color={getRoleColor(user.role)}
                          size="small" 
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell onClick={() => handleOpenViewDialog(user)}>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenViewDialog(user)}
                            sx={{ color: '#1e4e8c' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sửa thông tin">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(user)}
                            sx={{ color: '#e67e22' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa người dùng">
                          <span>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user._id === currentUser?._id}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
      
      {/* View User Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          Thông tin chi tiết người dùng
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: selectedUser.role === 'admin' ? '#e67e22' : 
                           selectedUser.role === 'staff' ? '#2e7d32' : '#1e4e8c',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  src={selectedUser.profileImage}
                >
                  {getInitials(selectedUser.name)}
                </Avatar>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" fontWeight={600}>{selectedUser.name}</Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight={600}>Vai trò:</Typography>
                <Chip 
                  label={getRoleTranslation(selectedUser.role)} 
                  color={getRoleColor(selectedUser.role)}
                  size="small" 
                  sx={{ mt: 1, fontWeight: 500 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight={600}>Ngày tham gia:</Typography>
                <Typography variant="body2">
                  {formatDate(selectedUser.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600}>Số điện thoại:</Typography>
                <Typography variant="body2">
                  {selectedUser.phone || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600}>Địa chỉ:</Typography>
                <Typography variant="body2">
                  {selectedUser.address || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              
              {/* Show last activities (placeholder) */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>Hoạt động gần đây:</Typography>
                <Typography variant="body2" color="text.secondary">
                  Đăng nhập lần cuối: {formatDate(selectedUser.lastLogin || new Date())}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} sx={{ color: 'text.secondary' }}>Đóng</Button>
          <Button 
            variant="contained"
            sx={{ bgcolor: '#1e4e8c' }}
            onClick={() => {
              handleCloseDialogs();
              if (selectedUser) {
                handleOpenEditDialog(selectedUser);
              }
            }}
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          Thêm người dùng mới
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Vai trò"
                >
                  <MenuItem value="user">Khách hàng</MenuItem>
                  <MenuItem value="staff">Nhân viên</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#1e4e8c' }}
            onClick={handleAddUser}
            disabled={submitting || !formData.name || !formData.email}
          >
            {submitting ? <CircularProgress size={24} /> : 'Thêm người dùng'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={selectedUser && selectedUser._id === currentUser?._id}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={selectedUser && selectedUser._id === currentUser?._id}
                  label="Vai trò"
                >
                  <MenuItem value="user">Khách hàng</MenuItem>
                  <MenuItem value="staff">Nhân viên</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#1e4e8c' }}
            onClick={handleUpdateUser}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>
          Xác nhận xóa người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong>? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} sx={{ color: 'text.secondary' }}>Hủy</Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={handleDeleteUser}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withDashboardLayout(Users, "Quản Lý Người Dùng");