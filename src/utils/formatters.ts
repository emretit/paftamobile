
/**
 * Format a date string to a localized format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date string to a short format (DD.MM.YYYY)
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatShortDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency Currency code (default: TRY)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as percentage
 * @param value Number to format
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Format a number with thousands separator
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('tr-TR').format(value);
};

/**
 * Truncate a string to a maximum length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize the first letter of a string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};
