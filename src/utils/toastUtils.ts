
import { toast as sonnerToast } from "sonner";
import { toast as useToastHook } from "@/hooks/use-toast";

type ToastOptions = {
  /** Duration in milliseconds */
  duration?: number;
  /** Whether to use the shadcn/ui toast or sonner */
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
  
  return sonnerToast.success(message, {
    duration: options?.duration || 5000,
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
  
  return sonnerToast.error(message, {
    duration: options?.duration || 5000,
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
  
  return sonnerToast.warning(message, {
    duration: options?.duration || 5000,
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
  
  return sonnerToast.info(message, {
    duration: options?.duration || 5000,
  });
};

// Re-export the toast objects in case direct access is needed
export { sonnerToast, useToastHook };
