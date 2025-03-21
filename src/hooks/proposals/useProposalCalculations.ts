
export const useProposalCalculations = () => {
  const calculateTotals = (items: any[]) => {
    let subtotal = 0;
    
    items.forEach(item => {
      const unitPrice = item.unit_price || 0;
      const quantity = item.quantity || 0;
      const taxRate = item.tax_rate || 0;
      
      const itemTotal = unitPrice * quantity * (1 + (taxRate / 100));
      subtotal += itemTotal;
    });
    
    return subtotal;
  };

  return {
    calculateTotals
  };
};
