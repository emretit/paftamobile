import { 
  VeribanConfig, 
  TransferFile, 
  TransferResult, 
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
  MarketType
} from './types';

export class VeribanEInvoiceService {
  private config: VeribanConfig;
  private sessionCode: string | null = null;

  constructor(config?: Partial<VeribanConfig>) {
    this.config = {
      testUserName: 'TESTER@VRBN',
      testPassword: 'Vtest*2020*',
      testServiceUrl: 'https://efaturatransfertest.veriban.com.tr/IntegrationService.svc',
      liveServiceUrl: 'http://efaturatransfer.veriban.com.tr/IntegrationService.svc',
      isTestMode: true,
      ...config
    };
  }

  /**
   * Veriban servisine oturum açar
   */
  async login(): Promise<boolean> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createLoginSoapRequest()
      });

      if (response.ok) {
        const xmlText = await response.text();
        this.sessionCode = this.extractSessionCode(xmlText);
        return !!this.sessionCode;
      }
      
      return false;
    } catch (error) {
      console.error('Login hatası:', error);
      return false;
    }
  }

  /**
   * Fatura gönderir
   */
  async sendInvoice(
    xmlContent: string, 
    fileName: string,
    customerAlias?: string, 
    isDirectSend: boolean = true
  ): Promise<TransferResult> {
    try {
      if (!this.sessionCode) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Oturum açılamadı');
        }
      }

      const zipData = await this.createZipFromXml(xmlContent, fileName);
      const hash = await this.calculateMD5Hash(zipData);

      const transferFile: TransferFile = {
        fileNameWithExtension: `${fileName}.zip`,
        fileDataType: TransferDocumentDataTypes.XML_INZIP,
        binaryData: new Uint8Array(zipData),
        binaryDataHash: hash,
        customerAlias: customerAlias || 'urn:mail:defaultpk@veriban.com.tr',
        isDirectSend
      };

      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createTransferSoapRequest(transferFile)
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseTransferResult(xmlText);
      }

      throw new Error('Fatura gönderimi başarısız');
    } catch (error) {
      console.error('Fatura gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Transfer durumunu sorgular
   */
  async getTransferStatus(transferFileUniqueId: string): Promise<TransferQueryResult> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createTransferStatusSoapRequest(transferFileUniqueId)
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseTransferQueryResult(xmlText);
      }

      throw new Error('Transfer durumu sorgulanamadı');
    } catch (error) {
      console.error('Transfer durumu sorgulama hatası:', error);
      throw error;
    }
  }

  /**
   * Fatura durumunu sorgular
   */
  async getInvoiceStatus(invoiceUUID: string): Promise<InvoiceQueryResult> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createInvoiceStatusSoapRequest(invoiceUUID)
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseInvoiceQueryResult(xmlText);
      }

      throw new Error('Fatura durumu sorgulanamadı');
    } catch (error) {
      console.error('Fatura durumu sorgulama hatası:', error);
      throw error;
    }
  }

  /**
   * Gelen faturaları listeler
   */
  async getIncomingInvoices(): Promise<PurchaseInvoiceInfo[]> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createIncomingInvoicesSoapRequest()
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parsePurchaseInvoiceList(xmlText);
      }

      throw new Error('Gelen fatura listesi alınamadı');
    } catch (error) {
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
  ): Promise<OperationResult> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createAnswerInvoiceSoapRequest(invoiceUUID, answerType, note)
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseOperationResult(xmlText);
      }

      throw new Error('Fatura cevabı gönderilemedi');
    } catch (error) {
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
  ): Promise<DownloadResult> {
    try {
      const response = await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
        body: this.createDownloadInvoiceSoapRequest(invoiceUUID, downloadType)
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseDownloadResult(xmlText);
      }

      throw new Error('Fatura indirilemedi');
    } catch (error) {
      console.error('Fatura indirme hatası:', error);
      throw error;
    }
  }

  /**
   * Oturumu kapatır
   */
  async logout(): Promise<void> {
    try {
      if (this.sessionCode) {
        await fetch(this.config.isTestMode ? this.config.testServiceUrl : this.config.liveServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
          body: this.createLogoutSoapRequest()
        });
        this.sessionCode = null;
      }
    } catch (error) {
      console.error('Logout hatası:', error);
    }
  }

  // Yardımcı metodlar
  private createLoginSoapRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Login xmlns="http://tempuri.org/">
      <userName>${this.config.testUserName}</userName>
      <password>${this.config.testPassword}</password>
    </Login>
  </soap:Body>
