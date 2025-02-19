
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Trash2, Eye, EyeOff, Archive } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductFiltersProps {
  selectedProducts: string[];
  setSearchQuery: (query: string) => void;
  resetSelection: () => void;
}

const ProductFilters = ({ 
  selectedProducts, 
  setSearchQuery,
  resetSelection 
}: ProductFiltersProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchValue);
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) {
      toast.error("Lütfen en az bir ürün seçin");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;

      toast.success(`${selectedProducts.length} ürün başarıyla silindi`);
      resetSelection();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Ürünler silinirken bir hata oluştu');
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (!selectedProducts.length) {
      toast.error("Lütfen en az bir ürün seçin");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('id', selectedProducts);

      if (error) throw error;

      toast.success(`${selectedProducts.length} ürün ${isActive ? 'aktif' : 'pasif'} yapıldı`);
      resetSelection();
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Ürünler güncellenirken bir hata oluştu');
    }
  };

  const handleBulkCategoryUpdate = async (categoryId: string) => {
    if (!selectedProducts.length) {
      toast.error("Lütfen en az bir ürün seçin");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ category_id: categoryId })
        .in('id', selectedProducts);

      if (error) throw error;

      toast.success(`${selectedProducts.length} ürünün kategorisi güncellendi`);
      resetSelection();
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Ürünler güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Ürün ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchValue && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSearchValue("");
              setSearchQuery("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button type="submit">Ara</Button>
      </form>

      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedProducts.length} ürün seçili
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetSelection}
            >
              Seçimi Temizle
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkStatusUpdate(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Aktif Yap
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkStatusUpdate(false)}
              className="gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Pasif Yap
            </Button>
            <Select onValueChange={handleBulkCategoryUpdate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category1">Kategori 1</SelectItem>
                <SelectItem value="category2">Kategori 2</SelectItem>
                <SelectItem value="category3">Kategori 3</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
