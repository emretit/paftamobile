
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OpportunityStatus } from "@/types/crm";
import { Task } from "@/types/task";

export interface WorkflowTask {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // ISO string
}

const getTaskForOpportunityStatus = (status: OpportunityStatus): WorkflowTask | null => {
  switch (status) {
    case 'new':
      return {
        title: 'İlk görüşmeyi yap ve ziyaret planla',
        description: 'Müşteri ile ilk görüşmeyi yaparak bir site ziyareti planlayınız.',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      };
    case 'first_contact':
      return {
        title: 'Ziyaret Yap ve raporla',
        description: 'Planlanan ziyareti gerçekleştirin ve sonuçları raporlayın.',
        priority: 'high',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
      };
    case 'site_visit':
      return {
        title: 'Teklif Hazırla',
        description: 'Ziyaret sonuçlarına göre uygun bir teklif hazırlayın.',
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
      };
    case 'proposal_sent':
      return {
        title: 'Teklif Takibini Yap',
        description: 'Gönderilen teklifin durumunu takip edin ve müşteri ile iletişime geçin.',
        priority: 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };
    case 'accepted':
      return {
        title: 'Satış Sözleşmesi Hazırla',
        description: 'Kabul edilen teklif için satış sözleşmesi hazırlayın.',
        priority: 'high',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      };
    case 'lost':
      return {
        title: 'Fırsatı Kapat ve Kaybetme Nedeni Raporla',
        description: 'Kaybedilen fırsatın nedenlerini analiz edin ve raporlayın.',
        priority: 'low',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
      };
    default:
      return null;
  }
};

export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  status: OpportunityStatus,
  assigneeId?: string
): Promise<Task | null> => {
  try {
    const taskData = getTaskForOpportunityStatus(status);
    
    if (!taskData) return null;
    
    const taskToCreate = {
      title: taskData.title,
      description: taskData.description || '',
      status: 'todo',
      priority: taskData.priority,
      type: 'opportunity',
      assignee_id: assigneeId,
      due_date: taskData.due_date,
      related_item_id: opportunityId,
      related_item_title: opportunityTitle
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskToCreate])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating opportunity task:', error);
      toast.error('Görev oluşturulurken bir hata oluştu');
      return null;
    }
    
    toast.success('Görev başarıyla oluşturuldu');
    return data as Task;
  } catch (error) {
    console.error('Error in workflow task creation:', error);
    toast.error('Görev oluşturulurken bir hata oluştu');
    return null;
  }
};

export const updateOpportunityOnProposalStatusChange = async (
  proposalId: string,
  opportunityId?: string,
  newStatus?: string
) => {
  if (!opportunityId) return;
  
  try {
    let opportunityStatus: OpportunityStatus | undefined;
    
    // Map proposal status to opportunity status
    if (newStatus === 'sent') {
      opportunityStatus = 'proposal_sent';
    } else if (newStatus === 'approved' || newStatus === 'converted_to_order') {
      opportunityStatus = 'accepted';
    } else if (newStatus === 'rejected') {
      opportunityStatus = 'lost';
    }
    
    if (!opportunityStatus) return;
    
    // Update the opportunity status
    const { error } = await supabase
      .from('opportunities')
      .update({ status: opportunityStatus })
      .eq('id', opportunityId);
      
    if (error) {
      console.error('Error updating opportunity status:', error);
      toast.error('Fırsat durumu güncellenirken bir hata oluştu');
      return;
    }
    
    // Fetch the opportunity to get the title for task creation
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('title, employee_id')
      .eq('id', opportunityId)
      .single();
      
    if (oppError) {
      console.error('Error fetching opportunity:', oppError);
      return;
    }
    
    // Create the corresponding task
    await createTaskForOpportunity(
      opportunityId,
      opportunity.title,
      opportunityStatus,
      opportunity.employee_id
    );
    
    toast.success('Fırsat durumu güncellendi');
  } catch (error) {
    console.error('Error in workflow status update:', error);
    toast.error('İşlem sırasında bir hata oluştu');
  }
};
