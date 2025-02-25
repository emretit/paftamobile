
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { format } from "date-fns";

interface ProductMetaProps {
  warrantyPeriod: unknown | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProductMeta = ({ 
  warrantyPeriod, 
  notes, 
  createdAt, 
  updatedAt 
}: ProductMetaProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Diğer Bilgiler
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Garanti Süresi</label>
            <p className="mt-1">
              {warrantyPeriod ? String(warrantyPeriod) : "Garanti süresi belirtilmemiş"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Notlar</label>
            <p className="mt-1">{notes || "Not bulunmuyor"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Oluşturulma Tarihi</label>
            <p className="mt-1">{format(new Date(createdAt), 'dd.MM.yyyy HH:mm')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Son Güncelleme</label>
            <p className="mt-1">{format(new Date(updatedAt), 'dd.MM.yyyy HH:mm')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductMeta;
