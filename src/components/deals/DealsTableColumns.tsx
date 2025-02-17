
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column } from "./types";

interface DealsTableColumnsProps {
  columns: Column[];
  onToggleColumn: (columnId: string) => void;
}

const DealsTableColumns = ({ columns, onToggleColumn }: DealsTableColumnsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Sütunlar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.visible}
            onCheckedChange={() => onToggleColumn(column.id)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DealsTableColumns;
