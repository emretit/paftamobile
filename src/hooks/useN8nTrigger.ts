import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface N8nCredentials {
  instanceUrl: string;
  username: string;
  password: string;
}

export const useN8nTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test n8n authentication and connection
  const testN8nConnection = async (credentials: N8nCredentials) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Testing n8n connection to: ${credentials.instanceUrl}`);

      // Clean URL (remove trailing slash)
      const baseUrl = credentials.instanceUrl.replace(/\/$/, '');
      
      // Test 1: Check if n8n instance is reachable
      const healthResponse = await fetch(`${baseUrl}/healthz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        throw new Error(`n8n instance'a erişilemiyor (${healthResponse.status})`);
      }

      // Test 2: Try to authenticate
      const loginResponse = await fetch(`${baseUrl}/rest/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.text();
        throw new Error(`Kimlik doğrulama başarısız: ${errorData}`);
      }

      const loginData = await loginResponse.json();
      
      console.log('✅ n8n connection test successful');
      
      toast.success('n8n bağlantısı başarılı!', {
        description: `${baseUrl} ile bağlantı kuruldu`
      });

      return {
        success: true,
        message: 'Bağlantı başarılı',
        sessionData: loginData
      };

    } catch (err: any) {
      const errorMessage = err.message || 'n8n bağlantı testi başarısız';
      console.error('❌ n8n connection test failed:', err);
      setError(errorMessage);
      
      toast.error('n8n Bağlantı Hatası', {
        description: errorMessage
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Get n8n credentials from saved preferences
  const getN8nCredentials = async (): Promise<N8nCredentials | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', 'n8n_credentials')
        .single();

      if (error || !data?.preference_value) {
        return null;
      }

      return data.preference_value;
    } catch (error) {
      console.error('Error getting n8n credentials:', error);
      return null;
    }
  };

  return {
    testN8nConnection,
    getN8nCredentials,
    loading,
    error
  };
};