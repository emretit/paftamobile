
import { supabase } from "@/integrations/supabase/client";
import { OpportunityStatus } from "@/types/crm";
import { TaskPriority } from "@/types/task";
import { addDays, format } from "date-fns";

/**
 * Create a task for an opportunity based on its status
 */
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  status: OpportunityStatus,
  assigneeId?: string
) => {
  let taskTitle = "";
  let taskDescription = "";
  let priority: TaskPriority = "medium";
  let dueDate = addDays(new Date(), 3);

  // Set task details based on opportunity status
  switch (status) {
    case "new":
      taskTitle = "İlk görüşmeyi yap ve ziyaret planla";
      taskDescription = `Yeni fırsat için ilk görüşmeyi gerçekleştir: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 2);
      priority = "high";
      break;

    case "first_contact":
      taskTitle = "Ziyaret Yap ve raporla";
      taskDescription = `İlk görüşmesi yapılan fırsat için saha ziyareti planla: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 5);
      priority = "medium";
      break;

    case "site_visit":
      taskTitle = "Teklif Hazırla";
      taskDescription = `Saha ziyareti yapılan fırsat için teklif hazırla: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 3);
      priority = "high";
      break;

    case "proposal_sent":
      taskTitle = "Teklif Takibini Yap";
      taskDescription = `Gönderilen teklif için takip çağrısı yap: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 7);
      priority = "medium";
      break;

    case "accepted":
      taskTitle = "Satış Sözleşmesi Hazırla";
      taskDescription = `Kabul edilen fırsat için satış sözleşmesi hazırla: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 2);
      priority = "high";
      break;

    case "lost":
      taskTitle = "Fırsatı Kapat ve Kaybetme Nedeni Raporla";
      taskDescription = `Kaybedilen fırsat için kapanış raporu hazırla: ${opportunityTitle}`;
      dueDate = addDays(new Date(), 1);
      priority = "low";
      break;

    default:
      // Don't create a task for other statuses
      return;
  }

  try {
    // Format due date for database
    const formattedDueDate = format(dueDate, "yyyy-MM-dd");

    // Create task
    const { error } = await supabase.from("tasks").insert([
      {
        title: taskTitle,
        description: taskDescription,
        status: "todo",
        priority,
        type: "opportunity",
        assignee_id: assigneeId,
        due_date: formattedDueDate,
        related_item_id: opportunityId,
        related_item_title: opportunityTitle
      }
    ]);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating task for opportunity:", error);
  }
};

/**
 * Update opportunity status when proposal status changes
 */
export const updateOpportunityOnProposalStatusChange = async (
  proposalId: string,
  opportunityId: string,
  proposalStatus: string
) => {
  try {
    let opportunityStatus: OpportunityStatus | null = null;

    // Map proposal status to opportunity status
    if (proposalStatus === "sent") {
      opportunityStatus = "proposal_sent";
    } else if (proposalStatus === "accepted") {
      opportunityStatus = "accepted";
    } else if (proposalStatus === "rejected") {
      opportunityStatus = "lost";
    }

    // Only update opportunity if we have a valid status mapping
    if (opportunityStatus) {
      // Fetch the opportunity to get required data
      const { data: opportunity, error: fetchError } = await supabase
        .from("opportunities")
        .select("title, employee_id")
        .eq("id", opportunityId)
        .single();

      if (fetchError) throw fetchError;

      // Update the opportunity status
      const { error } = await supabase
        .from("opportunities")
        .update({ status: opportunityStatus })
        .eq("id", opportunityId);

      if (error) throw error;

      // Create a follow-up task based on the new status
      await createTaskForOpportunity(
        opportunityId,
        opportunity.title,
        opportunityStatus,
        opportunity.employee_id
      );
    }
  } catch (error) {
    console.error("Error updating opportunity after proposal status change:", error);
  }
};
