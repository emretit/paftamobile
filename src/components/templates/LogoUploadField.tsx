import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      const fileName = `logos/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
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

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setPreviewUrl(url || null);
    onLogoChange(url || null);
  };

  return (
    <div className="space-y-3">
      <Label>Logo URL veya Dosya Yükle</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Input
          placeholder="Logo URL'si girin veya dosya yükleyin"
          value={previewUrl || ''}
          onChange={handleUrlInput}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('logo-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
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
      </div>

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