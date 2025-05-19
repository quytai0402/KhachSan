import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Reusable modal component for staff and admin actions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title
 * @param {string} props.actionType - Type of action (e.g., 'check-in', 'check-out', 'confirm')
 * @param {Object} props.data - Data to display in the modal
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {string} props.error - Error message
 * @param {Array} props.fields - Form fields to display
 */
const ActionModal = ({
  open,
  onClose,
  title,
  actionType,
  data = {},
  onSubmit,
  loading = false,
  error = null,
  fields = []
}) => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (open && data) {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = data[field.name] || field.defaultValue || '';
      });
      setFormData(initialData);
      setFormErrors({});
    }
  }, [open, data, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `Trường này là bắt buộc`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Submit form
    onSubmit(formData);
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'check-in':
        return '#2e7d32'; // Green
      case 'check-out':
        return '#1976d2'; // Blue
      case 'cancel':
        return '#d32f2f'; // Red
      case 'confirm':
        return '#e67e22'; // Orange
      default:
        return '#1e4e8c'; // Default blue
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(formErrors[field.name])}
            helperText={formErrors[field.name]}
            InputProps={field.readOnly ? { readOnly: true } : {}}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <FormControl key={field.name} fullWidth margin="normal">
            <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
            <Select
              labelId={`${field.name}-label`}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              error={Boolean(formErrors[field.name])}
              required={field.required}
            >
              {field.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formErrors[field.name] && (
              <Typography color="error" variant="caption">
                {formErrors[field.name]}
              </Typography>
            )}
          </FormControl>
        );
      
      case 'radio':
        return (
          <FormControl key={field.name} component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              row={field.row || false}
            >
              {field.options.map(option => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {formErrors[field.name] && (
              <Typography color="error" variant="caption">
                {formErrors[field.name]}
              </Typography>
            )}
          </FormControl>
        );
        
      case 'display':
        return (
          <Box key={field.name} sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {field.label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formData[field.name] || field.defaultValue || '—'}
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderTop: `4px solid ${getActionColor()}`,
          borderRadius: '12px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          pb: 2
        }}
      >
        <Typography variant="h6" component="span" fontWeight={600}>
          {title || 'Thực Hiện Hành Động'}
        </Typography>
        {!loading && (
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {data && data.status && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              label={
                data.status === 'confirmed' ? 'Đã xác nhận' :
                data.status === 'pending' ? 'Chờ xác nhận' :
                data.status === 'checked-in' ? 'Đã check-in' :
                data.status === 'checked-out' ? 'Đã check-out' :
                data.status === 'cancelled' ? 'Đã hủy' :
                data.status === 'completed' ? 'Hoàn thành' :
                data.status === 'in-progress' ? 'Đang xử lý' :
                data.status
              }
              color={
                data.status === 'confirmed' || data.status === 'checked-in' || data.status === 'completed' ? 'success' :
                data.status === 'pending' ? 'warning' :
                data.status === 'in-progress' ? 'info' :
                data.status === 'cancelled' ? 'error' :
                'default'
              }
              size="small"
            />
          </Stack>
        )}
        
        <form onSubmit={handleSubmit} id="action-form">
          {data && data.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {data.description}
            </Typography>
          )}
          
          {fields.map(field => renderField(field))}
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          form="action-form"
          variant="contained"
          sx={{ 
            bgcolor: getActionColor(),
            '&:hover': {
              bgcolor: getActionColor() + 'dd'
            }
          }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Đang Xử Lý...' : actionType === 'check-in' ? 'Check-in'
            : actionType === 'check-out' ? 'Check-out'
            : actionType === 'cancel' ? 'Hủy Đặt Phòng'
            : actionType === 'confirm' ? 'Xác Nhận'
            : 'Hoàn Thành'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionModal;
