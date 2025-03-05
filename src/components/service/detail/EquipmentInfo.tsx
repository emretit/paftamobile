
import React from "react";
import { Package } from "lucide-react";

interface EquipmentInfoProps {
  equipmentId?: string;
}

export const EquipmentInfo: React.FC<EquipmentInfoProps> = ({ equipmentId }) => {
  if (!equipmentId) return null;
  
  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <div className="flex items-center">
        <Package className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Ekipman</h3>
      </div>
      <p className="text-muted-foreground mt-1">Ekipman ID: {equipmentId}</p>
    </div>
  );
};
