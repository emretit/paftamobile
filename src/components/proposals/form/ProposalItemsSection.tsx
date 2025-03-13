
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Package, Trash2, Search } from "lucide-react";
import { ProposalItem } from "@/types/proposal-form";
import { v4 as uuidv4 } from "uuid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ProposalItemsSectionProps {
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
}

const ProposalItemsSection = ({ items, setItems }: ProposalItemsSectionProps) => {
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");
        
      if (error) throw error;
      return data as Product[];
    },
  });

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleAddProductAsItem = (product: Product) => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      taxRate: product.tax_rate,
      totalPrice: product.price * (1 + product.tax_rate / 100),
      product_id: product.id,
    };
    setItems([...items, newItem]);
    setIsProductSelectorOpen(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ProposalItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
          const quantity = field === "quantity" ? Number(value) : item.quantity;
          const unitPrice = field === "unitPrice" ? Number(value) : item.unitPrice;
          const taxRate = field === "taxRate" ? Number(value) : item.taxRate;
          updatedItem.totalPrice = quantity * unitPrice * (1 + taxRate / 100);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teklif Kalemleri</h3>
        <div className="flex space-x-2">
          <Popover open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" type="button">
                <Package className="w-4 h-4 mr-2" />
                Ürün Ekle
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <Command>
                <CommandInput placeholder="Ürün ara..." />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <CommandItem disabled>Yükleniyor...</CommandItem>
                    ) : (
                      products.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => handleAddProductAsItem(product)}
                          className="flex justify-between items-center"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {product.sku || product.barcode}
                            </span>
                          </div>
                          <div className="font-medium">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: product.currency }).format(product.price)}
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button onClick={handleAddItem} type="button">
            <Plus className="w-4 h-4 mr-2" />
            Boş Kalem Ekle
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <Package className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">
            Henüz teklif kalemi eklenmedi. "Ürün Ekle" veya "Boş Kalem Ekle" butonlarını kullanarak teklif kalemi ekleyin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-2 border">Ürün/Hizmet Adı</th>
                <th className="text-right p-2 border w-24">Miktar</th>
                <th className="text-right p-2 border w-32">Birim Fiyat</th>
                <th className="text-right p-2 border w-24">KDV %</th>
                <th className="text-right p-2 border w-32">Toplam</th>
                <th className="text-center p-2 border w-16">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/20">
                  <td className="p-2 border">
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      placeholder="Ürün/hizmet adı"
                      className="border-0 focus-visible:ring-0 p-0 h-8"
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      min="1"
                      className="border-0 focus-visible:ring-0 p-0 h-8 text-right"
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="border-0 focus-visible:ring-0 p-0 h-8 text-right"
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => handleUpdateItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="border-0 focus-visible:ring-0 p-0 h-8 text-right"
                    />
                  </td>
                  <td className="p-2 border text-right font-medium">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.totalPrice)}
                  </td>
                  <td className="p-2 border text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProposalItemsSection;
