
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductTable from "@/components/products/ProductTable";
import ProductExcelActions from "@/components/products/excel/ProductExcelActions";
import ProductImportDialog from "@/components/products/excel/ProductImportDialog";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";

interface ProductsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Products = ({ isCollapsed, setIsCollapsed }: ProductsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", searchQuery, categoryFilter, stockFilter],
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

      if (stockFilter !== "all") {
        switch (stockFilter) {
          case "out_of_stock":
            query = query.eq("stock_quantity", 0);
            break;
          case "low_stock":
            query = query.gt("stock_quantity", 0).lte("stock_quantity", 5);
            break;
          case "in_stock":
            query = query.gt("stock_quantity", 5);
            break;
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleBulkAction = async (action: string) => {
    console.log('Bulk action:', action);
  };

  const handleImportSuccess = () => {
    // Refresh products list after successful import
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
      }`}>
        <TopBar />
        <div className="container mx-auto p-8 max-w-7xl">
          <ProductFilters
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            categories={categories}
            totalProducts={products.length}
            onBulkAction={handleBulkAction}
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
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
              
              <ProductExcelActions 
                products={products || []} 
                onImportClick={() => setIsImportDialogOpen(true)}
              />
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
      
      <ProductImportDialog 
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Products;
