/**
 * Build Inputs Service
 * 
 * Transforms database data into pdfme inputs using field mapping and computed fields
 */

import type { FieldMapping, ExportData } from '../../lib/pdf/types';

export interface ComputedFieldContext {
  data: ExportData;
  fieldName: string;
  mapping: FieldMapping[string];
}

/**
 * Apply field mapping to transform database data into pdfme inputs
 */
export function applyMapping(
  data: ExportData,
  mapping: FieldMapping
): Record<string, any> {
  const inputs: Record<string, any> = {};

  Object.entries(mapping).forEach(([fieldName, fieldConfig]) => {
    try {
      let value = extractValue(data, fieldConfig.table, fieldConfig.column);

      // Apply type-specific formatting
      switch (fieldConfig.type) {
        case 'date':
          value = formatDate(value, fieldConfig.format);
          break;
        case 'currency':
          value = formatCurrency(value, fieldConfig.format);
          break;
        case 'number':
          value = formatNumber(value, fieldConfig.format);
          break;
        case 'computed':
          value = computeField({ data, fieldName, mapping: fieldConfig });
          break;
        default:
          value = String(value || '');
      }

      inputs[fieldName] = value;
    } catch (error) {
      console.warn(`Error processing field ${fieldName}:`, error);
      inputs[fieldName] = '';
    }
  });

  return inputs;
}

/**
 * Extract value from nested object using table.column path
 */
function extractValue(data: ExportData, table: string, column: string): any {
  if (!data || !table || !column) return null;

  // Handle nested paths like 'customer.name' or 'items[0].price'
  const path = `${table}.${column}`;
  return getNestedValue(data, path);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return null;
    
    // Handle array notation like items[0]
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      return current[arrayKey]?.[parseInt(index)];
    }
    
    return current[key];
  }, obj);
}

/**
 * Format date values
 */
function formatDate(value: any, format: string = 'YYYY-MM-DD'): string {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);

  // Simple date formatting
  switch (format) {
    case 'DD/MM/YYYY':
      return date.toLocaleDateString('tr-TR');
    case 'MM/DD/YYYY':
      return date.toLocaleDateString('en-US');
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Format currency values
 */
function formatCurrency(value: any, format: string = 'USD'): string {
  if (value === null || value === undefined) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) return String(value);

  // Extract currency code and locale from format
  const [currency = 'USD', locale = 'en-US'] = format.split(':');

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(numValue);
  } catch (error) {
    return `${currency} ${numValue.toFixed(2)}`;
  }
}

/**
 * Format number values
 */
function formatNumber(value: any, format: string = '0'): string {
  if (value === null || value === undefined) return '';

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) return String(value);

  // Simple number formatting
  const decimals = parseInt(format) || 0;
  return numValue.toFixed(decimals);
}

/**
 * Compute dynamic fields based on formulas
 */
function computeField(context: ComputedFieldContext): any {
  const { data, fieldName, mapping } = context;
  
  if (!mapping.computation) return '';

  try {
    // Simple computation engine - extend as needed
    const computation = mapping.computation;

    // Handle common computations
    if (computation === 'current_date') {
      return new Date().toLocaleDateString();
    }

    if (computation === 'current_datetime') {
      return new Date().toLocaleString();
    }

    if (computation.startsWith('sum:')) {
      const arrayPath = computation.replace('sum:', '');
      const arrayData = getNestedValue(data, arrayPath);
      if (Array.isArray(arrayData)) {
        return arrayData.reduce((sum, item) => sum + (parseFloat(item) || 0), 0);
      }
    }

    if (computation.startsWith('count:')) {
      const arrayPath = computation.replace('count:', '');
      const arrayData = getNestedValue(data, arrayPath);
      return Array.isArray(arrayData) ? arrayData.length : 0;
    }

    if (computation.startsWith('concat:')) {
      const fields = computation.replace('concat:', '').split(',');
      return fields.map(field => getNestedValue(data, field.trim())).join(' ');
    }

    // Fallback: return as is
    return computation;
  } catch (error) {
    console.warn(`Error computing field ${fieldName}:`, error);
    return '';
  }
}

/**
 * Build sample inputs for template preview
 */
export function buildSampleInputs(mapping: FieldMapping): Record<string, any> {
  const sampleData = {
    customer: {
      name: 'Sample Customer',
      email: 'customer@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345'
    },
    offer: {
      number: 'OFF-2024-001',
      date: new Date().toISOString(),
      total: 1250.00,
      tax: 225.00,
      subtotal: 1025.00,
      notes: 'Sample offer notes'
    },
    items: [
      { name: 'Product A', quantity: 2, price: 500, total: 1000 },
      { name: 'Service B', quantity: 1, price: 250, total: 250 }
    ],
    company: {
      name: 'Your Company',
      address: '456 Business Ave, City, State 67890',
      phone: '+1 (555) 987-6543',
      email: 'info@company.com'
    }
  };

  return applyMapping(sampleData, mapping);
}