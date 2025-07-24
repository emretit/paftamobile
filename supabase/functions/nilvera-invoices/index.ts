
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// XML parsing helper functions
const parseXMLProducts = (xmlContent: string) => {
  try {
    console.log('Parsing XML content for products...')
    
    // UBL InvoiceLine pattern'ini bul
    const invoiceLineRegex = /<cac:InvoiceLine>(.*?)<\/cac:InvoiceLine>/gs
    const invoiceLines = xmlContent.match(invoiceLineRegex) || []
    
    const products = invoiceLines.map((lineXml, index) => {
      // Ürün bilgilerini çıkar
      const itemNameMatch = lineXml.match(/<cac:Item>[\s\S]*?<cbc:Name>([\s\S]*?)<\/cbc:Name>/);
      const itemName = itemNameMatch ? itemNameMatch[1].trim() : `Ürün ${index + 1}`;
      const itemCode = extractXMLValue(lineXml, 'cbc:ID') || ''
      const quantity = parseFloat(extractXMLValue(lineXml, 'cbc:InvoicedQuantity') || '1')
      const unitCode = extractXMLAttribute(lineXml, 'cbc:InvoicedQuantity', 'unitCode') || 'Adet'
      const unitPrice = parseFloat(extractXMLValue(lineXml, 'cbc:PriceAmount') || '0')
      const lineTotal = parseFloat(extractXMLValue(lineXml, 'cbc:LineExtensionAmount') || '0')
      
      // Vergi bilgilerini çıkar
      const taxPercent = parseFloat(extractXMLValue(lineXml, 'cbc:Percent') || '18')
      const taxAmount = parseFloat(extractXMLValue(lineXml, 'cbc:TaxAmount') || '0')
      
      // İndirim bilgilerini çıkar
      const allowanceAmount = parseFloat(extractXMLValue(lineXml, 'cbc:Amount') || '0')
      
      console.log(`Parsed product ${index + 1}: ${itemName}, Code: ${itemCode}, Qty: ${quantity}, Price: ${unitPrice}`)
      
      return {
        name: itemName,
        sku: itemCode,
        quantity: quantity,
        unit: unitCode,
        unit_price: unitPrice,
        tax_rate: taxPercent,
        tax_amount: taxAmount,
        line_total: lineTotal,
        discount_amount: allowanceAmount,
        original_xml: lineXml
      }
    })
    
    console.log(`Successfully parsed ${products.length} products from XML`)
    return products
  } catch (error) {
    console.error('Error parsing XML products:', error)
    return []
  }
}

// XML değer çıkarma helper'ı
const extractXMLValue = (xml: string, tagName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1].trim() : null
}

// XML attribute çıkarma helper'ı
const extractXMLAttribute = (xml: string, tagName: string, attributeName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*${attributeName}="([^"]*)"[^>]*>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1] : null
}

