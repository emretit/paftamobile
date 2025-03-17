
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";

const DealsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fırsatlar</h1>
        <p className="text-gray-600 mt-1">Fırsatlarınızı takip edin ve yönetin</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrele
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Fırsat Ekle
        </Button>
      </div>
    </div>
  );
};

export default DealsHeader;
