
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();

  const handleSaveDraft = () => {
    // Save draft logic
    navigate("/proposals");
  };

  const handleBack = () => {
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

          <Card className="mb-6">
            <CardContent className="p-6">
              <p>Teklif form içeriği buraya gelecek</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProposalCreate;
