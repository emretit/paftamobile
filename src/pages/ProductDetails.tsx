
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProductDetails = ({ isCollapsed, setIsCollapsed }: ProductDetailsProps) => {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{product.name}</h1>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-medium">Description</h2>
            <p>{product.description}</p>
          </div>
          <div>
            <h2 className="font-medium">Category</h2>
            <p>{product.product_categories?.name}</p>
          </div>
          <div>
            <h2 className="font-medium">Price</h2>
            <p>{product.unit_price}</p>
          </div>
          <div>
            <h2 className="font-medium">Stock</h2>
            <p>{product.stock_quantity}</p>
          </div>
        </div>
        {product.image_url && (
          <div>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
