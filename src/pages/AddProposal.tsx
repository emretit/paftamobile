
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ProposalFormData, ProposalItem } from "@/types/proposal-form";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Plus, ArrowLeft, Save, FileText, Send } from "lucide-react";
import ProposalFormActions from "@/components/proposals/form/ProposalFormActions";
import ProposalFormContent from "@/components/proposals/form/ProposalFormContent";

interface AddProposalProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const AddProposal = ({ isCollapsed, setIsCollapsed }: AddProposalProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [partnerType, setPartnerType] = useState<"customer" | "supplier">("customer");
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  const methods = useForm<ProposalFormData>({
    defaultValues: {
      title: "",
      proposalNumber: 0,
      proposalDate: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentTerm: "prepaid",
      status: "draft",
      customer_id: "",
      supplier_id: "",
      employee_id: "",
      discounts: 0,
      additionalCharges: 0,
      internalNotes: "",
    }
  });

  // Toplam değerleri hesapla
  const totalValues = {
    subtotal: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    taxAmount: items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * item.taxRate / 100), 0),
    discounts: Number(methods.watch("discounts")) || 0,
    additionalCharges: Number(methods.watch("additionalCharges")) || 0,
    totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + 
                items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * item.taxRate / 100), 0) - 
                (Number(methods.watch("discounts")) || 0) + 
                (Number(methods.watch("additionalCharges")) || 0)
  };

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSaveDraft = async (data: any) => {
    setIsLoading(true);
    try {
      // Teklif verisini hazırla
      const proposalData = {
        title: data.title,
        customer_id: partnerType === "customer" ? data.customer_id : null,
        supplier_id: partnerType === "supplier" ? data.supplier_id : null,
        employee_id: data.employee_id,
        status: "draft",
        total_value: totalValues.totalAmount,
        valid_until: data.expirationDate,
        payment_term: data.paymentTerm,
        internal_notes: data.internalNotes,
        discounts: data.discounts,
        additional_charges: data.additionalCharges,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate,
          total_price: item.totalPrice,
          product_id: item.product_id
        }))
      };

      // Supabase'e kaydet
      const { data: proposal, error } = await supabase
        .from("proposals" as any)
        .insert([proposalData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Teklif taslak olarak kaydedildi");
      navigate("/proposals");
    } catch (error) {
      console.error("Teklif kaydedilirken hata oluştu:", error);
      toast.error("Teklif kaydedilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Teklif verisini hazırla
      const proposalData = {
        title: data.title,
        customer_id: partnerType === "customer" ? data.customer_id : null,
        supplier_id: partnerType === "supplier" ? data.supplier_id : null,
        employee_id: data.employee_id,
        status: "new",
        total_value: totalValues.totalAmount,
        valid_until: data.expirationDate,
        payment_term: data.paymentTerm,
        internal_notes: data.internalNotes,
        discounts: data.discounts,
        additional_charges: data.additionalCharges,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate,
          total_price: item.totalPrice,
          product_id: item.product_id
        }))
      };

      // Supabase'e kaydet
      const { data: proposal, error } = await supabase
        .from("proposals" as any)
        .insert([proposalData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Teklif başarıyla oluşturuldu");
      navigate("/proposals");
    } catch (error) {
      console.error("Teklif oluşturulurken hata oluştu:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Yeni Teklif Oluştur
              </h1>
              <p className="text-gray-600 mt-1">
                Müşterileriniz için yeni bir teklif hazırlayın
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </div>
          </div>

          <ProposalFormContent
            methods={methods}
            partnerType={partnerType}
            setPartnerType={setPartnerType}
            items={items}
            setItems={setItems}
            files={files}
            setFiles={setFiles}
            totalValues={totalValues}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default AddProposal;
