
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductTable from "@/components/products/ProductTable";
import { supabase } from "@/integrations/supabase/client";

interface ProductsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Products = ({ isCollapsed, setIsCollapsed }: ProductsProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_categories (
            id,
            name
          )
        `);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAllProducts = (ids: string[]) => {
    setSelectedProducts(ids);
  };

  const resetSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ürünler</h1>
        <div className="flex items-center gap-2">
          <div className="border rounded-lg p-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("table")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate("/product-form")} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      <ProductFilters
        selectedProducts={selectedProducts}
        setSearchQuery={setSearchQuery}
        resetSelection={resetSelection}
      />

      {view === "grid" ? (
        <ProductGrid products={products || []} isLoading={isLoading} />
      ) : (
        <ProductTable
          products={products || []}
          isLoading={isLoading}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onSelectAllProducts={handleSelectAllProducts}
        />
      )}
    </div>
  );
};

export default Products;
