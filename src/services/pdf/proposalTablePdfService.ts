import { generate } from '@pdfme/generator';
import { table } from '@pdfme/schemas';
import { Proposal } from '@/types/proposal';
import { mapProposalToTemplateInputs } from '@/utils/proposalFieldMapping';

/**
 * Teklifler için dinamik tablo PDF export servisi
 * Her teklifin farklı sayıda detay satırı için pdfme table schema kullanır
 */

// pdfme table schema ile teklif template'i
export const PROPOSAL_TABLE_TEMPLATE = {
  basePdf: "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0KL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNDEKPj4Kc3RyZWFtCkJUCi9GMSA0OCBUZgovVGQKKFRla2xpZikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjczIDAwMDAwIG4gCjAwMDAwMDAzNjAgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NTcKJSVFT0Y=",
  schemas: [
    [
      // Şirket logosu
      {
        name: "companyLogo",
        type: "image",
        position: { x: 20, y: 20 },
        width: 40,
        height: 20,
      },
      
      // Başlık bilgileri
      {
        name: "proposalTitle",
        type: "text",
        position: { x: 20, y: 50 },
        width: 100,
        height: 12,
        fontSize: 18,
        fontName: "NotoSansJP",
        fontColor: "#333333",
      },
      
      {
        name: "proposalNumber",
        type: "text", 
        position: { x: 450, y: 50 },
        width: 120,
        height: 8,
        fontSize: 12,
        fontName: "NotoSansJP",
      },

      {
        name: "proposalDate",
        type: "text",
        position: { x: 450, y: 65 },
        width: 120,
        height: 8,
        fontSize: 10,
        fontName: "NotoSansJP",
      },

      // Müşteri bilgileri
      {
        name: "customerName",
        type: "text",
        position: { x: 20, y: 80 },
        width: 150,
        height: 8,
        fontSize: 12,
        fontName: "NotoSansJP",
        fontColor: "#666666",
      },

      {
        name: "customerCompany",
        type: "text",
        position: { x: 20, y: 95 },
        width: 150,
        height: 8,
        fontSize: 10,
        fontName: "NotoSansJP",
      },

      // Dinamik teklif kalemleri tablosu - ASIL TABLO
      {
        name: "itemsTable",
        type: "table",
        position: { x: 20, y: 120 },
        width: 555,
        height: 200, // Dinamik yükseklik
        content: "", // Dinamik içerik
        head: [["Ürün/Hizmet", "Açıklama", "Miktar", "Birim", "Birim Fiyat", "KDV %", "Toplam"]],
        headWidthPercentages: [25, 20, 10, 10, 15, 10, 15],
        tableStyles: {
          borderWidth: 0.5,
          borderColor: "#cccccc",
        },
        headStyles: {
          fillColor: "#f5f5f5",
          fontColor: "#333333",
          fontSize: 10,
          fontName: "NotoSansJP",
        },
        bodyStyles: {
          fontSize: 9,
          fontName: "NotoSansJP",
          fontColor: "#333333",
        },
      },

      // Toplam bilgileri - tablodan sonra dinamik konumda
      {
        name: "subtotal", 
        type: "text",
        position: { x: 400, y: 350 }, // Dinamik hesaplanacak
        width: 80,
        height: 8,
        fontSize: 10,
        fontName: "NotoSansJP",
        alignment: "right",
      },

      {
        name: "taxAmount",
        type: "text", 
        position: { x: 400, y: 365 },
        width: 80,
        height: 8,
        fontSize: 10,
        fontName: "NotoSansJP", 
        alignment: "right",
      },

      {
        name: "totalAmount",
        type: "text",
        position: { x: 400, y: 385 },
        width: 80,
        height: 12,
        fontSize: 14,
        fontName: "NotoSansJP",
        fontColor: "#0066cc",
        alignment: "right",
      },

      // Şartlar
      {
        name: "paymentTerms",
        type: "text",
        position: { x: 20, y: 420 },
        width: 250,
        height: 30,
        fontSize: 9,
        fontName: "NotoSansJP",
      },

      {
        name: "deliveryTerms", 
        type: "text",
        position: { x: 300, y: 420 },
        width: 250,
        height: 30,
        fontSize: 9,
        fontName: "NotoSansJP",
      },

      // Satış temsilcisi
      {
        name: "employeeName",
        type: "text",
        position: { x: 20, y: 480 },
        width: 150,
        height: 8,
        fontSize: 10,
        fontName: "NotoSansJP",
      },

      {
        name: "employeePhone",
        type: "text",
        position: { x: 20, y: 495 },
        width: 150, 
        height: 8,
        fontSize: 9,
        fontName: "NotoSansJP",
      },
    ]
  ],
};

