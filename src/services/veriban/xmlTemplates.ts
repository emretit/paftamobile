import { InvoiceData, InvoiceItem } from './types';

/**
 * E-Fatura XML şablonu oluşturur
 */
export const generateInvoiceXML = (invoiceData: InvoiceData): string => {
  const uuid = generateUUID();
  const currentDate = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 UBL-Invoice-2.1.xsd">
  
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2.1</cbc:CustomizationID>
  <cbc:ProfileID>${invoiceData.invoiceProfile}</cbc:ProfileID>
  <cbc:ID>${invoiceData.invoiceNumber}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${invoiceData.invoiceDate}</cbc:IssueDate>
  <cbc:IssueTime>${currentDate.split('T')[1].split('.')[0]}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${invoiceData.invoiceType}</cbc:InvoiceTypeCode>
  <cbc:Note>E-Fatura sistemi üzerinden oluşturulmuştur.</cbc:Note>
  <cbc:DocumentCurrencyCode>${invoiceData.currencyCode}</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${invoiceData.items.length}</cbc:LineCountNumeric>

  <!-- Supplier (Satıcı) Bilgileri -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${invoiceData.supplierVkn}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(invoiceData.supplierName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(invoiceData.supplierAddress)}</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${escapeXml(invoiceData.supplierTaxOffice)}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Customer (Alıcı) Bilgileri -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${invoiceData.customerVkn}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(invoiceData.customerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(invoiceData.customerAddress)}</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${escapeXml(invoiceData.customerTaxOffice)}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Fatura Satırları -->
  ${invoiceData.items.map((item, index) => generateInvoiceLineXML(item, index + 1)).join('\n')}

  <!-- Toplam Tutarlar -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoiceData.currencyCode}">${invoiceData.totalAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoiceData.currencyCode}">${invoiceData.totalAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoiceData.currencyCode}">${invoiceData.payableAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${invoiceData.currencyCode}">${invoiceData.payableAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Vergi Toplamları -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoiceData.currencyCode}">${invoiceData.taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoiceData.currencyCode}">${invoiceData.totalAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoiceData.currencyCode}">${invoiceData.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>18.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

</Invoice>`;
};

/**
 * Fatura satırı XML'i oluşturur
 */
const generateInvoiceLineXML = (item: InvoiceItem, lineNumber: number): string => {
  return `  <cac:InvoiceLine>
    <cbc:ID>${lineNumber}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${item.unit}">${item.quantity.toFixed(2)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${item.totalPrice.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(item.name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${item.totalPrice.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${item.taxRate.toFixed(2)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
  </cac:InvoiceLine>`;
};

/**
 * Fatura yanıt XML'i oluşturur
 */
export const generateInvoiceResponseXML = (
  invoiceUUID: string,
  responseType: 'KABUL' | 'RED',
  note: string = ''
): string => {
  const responseUUID = generateUUID();
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toISOString().split('T')[1].split('.')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<ApplicationResponse xmlns="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2" 
                    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
                    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2.1</cbc:CustomizationID>
  <cbc:ProfileID>TICARIFATURA</cbc:ProfileID>
  <cbc:ID>${responseUUID}</cbc:ID>
  <cbc:UUID>${responseUUID}</cbc:UUID>
  <cbc:IssueDate>${currentDate}</cbc:IssueDate>
  <cbc:IssueTime>${currentTime}</cbc:IssueTime>
  <cbc:Note>${escapeXml(note)}</cbc:Note>

  <cac:DocumentResponse>
    <cac:Response>
      <cbc:ResponseCode>${responseType}</cbc:ResponseCode>
      <cbc:Description>${responseType === 'KABUL' ? 'Fatura kabul edilmiştir.' : 'Fatura reddedilmiştir.'}</cbc:Description>
    </cac:Response>
    <cac:DocumentReference>
      <cbc:ID>${invoiceUUID}</cbc:ID>
      <cbc:DocumentTypeCode>FATURA</cbc:DocumentTypeCode>
    </cac:DocumentReference>
  </cac:DocumentResponse>

</ApplicationResponse>`;
};

/**
 * UUID oluşturur
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * XML için özel karakterleri escape eder
 */
const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Örnek fatura verisi
 */
export const createSampleInvoiceData = (): InvoiceData => {
  return {
    invoiceNumber: `VRB${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    customerVkn: '1234567890',
    customerName: 'Örnek Müşteri A.Ş.',
    customerAddress: 'Örnek Mahallesi, Örnek Sokak No:1',
    customerTaxOffice: 'Kadıköy Vergi Dairesi',
    supplierVkn: '9876543210',
    supplierName: 'Bizim Şirket Ltd. Şti.',
    supplierAddress: 'Merkez Mahallesi, Ana Cadde No:100',
    supplierTaxOffice: 'Beşiktaş Vergi Dairesi',
    items: [
      {
        name: 'Yazılım Geliştirme Hizmeti',
        quantity: 1,
        unitPrice: 1000.00,
        totalPrice: 1000.00,
        taxRate: 18,
        taxAmount: 180.00,
        unit: 'ADET'
      },
      {
        name: 'Danışmanlık Hizmeti',
        quantity: 2,
        unitPrice: 500.00,
        totalPrice: 1000.00,
        taxRate: 18,
        taxAmount: 180.00,
        unit: 'SAAT'
      }
    ],
    totalAmount: 2000.00,
    taxAmount: 360.00,
    payableAmount: 2360.00,
    currencyCode: 'TRY',
    invoiceProfile: 'TICARIFATURA',
    invoiceType: 'SATIS'
  };
}; 