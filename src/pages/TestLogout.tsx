import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogout } from '@/components/navbar/useLogout';
import { useAuthState } from '@/components/navbar/useAuthState';
import { checkSessionStatus, clearAuthTokens } from '@/lib/supabase-utils';

const TestLogout = () => {
  const { handleLogout, isLoggingOut } = useLogout();
  const { user, session, loading } = useAuthState();

  const testSessionStatus = async () => {
    const result = await checkSessionStatus();
    console.log('Session Status:', result);
    alert(`Session Status: ${JSON.stringify(result, null, 2)}`);
  };

  const testClearTokens = () => {
    clearAuthTokens();
    alert('Auth tokens cleared!');
  };

  const testDirectLogout = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Direct logout error:', error);
        alert(`Direct logout error: ${error.message}`);
      } else {
        alert('Direct logout successful!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logout Test Sayfası</CardTitle>
            <CardDescription>
              Bu sayfa logout işlemini test etmek için kullanılır
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Kullanıcı Bilgileri</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
                  <p><strong>Session:</strong> {session ? 'Aktif' : 'Yok'}</p>
                  <p><strong>Loading:</strong> {loading ? 'Evet' : 'Hayır'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Local Storage</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Auth Token:</strong> {localStorage.getItem('supabase.auth.token') ? 'Var' : 'Yok'}</p>
                  <p><strong>Storage Keys:</strong> {localStorage.length}</p>
                  <p><strong>Session Storage:</strong> {sessionStorage.length}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Test İşlemleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Güvenli Çıkış'}
                </Button>
                
                <Button 
                  onClick={testDirectLogout}
                  variant="outline"
                  className="w-full"
                >
                  Direkt Logout
                </Button>
                
                <Button 
                  onClick={testSessionStatus}
                  variant="outline"
                  className="w-full"
                >
                  Session Durumu
                </Button>
                
                <Button 
                  onClick={testClearTokens}
                  variant="outline"
                  className="w-full"
                >
                  Token Temizle
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Debug Bilgileri</h3>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                <p><strong>User:</strong> {JSON.stringify(user, null, 2)}</p>
                <p><strong>Session:</strong> {JSON.stringify(session, null, 2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestLogout;
