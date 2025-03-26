
import { toast as reactToastify } from "react-toastify";
import { toast as useToastHook } from "@/hooks/use-toast";

type ToastOptions = {
  /** Duration in milliseconds */
  duration?: number;
  /** Whether to use the shadcn/ui toast or react-toastify */
  useBuiltIn?: boolean;
};

/**
 * Shows a success toast notification
 * @param message The message to display
 * @param options Optional configuration options
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
  if (options?.useBuiltIn) {
    return useToastHook({
      title: "Başarılı",
      description: message,
      duration: options.duration || 5000,
    });
  }
  
  return reactToastify.success(message, {
    autoClose: options?.duration || 5000,
    position: "bottom-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows an error toast notification
 * @param message The message to display
 * @param options Optional configuration options
 */
export const showError = (message: string, options?: ToastOptions) => {
  if (options?.useBuiltIn) {
    return useToastHook({
      title: "Hata",
      description: message,
      variant: "destructive",
      duration: options?.duration || 5000,
    });
  }
  
  return reactToastify.error(message, {
    autoClose: options?.duration || 5000,
    position: "bottom-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows a warning toast notification
 * @param message The message to display
 * @param options Optional configuration options
 */
export const showWarning = (message: string, options?: ToastOptions) => {
  if (options?.useBuiltIn) {
    return useToastHook({
      title: "Uyarı",
      description: message,
      duration: options?.duration || 5000,
    });
  }
  
  return reactToastify.warning(message, {
    autoClose: options?.duration || 5000,
    position: "bottom-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows an info toast notification
 * @param message The message to display
 * @param options Optional configuration options
 */
export const showInfo = (message: string, options?: ToastOptions) => {
  if (options?.useBuiltIn) {
    return useToastHook({
      title: "Bilgi",
      description: message,
      duration: options?.duration || 5000,
    });
  }
  
  return reactToastify.info(message, {
    autoClose: options?.duration || 5000,
    position: "bottom-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Re-export the toast objects in case direct access is needed
export { reactToastify, useToastHook };
