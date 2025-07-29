
import { ProposalItem } from "./proposal";

export interface TemplateDesignSettings {
  // Page Settings
  pageSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Header Settings
  header: {
    enabled: boolean;
    height: number;
    logoPosition: 'left' | 'center' | 'right';
    logoSize: 'small' | 'medium' | 'large';
    showCompanyInfo: boolean;
    backgroundColor: string;
    textColor: string;
  };
  
  // Footer Settings
  footer: {
    enabled: boolean;
    height: number;
    showPageNumbers: boolean;
    showContactInfo: boolean;
    backgroundColor: string;
    textColor: string;
  };
  
  // Colors & Typography
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      title: number;
      heading: number;
      body: number;
      small: number;
    };
  };
  
  // Table Settings
  table: {
    headerBackground: string;
    headerText: string;
    rowAlternating: boolean;
    borderColor: string;
    borderWidth: number;
  };
  
  // Layout Settings
  layout: {
    spacing: 'compact' | 'normal' | 'spacious';
    showBorders: boolean;
    roundedCorners: boolean;
    shadowEnabled: boolean;
  };
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  templateType: string;
  templateFeatures: string[];
  items: ProposalItem[];
  designSettings?: TemplateDesignSettings;
  prefilledFields?: {
    title?: string;
    validityDays?: number;
    paymentTerm?: string;
    internalNotes?: string;
  };
}
