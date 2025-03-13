
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ProposalItem } from "@/types/proposal-form";
import { useProposalForm } from "@/hooks/useProposalForm";
import { useProposalTemplates } from "@/hooks/useProposalTemplates";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useProposalFormState = () => {
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
      loadExistingProposal(id);
    } else {
      loadTemplateProposal();
    }
  }, [id, templates, location.search]);

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [items, methods.watch]);

  const loadExistingProposal = async (proposalId: string) => {
    setIsLoading(true);
    try {
      const proposal = await getProposal(proposalId);
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
          supplier_id: (proposal as any).supplier_id || "", 
          employee_id: proposal.employee_id || "",
          discounts: (proposal as any).discounts || 0, 
          additionalCharges: (proposal as any).additional_charges || 0, 
          internalNotes: proposal.internal_notes || "",
        });

        // Set partner type
        setPartnerType(proposal.customer_id ? "customer" : "supplier");

        // Set items if available
        if (proposal.items && Array.isArray(proposal.items)) {
          const convertedItems = proposal.items.map((item: any) => ({
            id: item.id || uuidv4(),
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.unit_price, // Handle both formats
            taxRate: item.taxRate || item.tax_rate, // Handle both formats
            totalPrice: item.totalPrice || item.total_price, // Handle both formats
            product_id: item.product_id,
            currency: item.currency
          }));
          setItems(convertedItems);
        }
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast.error("Teklifi yüklerken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateProposal = () => {
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
  };

  const calculateTotals = () => {
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
  };

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

  return {
    methods,
    isLoading,
    partnerType,
    setPartnerType,
    items,
    setItems,
    files,
    setFiles,
    totalValues,
    handleBack,
    handleSaveDraft,
    handleSubmit,
    id
  };
};
