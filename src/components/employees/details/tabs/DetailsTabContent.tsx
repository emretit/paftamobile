
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "../../types";
import { Edit, Eye, User } from "lucide-react";
import { EditableEmployeeDetails } from "../EditableEmployeeDetails";
import { formatDate } from "../utils/formatDate";

interface DetailsTabContentProps {
  employee: Employee;
  handleEmployeeUpdate: (employee: Employee) => void;
}

export const DetailsTabContent = ({ employee, handleEmployeeUpdate }: DetailsTabContentProps) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Çalışan Detayları
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditingDetails(!isEditingDetails)}
          className="flex items-center gap-2"
        >
          {isEditingDetails ? (
            <>
              <Eye className="h-4 w-4" />
              <span>Görüntüle</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              <span>Düzenle</span>
            </>
          )}
        </Button>
      </div>
      
      {isEditingDetails ? (
        <EditableEmployeeDetails 
          employee={employee} 
          onSave={handleEmployeeUpdate} 
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Adı Soyadı</p>
              <p className="font-medium text-gray-800">{employee.first_name} {employee.last_name}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">E-posta</p>
              <p className="font-medium text-gray-800">{employee.email}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium text-gray-800">{employee.phone || "-"}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Departman</p>
              <p className="font-medium text-gray-800">{employee.department}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Pozisyon</p>
              <p className="font-medium text-gray-800">{employee.position}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
              <p className="font-medium text-gray-800">{formatDate(employee.hire_date)}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Durumu</p>
              <p className="font-medium text-gray-800">
                {employee.status === 'active' ? 'Aktif' : 'Pasif'}
              </p>
            </div>
          </div>
          
          {(employee.date_of_birth || employee.gender || employee.marital_status || 
           employee.address || employee.city || employee.postal_code || employee.id_ssn) && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">Kişisel Detaylar</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {employee.date_of_birth && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">Doğum Tarihi</p>
                    <p className="font-medium text-gray-800">{formatDate(employee.date_of_birth)}</p>
                  </div>
                )}
                {employee.gender && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">Cinsiyet</p>
                    <p className="font-medium text-gray-800">
                      {employee.gender === 'male' ? 'Erkek' : 
                       employee.gender === 'female' ? 'Kadın' : 
                       employee.gender === 'other' ? 'Diğer' : 
                       employee.gender === 'prefer_not_to_say' ? 'Belirtilmemiş' : 
                       employee.gender}
                    </p>
                  </div>
                )}
                {employee.marital_status && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">Medeni Durum</p>
                    <p className="font-medium text-gray-800">
                      {employee.marital_status === 'single' ? 'Bekâr' : 
                       employee.marital_status === 'married' ? 'Evli' : 
                       employee.marital_status === 'divorced' ? 'Boşanmış' : 
                       employee.marital_status === 'widowed' ? 'Dul' : 
                       employee.marital_status}
                    </p>
                  </div>
                )}
                {employee.id_ssn && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">TC Kimlik No / SGK No</p>
                    <p className="font-medium text-gray-800">{employee.id_ssn}</p>
                  </div>
                )}
                {(employee.address || employee.city || employee.postal_code) && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors md:col-span-2">
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="font-medium text-gray-800">
                      {[
                        employee.address, 
                        employee.city, 
                        employee.postal_code
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {(employee.emergency_contact_name || employee.emergency_contact_phone || employee.emergency_contact_relation) && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">Acil Durum İletişim Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employee.emergency_contact_name && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">İletişim Kişisi</p>
                    <p className="font-medium text-gray-800">{employee.emergency_contact_name}</p>
                  </div>
                )}
                {employee.emergency_contact_phone && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-800">{employee.emergency_contact_phone}</p>
                  </div>
                )}
                {employee.emergency_contact_relation && (
                  <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-500">Yakınlık Derecesi</p>
                    <p className="font-medium text-gray-800">{employee.emergency_contact_relation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
