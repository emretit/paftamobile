import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface PdfDownloadDropdownProps {
  onDownloadTablePdf?: () => void;
  onGenerateTablePdf?: () => void;
  disabled?: boolean;
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadTablePdf,
  onGenerateTablePdf,
  disabled = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <FileText className="h-4 w-4 mr-2" />
          PDF Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onGenerateTablePdf} disabled={disabled}>
          <FileText className="h-4 w-4 mr-2" />
          PDF Önizle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadTablePdf} disabled={disabled}>
          <FileText className="h-4 w-4 mr-2" />
          PDF İndir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};