import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testRoutes = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/products', label: 'Ürünler' },
    { path: '/contacts', label: 'Müşteriler' },
    { path: '/proposals', label: 'Teklifler' },
    { path: '/crm', label: 'CRM' },
    { path: '/settings', label: 'Ayarlar' },
    { path: '/', label: 'Ana Sayfa' },
    { path: '/about', label: 'Hakkımızda' }
  ];

  const handleNavigation = (path: string) => {
    console.log('Profile page: Navigating to', path);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile / Navigation Test</h1>
        
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Current Location</h2>
          <p className="text-muted-foreground">
            <strong>Pathname:</strong> {location.pathname}
          </p>
          <p className="text-muted-foreground">
            <strong>Search:</strong> {location.search || 'None'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {testRoutes.map((route) => (
            <Button
              key={route.path}
              variant={location.pathname === route.path ? "default" : "outline"}
              onClick={() => handleNavigation(route.path)}
              className="h-12"
            >
              {route.label}
            </Button>
          ))}
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Navigation Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p>🚀 Profile sayfası başarıyla yüklendi</p>
            <p>🔍 Console'da navigation log'larını kontrol edin</p>
            <p>📍 Mevcut konum: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code></p>
            <p>🧭 Navigation test için yukarıdaki butonları kullanın</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;