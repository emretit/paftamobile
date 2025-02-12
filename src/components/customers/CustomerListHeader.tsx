
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const CustomerListHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <p className="text-gray-600 mt-1">Müşteri listesi ve yönetimi</p>
      </div>
      <Link 
        to="/contacts/new" 
        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span>Yeni Müşteri</span>
      </Link>
    </div>
  );
};

export default CustomerListHeader;
