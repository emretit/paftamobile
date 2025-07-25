import { 
  VeribanConfig, 
  EInvoiceTransferFile,
  EInvoiceDocumentSendFile,
  TransferResult, 
  DocumentSendResult,
  TransferQueryResult, 
  InvoiceQueryResult,
  PurchaseInvoiceInfo,
  OperationResult,
  DownloadResult,
  CustomerAlias,
  TransferStateCode,
  InvoiceStateCode,
  AnswerStateCode,
  AnswerTypeCode,
  DownloadDocumentDataTypes,
  TransferDocumentDataTypes,
  MarketType,
  VeribanServiceFault,
  getTransferStateMessage,
  getInvoiceStateMessage,
  getAnswerTypeMessage
} from './types';
import { supabase } from '../../integrations/supabase/client';

export class VeribanEInvoiceService {
  private sessionCode: string | null = null;
  private logCallback?: (operationType: string, details: any, success: boolean, error?: string, response?: any) => void;
  private readonly PROXY_URL = 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/veriban-proxy';
  private readonly SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo';

  constructor(logCallback?: (operationType: string, details: any, success: boolean, error?: string, response?: any) => void) {
    this.logCallback = logCallback;
  }

  /**
   * Proxy üzerinden SOAP isteği gönderir
   */
  private async sendSoapRequest(targetUrl: string, soapAction: string, soapBody: string): Promise<Response> {
    return await fetch(this.PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
        'x-target-url': targetUrl,
        'x-soap-action': soapAction
      },
      body: soapBody
    });
  }

  /**
   * Log işlemi kaydet
   */
  private async log(operationType: string, details: any, success: boolean = true, error?: string, response?: any) {
    try {
      if (this.logCallback) {
        await this.logCallback(operationType, details, success, error, response);
      }
    } catch (logError) {
      console.error('Log kaydetme hatası:', logError);
    }
  }

  /**
   * Ayarlardan Veriban konfigürasyonunu yükler
   */
  private getConfig(): VeribanConfig {
    const savedConfig = localStorage.getItem('veribanConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    
    // Varsayılan ayarlar - sadece canlı ortam
    return {
      liveUserName: '',
      livePassword: '',
      liveServiceUrl: 'https://efaturatransfer.veriban.com.tr/IntegrationService.svc'
    };
  }

  /**
   * Veriban ayarlarının geçerli olup olmadığını kontrol eder
   */
  private validateConfig(config: VeribanConfig): { isValid: boolean; errorMessage?: string } {
    if (!config.liveUserName || config.liveUserName.trim() === '') {
      return { isValid: false, errorMessage: 'Veriban kullanıcı adı ayarlanmamış. Lütfen ayarlar sayfasından kullanıcı bilgilerinizi girin.' };
    }
    
    if (!config.livePassword || config.livePassword.trim() === '') {
      return { isValid: false, errorMessage: 'Veriban şifresi ayarlanmamış. Lütfen ayarlar sayfasından şifrenizi girin.' };
    }
    
    if (!config.liveServiceUrl || !config.liveServiceUrl.startsWith('https://')) {
      return { isValid: false, errorMessage: 'Veriban servis URL\'i geçersiz.' };
    }
    
    return { isValid: true };
  }

  /**
   * Test amaçlı login kontrolü
   */
  async testLogin(): Promise<{ success: boolean; message: string; sessionCode?: string }> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    // Konfigürasyon validasyonu
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Konfigürasyon hatası: ${validation.errorMessage}`
      };
    }
    
    try {
      const serviceUrl = config.liveServiceUrl;
      const soapRequest = this.createLoginSoapRequest();
      
      console.log('🔐 Test Login Attempt:', {
        serviceUrl,
        userName: config.liveUserName,
        timestamp: new Date().toISOString()
      });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'Login',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const xmlText = await response.text();
        console.log('📄 Login Response XML:', xmlText);
        
        // SOAP Fault kontrolü
        if (xmlText.includes('soap:Fault') || xmlText.includes('faultstring')) {
          const fault = this.parseSoapFault(xmlText);
          return {
            success: false,
            message: `SOAP Hatası: ${fault.faultCode} - ${fault.faultDescription}`
          };
        }
        
        const sessionCode = this.extractSessionCode(xmlText);
        if (sessionCode) {
          this.sessionCode = sessionCode;
          return {
            success: true,
            message: `Başarıyla giriş yapıldı! Yanıt süresi: ${responseTime}ms`,
            sessionCode
          };
        } else {
          return {
            success: false,
            message: 'Session code alınamadı'
          };
        }
      } else {
        return {
          success: false,
          message: `HTTP Hatası: ${response.status} ${response.statusText}`
        };
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        message: `Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'} (${responseTime}ms)`
      };
    }
  }

  /**
   * Veriban servisine oturum açar
   */
  async login(): Promise<boolean> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    // Konfigürasyon validasyonu
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      console.error('❌ Config Validation Failed:', validation.errorMessage);
      await this.log('login', { 
        configValid: false,
        error: validation.errorMessage 
      }, false, validation.errorMessage);
      throw new Error(validation.errorMessage);
    }
    
    try {
      const serviceUrl = config.liveServiceUrl;
      const soapRequest = this.createLoginSoapRequest();
      
      console.log('🔐 Login Attempt:', {
        serviceUrl,
        userName: config.liveUserName,
        soapRequest
      });
      
      await this.log('login_attempt', { 
        serviceUrl, 
        userName: config.liveUserName 
      });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'Login',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      console.log('📡 HTTP Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime
      });

      if (response.ok) {
        const xmlText = await response.text();
        console.log('📄 Login Response XML:', xmlText);
        
        // SOAP Fault kontrolü
        if (xmlText.includes('soap:Fault') || xmlText.includes('faultstring')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          console.error('❌ SOAP Fault:', fault);
          
          await this.log('login', { 
            serviceUrl, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        this.sessionCode = this.extractSessionCode(xmlText);
        const success = !!this.sessionCode;
        
        console.log('🎯 Session Code:', this.sessionCode, 'Success:', success);
        
        await this.log('login', { 
          serviceUrl, 
          responseTime,
          sessionCodeReceived: success 
        }, success, success ? undefined : 'Session code alınamadı');
        
        return success;
      } else {
        const errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
        
        console.error('❌ HTTP Error:', response.status, response.statusText);
        
        await this.log('login', { 
          serviceUrl, 
          responseTime,
          httpStatus: response.status,
          httpStatusText: response.statusText 
        }, false, errorMsg);
      
      return false;
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      console.error('💥 Login Exception:', error);
      
              await this.log('login', { 
          serviceUrl: config.liveServiceUrl,
          responseTime 
        }, false, errorMsg);
      
      return false;
    }
  }

  /**
   * Fatura gönderir (Eski TransferSalesInvoiceFile metodu)
   */
  async sendInvoice(
    xmlContent: string, 
    fileName: string,
    customerAlias?: string, 
    isDirectSend: boolean = true
  ): Promise<TransferResult | null> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const zipData = await this.createZipFromXml(xmlContent, fileName);
      const hash = await this.calculateMD5Hash(zipData);

      const transferFile: EInvoiceTransferFile = {
        fileNameWithExtension: `${fileName}.zip`,
        fileDataType: TransferDocumentDataTypes.XML_INZIP,
        binaryData: zipData,
        binaryDataHash: hash,
        customerAlias: customerAlias || 'urn:mail:defaultpk@veriban.com.tr',
        isDirectSend
      };

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createTransferSoapRequest(transferFile);
      
      await this.log('send_invoice_attempt', { 
        fileName, 
        fileSize: zipData.length,
        customerAlias,
        isDirectSend 
      });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'TransferSalesInvoiceFile',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Transfer Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('send_invoice', { 
            fileName, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseTransferResult(xmlText);
        
        await this.log('send_invoice', { 
          fileName, 
          responseTime,
          transferFileUniqueId: result.transferFileUniqueId,
          operationCompleted: result.operationCompleted 
        }, result.operationCompleted, result.operationCompleted ? undefined : result.description, result);
        
        return result;
      }

      throw new Error('Fatura gönderimi başarısız');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('send_invoice', { 
        fileName, 
        responseTime 
      }, false, errorMsg);
      
      console.error('Fatura gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Yeni SendDocumentFile metodu - Veriban'ın yeni API'si
   */
  async sendDocumentFile(
    xmlContent: string,
    fileName: string,
    customerAlias?: string,
    isDirectSend: boolean = true,
    useSerieCode: boolean = false,
    serieCode?: string
  ): Promise<DocumentSendResult | null> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const zipData = await this.createZipFromXml(xmlContent, fileName);
      const hash = await this.calculateMD5Hash(zipData);

      const sendFile: EInvoiceDocumentSendFile = {
        fileNameWithExtension: `${fileName}.zip`,
        fileDataType: TransferDocumentDataTypes.XML_INZIP,
        binaryData: zipData,
        binaryDataHash: hash,
        customerAlias: customerAlias,
        isDirectSend,
        useSerieCode,
        serieCode
      };

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createSendDocumentSoapRequest(sendFile);
      
      await this.log('send_document_attempt', { 
        fileName, 
        fileSize: zipData.length,
        customerAlias,
        isDirectSend,
        useSerieCode,
        serieCode 
      });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'SendDocumentFile',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('SendDocument Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('send_document', { 
            fileName, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseDocumentSendResult(xmlText);
        
        await this.log('send_document', { 
          fileName, 
          responseTime,
          documentUUID: result.documentUUID,
          documentNumber: result.documentNumber,
          operationCompleted: result.operationCompleted 
        }, result.operationCompleted, result.operationCompleted ? undefined : result.description, result);
        
        return result;
      }

      throw new Error('Doküman gönderimi başarısız');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('send_document', { 
        fileName, 
        responseTime 
      }, false, errorMsg);
      
      console.error('Doküman gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Transfer durumunu sorgular
   */
  async getTransferStatus(transferFileUniqueId: string): Promise<TransferQueryResult | null> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createTransferStatusSoapRequest(transferFileUniqueId);
      
      await this.log('get_transfer_status_attempt', { transferFileUniqueId });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetTransferSalesInvoiceFileStatus',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Transfer Status Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('get_transfer_status', { 
            transferFileUniqueId, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseTransferQueryResult(xmlText);
        
        await this.log('get_transfer_status', { 
          transferFileUniqueId, 
          responseTime,
          stateCode: result.stateCode,
          stateName: result.stateName 
        }, true, undefined, result);
        
        return result;
      }

      throw new Error('Transfer durumu sorgulanamadı');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('get_transfer_status', { 
        transferFileUniqueId, 
        responseTime 
      }, false, errorMsg);
      
      console.error('Transfer durumu sorgulama hatası:', error);
      throw error;
    }
  }

  /**
   * Fatura durumunu sorgular
   */
  async getInvoiceStatus(invoiceUUID: string): Promise<InvoiceQueryResult | null> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createInvoiceStatusSoapRequest(invoiceUUID);
      
      await this.log('get_invoice_status_attempt', { invoiceUUID });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetSalesInvoiceStatusWithInvoiceUUID',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Invoice Status Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('get_invoice_status', { 
            invoiceUUID, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseInvoiceQueryResult(xmlText);
        
        await this.log('get_invoice_status', { 
          invoiceUUID, 
          responseTime,
          stateCode: result.stateCode,
          stateName: result.stateName 
        }, true, undefined, result);
        
        return result;
      }

      throw new Error('Fatura durumu sorgulanamadı');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('get_invoice_status', { 
        invoiceUUID, 
        responseTime 
      }, false, errorMsg);
      
      console.error('Fatura durumu sorgulama hatası:', error);
      throw error;
    }
  }

  /**
   * Gelen faturaları listeler
   */
  async getIncomingInvoices(): Promise<PurchaseInvoiceInfo[]> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createIncomingInvoicesSoapRequest();
      
      await this.log('get_incoming_invoices_attempt', {});
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetUnTransferredPurchaseInvoiceList',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Incoming Invoices Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('get_incoming_invoices', { 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parsePurchaseInvoiceList(xmlText);
        
        await this.log('get_incoming_invoices', { 
          responseTime,
          invoiceCount: result.length 
        }, true, undefined, { invoiceCount: result.length });
        
        return result;
      }

      throw new Error('Gelen fatura listesi alınamadı');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('get_incoming_invoices', { 
        responseTime 
      }, false, errorMsg);
      
      console.error('Gelen fatura listesi hatası:', error);
      throw error;
    }
  }

  /**
   * Faturaya cevap verir
   */
  async answerInvoice(
    invoiceUUID: string, 
    answerType: 'ACCEPTED' | 'REJECTED', 
    note: string = ''
  ): Promise<OperationResult | null> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createAnswerInvoiceSoapRequest(invoiceUUID, answerType, note);
      
      await this.log('answer_invoice_attempt', { invoiceUUID, answerType, note });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'SetPurchaseInvoiceAnswerWithInvoiceUUID',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Answer Invoice Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('answer_invoice', { 
            invoiceUUID, 
            answerType,
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseOperationResult(xmlText);
        
        await this.log('answer_invoice', { 
          invoiceUUID, 
          answerType,
          responseTime,
          operationCompleted: result.operationCompleted 
        }, result.operationCompleted, result.operationCompleted ? undefined : result.description, result);
        
        return result;
      }

      throw new Error('Fatura cevabı gönderilemedi');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('answer_invoice', { 
        invoiceUUID, 
        answerType,
        responseTime 
      }, false, errorMsg);
      
      console.error('Fatura cevap hatası:', error);
      throw error;
    }
  }

  /**
   * Fatura indirir
   */
  async downloadInvoice(
    invoiceUUID: string, 
    downloadType: DownloadDocumentDataTypes = DownloadDocumentDataTypes.XML_INZIP
  ): Promise<DownloadResult | null> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createDownloadInvoiceSoapRequest(invoiceUUID, downloadType);
      
      await this.log('download_invoice_attempt', { invoiceUUID, downloadType });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'DownloadSalesInvoiceWithInvoiceUUID',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Download Invoice Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('download_invoice', { 
            invoiceUUID, 
            downloadType,
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseDownloadResult(xmlText);
        
        await this.log('download_invoice', { 
          invoiceUUID, 
          downloadType,
          responseTime,
          downloadFileReady: result.downloadFileReady 
        }, result.downloadFileReady, result.downloadFileReady ? undefined : result.downloadDescription, result);
        
        return result;
      }

      throw new Error('Fatura indirilemedi');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('download_invoice', { 
        invoiceUUID, 
        downloadType,
        responseTime 
      }, false, errorMsg);
      
      console.error('Fatura indirme hatası:', error);
      throw error;
    }
  }

  /**
   * Müşteri etiket bilgisini getirir
   */
  async getCustomerAliasInfo(registerNumber: string): Promise<CustomerAlias[]> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createCustomerAliasSoapRequest(registerNumber);
      
      await this.log('get_customer_alias_attempt', { registerNumber });
      
      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetCustomerAliasListWithRegisterNumber',
        soapRequest
      );

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Customer Alias Response:', xmlText);
        
        if (xmlText.includes('soap:Fault')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('get_customer_alias', { 
            registerNumber, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        const result = this.parseCustomerAliasList(xmlText);
        
        await this.log('get_customer_alias', { 
          registerNumber, 
          responseTime,
          aliasCount: result.length 
        }, true, undefined, { aliasCount: result.length });
        
        return result;
      }

      throw new Error('Müşteri etiket bilgisi alınamadı');
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('get_customer_alias', { 
        registerNumber, 
        responseTime 
      }, false, errorMsg);
      
      console.error('Müşteri etiket bilgisi hatası:', error);
      return [];
    }
  }

  /**
   * Oturumu kapatır
   */
  async logout(): Promise<void> {
    const startTime = Date.now();
    const config = this.getConfig();
    
    try {
      if (this.sessionCode) {
        const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
        const soapRequest = this.createLogoutSoapRequest();
        
        await this.log('logout_attempt', {});
        
        await this.sendSoapRequest(
          serviceUrl,
          'Logout',
          soapRequest
        );
        
        const responseTime = Date.now() - startTime;
        
        await this.log('logout', { responseTime }, true);
        
        this.sessionCode = null;
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('logout', { responseTime }, false, errorMsg);
      
      console.error('Logout hatası:', error);
    }
  }

  /**
   * Transfer edilmemiş gelen e-faturaların listesini alır
   */
  async getUnTransferredPurchaseInvoiceList(): Promise<PurchaseInvoiceInfo[]> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('get_untransferred_purchase_invoices', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUnTransferredPurchaseInvoiceList xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
    </GetUnTransferredPurchaseInvoiceList>
  </soap:Body>
</soap:Envelope>`;

      await this.log('get_untransferred_purchase_invoices_request', { serviceUrl, sessionCode: this.sessionCode });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetUnTransferredPurchaseInvoiceList',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('get_untransferred_purchase_invoices', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          
          // Session hatası varsa otomatik yeniden login dene
          if (soapFault.faultCode === '5003' || soapFault.faultDescription.includes('SESSION FAIL')) {
            console.log('🔄 Session expired, attempting re-login...');
            const loginSuccess = await this.login();
            if (loginSuccess) {
              console.log('✅ Re-login successful, retrying operation...');
              // Tekrar dene
              return await this.getUnTransferredPurchaseInvoiceList();
            }
            throw new Error('Oturum süresi dolmuş ve yeniden giriş başarısız');
          }
          
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const invoices = this.parsePurchaseInvoiceList(xmlText);
        await this.log('get_untransferred_purchase_invoices', { responseTime, invoiceCount: invoices.length }, true, undefined, { invoices });
        return invoices;
      } else {
        await this.log('get_untransferred_purchase_invoices', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('get_untransferred_purchase_invoices', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  /**
   * Tüm gelen e-faturaların UUID listesini alır (transfer edilmiş olanlar dahil)
   */
  async getAllPurchaseInvoiceUUIDList(startDate: Date, endDate: Date): Promise<string[]> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('get_all_purchase_invoice_uuids', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPurchaseInvoiceUUIDList xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <startDate>${formatDate(startDate)}</startDate>
      <endDate>${formatDate(endDate)}</endDate>
    </GetPurchaseInvoiceUUIDList>
  </soap:Body>
</soap:Envelope>`;

      await this.log('get_all_purchase_invoice_uuids_request', { 
        serviceUrl, 
        sessionCode: this.sessionCode,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetPurchaseInvoiceUUIDList',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('get_all_purchase_invoice_uuids', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          
          // Session hatası varsa otomatik yeniden login dene
          if (soapFault.faultCode === '5003' || soapFault.faultDescription.includes('SESSION FAIL')) {
            console.log('🔄 Session expired, attempting re-login...');
            const loginSuccess = await this.login();
            if (loginSuccess) {
              console.log('✅ Re-login successful, retrying operation...');
              // Tekrar dene
              return await this.getAllPurchaseInvoiceUUIDList(startDate, endDate);
            }
            throw new Error('Oturum süresi dolmuş ve yeniden giriş başarısız');
          }
          
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const uuids = this.parseStringList(xmlText);
        await this.log('get_all_purchase_invoice_uuids', { responseTime, uuidCount: uuids.length }, true, undefined, { uuids });
        return uuids;
      } else {
        await this.log('get_all_purchase_invoice_uuids', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('get_all_purchase_invoice_uuids', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  /**
   * UUID listesinden fatura detaylarını alır
   */
  async getPurchaseInvoiceDetailsFromUUIDs(uuids: string[]): Promise<PurchaseInvoiceInfo[]> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('get_purchase_invoice_details', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    if (!uuids || uuids.length === 0) {
      console.log('📝 No UUIDs provided for detail lookup');
      return [];
    }

    console.log(`🔍 Getting details for ${uuids.length} invoices...`);
    
    const invoices: PurchaseInvoiceInfo[] = [];
    
    // Her UUID için ayrı ayrı detay al (batch işlemi yok)
    for (let i = 0; i < uuids.length; i++) {
      const uuid = uuids[i];
      console.log(`📄 Processing ${i + 1}/${uuids.length}: ${uuid}`);
      
      try {
        // Önce download edip sonra parse et
        const downloadResult = await this.downloadPurchaseInvoice(uuid, DownloadDocumentDataTypes.XML_INZIP);
        
        if (downloadResult.downloadFileReady && downloadResult.downloadFile?.fileData) {
          // ZIP dosyasını aç ve XML'i parse et
          const zipData = new Uint8Array(downloadResult.downloadFile.fileData);
          const zipEntries = await this.extractZipFiles(zipData);
          
          if (zipEntries.length > 0) {
            const xmlContent = new TextDecoder().decode(zipEntries[0].data);
            console.log(`📋 Extracted XML for ${uuid}:`, xmlContent.substring(0, 200) + '...');
            
            // XML'den temel bilgileri çıkar
            const invoice = this.parseInvoiceFromXML(xmlContent, uuid);
            if (invoice) {
              invoices.push(invoice);
              console.log(`✅ Parsed invoice details:`, {
                uuid: invoice.invoiceUUID,
                number: invoice.invoiceNumber,
                customer: invoice.customerTitle,
                amount: invoice.payableAmount
              });
            }
          }
        } else {
          console.warn(`⚠️ Download not ready for ${uuid}:`, downloadResult.downloadDescription);
        }
      } catch (error) {
        console.error(`❌ Error processing ${uuid}:`, error);
        // Hata durumunda basit bir invoice objesi oluştur
        invoices.push({
          invoiceUUID: uuid,
          invoiceNumber: `Unknown-${i + 1}`,
          issueTime: '',
          customerRegisterNumber: '',
          customerTitle: 'Bilinmeyen Firma',
          invoiceProfile: '',
          invoiceType: '',
          lineExtensionAmount: 0,
          allowanceTotalAmount: 0,
          taxExclusiveAmount: 0,
          taxTotalAmount: 0,
          payableAmount: 0,
          currencyCode: 'TRY',
          exchangeRate: 1,
          isRead: false
        });
      }
      
      // Rate limiting - her istek arasında kısa bekleme
      if (i < uuids.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`📊 Processed ${invoices.length} invoices in ${responseTime}ms`);
    
    await this.log('get_purchase_invoice_details', { 
      responseTime, 
      requestedCount: uuids.length, 
      processedCount: invoices.length 
    }, true);
    
    return invoices;
  }

  /**
   * XML'den fatura bilgilerini parse eder
   */
  private parseInvoiceFromXML(xmlContent: string, uuid: string): PurchaseInvoiceInfo | null {
    try {
      // UBL Invoice XML'den temel bilgileri çıkar
      const invoiceNumberMatch = xmlContent.match(/<cbc:ID[^>]*>(.*?)<\/cbc:ID>/);
      const issueDateMatch = xmlContent.match(/<cbc:IssueDate[^>]*>(.*?)<\/cbc:IssueDate>/);
      const issueTimeMatch = xmlContent.match(/<cbc:IssueTime[^>]*>(.*?)<\/cbc:IssueTime>/);
      
      // Satıcı bilgileri
      const sellerNameMatch = xmlContent.match(/<cac:AccountingSupplierParty[^>]*>.*?<cac:Party[^>]*>.*?<cac:PartyName[^>]*>.*?<cbc:Name[^>]*>(.*?)<\/cbc:Name>/s);
      const sellerVknMatch = xmlContent.match(/<cac:AccountingSupplierParty[^>]*>.*?<cac:Party[^>]*>.*?<cac:PartyTaxScheme[^>]*>.*?<cbc:CompanyID[^>]*>(.*?)<\/cbc:CompanyID>/s);
      
      // Toplam tutarlar
      const lineExtensionAmountMatch = xmlContent.match(/<cac:LegalMonetaryTotal[^>]*>.*?<cbc:LineExtensionAmount[^>]*>(.*?)<\/cbc:LineExtensionAmount>/s);
      const taxExclusiveAmountMatch = xmlContent.match(/<cac:LegalMonetaryTotal[^>]*>.*?<cbc:TaxExclusiveAmount[^>]*>(.*?)<\/cbc:TaxExclusiveAmount>/s);
      const taxInclusiveAmountMatch = xmlContent.match(/<cac:LegalMonetaryTotal[^>]*>.*?<cbc:TaxInclusiveAmount[^>]*>(.*?)<\/cbc:TaxInclusiveAmount>/s);
      const payableAmountMatch = xmlContent.match(/<cac:LegalMonetaryTotal[^>]*>.*?<cbc:PayableAmount[^>]*>(.*?)<\/cbc:PayableAmount>/s);
      const currencyCodeMatch = xmlContent.match(/<cbc:DocumentCurrencyCode[^>]*>(.*?)<\/cbc:DocumentCurrencyCode>/);
      
      // Fatura tipi
      const invoiceTypeMatch = xmlContent.match(/<cbc:InvoiceTypeCode[^>]*>(.*?)<\/cbc:InvoiceTypeCode>/);
      
      const invoice: PurchaseInvoiceInfo = {
        invoiceUUID: uuid,
        invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : `Unknown-${uuid.substring(0, 8)}`,
        issueTime: issueDateMatch ? `${issueDateMatch[1]}${issueTimeMatch ? 'T' + issueTimeMatch[1] : ''}` : '',
        customerRegisterNumber: sellerVknMatch ? sellerVknMatch[1] : '',
        customerTitle: sellerNameMatch ? sellerNameMatch[1] : 'Bilinmeyen Firma',
        invoiceProfile: 'TICARIFATURA', // Varsayılan
        invoiceType: invoiceTypeMatch ? invoiceTypeMatch[1] : 'SATIS',
        lineExtensionAmount: lineExtensionAmountMatch ? parseFloat(lineExtensionAmountMatch[1]) || 0 : 0,
        allowanceTotalAmount: 0, // Bu bilgi XML'de farklı yerde olabilir
        taxExclusiveAmount: taxExclusiveAmountMatch ? parseFloat(taxExclusiveAmountMatch[1]) || 0 : 0,
        taxTotalAmount: taxInclusiveAmountMatch && taxExclusiveAmountMatch ? 
          parseFloat(taxInclusiveAmountMatch[1]) - parseFloat(taxExclusiveAmountMatch[1]) : 0,
        payableAmount: payableAmountMatch ? parseFloat(payableAmountMatch[1]) || 0 : 0,
        currencyCode: currencyCodeMatch ? currencyCodeMatch[1] : 'TRY',
        exchangeRate: 1, // Varsayılan
        isRead: false
      };
      
      return invoice;
    } catch (error) {
      console.error('❌ Error parsing invoice XML:', error);
      return null;
    }
  }

  /**
   * Belirli tarih aralığında gelen e-faturaların UUID listesini alır
   */
  async getPurchaseInvoiceUUIDList(startDate: Date, endDate: Date): Promise<string[]> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('get_purchase_invoice_uuids', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPurchaseInvoiceUUIDList xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <startDate>${formatDate(startDate)}</startDate>
      <endDate>${formatDate(endDate)}</endDate>
    </GetPurchaseInvoiceUUIDList>
  </soap:Body>
</soap:Envelope>`;

      await this.log('get_purchase_invoice_uuids_request', { 
        serviceUrl, 
        sessionCode: this.sessionCode,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetPurchaseInvoiceUUIDList',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('get_purchase_invoice_uuids', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const uuids = this.parseStringList(xmlText);
        await this.log('get_purchase_invoice_uuids', { responseTime, uuidCount: uuids.length }, true, undefined, { uuids });
        return uuids;
      } else {
        await this.log('get_purchase_invoice_uuids', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('get_purchase_invoice_uuids', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  /**
   * Transfer edilmemiş gelen e-faturaların UUID listesini alır
   */
  async getUnTransferredPurchaseInvoiceUUIDList(): Promise<string[]> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('get_untransferred_purchase_invoice_uuids', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUnTransferredPurchaseInvoiceUUIDList xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
    </GetUnTransferredPurchaseInvoiceUUIDList>
  </soap:Body>
</soap:Envelope>`;

      await this.log('get_untransferred_purchase_invoice_uuids_request', { serviceUrl, sessionCode: this.sessionCode });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'GetUnTransferredPurchaseInvoiceUUIDList',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('get_untransferred_purchase_invoice_uuids', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const uuids = this.parseStringList(xmlText);
        await this.log('get_untransferred_purchase_invoice_uuids', { responseTime, uuidCount: uuids.length }, true, undefined, { uuids });
        return uuids;
      } else {
        await this.log('get_untransferred_purchase_invoice_uuids', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('get_untransferred_purchase_invoice_uuids', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  /**
   * Gelen e-faturayı UUID ile indirir
   */
  async downloadPurchaseInvoice(invoiceUUID: string, downloadType: DownloadDocumentDataTypes = DownloadDocumentDataTypes.XML_INZIP): Promise<DownloadResult> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('download_purchase_invoice', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DownloadPurchaseInvoiceWithInvoiceUUID xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <downloadDocumentDataType>${downloadType}</downloadDocumentDataType>
      <invoiceUUID>${invoiceUUID}</invoiceUUID>
    </DownloadPurchaseInvoiceWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;

      await this.log('download_purchase_invoice_request', { 
        serviceUrl, 
        sessionCode: this.sessionCode,
        invoiceUUID,
        downloadType
      });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'DownloadPurchaseInvoiceWithInvoiceUUID',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('download_purchase_invoice', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const result = this.parseDownloadResult(xmlText);
        await this.log('download_purchase_invoice', { responseTime, invoiceUUID, downloadReady: result.downloadFileReady }, true, undefined, result);
        return result;
      } else {
        await this.log('download_purchase_invoice', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('download_purchase_invoice', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  /**
   * Gelen e-faturayı transfer edildi olarak işaretler
   */
  async markPurchaseInvoiceAsTransferred(invoiceUUID: string): Promise<OperationResult> {
    const startTime = Date.now();
    
    if (!this.sessionCode) {
      await this.log('mark_purchase_invoice_transferred', { error: 'Oturum açılmamış' }, false, 'Oturum açılmamış');
      throw new Error('Önce oturum açmalısınız');
    }

    try {
      const config = this.getConfig();
      const serviceUrl = config.liveServiceUrl;
      
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <MarkPurchaseInvoiceAsTransferred xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <invoiceUUID>${invoiceUUID}</invoiceUUID>
    </MarkPurchaseInvoiceAsTransferred>
  </soap:Body>
</soap:Envelope>`;

      await this.log('mark_purchase_invoice_transferred_request', { 
        serviceUrl, 
        sessionCode: this.sessionCode,
        invoiceUUID
      });

      const response = await this.sendSoapRequest(
        serviceUrl,
        'MarkPurchaseInvoiceAsTransferred',
        soapRequest
      );

      const responseTime = Date.now() - startTime;
      const xmlText = await response.text();

      if (response.ok) {
        // SOAP Fault kontrolü
        const soapFault = this.parseSoapFault(xmlText);
        if (soapFault) {
          await this.log('mark_purchase_invoice_transferred', { responseTime, fault: soapFault }, false, `${soapFault.faultCode}: ${soapFault.faultDescription}`);
          throw new Error(`Veriban Hatası: ${soapFault.faultCode} - ${soapFault.faultDescription}`);
        }

        const result = this.parseOperationResult(xmlText);
        await this.log('mark_purchase_invoice_transferred', { responseTime, invoiceUUID, success: result.operationCompleted }, true, undefined, result);
        return result;
      } else {
        await this.log('mark_purchase_invoice_transferred', { responseTime, status: response.status }, false, `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP Hatası: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.log('mark_purchase_invoice_transferred', { responseTime }, false, error instanceof Error ? error.message : 'Bilinmeyen hata');
      throw error;
    }
  }

  // SOAP Request oluşturma metodları
  private createLoginSoapRequest(): string {
    const config = this.getConfig();
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:Login>
      <tem:userName>${config.liveUserName}</tem:userName>
      <tem:password>${config.livePassword}</tem:password>
    </tem:Login>
  </soap:Body>
</soap:Envelope>`;
  }

  private createTransferSoapRequest(transferFile: EInvoiceTransferFile): string {
    const base64Data = this.arrayBufferToBase64(transferFile.binaryData);
    
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ver="http://schemas.datacontract.org/2004/07/Veriban.Service.EInvoiceIntegration">
  <soap:Header/>
  <soap:Body>
    <tem:TransferSalesInvoiceFile>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:transferFile>
        <ver:BinaryData>${base64Data}</ver:BinaryData>
        <ver:BinaryDataHash>${transferFile.binaryDataHash}</ver:BinaryDataHash>
        <ver:CustomerAlias>${transferFile.customerAlias || ''}</ver:CustomerAlias>
        <ver:FileDataType>${transferFile.fileDataType}</ver:FileDataType>
        <ver:FileNameWithExtension>${transferFile.fileNameWithExtension}</ver:FileNameWithExtension>
        <ver:IsDirectSend>${transferFile.isDirectSend}</ver:IsDirectSend>
      </tem:transferFile>
    </tem:TransferSalesInvoiceFile>
  </soap:Body>
</soap:Envelope>`;
  }

  private createSendDocumentSoapRequest(sendFile: EInvoiceDocumentSendFile): string {
    const base64Data = this.arrayBufferToBase64(sendFile.binaryData);
    
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ver="http://schemas.datacontract.org/2004/07/Veriban.Service.EInvoiceIntegration">
  <soap:Header/>
  <soap:Body>
    <tem:SendDocumentFile>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:sendFile>
        <ver:BinaryData>${base64Data}</ver:BinaryData>
        <ver:BinaryDataHash>${sendFile.binaryDataHash}</ver:BinaryDataHash>
        <ver:CustomerAlias>${sendFile.customerAlias || ''}</ver:CustomerAlias>
        <ver:FileDataType>${sendFile.fileDataType}</ver:FileDataType>
        <ver:FileNameWithExtension>${sendFile.fileNameWithExtension}</ver:FileNameWithExtension>
        <ver:IsDirectSend>${sendFile.isDirectSend}</ver:IsDirectSend>
        <ver:SerieCode>${sendFile.serieCode || ''}</ver:SerieCode>
        <ver:UseSerieCode>${sendFile.useSerieCode || false}</ver:UseSerieCode>
      </tem:sendFile>
    </tem:SendDocumentFile>
  </soap:Body>
</soap:Envelope>`;
  }

  private createTransferStatusSoapRequest(transferFileUniqueId: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetTransferSalesInvoiceFileStatus>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:transferFileUniqueId>${transferFileUniqueId}</tem:transferFileUniqueId>
    </tem:GetTransferSalesInvoiceFileStatus>
  </soap:Body>
</soap:Envelope>`;
  }

  private createInvoiceStatusSoapRequest(invoiceUUID: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetSalesInvoiceStatusWithInvoiceUUID>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:invoiceUUID>${invoiceUUID}</tem:invoiceUUID>
    </tem:GetSalesInvoiceStatusWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createIncomingInvoicesSoapRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetUnTransferredPurchaseInvoiceList>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
    </tem:GetUnTransferredPurchaseInvoiceList>
  </soap:Body>
</soap:Envelope>`;
  }

  private createAnswerInvoiceSoapRequest(invoiceUUID: string, answerType: string, note: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:SetPurchaseInvoiceAnswerWithInvoiceUUID>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:answerType>${answerType}</tem:answerType>
      <tem:note>${note}</tem:note>
      <tem:isDirectSend>true</tem:isDirectSend>
      <tem:invoiceUUID>${invoiceUUID}</tem:invoiceUUID>
    </tem:SetPurchaseInvoiceAnswerWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createDownloadInvoiceSoapRequest(invoiceUUID: string, downloadType: DownloadDocumentDataTypes): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:DownloadSalesInvoiceWithInvoiceUUID>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:downloadDocumentDataTypes>${downloadType}</tem:downloadDocumentDataTypes>
      <tem:invoiceUUID>${invoiceUUID}</tem:invoiceUUID>
    </tem:DownloadSalesInvoiceWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createCustomerAliasSoapRequest(registerNumber: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetCustomerAliasListWithRegisterNumber>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
      <tem:registerNumber>${registerNumber}</tem:registerNumber>
    </tem:GetCustomerAliasListWithRegisterNumber>
  </soap:Body>
</soap:Envelope>`;
  }

  private createLogoutSoapRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:Logout>
      <tem:sessionCode>${this.sessionCode}</tem:sessionCode>
    </tem:Logout>
  </soap:Body>
</soap:Envelope>`;
  }

  // Yardımcı metodlar
  private async createZipFromXml(xmlContent: string, fileName: string): Promise<Uint8Array> {
    // JSZip kullanarak ZIP oluşturma
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file(`${fileName}.xml`, xmlContent);
    return await zip.generateAsync({ type: 'uint8array' });
  }

  private async calculateMD5Hash(data: Uint8Array): Promise<string> {
    // Web Crypto API MD5 desteklemediği için basit bir hash fonksiyonu kullanıyoruz
    // Üretim ortamında crypto-js gibi bir kütüphane kullanılmalı
    const CryptoJS = (await import('crypto-js')).default;
    const wordArray = CryptoJS.lib.WordArray.create(data);
    return CryptoJS.MD5(wordArray).toString();
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // XML Parsing metodları
  private extractSessionCode(xmlText: string): string {
    const match = xmlText.match(/<.*?LoginResult.*?>(.*?)<\/.*?LoginResult.*?>/);
    return match ? match[1] : '';
  }

  private parseSoapFault(xmlText: string): VeribanServiceFault | null {
    // Önce SOAP Fault olup olmadığını kontrol et
    if (!xmlText.includes('soap:Fault') && !xmlText.includes('s:Fault') && !xmlText.includes('faultstring')) {
      return null;
    }

    const codeMatch = xmlText.match(/<faultcode.*?>(.*?)<\/faultcode>/i) || 
                     xmlText.match(/<.*?FaultCode.*?>(.*?)<\/.*?FaultCode.*?>/i);
    const descMatch = xmlText.match(/<faultstring.*?>(.*?)<\/faultstring>/i) || 
                     xmlText.match(/<.*?FaultDescription.*?>(.*?)<\/.*?FaultDescription.*?>/i);

    return {
      faultCode: codeMatch ? codeMatch[1] : 'UNKNOWN',
      faultDescription: descMatch ? descMatch[1] : 'Bilinmeyen hata'
    };
  }

  private parseTransferResult(xmlText: string): TransferResult {
    const operationMatch = xmlText.match(/<.*?OperationCompleted.*?>(.*?)<\/.*?OperationCompleted.*?>/);
    const idMatch = xmlText.match(/<.*?TransferFileUniqueId.*?>(.*?)<\/.*?TransferFileUniqueId.*?>/);
    const descMatch = xmlText.match(/<.*?Description.*?>(.*?)<\/.*?Description.*?>/);

    return {
      operationCompleted: operationMatch ? operationMatch[1].toLowerCase() === 'true' : false,
      transferFileUniqueId: idMatch ? idMatch[1] : '',
      description: descMatch ? descMatch[1] : ''
    };
  }

  private parseDocumentSendResult(xmlText: string): DocumentSendResult {
    const operationMatch = xmlText.match(/<.*?OperationCompleted.*?>(.*?)<\/.*?OperationCompleted.*?>/);
    const descMatch = xmlText.match(/<.*?Description.*?>(.*?)<\/.*?Description.*?>/);
    const uuidMatch = xmlText.match(/<.*?DocumentUUID.*?>(.*?)<\/.*?DocumentUUID.*?>/);
    const numberMatch = xmlText.match(/<.*?DocumentNumber.*?>(.*?)<\/.*?DocumentNumber.*?>/);

    return {
      operationCompleted: operationMatch ? operationMatch[1].toLowerCase() === 'true' : false,
      description: descMatch ? descMatch[1] : '',
      documentUUID: uuidMatch ? uuidMatch[1] : '',
      documentNumber: numberMatch ? numberMatch[1] : ''
    };
  }

  private parseTransferQueryResult(xmlText: string): TransferQueryResult {
    const stateCodeMatch = xmlText.match(/<.*?StateCode.*?>(.*?)<\/.*?StateCode.*?>/);
    const stateNameMatch = xmlText.match(/<.*?StateName.*?>(.*?)<\/.*?StateName.*?>/);
    const stateDescMatch = xmlText.match(/<.*?StateDescription.*?>(.*?)<\/.*?StateDescription.*?>/);

    const stateCode = stateCodeMatch ? parseInt(stateCodeMatch[1]) : 0;

    return {
      stateCode,
      stateName: stateNameMatch ? stateNameMatch[1] : getTransferStateMessage(stateCode),
      stateDescription: stateDescMatch ? stateDescMatch[1] : ''
    };
  }

  private parseInvoiceQueryResult(xmlText: string): InvoiceQueryResult {
    // Karmaşık XML parsing için daha detaylı implementation gerekli
    // Şimdilik basit bir parsing yapıyoruz
    const stateCodeMatch = xmlText.match(/<.*?StateCode.*?>(.*?)<\/.*?StateCode.*?>/);
    const stateCode = stateCodeMatch ? parseInt(stateCodeMatch[1]) : 0;

    return {
      stateCode,
      stateName: getInvoiceStateMessage(stateCode),
      stateDescription: '',
      answerStateCode: 0,
      answerStateName: '',
      answerStateDescription: '',
      answerTypeCode: 0,
      answerTypeName: '',
      answerTypeDescription: '',
      envelopeIdentifier: '',
      envelopeGIBCode: 0,
      envelopeGIBStateName: '',
      envelopeCreationTime: '',
      answerEnvelopeIdentifier: '',
      answerEnvelopeGIBCode: 0,
      answerEnvelopeGIBStateName: '',
      answerEnvelopeCreationTime: '',
      gtbReferenceNumber: '',
      gtbGcbTescilNo: '',
      gtbFiiliIhracatTarihi: ''
    };
  }

  private parsePurchaseInvoiceList(xmlText: string): PurchaseInvoiceInfo[] {
    console.log('🔍 Parsing Purchase Invoice List XML:', xmlText.substring(0, 500) + '...');
    
    const invoices: PurchaseInvoiceInfo[] = [];
    
    // Gerçek XML yapısını parse etmek için daha detaylı regex'ler
    const invoiceMatches = xmlText.match(/<.*?PurchaseInvoiceInfo.*?>[\s\S]*?<\/.*?PurchaseInvoiceInfo.*?>/g);
    
    if (invoiceMatches) {
      console.log(`📋 Found ${invoiceMatches.length} invoice matches`);
      
      invoiceMatches.forEach((invoiceXml, index) => {
        console.log(`📄 Parsing invoice ${index + 1}:`, invoiceXml.substring(0, 200) + '...');
        
        // Daha detaylı parsing
        const uuidMatch = invoiceXml.match(/<.*?InvoiceUUID.*?>(.*?)<\/.*?InvoiceUUID.*?>/);
        const numberMatch = invoiceXml.match(/<.*?InvoiceNumber.*?>(.*?)<\/.*?InvoiceNumber.*?>/);
        const issueTimeMatch = invoiceXml.match(/<.*?IssueTime.*?>(.*?)<\/.*?IssueTime.*?>/);
        const customerRegisterNumberMatch = invoiceXml.match(/<.*?CustomerRegisterNumber.*?>(.*?)<\/.*?CustomerRegisterNumber.*?>/);
        const customerTitleMatch = invoiceXml.match(/<.*?CustomerTitle.*?>(.*?)<\/.*?CustomerTitle.*?>/);
        const invoiceProfileMatch = invoiceXml.match(/<.*?InvoiceProfile.*?>(.*?)<\/.*?InvoiceProfile.*?>/);
        const invoiceTypeMatch = invoiceXml.match(/<.*?InvoiceType.*?>(.*?)<\/.*?InvoiceType.*?>/);
        const lineExtensionAmountMatch = invoiceXml.match(/<.*?LineExtensionAmount.*?>(.*?)<\/.*?LineExtensionAmount.*?>/);
        const allowanceTotalAmountMatch = invoiceXml.match(/<.*?AllowanceTotalAmount.*?>(.*?)<\/.*?AllowanceTotalAmount.*?>/);
        const taxExclusiveAmountMatch = invoiceXml.match(/<.*?TaxExclusiveAmount.*?>(.*?)<\/.*?TaxExclusiveAmount.*?>/);
        const taxTotalAmountMatch = invoiceXml.match(/<.*?TaxTotalAmount.*?>(.*?)<\/.*?TaxTotalAmount.*?>/);
        const payableAmountMatch = invoiceXml.match(/<.*?PayableAmount.*?>(.*?)<\/.*?PayableAmount.*?>/);
        const currencyCodeMatch = invoiceXml.match(/<.*?CurrencyCode.*?>(.*?)<\/.*?CurrencyCode.*?>/);
        const exchangeRateMatch = invoiceXml.match(/<.*?ExchangeRate.*?>(.*?)<\/.*?ExchangeRate.*?>/);
        const isReadMatch = invoiceXml.match(/<.*?IsRead.*?>(.*?)<\/.*?IsRead.*?>/);
        
        if (uuidMatch && numberMatch) {
          const invoice: PurchaseInvoiceInfo = {
            invoiceUUID: uuidMatch[1],
            invoiceNumber: numberMatch[1],
            issueTime: issueTimeMatch ? issueTimeMatch[1] : '',
            customerRegisterNumber: customerRegisterNumberMatch ? customerRegisterNumberMatch[1] : '',
            customerTitle: customerTitleMatch ? customerTitleMatch[1] : '',
            invoiceProfile: invoiceProfileMatch ? invoiceProfileMatch[1] : '',
            invoiceType: invoiceTypeMatch ? invoiceTypeMatch[1] : '',
            lineExtensionAmount: lineExtensionAmountMatch ? parseFloat(lineExtensionAmountMatch[1]) || 0 : 0,
            allowanceTotalAmount: allowanceTotalAmountMatch ? parseFloat(allowanceTotalAmountMatch[1]) || 0 : 0,
            taxExclusiveAmount: taxExclusiveAmountMatch ? parseFloat(taxExclusiveAmountMatch[1]) || 0 : 0,
            taxTotalAmount: taxTotalAmountMatch ? parseFloat(taxTotalAmountMatch[1]) || 0 : 0,
            payableAmount: payableAmountMatch ? parseFloat(payableAmountMatch[1]) || 0 : 0,
            currencyCode: currencyCodeMatch ? currencyCodeMatch[1] : 'TRY',
            exchangeRate: exchangeRateMatch ? parseFloat(exchangeRateMatch[1]) || 1 : 1,
            isRead: isReadMatch ? isReadMatch[1].toLowerCase() === 'true' : false
          };
          
          console.log(`✅ Parsed invoice:`, {
            uuid: invoice.invoiceUUID,
            number: invoice.invoiceNumber,
            customer: invoice.customerTitle,
            amount: invoice.payableAmount,
            currency: invoice.currencyCode
          });
          
          invoices.push(invoice);
        } else {
          console.warn(`⚠️ Could not parse invoice ${index + 1}:`, {
            hasUUID: !!uuidMatch,
            hasNumber: !!numberMatch,
            xml: invoiceXml.substring(0, 100)
          });
        }
      });
    } else {
      console.log('❌ No invoice matches found in XML');
    }
    
    console.log(`📊 Final result: ${invoices.length} invoices parsed`);
    return invoices;
  }

  private parseOperationResult(xmlText: string): OperationResult {
    const operationMatch = xmlText.match(/<.*?OperationCompleted.*?>(.*?)<\/.*?OperationCompleted.*?>/);
    const descMatch = xmlText.match(/<.*?Description.*?>(.*?)<\/.*?Description.*?>/);

    return {
      operationCompleted: operationMatch ? operationMatch[1].toLowerCase() === 'true' : false,
      description: descMatch ? descMatch[1] : ''
    };
  }

  private parseDownloadResult(xmlText: string): DownloadResult {
    const refMatch = xmlText.match(/<.*?ReferenceCode.*?>(.*?)<\/.*?ReferenceCode.*?>/);
    const descMatch = xmlText.match(/<.*?DownloadDescription.*?>(.*?)<\/.*?DownloadDescription.*?>/);
    const readyMatch = xmlText.match(/<.*?DownloadFileReady.*?>(.*?)<\/.*?DownloadFileReady.*?>/);

    return {
      referenceCode: refMatch ? refMatch[1] : '',
      downloadDescription: descMatch ? descMatch[1] : '',
      downloadFileReady: readyMatch ? readyMatch[1].toLowerCase() === 'true' : false
    };
  }

  private parseCustomerAliasList(xmlText: string): CustomerAlias[] {
    const aliases: CustomerAlias[] = [];
    
    // Bu kısım gerçek XML yapısına göre düzenlenmelidir
    const aliasMatches = xmlText.match(/<.*?CustomerData.*?>[\s\S]*?<\/.*?CustomerData.*?>/g);
    
    if (aliasMatches) {
      aliasMatches.forEach(aliasXml => {
        const identifierMatch = aliasXml.match(/<.*?IdentifierNumber.*?>(.*?)<\/.*?IdentifierNumber.*?>/);
        const aliasMatch = aliasXml.match(/<.*?Alias.*?>(.*?)<\/.*?Alias.*?>/);
        const titleMatch = aliasXml.match(/<.*?Title.*?>(.*?)<\/.*?Title.*?>/);
        
        if (identifierMatch && aliasMatch && titleMatch) {
          aliases.push({
            identifierNumber: identifierMatch[1],
            alias: aliasMatch[1],
            title: titleMatch[1],
            type: '',
            registerTime: '',
            aliasCreationTime: '',
            documentType: ''
          });
        }
      });
    }
    
    return aliases;
  }

  private parseStringList(xmlText: string): string[] {
    const uuids: string[] = [];
    const uuidMatches = xmlText.match(/<.*?string.*?>(.*?)<\/.*?string.*?>/g);
    if (uuidMatches) {
      uuidMatches.forEach(uuidXml => {
        const uuid = uuidXml.match(/<.*?string.*?>(.*?)<\/.*?string.*?>/);
        if (uuid) {
          uuids.push(uuid[1]);
        }
      });
    }
    return uuids;
  }

  /**
   * Basit ZIP parser - byte array'den dosyaları çıkarır
   */
  private async extractZipFiles(zipData: Uint8Array): Promise<{ name: string; data: Uint8Array }[]> {
    try {
      // Basit ZIP parsing - gerçek ZIP formatı için daha gelişmiş bir kütüphane gerekli
      // Şimdilik sadece XML dosyasını arayalım
      const textDecoder = new TextDecoder();
      const zipText = textDecoder.decode(zipData);
      
      // XML içeriğini bul
      const xmlMatch = zipText.match(/<\?xml[\s\S]*?<\/.*?>/);
      if (xmlMatch) {
        return [{
          name: 'invoice.xml',
          data: new TextEncoder().encode(xmlMatch[0])
        }];
      }
      
      // Eğer XML bulunamazsa, tüm veriyi döndür
      return [{
        name: 'unknown.xml',
        data: zipData
      }];
    } catch (error) {
      console.error('❌ Error extracting ZIP:', error);
      return [];
    }
  }

  /**
   * Gelen faturaları Supabase'e kaydet
   */
  async saveInvoicesToSupabase(invoices: PurchaseInvoiceInfo[]): Promise<void> {
    try {
      console.log(`💾 Saving ${invoices.length} invoices to Supabase...`);
      
      for (const invoice of invoices) {
        // Önce var mı kontrol et
        const { data: existing } = await supabase
          .from('veriban_incoming_invoices')
          .select('id')
          .eq('invoice_uuid', invoice.invoiceUUID)
          .single();

        if (existing) {
          // Güncelle
          const { error: updateError } = await supabase
            .from('veriban_incoming_invoices')
            .update({
              invoice_number: invoice.invoiceNumber,
              issue_time: invoice.issueTime || null,
              customer_register_number: invoice.customerRegisterNumber,
              customer_title: invoice.customerTitle,
              invoice_profile: invoice.invoiceProfile,
              invoice_type: invoice.invoiceType,
              line_extension_amount: invoice.lineExtensionAmount,
              allowance_total_amount: invoice.allowanceTotalAmount,
              tax_exclusive_amount: invoice.taxExclusiveAmount,
              tax_total_amount: invoice.taxTotalAmount,
              payable_amount: invoice.payableAmount,
              currency_code: invoice.currencyCode,
              exchange_rate: invoice.exchangeRate,
              is_read: invoice.isRead,
              updated_at: new Date().toISOString()
            })
            .eq('invoice_uuid', invoice.invoiceUUID);

          if (updateError) {
            console.error('❌ Update error:', updateError);
          } else {
            console.log(`✅ Updated invoice: ${invoice.invoiceNumber}`);
          }
        } else {
          // Yeni kayıt ekle
          const { error: insertError } = await supabase
            .from('veriban_incoming_invoices')
            .insert({
              invoice_uuid: invoice.invoiceUUID,
                             invoice_number: invoice.invoiceNumber,
               issue_time: invoice.issueTime || null,
               customer_register_number: invoice.customerRegisterNumber,
               customer_title: invoice.customerTitle,
               invoice_profile: invoice.invoiceProfile,
               invoice_type: invoice.invoiceType,
               line_extension_amount: invoice.lineExtensionAmount,
               allowance_total_amount: invoice.allowanceTotalAmount,
               tax_exclusive_amount: invoice.taxExclusiveAmount,
               tax_total_amount: invoice.taxTotalAmount,
               payable_amount: invoice.payableAmount,
               currency_code: invoice.currencyCode,
               exchange_rate: invoice.exchangeRate,
               is_read: invoice.isRead,
               is_transferred: false,
               is_answered: false,
               raw_xml_content: (invoice as any).rawXmlContent || null
            });

          if (insertError) {
            console.error('❌ Insert error:', insertError);
          } else {
            console.log(`✅ Inserted invoice: ${invoice.invoiceNumber}`);
          }
        }
      }
      
      console.log('💾 All invoices saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving to Supabase:', error);
      throw error;
    }
  }

  /**
   * Fatura kalemlerini XML'den parse et ve Supabase'e kaydet
   */
  async parseAndSaveInvoiceLineItems(xmlContent: string, invoiceUUID: string): Promise<void> {
    try {
      // Önce Supabase'den invoice ID'sini al
      const { data: invoice } = await supabase
        .from('veriban_incoming_invoices')
        .select('id')
        .eq('invoice_uuid', invoiceUUID)
        .single();

      if (!invoice) {
        console.warn(`⚠️ Invoice not found in database: ${invoiceUUID}`);
        return;
      }

      // XML'den kalemleri parse et
      const lineItems = this.parseInvoiceLineItems(xmlContent);
      
      if (lineItems.length === 0) {
        console.log(`📝 No line items found for invoice: ${invoiceUUID}`);
        return;
      }

      // Önce mevcut kalemleri sil
      await supabase
        .from('veriban_invoice_line_items')
        .delete()
        .eq('invoice_id', invoice.id);

      // Yeni kalemleri ekle
      const { error } = await supabase
        .from('veriban_invoice_line_items')
        .insert(
          lineItems.map(item => ({
            invoice_id: invoice.id,
            ...item
          }))
        );

      if (error) {
        console.error('❌ Error saving line items:', error);
      } else {
        console.log(`✅ Saved ${lineItems.length} line items for invoice: ${invoiceUUID}`);
      }
    } catch (error) {
      console.error('❌ Error parsing/saving line items:', error);
    }
  }

  /**
   * XML'den fatura kalemlerini parse et
   */
  private parseInvoiceLineItems(xmlContent: string): any[] {
    const lineItems: any[] = [];
    
    try {
      // UBL Invoice Line parsing
      const lineMatches = xmlContent.match(/<cac:InvoiceLine[^>]*>[\s\S]*?<\/cac:InvoiceLine>/g);
      
      if (lineMatches) {
        lineMatches.forEach((lineXml, index) => {
          const lineNumber = index + 1;
          
          // Kalem bilgileri
          const itemNameMatch = lineXml.match(/<cbc:Name[^>]*>(.*?)<\/cbc:Name>/);
          const itemDescMatch = lineXml.match(/<cbc:Description[^>]*>(.*?)<\/cbc:Description>/);
          const quantityMatch = lineXml.match(/<cbc:InvoicedQuantity[^>]*>(.*?)<\/cbc:InvoicedQuantity>/);
          const unitCodeMatch = lineXml.match(/<cbc:InvoicedQuantity[^>]*unitCode="([^"]*)"[^>]*>/);
          const unitPriceMatch = lineXml.match(/<cbc:PriceAmount[^>]*>(.*?)<\/cbc:PriceAmount>/);
          const lineTotalMatch = lineXml.match(/<cbc:LineExtensionAmount[^>]*>(.*?)<\/cbc:LineExtensionAmount>/);
          
          // KDV bilgileri
          const taxRateMatch = lineXml.match(/<cbc:Percent[^>]*>(.*?)<\/cbc:Percent>/);
          const taxAmountMatch = lineXml.match(/<cbc:TaxAmount[^>]*>(.*?)<\/cbc:TaxAmount>/);
          
          const lineItem = {
            line_number: lineNumber,
            item_name: itemNameMatch ? itemNameMatch[1] : `Kalem ${lineNumber}`,
            item_description: itemDescMatch ? itemDescMatch[1] : '',
            quantity: quantityMatch ? parseFloat(quantityMatch[1]) || 1 : 1,
            unit_code: unitCodeMatch ? unitCodeMatch[1] : 'C62',
            unit_price: unitPriceMatch ? parseFloat(unitPriceMatch[1]) || 0 : 0,
            line_total: lineTotalMatch ? parseFloat(lineTotalMatch[1]) || 0 : 0,
            tax_rate: taxRateMatch ? parseFloat(taxRateMatch[1]) || 0 : 0,
            tax_amount: taxAmountMatch ? parseFloat(taxAmountMatch[1]) || 0 : 0
          };
          
          lineItems.push(lineItem);
        });
      }
    } catch (error) {
      console.error('❌ Error parsing line items:', error);
    }
    
    return lineItems;
  }

  /**
   * İşlem logunu Supabase'e kaydet
   */
  async logOperationToSupabase(
    operationType: string, 
    requestData: any, 
    responseData: any, 
    isSuccessful: boolean, 
    errorMessage?: string,
    responseTime?: number
  ): Promise<void> {
    try {
      await supabase.from('veriban_operation_logs').insert({
        operation_type: operationType,
        session_code: this.sessionCode,
        request_data: requestData,
        response_data: responseData,
        is_successful: isSuccessful,
        error_message: errorMessage,
        response_time_ms: responseTime
      });
    } catch (error) {
      console.error('❌ Error logging to Supabase:', error);
    }
  }

     /**
    * UUID listesinden fatura detaylarını alır ve Supabase'e kaydeder
    */
   async getPurchaseInvoiceDetailsFromUUIDs(uuids: string[]): Promise<PurchaseInvoiceInfo[]> {
     const startTime = Date.now();
     
     if (!this.sessionCode) {
       await this.logOperationToSupabase('get_purchase_invoice_details', { uuids }, null, false, 'Oturum açılmamış');
       throw new Error('Önce oturum açmalısınız');
     }

     if (!uuids || uuids.length === 0) {
       console.log('📝 No UUIDs provided for detail lookup');
       return [];
     }

     console.log(`🔍 Getting details for ${uuids.length} invoices...`);
     
     const invoices: PurchaseInvoiceInfo[] = [];
     
     // Her UUID için ayrı ayrı detay al (batch işlemi yok)
     for (let i = 0; i < uuids.length; i++) {
       const uuid = uuids[i];
       console.log(`📄 Processing ${i + 1}/${uuids.length}: ${uuid}`);
       
       try {
         // Önce download edip sonra parse et
         const downloadResult = await this.downloadPurchaseInvoice(uuid, DownloadDocumentDataTypes.XML_INZIP);
         
         if (downloadResult.downloadFileReady && downloadResult.downloadFile?.fileData) {
           // ZIP dosyasını aç ve XML'i parse et
           const zipData = new Uint8Array(downloadResult.downloadFile.fileData);
           const zipEntries = await this.extractZipFiles(zipData);
           
           if (zipEntries.length > 0) {
             const xmlContent = new TextDecoder().decode(zipEntries[0].data);
             console.log(`📋 Extracted XML for ${uuid}:`, xmlContent.substring(0, 200) + '...');
             
             // XML'den temel bilgileri çıkar
             const invoice = this.parseInvoiceFromXML(xmlContent, uuid);
             if (invoice) {
               // Ham XML'i de kaydet
               (invoice as any).rawXmlContent = xmlContent;
               
               invoices.push(invoice);
               console.log(`✅ Parsed invoice details:`, {
                 uuid: invoice.invoiceUUID,
                 number: invoice.invoiceNumber,
                 customer: invoice.customerTitle,
                 amount: invoice.payableAmount
               });
               
               // Fatura kalemlerini de parse et ve kaydet
               await this.parseAndSaveInvoiceLineItems(xmlContent, uuid);
             }
           }
         } else {
           console.warn(`⚠️ Download not ready for ${uuid}:`, downloadResult.downloadDescription);
         }
       } catch (error) {
         console.error(`❌ Error processing ${uuid}:`, error);
         // Hata durumunda basit bir invoice objesi oluştur
         invoices.push({
           invoiceUUID: uuid,
           invoiceNumber: `Unknown-${i + 1}`,
           issueTime: '',
           customerRegisterNumber: '',
           customerTitle: 'Bilinmeyen Firma',
           invoiceProfile: '',
           invoiceType: '',
           lineExtensionAmount: 0,
           allowanceTotalAmount: 0,
           taxExclusiveAmount: 0,
           taxTotalAmount: 0,
           payableAmount: 0,
           currencyCode: 'TRY',
           exchangeRate: 1,
           isRead: false
         });
       }
       
       // Rate limiting - her istek arasında kısa bekleme
       if (i < uuids.length - 1) {
         await new Promise(resolve => setTimeout(resolve, 100));
       }
     }
     
     const responseTime = Date.now() - startTime;
     console.log(`📊 Processed ${invoices.length} invoices in ${responseTime}ms`);
     
     // Supabase'e kaydet
     if (invoices.length > 0) {
       try {
         await this.saveInvoicesToSupabase(invoices);
       } catch (error) {
         console.error('❌ Error saving to Supabase:', error);
       }
     }
     
     await this.logOperationToSupabase(
       'get_purchase_invoice_details', 
       { uuids, requestedCount: uuids.length }, 
       { processedCount: invoices.length },
       true,
       undefined,
       responseTime
     );
     
     return invoices;
   }
} 