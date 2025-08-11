export async function generatePdf(template: any, inputs?: Record<string, any>) {
  const [{ generate }, { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime }, { BLANK_PDF }] = await Promise.all([
    import('@pdfme/generator'),
    import('@pdfme/schemas'),
    import('@pdfme/common'),
  ]);

  const prepared = JSON.parse(JSON.stringify(template || {}));
  if (prepared?.basePdf === 'BLANK_PDF') prepared.basePdf = BLANK_PDF;

  const sample: Record<string, any> = inputs ?? {};
  // Basit örnek veri üretimi
  if (Array.isArray(prepared.schemas) && prepared.schemas[0]) {
    Object.entries(prepared.schemas[0]).forEach(([name, cfg]: any) => {
      const key = String(name).toLowerCase();
      const type = cfg?.type || 'text';
      if (sample[name] != null) return;
      if (type === 'table') sample[name] = [['Kalem', 'Miktar', 'Birim', 'Toplam'], ['Ürün', '1', '1000', '1000']];
      else if (type === 'image' || key.includes('logo')) sample[name] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      else if (type === 'checkbox') sample[name] = true;
      else if (key.includes('company')) sample[name] = 'NGS TEKNOLOJİ';
      else if (key.includes('title') || key.includes('baslik')) sample[name] = 'TEKLİF FORMU';
      else if (key.includes('name') || key.includes('musteri')) sample[name] = 'ÖRNEK MÜŞTERİ';
      else if (key.includes('date') || key.includes('tarih')) sample[name] = new Date().toLocaleDateString('tr-TR');
      else if (key.includes('total') || key.includes('amount') || key.includes('tutar')) sample[name] = '8.260,00 ₺';
      else sample[name] = `Örnek ${name}`;
    });
  }

  const pdf = await generate({
    template: prepared,
    inputs: [sample],
    plugins: {
      text,
      image,
      qrcode: barcodes.qrcode,
      ean13: barcodes.ean13,
      japanpost: barcodes.japanpost,
      line,
      rectangle,
      ellipse,
      table,
      checkbox,
      radioGroup,
      select,
      multiVariableText,
      dateTime,
    },
  });

  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `onizleme-${Date.now()}.pdf`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
