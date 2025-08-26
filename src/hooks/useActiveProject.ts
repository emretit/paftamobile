import { useAuthState } from '../components/navbar/useAuthState';

export const useActiveProject = () => {
  const { user, loading } = useAuthState();
  
  // In our custom auth system, we use company_id as the project identifier
  const activeProject = user?.user_metadata?.company_id || user?.id || null;
  
  return {
    activeProject,
    isLoading: loading
  };
};