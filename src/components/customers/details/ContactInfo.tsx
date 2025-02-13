
import { Card } from "@/components/ui/card";
import { Mail, Phone, Building, MapPin, FileText } from "lucide-react";
import { Customer } from "@/types/customer";

interface ContactInfoProps {
  customer: Customer;
}

export const ContactInfo = ({ customer }: ContactInfoProps) => {
  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">İletişim Bilgileri</h2>
        <div className="space-y-4">
          {customer.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.mobile_phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <span>{customer.mobile_phone}</span>
                <span className="text-sm text-gray-500 ml-2">(Cep)</span>
              </div>
            </div>
          )}
          {customer.office_phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <span>{customer.office_phone}</span>
                <span className="text-sm text-gray-500 ml-2">(Sabit)</span>
              </div>
            </div>
          )}
          {customer.type === 'kurumsal' && customer.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <span>{customer.company}</span>
            </div>
          )}
          {customer.representative && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>Temsilci: {customer.representative}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex space-x-3 items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 block mb-1">Adres</span>
                <span className="whitespace-pre-wrap">{customer.address}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {customer.type === 'kurumsal' && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Vergi Bilgileri</h2>
          <div className="space-y-4">
            {customer.tax_number && (
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500 block">Vergi No</span>
                  <span>{customer.tax_number}</span>
                </div>
              </div>
            )}
            {customer.tax_office && (
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500 block">Vergi Dairesi</span>
                  <span>{customer.tax_office}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
