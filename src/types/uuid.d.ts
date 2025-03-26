
declare module 'uuid' {
  export function v4(): string;
  export function v4(options: any): string;
  export function v4(options: any, buffer: any, offset?: number): Buffer;
}

declare module 'moment' {
  const moment: any;
  export default moment;
}

declare module 'xlsx' {
  export const utils: {
    json_to_sheet: (data: any[]) => any;
    book_new: () => any;
    book_append_sheet: (workbook: any, worksheet: any, name: string) => void;
  };
  export function writeFile(workbook: any, filename: string): void;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    setFontSize(size: number): this;
    text(text: string, x: number, y: number, options?: any): this;
    addPage(format?: string, orientation?: string): this;
    line(x1: number, y1: number, x2: number, y2: number): this;
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    theme?: string;
    styles?: any;
    headerStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    margin?: any;
  }
  
  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  export default autoTable;
}
