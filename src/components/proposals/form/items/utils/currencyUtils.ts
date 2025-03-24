
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: {[key: string]: number}
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency (TRY) first
  const amountInTRY = amount * exchangeRates[fromCurrency];
  
  // Then convert from TRY to target currency
  return amountInTRY / exchangeRates[toCurrency];
};

// Format a number as currency
export const formatCurrencyValue = (amount: number, currency: string = "TRY"): string => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

// Get currency symbol
export const getCurrencySymbol = (currency: string = "TRY"): string => {
  const symbols: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };
  
  return symbols[currency] || currency;
};

// Get display name for currency with symbol
export const getCurrencyDisplayName = (currency: string = "TRY"): string => {
  const names: Record<string, string> = {
    TRY: "Türk Lirası (₺)",
    USD: "US Dollar ($)",
    EUR: "Euro (€)",
    GBP: "British Pound (£)"
  };
  
  return names[currency] || currency;
};

// Get a common list of currency options for select inputs
export const getCurrencyOptions = (): { value: string; label: string }[] => {
  return [
    { value: "TRY", label: "TRY (₺)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" }
  ];
};

// Calculate total price with tax
export const calculateTotalWithTax = (
  unitPrice: number,
  quantity: number,
  taxRate: number = 0,
  discountRate: number = 0
): number => {
  // Apply discount to unit price
  const discountedUnitPrice = unitPrice * (1 - discountRate / 100);
  
  // Calculate subtotal
  const subtotal = discountedUnitPrice * quantity;
  
  // Apply tax to subtotal
  return subtotal * (1 + taxRate / 100);
};