/**
 * Dinamik yükseklik hesaplama - tablo satır sayısına göre
 */
export function calculateDynamicPositions(itemCount: number) {
  const baseTableY = 120;
  const headerHeight = 15;
  const rowHeight = 15;
  const tableMargin = 20;
  
  const tableHeight = headerHeight + (itemCount * rowHeight);
  const afterTableY = baseTableY + tableHeight + tableMargin;

  return {
    tableHeight,
    subtotalY: afterTableY,
    taxAmountY: afterTableY + 15,
    totalAmountY: afterTableY + 35,
    termsY: afterTableY + 60,
    employeeY: afterTableY + 100,
  };
}

/**
 * Template'i dinamik veri ile güncelle
 */
export function updateTemplateForProposal(proposal: Proposal) {
  const itemCount = proposal.items?.length || 0;
  const positions = calculateDynamicPositions(itemCount);
  
  // Template'i klonla
  const template = JSON.parse(JSON.stringify(PROPOSAL_TABLE_TEMPLATE));
  const schema = template.schemas[0];
  
  // Tablo yüksekliğini güncelle
  const tableField = schema.find((field: any) => field.name === "itemsTable");
  if (tableField) {
    tableField.height = positions.tableHeight;
  }

  // Diğer elementlerin konumlarını güncelle
  const updatePosition = (fieldName: string, y: number) => {
    const field = schema.find((f: any) => f.name === fieldName);
    if (field) {
      field.position.y = y;
    }
  };

  updatePosition("subtotal", positions.subtotalY);
  updatePosition("taxAmount", positions.taxAmountY);
  updatePosition("totalAmount", positions.totalAmountY);
  updatePosition("paymentTerms", positions.termsY);
  updatePosition("deliveryTerms", positions.termsY);
  updatePosition("employeeName", positions.employeeY);
  updatePosition("employeePhone", positions.employeeY + 15);

  return template;
}

/**
 * Ana PDF oluşturma fonksiyonu
 */
export async function generateProposalTablePdf(proposal: Proposal): Promise<Uint8Array> {
  try {
    console.log('🚀 Teklif PDF oluşturuluyor...', {
      proposalId: proposal.id,
      itemCount: proposal.items?.length || 0
    });

    // Template'i dinamik veri ile güncelle
    const template = updateTemplateForProposal(proposal);
    
    // Proposal verilerini template inputlarına çevir
    const inputs = mapProposalToTemplateInputs(proposal, template);
    
    console.log('📋 PDF Template Inputs:', inputs);
    console.log('🎯 Items Table Data:', inputs.itemsTable);

    // PDF oluştur
    const pdf = await generate({
      template,
      inputs: [inputs], // pdfme array format
      plugins: {
        table, // table schema plugin
      },
    });

    console.log('✅ PDF başarıyla oluşturuldu');
    return pdf;

  } catch (error) {
    console.error('❌ PDF oluşturma hatası:', error);
    throw new Error(`PDF oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}

/**
 * PDF'i blob olarak indir
 */
export function downloadProposalTablePdf(proposal: Proposal) {
  return generateProposalTablePdf(proposal).then(pdfBytes => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `teklif-${proposal.number || proposal.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  });
}

/**
 * Birden fazla teklif için toplu PDF export
 */
export async function generateMultipleProposalsPdf(proposals: Proposal[]): Promise<Uint8Array> {
  try {
    console.log('🚀 Çoklu teklif PDF oluşturuluyor...', {
      proposalCount: proposals.length
    });

    // Her teklif için ayrı input oluştur
    const allInputs = [];
    let combinedTemplate = PROPOSAL_TABLE_TEMPLATE;

    for (const proposal of proposals) {
      const template = updateTemplateForProposal(proposal);
      const inputs = mapProposalToTemplateInputs(proposal, template);
      allInputs.push(inputs);
      
      // İlk template'i kullan, sonrakiler için sayfa ekle
      if (allInputs.length === 1) {
        combinedTemplate = template;
      }
    }

    // Çoklu sayfa PDF oluştur
    const pdf = await generate({
      template: combinedTemplate,
      inputs: allInputs,
      plugins: {
        table,
      },
    });

    console.log('✅ Çoklu PDF başarıyla oluşturuldu');
    return pdf;

  } catch (error) {
    console.error('❌ Çoklu PDF oluşturma hatası:', error);
    throw new Error(`Çoklu PDF oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}
