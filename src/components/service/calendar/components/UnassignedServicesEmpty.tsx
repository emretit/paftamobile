
import React from "react";
import { Calendar } from "lucide-react";

export const UnassignedServicesEmpty: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
    <Calendar className="h-12 w-12 text-gray-300 mb-2" />
    <p className="text-sm font-medium">Durumu "Yeni" olan servis talebi bulunmamaktadır.</p>
    <p className="text-xs text-gray-500 mt-1">Yeni servis talepleri burada görüntülenecektir.</p>
  </div>
);
