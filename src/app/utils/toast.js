import { toast } from 'react-toastify';

export const showSuccess = (msg, options = {}) => toast.success(msg, options);
export const showError = (msg) => toast.error(msg, {autoClose: 5000});
export const showInfo = (msg) => toast.info(msg);
export const showWarning = (msg) => toast.warn(msg);