import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===== XML PARSING UTILITIES =====
const extractXMLValue = (xml: string, tagName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)<\/${tagName}>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1].trim() : null
}

const extractXMLAttribute = (xml: string, tagName: string, attributeName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*${attributeName}="([^"]*)"[^>]*>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1] : null
}

const extractProductNameFromText = (xml: string): string | null => {
  const productPatterns = [
    /(\d+(?:\.\d+)?\s+(?:KİLO|ADET|LİTRE|METRE|GRAM|TON|KUTU|PAKET)\s+[A-ZÇĞıÖŞÜİ\s]+)/gi,
    /([A-ZÇĞıÖŞÜİ][A-ZÇĞıÖŞÜİ\s]+(?:DOMATES|PATATES|SOĞAN|EKMEK|SÜT|PEYNIR|ET|TAVUK|BALIK))/gi,
    />([^<>]+(?:KİLO|ADET|LİTRE)\s+[A-ZÇĞıÖŞÜİ\s]+)</gi
  ]
  
  for (const pattern of productPatterns) {
    const matches = xml.match(pattern)
    if (matches) {
      for (const match of matches) {
        const cleaned = match.replace(/^>/, '').trim()
        if (cleaned && 
            !cleaned.toUpperCase().includes('KDV') &&
            !cleaned.toUpperCase().includes('VERGI') &&
            !cleaned.toUpperCase().includes('TOPLAM') &&
            !cleaned.toUpperCase().includes('TUTAR') &&
            cleaned.length > 3) {
          return cleaned
        }
      }
    }
  }
  return null
}

const extractProductNameFromComplexXML = (xml: string): string | null => {
  const textContent = xml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const matches = textContent.match(/(\d+(?:\.\d+)?\s+(?:KİLO|ADET|LİTRE|METRE|GRAM|TON)\s+[A-ZÇĞIÖŞÜİ\s]+)/gi)
  if (matches) {
    for (const match of matches) {
      const cleaned = match.trim()
      if (cleaned && 
          !cleaned.toUpperCase().includes('KDV') &&
          !cleaned.toUpperCase().includes('VERGI') &&
          cleaned.length > 5) {
        return cleaned
      }
    }
  }
  return null
}

