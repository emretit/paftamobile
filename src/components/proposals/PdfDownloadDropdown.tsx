import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';

interface PdfDownloadDropdownProps {
  onDownloadTablePdf?: () => void;  // Dinamik tablo PDF
  onGenerateTablePdf?: () => void;  // Dinamik tablo önizleme
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
          <Table className="h-4 w-4 mr-2" />
          PDF Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Dinamik Tablo PDF Export */}
        <DropdownMenuItem onClick={onGenerateTablePdf} disabled={disabled}>
          <Table className="h-4 w-4 mr-2" />
          Detaylı Tablo Önizle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadTablePdf} disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Detaylı Tablo İndir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};