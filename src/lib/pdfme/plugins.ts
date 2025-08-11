import type { Schema } from '@pdfme/common';

export async function getPdfmePlugins() {
  const { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime } = await import('@pdfme/schemas');
  return {
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
    // signature geçici olarak devre dışı
  } as Record<string, Schema>;
}
