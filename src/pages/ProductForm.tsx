
import ProductFormWrapper from "@/components/products/form/ProductFormWrapper";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";

interface ProductFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProductForm = ({ isCollapsed, setIsCollapsed }: ProductFormProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
      }`}>
        <TopBar />
        <div className="container p-6">
          <ProductFormWrapper />
        </div>
      </main>
    </div>
  );
};

export default ProductForm;
