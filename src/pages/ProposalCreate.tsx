
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileText, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProposalTemplateGrid from "@/components/proposals/templates/ProposalTemplateGrid";
import ProposalForm from "@/components/proposals/templates/ProposalForm";
import { ProposalTemplate } from "@/types/proposal-template";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<string>("templates");

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    setActiveTab("form");
  };

  const handleSaveDraft = () => {
    // Save draft logic
    navigate("/proposals");
  };

  const handleBack = () => {
    if (activeTab === "form" && selectedTemplate) {
      setActiveTab("templates");
      setSelectedTemplate(null);
    } else {
      navigate("/proposals");
    }
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
              {activeTab === "form" && (
                <Button onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Taslak Olarak Kaydet
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="templates">
                <FileText className="h-4 w-4 mr-2" />
                Teklif Şablonları
              </TabsTrigger>
              <TabsTrigger value="form" disabled={!selectedTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Teklif Formu
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <Card>
                <CardContent className="p-6">
                  <ProposalTemplateGrid onSelectTemplate={handleTemplateSelect} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="form">
              {selectedTemplate && (
                <Card>
                  <CardContent className="p-6">
                    <ProposalForm template={selectedTemplate} onSaveDraft={handleSaveDraft} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProposalCreate;
