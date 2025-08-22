import { supabase } from '@/integrations/supabase/client';

/**
 * Güvenli logout işlemi
 */
export const safeSignOut = async () => {
  try {
    // Önce mevcut session'ı kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check error during logout:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.log('No active session to sign out from');
      return { success: true, message: 'No active session' };
    }

    // Logout işlemini gerçekleştir
    const { error } = await supabase.auth.signOut({
      scope: 'global'
    });
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Local storage'ı temizle
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Diğer potansiyel auth token'ları da temizle
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    return { success: true, message: 'Successfully signed out' };
    
  } catch (error: any) {
    console.error('Error during safe sign out:', error);
    
    // 403 hatası durumunda özel işlem
    if (error.message?.includes('403') || error.status === 403) {
      // Force cleanup
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      return { 
        success: false, 
        message: 'Authorization error, forced cleanup performed',
        error: error.message 
      };
    }
    
    return { 
      success: false, 
      message: 'Error during sign out',
      error: error.message 
    };
  }
};

/**
 * Session durumunu kontrol et
 */
export const checkSessionStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { 
        hasSession: false, 
        user: null, 
        error: error.message 
      };
    }
    
    return { 
      hasSession: !!session, 
      user: session?.user || null, 
      error: null 
    };
  } catch (error: any) {
    return { 
      hasSession: false, 
      user: null, 
      error: error.message 
    };
  }
};

/**
 * Authentication token'larını temizle
 */
export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Supabase specific cleanup
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    
    // Diğer potansiyel auth verilerini temizle
    const authKeys = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.expiresAt',
      'supabase.auth.expiresIn',
      'supabase.auth.accessToken',
      'supabase.auth.refreshToken'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
};

/**
 * Authentication durumunu yenile
 */
export const refreshAuthState = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error refreshing auth state:', error);
      clearAuthTokens();
      return false;
    }
    
    if (!session) {
      clearAuthTokens();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error refreshing auth state:', error);
    clearAuthTokens();
    return false;
  }
};

// Utility to safely handle Supabase query results
export function safeSupabaseResult<T>(data: any): T[] {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [];
  }
  return data as T[];
}

export function safeSupabaseSingle<T>(data: any): T | null {
  if (!data) {
    return null;
  }
  return data as T;
}

// Type guard to check if data is an error
export function isSupabaseError(data: any): boolean {
  return data && typeof data === 'object' && 'error' in data && data.error === true;
}