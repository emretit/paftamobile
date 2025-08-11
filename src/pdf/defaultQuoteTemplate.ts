/**
 * Default Quote Template
 * 
 * Provides a standard PDF template configuration for quotations.
 * Uses A4 page format with proper margins and layout sections.
 */

export const createDefaultQuoteTemplate = () => {
  return {
    basePdf: "BLANK_PDF",
    schemas: [
      {
        // Header section
        companyName: {
          type: "text",
          position: { x: 20, y: 20 },
          width: 150,
          height: 12,
          fontSize: 16,
          fontWeight: "bold",
          content: ""
        },
        companyAddress: {
          type: "text",
          position: { x: 20, y: 35 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },
        companyPhone: {
          type: "text",
          position: { x: 20, y: 45 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },
        companyEmail: {
          type: "text",
          position: { x: 20, y: 55 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },

        // Quote info (top right)
        quoteTitle: {
          type: "text",
          position: { x: 350, y: 20 },
          width: 150,
          height: 12,
          fontSize: 18,
          fontWeight: "bold",
          content: "QUOTATION"
        },
        quoteNumber: {
          type: "text",
          position: { x: 350, y: 35 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },
        quoteDate: {
          type: "text",
          position: { x: 350, y: 45 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },
        validUntil: {
          type: "text",
          position: { x: 350, y: 55 },
          width: 150,
          height: 8,
          fontSize: 10,
          content: ""
        },

        // Customer section
        customerLabel: {
          type: "text",
          position: { x: 20, y: 80 },
          width: 100,
          height: 10,
          fontSize: 12,
          fontWeight: "bold",
          content: "Bill To:"
        },
        customerName: {
          type: "text",
          position: { x: 20, y: 95 },
          width: 200,
          height: 10,
          fontSize: 11,
          content: ""
        },
        customerCompany: {
          type: "text",
          position: { x: 20, y: 105 },
          width: 200,
          height: 8,
          fontSize: 10,
          content: ""
        },
        customerEmail: {
          type: "text",
          position: { x: 20, y: 115 },
          width: 200,
          height: 8,
          fontSize: 10,
          content: ""
        },

        // Items table
        itemsTable: {
          type: "table",
          position: { x: 20, y: 140 },
          width: 480,
          height: 150,
          content: [],
          head: [["Description", "Qty", "Unit Price", "Total"]],
          tableStyles: {
            cellPadding: 3,
            fontSize: 10,
            headerBackgroundColor: "#f5f5f5"
          }
        },

        // Totals section (bottom right)
        subtotalLabel: {
          type: "text",
          position: { x: 350, y: 310 },
          width: 80,
          height: 8,
          fontSize: 10,
          fontWeight: "bold",
          content: "Subtotal:"
        },
        subtotalAmount: {
          type: "text",
          position: { x: 440, y: 310 },
          width: 60,
          height: 8,
          fontSize: 10,
          textAlign: "right",
          content: ""
        },
        taxLabel: {
          type: "text",
          position: { x: 350, y: 325 },
          width: 80,
          height: 8,
          fontSize: 10,
          fontWeight: "bold",
          content: "Tax:"
        },
        taxAmount: {
          type: "text",
          position: { x: 440, y: 325 },
          width: 60,
          height: 8,
          fontSize: 10,
          textAlign: "right",
          content: ""
        },
        totalLabel: {
          type: "text",
          position: { x: 350, y: 345 },
          width: 80,
          height: 10,
          fontSize: 12,
          fontWeight: "bold",
          content: "Total:"
        },
        totalAmount: {
          type: "text",
          position: { x: 440, y: 345 },
          width: 60,
          height: 10,
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "right",
          content: ""
        },

        // Footer section
        terms: {
          type: "text",
          position: { x: 20, y: 380 },
          width: 480,
          height: 40,
          fontSize: 9,
          content: "Terms and Conditions:\n\nPayment is due within 30 days of invoice date.\nLate payments may be subject to fees.\nGoods remain the property of the seller until payment is received in full."
        },

        // Footer
        footer: {
          type: "text",
          position: { x: 20, y: 750 },
          width: 480,
          height: 8,
          fontSize: 8,
          textAlign: "center",
          content: "Thank you for your business!"
        }
      }
    ]
  };
};

// Sample template with realistic styling
export const sampleQuoteTemplate = createDefaultQuoteTemplate();