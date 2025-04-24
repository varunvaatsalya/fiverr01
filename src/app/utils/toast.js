import { toast } from 'react-toastify';

export const showSuccess = (msg) => toast.success(msg);
export const showError = (msg) => toast.error(msg, {autoClose: 5000});
export const showInfo = (msg) => toast.info(msg);
export const showWarning = (msg) => toast.warn(msg);