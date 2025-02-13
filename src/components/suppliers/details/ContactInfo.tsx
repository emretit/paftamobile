
import { Card } from "@/components/ui/card";
import { Mail, Phone, Building, MapPin, FileText } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface ContactInfoProps {
  supplier: Supplier;
}

export const ContactInfo = ({ supplier }: ContactInfoProps) => {
  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">İletişim Bilgileri</h2>
        <div className="space-y-4">
          {supplier.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.mobile_phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <span>{supplier.mobile_phone}</span>
                <span className="text-sm text-gray-500 ml-2">(Cep)</span>
              </div>
            </div>
          )}
          {supplier.office_phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <span>{supplier.office_phone}</span>
                <span className="text-sm text-gray-500 ml-2">(Sabit)</span>
              </div>
            </div>
          )}
          {supplier.type === 'kurumsal' && supplier.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <span>{supplier.company}</span>
            </div>
          )}
          {supplier.representative && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>Temsilci: {supplier.representative}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex space-x-3 items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 block mb-1">Adres</span>
                <span className="whitespace-pre-wrap">{supplier.address}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {supplier.type === 'kurumsal' && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Vergi Bilgileri</h2>
          <div className="space-y-4">
            {supplier.tax_number && (
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500 block">Vergi No</span>
                  <span>{supplier.tax_number}</span>
                </div>
              </div>
            )}
            {supplier.tax_office && (
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500 block">Vergi Dairesi</span>
                  <span>{supplier.tax_office}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
