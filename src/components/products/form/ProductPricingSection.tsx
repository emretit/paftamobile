
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ProductFormSchema } from "./ProductFormSchema";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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

  const formatPrice = (value: number | null) => {
    if (value === null) return "0,00";
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency
    }).format(value);
  };

  const calculateTax = (price: number) => {
    return price * (taxRate / 100);
  };

  const calculateDiscount = (originalPrice: number, discountedPrice: number | null) => {
    if (!discountedPrice || originalPrice === 0) return 0;
    return ((originalPrice - discountedPrice) / originalPrice) * 100;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satış Fiyatı *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İndirimli Fiyat</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  İndirim yoksa boş bırakabilirsiniz
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KDV Oranı</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="KDV oranı seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">%0</SelectItem>
                    <SelectItem value="1">%1</SelectItem>
                    <SelectItem value="8">%8</SelectItem>
                    <SelectItem value="18">%18</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TRY">Türk Lirası (TRY)</SelectItem>
                    <SelectItem value="USD">Amerikan Doları (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">İngiliz Sterlini (GBP)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="p-6 bg-muted/50 flex flex-col justify-center space-y-6">
          <h3 className="text-lg font-semibold text-center mb-2">
            Fiyat Önizleme
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Satış Fiyatı:</span>
              <span className="font-medium">{formatPrice(price)}</span>
            </div>
            
            {discountPrice !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İndirimli Fiyat:</span>
                  <span className="font-medium text-green-600">{formatPrice(discountPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İndirim Oranı:</span>
                  <span className="font-medium">%{Math.round(calculateDiscount(price, discountPrice))}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">KDV Tutarı:</span>
              <span className="font-medium">{formatPrice(calculateTax(discountPrice || price))}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-medium">KDV Dahil Fiyat:</span>
              <span className="font-bold">
                {formatPrice((discountPrice || price) + calculateTax(discountPrice || price))}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductPricingSection;
