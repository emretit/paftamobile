
// Redesigned ProposalCreate.tsx for better UX
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";
import ProposalBasicInfo from "@/components/proposals/form/ProposalBasicInfo"; // Assume new components
import ProposalItemsSection from "@/components/proposals/form/ProposalItemsSection";
import ProposalTermsSection from "@/components/proposals/form/ProposalTermsSection";
import ProposalSummary from "@/components/proposals/form/ProposalSummary";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { createProposal } = useProposalCreation();
  const [formData, setFormData] = useState({ /* initial form data */ });

  const handleBack = () => navigate("/proposals");

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await createProposal(formData);
      if (result) {
        toast.success("Teklif başarıyla oluşturuldu");
        navigate("/proposals");
      }
    } catch (error) {
      toast.error("Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DefaultLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} title="Yeni Teklif" subtitle="Yeni teklif oluşturun">
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack}><ArrowLeft /> Geri</Button>
        <Button onClick={handleSave} disabled={saving}><Save /> {saving ? 'Kaydediliyor' : 'Kaydet'}</Button>
      </div>
      <Card className="m-4 p-6">
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="items">Kalemler</TabsTrigger>
            <TabsTrigger value="terms">Şartlar</TabsTrigger>
            <TabsTrigger value="summary">Özet</TabsTrigger>
          </TabsList>
          <TabsContent value="basic"><ProposalBasicInfo formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="items"><ProposalItemsSection formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="terms"><ProposalTermsSection formData={formData} setFormData={setFormData} /></TabsContent>
          <TabsContent value="summary"><ProposalSummary formData={formData} /></TabsContent>
        </Tabs>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalCreate;
