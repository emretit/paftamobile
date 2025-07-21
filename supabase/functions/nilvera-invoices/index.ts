import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// XML parsing helper functions
const parseXMLProducts = (xmlContent: string) => {
  try {
    console.log('🔍 Parsing XML content for products...')
    console.log('📄 XML content preview (first 1000 chars):', xmlContent.substring(0, 1000))
    
    const products = []
    
    // Türkçe e-fatura için gelişmiş parsing yaklaşımları
    
    // 1. UBL InvoiceLine pattern'i (standart XML format)
    const invoiceLineRegex = /<cac:InvoiceLine[^>]*>(.*?)<\/cac:InvoiceLine>/gs
    let invoiceLines = xmlContent.match(invoiceLineRegex) || []
    
    console.log(`📋 Found ${invoiceLines.length} UBL InvoiceLine entries`)
    
    if (invoiceLines.length > 0) {
      invoiceLines.forEach((lineXml, index) => {
        console.log(`\n🔍 Processing UBL InvoiceLine ${index + 1}:`)
        console.log('📄 Line XML preview:', lineXml.substring(0, 300) + '...')
        
        // Farklı tag isimlerini deneyelim - UBL standart formatları
        let itemName = 
          extractXMLValue(lineXml, 'cbc:Name') || 
          extractXMLValue(lineXml, 'cac:Item/cbc:Name') ||
          extractXMLValue(lineXml, 'cac:Item/cac:SellersItemIdentification/cbc:ID') ||
          extractXMLValue(lineXml, 'cac:Item/cbc:Description') ||
          `Ürün ${index + 1}`
        
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
        
        // Vergi bilgilerini çıkar
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
    
    // 2. Eğer UBL formatında bulamazsak, HTML tablo formatını deneyelim (Türkçe e-fatura görünümü)
    if (products.length === 0) {
      console.log('⚠️ No UBL InvoiceLines found, trying HTML table format...')
      
      // Farklı tablo formatlarını dene
      const tablePatterns = [
        /<table[^>]*class="[^"]*lineTable[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*invoice[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*class="[^"]*item[^"]*"[^>]*>(.*?)<\/table>/gs,
        /<table[^>]*>(.*?)<\/table>/gs // Son çare: herhangi bir tablo
      ]
      
      let tableMatch = null
      for (const pattern of tablePatterns) {
        tableMatch = xmlContent.match(pattern)
        if (tableMatch) break
      }
      
      if (tableMatch) {
        console.log('📋 Found invoice table, parsing rows...')
        const tableContent = tableMatch[0]
        
        // Tablo satırlarını bul
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs
        const rows = []
        let rowMatch
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
          rows.push(rowMatch[1])
        }
        
        console.log(`📋 Found ${rows.length} table rows`)
        
        // İlk satır genellikle başlıktır, onu atla
        const dataRows = rows.slice(1)
        
        dataRows.forEach((rowHtml, index) => {
          // Hücreleri çıkar
          const cellRegex = /<td[^>]*>(.*?)<\/td>/gs
          const cells = []
          let cellMatch
          while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            // HTML taglerini temizle ve içeriği al
            let cellContent = cellMatch[1]
              .replace(/<[^>]*>/g, '') // HTML taglerini kaldır
              .replace(/&nbsp;/g, ' ') // HTML space'leri normal space'e çevir
              .replace(/&amp;/g, '&')  // HTML entity'leri çevir
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim()
            cells.push(cellContent)
          }
          
          if (cells.length >= 4) { // En az 4 sütun olmalı
            console.log(`📋 Table row ${index + 1}: [${cells.join(' | ')}]`)
            
            // Farklı tablo formatlarını destekle
            let name, quantity, unit, unitPrice, taxRate, lineTotal, sku
            
            if (cells.length >= 7) {
              // Standart Türkçe fatura formatı: Sıra No | Mal Hizmet | Miktar | Birim | Birim Fiyat | KDV Oranı | Mal Hizmet Tutarı
              sku = cells[0] || ''
              name = cells[1] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[2]) || 1
              unit = cells[3] || 'Adet'
              unitPrice = parseFloat(cells[4]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              taxRate = cells[5] ? parseFloat(cells[5].replace(/[^\d.,]/g, '').replace(',', '.')) : 18
              lineTotal = parseFloat(cells[6]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
            } else if (cells.length >= 5) {
              // Kısa format: Ürün | Miktar | Birim Fiyat | KDV | Toplam
              name = cells[0] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[1]) || 1
              unitPrice = parseFloat(cells[2]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              taxRate = cells[3] ? parseFloat(cells[3].replace(/[^\d.,]/g, '').replace(',', '.')) : 18
              lineTotal = parseFloat(cells[4]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
              unit = 'Adet'
              sku = ''
            } else {
              // Minimum format: Ürün | Miktar | Fiyat | Toplam
              name = cells[0] || `Ürün ${index + 1}`
              quantity = parseFloat(cells[1]) || 1
              unitPrice = parseFloat(cells[2]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
              lineTotal = parseFloat(cells[3]?.replace(/[^\d.,]/g, '').replace(',', '.')) || (quantity * unitPrice)
              taxRate = 18
              unit = 'Adet'
              sku = ''
            }
            
            // Geçerli ürün kontrolü
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
                tax_amount: (lineTotal * taxRate) / (100 + taxRate), // KDV dahil fiyattan KDV'yi çıkar
                line_total: lineTotal,
                discount_amount: 0,
                original_xml: rowHtml.substring(0, 200)
              })
              
              console.log(`✅ Table product added: "${name}" - ${quantity} x ${unitPrice} = ${lineTotal}`)
            }
          }
        })
      } else {
        console.log('⚠️ No table found in HTML content')
      }
    }
    
    // 3. Alternatif HTML format - div tabanlı
    if (products.length === 0) {
      console.log('⚠️ No HTML table found, trying div-based format...')
      
      // Ürün div'lerini ara
      const productDivRegex = /<div[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/div>/gs
      let divMatches = xmlContent.match(productDivRegex) || []
      
      if (divMatches.length === 0) {
        // Farklı class isimleri dene
        const alternativeRegex = /<div[^>]*class="[^"]*item[^"]*"[^>]*>(.*?)<\/div>/gs
        divMatches = xmlContent.match(alternativeRegex) || []
      }
      
      console.log(`📋 Found ${divMatches.length} product divs`)
      
      divMatches.forEach((divHtml, index) => {
        const name = extractTextFromHTML(divHtml, 'name') || 
                   extractTextFromHTML(divHtml, 'description') || 
                   `Ürün ${index + 1}`
        const quantity = parseFloat(extractTextFromHTML(divHtml, 'quantity') || '1')
        const unitPrice = parseFloat(extractTextFromHTML(divHtml, 'price') || '0')
        const taxRate = parseFloat(extractTextFromHTML(divHtml, 'tax') || '18')
        
        products.push({
          name: name,
          sku: '',
          quantity: quantity,
          unit: 'Adet',
          unit_price: unitPrice,
          tax_rate: taxRate,
          tax_amount: (unitPrice * quantity * taxRate) / 100,
          line_total: unitPrice * quantity,
          discount_amount: 0,
          original_xml: divHtml.substring(0, 200)
        })
      })
    }
    
    // 4. Son çare: Metin tabanlı parsing
    if (products.length === 0) {
      console.log('⚠️ No structured data found, trying text-based parsing...')
      
      // "1 KİLO DOMATES" gibi satırları ara
      const textLines = xmlContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      textLines.forEach((line, index) => {
        // Sayı + birim + ürün adı formatını ara
        const productMatch = line.match(/(\d+(?:\.\d+)?)\s+(KİLO|ADET|LİTRE|METRE|GRAM|TON)?\s+(.+)/i)
        if (productMatch) {
          const quantity = parseFloat(productMatch[1])
          const unit = productMatch[2] || 'Adet'
          const name = productMatch[3].trim()
          
          // Fiyat bilgisini sonraki satırlarda ara
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

// XML değer çıkarma helper'ı
const extractXMLValue = (xml: string, tagName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)<\/${tagName}>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1].trim() : null
}

// XML attribute çıkarma helper'ı
const extractXMLAttribute = (xml: string, tagName: string, attributeName: string): string | null => {
  const regex = new RegExp(`<${tagName}[^>]*${attributeName}="([^"]*)"[^>]*>`, 'g')
  const match = regex.exec(xml)
  return match ? match[1] : null
}

// HTML'den metin çıkarma helper'ı
const extractTextFromHTML = (html: string, fieldType: string): string | null => {
  // Class veya data attribute'larına göre değer çıkar
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

// Fatura verilerini einvoices tablosuna kaydetme fonksiyonu
const saveInvoiceToDatabase = async (supabaseClient: any, invoiceDetails: any, nilveraId: string, userId: string) => {
  console.log('💾 Saving invoice to einvoices table...')
  
  try {
    // Önce aynı nilvera_id ile fatura var mı kontrol et
    const { data: existingInvoice, error: fetchError } = await supabaseClient
      .from('einvoices')
      .select('id')
      .eq('nilvera_id', nilveraId)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error fetching existing invoice:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Fatura verilerini hazırla
    const invoiceData = {
      invoice_number: invoiceDetails.InvoiceNumber || '',
      supplier_name: invoiceDetails.SenderName || '',
      supplier_tax_number: invoiceDetails.SenderTaxNumber || '',
      invoice_date: invoiceDetails.IssueDate || new Date().toISOString().split('T')[0],
      due_date: invoiceDetails.PaymentDate || null,
      status: 'pending',
      total_amount: parseFloat(invoiceDetails.PayableAmount || 0),
      paid_amount: 0,
      remaining_amount: parseFloat(invoiceDetails.PayableAmount || 0),
      currency: invoiceDetails.CurrencyCode || 'TRY',
      tax_amount: parseFloat(invoiceDetails.TaxTotalAmount || 0),
      nilvera_id: nilveraId,
      xml_data: invoiceDetails,
      created_by: userId,
      updated_at: new Date().toISOString()
    }

    if (existingInvoice) {
      console.log('✅ Invoice already exists, updating...')
      const { data, error } = await supabaseClient
        .from('einvoices')
        .update(invoiceData)
        .eq('id', existingInvoice.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating invoice:', error)
        return { success: false, error: error.message }
      }
      return { success: true, invoice_id: data.id, action: 'updated' }
    } else {
      console.log('✅ Creating new invoice...')
      const { data, error } = await supabaseClient
        .from('einvoices')
        .insert(invoiceData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating invoice:', error)
        return { success: false, error: error.message }
      }
      return { success: true, invoice_id: data.id, action: 'created' }
    }
  } catch (error: any) {
    console.error('❌ saveInvoiceToDatabase error:', error)
    return { success: false, error: error.message }
  }
}

// Otomatik ürün eşleştirme fonksiyonu
const performAutoMatching = async (invoiceProducts: any[], stockProducts: any[]) => {
  console.log('🔄 Starting auto matching process...')
  console.log(`📊 Invoice products: ${invoiceProducts.length}, Stock products: ${stockProducts.length}`)
  
  const matchedProducts = []
  
  for (const invoiceProduct of invoiceProducts) {
    const matchResult = {
      line_id: invoiceProduct.line_id || '1',
      invoice_product_code: invoiceProduct.sku || '',
      invoice_product_name: invoiceProduct.name || '',
      invoice_product_gtip: invoiceProduct.gtip || '',
      invoice_quantity: invoiceProduct.quantity || 0,
      invoice_unit: invoiceProduct.unit || 'Adet',
      invoice_unit_price: invoiceProduct.unit_price || 0,
      invoice_total_amount: invoiceProduct.line_total || 0,
      invoice_tax_rate: invoiceProduct.tax_rate || 18,
      matched_stock_id: null,
      matched_stock_code: '',
      matched_stock_name: '',
      match_type: 'unmatched',
      match_confidence: 0,
      match_notes: '',
      is_confirmed: false,
      suggested_matches: [] // Manuel seçim için öneriler
    }
    
    // 1. ÖNCE KOD/BARKOD İLE EŞLEŞTİRME DENE
    if (invoiceProduct.sku && invoiceProduct.sku.trim() !== '') {
      const codeMatch = stockProducts.find(stock => 
        (stock.sku && stock.sku.toLowerCase() === invoiceProduct.sku.toLowerCase()) ||
        (stock.barcode && stock.barcode.toLowerCase() === invoiceProduct.sku.toLowerCase())
      )
      
      if (codeMatch) {
        matchResult.matched_stock_id = codeMatch.id
        matchResult.matched_stock_code = codeMatch.sku || ''
        matchResult.matched_stock_name = codeMatch.name || ''
        matchResult.match_type = 'auto_code'
        matchResult.match_confidence = 1.0
        matchResult.match_notes = 'Ürün kodu/barkod ile otomatik eşleştirildi'
        matchResult.is_confirmed = true
        
        console.log(`✅ Code match found: ${invoiceProduct.name} → ${codeMatch.name}`)
        matchedProducts.push(matchResult)
        continue
      }
    }
    
    // 2. İSİM İLE EŞLEŞTİRME DENE (Fuzzy matching)
    if (invoiceProduct.name && invoiceProduct.name.trim() !== '') {
      const nameMatches = findNameMatches(invoiceProduct.name, stockProducts)
      
      if (nameMatches.length > 0) {
        const bestMatch = nameMatches[0] // En yüksek skorlu eşleşme
        
        if (bestMatch.confidence >= 0.8) {
          // %80 ve üzeri güven ile otomatik eşleştir
          matchResult.matched_stock_id = bestMatch.stock.id
          matchResult.matched_stock_code = bestMatch.stock.sku || ''
          matchResult.matched_stock_name = bestMatch.stock.name || ''
          matchResult.match_type = 'auto_name'
          matchResult.match_confidence = bestMatch.confidence
          matchResult.match_notes = `İsim benzerliği ile otomatik eşleştirildi (%${(bestMatch.confidence * 100).toFixed(0)})`
          matchResult.is_confirmed = bestMatch.confidence >= 0.9 // %90 üzerinde otomatik onay
          
          console.log(`✅ Name match found: ${invoiceProduct.name} → ${bestMatch.stock.name} (${(bestMatch.confidence * 100).toFixed(0)}%)`)
        } else {
          // Düşük güven, manuel seçim için öneriler sun
          matchResult.suggested_matches = nameMatches.slice(0, 5).map(match => ({
            stock_id: match.stock.id,
            stock_name: match.stock.name,
            stock_code: match.stock.sku,
            confidence: match.confidence
          }))
          matchResult.match_notes = `${nameMatches.length} adet benzer ürün bulundu, manuel seçim gerekli`
        }
      }
    }
    
    matchedProducts.push(matchResult)
  }
  
  const autoMatchedCount = matchedProducts.filter(p => p.matched_stock_id).length
  console.log(`✅ Auto matching completed: ${autoMatchedCount}/${matchedProducts.length} products matched`)
  
  return matchedProducts
}

// İsim benzerliği hesaplama fonksiyonu
const findNameMatches = (invoiceName: string, stockProducts: any[]) => {
  const cleanInvoiceName = cleanProductName(invoiceName)
  const matches = []
  
  for (const stock of stockProducts) {
    const cleanStockName = cleanProductName(stock.name)
    const confidence = calculateNameSimilarity(cleanInvoiceName, cleanStockName)
    
    if (confidence > 0.3) { // %30'dan yüksek benzerlik
      matches.push({
        stock,
        confidence
      })
    }
  }
  
  // Güven skoruna göre sırala (yüksekten düşüğe)
  return matches.sort((a, b) => b.confidence - a.confidence)
}

// Ürün adını temizleme (Türkçe stop words, noktalama vs.)
const cleanProductName = (name: string): string => {
  if (!name) return ''
  
  // Türkçe stop words
  const stopWords = ['ve', 'ile', 'için', 'adet', 'kg', 'kilo', 'gram', 'lt', 'litre', 'ml', 'cm', 'mt', 'metre']
  
  return name
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞIÖÇ]/g, ' ') // Noktalama işaretlerini kaldır
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .join(' ')
    .trim()
}

// İki string arasındaki benzerliği hesapla (Levenshtein + common words)
const calculateNameSimilarity = (name1: string, name2: string): number => {
  if (!name1 || !name2) return 0
  
  // Tam eşleşme
  if (name1 === name2) return 1.0
  
  // Birinin diğerini içermesi
  if (name1.includes(name2) || name2.includes(name1)) {
    const shorter = name1.length < name2.length ? name1 : name2
    const longer = name1.length >= name2.length ? name1 : name2
    return shorter.length / longer.length
  }
  
  // Ortak kelime sayısı
  const words1 = name1.split(/\s+/)
  const words2 = name2.split(/\s+/)
  const commonWords = words1.filter(word => words2.includes(word))
  const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length)
  
  // Levenshtein distance
  const maxLength = Math.max(name1.length, name2.length)
  const distance = levenshteinDistance(name1, name2)
  const levenshteinSimilarity = (maxLength - distance) / maxLength
  
  // Ağırlıklı ortalama
  return (wordSimilarity * 0.7) + (levenshteinSimilarity * 0.3)
}

// Levenshtein distance hesaplama
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
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
        
        // 3. XML içeriğini al ve parse et (ÖNCE XML, sonra Details API)
        console.log('📄 Fetching XML content first (primary source)...')
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
        console.log('✅ XML content received, length:', xmlContent.length)
        console.log('📄 XML content preview:', xmlContent.substring(0, 500))
        
        // XML'den ürünleri parse et (BU ÖNCE YAPILACAK)
        let parsedProducts = parseXMLProducts(xmlContent)
        console.log(`🎯 XML'den parse edilen ürün sayısı: ${parsedProducts.length}`)
        
        // XML parsing başarısızsa Details API'yi dene
        if (parsedProducts.length === 0) {
          console.log('⚠️ XML parsing failed, trying Details API as fallback...')
          
          if (invoiceDetails.InvoiceLines && Array.isArray(invoiceDetails.InvoiceLines)) {
            console.log('🔄 Using Details API InvoiceLines as fallback...')
            console.log('📄 InvoiceLines structure:', JSON.stringify(invoiceDetails.InvoiceLines[0], null, 2))
            
            parsedProducts = invoiceDetails.InvoiceLines.map((line: any, index: number) => {
              // Ürün adını farklı field'lardan çıkarmaya çalış
              const name = line.ItemName || 
                          line.Description || 
                          line.Name || 
                          line.ProductName ||
                          line.Item?.Name ||
                          line.Item?.Description ||
                          `Ürün ${index + 1}`
              
              // Ürün kodunu farklı field'lardan çıkarmaya çalış
              const code = line.ItemCode || 
                          line.SellersItemIdentification || 
                          line.ID || 
                          line.ProductCode ||
                          line.Item?.SellersItemIdentification ||
                          line.Item?.ID ||
                          ''
              
              // Miktarı farklı field'lardan çıkarmaya çalış
              const quantity = parseFloat(
                line.InvoicedQuantity || 
                line.Quantity || 
                line.Amount ||
                line.Qty ||
                '1'
              )
              
              // Birim fiyatını farklı field'lardan çıkarmaya çalış
              const unitPrice = parseFloat(
                line.PriceAmount || 
                line.UnitPrice || 
                line.Price ||
                line.UnitValue ||
                line.Item?.PriceAmount ||
                '0'
              )
              
              // Satır toplamını hesapla
              const lineTotal = parseFloat(
                line.LineExtensionAmount || 
                line.LineTotal || 
                line.TotalAmount ||
                line.Amount ||
                (quantity * unitPrice).toString()
              )
              
              // Vergi oranını farklı field'lardan çıkarmaya çalış
              const taxRate = parseFloat(
                line.TaxPercent || 
                line.VATRate || 
                line.TaxRate ||
                line.VATPercent ||
                line.KDVPercent ||
                '18'
              )
              
              // Vergi tutarını hesapla
              const taxAmount = parseFloat(
                line.TaxAmount || 
                line.VATAmount ||
                line.KDVAmount ||
                ((lineTotal * taxRate) / 100).toString()
              )
              
              // Birim kodunu farklı field'lardan çıkarmaya çalış
              const unitCode = line.UnitCode || 
                              line.Unit || 
                              line.UnitType ||
                              line.MeasureUnitCode ||
                              'Adet'
              
              // İskonto tutarını hesapla
              const discountAmount = parseFloat(
                line.AllowanceAmount || 
                line.DiscountAmount ||
                line.Discount ||
                '0'
              )
              
              console.log(`📦 From Details API - Product ${index + 1}: "${name}", Qty: ${quantity}, Unit: ${unitCode}, Price: ${unitPrice}, Tax: ${taxRate}%`)
              
              return {
                name: name.trim(),
                sku: code.trim(),
                quantity: quantity,
                unit: unitCode,
                unit_price: unitPrice,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                line_total: lineTotal,
                discount_amount: discountAmount,
                original_xml: JSON.stringify(line)
              }
            }).filter(product => product.name && product.name !== '' && !product.name.includes('undefined'))
            
            console.log(`✅ Parsed ${parsedProducts.length} products from Details API`)
          } else {
            // Son çare: Details API'den tek satırlık ürün oluştur
            console.log('⚠️ No InvoiceLines in Details API, creating single line item from summary')
            const invoiceAmount = parseFloat(invoiceDetails?.PayableAmount || invoiceDetails?.InvoiceAmount || 0)
            const taxAmount = parseFloat(invoiceDetails?.TaxTotalAmount || invoiceDetails?.TaxAmount || 0) 
            const netAmount = invoiceAmount - taxAmount
            const vatRate = taxAmount > 0 && netAmount > 0 ? ((taxAmount / netAmount) * 100) : 18
            
            parsedProducts = [{
              name: `Fatura Kalemi - ${invoiceDetails?.InvoiceNumber || 'Belirtilmemiş'}`,
              sku: invoiceDetails?.InvoiceNumber || '',
              quantity: 1,
              unit: 'Adet',
              unit_price: netAmount,
              tax_rate: vatRate,
              tax_amount: taxAmount,
              line_total: invoiceAmount,
              discount_amount: 0,
              original_source: 'details_api_fallback'
            }]
            
            console.log('🔄 Created fallback product from invoice summary:', parsedProducts[0])
          }
        }
        
        // 5. Eğer hala ürün bulamadıysak, invoiceDetails'in diğer alanlarını kontrol et
        if (parsedProducts.length === 0) {
          console.log('🔄 Trying alternative fields in invoiceDetails...')
          console.log('📄 Available invoiceDetails keys:', Object.keys(invoiceDetails))
          
          // Farklı field isimlerini dene
          const alternativeFields = ['Items', 'Lines', 'ProductLines', 'InvoiceItems', 'Details']
          
          for (const fieldName of alternativeFields) {
            if (invoiceDetails[fieldName] && Array.isArray(invoiceDetails[fieldName])) {
              console.log(`📋 Found ${fieldName} with ${invoiceDetails[fieldName].length} items`)
              
              parsedProducts = invoiceDetails[fieldName].map((item: any, index: number) => {
                return {
                  name: item.name || item.description || item.itemName || `Ürün ${index + 1}`,
                  sku: item.code || item.itemCode || '',
                  quantity: parseFloat(item.quantity || item.qty || '1'),
                  unit: item.unit || item.unitType || 'Adet',
                  unit_price: parseFloat(item.price || item.unitPrice || '0'),
                  tax_rate: parseFloat(item.taxRate || item.vatRate || '18'),
                  tax_amount: parseFloat(item.taxAmount || '0'),
                  line_total: parseFloat(item.total || item.lineTotal || '0'),
                  discount_amount: parseFloat(item.discount || '0'),
                  original_xml: JSON.stringify(item)
                }
              }).filter(product => product.name && product.name !== '')
              
              if (parsedProducts.length > 0) {
                console.log(`✅ Parsed ${parsedProducts.length} products from ${fieldName}`)
                break
              }
            }
          }
        }
        
        if (parsedProducts.length === 0) {
          console.warn('⚠️ No products found in both XML and Details API')
          console.log('📄 Available Details fields:', Object.keys(invoiceDetails))
          console.log('📄 InvoiceLines:', invoiceDetails.InvoiceLines)
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
        
        // 5. Faturayı da veritabanına kaydet
        const saveInvoiceResult = await saveInvoiceToDatabase(
          supabaseClient,
          invoiceDetails,
          targetInvoiceId,
          user.id
        )
        
        console.log('💾 Invoice save result:', saveInvoiceResult)
        
        console.log('✅ Processing completed:', {
          parsed: parsedProducts.length,
          saved: savedProducts.length,
          errors: errors.length,
          invoice_saved: saveInvoiceResult.success
        })
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `${savedProducts.length} ürün başarıyla işlendi`,
            invoice: {
              ...invoiceInfo,
              saved: saveInvoiceResult.success,
              invoice_id: saveInvoiceResult.invoice_id
            },
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

    // YENİ ACTION: E-fatura ürünlerini getir ve otomatik eşleştir
    if (action === 'fetch_and_match_products') {
      const targetInvoiceId = invoiceId || (invoice && invoice.invoiceId)
      
      if (!targetInvoiceId) {
        throw new Error('Fatura ID gerekli')
      }

      console.log('🔄 Fetching and matching products for invoice:', targetInvoiceId)
      
      try {
        // 1. Fatura detaylarını al
        const detailsResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${targetInvoiceId}/Details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!detailsResponse.ok) {
          throw new Error(`Fatura detayları alınamadı: ${detailsResponse.status}`)
        }
        
        const invoiceDetails = await detailsResponse.json()
        
        // 2. XML içeriğini al
        const xmlResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${targetInvoiceId}/xml`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Accept': 'application/xml'
          }
        })
        
        let xmlContent = ''
        if (xmlResponse.ok) {
          xmlContent = await xmlResponse.text()
        }
        
        // 3. Ürünleri parse et
        let parsedProducts = []
        if (xmlContent) {
          parsedProducts = parseXMLProducts(xmlContent)
        }
        
        // XML'den ürün bulamazsak Details API'den tek satır oluştur
        if (parsedProducts.length === 0) {
          const invoiceAmount = parseFloat(invoiceDetails?.PayableAmount || 0)
          const taxAmount = parseFloat(invoiceDetails?.TaxTotalAmount || 0) 
          const netAmount = invoiceAmount - taxAmount
          const vatRate = taxAmount > 0 && netAmount > 0 ? ((taxAmount / netAmount) * 100) : 18
          
          parsedProducts = [{
            name: invoiceDetails?.InvoiceNumber ? `Fatura Kalemi - ${invoiceDetails.InvoiceNumber}` : 'Belirtilmemiş Kalem',
            sku: invoiceDetails?.InvoiceNumber || '',
            quantity: 1,
            unit: 'Adet',
            unit_price: netAmount,
            tax_rate: vatRate,
            tax_amount: taxAmount,
            line_total: invoiceAmount,
            discount_amount: 0,
            gtip: '',
            line_id: '1'
          }]
        }
        
        // 4. Mevcut stok ürünlerini getir
        const { data: stockProducts, error: stockError } = await supabaseClient
          .from('products')
          .select('id, name, sku, barcode, price, stock_quantity, unit, description')
          .eq('is_active', true)
          .order('name')
        
        if (stockError) {
          throw new Error(`Stok ürünleri alınamadı: ${stockError.message}`)
        }
        
        // 5. Otomatik eşleştirme yap
        const matchedProducts = await performAutoMatching(parsedProducts, stockProducts)
        
        // 6. Veritabanına kaydet
        const { data: existingInvoice } = await supabaseClient
          .from('einvoices')
          .select('id')
          .eq('nilvera_id', targetInvoiceId)
          .single()
        
        let invoiceDbId = existingInvoice?.id
        if (!invoiceDbId) {
          // Faturayı kaydet
          const { data: newInvoice } = await supabaseClient
            .from('einvoices')
            .insert({
              invoice_number: invoiceDetails.InvoiceNumber || '',
              supplier_name: invoiceDetails.SenderName || '',
              supplier_tax_number: invoiceDetails.SenderTaxNumber || '',
              invoice_date: invoiceDetails.IssueDate || new Date().toISOString().split('T')[0],
              status: 'pending',
              total_amount: parseFloat(invoiceDetails.PayableAmount || 0),
              currency: invoiceDetails.CurrencyCode || 'TRY',
              tax_amount: parseFloat(invoiceDetails.TaxTotalAmount || 0),
              nilvera_id: targetInvoiceId,
              xml_data: invoiceDetails,
              created_by: user.id
            })
            .select('id')
            .single()
          
          invoiceDbId = newInvoice?.id
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            invoice: {
              id: invoiceDbId,
              nilvera_id: targetInvoiceId,
              number: invoiceDetails.InvoiceNumber,
              supplier: invoiceDetails.SenderName,
              total_amount: parseFloat(invoiceDetails.PayableAmount || 0)
            },
            products: matchedProducts,
            stock_products: stockProducts,
            message: `${parsedProducts.length} ürün bulundu, ${matchedProducts.filter(p => p.matched_stock_id).length} tanesi otomatik eşleştirildi`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
        
      } catch (innerError: any) {
        console.error('❌ fetch_and_match_products error:', innerError)
        return new Response(
          JSON.stringify({
            success: false,
            error: innerError.message || 'Ürün eşleştirme hatası'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    }

    // YENİ ACTION: Ürün eşleştirmelerini kaydet
    if (action === 'save_product_matching') {
      const { invoiceId: dbInvoiceId, matches } = reqBody
      
      if (!dbInvoiceId || !matches || !Array.isArray(matches)) {
        throw new Error('Fatura ID ve eşleştirme verileri gerekli')
      }
      
      try {
        // Mevcut eşleştirmeleri temizle
        await supabaseClient
          .from('e_fatura_stok_eslestirme')
          .delete()
          .eq('invoice_id', dbInvoiceId)
        
        // Yeni eşleştirmeleri kaydet
        const matchingData = matches.map((match: any) => ({
          invoice_id: dbInvoiceId,
          invoice_line_id: match.line_id || '1',
          invoice_product_code: match.invoice_product_code || '',
          invoice_product_name: match.invoice_product_name,
          invoice_product_gtip: match.invoice_product_gtip || '',
          invoice_quantity: parseFloat(match.invoice_quantity || 0),
          invoice_unit: match.invoice_unit || 'Adet',
          invoice_unit_price: parseFloat(match.invoice_unit_price || 0),
          invoice_total_amount: parseFloat(match.invoice_total_amount || 0),
          invoice_tax_rate: parseFloat(match.invoice_tax_rate || 18),
          matched_stock_id: match.matched_stock_id || null,
          matched_stock_code: match.matched_stock_code || '',
          matched_stock_name: match.matched_stock_name || '',
          match_type: match.match_type || 'unmatched',
          match_confidence: parseFloat(match.match_confidence || 0),
          match_notes: match.match_notes || '',
          is_confirmed: match.is_confirmed || false,
          created_by: user.id,
          updated_by: user.id
        }))
        
        const { data, error } = await supabaseClient
          .from('e_fatura_stok_eslestirme')
          .insert(matchingData)
          .select()
        
        if (error) {
          throw error
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `${matchingData.length} ürün eşleştirmesi kaydedildi`,
            saved_matches: data
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
        
      } catch (innerError: any) {
        console.error('❌ save_product_matching error:', innerError)
        return new Response(
          JSON.stringify({
            success: false,
            error: innerError.message || 'Eşleştirme kaydetme hatası'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    }

    // YENİ ACTION: Gelen faturaları listele ve tüm ürün satırlarını göster
    if (action === 'list_incoming_invoice_lines') {
      try {
        console.log('🔄 Fetching all incoming invoices and their product lines...')
        
        // 1. Gelen faturaları listele
        const listResponse = await fetch('https://apitest.nilvera.com/einvoice/Purchase', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!listResponse.ok) {
          throw new Error(`Fatura listesi alınamadı: ${listResponse.status}`)
        }
        
        const invoiceList = await listResponse.json()
        console.log(`📋 Found ${invoiceList.length} invoices`)
        
        const allInvoiceLines = []
        
        // 2. Her fatura için detayları ve XML'i al
        for (const invoice of invoiceList.slice(0, 10)) { // İlk 10 fatura ile test
          console.log(`📄 Processing invoice: ${invoice.InvoiceNumber}`)
          
          try {
            // Fatura detaylarını al
            const detailsResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${invoice.UUID}/Details`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            
            let invoiceDetails = {}
            if (detailsResponse.ok) {
              invoiceDetails = await detailsResponse.json()
            }
            
            // XML içeriğini al
            const xmlResponse = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${invoice.UUID}/xml`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authData.access_token}`,
                'Accept': 'application/xml'
              }
            })
            
            let parsedProducts = []
            if (xmlResponse.ok) {
              const xmlContent = await xmlResponse.text()
              parsedProducts = parseXMLProducts(xmlContent)
            }
            
            // XML'den ürün bulamazsak fatura özetinden tek satır oluştur
            if (parsedProducts.length === 0) {
              const invoiceAmount = parseFloat(invoiceDetails?.PayableAmount || invoice.PayableAmount || 0)
              const taxAmount = parseFloat(invoiceDetails?.TaxTotalAmount || 0)
              
              parsedProducts = [{
                name: `${invoice.InvoiceNumber} - Genel Kalem`,
                sku: '',
                quantity: 1,
                unit: 'Adet',
                unit_price: invoiceAmount - taxAmount,
                tax_rate: 18,
                tax_amount: taxAmount,
                line_total: invoiceAmount,
                discount_amount: 0,
                gtip: '',
                line_id: '1'
              }]
            }
            
            // Her ürün satırını ana listeye ekle
            parsedProducts.forEach((product, index) => {
              allInvoiceLines.push({
                // Fatura bilgileri
                invoice_uuid: invoice.UUID,
                invoice_number: invoice.InvoiceNumber,
                invoice_date: invoice.IssueDate || invoice.SendDate,
                supplier_name: invoice.SenderName || invoiceDetails.SenderName || '',
                supplier_tax_number: invoice.SenderTaxNumber || '',
                invoice_total: parseFloat(invoice.PayableAmount || 0),
                
                // Ürün satırı bilgileri
                line_number: index + 1,
                line_id: product.line_id || (index + 1).toString(),
                product_code: product.sku || '',
                product_name: product.name || '',
                product_gtip: product.gtip || '',
                quantity: product.quantity || 0,
                unit: product.unit || 'Adet',
                unit_price: product.unit_price || 0,
                line_total: product.line_total || 0,
                tax_rate: product.tax_rate || 18,
                
                // Eşleştirme durumu (başlangıçta boş)
                matched_stock_id: null,
                matched_stock_name: '',
                is_matched: false
              })
            })
            
          } catch (invoiceError) {
            console.error(`❌ Error processing invoice ${invoice.InvoiceNumber}:`, invoiceError)
            // Hata olan faturayı atla, devam et
          }
        }
        
        // 3. Mevcut stok ürünlerini getir
        const { data: stockProducts, error: stockError } = await supabaseClient
          .from('products')
          .select('id, name, sku, barcode, price, stock_quantity, unit')
          .eq('is_active', true)
          .order('name')
        
        if (stockError) {
          console.warn('⚠️ Stock products could not be loaded:', stockError.message)
        }
        
        console.log(`✅ Processed ${allInvoiceLines.length} invoice lines from ${invoiceList.length} invoices`)
        
        return new Response(
          JSON.stringify({
            success: true,
            invoice_lines: allInvoiceLines,
            stock_products: stockProducts || [],
            total_invoices: invoiceList.length,
            total_lines: allInvoiceLines.length,
            message: `${allInvoiceLines.length} fatura satırı yüklendi`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
        
      } catch (error: any) {
        console.error('❌ list_incoming_invoice_lines error:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || 'Fatura satırları yüklenemedi'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    }

    // YENİ ACTION: Manuel eşleştirmeleri kaydet
    if (action === 'save_manual_matching') {
      const { matches } = reqBody
      
      if (!matches || !Array.isArray(matches)) {
        throw new Error('Eşleştirme verileri gerekli')
      }
      
      try {
        console.log(`💾 Saving ${matches.length} manual matches...`)
        
        const matchingData = []
        
        // Her eşleştirme için veri hazırla
        for (const match of matches) {
          // Önce faturayı veritabanında bul veya oluştur
          let { data: existingInvoice } = await supabaseClient
            .from('einvoices')
            .select('id')
            .eq('nilvera_id', match.invoice_uuid)
            .maybeSingle()
          
          let invoiceDbId = existingInvoice?.id
          
          if (!invoiceDbId) {
            // Faturayı oluştur (basit verilerle)
            const { data: newInvoice, error: invoiceError } = await supabaseClient
              .from('einvoices')
              .insert({
                invoice_number: `NILVERA-${match.invoice_uuid.substring(0, 8)}`,
                supplier_name: 'Nilvera Faturası',
                invoice_date: new Date().toISOString().split('T')[0],
                status: 'pending',
                total_amount: 0,
                currency: 'TRY',
                nilvera_id: match.invoice_uuid,
                created_by: user.id
              })
              .select('id')
              .single()
            
            if (invoiceError) {
              console.error('❌ Invoice creation error:', invoiceError)
              throw new Error(`Fatura oluşturulamadı: ${invoiceError.message}`)
            }
            
            invoiceDbId = newInvoice.id
          }
          
          // Eşleştirme verisini hazırla
          matchingData.push({
            invoice_id: invoiceDbId,
            invoice_line_id: match.line_id,
            invoice_product_code: match.invoice_product_code || '',
            invoice_product_name: match.invoice_product_name || '',
            invoice_quantity: 1,
            invoice_unit: 'Adet',
            invoice_unit_price: 0,
            invoice_total_amount: 0,
            invoice_tax_rate: 18,
            matched_stock_id: match.selected_stock_id,
            matched_stock_code: '',
            matched_stock_name: match.selected_stock_name || '',
            match_type: 'manual',
            match_confidence: 1.0,
            match_notes: 'Manuel olarak eşleştirildi',
            is_confirmed: true,
            created_by: user.id,
            updated_by: user.id
          })
        }
        
        // Eşleştirmeleri kaydet
        const { data: savedMatches, error: saveError } = await supabaseClient
          .from('e_fatura_stok_eslestirme')
          .upsert(matchingData, { 
            onConflict: 'invoice_id,invoice_line_id',
            ignoreDuplicates: false 
          })
          .select()
        
        if (saveError) {
          console.error('❌ Matching save error:', saveError)
          throw new Error(`Eşleştirmeler kaydedilemedi: ${saveError.message}`)
        }
        
        console.log(`✅ Successfully saved ${savedMatches?.length || matchingData.length} matches`)
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `${matchingData.length} eşleştirme başarıyla kaydedildi`,
            saved_matches: savedMatches
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
        
      } catch (error: any) {
        console.error('❌ save_manual_matching error:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || 'Eşleştirme kaydetme hatası'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
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
