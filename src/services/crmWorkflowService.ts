
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import { mockCrmService } from "./mockCrmService";
import { Opportunity } from "@/types/crm";
import { ProposalStatusShared } from "@/types/shared-types";
import { toast } from "sonner";

// Helper function to create a task for an opportunity
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  taskTitle: string,
  description: string = "",
  status: TaskStatus = "todo",
  priority: TaskPriority = "medium",
  dueDate?: Date
): Promise<Task | null> => {
  try {
    // Validate inputs
    if (!opportunityId || !opportunityTitle || !taskTitle) {
      throw new Error("Missing required parameters");
    }

    // Create new task data
    const taskData = {
      id: uuidv4(),
      title: taskTitle,
      description,
      status,
      priority,
      type: "opportunity",
      due_date: dueDate ? dueDate.toISOString() : undefined,
      related_item_id: opportunityId,
      related_item_title: opportunityTitle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use the mockCrmService to create the task
    const { data, error } = await mockCrmService.createTask(taskData);
    if (error) throw error;
    
    return data as Task;
  } catch (error) {
    console.error("Error creating task for opportunity:", error);
    toast.error("Failed to create task for opportunity");
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
    
    // Update the opportunity status based on the proposal status
    const result = await mockCrmService.updateOpportunityBasedOnProposal(
      proposalId,
      proposalStatus,
      opportunityId
    );
    
    return result.success;
  } catch (error) {
    console.error("Error updating opportunity based on proposal change:", error);
    return false;
  }
};

// Sync supabase with the mockCrmService
export const syncSupabaseWithMockData = async () => {
  try {
    // Get all tasks from mockCrmService
    const { data: mockTasks } = await mockCrmService.getTasks();
    
    if (mockTasks && mockTasks.length > 0) {
      // Get all tasks from Supabase
      const { data: supabaseTasks } = await supabase.from("tasks").select("*");
      
      // Find tasks that exist in mock but not in Supabase
      const tasksToAdd = mockTasks.filter(mockTask => 
        !supabaseTasks?.some(supTask => supTask.id === mockTask.id)
      );
      
      // Insert missing tasks into Supabase
      if (tasksToAdd.length > 0) {
        const { error } = await supabase.from("tasks").insert(tasksToAdd);
        if (error) console.error("Error syncing tasks:", error);
      }
    }
    
    // Similar logic for opportunities
    const { data: mockOpportunities } = await mockCrmService.getOpportunities();
    
    if (mockOpportunities && mockOpportunities.length > 0) {
      const { data: supabaseOpportunities } = await supabase.from("opportunities").select("*");
      
      const opportunitiesToAdd = mockOpportunities.filter(mockOpp => 
        !supabaseOpportunities?.some(supOpp => supOpp.id === mockOpp.id)
      );
      
      if (opportunitiesToAdd.length > 0) {
        // Need to convert contact_history to string for Supabase
        const preparedOpportunities = opportunitiesToAdd.map(opp => ({
          ...opp,
          contact_history: opp.contact_history ? JSON.stringify(opp.contact_history) : null
        }));
        
        const { error } = await supabase.from("opportunities").insert(preparedOpportunities);
        if (error) console.error("Error syncing opportunities:", error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing mock data with Supabase:", error);
    return false;
  }
};

export default {
  createTaskForOpportunity,
  updateOpportunityOnProposalChange,
  syncSupabaseWithMockData
};
