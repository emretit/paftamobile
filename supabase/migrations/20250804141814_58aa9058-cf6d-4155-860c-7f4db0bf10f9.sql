-- Create proposal_terms table to store predefined terms
CREATE TABLE public.proposal_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('payment', 'pricing', 'warranty', 'delivery')),
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_terms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all active terms" 
ON public.proposal_terms 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create terms" 
ON public.proposal_terms 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own terms" 
ON public.proposal_terms 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own terms" 
ON public.proposal_terms 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER trigger_proposal_terms_updated_at
  BEFORE UPDATE ON public.proposal_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default terms
INSERT INTO public.proposal_terms (category, label, text, is_default, sort_order) VALUES
-- Payment terms
('payment', 'Peşin Ödeme', '%100 peşin ödeme yapılacaktır.', true, 1),
('payment', '30-70 Avans', '%30 avans, %70 işin tamamlanmasının ardından ödenecektir.', true, 2),
('payment', '50-50 Avans', '%50 avans, %50 işin tamamlanmasının ardından ödenecektir.', true, 3),
('payment', '30 Gün Vadeli', 'Fatura tarihinden itibaren 30 gün vadeli ödenecektir.', true, 4),

-- Pricing terms
('pricing', 'KDV Hariç', 'Belirtilen fiyatlar KDV hariçtir.', true, 1),
('pricing', 'TL Cinsinden', 'Tüm fiyatlar Türk Lirası (TL) cinsindendir.', true, 2),
('pricing', 'USD Kuru', 'Teklifimiz USD cinsinden GARANTİ Bankası Döviz Satış Kuruna göre hazırlanmıştır.', true, 3),
('pricing', 'Geçerlilik', 'Bu teklif 30 gün süreyle geçerlidir.', true, 4),

-- Warranty terms
('warranty', '1 Yıl Garanti', 'Ürünlerimiz fatura tarihinden itibaren 1 yıl garantilidir.', true, 1),
('warranty', '2 Yıl Garanti', 'Ürünlerimiz fatura tarihinden itibaren 2(iki) yıl garantilidir.', true, 2),
('warranty', 'Üretici Garantisi', 'Ürünler üretici garantisi kapsamındadır.', true, 3),

-- Delivery terms
('delivery', 'Standart Teslimat', 'Ürünler siparişten sonra 15 gün içinde teslim edilecektir.', true, 1),
('delivery', 'Hızlı Teslimat', 'Ürünler siparişten sonra 7 gün içinde teslim edilecektir.', true, 2),
('delivery', 'Özel Üretim', 'Ürünler sipariş sonrası üretime alınacaktır. Tahmini iş süresi ürün teslimatından sonra belirlenir.', true, 3);