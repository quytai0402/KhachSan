import { toast } from 'react-toastify';

// Default configuration for toast
const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast notification
export const showSuccessToast = (message, config = {}) => {
  return toast.success(message, { ...defaultConfig, ...config });
};

// Error toast notification
export const showErrorToast = (message, config = {}) => {
  return toast.error(message, { ...defaultConfig, ...config });
};

// Info toast notification
export const showInfoToast = (message, config = {}) => {
  return toast.info(message, { ...defaultConfig, ...config });
};

// Warning toast notification
export const showWarningToast = (message, config = {}) => {
  return toast.warning(message, { ...defaultConfig, ...config });
};

// Hide all toast notifications
export const hideAllToasts = () => {
  toast.dismiss();
};

// Toast service object
const toastService = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  dismiss: hideAllToasts
};

export default toastService; 