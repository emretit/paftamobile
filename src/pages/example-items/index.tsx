import React from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, AlertCircle } from 'lucide-react'

interface ExampleItem {
  id: string
  title: string
  created_at: string
}

export default function ExampleItemsList() {
  const { userId, getClient } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [items, setItems] = React.useState<ExampleItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId) return

    const fetchItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const client = getClient()
        const { data, error: fetchError } = await client
          .from('example_items')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })

        if (fetchError) {
          if (fetchError.code === 'PGRST116' || fetchError.message?.includes('401') || fetchError.message?.includes('403')) {
            throw new Error('Yetkin yok (RLS)')
          }
          throw new Error(fetchError.message || 'Veriler yüklenirken hata oluştu')
        }

        setItems(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen hata oluştu'
        setError(errorMessage)
        
        if (errorMessage === 'Yetkin yok (RLS)') {
          toast({
            title: "Erişim Engeli",
            description: "Yetkin yok (RLS) - Bu verilere erişim izniniz bulunmuyor",
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
        setLoading(false)
      }
    }

    fetchItems()
  }, [userId, getClient, toast])

  const handleNewItem = () => {
    navigate('/example-items/new')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Example Items</CardTitle>
              <CardDescription>
                RLS testi için örnek kayıtlar
              </CardDescription>
            </div>
            <Button onClick={handleNewItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Kayıt
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz kayıt bulunmuyor</p>
              <Button 
                variant="outline" 
                onClick={handleNewItem}
                className="mt-4"
              >
                İlk kaydı oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Oluşturulma Tarihi</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {item.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}