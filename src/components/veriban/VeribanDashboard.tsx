import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useVeribanEInvoice } from '../../hooks/useVeribanEInvoice';
import { useN8nTrigger } from '../../hooks/useN8nTrigger';
import { supabase } from '../../integrations/supabase/client';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Building,
  CreditCard,
  Settings,
  Inbox,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  TrendingUp,
  ArrowRight,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalInvoices: number;
  todayInvoices: number;
  monthlyTotal: number;
  unreadInvoices: number;
  untransferredInvoices: number;
  lastSyncTime: string | null;
}

interface InvoiceFilter {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const VeribanDashboard: React.FC = () => {
  const {
    loading,
    error,
    login,
    getUnTransferredPurchaseInvoices,
    getPurchaseInvoiceDetailsFromUUIDs,
    getAllPurchaseInvoiceUUIDs,
    downloadPurchaseInvoice,
    markPurchaseInvoiceAsTransferred
  } = useVeribanEInvoice();

  const {
    loading: n8nLoading,
    error: n8nError,
    fetchDailyInvoices,
    syncInvoiceStatus,
    downloadInvoicePdf,
    sendNotification
  } = useN8nTrigger();

  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    todayInvoices: 0,
    monthlyTotal: 0,
    unreadInvoices: 0,
    untransferredInvoices: 0,
    lastSyncTime: null
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<InvoiceFilter>({
    search: '',
    status: 'all',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Load dashboard stats from database
  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Total invoices
      const { count: totalCount } = await supabase
        .from('veriban_incoming_invoices')
        .select('*', { count: 'exact', head: true });

      // Today's invoices
      const { count: todayCount } = await supabase
        .from('veriban_incoming_invoices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Monthly total amount
      const { data: monthlyData } = await supabase
        .from('veriban_incoming_invoices')
        .select('payable_amount')
        .gte('issue_time', monthStart);

      // Unread invoices
      const { count: unreadCount } = await supabase
        .from('veriban_incoming_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Untransferred invoices
      const { count: untransferredCount } = await supabase
        .from('veriban_incoming_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('is_transferred', false);

      const monthlyTotal = monthlyData?.reduce((sum, inv) => sum + (inv.payable_amount || 0), 0) || 0;

      setStats({
        totalInvoices: totalCount || 0,
        todayInvoices: todayCount || 0,
        monthlyTotal,
        unreadInvoices: unreadCount || 0,
        untransferredInvoices: untransferredCount || 0,
        lastSyncTime: localStorage.getItem('veriban_last_sync')
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load invoices with filters
  const loadInvoices = async () => {
    try {
      let query = supabase
        .from('veriban_incoming_invoices')
        .select('*');

      // Apply filters
      if (filter.search) {
        query = query.or(`invoice_number.ilike.%${filter.search}%,customer_title.ilike.%${filter.search}%,customer_register_number.ilike.%${filter.search}%`);
      }

      if (filter.status !== 'all') {
        if (filter.status === 'unread') {
          query = query.eq('is_read', false);
        } else if (filter.status === 'untransferred') {
          query = query.eq('is_transferred', false);
        } else if (filter.status === 'transferred') {
          query = query.eq('is_transferred', true);
        }
      }

      if (filter.dateFrom) {
        query = query.gte('issue_time', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('issue_time', filter.dateTo + 'T23:59:59');
      }

      // Sorting
      query = query.order(filter.sortBy, { ascending: filter.sortOrder === 'asc' });

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Error loading invoices:', error);
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Quick actions
  const handleQuickLogin = async () => {
    try {
      const result = await login();
      if (result) {
        setIsLoggedIn(true);
        localStorage.setItem('veriban_last_sync', new Date().toISOString());
        await loadStats();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleTodayInvoices = async () => {
    try {
      console.log('📅 Fetching today\'s invoices via n8n...');
      
      await fetchDailyInvoices();
      
      // Reload invoices after n8n processes them
      setTimeout(() => {
        loadStats();
        loadInvoices();
      }, 2000);
      
    } catch (error) {
      console.error('Error fetching today invoices:', error);
    }
  };

  const handleUntransferred = async () => {
    try {
      console.log('📋 Fetching untransferred invoices via n8n...');
      
      // Trigger n8n workflow to sync and get untransferred invoices
      await fetchDailyInvoices();
      
      // Reload invoices after n8n processes them
      setTimeout(() => {
        loadStats();
        loadInvoices();
      }, 2000);
      
    } catch (error) {
      console.error('Error fetching untransferred invoices:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedInvoices.length === 0) {
      alert('Lütfen işlem yapmak istediğiniz faturaları seçin');
      return;
    }

    switch (action) {
      case 'markTransferred':
        for (const uuid of selectedInvoices) {
          await markPurchaseInvoiceAsTransferred(uuid);
        }
        setSelectedInvoices([]);
        await loadStats();
        await loadInvoices();
        break;
      case 'download':
        for (const uuid of selectedInvoices) {
          await downloadPurchaseInvoice(uuid);
        }
        break;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  useEffect(() => {
    loadStats();
    loadInvoices();
  }, [filter, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veriban E-Fatura Dashboard</h1>
          <p className="text-muted-foreground">Gelen e-faturaları yönetin ve takip edin</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleQuickLogin} disabled={loading} size="sm" variant="outline">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Hızlı Bağlan
          </Button>
          <Button onClick={() => setAutoSyncEnabled(!autoSyncEnabled)} size="sm" variant={autoSyncEnabled ? "default" : "outline"}>
            <Settings className="h-4 w-4 mr-2" />
            Otomatik Senkron
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isLoggedIn ? 'Veriban Bağlantısı Aktif' : 'Veriban Bağlantısı Yok'}
              </span>
              {stats.lastSyncTime && (
                <span className="text-sm text-muted-foreground">
                  Son senkron: {formatDateTime(stats.lastSyncTime)}
                </span>
              )}
            </div>
            <Badge variant={isLoggedIn ? "default" : "secondary"}>
              {isLoggedIn ? "Bağlı" : "Bağlı Değil"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadInvoices()}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Toplam Fatura</p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleTodayInvoices}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bugün Gelen</p>
                <p className="text-2xl font-bold">{stats.todayInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bu Ay Toplam</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Okunmamış</p>
                <p className="text-2xl font-bold">{stats.unreadInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleUntransferred}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Transfer Edilmemiş</p>
                <p className="text-2xl font-bold">{stats.untransferredInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Hızlı Eylemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTodayInvoices} disabled={loading || n8nLoading} className="gap-2">
              <Calendar className="h-4 w-4" />
              {(loading || n8nLoading) ? "n8n ile Getiriliyor..." : "Bugün Gelen Faturaları Çek (n8n)"}
            </Button>
            <Button onClick={handleUntransferred} disabled={loading || n8nLoading} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {(loading || n8nLoading) ? "n8n ile Getiriliyor..." : "Transfer Edilmemişleri Getir (n8n)"}
            </Button>
            <Button onClick={() => window.open('/veriban-invoices', '_blank')} variant="secondary" className="gap-2">
              <Eye className="h-4 w-4" />
              Tüm Faturaları Görüntüle
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtreler
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Gizle' : 'Göster'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Arama</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Fatura no, firma adı..."
                    value={filter.search}
                    onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="unread">Okunmamış</SelectItem>
                    <SelectItem value="untransferred">Transfer Edilmemiş</SelectItem>
                    <SelectItem value="transferred">Transfer Edilmiş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bulk Actions */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedInvoices.length} fatura seçildi
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('markTransferred')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Transfer Edildi İşaretle
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('download')}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedInvoices([])}>
                  Seçimi Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Fatura Listesi ({invoices.length})
            </div>
            <Button onClick={() => loadInvoices()} disabled={loading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-12">
                      <Checkbox
                        checked={selectedInvoices.length === invoices.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInvoices(invoices.map(inv => inv.invoice_uuid));
                          } else {
                            setSelectedInvoices([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Durum</th>
                    <th className="text-left p-3 font-medium">Fatura No</th>
                    <th className="text-left p-3 font-medium">Tarih</th>
                    <th className="text-left p-3 font-medium">Gönderen</th>
                    <th className="text-left p-3 font-medium">Tutar</th>
                    <th className="text-left p-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.invoice_uuid)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInvoices(prev => [...prev, invoice.invoice_uuid]);
                            } else {
                              setSelectedInvoices(prev => prev.filter(id => id !== invoice.invoice_uuid));
                            }
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {!invoice.is_read && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Yeni"></span>
                          )}
                          <Badge variant={invoice.is_transferred ? "default" : "secondary"}>
                            {invoice.is_transferred ? "Transfer Edildi" : "Bekliyor"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{invoice.invoice_number || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.invoice_profile || 'TEMELFATURA'}
                        </div>
                      </td>
                      <td className="p-3">
                        {formatDate(invoice.issue_time)}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{invoice.customer_title || 'Bilinmeyen'}</div>
                        <div className="text-xs text-muted-foreground">
                          VKN: {invoice.customer_register_number || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {formatCurrency(invoice.payable_amount || 0, invoice.currency_code || 'TRY')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadPurchaseInvoice(invoice.invoice_uuid)}
                            disabled={loading}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {!invoice.is_transferred && (
                            <Button 
                              size="sm" 
                              onClick={() => markPurchaseInvoiceAsTransferred(invoice.invoice_uuid)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz fatura bulunmuyor</p>
              <p className="text-sm">Veriban'dan fatura çekmek için yukarıdaki hızlı eylemlerden birini kullanın</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>İşlem devam ediyor...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VeribanDashboard;