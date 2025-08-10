import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, ChevronDown, Eye } from "lucide-react";
import { usePDFMeTemplates } from "@/hooks/usePDFMeTemplates";
import { Proposal } from "@/types/proposal";
import { pdfmeGenerator } from "@/utils/pdfmeGenerator";
import { toast } from "sonner";

interface PdfDownloadDropdownProps {
  proposal: Proposal;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  proposal,
  size = "sm",
  variant = "outline"
}) => {
  const { templates, isLoading } = usePDFMeTemplates();

  const handlePDFMeExport = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast.error('Şablon bulunamadı');
        return;
      }

      await pdfmeGenerator.generateProposalPDF(proposal, template.template_json);
      toast.success('PDF başarıyla oluşturuldu');
    } catch (error) {
      console.error('PDFMe export error:', error);
      toast.error('PDF oluşturulamadı');
    }
  };

  const handlePreview = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast.error('Şablon bulunamadı');
        return;
      }

      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table } = await import('@pdfme/schemas');

      // Convert proposal items to table format
      const proposalItems = proposal.items && proposal.items.length > 0 
        ? proposal.items.map((item: any) => [
            item.name || 'Ürün',
            (item.quantity || 0).toString(),
            item.unit || 'Adet',
            item.unit_price ? `${item.unit_price.toLocaleString('tr-TR')} ₺` : '0 ₺',
            item.total_price ? `${item.total_price.toLocaleString('tr-TR')} ₺` : '0 ₺'
          ])
        : [['Ürün/Hizmet bulunamadı', '-', '-', '-', '-']];

      // Map proposal data to template inputs
      const inputs = {
        companyName: 'Şirket Adı',
        proposalTitle: proposal.title || 'Teklif Başlığı',
        proposalNumber: proposal.proposal_number || 'TKL-001',
        customerName: proposal.customer_name || 'Müşteri Adı',
        totalAmount: proposal.total_amount ? `${proposal.total_amount.toLocaleString('tr-TR')} ₺` : '0 ₺',
        createdDate: proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
        validUntil: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
        paymentTerms: proposal.payment_terms || 'Standart ödeme koşulları',
        notes: proposal.notes || '',
        proposalItemsTable: proposalItems,
        proposalQRCode: `${proposal.proposal_number || 'TKL-001'} | ${proposal.customer_name || 'Müşteri'} | ${proposal.total_amount ? proposal.total_amount.toLocaleString('tr-TR') : '0'} ₺`
      };

      const pdf = await generate({
        template: template.template_json,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode, table } as any
      });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  if (templates.length === 0) {
    return null; // PDFMe şablonu yoksa gösterme
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} className="gap-1">
          <FileText size={14} />
          PDFMe
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          PDFMe Şablonları
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Şablonlar yükleniyor...
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="space-y-1">
              <div className="px-2 py-1">
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(template.updated_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="flex gap-1 px-2 pb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(template.id)}
                  className="flex-1 h-7 text-xs"
                >
                  <Eye size={12} className="mr-1" />
                  Önizle
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePDFMeExport(template.id)}
                  className="flex-1 h-7 text-xs"
                >
                  <FileText size={12} className="mr-1" />
                  İndir
                </Button>
              </div>
              <DropdownMenuSeparator />
            </div>
          ))
        )}
        
        {templates.length > 0 && (
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">
            PDFMe ile oluşturulmuş şablonlar
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
