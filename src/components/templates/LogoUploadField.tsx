import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoUploadFieldProps {
  logoUrl?: string;
  onLogoChange: (url: string | null) => void;
}

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({ logoUrl, onLogoChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl || null);

  // Update previewUrl when logoUrl prop changes
  React.useEffect(() => {
    setPreviewUrl(logoUrl || null);
  }, [logoUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setIsUploading(true);
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Logo yüklemek için giriş yapmanız gerekiyor');
        return;
      }

      // Create unique filename with timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `template-logos/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('JWT')) {
          toast.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else {
          toast.error(`Logo yüklenirken hata: ${error.message}`);
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onLogoChange(publicUrl);
      toast.success('Logo başarıyla yüklendi');
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Logo yüklenirken hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onLogoChange(null);
  };

  return (
    <div className="space-y-3">
      <Label>Logo Yükle</Label>
      
      {/* File Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('logo-upload')?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Yükleniyor...' : 'Logo Seç'}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
          >
            <X className="h-4 w-4 mr-2" />
            Kaldır
          </Button>
        )}
      </div>
      
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Logo Önizleme</span>
          </div>
          <img
            src={previewUrl}
            alt="Logo preview"
            className="max-w-full h-20 object-contain border rounded"
            onError={() => {
              toast.error('Logo yüklenemedi');
              setPreviewUrl(null);
              onLogoChange(null);
            }}
          />
        </div>
      )}
    </div>
  );
};