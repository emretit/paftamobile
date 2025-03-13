
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus, UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ProposalItemsHeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  onAddItem: () => void;
  onOpenProductDialog: () => void;
  onSelectProduct: (product: Product) => void;
  currencyOptions: { value: string; label: string }[];
}

const ProposalItemsHeader = ({
  selectedCurrency,
  onCurrencyChange,
  onAddItem,
  onOpenProductDialog,
  onSelectProduct,
  currencyOptions,
}: ProposalItemsHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_categories(*)")
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
  });
  
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const handleSelectProduct = (product: any) => {
    onSelectProduct(product);
    setOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <Label className="text-base font-medium">Ürünler ve Hizmetler</Label>
      <div className="flex space-x-2 items-center">
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Para Birimi" />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              type="button" 
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Ürün Ekle
            </Button>
          </PopoverTrigger>
          <Command className="w-[300px] rounded-lg border shadow-md">
            <div className="flex items-center border-b p-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Ürün ara..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <CommandItem disabled>Yükleniyor...</CommandItem>
                ) : (
                  filteredProducts.slice(0, 10).map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => handleSelectProduct(product)}
                      className="flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {product.sku || "SKU: -"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                    </CommandItem>
                  ))
                )}
                {filteredProducts.length > 10 && (
                  <CommandItem
                    onSelect={onOpenProductDialog}
                    className="text-center text-primary"
                  >
                    Tüm ürünleri görüntüle ({filteredProducts.length})
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </Popover>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Manuel Ekle
        </Button>
      </div>
    </div>
  );
};

export default ProposalItemsHeader;
