
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface ContactHeaderProps {
  supplier: Supplier;
  id: string;
}

export const ContactHeader = ({ supplier, id }: ContactHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'bg-green-100 text-green-800';
      case 'pasif':
        return 'bg-gray-100 text-gray-800';
      case 'potansiyel':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link 
          to="/suppliers" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{supplier.company || supplier.name}</h1>
          {supplier.type === 'kurumsal' && supplier.name && (
            <p className="text-gray-500 mt-1">Yetkili Kişi: {supplier.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(supplier.status)}`}>
              {supplier.status}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">{supplier.type}</span>
          </div>
        </div>
      </div>
      <Link to={`/suppliers/${id}/edit`}>
        <Button className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Düzenle
        </Button>
      </Link>
    </div>
  );
};
