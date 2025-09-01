import { supabase } from "@/integrations/supabase/client";

// Nilvera API Types
export interface NilveraApiConfig {
  id: string;
  company_id: string;
  api_key: string;
  environment: 'test' | 'production';
  base_url: string;
  company_tax_number: string;
  company_name: string;
  company_address?: string;
  company_city?: string;
  company_country: string;
  default_invoice_profile: 'TEMELFATURA' | 'TICARIFATURA';
  default_currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  auto_send_enabled: boolean;
  is_active: boolean;
}

export interface EInvoiceData {
  InvoiceInfo: {
    InvoiceSerieOrNumber: string;
    IssueDate: string;
    CurrencyCode: string;
    InvoiceProfile: string;
  };
  CompanyInfo: {
    TaxNumber: string;
    Name: string;
    Address: string;
    City: string;
    Country: string;
  };
  CustomerInfo: {
    TaxNumber: string;
    Name: string;
    Address: string;
    City: string;
    Country: string;
  };
  InvoiceLines: Array<{
    Name: string;
    Quantity: number;
    UnitType: string;
    Price: number;
    KDVPercent: number;
  }>;
  Notes?: string[];
}

export interface NilveraApiResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface EInvoiceStatus {
  invoiceId: string;
  transferId?: string;
  transferState: number;
  invoiceState: number;
  answerType: number;
}

class NilveraApiService {
  private config: NilveraApiConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  // Yapılandırmayı yükle
  private async loadConfig(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Kullanıcının company_id'sini al
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      // API yapılandırmasını al
      const { data: config, error } = await supabase
        .from('nilvera_api_config')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!config) throw new Error('Nilvera API configuration not found');

      this.config = config;
    } catch (error) {
      console.error('Error loading Nilvera API config:', error);
      throw error;
    }
  }

  // API isteği yap
  private async makeApiRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<NilveraApiResponse> {
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config) {
      throw new Error('API configuration not loaded');
    }

    const url = `${this.config.base_url}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.api_key}`,
          'Accept': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: responseData.message || 'API request failed',
            code: responseData.code || response.status.toString(),
            details: responseData
          }
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error('Nilvera API request error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  // E-fatura gönder
  async sendEInvoice(invoiceData: EInvoiceData): Promise<NilveraApiResponse> {
    try {
      const response = await this.makeApiRequest('/e-invoice/send', 'POST', {
        EInvoice: invoiceData
      });

      // Log kaydı oluştur
      await this.logOperation('send', 'send', { invoiceData }, response);

      return response;
    } catch (error) {
      console.error('Error sending e-invoice:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to send e-invoice'
        }
      };
    }
  }

  // E-fatura durumu sorgula
  async getEInvoiceStatus(invoiceId: string): Promise<NilveraApiResponse> {
    try {
      const response = await this.makeApiRequest(`/e-invoice/status/${invoiceId}`);
      
      // Log kaydı oluştur
      await this.logOperation('status', 'status', { invoiceId }, response);

      return response;
    } catch (error) {
      console.error('Error getting e-invoice status:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get e-invoice status'
        }
      };
    }
  }

  // E-fatura listesi al
  async getEInvoiceList(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
  }): Promise<NilveraApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = `/e-invoice/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeApiRequest(endpoint);

      // Log kaydı oluştur
      await this.logOperation('list', 'receive', params, response);

      return response;
    } catch (error) {
      console.error('Error getting e-invoice list:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get e-invoice list'
        }
      };
    }
  }

  // Fatura PDF'ini indir
  async downloadEInvoicePdf(invoiceId: string): Promise<NilveraApiResponse> {
    try {
      const response = await this.makeApiRequest(`/e-invoice/pdf/${invoiceId}`);
      
      // Log kaydı oluştur
      await this.logOperation('download', 'download', { invoiceId }, response);

      return response;
    } catch (error) {
      console.error('Error downloading e-invoice PDF:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to download e-invoice PDF'
        }
      };
    }
  }

  // Satış faturasından Nilvera formatına dönüştür
  async convertSalesInvoiceToNilvera(salesInvoiceId: string): Promise<EInvoiceData> {
    try {
      // Satış faturasını ve kalemlerini al
      const { data: invoice, error: invoiceError } = await supabase
        .from('sales_invoices')
        .select(`
          *,
          customer:customers(*),
          items:sales_invoice_items(*)
        `)
        .eq('id', salesInvoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      if (!invoice) throw new Error('Sales invoice not found');

      if (!this.config) {
        await this.loadConfig();
      }

      // Nilvera formatına dönüştür
      const eInvoiceData: EInvoiceData = {
        InvoiceInfo: {
          InvoiceSerieOrNumber: invoice.fatura_no,
          IssueDate: new Date(invoice.fatura_tarihi).toISOString(),
          CurrencyCode: invoice.para_birimi || 'TRY',
          InvoiceProfile: this.config?.default_invoice_profile || 'TEMELFATURA'
        },
        CompanyInfo: {
          TaxNumber: this.config?.company_tax_number || '',
          Name: this.config?.company_name || '',
          Address: this.config?.company_address || '',
          City: this.config?.company_city || '',
          Country: this.config?.company_country || 'Türkiye'
        },
        CustomerInfo: {
          TaxNumber: invoice.customer?.tax_number || '',
          Name: invoice.customer?.name || '',
          Address: invoice.customer?.address || '',
          City: invoice.customer?.city || '',
          Country: 'Türkiye'
        },
        InvoiceLines: invoice.items?.map((item: any) => ({
          Name: item.urun_adi,
          Quantity: parseFloat(item.miktar),
          UnitType: 'C62', // Adet
          Price: parseFloat(item.birim_fiyat),
          KDVPercent: parseFloat(item.kdv_orani)
        })) || [],
        Notes: invoice.notlar ? [invoice.notlar] : undefined
      };

      return eInvoiceData;
    } catch (error) {
      console.error('Error converting sales invoice to Nilvera format:', error);
      throw error;
    }
  }

  // API işlem log'u oluştur
  private async logOperation(
    operation: string,
    operationType: string,
    requestData: any,
    responseData: NilveraApiResponse
  ): Promise<void> {
    try {
      if (!this.config) return;

      await supabase
        .from('einvoice_logs')
        .insert({
          company_id: this.config.company_id,
          operation,
          operation_type: operationType,
          request_data: requestData,
          response_data: responseData.data,
          success: responseData.success,
          error_message: responseData.error?.message,
          response_time_ms: 0 // Bu hesaplanabilir
        });
    } catch (error) {
      console.error('Error logging API operation:', error);
    }
  }

  // Yapılandırmanın geçerli olup olmadığını kontrol et
  async validateConfig(): Promise<boolean> {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.config) return false;

      // Basit bir API test isteği yap
      const response = await this.makeApiRequest('/health');
      return response.success;
    } catch (error) {
      console.error('Error validating config:', error);
      return false;
    }
  }

  // Yapılandırmayı güncelle
  async updateConfig(newConfig: Partial<NilveraApiConfig>): Promise<boolean> {
    try {
      if (!this.config) return false;

      const { error } = await supabase
        .from('nilvera_api_config')
        .update({
          ...newConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.config.id);

      if (error) throw error;

      // Yapılandırmayı yeniden yükle
      await this.loadConfig();
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      return false;
    }
  }
}

// Singleton instance
export const nilveraApiService = new NilveraApiService();
export default nilveraApiService;
