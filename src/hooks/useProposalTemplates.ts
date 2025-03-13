
import { useQuery } from "@tanstack/react-query";
import { ProposalTemplate } from "@/types/proposal-template";

// This would normally come from the database, but we'll hardcode it for now
const getProposalTemplates = async (): Promise<ProposalTemplate[]> => {
  return [
    {
      id: "1",
      name: "Standart Teklif",
      description: "Genel kullanım için standart teklif şablonu",
      icon: "file-text",
      category: "Genel",
      items: [
        {
          id: "item1",
          name: "Ürün/Hizmet",
          quantity: 1,
          unitPrice: 0,
          taxRate: 18,
          totalPrice: 0
        }
      ],
      prefilledFields: {
        title: "Standart Teklif",
        paymentTerm: "net30",
        validityDays: 30,
        internalNotes: "Standart teklif şablonu"
      }
    },
    {
      id: "2",
      name: "Bakım Sözleşmesi",
      description: "Yıllık bakım hizmetleri için teklif şablonu",
      icon: "wrench",
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
    }
  ];
};

export const useProposalTemplates = () => {
  return useQuery({
    queryKey: ["proposalTemplates"],
    queryFn: getProposalTemplates,
  });
};
