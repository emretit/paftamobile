
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductFiltersProps {
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: { id: string; name: string }[];
  totalProducts: number;
}

const ProductFilters = ({
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
  totalProducts,
}: ProductFiltersProps) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [stockStatus, setStockStatus] = useState("all");

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ürünler</h1>
          <p className="text-muted-foreground">Toplam {totalProducts} ürün</p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ürün ara..."
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tüm Kategoriler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Gelişmiş Filtreler</SheetTitle>
                <SheetDescription>
                  Ürünleri detaylı filtrelemek için ayarları kullanın.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Fiyat Aralığı</h3>
                  <Slider 
                    defaultValue={[0, 1000]} 
                    max={1000} 
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0]} TL</span>
                    <span>{priceRange[1]} TL</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Stok Durumu</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={stockStatus === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStockStatus("all")}
                    >
                      Tümü
                    </Badge>
                    <Badge 
                      variant={stockStatus === "in_stock" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStockStatus("in_stock")}
                    >
                      Stokta
                    </Badge>
                    <Badge 
                      variant={stockStatus === "low_stock" ? "warning" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStockStatus("low_stock")}
                    >
                      Az Stok
                    </Badge>
                    <Badge 
                      variant={stockStatus === "out_of_stock" ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStockStatus("out_of_stock")}
                    >
                      Stok Yok
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
