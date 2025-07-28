import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useN8nTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerWorkflow = async (workflowName: string, parameters: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('trigger-n8n', {
        body: {
          workflow: workflowName,
          user_id: user.id,
          parameters
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Workflow trigger failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyInvoices = async () => {
    return triggerWorkflow('veriban_daily_sync', {
      action: 'fetch_daily_invoices',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const syncInvoiceStatus = async (invoiceId: string) => {
    return triggerWorkflow('veriban_status_sync', {
      action: 'sync_invoice_status',
      invoice_id: invoiceId
    });
  };

  const downloadInvoicePdf = async (invoiceId: string) => {
    return triggerWorkflow('veriban_pdf_download', {
      action: 'download_pdf',
      invoice_id: invoiceId
    });
  };

  const sendNotification = async (type: string, data: any) => {
    return triggerWorkflow('notification_workflow', {
      notification_type: type,
      ...data
    });
  };

  return {
    loading,
    error,
    triggerWorkflow,
    fetchDailyInvoices,
    syncInvoiceStatus,
    downloadInvoicePdf,
    sendNotification
  };
};