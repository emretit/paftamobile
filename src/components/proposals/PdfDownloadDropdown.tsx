import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface PdfDownloadDropdownProps {
  onDownloadPdf?: () => void;
  onPreviewPdf?: () => void;
  disabled?: boolean;
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadPdf,
  onPreviewPdf,
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
        <DropdownMenuItem onClick={onPreviewPdf} disabled={disabled}>
          <FileText className="h-4 w-4 mr-2" />
          Önizle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadPdf} disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          İndir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};