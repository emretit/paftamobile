import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoUploadFieldProps {
  logoUrl?: string;
  onLogoChange: (url: string | null) => void;
  logoPosition?: 'left' | 'center' | 'right';
  onPositionChange?: (position: 'left' | 'center' | 'right') => void;
  logoSize?: number;
  onSizeChange?: (size: number) => void;
}

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({ 
  logoUrl, 
  onLogoChange,
  logoPosition = 'left',
  onPositionChange,
  logoSize = 100,
  onSizeChange
}) => {
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
      <Label>Logo</Label>
      
      {/* Compact Logo Controls Row */}
      <div className="flex items-center gap-3">
        {/* Logo Upload/Remove */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('logo-upload')?.click()}
            disabled={isUploading}
            className="h-8 px-3"
          >
            <Upload className="h-3 w-3 mr-1" />
            {isUploading ? '...' : previewUrl ? 'Değiştir' : 'Seç'}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              className="h-8 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Position & Size Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Pozisyon</Label>
            <Select value={logoPosition} onValueChange={onPositionChange}>
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Sol</SelectItem>
                <SelectItem value="center">Orta</SelectItem>
                <SelectItem value="right">Sağ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Boyut</Label>
            <Input
              type="number"
              value={logoSize}
              onChange={(e) => onSizeChange?.(Number(e.target.value))}
              className="h-8 w-16 text-center"
              min="20"
              max="200"
            />
          </div>
        </div>
      </div>
      
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Compact Status Indicator */}
      {previewUrl && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 w-fit">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span>Logo yüklendi</span>
        </div>
      )}
    </div>
  );
};