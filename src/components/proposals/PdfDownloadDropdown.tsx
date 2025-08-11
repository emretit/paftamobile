import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface PdfDownloadDropdownProps {
  onDownloadPdf?: () => void;
  onGeneratePdf?: () => void;
  disabled?: boolean;
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadPdf,
  onGeneratePdf,
  disabled = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onGeneratePdf} disabled={disabled}>
          <FileText className="h-4 w-4 mr-2" />
          PDF Oluştur
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadPdf} disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          İndir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};