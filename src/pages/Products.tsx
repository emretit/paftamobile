
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Table as TableIcon, LayoutGrid, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/products/ProductTable";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { supabase } from "@/integrations/supabase/client";

interface ProductsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Products = ({ isCollapsed, setIsCollapsed }: ProductsProps) => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    type: "all",
    status: "all"
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", filters],
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

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      if (filters.category !== "all") {
        query = query.eq("category_id", filters.category);
      }

      if (filters.type !== "all") {
        query = query.eq("product_type", filters.type);
      }

      if (filters.status !== "all") {
        query = query.eq("is_active", filters.status === "active");
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
      }`}>
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Ürünler & Hizmetler
              </h1>
              <p className="text-gray-600">
                Tüm ürün ve hizmetleri yönetin
              </p>
            </div>
            <Button 
              onClick={() => navigate("/product-form")}
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Ekle</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Tabs 
                value={viewType} 
                onValueChange={(value) => setViewType(value as "table" | "grid")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>Tablo Görünümü</span>
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Grid Görünümü</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="bg-gray-50/50 rounded-lg p-4">
              <ProductFilters onFilterChange={setFilters} />
            </div>
          </div>

          <div className="animate-fade-in">
            {viewType === "table" ? (
              <ProductTable products={products || []} isLoading={isLoading} />
            ) : (
              <ProductGrid products={products || []} isLoading={isLoading} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
