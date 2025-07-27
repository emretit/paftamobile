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

export interface N8nCredentials {
  instanceUrl: string;
  username: string;
  password: string;
  apiKey?: string;
}

export const useN8nTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test n8n authentication and connection
  const testN8nConnection = async (credentials: N8nCredentials) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Testing n8n connection to: ${credentials.instanceUrl}`);

      // Clean URL (remove trailing slash)
      const baseUrl = credentials.instanceUrl.replace(/\/$/, '');
      
      // Test 1: Check if n8n instance is reachable
      const healthResponse = await fetch(`${baseUrl}/healthz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        throw new Error(`n8n instance'a erişilemiyor (${healthResponse.status})`);
      }

      // Test 2: Try to authenticate
      const loginResponse = await fetch(`${baseUrl}/rest/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.text();
        throw new Error(`Kimlik doğrulama başarısız: ${errorData}`);
      }

      const loginData = await loginResponse.json();
      
      // Test 3: If API key provided, test it
      if (credentials.apiKey) {
        const apiTestResponse = await fetch(`${baseUrl}/rest/workflows`, {
          method: 'GET',
          headers: {
            'X-N8N-API-KEY': credentials.apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!apiTestResponse.ok) {
          console.warn('API key test failed, but basic auth worked');
        }
      }

      console.log('✅ n8n connection test successful');
      
      toast.success('n8n bağlantısı başarılı!', {
        description: `${baseUrl} ile bağlantı kuruldu`
      });

      return {
        success: true,
        message: 'Bağlantı başarılı',
        sessionData: loginData
      };

    } catch (err: any) {
      const errorMessage = err.message || 'n8n bağlantı testi başarısız';
      console.error('❌ n8n connection test failed:', err);
      setError(errorMessage);
      
      toast.error('n8n Bağlantı Hatası', {
        description: errorMessage
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Get n8n credentials from saved secrets
  const getN8nCredentials = async (): Promise<N8nCredentials | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', 'n8n_secrets')
        .single();

      if (error || !data?.preference_value) {
        // Fallback to localStorage
        const localSecrets = localStorage.getItem('n8n-secrets');
        if (!localSecrets) return null;
        
        const secrets = JSON.parse(localSecrets);
        return {
          instanceUrl: secrets.find((s: any) => s.name === 'N8N_INSTANCE_URL')?.value || '',
          username: secrets.find((s: any) => s.name === 'N8N_USERNAME')?.value || '',
          password: secrets.find((s: any) => s.name === 'N8N_PASSWORD')?.value || '',
          apiKey: secrets.find((s: any) => s.name === 'N8N_API_KEY')?.value
        };
      }

      const secrets = data.preference_value;
      return {
        instanceUrl: secrets.find((s: any) => s.name === 'N8N_INSTANCE_URL')?.value || '',
        username: secrets.find((s: any) => s.name === 'N8N_USERNAME')?.value || '',
        password: secrets.find((s: any) => s.name === 'N8N_PASSWORD')?.value || '',
        apiKey: secrets.find((s: any) => s.name === 'N8N_API_KEY')?.value
      };
    } catch (error) {
      console.error('Error getting n8n credentials:', error);
      return null;
    }
  };

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
    testN8nConnection,
    getN8nCredentials,
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