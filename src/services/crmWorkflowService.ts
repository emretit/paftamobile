
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import { mockOpportunitiesAPI } from "./mockCrmService";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { ProposalStatusShared } from "@/types/shared-types";
import { toast } from "sonner";

// Helper function to create a task for an opportunity
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  status: OpportunityStatus,
  assigneeId?: string
): Promise<Task | null> => {
  try {
    // Generate task data based on opportunity status
    let taskTitle = "";
    let taskDescription = "";
    let taskType: TaskType = "general";
    let priority: TaskPriority = "medium";
    let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);  // Default: 3 days from now
    
    switch (status) {
      case "new":
        taskTitle = `İlk görüşme yapılacak: ${opportunityTitle}`;
        taskDescription = "Müşteriye ulaşarak ilk görüşmeyi organize edin.";
        taskType = "call";
        dueDate.setDate(dueDate.getDate() + 1);  // 1 day for new opportunities
        break;
      case "first_contact":
        taskTitle = `Saha ziyareti planla: ${opportunityTitle}`;
        taskDescription = "Saha ziyaretini organize edin ve müşteriyi bilgilendirin.";
        taskType = "meeting";
        dueDate.setDate(dueDate.getDate() + 3);  // 3 days
        break;
      case "site_visit":
        taskTitle = `Teklif hazırla: ${opportunityTitle}`;
        taskDescription = "Saha ziyareti sonuçlarına göre teklif hazırlayın.";
        taskType = "proposal";
        dueDate.setDate(dueDate.getDate() + 5);  // 5 days
        priority = "high";
        break;
      case "preparing_proposal":
        taskTitle = `Teklifi gönder: ${opportunityTitle}`;
        taskDescription = "Hazırlanan teklifi son kez kontrol ederek müşteriye gönderin.";
        taskType = "proposal";
        dueDate.setDate(dueDate.getDate() + 2);  // 2 days
        priority = "high";
        break;
      case "proposal_sent":
        taskTitle = `Teklif takibi: ${opportunityTitle}`;
        taskDescription = "Müşteriyle iletişime geçerek teklif hakkında geri bildirim alın.";
        taskType = "follow_up";
        dueDate.setDate(dueDate.getDate() + 4);  // 4 days
        break;
      case "accepted":
        taskTitle = `Sözleşme süreci: ${opportunityTitle}`;
        taskDescription = "Kabul edilen teklif için sözleşme sürecini başlatın.";
        taskType = "general";
        dueDate.setDate(dueDate.getDate() + 5);  // 5 days
        priority = "high";
        break;
      case "lost":
        taskTitle = `Değerlendirme: ${opportunityTitle}`;
        taskDescription = "Kaybedilen fırsat için değerlendirme yapın ve geri bildirimleri kaydedin.";
        taskType = "general";
        dueDate.setDate(dueDate.getDate() + 7);  // 7 days
        priority = "low";
        break;
    }
    
    // Create task data object
    const taskData = {
      id: uuidv4(),
      title: taskTitle,
      description: taskDescription,
      status: "todo" as TaskStatus,
      priority: priority,
      type: taskType,
      due_date: dueDate.toISOString(),
      related_item_id: opportunityId,
      related_item_title: opportunityTitle,
      assignee_id: assigneeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Use the mockCrmService to create the task
    const { data, error } = await mockOpportunitiesAPI.createTask(taskData);
    
    if (error) throw error;
    
    toast.success(`"${taskTitle}" görevi oluşturuldu`);
    
    return data as Task;
  } catch (error) {
    console.error("Error creating task for opportunity:", error);
    toast.error("Görev oluşturulurken bir hata oluştu");
    return null;
  }
};

// Helper function to update opportunity status when proposal status changes
export const updateOpportunityOnProposalChange = async (
  proposalId: string, 
  proposalStatus: ProposalStatusShared, 
  opportunityId?: string
): Promise<boolean> => {
  try {
    // If no opportunityId was provided, try to find it
    if (!opportunityId) {
      const { data, error } = await supabase
        .from("proposals")
        .select("opportunity_id")
        .eq("id", proposalId)
        .single();
      
      if (error || !data.opportunity_id) {
        console.warn("No opportunity linked to this proposal");
        return false;
      }
      
      opportunityId = data.opportunity_id;
    }
    
    // Map proposal status to opportunity status
    let opportunityStatus: OpportunityStatus | null = null;
    
    switch (proposalStatus) {
      case "draft":
      case "pending_approval":
        opportunityStatus = "preparing_proposal";
        break;
      case "sent":
        opportunityStatus = "proposal_sent";
        break;
      case "accepted":
        opportunityStatus = "accepted";
        break;
      case "rejected":
        opportunityStatus = "lost";
        break;
      default:
        break;
    }
    
    if (!opportunityStatus) return false;
    
    // Update the opportunity status
    const { data, error } = await mockOpportunitiesAPI.updateOpportunity(
      opportunityId,
      { status: opportunityStatus }
    );
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating opportunity based on proposal change:", error);
    return false;
  }
};

export default {
  createTaskForOpportunity,
  updateOpportunityOnProposalChange
};
