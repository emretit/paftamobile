import type { Template } from '@pdfme/common';
import { getPdfmePlugins } from './plugins';
import { getDefaultFonts } from './fonts';

export async function generatePdfWithPdfme(template: Template, inputs?: Record<string, any>) {
  const [{ generate }, plugins] = await Promise.all([
    import('@pdfme/generator'),
    getPdfmePlugins(),
  ]);

  const preparedTemplate: Template = JSON.parse(JSON.stringify(template));

  const pdf = await generate({
    template: preparedTemplate,
    inputs: [inputs ?? {}],
    plugins,
    options: {
      font: getDefaultFonts(),
    },
  });

  return pdf;
}
