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

export class VeribanEInvoiceService {
  private sessionCode: string | null = null;
  private logCallback?: (operationType: string, details: any, success: boolean, error?: string, response?: any) => void;

  constructor(logCallback?: (operationType: string, details: any, success: boolean, error?: string, response?: any) => void) {
    this.logCallback = logCallback;
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
    
    // Varsayılan ayarlar
    return {
      testUserName: 'TESTER@VRBN',
      testPassword: 'Vtest*2020*',
      liveUserName: '',
      livePassword: '',
      testServiceUrl: 'https://efaturatransfertest.veriban.com.tr/IntegrationService.svc',
      liveServiceUrl: 'https://efaturatransfer.veriban.com.tr/IntegrationService.svc',
      isTestMode: true
    };
  }

  /**
   * Veriban servisine oturum açar
   */
  async login(): Promise<boolean> {
    const startTime = Date.now();
      const config = this.getConfig();
    
    try {
      const serviceUrl = config.isTestMode ? config.testServiceUrl : config.liveServiceUrl;
      const soapRequest = this.createLoginSoapRequest();
      
      await this.log('login_attempt', { 
        serviceUrl, 
        isTestMode: config.isTestMode,
        userName: config.isTestMode ? config.testUserName : config.liveUserName 
      });
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/Login'
        },
        body: soapRequest
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const xmlText = await response.text();
        console.log('Login Response:', xmlText);
        
        // SOAP Fault kontrolü
        if (xmlText.includes('soap:Fault') || xmlText.includes('faultstring')) {
          const fault = this.parseSoapFault(xmlText);
          const errorMsg = `SOAP Fault: ${fault.faultCode} - ${fault.faultDescription}`;
          
          await this.log('login', { 
            serviceUrl, 
            responseTime,
            fault 
          }, false, errorMsg);
          
          throw new Error(errorMsg);
        }
        
        this.sessionCode = this.extractSessionCode(xmlText);
        const success = !!this.sessionCode;
        
        await this.log('login', { 
          serviceUrl, 
          responseTime,
          sessionCodeReceived: success 
        }, success, success ? undefined : 'Session code alınamadı');
        
        return success;
      } else {
        const errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
        
        await this.log('login', { 
          serviceUrl, 
          responseTime,
          httpStatus: response.status,
          httpStatusText: response.statusText 
        }, false, errorMsg);
        
        console.error('Login HTTP Error:', response.status, response.statusText);
        return false;
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      await this.log('login', { 
        serviceUrl: config.isTestMode ? config.testServiceUrl : config.liveServiceUrl,
        responseTime 
      }, false, errorMsg);
      
      console.error('Login hatası:', error);
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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/TransferSalesInvoiceFile'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/SendDocumentFile'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/GetTransferSalesInvoiceFileStatus'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/GetSalesInvoiceStatusWithInvoiceUUID'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/GetUnTransferredPurchaseInvoiceList'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/SetPurchaseInvoiceAnswerWithInvoiceUUID'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/DownloadSalesInvoiceWithInvoiceUUID'
        },
        body: soapRequest
      });

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
      
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegrationService/GetCustomerAliasListWithRegisterNumber'
        },
        body: soapRequest
      });

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
        
        await fetch(serviceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/IIntegrationService/Logout'
          },
          body: soapRequest
        });
        
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

  // SOAP Request oluşturma metodları
  private createLoginSoapRequest(): string {
    const config = this.getConfig();
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:Login>
      <tem:userName>${config.isTestMode ? config.testUserName : config.liveUserName}</tem:userName>
      <tem:password>${config.isTestMode ? config.testPassword : config.livePassword}</tem:password>
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

  private parseSoapFault(xmlText: string): VeribanServiceFault {
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
    // XML'den fatura listesi parse etme - basit implementation
    const invoices: PurchaseInvoiceInfo[] = [];
    
    // Bu kısım gerçek XML yapısına göre düzenlenmelidir
    const invoiceMatches = xmlText.match(/<.*?PurchaseInvoiceInfo.*?>[\s\S]*?<\/.*?PurchaseInvoiceInfo.*?>/g);
    
    if (invoiceMatches) {
      invoiceMatches.forEach(invoiceXml => {
        const uuidMatch = invoiceXml.match(/<.*?InvoiceUUID.*?>(.*?)<\/.*?InvoiceUUID.*?>/);
        const numberMatch = invoiceXml.match(/<.*?InvoiceNumber.*?>(.*?)<\/.*?InvoiceNumber.*?>/);
        
        if (uuidMatch && numberMatch) {
          invoices.push({
            invoiceUUID: uuidMatch[1],
            invoiceNumber: numberMatch[1],
            issueTime: '',
            customerRegisterNumber: '',
            customerTitle: '',
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
      });
    }
    
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
} 