const extractTextFromHTML = (html: string, fieldType: string): string | null => {
  const patterns = {
    name: [/class="[^"]*name[^"]*"[^>]*>([^<]+)/i, /data-name="([^"]+)"/i],
    quantity: [/class="[^"]*qty[^"]*"[^>]*>([^<]+)/i, /data-qty="([^"]+)"/i],
    price: [/class="[^"]*price[^"]*"[^>]*>([^<]+)/i, /data-price="([^"]+)"/i],
    tax: [/class="[^"]*tax[^"]*"[^>]*>([^<]+)/i, /data-tax="([^"]+)"/i]
  }
  
  const fieldPatterns = patterns[fieldType] || []
  for (const pattern of fieldPatterns) {
    const match = html.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

// ===== XML PRODUCT PARSING =====
const parseXMLProducts = (xmlContent: string) => {
  try {
    console.log('🔍 Parsing XML content for products...')
    console.log('📄 XML content preview (first 1000 chars):', xmlContent.substring(0, 1000))
    
    const products = []
    
    // 1. UBL InvoiceLine pattern'i (standart XML format)
    const invoiceLineRegex = /<cac:InvoiceLine[^>]*>(.*?)<\/cac:InvoiceLine>/gs
    let invoiceLines = xmlContent.match(invoiceLineRegex) || []
    
    console.log(`📋 Found ${invoiceLines.length} UBL InvoiceLine entries`)
    
    if (invoiceLines.length > 0) {
      invoiceLines.forEach((lineXml, index) => {
        console.log(`\n🔍 Processing UBL InvoiceLine ${index + 1}:`)
        console.log('📄 Line XML preview:', lineXml.substring(0, 300) + '...')
        
        let itemName = 
          extractXMLValue(lineXml, 'cac:Item/cbc:Name') ||
          extractXMLValue(lineXml, 'cac:Item/cbc:Description') ||
          extractXMLValue(lineXml, 'cac:Item/cac:SellersItemIdentification/cbc:ID') ||
          extractXMLValue(lineXml, 'cac:Item/cac:StandardItemIdentification/cbc:ID') ||
          extractXMLValue(lineXml, 'Description') ||
          extractProductNameFromText(lineXml) ||
          `Ürün ${index + 1}`
        
        // Vergi adını değil, gerçek ürün adını filtrele
        if (itemName === 'KDV' || itemName === 'ÖTV' || itemName === 'STOPAJ') {
          itemName = 
            extractXMLValue(lineXml, 'cac:Item/cac:Item/cbc:Name') ||
            extractXMLValue(lineXml, 'Item/Name') ||
            extractProductNameFromComplexXML(lineXml) ||
            `Ürün ${index + 1}`
        }
        
        let itemCode = 
          extractXMLValue(lineXml, 'cbc:ID') ||
          extractXMLValue(lineXml, 'cac:Item/cac:SellersItemIdentification/cbc:ID') ||
          extractXMLValue(lineXml, 'cac:Item/cbc:ID') ||
          ''
        
        let quantity = parseFloat(
          extractXMLValue(lineXml, 'cbc:InvoicedQuantity') ||
          extractXMLValue(lineXml, 'cbc:Quantity') ||
          '1'
        )
        
        let unitCode = 
          extractXMLAttribute(lineXml, 'cbc:InvoicedQuantity', 'unitCode') ||
          extractXMLAttribute(lineXml, 'cbc:Quantity', 'unitCode') ||
          'Adet'
        
        let unitPrice = parseFloat(
          extractXMLValue(lineXml, 'cbc:PriceAmount') ||
          extractXMLValue(lineXml, 'cac:Price/cbc:PriceAmount') ||
          '0'
        )
        
        let lineTotal = parseFloat(
          extractXMLValue(lineXml, 'cbc:LineExtensionAmount') ||
          (quantity * unitPrice).toString()
        )
        
        let taxPercent = parseFloat(
          extractXMLValue(lineXml, 'cbc:Percent') ||
          extractXMLValue(lineXml, 'cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent') ||
          '18'
        )
        
        let taxAmount = parseFloat(
          extractXMLValue(lineXml, 'cbc:TaxAmount') ||
          extractXMLValue(lineXml, 'cac:TaxTotal/cbc:TaxAmount') ||
          '0'
        )
        
        console.log(`✅ UBL Parsed: Name="${itemName}", Code="${itemCode}", Qty=${quantity}, Price=${unitPrice}`)
        
        products.push({
          name: itemName,
          sku: itemCode,
          quantity: quantity,
          unit: unitCode,
          unit_price: unitPrice,
          tax_rate: taxPercent,
          tax_amount: taxAmount,
          line_total: lineTotal,
          discount_amount: 0,
          original_xml: lineXml.substring(0, 500)
        })
      })
    }
    
    // 2. HTML tablo formatını dene (eğer UBL bulunamazsa)
    if (products.length === 0) {
      console.log('⚠️ No UBL InvoiceLines found, trying HTML table format...')
      
      const tablePatterns = [
        /<table[^>]*class="[^"]*lineTable[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*invoice[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*item[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*>(.*?)<\/table>/gs
      ]
      
      let tableMatch = null
      for (const pattern of tablePatterns) {
        tableMatch = xmlContent.match(pattern)
        if (tableMatch) break
      }
      
      if (tableMatch) {
        console.log('📋 Found invoice table, parsing rows...')
        const tableContent = tableMatch[0]
        
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs
        const rows = []
        let rowMatch
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
          rows.push(rowMatch[1])
        }
        
        console.log(`📋 Found ${rows.length} table rows`)
        
        const dataRows = rows.slice(1) // Skip header row
        
        dataRows.forEach((rowHtml, index) => {
          const cellRegex = /<td[^>]*>(.*?)<\/td>/gs
          const cells = []
          let cellMatch
          while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            let cellContent = cellMatch[1]
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim()
            cells.push(cellContent)
          }
          
          if (cells.length >= 4) {
            console.log(`📋 Table row ${index + 1}: [${cells.join(' | ')}]`)
            
            let name, quantity, unit, unitPrice, taxRate, lineTotal, sku
            
            if (cells.length >= 7) {
              sku = cells[0] || ''
              name = cells[1] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[2]) || 1
              unit = cells[3] || 'Adet'
              unitPrice = parseFloat(cells[4]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              taxRate = cells[5] ? parseFloat(cells[5].replace(/[^\d.,]/g, '').replace(',', '.')) : 18
              lineTotal = parseFloat(cells[6]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
            } else if (cells.length >= 5) {
              name = cells[0] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[1]) || 1
              unitPrice = parseFloat(cells[2]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              taxRate = cells[3] ? parseFloat(cells[3].replace(/[^\d.,]/g, '').replace(',', '.')) : 18
              lineTotal = parseFloat(cells[4]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
              unit = 'Adet'
              sku = ''
            } else {
              name = cells[0] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[1]) || 1
              unitPrice = parseFloat(cells[2]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              lineTotal = parseFloat(cells[3]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
              taxRate = 18
              unit = 'Adet'
              sku = ''
            }
            
            if (name && 
                name !== '' && 
                name.length > 1 &&
                !name.toLowerCase().includes('sıra') && 
                !name.toLowerCase().includes('mal') &&
                !name.toLowerCase().includes('hizmet') &&
                !name.toLowerCase().includes('toplam') &&
                !name.toLowerCase().includes('kdv') &&
                quantity > 0) {
              
              products.push({
                name: name,
                sku: sku,
                quantity: quantity,
                unit: unit,
                unit_price: unitPrice,
                tax_rate: taxRate,
                tax_amount: (lineTotal * taxRate) / (100 + taxRate),
                line_total: lineTotal,
                discount_amount: 0,
                original_xml: rowHtml.substring(0, 200)
              })
              
              console.log(`✅ Table product added: "${name}" - ${quantity} x ${unitPrice} = ${lineTotal}`)
            }
          }
        })
      }
    }
    
    // 3. Son çare: Metin tabanlı parsing
    if (products.length === 0) {
      console.log('⚠️ No structured data found, trying text-based parsing...')
      
      const textLines = xmlContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      textLines.forEach((line, index) => {
        const productMatch = line.match(/(\d+(?:\.\d+)?)\s+(KİLO|ADET|LİTRE|METRE|GRAM|TON)?\s+(.+)/i)
        if (productMatch) {
          const quantity = parseFloat(productMatch[1])
          const unit = productMatch[2] || 'Adet'
          const name = productMatch[3].trim()
          
          let unitPrice = 0
          for (let i = index + 1; i < Math.min(index + 5, textLines.length); i++) {
            const priceMatch = textLines[i].match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*TL/i)
            if (priceMatch) {
              unitPrice = parseFloat(priceMatch[1].replace(',', '.'))
              break
            }
          }
          
          if (name && name.length > 2 && !name.includes('Sıra') && !name.includes('ETTN')) {
            products.push({
              name: name,
              sku: '',
              quantity: quantity,
              unit: unit,
              unit_price: unitPrice,
              tax_rate: 18,
              tax_amount: (unitPrice * quantity * 18) / 100,
              line_total: unitPrice * quantity,
              discount_amount: 0,
              original_xml: line
            })
          }
        }
      })
    }
    
    console.log(`✅ Successfully parsed ${products.length} products from XML`)
    products.forEach((product, index) => {
      console.log(`📦 Product ${index + 1}: ${product.name} - ${product.quantity} x ${product.unit_price} = ${product.line_total}`)
    })
    
    return products
  } catch (error) {
    console.error('❌ Error parsing XML products:', error)
    return []
  }
}

// ===== DATABASE OPERATIONS =====
const saveProductsToDatabase = async (supabaseClient: any, products: any[], invoiceInfo: any) => {
  console.log(`Saving ${products.length} products to database...`)
  
  const savedProducts = []
  const errors = []
  
  for (const product of products) {
    try {
      let existingProduct = null
      
      // 1. SKU ile kontrol et
      if (product.sku) {
        const { data: existing } = await supabaseClient
          .from('products')
          .select('id, name, price, stock_quantity, sku')
          .eq('sku', product.sku)
          .maybeSingle()
        
        existingProduct = existing
      }
      
      // 2. İsim ile kontrol et
      if (!existingProduct && product.name) {
        const { data: existing } = await supabaseClient
          .from('products')
          .select('id, name, price, stock_quantity, sku')
          .ilike('name', `%${product.name.trim()}%`)
          .maybeSingle()
        
        existingProduct = existing
      }
      
      const productData = {
        name: product.name,
        sku: product.sku || null,
        price: product.unit_price || 0,
        tax_rate: product.tax_rate || 18,
        unit: product.unit || 'Adet',
        currency: invoiceInfo.currency || 'TRY',
        category_type: 'product',
        product_type: 'physical',
        status: 'active',
        is_active: true,
        stock_quantity: 0,
        min_stock_level: 0,
        stock_threshold: 0,
        description: `Nilvera faturasından aktarılan ürün - Fatura No: ${invoiceInfo.number}`,
        updated_at: new Date().toISOString()
      }
      
      if (existingProduct) {
        const updateData: any = {
          updated_at: productData.updated_at
        }
        
        if (productData.price !== existingProduct.price && productData.price > 0) {
          updateData.price = productData.price
        }
        
        if (productData.tax_rate !== existingProduct.tax_rate) {
          updateData.tax_rate = productData.tax_rate
        }
        
        if (!existingProduct.sku && productData.sku) {
          updateData.sku = productData.sku
        }
        
        const { data, error } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', existingProduct.id)
          .select()
          .single()
        
        if (error) throw error
        
        savedProducts.push({
          ...data,
          action: 'updated',
          original_name: existingProduct.name,
          changes: Object.keys(updateData).filter(key => key !== 'updated_at')
        })
        
        console.log(`Updated existing product: ${existingProduct.name} (${Object.keys(updateData).join(', ')})`)
      } else {
        const { data, error } = await supabaseClient
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) throw error
        
        savedProducts.push({
          ...data,
          action: 'created'
        })
        
        console.log(`Created new product: ${product.name}`)
      }
      
    } catch (error) {
      console.error(`Error saving product ${product.name}:`, error)
      errors.push({
        product: product.name,
        error: error.message
      })
    }
  }
  
  console.log(`Saved ${savedProducts.length} products, ${errors.length} errors`)
  return { savedProducts, errors }
}

const saveInvoiceToDatabase = async (supabaseClient: any, invoiceInfo: any) => {
  console.log('💾 Saving invoice to einvoices table...')
  
  try {
    const invoiceData = {
      invoice_number: invoiceInfo.number,
      supplier_name: invoiceInfo.supplier || '',
      supplier_tax_number: invoiceInfo.taxNumber || '',
      invoice_date: invoiceInfo.date,
      total_amount: invoiceInfo.totalAmount || 0,
      tax_amount: invoiceInfo.taxAmount || 0,
      currency: invoiceInfo.currency || 'TRY',
      status: 'received',
      nilvera_uuid: invoiceInfo.uuid || null,
      xml_content: invoiceInfo.xmlContent || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Check if invoice already exists
    const { data: existingInvoice } = await supabaseClient
      .from('einvoices')
      .select('id')
      .eq('invoice_number', invoiceData.invoice_number)
      .maybeSingle()
    
    if (existingInvoice) {
      console.log('✅ Invoice already exists, updating...')
      const { data, error } = await supabaseClient
        .from('einvoices')
        .update({
          ...invoiceData,
          id: existingInvoice.id
        })
        .eq('id', existingInvoice.id)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        invoice_id: data.id,
        action: 'updated'
      }
    } else {
      const { data, error } = await supabaseClient
        .from('einvoices')
        .insert(invoiceData)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        invoice_id: data.id,
        action: 'created'
      }
    }
  } catch (error) {
    console.error('❌ Error saving invoice:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// ===== NILVERA API OPERATIONS =====
const createSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  if (authHeader) {
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  })
}

const fetchNilveraToken = async () => {
  // Use the provided API key directly
  const apiKey = 'BA2C9A936C7F251ACBB787F7E4D412ECBE8BE70B848AA0CDD91DC9FF4522C206'
  console.log('✅ Using provided Nilvera API key')
  return apiKey
}

const fetchIncomingInvoices = async (apiKey: string) => {
  try {
    console.log('📥 Fetching incoming invoices from Nilvera API...')
    
    const response = await fetch('https://developer.nilvera.com/api/e-fatura-api/gelen-faturalar/gelen-faturalari-listeler', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Nilvera API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Nilvera API error: ${response.status} - ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Nilvera API response:', JSON.stringify(data, null, 2))
    
    return data
  } catch (error) {
    console.error('❌ Error fetching incoming invoices:', error)
    throw error
  }
}

const fetchInvoiceDetails = async (token: string, invoiceId: string) => {
  try {
    console.log('📋 Fetching invoice details...')
    console.log('🔑 Using token:', token.substring(0, 10) + '...')
    
    const response = await fetch(`https://api.nilvera.com/api/v1/einvoice/incoming/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📋 Details response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Invoice details received:', {
      invoiceNumber: data.InvoiceNumber,
      supplier: data.SenderName,
      amount: data.PayableAmount
    })
    
    return data
  } catch (error) {
    console.error('❌ Error fetching invoice details:', error)
    throw error
  }
}

const fetchInvoiceXML = async (token: string, invoiceId: string) => {
  try {
    console.log('📄 Fetching XML content first (primary source)...')
    
    const response = await fetch(`https://api.nilvera.com/api/v1/einvoice/incoming/${invoiceId}/xml`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const xmlContent = await response.text()
    console.log('📄 XML content preview:', xmlContent.substring(0, 500))
    console.log('✅ XML content received, length:', xmlContent.length)
    
    return xmlContent
  } catch (error) {
    console.error('❌ Error fetching invoice XML:', error)
    throw error
  }
}

// ===== MAIN REQUEST HANDLER =====
const handleFetchInvoices = async (supabaseClient: any) => {
  try {
    const token = await fetchNilveraToken()
    const apiResponse = await fetchIncomingInvoices(token)
    
    const invoices = apiResponse.Content || []
    console.log(`Found ${invoices.length} invoices in response`)
    
    const formattedInvoices = invoices.map((invoice: any) => ({
      id: invoice.UUID,
      invoiceNumber: invoice.InvoiceNumber,
      supplierName: invoice.SenderName,
      supplierTaxNumber: invoice.SenderTaxNumber,
      invoiceDate: invoice.IssueDate,
      dueDate: invoice.DueDate || null,
      totalAmount: invoice.PayableAmount,
      paidAmount: 0,
      currency: invoice.CurrencyCode,
      taxAmount: invoice.TaxTotalAmount,
      status: invoice.StatusDetail,
      pdfUrl: null,
      xmlData: invoice
    }))
    
    return {
      success: true,
      invoices: formattedInvoices,
      debug: {
        total_invoices: invoices.length,
        api_response_keys: Object.keys(apiResponse),
        has_content: !!apiResponse.Content,
        content_length: apiResponse.Content?.length || 0
      }
    }
  } catch (error) {
    console.error('❌ Error in handleFetchInvoices:', error)
    return {
      success: false,
      message: error.message,
      invoices: []
    }
  }
}

const handleProcessXMLInvoice = async (supabaseClient: any, invoiceId: string) => {
  try {
    console.log('🔄 Processing XML invoice for products:', invoiceId)
    
    const token = await fetchNilveraToken()
    const invoiceDetails = await fetchInvoiceDetails(token, invoiceId)
    const xmlContent = await fetchInvoiceXML(token, invoiceId)
    
    console.log('🎯 XML'den parse edilen ürün sayısı:', products.length)
    
    const invoiceInfo = {
      number: invoiceDetails.InvoiceNumber,
      currency: invoiceDetails.CurrencyCode,
      supplier: invoiceDetails.SenderName,
      date: invoiceDetails.IssueDate?.split('T')[0],
      uuid: invoiceDetails.UUID,
      totalAmount: invoiceDetails.PayableAmount,
      taxAmount: invoiceDetails.TaxTotalAmount,
      taxNumber: invoiceDetails.SenderTaxNumber,
      xmlContent: xmlContent
    }
    
    console.log('💾 Invoice info prepared:', {
      number: invoiceInfo.number,
      currency: invoiceInfo.currency,
      supplier: invoiceInfo.supplier,
      date: invoiceInfo.date
    })
    
    const products = parseXMLProducts(xmlContent)
    
    if (products.length > 0) {
      const { savedProducts, errors } = await saveProductsToDatabase(supabaseClient, products, invoiceInfo)
      const invoiceSaveResult = await saveInvoiceToDatabase(supabaseClient, invoiceInfo)
      
      console.log('💾 Invoice save result:', invoiceSaveResult)
      
      console.log('✅ Processing completed:', { 
        parsed: products.length, 
        saved: savedProducts.length, 
        errors: errors.length,
        invoice_saved: invoiceSaveResult.success
      })
      
      return {
        success: true,
        message: `${products.length} ürün başarıyla işlendi`,
        invoice: {
          number: invoiceInfo.number,
          currency: invoiceInfo.currency,
          supplier: invoiceInfo.supplier,
          date: invoiceInfo.date,
          saved: invoiceSaveResult.success,
          invoice_id: invoiceSaveResult.invoice_id
        },
        products: {
          parsed: products.length,
          saved: savedProducts.length,
          errors: errors.length
        },
        savedProducts: savedProducts,
        errors: errors,
        xmlParsed: products
      }
    } else {
      return {
        success: false,
        message: 'Faturada ürün bilgisi bulunamadı',
        products: {
          parsed: 0,
          saved: 0,
          errors: 0
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing XML invoice:', error)
    return {
      success: false,
      message: error.message,
      error: error.message
    }
  }
}

// ===== MAIN SERVE FUNCTION =====
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createSupabaseClient(req)
    const { action, invoiceId } = await req.json()
    
    console.log('📨 Received request:', { action, invoiceId })
    
    let result
    switch (action) {
      case 'fetch_incoming':
        result = await handleFetchInvoices(supabaseClient)
        break
        
      case 'process_xml_invoice':
        if (!invoiceId) {
          throw new Error('invoiceId is required for process_xml_invoice action')
        }
        result = await handleProcessXMLInvoice(supabaseClient, invoiceId)
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
    
  } catch (error) {
    console.error('❌ Request processing error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})