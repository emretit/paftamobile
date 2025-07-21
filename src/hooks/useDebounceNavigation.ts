
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useDebounceNavigation = (delay: number = 300) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedNavigate = useCallback((to: string, options?: { replace?: boolean }) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      navigate(to, options);
    }, delay);
  }, [navigate, delay]);

  const cancelNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedNavigate, cancelNavigation };
};
