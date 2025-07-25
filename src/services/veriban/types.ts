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