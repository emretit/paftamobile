// Seçilebilir şartlar sistemi için yardımcı fonksiyonlar

// Şart kategorileri ve seçenekleri - ProposalTemplateTerms.tsx ile senkronize
const TERMS_CATEGORIES = {
  payment: {
    title: "Ödeme Şartları",
    options: [
      { id: "payment_prepaid", label: "Peşin Ödeme", text: "%100 peşin ödeme yapılacaktır." },
      { id: "payment_30_70", label: "30-70 Avans", text: "%30 avans, %70 işin tamamlanmasının ardından ödenecektir." },
      { id: "payment_50_50", label: "50-50 Avans", text: "%50 avans, %50 işin tamamlanmasının ardından ödenecektir." },
      { id: "payment_net30", label: "30 Gün Vadeli", text: "Fatura tarihinden itibaren 30 gün vadeli ödenecektir." },
      { id: "payment_installment", label: "Taksitli", text: "3 eşit taksitte ödenecek, ilk taksit peşin olacaktır." }
    ]
  },
  pricing: {
    title: "Fiyatlar",
    options: [
      { id: "pricing_vat_excluded", label: "KDV Hariç", text: "Belirtilen fiyatlar KDV hariçtir." },
      { id: "pricing_currency_tl", label: "TL Cinsinden", text: "Tüm fiyatlar Türk Lirası (TL) cinsindendir." },
      { id: "pricing_usd_rate", label: "USD Kuru", text: "Teklifimiz USD cinsinden GARANTİ Bankası Döviz Satış Kuruna göre hazırlanmıştır." },
      { id: "pricing_validity", label: "Geçerlilik", text: "Bu teklif 30 gün süreyle geçerlidir." }
    ]
  },
  warranty: {
    title: "Garanti",
    options: [
      { id: "warranty_1year", label: "1 Yıl", text: "Ürünlerimiz fatura tarihinden itibaren 1 yıl garantilidir." },
      { id: "warranty_2year", label: "2 Yıl", text: "Ürünlerimiz fatura tarihinden itibaren 2(iki) yıl garantilidir." },
      { id: "warranty_manufacturer", label: "Üretici Garantisi", text: "Ürünler üretici garantisi kapsamındadır." }
    ]
  },
  delivery: {
    title: "Stok ve Teslimat",
    options: [
      { id: "delivery_standard", label: "Standart Teslimat", text: "Ürünler siparişten sonra 15 gün içinde teslim edilecektir." },
      { id: "delivery_express", label: "Hızlı Teslimat", text: "Ürünler siparişten sonra 7 gün içinde teslim edilecektir." },
      { id: "delivery_custom", label: "Özel Üretim", text: "Ürünler sipariş sonrası üretime alınacaktır. Tahmini iş süresi ürün teslimatından sonra belirlenir." }
    ]
  }
};

export interface SelectedTerms {
  payment?: string[];
  pricing?: string[];
  warranty?: string[];
  delivery?: string[];
}

export interface CustomTerms {
  payment?: string;
  pricing?: string;
  warranty?: string;
  delivery?: string;
}

/**
 * Seçilen şartları kategorize text formatına çevirir
 */
export const formatSelectedTermsForPDF = (
  selectedTerms?: SelectedTerms,
  customTerms?: CustomTerms
): { [category: string]: { title: string; terms: string[] } } => {
  const result: { [category: string]: { title: string; terms: string[] } } = {};

  // Seçilen şartları işle
  if (selectedTerms) {
    Object.entries(selectedTerms).forEach(([categoryKey, termIds]) => {
      if (termIds && termIds.length > 0) {
        const category = TERMS_CATEGORIES[categoryKey as keyof typeof TERMS_CATEGORIES];
        if (category) {
          const terms: string[] = [];
          
          // Seçilen şartların text'lerini bul
          termIds.forEach(termId => {
            const option = category.options.find(opt => opt.id === termId);
            if (option) {
              terms.push(option.text);
            }
          });
          
          // Custom şart varsa ekle
          const customTerm = customTerms?.[categoryKey as keyof CustomTerms];
          if (customTerm) {
            terms.push(customTerm);
          }
          
          if (terms.length > 0) {
            result[categoryKey] = {
              title: category.title,
              terms
            };
          }
        }
      }
    });
  }

  return result;
};

/**
 * Tüm şartları tek bir string olarak döndürür (geriye uyumluluk için)
 */
export const formatSelectedTermsAsText = (
  selectedTerms?: SelectedTerms,
  customTerms?: CustomTerms
): string => {
  const formattedTerms = formatSelectedTermsForPDF(selectedTerms, customTerms);
  const sections: string[] = [];

  Object.values(formattedTerms).forEach(({ title, terms }) => {
    if (terms.length > 0) {
      sections.push(`${title.toUpperCase()}:\n${terms.map(term => `• ${term}`).join('\n')}`);
    }
  });

  return sections.join('\n\n');
};