
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { useProposalForm } from "@/hooks/useProposalForm";
import { useProposalTemplates } from "@/hooks/useProposalTemplates";
import ProposalHeader from "@/components/proposals/form/ProposalHeader";
import ProposalPartnerSelect from "@/components/proposals/form/ProposalPartnerSelect";
import ProposalEmployeeSelect from "@/components/proposals/form/ProposalEmployeeSelect";
import ProposalDetailsSection from "@/components/proposals/form/ProposalDetailsSection";
import ProposalItemsSection from "@/components/proposals/form/ProposalItemsSection";
import ProposalAttachments from "@/components/proposals/form/ProposalAttachments";
import ProposalSummary from "@/components/proposals/form/ProposalSummary";
import { ProposalFormProps, ProposalItem } from "@/types/proposal-form";
import { v4 as uuidv4 } from "uuid";

const ProposalFormPage = ({ isCollapsed, setIsCollapsed }: ProposalFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [partnerType, setPartnerType] = useState<"customer" | "supplier">("customer");
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [totalValues, setTotalValues] = useState({
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    discounts: 0,
    additionalCharges: 0
  });

  const { data: templates } = useProposalTemplates();
  const { createProposal, saveDraft, getProposal, updateProposal } = useProposalForm();
  
  const methods = useForm({
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

  // If editing an existing proposal, load the data
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getProposal(id).then((proposal) => {
        if (proposal) {
          // Set form values
          methods.reset({
            title: proposal.title,
            proposalNumber: proposal.proposal_number,
            proposalDate: new Date(proposal.created_at),
            expirationDate: proposal.valid_until ? new Date(proposal.valid_until) : undefined,
            paymentTerm: proposal.payment_term || "prepaid",
            status: proposal.status,
            customer_id: proposal.customer_id || "",
            supplier_id: proposal.supplier_id || "",
            employee_id: proposal.employee_id || "",
            discounts: proposal.discounts || 0,
            additionalCharges: proposal.additional_charges || 0,
            internalNotes: proposal.internal_notes || "",
          });

          // Set partner type
          setPartnerType(proposal.customer_id ? "customer" : "supplier");

          // Set items if available
          if (proposal.items && Array.isArray(proposal.items)) {
            const convertedItems = proposal.items.map(item => ({
              id: item.id || uuidv4(),
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.unit_price, // Handle both formats
              taxRate: item.taxRate || item.tax_rate, // Handle both formats
              totalPrice: item.totalPrice || item.total_price, // Handle both formats
              product_id: item.product_id
            }));
            setItems(convertedItems);
          }
        }
        setIsLoading(false);
      }).catch(error => {
        console.error("Error loading proposal:", error);
        toast.error("Teklifi yüklerken bir hata oluştu");
        setIsLoading(false);
      });
    } else {
      // Auto-select template for new proposals
      const searchParams = new URLSearchParams(location.search);
      const templateId = searchParams.get('template') || "1"; // Default to template 1 if not specified
      
      if (templates) {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          // Set form values from template
          methods.setValue("title", template.prefilledFields?.title || "");
          methods.setValue("paymentTerm", template.prefilledFields?.paymentTerm || "prepaid");
          methods.setValue("internalNotes", template.prefilledFields?.internalNotes || "");
          
          // Set items from template
          if (template.items && template.items.length > 0) {
            const templateItems: ProposalItem[] = template.items.map(item => ({
              id: uuidv4(),
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              totalPrice: item.quantity * item.unitPrice
            }));
            setItems(templateItems);
          }
        }
      }
    }
  }, [id, templates, location.search, getProposal, methods]);

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.taxRate / 100);
    }, 0);
    
    const discounts = Number(methods.watch("discounts")) || 0;
    const additionalCharges = Number(methods.watch("additionalCharges")) || 0;
    
    const totalAmount = subtotal + taxAmount - discounts + additionalCharges;
    
    setTotalValues({
      subtotal,
      taxAmount,
      totalAmount,
      discounts,
      additionalCharges
    });
  }, [items, methods.watch]);

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSaveDraft = async (data: any) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        items,
        files,
        status: "draft",
        validUntil: data.expirationDate,
        partnerType,
      };

      if (id) {
        await updateProposal(id, formData);
        toast.success("Teklif taslağı güncellendi");
      } else {
        await saveDraft.mutateAsync(formData);
        toast.success("Teklif taslak olarak kaydedildi");
      }
      
      navigate("/proposals");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Taslak kaydedilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        items,
        files,
        status: "new",
        validUntil: data.expirationDate,
        partnerType,
      };

      if (id) {
        await updateProposal(id, formData);
        toast.success("Teklif başarıyla güncellendi");
      } else {
        await createProposal.mutateAsync(formData);
        toast.success("Teklif başarıyla oluşturuldu");
      }
      
      navigate("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
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
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {id ? "Teklifi Düzenle" : "Yeni Teklif Oluştur"}
              </h1>
              <p className="text-gray-600 mt-1">
                {partnerType === "customer" 
                  ? "Müşterileriniz için yeni bir teklif hazırlayın" 
                  : "Tedarikçileriniz için yeni bir teklif hazırlayın"}
              </p>
            </div>
            <div className="flex space-x-2 self-end md:self-auto">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </div>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <ProposalHeader 
                    partnerType={partnerType} 
                    setPartnerType={setPartnerType} 
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    <div className="space-y-6">
                      <ProposalPartnerSelect 
                        partnerType={partnerType} 
                      />
                      
                      <ProposalEmployeeSelect />
                      
                      <ProposalDetailsSection />
                    </div>
                    
                    <div className="space-y-6">
                      <ProposalAttachments 
                        files={files} 
                        setFiles={setFiles} 
                      />
                      
                      <ProposalSummary 
                        totalValues={totalValues} 
                      />
                    </div>
                  </div>

                  <ProposalItemsSection 
                    items={items} 
                    setItems={setItems} 
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={methods.handleSubmit(handleSaveDraft)}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Taslak Olarak Kaydet
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Teklifi Gönder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
};

export default ProposalFormPage;
