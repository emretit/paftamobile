/**
 * useTemplates Hook
 * 
 * Manages PDF templates for the active project.
 * Handles CRUD operations and template validation.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useActiveProject } from './useActiveProject';

export interface Template {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  template_json: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useTemplates = () => {
  const { activeProject } = useActiveProject();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeProject) {
      loadTemplates();
    }
  }, [activeProject]);

  const loadTemplates = async () => {
    if (!activeProject) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (name: string, templateJson: any) => {
    if (!activeProject) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('templates')
        .insert({
          project_id: activeProject.id,
          user_id: user.id,
          name,
          template_json: templateJson,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template created successfully');
      await loadTemplates();
      return data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Template updated successfully');
      await loadTemplates();
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template deleted successfully');
      await loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      throw error;
    }
  };

  const setDefaultTemplate = async (id: string) => {
    if (!activeProject) return;

    try {
      // Remove default from all templates in project
      await supabase
        .from('templates')
        .update({ is_default: false })
        .eq('project_id', activeProject.id);

      // Set new default
      await supabase
        .from('templates')
        .update({ is_default: true })
        .eq('id', id);

      toast.success('Default template updated');
      await loadTemplates();
    } catch (error: any) {
      console.error('Error setting default template:', error);
      toast.error('Failed to set default template');
    }
  };

  const duplicateTemplate = async (template: Template) => {
    return createTemplate(
      `${template.name} (Copy)`,
      template.template_json
    );
  };

  const defaultTemplate = templates.find(t => t.is_default) || templates[0];

  return {
    templates,
    isLoading,
    defaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    duplicateTemplate,
    refreshTemplates: loadTemplates,
  };
};