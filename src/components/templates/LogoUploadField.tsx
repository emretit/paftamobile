import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useTemplateLogoUpload } from '@/hooks/useTemplateLogoUpload';

interface LogoUploadFieldProps {
  logoUrl?: string;
  onLogoChange: (url: string | null) => void;
  disabled?: boolean;
}

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  logoUrl,
  onLogoChange,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const { uploadTemplateLogo, deleteTemplateLogo, uploading } = useTemplateLogoUpload();

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    const uploadedUrl = await uploadTemplateLogo(file);
    if (uploadedUrl) {
      onLogoChange(uploadedUrl);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleRemoveLogo = async () => {
    if (logoUrl) {
      const success = await deleteTemplateLogo(logoUrl);
      if (success) {
        onLogoChange(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      <Label>Logo</Label>
      
      {logoUrl ? (
        <div className="relative border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded border bg-background flex items-center justify-center overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Logo yüklendi</p>
                <p className="text-xs text-muted-foreground">Logo PDF'de görüntülenecek</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <div className="mx-auto w-8 h-8 text-muted-foreground">
              <Image className="w-full h-full" />
            </div>
            <div>
              <p className="text-sm font-medium">Logo yüklemek için tıklayın</p>
              <p className="text-xs text-muted-foreground">
                ya da dosyayı buraya sürükleyin
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              PNG, JPG, SVG (max 5MB)
            </div>
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled || uploading}
          />
        </div>
      )}
      
      {uploading && (
        <div className="text-xs text-muted-foreground">Logo yükleniyor...</div>
      )}
    </div>
  );
};