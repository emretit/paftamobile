// Veriban E-Fatura API Tipleri

export interface VeribanConfig {
  testUserName: string;
  testPassword: string;
  liveUserName: string;
  livePassword: string;
  testServiceUrl: string;
  liveServiceUrl: string;
  isTestMode: boolean;
}

// SOAP API için genişletilmiş transfer dosyası
export interface EInvoiceTransferFile {
  fileNameWithExtension: string;
  fileDataType: TransferDocumentDataTypes;
  binaryData: Uint8Array;
  binaryDataHash: string;
  customerAlias?: string;
  isDirectSend: boolean;
}

// Yeni SendDocumentFile için
export interface EInvoiceDocumentSendFile {
  fileNameWithExtension: string;
  fileDataType: TransferDocumentDataTypes;
  binaryData: Uint8Array;
  binaryDataHash: string;
  customerAlias?: string;
  isDirectSend: boolean;
  useSerieCode?: boolean;
  serieCode?: string;
}

export interface TransferFile {
  fileNameWithExtension: string;
  fileDataType: string;
  binaryData: Uint8Array;
  binaryDataHash: string;
  customerAlias?: string;
  isDirectSend: boolean;
}

export interface TransferResult {
  operationCompleted: boolean;
  transferFileUniqueId: string;
  description?: string;
}

// SendDocumentFile için sonuç
export interface DocumentSendResult {
  operationCompleted: boolean;
  description: string;
  documentUUID: string;
  documentNumber: string;
}

export interface TransferQueryResult {
  stateCode: number;
  stateName: string;
  stateDescription: string;
}

export interface InvoiceQueryResult {
  stateCode: number;
  stateName: string;
  stateDescription: string;
  answerStateCode: number;
  answerStateName: string;
  answerStateDescription: string;
  answerTypeCode: number;
  answerTypeName: string;
  answerTypeDescription: string;
  envelopeIdentifier: string;
  envelopeGIBCode: number;
  envelopeGIBStateName: string;
  envelopeCreationTime: string;
  answerEnvelopeIdentifier: string;
  answerEnvelopeGIBCode: number;
  answerEnvelopeGIBStateName: string;
  answerEnvelopeCreationTime: string;
  gtbReferenceNumber: string;
  gtbGcbTescilNo: string;
  gtbFiiliIhracatTarihi: string;
}

export interface PurchaseInvoiceInfo {
  invoiceUUID: string;
  issueTime: string;
  customerRegisterNumber: string;
  customerTitle: string;
  invoiceNumber: string;
  invoiceProfile: string;
  invoiceType: string;
  lineExtensionAmount: number;
  allowanceTotalAmount: number;
  taxExclusiveAmount: number;
  taxTotalAmount: number;
  payableAmount: number;
  currencyCode: string;
  exchangeRate: number;
  isRead: boolean;
}

export interface OperationResult {
  operationCompleted: boolean;
  description: string;
}

export interface DownloadResult {
  referenceCode: string;
  downloadDescription: string;
  downloadFileReady: boolean;
  downloadFile?: {
    fileNameWithExtension: string;
    fileDataType: string;
    fileData: Uint8Array;
    fileDataHash: string;
  };
}

export interface CustomerAlias {
  identifierNumber: string;
  alias: string;
  title: string;
  type: string;
  registerTime: string;
  aliasCreationTime: string;
  documentType: string;
}

// SOAP Fault için
export interface VeribanServiceFault {
  faultCode: string;
  faultDescription: string;
}

// E-Fatura XML şablonu için
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerVkn: string;
  customerName: string;
  customerAddress: string;
  customerTaxOffice: string;
  supplierVkn: string;
  supplierName: string;
  supplierAddress: string;
  supplierTaxOffice: string;
  items: InvoiceItem[];
  totalAmount: number;
  taxAmount: number;
  payableAmount: number;
  currencyCode: string;
  invoiceProfile: 'TICARIFATURA' | 'TEMELFATURA' | 'IHRACATFATURA';
  invoiceType: 'SATIS' | 'IADE' | 'ISTISNA';
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  unit: string;
}

// Durum kodları
export enum TransferStateCode {
  UNKNOWN = 1,
  WAITING = 2,
  PROCESSING = 3,
  ERROR = 4,
  SUCCESS = 5
}

export enum InvoiceStateCode {
  DRAFT = 1,
  WAITING_SEND = 2,
  IN_PROCESS = 3,
  ERROR = 4,
  DELIVERED = 5
}

export enum AnswerStateCode {
  NO_ANSWER = 1,
  WAITING_ANSWER = 2,
  IN_PROCESS = 3,
  CANCELLED = 4,
  DELIVERED = 5
}

export enum AnswerTypeCode {
  UNKNOWN = 1,
  RETURNED = 3,
  REJECTED = 4,
  ACCEPTED = 5
}

export enum DownloadDocumentDataTypes {
  XML_INZIP = 'XML_INZIP',
  HTML_INZIP = 'HTML_INZIP',
  PDF_INZIP = 'PDF_INZIP'
}

export enum TransferDocumentDataTypes {
  XML_INZIP = 'XML_INZIP',
  HTML_INZIP = 'HTML_INZIP',
  PDF_INZIP = 'PDF_INZIP'
}

export enum MarketType {
  TRENDYOL = 'Trendyol',
  HEPSIBURADA = 'Hepsiburada',
  N11 = 'N11'
} 

// Durum mesajları için yardımcı fonksiyonlar
export const getTransferStateMessage = (stateCode: number): string => {
  switch (stateCode) {
    case TransferStateCode.UNKNOWN:
      return 'Bilinmiyor';
    case TransferStateCode.WAITING:
      return 'İşlenmeyi Bekliyor';
    case TransferStateCode.PROCESSING:
      return 'İşleniyor';
    case TransferStateCode.ERROR:
      return 'Hatalı (Tekrar gönderilebilir)';
    case TransferStateCode.SUCCESS:
      return 'Başarıyla İşlendi';
    default:
      return 'Bilinmeyen durum';
  }
};

export const getInvoiceStateMessage = (stateCode: number): string => {
  switch (stateCode) {
    case InvoiceStateCode.DRAFT:
      return 'Taslak Veri';
    case InvoiceStateCode.WAITING_SEND:
      return 'Gönderilmeyi Bekliyor / İmza Bekliyor';
    case InvoiceStateCode.IN_PROCESS:
      return 'Gönderim Listesinde / İşlem Yapılıyor';
    case InvoiceStateCode.ERROR:
      return 'Hatalı';
    case InvoiceStateCode.DELIVERED:
      return 'Başarıyla Alıcıya İletildi';
    default:
      return 'Bilinmeyen durum';
  }
};

export const getAnswerTypeMessage = (answerTypeCode: number): string => {
  switch (answerTypeCode) {
    case AnswerTypeCode.UNKNOWN:
      return 'Bilinmiyor';
    case AnswerTypeCode.RETURNED:
      return 'İade Edildi';
    case AnswerTypeCode.REJECTED:
      return 'Reddedildi';
    case AnswerTypeCode.ACCEPTED:
      return 'Kabul Edildi';
    default:
      return 'Bilinmeyen cevap tipi';
  }
}; 