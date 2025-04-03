
/**
 * Capitalizes the first letter of a string
 * @param string The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};
