
import { TableCell, TableRow } from "@/components/ui/table";
import { Phone, Mail, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Supplier } from "@/types/supplier";

interface SupplierTableRowProps {
  supplier: Supplier;
}

const SupplierTableRow = ({ supplier }: SupplierTableRowProps) => {
  const navigate = useNavigate();

  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/suppliers/${supplier.id}`)}
    >
      <TableCell className="font-medium">
        {supplier.company || supplier.name}
      </TableCell>
      <TableCell className="text-gray-500">
        {supplier.name}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {supplier.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{supplier.email}</span>
            </div>
          )}
          {supplier.mobile_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{supplier.mobile_phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{supplier.type}</TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            supplier.status === "aktif"
              ? "bg-green-100 text-green-800"
              : supplier.status === "pasif"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {supplier.status}
        </span>
      </TableCell>
      <TableCell>{supplier.representative}</TableCell>
      <TableCell>
        <span className={`font-medium ${supplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {supplier.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/suppliers/${supplier.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SupplierTableRow;
