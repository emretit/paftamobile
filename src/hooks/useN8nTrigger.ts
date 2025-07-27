import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface N8nWorkflowParams {
  workflow: 'fetch_daily_invoices' | 'sync_invoice_status' | 'download_invoice_pdf' | 'send_notification';
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

  const clearError = () => setError(null);

  return {
    loading,
    error,
    triggerWorkflow,
    fetchDailyInvoices,
    syncInvoiceStatus,
    downloadInvoicePdf,
    sendNotification,
    clearError
  };
};