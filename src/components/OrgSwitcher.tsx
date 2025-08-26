import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../hooks/use-toast'
import { Building2, ChevronDown } from 'lucide-react'

interface UserOrg {
  org_id: string
  org_name: string
  role: string
}

interface UserPrefs {
  current_org_id: string
}

const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'bg-primary text-primary-foreground'
    case 'admin':
      return 'bg-orange-500 text-white'
    case 'member':
      return 'bg-blue-500 text-white'
    case 'viewer':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export default function OrgSwitcher() {
  const { userId, getClient, loading } = useAuth()
  const { toast } = useToast()
  
  const [orgs, setOrgs] = useState<UserOrg[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch organizations and current preference
  useEffect(() => {
    if (!userId || loading) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const client = getClient()

        // Fetch user's organizations
        const { data: orgsData, error: orgsError } = await client
          .from('v_user_orgs')
          .select('org_id, org_name, role')
          .eq('user_id', userId)
          .order('org_name', { ascending: true })

        if (orgsError) {
          if (orgsError.code === 'PGRST116' || orgsError.message?.includes('401') || orgsError.message?.includes('403')) {
            throw new Error('RLS engeli')
          }
          throw new Error(orgsError.message || 'Organizasyonlar yüklenirken hata oluştu')
        }

        setOrgs(orgsData || [])

        // Fetch current org preference
        const { data: prefData } = await client
          .from('user_prefs')
          .select('current_org_id')
          .eq('user_id', userId)
          .maybeSingle()

        const preferredOrgId = prefData?.current_org_id
        
        // Set current org (either from preference or first available org)
        if (preferredOrgId && orgsData?.some(org => org.org_id === preferredOrgId)) {
          setCurrentOrgId(preferredOrgId)
        } else if (orgsData && orgsData.length > 0) {
          setCurrentOrgId(orgsData[0].org_id)
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen hata oluştu'
        setError(errorMessage)
        
        if (errorMessage === 'RLS engeli') {
          toast({
            title: "Erişim Engeli",
            description: "RLS engeli - Organizasyonlara erişim izniniz yok",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Hata",
            description: errorMessage,
            variant: "destructive"
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, loading, getClient, toast])

  // Handle organization change
  const handleOrgChange = async (newOrgId: string) => {
    if (!userId || newOrgId === currentOrgId) return

    try {
      const client = getClient()
      
      const { error } = await client
        .from('user_prefs')
        .upsert({
          user_id: userId,
          current_org_id: newOrgId
        })

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error('RLS engeli')
        }
        throw new Error(error.message || 'Organizasyon değiştirilirken hata oluştu')
      }

      setCurrentOrgId(newOrgId)
      
      const selectedOrg = orgs.find(org => org.org_id === newOrgId)
      toast({
        title: "Organizasyon Değiştirildi",
        description: `${selectedOrg?.org_name} organizasyonuna geçildi`
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen hata oluştu'
      
      if (errorMessage === 'RLS engeli') {
        toast({
          title: "Erişim Engeli", 
          description: "RLS engeli - Organizasyon değiştirme izniniz yok",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }
  }

  // Show disabled select while loading or no user
  if (loading || !userId) {
    return (
      <div className="relative">
        <select 
          disabled 
          className="appearance-none bg-muted text-muted-foreground px-3 py-2 pr-8 rounded-md border border-border cursor-not-allowed"
        >
          <option>Yükleniyor...</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    )
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Hata</span>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative">
        <select 
          disabled 
          className="appearance-none bg-muted text-muted-foreground px-3 py-2 pr-8 rounded-md border border-border cursor-not-allowed"
        >
          <option>Yükleniyor...</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    )
  }

  // Show empty state
  if (orgs.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-md border border-border">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Organizasyon yok</span>
      </div>
    )
  }

  const currentOrg = orgs.find(org => org.org_id === currentOrgId)

  return (
    <div className="relative">
      <select
        value={currentOrgId}
        onChange={(e) => handleOrgChange(e.target.value)}
        className="appearance-none bg-card text-foreground px-3 py-2 pr-8 rounded-md border border-border hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer min-w-[200px]"
      >
        {orgs.map((org) => (
          <option key={org.org_id} value={org.org_id}>
            {org.org_name}
          </option>
        ))}
      </select>
      
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      
      {/* Role badge */}
      {currentOrg && (
        <div className="absolute -right-2 -top-1">
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getRoleBadgeColor(currentOrg.role)}`}>
            {currentOrg.role}
          </span>
        </div>
      )}
    </div>
  )
}