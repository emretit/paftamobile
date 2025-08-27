import React, { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '../hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Building2, ChevronDown } from 'lucide-react'

interface UserCompany {
  id: string
  name: string
  role: string
}

interface UserPrefs {
  current_company_id: string
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
  const { user, loading } = useAuth()
  const { toast } = useToast()
  
  const [companies, setCompanies] = useState<UserCompany[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch companies and current preference
  useEffect(() => {
    if (!user?.id || loading) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get user's current company from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          throw new Error(profileError.message || 'Profil bilgileri yüklenirken hata oluştu')
        }

        if (!profileData?.company_id) {
          throw new Error('Kullanıcının şirketi bulunamadı')
        }

        // Fetch user's company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', profileData.company_id)
          .eq('is_active', true)
          .maybeSingle()

        if (companyError) {
          throw new Error(companyError.message || 'Şirket bilgileri yüklenirken hata oluştu')
        }

        if (companyData) {
          const userCompany: UserCompany = {
            id: companyData.id,
            name: companyData.name,
            role: 'owner' // Default role since they're part of the company
          }
          setCompanies([userCompany])
          setCurrentCompanyId(companyData.id)
        } else {
          setCompanies([])
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen hata oluştu'
        setError(errorMessage)

        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id, loading, toast])

  // Handle company change (currently just one company, but keeping for future multi-company support)
  const handleCompanyChange = async (newCompanyId: string) => {
    if (!user?.id || newCompanyId === currentCompanyId) return
    setCurrentCompanyId(newCompanyId)

    const selectedCompany = companies.find(company => company.id === newCompanyId)
    toast({
      title: "Şirket Seçildi",
      description: `${selectedCompany?.name} şirketine geçildi`
    })
  }

  // Show disabled select while loading or no user
  if (loading || !user?.id) {
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
  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-md border border-border">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Şirket yok</span>
      </div>
    )
  }

  const currentCompany = companies.find(company => company.id === currentCompanyId)

  return (
    <div className="relative">
      <select
        value={currentCompanyId}
        onChange={(e) => handleCompanyChange(e.target.value)}
        className="appearance-none bg-card text-foreground px-3 py-2 pr-8 rounded-md border border-border hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer min-w-[200px]"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
      
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      
      {/* Role badge */}
      {currentCompany && (
        <div className="absolute -right-2 -top-1">
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getRoleBadgeColor(currentCompany.role)}`}>
            {currentCompany.role}
          </span>
        </div>
      )}
    </div>
  )
}