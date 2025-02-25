
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, FileDown, FileUp, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ProductFiltersProps {
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: { id: string; name: string }[];
  totalProducts: number;
  onBulkAction?: (action: string) => void;
}

const ProductFilters = ({
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
  totalProducts,
  onBulkAction
}: ProductFiltersProps) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [stockStatus, setStockStatus] = useState("all");

  return (
    <div className="space-y-6">
      {/* Modern Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Ürünler</h1>
            <Badge variant="secondary" className="rounded-md">
              {totalProducts} ürün
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Tüm ürünlerinizi buradan yönetebilir ve düzenleyebilirsiniz.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <FileUp className="w-4 h-4 mr-2" />
            İçe Aktar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBulkAction?.("activate")}>
                Seçilenleri Aktifleştir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction?.("deactivate")}>
                Seçilenleri Pasifleştir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction?.("delete")}>
                Seçilenleri Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Search & Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün adı, SKU veya barkod ile arayın..."
            className="pl-10 h-11"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-11">
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
              <Button variant="outline" size="icon" className="h-11 w-11">
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
