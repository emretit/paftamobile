
/**
 * Utility functions for formatting values
 */

/**
 * Format a currency value with proper currency symbol
 */
export const formatCurrency = (value: number, currency: string = 'TRY'): string => {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  } catch (error) {
    // Fallback in case of invalid currency code
    return `${value.toFixed(2)} ${currency}`;
  }
};

/**
 * Format a number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('tr-TR').format(value);
};

/**
 * Format a date to locale string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR');
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('tr-TR');
};

/**
 * Format a percentage value
 */
export const formatPercent = (value: number): string => {
  return `%${value.toFixed(2)}`;
};

/**
 * Format a phone number in Turkish format
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format the phone number
  if (cleaned.length === 10) {
    // Format as: (555) 123 45 67
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  }
  
  // Return original if format doesn't match
  return phone;
};
