
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface ProductFiltersProps {
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: { id: string; name: string }[];
}

const ProductFilters = ({
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
}: ProductFiltersProps) => {
  return (
    <div className="mb-6 flex gap-4 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Ürün ara..."
          className="pl-10"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tüm Kategoriler" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tüm Kategoriler</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductFilters;
