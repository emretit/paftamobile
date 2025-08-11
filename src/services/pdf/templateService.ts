/**
 * Template Service
 * 
 * Handles CRUD operations for PDF templates in Supabase
 */

import { supabase } from '../../lib/supabaseClient';
import type { PdfTemplate, FieldMapping } from '../../lib/pdf/types';

export class TemplateService {
  /**
   * Get all templates for the current user
   */
  static async getTemplates(projectId?: string): Promise<PdfTemplate[]> {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(id: string): Promise<PdfTemplate | null> {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new template
   */
  static async createTemplate(
    templateData: any
  ): Promise<PdfTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pdf_templates')
      .insert({
        ...templateData,
        created_by: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(
    id: string,
    updates: Partial<Pick<PdfTemplate, 'name' | 'description' | 'template_json'>>
  ): Promise<PdfTemplate> {
    const { data, error } = await supabase
      .from('pdf_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update field mapping for a template
   */
  static async updateFieldMapping(
    id: string,
    fieldMapping: FieldMapping
  ): Promise<PdfTemplate> {
    const { data, error } = await supabase
      .from('pdf_templates')
      .update({ field_mapping_json: fieldMapping })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('pdf_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Upload font file to storage
   */
  static async uploadFont(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('pdf-fonts')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('pdf-fonts')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload base PDF file to storage
   */
  static async uploadBasePdf(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('pdf-templates')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('pdf-templates')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Get available fonts from storage
   */
  static async getAvailableFonts(): Promise<Array<{ name: string; url: string }>> {
    const { data, error } = await supabase.storage
      .from('pdf-fonts')
      .list();

    if (error) throw error;

    return (data || []).map(file => ({
      name: file.name,
      url: supabase.storage.from('pdf-fonts').getPublicUrl(file.name).data.publicUrl
    }));
  }
}