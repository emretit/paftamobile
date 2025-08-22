/**
 * useActiveProject Hook
 * 
 * Manages the currently active project for the authenticated user.
 * Handles project selection, creation, and membership validation.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export const useActiveProject = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('member');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      
      const { data: userProjects, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(role)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(userProjects || []);
      
      // Set active project to the most recently updated one
      if (userProjects && userProjects.length > 0) {
        const firstProject = userProjects[0];
        setActiveProject(firstProject);
        setUserRole(firstProject.project_members?.[0]?.role || 'member');
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast.success('Project created successfully');
      await loadProjects();
      setActiveProject(project);
      setUserRole('owner');
      
      return project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  };

  const switchProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
      
      // Get user role in this project
      const { data: member } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      setUserRole(member?.role || 'member');
    }
  };

  const hasWriteAccess = userRole === 'owner' || userRole === 'admin';

  return {
    activeProject,
    projects,
    isLoading,
    userRole,
    hasWriteAccess,
    createProject,
    switchProject,
    refreshProjects: loadProjects,
  };
};