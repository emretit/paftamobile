import React from 'react'
import { Building2, User } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export default function HeaderUserInfo() {
  const { userData, loading: userLoading } = useCurrentUser()
  
  const { data: companyData, isLoading: companyLoading } = useQuery({
    queryKey: ['company', userData?.company_id],
    queryFn: async () => {
      if (!userData?.company_id) return null
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', userData.company_id)
        .eq('is_active', true)
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching company:', error)
        return null
      }
      
      return data
    },
    enabled: !!userData?.company_id,
  })

  if (userLoading || companyLoading) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* User Info */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {userData?.full_name || 'Kullanıcı'}
        </span>
      </div>
      
      {/* Company Info */}
      {companyData && (
        <>
          <div className="text-muted-foreground">•</div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {companyData.name}
            </span>
          </div>
        </>
      )}
    </div>
  )
}