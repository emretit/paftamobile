
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { Customer } from "@/types/customer";

interface ContactHeaderProps {
  customer: Customer;
  id: string;
}

export const ContactHeader = ({ customer, id }: ContactHeaderProps) => {
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
          to="/contacts" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{customer.company || customer.name}</h1>
          {customer.type === 'kurumsal' && customer.name && (
            <p className="text-gray-500 mt-1">Yetkili Kişi: {customer.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">{customer.type}</span>
          </div>
        </div>
      </div>
      <Link to={`/contacts/${id}/edit`}>
        <Button className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Düzenle
        </Button>
      </Link>
    </div>
  );
};
