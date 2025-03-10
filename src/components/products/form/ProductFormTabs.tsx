
import { Form } from "@/components/ui/form";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "./ProductFormSchema";
import ProductGeneralSection from "./ProductGeneralSection";
import ProductPricingSection from "./ProductPricingSection";
import ProductInventorySection from "./ProductInventorySection";
import ProductSupplierSection from "./supplier/ProductSupplierSection";

interface ProductFormTabsProps {
  form: UseFormReturn<ProductFormSchema>;
  onSubmit: (values: ProductFormSchema, addAnother: boolean) => Promise<{ resetForm: boolean }>;
}

const ProductFormTabs = ({ form, onSubmit }: ProductFormTabsProps) => {
  // Handle form submission with only the values parameter
  const handleSubmit = (values: ProductFormSchema) => {
    return onSubmit(values, false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CustomTabs defaultValue="general" className="w-full">
          <CustomTabsList className="grid grid-cols-4 mb-8">
            <CustomTabsTrigger value="general">Genel Bilgiler</CustomTabsTrigger>
            <CustomTabsTrigger value="pricing">Fiyatlandırma</CustomTabsTrigger>
            <CustomTabsTrigger value="inventory">Stok</CustomTabsTrigger>
            <CustomTabsTrigger value="additional">Ek Bilgiler</CustomTabsTrigger>
          </CustomTabsList>
          
          <CustomTabsContent value="general">
            <ProductGeneralSection form={form} />
          </CustomTabsContent>
          
          <CustomTabsContent value="pricing">
            <ProductPricingSection form={form} />
          </CustomTabsContent>
          
          <CustomTabsContent value="inventory">
            <ProductInventorySection form={form} />
          </CustomTabsContent>
          
          <CustomTabsContent value="additional">
            <ProductSupplierSection form={form} />
          </CustomTabsContent>
        </CustomTabs>
      </form>
    </Form>
  );
};

export default ProductFormTabs;
