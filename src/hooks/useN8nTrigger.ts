import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface N8nWorkflowParams {
  workflow: 
    // Existing workflows
    | 'fetch_daily_invoices' 
    | 'sync_invoice_status' 
    | 'download_invoice_pdf' 
    | 'send_notification'
    // New advanced workflows
    | 'crm_automation_pipeline'
    | 'einvoice_full_automation'
    | 'financial_reporting_automation'
    | 'smart_task_management'
    | 'external_data_sync_hub'
    // Specific triggers
    | 'opportunity_status_changed'
    | 'proposal_accepted'
    | 'task_due_reminder'
    | 'customer_data_sync'
    | 'daily_report_generation';
  parameters?: Record<string, any>;
}

export const useN8nTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerWorkflow = async ({ workflow, parameters = {} }: N8nWorkflowParams) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log(`🚀 Triggering n8n workflow: ${workflow}`);

      const { data, error } = await supabase.functions.invoke('trigger-n8n', {
        body: {
          workflow,
          user_id: user.id,
          parameters
        }
      });

      if (error) {
        console.error('❌ n8n trigger error:', error);
        throw new Error(error.message || 'Failed to trigger workflow');
      }

      if (!data.success) {
        throw new Error(data.error || 'Workflow trigger failed');
      }

      console.log(`✅ n8n workflow triggered:`, data);
      
      toast.success(`${workflow} workflow başlatıldı`, {
        description: 'n8n otomasyonu çalışıyor...'
      });

      return data;

    } catch (err: any) {
      const errorMessage = err.message || 'Workflow tetiklenirken hata oluştu';
      console.error('❌ Workflow trigger error:', err);
      setError(errorMessage);
      
      toast.error('Workflow Hatası', {
        description: errorMessage
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyInvoices = () => {
    return triggerWorkflow({ 
      workflow: 'fetch_daily_invoices',
      parameters: {
        fetch_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const syncInvoiceStatus = (invoiceIds: string[]) => {
    return triggerWorkflow({ 
      workflow: 'sync_invoice_status',
      parameters: {
        invoice_ids: invoiceIds
      }
    });
  };

  const downloadInvoicePdf = (invoiceId: string) => {
    return triggerWorkflow({ 
      workflow: 'download_invoice_pdf',
      parameters: {
        invoice_id: invoiceId
      }
    });
  };

  const sendNotification = (type: string, data: any) => {
    return triggerWorkflow({ 
      workflow: 'send_notification',
      parameters: {
        notification_type: type,
        data
      }
    });
  };

  // New advanced workflow methods
  const triggerCrmAutomation = (opportunityId: string, status: string, customerId?: string) => {
    return triggerWorkflow({
      workflow: 'crm_automation_pipeline',
      parameters: {
        opportunity_id: opportunityId,
        status,
        customer_id: customerId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const triggerEInvoiceAutomation = (proposalId: string, customerId: string) => {
    return triggerWorkflow({
      workflow: 'einvoice_full_automation',
      parameters: {
        proposal_id: proposalId,
        customer_id: customerId,
        timestamp: new Date().toISOString()
      }
    });
  };

  const triggerFinancialReporting = (reportType: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    return triggerWorkflow({
      workflow: 'financial_reporting_automation',
      parameters: {
        report_type: reportType,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      }
    });
  };

  const triggerTaskManagement = (taskId: string, action: 'reminder' | 'escalation' | 'reschedule') => {
    return triggerWorkflow({
      workflow: 'smart_task_management',
      parameters: {
        task_id: taskId,
        action,
        timestamp: new Date().toISOString()
      }
    });
  };

  const triggerDataSync = (syncType: 'customers' | 'products' | 'financial' | 'all', source: string) => {
    return triggerWorkflow({
      workflow: 'external_data_sync_hub',
      parameters: {
        sync_type: syncType,
        source,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Specific event triggers
  const onOpportunityStatusChange = (opportunityId: string, oldStatus: string, newStatus: string) => {
    return triggerWorkflow({
      workflow: 'opportunity_status_changed',
      parameters: {
        opportunity_id: opportunityId,
        old_status: oldStatus,
        new_status: newStatus,
        timestamp: new Date().toISOString()
      }
    });
  };

  const onProposalAccepted = (proposalId: string, customerId: string, amount: number) => {
    return triggerWorkflow({
      workflow: 'proposal_accepted',
      parameters: {
        proposal_id: proposalId,
        customer_id: customerId,
        amount,
        timestamp: new Date().toISOString()
      }
    });
  };

  const onTaskDueReminder = (taskId: string, hoursUntilDue: number) => {
    return triggerWorkflow({
      workflow: 'task_due_reminder',
      parameters: {
        task_id: taskId,
        hours_until_due: hoursUntilDue,
        timestamp: new Date().toISOString()
      }
    });
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    triggerWorkflow,
    // Existing methods
    fetchDailyInvoices,
    syncInvoiceStatus,
    downloadInvoicePdf,
    sendNotification,
    // New advanced workflow methods
    triggerCrmAutomation,
    triggerEInvoiceAutomation,
    triggerFinancialReporting,
    triggerTaskManagement,
    triggerDataSync,
    // Event-specific triggers
    onOpportunityStatusChange,
    onProposalAccepted,
    onTaskDueReminder,
    clearError
  };
};