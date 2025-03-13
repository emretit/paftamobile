
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProposalItem } from "@/types/proposal-form";
import { v4 as uuidv4 } from "uuid";

interface ProposalItemsSectionProps {
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
}

const ProposalItemsSection = ({ items, setItems }: ProposalItemsSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Fetch products from Supabase
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
  });

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18, // Default tax rate
      totalPrice: 0,
    };
    
    setItems([...items, newItem]);
  };

  const handleSelectProduct = (product: any) => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: product.sale_price || 0,
      taxRate: 18, // Default tax rate
      totalPrice: product.sale_price || 0,
    };
    
    setItems([...items, newItem]);
    setProductDialogOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ProposalItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      updatedItems[index][field] = Number(value);
      
      // Update total price
      const quantity = updatedItems[index].quantity;
      const unitPrice = updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = quantity * unitPrice;
    } else {
      // @ts-ignore - We know the field exists
      updatedItems[index][field] = value;
    }
    
    setItems(updatedItems);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-medium">Ürünler ve Hizmetler</Label>
        <div className="flex space-x-2">
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" type="button" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ürün Seçimi</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <Input
                  placeholder="Ürün adına göre ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded cursor-pointer hover:bg-muted/40"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.sale_price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Manuel Ekle
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="min-w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="py-3 px-4 text-left font-medium">Ürün/Hizmet</th>
                  <th className="py-3 px-4 text-right font-medium w-20">Miktar</th>
                  <th className="py-3 px-4 text-right font-medium w-32">Birim Fiyat</th>
                  <th className="py-3 px-4 text-right font-medium w-20">KDV %</th>
                  <th className="py-3 px-4 text-right font-medium w-32">Toplam</th>
                  <th className="py-3 px-4 text-center font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-center text-muted-foreground">
                      Henüz ürün eklenmedi. Ürün eklemek için yukarıdaki butonları kullanın.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                          placeholder="Ürün/Hizmet adı"
                          className="border-0 bg-transparent focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="text-right border-0 bg-transparent focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="text-right border-0 bg-transparent focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, "taxRate", e.target.value)}
                          className="text-right border-0 bg-transparent focus-visible:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalItemsSection;
