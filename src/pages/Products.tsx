
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon, FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductTable from "@/components/products/ProductTable";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface ProductsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Products = ({ isCollapsed, setIsCollapsed }: ProductsProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Kategorileri getiren sorgu
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name");

      if (error) throw error;
      return data;
    },
  });

  // Ürünleri getiren sorgu
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchQuery, categoryFilter],
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

      if (categoryFilter) {
        query = query.eq("category_id", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex h-screen">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 p-8 ml-[60px] sm:ml-64">
        <div className="max-w-7xl mx-auto space-y-6">
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
              <Button variant="outline" className="gap-2">
                <FileUp className="h-4 w-4" />
                Excel Import
              </Button>
            </div>
          </div>

          <ProductFilters
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
          />

          {view === "grid" ? (
            <ProductGrid products={products || []} isLoading={isLoading} />
          ) : (
            <ProductTable
              products={products || []}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
