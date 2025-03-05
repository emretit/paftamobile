
import React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface RequestDatesProps {
  createdAt?: string;
  dueDate?: string;
}

export const RequestDates: React.FC<RequestDatesProps> = ({ createdAt, dueDate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Oluşturulma Tarihi: {createdAt && format(new Date(createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
      </div>
      {dueDate && (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Tercih Edilen Tarih: {format(new Date(dueDate), 'dd MMMM yyyy', { locale: tr })}</span>
        </div>
      )}
    </div>
  );
};
