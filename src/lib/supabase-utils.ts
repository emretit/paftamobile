// Utility to safely handle Supabase query results
export function safeSupabaseResult<T>(data: any): T[] {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [];
  }
  return data as T[];
}

export function safeSupabaseSingle<T>(data: any): T | null {
  if (!data) {
    return null;
  }
  return data as T;
}

// Type guard to check if data is an error
export function isSupabaseError(data: any): boolean {
  return data && typeof data === 'object' && 'error' in data && data.error === true;
}