// Ürün kaydetme fonksiyonu
const saveProductsToDatabase = async (supabaseClient: any, products: any[], invoiceInfo: any) => {
  console.log(`Saving ${products.length} products to database...`)
  
  const savedProducts = []
  const errors = []
  
  for (const product of products) {
    try {
      // Gelişmiş duplicate kontrolü - SKU, isim ve fiyat bazlı
      let existingProduct = null
      
      // 1. Önce SKU ile kontrol et
      if (product.sku) {
        const { data: existing } = await supabaseClient
          .from('products')
          .select('id, name, price, stock_quantity, sku')
          .eq('sku', product.sku)
          .maybeSingle()
        
        existingProduct = existing
      }
      
      // 2. SKU yoksa isim ile kontrol et
      if (!existingProduct && product.name) {
        const { data: existing } = await supabaseClient
          .from('products')
          .select('id, name, price, stock_quantity, sku')
          .ilike('name', `%${product.name.trim()}%`)
          .maybeSingle()
        
        existingProduct = existing
      }
      
      // Ürün verilerini hazırla
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
        stock_quantity: 0, // Gelen faturalarda stok miktarı bilinmez
        min_stock_level: 0,
        stock_threshold: 0,
        description: `Nilvera faturasından aktarılan ürün - Fatura No: ${invoiceInfo.number}`,
        updated_at: new Date().toISOString()
      }
      
      if (existingProduct) {
        // Mevcut ürünü akıllı güncelle
        const updateData: any = {
          updated_at: productData.updated_at
        }
        
        // Fiyat güncelleme kontrolü - sadece yeni fiyat farklıysa güncelle
        if (productData.price !== existingProduct.price && productData.price > 0) {
          updateData.price = productData.price
        }
        
        // Tax rate güncelleme
        if (productData.tax_rate !== existingProduct.tax_rate) {
          updateData.tax_rate = productData.tax_rate
        }
        
        // SKU eksikse ekle
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
        // Yeni ürün oluştur
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Yetkilendirme gereklidir')
    }

    const reqBody = await req.json()

    // Get stored Nilvera token
    const { data: authData, error: authError } = await supabaseClient
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (authError || !authData) {
      throw new Error('Nilvera kimlik doğrulama bilgisi bulunamadı. Lütfen önce Nilvera\'ya giriş yapın.')
    }

    // Check if token is expired
    if (new Date(authData.expires_at) < new Date()) {
      throw new Error('Nilvera oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
    }

    const { action, invoice, invoiceId } = reqBody

    // YENİ ACTION: XML formatında fatura getirme ve ürün kaydetme
    if (action === 'process_xml_invoice') {
      const targetInvoiceId = invoiceId || (invoice && invoice.invoiceId)
      
      if (!targetInvoiceId) {
        console.error('❌ Fatura ID eksik:', { invoiceId, invoice })
        throw new Error('Fatura ID gerekli')
      }

      console.log('🔄 Processing XML invoice for products:', targetInvoiceId)
      console.log('🔑 Using token:', authData.access_token.substring(0, 10) + '...')
      
      try {
        // 1. Fatura detaylarını al
        console.log('📋 Fetching invoice details...')
        const detailsResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${targetInvoiceId}/Details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('📋 Details response status:', detailsResponse.status)
        
        if (!detailsResponse.ok) {
          const errorText = await detailsResponse.text()
          console.error('❌ Details API error:', detailsResponse.status, errorText)
          throw new Error(`Fatura detayları alınamadı: ${detailsResponse.status} - ${errorText}`)
        }
        
        const invoiceDetails = await detailsResponse.json()
        console.log('✅ Invoice details received:', {
          invoiceNumber: invoiceDetails.InvoiceNumber,
          supplier: invoiceDetails.SenderName,
          amount: invoiceDetails.PayableAmount
        })
        
        // 2. XML içeriğini al
        const xmlResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${targetInvoiceId}/xml`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Accept': 'application/xml'
          }
        })
        
        if (!xmlResponse.ok) {
          const errorText = await xmlResponse.text()
          console.error(`XML API Error: ${xmlResponse.status} - ${errorText}`)
          throw new Error(`XML içeriği alınamadı: ${xmlResponse.status} - ${errorText}`)
        }
        
        const xmlContent = await xmlResponse.text()
        console.log('XML content length:', xmlContent.length)
        console.log('XML content preview:', xmlContent.substring(0, 500))
        
        // 3. XML'den ürünleri parse et
        const parsedProducts = parseXMLProducts(xmlContent)
        
        if (parsedProducts.length === 0) {
          console.warn('⚠️ No products parsed from XML')
          // XML içeriğini daha detaylı logla
          console.log('📄 Full XML content for debugging:', xmlContent)
        }
        
        // 4. Ürünleri veritabanına kaydet
        const invoiceInfo = {
          number: invoiceDetails.InvoiceNumber || '',
          currency: invoiceDetails.CurrencyCode || 'TRY',
          supplier: invoiceDetails.SenderName || '',
          date: invoiceDetails.IssueDate || ''
        }
        
        console.log('💾 Invoice info prepared:', invoiceInfo)
        
        const { savedProducts, errors } = await saveProductsToDatabase(
          supabaseClient, 
          parsedProducts, 
          invoiceInfo
        )
        
        console.log('✅ Processing completed:', {
          parsed: parsedProducts.length,
          saved: savedProducts.length,
          errors: errors.length
        })
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `${savedProducts.length} ürün başarıyla işlendi`,
            invoice: invoiceInfo,
            products: {
              parsed: parsedProducts.length,
              saved: savedProducts.length,
              errors: errors.length
            },
            savedProducts: savedProducts,
            errors: errors,
            xmlParsed: parsedProducts
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
        
      } catch (innerError: any) {
        console.error('❌ Inner process_xml_invoice error:', innerError)
        console.error('❌ Error stack:', innerError.stack)
        
        return new Response(
          JSON.stringify({
            success: false,
            error: innerError.message || 'XML işleme hatası',
            details: {
              invoiceId: targetInvoiceId,
              timestamp: new Date().toISOString(),
              errorType: innerError.name || 'Unknown'
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    }

    if (action === 'fetch_incoming') {
      console.log('Using token:', authData.access_token.substring(0, 10) + '...')
      
      // Doğru endpoint: gelen faturaları query parametreleri ile listele
      const now = new Date()
      const startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) // Son 30 gün
      const endDate = now
      
      const queryParams = new URLSearchParams({
        'StartDate': startDate.toISOString(),
        'EndDate': endDate.toISOString(),
        'IsArchive': 'false',
        'Page': '1',
        'PageSize': '50',
        'SortColumn': 'IssueDate',
        'SortType': 'DESC'
      })
      
      // Fetch incoming invoices from Nilvera
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Purchase?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Nilvera API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera API error:', errorText)
        throw new Error(`Faturalar getirilemedi: ${response.status} - ${errorText}`)
      }
      
      const response_data = await response.json()
      console.log('Nilvera API response:', response_data)
      
      // Nilvera API response yapısını doğru şekilde parse et
      let invoices = []
      if (response_data && response_data.Content && Array.isArray(response_data.Content)) {
        invoices = response_data.Content
        console.log(`Found ${invoices.length} invoices in response`)
      } else {
        console.log('No Content array found in response:', response_data)
        invoices = []
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoices: invoices.map((inv: any) => ({
            id: inv.UUID,
            invoiceNumber: inv.InvoiceNumber,
            supplierName: inv.SenderName,
            supplierTaxNumber: inv.SenderTaxNumber,
            invoiceDate: inv.IssueDate,
            dueDate: inv.PaymentDate || null,
            totalAmount: parseFloat(inv.PayableAmount || 0),
            paidAmount: 0, // Gelen faturalar için ödenen tutar bilgisi genelde yoktur
            currency: inv.CurrencyCode || 'TRY',
            taxAmount: parseFloat(inv.TaxTotalAmount || 0),
            status: inv.StatusDetail,
            pdfUrl: null, // PDF URL ayrı bir API call ile alınır
            xmlData: inv
          })),
          debug: {
            total_invoices: invoices.length,
            api_response_keys: Object.keys(response_data || {}),
            has_content: !!(response_data && response_data.Content),
            content_length: response_data?.Content?.length || 0
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'fetch_outgoing') {
      console.log('Using token for outgoing invoices:', authData.access_token.substring(0, 10) + '...')
      
      const now = new Date()
      const startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) // Son 30 gün
      const endDate = now
      
      const queryParams = new URLSearchParams({
        'StartDate': startDate.toISOString(),
        'EndDate': endDate.toISOString(),
        'IsArchive': 'false',
        'Page': '1',
        'PageSize': '50',
        'SortColumn': 'IssueDate',
        'SortType': 'DESC'
      })
      
      // Doğru endpoint: /einvoice/Sale (giden faturaları listeler)
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Sale?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Nilvera Outgoing API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera Outgoing API error:', errorText)
        throw new Error(`Giden faturalar getirilemedi: ${response.status} - ${errorText}`)
      }
      
      const response_data = await response.json()
      console.log('Nilvera Outgoing API response:', response_data)
      
      let invoices = []
      if (response_data && response_data.Content && Array.isArray(response_data.Content)) {
        invoices = response_data.Content
        console.log(`Found ${invoices.length} outgoing invoices in response`)
      } else {
        console.log('No Content array found in outgoing response:', response_data)
        invoices = []
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoices: invoices.map((inv: any) => ({
            id: inv.UUID,
            invoiceNumber: inv.InvoiceNumber,
            customerName: inv.ReceiverName || inv.ReceiverTitle,
            customerTaxNumber: inv.ReceiverTaxNumber || inv.ReceiverVKN,
            invoiceDate: inv.IssueDate,
            dueDate: inv.PaymentDate || null,
            totalAmount: parseFloat(inv.PayableAmount || 0),
            paidAmount: parseFloat(inv.PaidAmount || 0), // Giden faturalarda ödenen tutar olabilir
            currency: inv.CurrencyCode || 'TRY',
            taxAmount: parseFloat(inv.TaxTotalAmount || 0),
            status: inv.StatusDetail,
            answerCode: inv.AnswerCode, // Giden faturalarda müşteri yanıt durumu
            isRead: inv.IsRead,
            isPrint: inv.IsPrint,
            isArchive: inv.IsArchive,
            pdfUrl: null,
            xmlData: inv
          })),
          debug: {
            total_invoices: invoices.length,
            api_response_keys: Object.keys(response_data || {}),
            has_content: !!(response_data && response_data.Content),
            content_length: response_data?.Content?.length || 0
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_invoice_details') {
      const { invoiceId } = invoice
      
      if (!invoiceId) {
        throw new Error('Fatura ID gerekli')
      }

      console.log('Fetching invoice details for:', invoiceId)
      
      // Fetch invoice details from Nilvera - try both Details and UBL endpoints
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${invoiceId}/Details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Also try to get XML content which contains more detailed product info
      const xmlResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${invoiceId}/xml`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Accept': 'application/xml'
        }
      }).catch(e => {
        console.log('XML endpoint not available:', e.message)
        return null
      })

      console.log('Invoice details response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera invoice details error:', errorText)
        throw new Error(`Fatura detayları getirilemedi: ${response.status} - ${errorText}`)
      }

      const detailsData = await response.json()
      console.log('Invoice details response:', detailsData)
      
              // Try to get XML for better product details
        let xmlContent = null
        if (xmlResponse && xmlResponse.ok) {
          try {
            xmlContent = await xmlResponse.text()
            console.log('XML content length:', xmlContent?.length || 0)
          } catch (e) {
            console.log('Could not parse XML:', e)
          }
        }
      
      // Parse invoice lines from the response
      let invoiceLines = []
      
      // First try InvoiceLines array
      if (detailsData && detailsData.InvoiceLines && Array.isArray(detailsData.InvoiceLines)) {
        console.log('Found InvoiceLines array with', detailsData.InvoiceLines.length, 'items')
        console.log('Sample InvoiceLine:', detailsData.InvoiceLines[0])
        
        invoiceLines = detailsData.InvoiceLines.map((line: any) => {
          // Try different possible field names for product/service description
          const productName = line.Item?.Name || 
                             line.Item?.Description || 
                             line.Name || 
                             line.Description || 
                             line.ProductName ||
                             line.ServiceName ||
                             line.ItemName ||
                             'Belirtilmemiş';
          
          console.log('Product name found:', productName, 'from line:', line);
          
          return {
            description: productName,
            productCode: line.Item?.Code || line.Code || line.ProductCode || '',
            quantity: parseFloat(line.InvoicedQuantity || line.Quantity || 1),
            unit: line.InvoicedQuantity?.unitCode || line.UnitCode || line.Unit || 'Adet',
            unitPrice: parseFloat(line.Price?.PriceAmount || line.UnitPrice || line.PriceAmount || 0),
            vatRate: parseFloat(line.TaxTotal?.TaxSubtotal?.[0]?.Percent || line.TaxRate || line.VatRate || 0),
            vatAmount: parseFloat(line.TaxTotal?.TaxAmount || line.TaxAmount || line.VatAmount || 0),
            totalAmount: parseFloat(line.LineExtensionAmount || line.TotalAmount || line.Amount || 0),
            discountRate: parseFloat(line.AllowanceCharge?.Percent || line.DiscountRate || 0),
            discountAmount: parseFloat(line.AllowanceCharge?.Amount || line.DiscountAmount || 0)
          }
        })
      } else {
        // If no InvoiceLines, try to parse from XML content or other fields
        console.log('No InvoiceLines found, trying alternative parsing methods')
        console.log('Available fields in detailsData:', Object.keys(detailsData || {}))
        
                // Try to parse from XML content if available
         let xmlParsedLines = []
         const xmlToParse = xmlContent || detailsData.Content || detailsData.XmlContent || detailsData.UblContent
         
         if (xmlToParse && typeof xmlToParse === 'string') {
           try {
             console.log('Trying to parse XML content for product details')
             
             // Simple regex parsing for InvoiceLine elements
             // This is a basic approach - a proper XML parser would be better
             const invoiceLineRegex = /<cac:InvoiceLine>(.*?)<\/cac:InvoiceLine>/gs
             const itemNameRegex = /<cbc:Name[^>]*>(.*?)<\/cbc:Name>/g
             const quantityRegex = /<cbc:InvoicedQuantity[^>]*>(.*?)<\/cbc:InvoicedQuantity>/g
             const priceRegex = /<cbc:PriceAmount[^>]*>(.*?)<\/cbc:PriceAmount>/g
             const lineExtensionRegex = /<cbc:LineExtensionAmount[^>]*>(.*?)<\/cbc:LineExtensionAmount>/g
             
             const invoiceLines = xmlToParse.match(invoiceLineRegex)
             
             if (invoiceLines && invoiceLines.length > 0) {
               console.log(`Found ${invoiceLines.length} invoice lines in XML`)
               
               xmlParsedLines = invoiceLines.map((lineXml, index) => {
                 const nameMatch = lineXml.match(itemNameRegex)
                 const quantityMatch = lineXml.match(quantityRegex)
                 const priceMatch = lineXml.match(priceRegex)
                 const extensionMatch = lineXml.match(lineExtensionRegex)
                 
                 const itemName = nameMatch?.[0]?.replace(/<[^>]*>/g, '').trim() || `Ürün ${index + 1}`
                 const quantity = quantityMatch?.[0]?.replace(/<[^>]*>/g, '').trim() || '1'
                 const price = priceMatch?.[0]?.replace(/<[^>]*>/g, '').trim() || '0'
                 const lineTotal = extensionMatch?.[0]?.replace(/<[^>]*>/g, '').trim() || '0'
                 
                 console.log(`XML Line ${index + 1}: ${itemName}, Qty: ${quantity}, Price: ${price}`)
                 
                 return {
                   description: itemName,
                   productCode: '',
                   quantity: parseFloat(quantity) || 1,
                   unit: 'Adet',
                   unitPrice: parseFloat(price) || 0,
                   vatRate: 20, // Default, would need to parse from XML
                   vatAmount: 0,
                   totalAmount: parseFloat(lineTotal) || 0,
                   discountRate: 0,
                   discountAmount: 0
                 }
               })
               
               if (xmlParsedLines.length > 0) {
                 invoiceLines = xmlParsedLines
                 console.log('Successfully parsed', xmlParsedLines.length, 'lines from XML')
               }
             }
           } catch (e) {
             console.log('Could not parse XML content:', e)
           }
         }
        
        // Check if there are line items in different structure
        if (detailsData.LineItems && Array.isArray(detailsData.LineItems)) {
          console.log('Found LineItems array:', detailsData.LineItems.length)
          invoiceLines = detailsData.LineItems.map((item: any, index: number) => ({
            description: item.Description || item.Name || item.ProductName || `Kalem ${index + 1}`,
            productCode: item.Code || item.ProductCode || '',
            quantity: parseFloat(item.Quantity || 1),
            unit: item.Unit || item.UnitCode || 'Adet',
            unitPrice: parseFloat(item.UnitPrice || item.Price || 0),
            vatRate: parseFloat(item.VatRate || item.TaxRate || 0),
            vatAmount: parseFloat(item.VatAmount || item.TaxAmount || 0),
            totalAmount: parseFloat(item.TotalAmount || item.Amount || 0),
            discountRate: 0,
            discountAmount: 0
          }))
        } else {
          // Create a fallback single line from the invoice summary 
          const invoiceAmount = parseFloat(detailsData?.PayableAmount || detailsData?.InvoiceAmount || 0)
          const taxAmount = parseFloat(detailsData?.TaxTotalAmount || detailsData?.TaxAmount || 0) 
          const netAmount = parseFloat(detailsData?.TaxExclusiveAmount || detailsData?.LineExtensionAmount || (invoiceAmount - taxAmount))
          const vatRate = taxAmount > 0 && netAmount > 0 ? ((taxAmount / netAmount) * 100) : 0
          
          invoiceLines = [{
            description: `Fatura Kalemi - ${detailsData?.InvoiceNumber || 'Belirtilmemiş'}`,
            productCode: '',
            quantity: 1,
            unit: 'Adet', 
            unitPrice: netAmount,
            vatRate: vatRate,
            vatAmount: taxAmount,
            totalAmount: invoiceAmount,
            discountRate: 0,
            discountAmount: 0
          }]
          
          console.log('Created fallback invoice line:', invoiceLines[0])
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoiceDetails: {
            invoiceInfo: {
              number: detailsData.InvoiceNumber || '',
              date: detailsData.IssueDate || '',
              totalAmount: parseFloat(detailsData.PayableAmount || 0),
              currency: detailsData.CurrencyCode || 'TRY',
              taxTotalAmount: parseFloat(detailsData.TaxTotalAmount || 0),
              lineExtensionAmount: parseFloat(detailsData.LineExtensionAmount || 0)
            },
            supplier: {
              name: detailsData.SenderName || '',
              taxNumber: detailsData.SenderTaxNumber || '',
              address: detailsData.SenderAddress || ''
            },
            items: invoiceLines
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_pdf') {
      const targetInvoiceId = invoiceId || (invoice && invoice.invoiceId)
      
      if (!targetInvoiceId) {
        throw new Error('Fatura ID gerekli')
      }

      console.log('Fetching PDF for invoice:', targetInvoiceId)
      
      // Fetch PDF from Nilvera
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${targetInvoiceId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`
        }
      })

      console.log('PDF response status:', response.status)
      console.log('PDF response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera PDF error:', errorText)
        throw new Error(`PDF getirilemedi: ${response.status} - ${errorText}`)
      }

      // PDF'i buffer olarak al
      const pdfBuffer = await response.arrayBuffer()
      const pdfBytes = new Uint8Array(pdfBuffer)
      
      console.log('PDF buffer size:', pdfBuffer.byteLength)
      console.log('PDF bytes first 20:', Array.from(pdfBytes.slice(0, 20)).map(b => b.toString(16)).join(' '))
      
      // Convert to base64 for frontend
      const pdfBase64 = btoa(String.fromCharCode(...pdfBytes))

      return new Response(
        JSON.stringify({ 
          success: true, 
          pdfData: pdfBase64,
          contentType: 'application/pdf',
          message: 'PDF başarıyla alındı'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'create') {
      // Create invoice in Nilvera
      const invoiceData = {
        invoiceType: 'SATIS',
        invoiceSeriesNumber: invoice.invoiceNumber,
        issueDate: invoice.invoiceDate,
        senderTitle: 'NGS Teknoloji', // Your company name
        receiverTitle: invoice.supplierName,
        receiverVKN: invoice.supplierTaxNumber,
        documentCurrencyCode: invoice.currency,
        totalPayableAmount: invoice.totalAmount,
        totalTaxAmount: invoice.taxAmount,
        paymentDate: invoice.dueDate,
        note: invoice.description
      }

      const response = await fetch('https://apitest.nilvera.com/einvoice/Create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Nilvera create error:', errorData)
        throw new Error(`Fatura oluşturulamadı: ${response.status} - ${errorData}`)
      }

      const result = await response.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoiceId: result.id,
          message: 'Fatura başarıyla oluşturuldu'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Geçersiz işlem türü' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Nilvera invoices error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Bir hata oluştu' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
