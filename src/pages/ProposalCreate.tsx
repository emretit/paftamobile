
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import ProposalForm from "@/components/proposals/templates/ProposalForm";
import { useProposalForm } from "@/hooks/useProposalForm";
import { toast } from "sonner";

// Default template for proposal creation
const defaultTemplate = {
  id: "default-template",
  name: "Standart Teklif",
  description: "Hızlı teklif oluşturma şablonu",
  templateType: "standard",
  templateFeatures: [
    "Ürün ve hizmet teklifleri için uygun",
    "KDV dahil/hariç seçeneği",
    "İskonto alanları"
  ],
  items: [],
  prefilledFields: {
    title: "Yeni Teklif",
    validityDays: 30,
    paymentTerm: "prepaid"
  }
};

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const { saveDraft } = useProposalForm();

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSaveDraft = () => {
    toast.success("Teklif taslak olarak kaydedildi");
    navigate("/proposals");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Teklif Oluştur</h1>
              <p className="text-gray-600 mt-1">
                Müşterileriniz için yeni bir teklif hazırlayın
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <Button onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Taslak Olarak Kaydet
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <ProposalForm template={defaultTemplate} onSaveDraft={handleSaveDraft} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProposalCreate;
