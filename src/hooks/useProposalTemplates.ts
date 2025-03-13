
import { useQuery } from "@tanstack/react-query";
import { ProposalTemplate } from "@/types/proposal-template";

// This would normally come from the database, but we'll hardcode it for now
const getProposalTemplates = async (): Promise<ProposalTemplate[]> => {
  return [
    {
      id: "1",
      name: "Standart Ürün Teklifi",
      description: "Ürün satışları için standart teklif şablonu",
      icon: "shopping-cart",
      category: "Ürün",
      items: [
        {
          id: "item1",
          name: "Ürün A",
          quantity: 1,
          unitPrice: 0,
          taxRate: 18,
          totalPrice: 0
        }
      ],
      prefilledFields: {
        title: "Ürün Teklifi",
        paymentTerm: "net30",
        validityDays: 30,
        internalNotes: "Standart ürün teklifi şablonu"
      }
    },
    {
      id: "2",
      name: "Hizmet Teklifi",
      description: "Hizmet satışları için genel teklif şablonu",
      icon: "file-text",
      category: "Hizmet",
      items: [
        {
          id: "item1",
          name: "Danışmanlık Hizmeti",
          quantity: 8,
          unitPrice: 1500,
          taxRate: 18,
          totalPrice: 14160
        },
        {
          id: "item2",
          name: "Proje Yönetimi",
          quantity: 1,
          unitPrice: 5000,
          taxRate: 18,
          totalPrice: 5900
        }
      ],
      prefilledFields: {
        title: "Hizmet Teklifi",
        paymentTerm: "custom",
        validityDays: 15,
        internalNotes: "Standart hizmet teklifi şablonu"
      }
    },
    {
      id: "3",
      name: "Bakım Sözleşmesi",
      description: "Yıllık bakım hizmetleri için teklif şablonu",
      icon: "truck",
      category: "Hizmet",
      items: [
        {
          id: "item1",
          name: "Yıllık Bakım Paketi",
          quantity: 1,
          unitPrice: 12000,
          taxRate: 18,
          totalPrice: 14160
        },
        {
          id: "item2",
          name: "7/24 Destek",
          quantity: 12,
          unitPrice: 1000,
          taxRate: 18,
          totalPrice: 14160
        }
      ],
      prefilledFields: {
        title: "Yıllık Bakım Sözleşmesi",
        paymentTerm: "prepaid",
        validityDays: 30,
        internalNotes: "Bu bir yıllık bakım sözleşmesi şablonudur."
      }
    },
    {
      id: "4",
      name: "Yazılım Çözümü",
      description: "Yazılım satışı ve kurulumu için teklif şablonu",
      icon: "file-spreadsheet",
      category: "Ürün + Hizmet",
      items: [
        {
          id: "item1",
          name: "Yazılım Lisansı",
          quantity: 5,
          unitPrice: 2500,
          taxRate: 18,
          totalPrice: 14750
        },
        {
          id: "item2",
          name: "Kurulum ve Eğitim",
          quantity: 1,
          unitPrice: 7500,
          taxRate: 18,
          totalPrice: 8850
        },
        {
          id: "item3",
          name: "İlk Yıl Bakım",
          quantity: 1,
          unitPrice: 3000,
          taxRate: 18,
          totalPrice: 3540
        }
      ],
      prefilledFields: {
        title: "Yazılım Çözümü Teklifi",
        paymentTerm: "net30",
        validityDays: 30
      }
    },
    {
      id: "5",
      name: "Donanım Satışı",
      description: "Donanım ürünleri satışı için teklif şablonu",
      icon: "package",
      category: "Ürün",
      items: [
        {
          id: "item1",
          name: "Sunucu",
          quantity: 2,
          unitPrice: 15000,
          taxRate: 18,
          totalPrice: 35400
        },
        {
          id: "item2",
          name: "Network Switch",
          quantity: 3,
          unitPrice: 5000,
          taxRate: 18,
          totalPrice: 17700
        }
      ],
      prefilledFields: {
        title: "Donanım Teklifi",
        paymentTerm: "prepaid",
        validityDays: 15
      }
    }
  ];
};

export const useProposalTemplates = () => {
  return useQuery({
    queryKey: ["proposalTemplates"],
    queryFn: getProposalTemplates,
  });
};
