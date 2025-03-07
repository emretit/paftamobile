
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "./ProductFormSchema";
import ProductGeneralSection from "./ProductGeneralSection";
import ProductPricingSection from "./ProductPricingSection";
import ProductInventorySection from "./ProductInventorySection";
import ProductSupplierSection from "./supplier/ProductSupplierSection";

interface ProductFormTabsProps {
  form: UseFormReturn<ProductFormSchema>;
  onSubmit: (values: ProductFormSchema) => Promise<{ resetForm: boolean }>;
}

const ProductFormTabs = ({ form, onSubmit }: ProductFormTabsProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
            <TabsTrigger value="inventory">Stok</TabsTrigger>
            <TabsTrigger value="additional">Ek Bilgiler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <ProductGeneralSection form={form} />
          </TabsContent>
          
          <TabsContent value="pricing">
            <ProductPricingSection form={form} />
          </TabsContent>
          
          <TabsContent value="inventory">
            <ProductInventorySection form={form} />
          </TabsContent>
          
          <TabsContent value="additional">
            <ProductSupplierSection form={form} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default ProductFormTabs;
