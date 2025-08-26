import React, { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, AlertCircle, Building2 } from 'lucide-react'

interface UserPrefs {
  current_org_id: string | null
}

export default function NewExampleItem() {
  const { userId, getClient } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [title, setTitle] = useState('')
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load current organization on mount
  useEffect(() => {
    if (!userId) return

    const loadCurrentOrg = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const client = getClient()
        const { data: pref } = await client
          .from('user_prefs')
          .select('current_org_id')
          .eq('user_id', userId)
          .maybeSingle()

        setCurrentOrgId(pref?.current_org_id || null)
      } catch (err) {
        console.error('Error loading current org:', err)
        setError('Organizasyon bilgisi yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    loadCurrentOrg()
  }, [userId, getClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Başlık alanı zorunludur",
        variant: "destructive"
      })
      return
    }

    if (title.trim().length < 3) {
      toast({
        title: "Hata", 
        description: "Başlık en az 3 karakter olmalıdır",
        variant: "destructive"
      })
      return
    }

    if (!currentOrgId) {
      toast({
        title: "Organizasyon Seçilmedi",
        description: "Önce organizasyon seçin",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      
      const client = getClient()
      const { data, error: insertError } = await client
        .from('example_items')
        .insert([{
          org_id: currentOrgId,
          title: title.trim(),
          created_by: userId
        }])
        .select('id')
        .single()

      if (insertError) {
        // Handle specific error types
        if (insertError.code === 'PGRST116' || insertError.message?.includes('401') || insertError.message?.includes('403')) {
          throw new Error('RLS/rol engeli')
        }
        
        if (insertError.code === '23503') {
          throw new Error('FK hatası - Geçersiz organizasyon veya kullanıcı referansı')
        }
        
        if (insertError.code === '23505') {
          throw new Error('Unique kısıtlaması - Bu kayıt zaten mevcut')
        }
        
        throw new Error(insertError.message || 'Kayıt oluşturulurken hata oluştu')
      }

      toast({
        title: "Başarılı",
        description: "Kayıt başarıyla oluşturuldu"
      })

      // Navigate back to list
      navigate('/example-items')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen hata oluştu'
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/example-items')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Yeni Example Item</CardTitle>
              <CardDescription>
                RLS testi için yeni kayıt oluştur
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Organization Status */}
          <div className="mb-4 p-3 rounded-md bg-muted">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentOrgId ? 'Organizasyon seçili' : 'Organizasyon seçilmedi'}
              </span>
            </div>
            {!currentOrgId && (
              <p className="text-sm text-muted-foreground mt-1">
                Önce üst menüden bir organizasyon seçin
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kayıt başlığını girin (min 3 karakter)"
                required
                minLength={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={submitting || !currentOrgId || !title.trim() || title.trim().length < 3}
                className="flex-1"
              >
                {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}