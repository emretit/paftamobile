import { supabase } from "@/integrations/supabase/client";
import { nilveraApiService, EInvoiceData } from "./nilveraApiService";



export interface EInvoiceStatusTracking {
  id: string;
  sales_invoice_id: string;
  nilvera_invoice_id?: string;
  nilvera_transfer_id?: string;
  status: 'draft' | 'sending' | 'sent' | 'delivered' | 'accepted' | 'rejected' | 'cancelled' | 'error';
  transfer_state: number;
  invoice_state: number;
  answer_type: number;
  sent_at?: string;
  delivered_at?: string;
  responded_at?: string;
  error_message?: string;
  error_code?: string;
  nilvera_response?: any;
}

class EInvoiceService {

  // Fatura gönder
  private async sendInvoice(salesInvoiceId: string): Promise<boolean> {
    try {
      // Fatura verilerini Nilvera formatına dönüştür
      const eInvoiceData = await nilveraApiService.convertSalesInvoiceToNilvera(salesInvoiceId);

      // Durum takibini başlat
      await this.initializeStatusTracking(salesInvoiceId, 'sending');

      // Nilvera API'sine gönder
      const response = await nilveraApiService.sendEInvoice(eInvoiceData);

      if (response.success && response.data) {
        // Başarılı gönderim - durum takibini güncelle
        await this.updateStatusTracking(salesInvoiceId, {
          nilvera_invoice_id: response.data.invoiceId,
          nilvera_transfer_id: response.data.transferId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          nilvera_response: response.data
        });

        // Satış faturasının durumunu güncelle
        await supabase
          .from('sales_invoices')
          .update({
            durum: 'gonderildi',
            updated_at: new Date().toISOString()
          })
          .eq('id', salesInvoiceId);

        return true;
      } else {
        // Başarısız gönderim - hata kaydı
        await this.updateStatusTracking(salesInvoiceId, {
          status: 'error',
          error_message: response.error?.message,
          error_code: response.error?.code
        });

        return false;
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      await this.updateStatusTracking(salesInvoiceId, {
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Fatura durumunu kontrol et
  private async checkInvoiceStatus(salesInvoiceId: string): Promise<boolean> {
    try {
      // Mevcut durum takibini al
      const { data: tracking } = await supabase
        .from('einvoice_status_tracking')
        .select('*')
        .eq('sales_invoice_id', salesInvoiceId)
        .single();

      if (!tracking?.nilvera_invoice_id) {
        console.warn('No Nilvera invoice ID found for status check');
        return false;
      }

      // Nilvera'dan durum sorgula
      const response = await nilveraApiService.getEInvoiceStatus(tracking.nilvera_invoice_id);

      if (response.success && response.data) {
        const statusData = response.data;
        
        // Durum takibini güncelle
        const updateData: Partial<EInvoiceStatusTracking> = {
          transfer_state: statusData.transferState,
          invoice_state: statusData.invoiceState,
          answer_type: statusData.answerType,
          nilvera_response: statusData
        };

        // Durum değişikliklerini kontrol et
        if (statusData.invoiceState === 2 && tracking.status !== 'delivered') {
          updateData.status = 'delivered';
          updateData.delivered_at = new Date().toISOString();
        }

        if (statusData.answerType === 1 && tracking.status !== 'accepted') {
          updateData.status = 'accepted';
          updateData.responded_at = new Date().toISOString();
        }

        if (statusData.answerType === -1 && tracking.status !== 'rejected') {
          updateData.status = 'rejected';
          updateData.responded_at = new Date().toISOString();
        }

        await this.updateStatusTracking(salesInvoiceId, updateData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking invoice status:', error);
      return false;
    }
  }

  // Faturayı yeniden gönder
  private async resendInvoice(salesInvoiceId: string): Promise<boolean> {
    // Yeniden gönderme işlemi gönderme ile aynı
    return this.sendInvoice(salesInvoiceId);
  }

  // Durum takibini başlat
  private async initializeStatusTracking(salesInvoiceId: string, status: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return;

      await supabase
        .from('einvoice_status_tracking')
        .upsert({
          sales_invoice_id: salesInvoiceId,
          company_id: profile.company_id,
          status,
          transfer_state: 0,
          invoice_state: 0,
          answer_type: 0
        }, {
          onConflict: 'sales_invoice_id,company_id'
        });
    } catch (error) {
      console.error('Error initializing status tracking:', error);
    }
  }

  // Durum takibini güncelle
  private async updateStatusTracking(salesInvoiceId: string, updateData: Partial<EInvoiceStatusTracking>): Promise<void> {
    try {
      await supabase
        .from('einvoice_status_tracking')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('sales_invoice_id', salesInvoiceId);
    } catch (error) {
      console.error('Error updating status tracking:', error);
    }
  }

  // Fatura durum takibini al
  async getInvoiceStatus(salesInvoiceId: string): Promise<EInvoiceStatusTracking | null> {
    try {
      const { data, error } = await supabase
        .from('einvoice_status_tracking')
        .select('*')
        .eq('sales_invoice_id', salesInvoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting invoice status:', error);
      return null;
    }
  }



  // Direkt fatura gönder
  async sendInvoiceDirectly(salesInvoiceId: string): Promise<boolean> {
    try {
      // Fatura verilerini Nilvera formatına dönüştür
      const eInvoiceData = await nilveraApiService.convertSalesInvoiceToNilvera(salesInvoiceId);

      // Durum takibini başlat
      await this.initializeStatusTracking(salesInvoiceId, 'sending');

      // Nilvera API'sine gönder
      const response = await nilveraApiService.sendEInvoice(eInvoiceData);

      if (response.success && response.data) {
        // Başarılı gönderim - durum takibini güncelle
        await this.updateStatusTracking(salesInvoiceId, {
          nilvera_invoice_id: response.data.invoiceId,
          nilvera_transfer_id: response.data.transferId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          nilvera_response: response.data
        });

        // Satış faturasının durumunu güncelle
        await supabase
          .from('sales_invoices')
          .update({
            durum: 'gonderildi',
            updated_at: new Date().toISOString()
          })
          .eq('id', salesInvoiceId);

        return true;
      } else {
        // Başarısız gönderim - hata kaydı
        await this.updateStatusTracking(salesInvoiceId, {
          status: 'error',
          error_message: response.error?.message,
          error_code: response.error?.code
        });

        return false;
      }
    } catch (error) {
      console.error('Error sending invoice directly:', error);
      await this.updateStatusTracking(salesInvoiceId, {
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Durum kontrolü yap
  async checkStatusManually(salesInvoiceId: string): Promise<boolean> {
    return this.checkInvoiceStatus(salesInvoiceId);
  }
}

// Singleton instance
export const eInvoiceService = new EInvoiceService();
export default eInvoiceService;
