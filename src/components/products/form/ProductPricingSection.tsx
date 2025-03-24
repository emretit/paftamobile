
import { UseFormReturn, useWatch } from "react-hook-form";
import { ProductFormSchema } from "./ProductFormSchema";
import PriceInput from "./pricing/PriceInput";
import TaxRateSelect from "./pricing/TaxRateSelect";
import CurrencySelect from "./pricing/CurrencySelect";
import PricePreviewCard from "./pricing/PricePreviewCard";

interface ProductPricingSectionProps {
  form: UseFormReturn<ProductFormSchema>;
}

const ProductPricingSection = ({ form }: ProductPricingSectionProps) => {
  const price = useWatch({
    control: form.control,
    name: "price",
    defaultValue: 0,
  });

  const discountPrice = useWatch({
    control: form.control,
    name: "discount_price",
    defaultValue: null,
  });

  const taxRate = useWatch({
    control: form.control,
    name: "tax_rate",
    defaultValue: 18,
  });

  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: "TRY",
  });
  
  const purchasePrice = useWatch({
    control: form.control,
    name: "purchase_price",
    defaultValue: undefined,
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CurrencySelect form={form} />
          
          <PriceInput 
            form={form} 
            name="price" 
            label="Satış Fiyatı" 
            isRequired={true} 
          />

          <PriceInput 
            form={form} 
            name="discount_price" 
            label="İndirimli Fiyat" 
            description="İndirim yoksa boş bırakabilirsiniz" 
          />
          
          <PriceInput 
            form={form} 
            name="purchase_price" 
            label="Alış Fiyatı" 
            description="Ürünün alış fiyatı (isteğe bağlı)" 
          />

          <TaxRateSelect form={form} />
        </div>

        <PricePreviewCard 
          price={price} 
          discountPrice={discountPrice} 
          taxRate={taxRate} 
          currency={currency}
          purchasePrice={purchasePrice}
        />
      </div>
    </div>
  );
};

export default ProductPricingSection;