</soap:Envelope>`;
  }

  private createTransferSoapRequest(transferFile: TransferFile): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TransferSalesInvoiceFile xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <transferFile>
        <FileNameWithExtension>${transferFile.fileNameWithExtension}</FileNameWithExtension>
        <FileDataType>${transferFile.fileDataType}</FileDataType>
        <BinaryData>${btoa(String.fromCharCode(...transferFile.binaryData))}</BinaryData>
        <BinaryDataHash>${transferFile.binaryDataHash}</BinaryDataHash>
        <CustomerAlias>${transferFile.customerAlias}</CustomerAlias>
        <IsDirectSend>${transferFile.isDirectSend}</IsDirectSend>
      </transferFile>
    </TransferSalesInvoiceFile>
  </soap:Body>
</soap:Envelope>`;
  }

  private createTransferStatusSoapRequest(transferFileUniqueId: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetTransferSalesInvoiceFileStatus xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <transferFileUniqueId>${transferFileUniqueId}</transferFileUniqueId>
    </GetTransferSalesInvoiceFileStatus>
  </soap:Body>
</soap:Envelope>`;
  }

  private createInvoiceStatusSoapRequest(invoiceUUID: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetSalesInvoiceStatusWithInvoiceUUID xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <invoiceUUID>${invoiceUUID}</invoiceUUID>
    </GetSalesInvoiceStatusWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createIncomingInvoicesSoapRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUnTransferredPurchaseInvoiceList xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
    </GetUnTransferredPurchaseInvoiceList>
  </soap:Body>
</soap:Envelope>`;
  }

  private createAnswerInvoiceSoapRequest(invoiceUUID: string, answerType: string, note: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SetPurchaseInvoiceAnswerWithInvoiceUUID xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <answerType>${answerType}</answerType>
      <note>${note}</note>
      <isDirectSend>true</isDirectSend>
      <invoiceUUID>${invoiceUUID}</invoiceUUID>
    </SetPurchaseInvoiceAnswerWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createDownloadInvoiceSoapRequest(invoiceUUID: string, downloadType: DownloadDocumentDataTypes): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <DownloadSalesInvoiceWithInvoiceUUID xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
      <downloadDocumentDataTypes>${downloadType}</downloadDocumentDataTypes>
      <invoiceUUID>${invoiceUUID}</invoiceUUID>
    </DownloadSalesInvoiceWithInvoiceUUID>
  </soap:Body>
</soap:Envelope>`;
  }

  private createLogoutSoapRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Logout xmlns="http://tempuri.org/">
      <sessionCode>${this.sessionCode}</sessionCode>
    </Logout>
  </soap:Body>
</soap:Envelope>`;
  }

  private async createZipFromXml(xmlContent: string, fileName: string): Promise<Uint8Array> {
    // JSZip kullanarak ZIP oluşturma
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file(`${fileName}.xml`, xmlContent);
    return await zip.generateAsync({ type: 'uint8array' });
  }

  private async calculateMD5Hash(data: Uint8Array): Promise<string> {
    const crypto = window.crypto;
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private extractSessionCode(xmlText: string): string {
    // XML'den session code çıkarma
    const match = xmlText.match(/<LoginResult>(.*?)<\/LoginResult>/);
    return match ? match[1] : '';
  }

  private parseTransferResult(xmlText: string): TransferResult {
    // XML'den transfer sonucu parse etme
    const operationMatch = xmlText.match(/<OperationCompleted>(.*?)<\/OperationCompleted>/);
    const idMatch = xmlText.match(/<TransferFileUniqueId>(.*?)<\/TransferFileUniqueId>/);
    const descMatch = xmlText.match(/<Description>(.*?)<\/Description>/);

    return {
      operationCompleted: operationMatch ? operationMatch[1] === 'true' : false,
      transferFileUniqueId: idMatch ? idMatch[1] : '',
      description: descMatch ? descMatch[1] : ''
    };
  }

  private parseTransferQueryResult(xmlText: string): TransferQueryResult {
    // XML'den transfer sorgu sonucu parse etme
    const stateCodeMatch = xmlText.match(/<StateCode>(.*?)<\/StateCode>/);
    const stateNameMatch = xmlText.match(/<StateName>(.*?)<\/StateName>/);
    const stateDescMatch = xmlText.match(/<StateDescription>(.*?)<\/StateDescription>/);

    return {
      stateCode: stateCodeMatch ? parseInt(stateCodeMatch[1]) : 0,
      stateName: stateNameMatch ? stateNameMatch[1] : '',
      stateDescription: stateDescMatch ? stateDescMatch[1] : ''
    };
  }

  private parseInvoiceQueryResult(xmlText: string): InvoiceQueryResult {
    // XML'den fatura sorgu sonucu parse etme
    // Bu metod daha karmaşık XML parsing gerektirir
    return {
      stateCode: 0,
      stateName: '',
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
    // XML'den fatura listesi parse etme
    return [];
  }

  private parseOperationResult(xmlText: string): OperationResult {
    // XML'den operasyon sonucu parse etme
    const operationMatch = xmlText.match(/<OperationCompleted>(.*?)<\/OperationCompleted>/);
    const descMatch = xmlText.match(/<Description>(.*?)<\/Description>/);

    return {
      operationCompleted: operationMatch ? operationMatch[1] === 'true' : false,
      description: descMatch ? descMatch[1] : ''
    };
  }

  private parseDownloadResult(xmlText: string): DownloadResult {
    // XML'den indirme sonucu parse etme
    return {
      referenceCode: '',
      downloadDescription: '',
      downloadFileReady: false
    };
  }
} 