
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
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
  const [categoryFilter, setCategoryFilter] = useState("all");

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
  const { data: products = [], isLoading } = useQuery({
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

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleBulkAction = async (action: string) => {
    // Implement bulk actions here
    console.log('Bulk action:', action);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        isCollapsed ? "ml-[68px]" : "ml-[250px]"
      }`}>
        <div className="container mx-auto p-8 max-w-7xl">
          <ProductFilters
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            totalProducts={products.length}
            onBulkAction={handleBulkAction}
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
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
            </div>

            <Button onClick={() => navigate("/product-form")} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Ürün
            </Button>
          </div>

          <div className="mt-6 rounded-lg border bg-card">
            {view === "grid" ? (
              <ProductGrid products={products || []} isLoading={isLoading} />
            ) : (
              <ProductTable products={products || []} isLoading={isLoading} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
