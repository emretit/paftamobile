
import { useState } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { PersonalInfoExtendedFields } from "./PersonalInfoExtendedFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PersonalInfoFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    id_ssn?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export const PersonalInfoForm = ({ formData, handleInputChange }: PersonalInfoFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Kişisel Bilgiler</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="extended">Detaylı Bilgiler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonalInfoFields formData={formData} handleInputChange={handleInputChange} />
          </div>
        </TabsContent>
        
        <TabsContent value="extended" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonalInfoExtendedFields formData={formData} handleInputChange={handleInputChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
