/**
 * PDFme Utilities
 * 
 * Utility functions for working with pdfme templates and generation
 */

import type { PdfmeTemplate, PdfField } from './types';

/**
 * Extract field names from a pdfme template
 */
export function extractFieldsFromTemplate(template: PdfmeTemplate): PdfField[] {
  const fields: PdfField[] = [];

  if (!template.schemas || !Array.isArray(template.schemas)) {
    return fields;
  }

  template.schemas.forEach((schema, schemaIndex) => {
    if (schema && typeof schema === 'object') {
      Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig && typeof fieldConfig === 'object') {
          fields.push({
            name: fieldName,
            type: fieldConfig.type || 'text',
            required: fieldConfig.required || false,
          });
        }
      });
    }
  });

  return fields;
}

/**
 * Validate pdfme template structure
 */
export function validateTemplate(template: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template) {
    errors.push('Template is required');
    return { valid: false, errors };
  }

  if (!template.schemas || !Array.isArray(template.schemas)) {
    errors.push('Template must have schemas array');
  }

  if (template.schemas && template.schemas.length === 0) {
    errors.push('Template must have at least one schema');
  }

  // Validate each schema
  template.schemas?.forEach((schema: any, index: number) => {
    if (!schema || typeof schema !== 'object') {
      errors.push(`Schema ${index} must be an object`);
      return;
    }

    const fieldCount = Object.keys(schema).length;
    if (fieldCount === 0) {
      errors.push(`Schema ${index} must have at least one field`);
    }

    // Validate fields
    Object.entries(schema).forEach(([fieldName, fieldConfig]: [string, any]) => {
      if (!fieldConfig || typeof fieldConfig !== 'object') {
        errors.push(`Field ${fieldName} in schema ${index} must be an object`);
        return;
      }

      if (!fieldConfig.type) {
        errors.push(`Field ${fieldName} in schema ${index} must have a type`);
      }

      if (!fieldConfig.position || typeof fieldConfig.position !== 'object') {
        errors.push(`Field ${fieldName} in schema ${index} must have position`);
      }

      if (typeof fieldConfig.width !== 'number' || typeof fieldConfig.height !== 'number') {
        errors.push(`Field ${fieldName} in schema ${index} must have valid width and height`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Create a blank pdfme template
 */
export function createBlankTemplate(): PdfmeTemplate {
  return {
    basePdf: 'BLANK_PDF',
    schemas: [
      {
        sampleField: {
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontSize: 12,
        },
      },
    ],
  };
}

/**
 * Safely import pdfme modules (client-side only)
 */
export async function importPdfme() {
  if (typeof window === 'undefined') {
    throw new Error('pdfme can only be imported on the client side');
  }

  const [
    { Designer },
    { generate },
    { text, image, table },
    { BLANK_PDF }
  ] = await Promise.all([
    import('@pdfme/ui'),
    import('@pdfme/generator'),
    import('@pdfme/schemas'),
    import('@pdfme/common')
  ]);

  return {
    Designer,
    generate,
    plugins: { text, image, table },
    BLANK_PDF
  };
}