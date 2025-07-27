import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  FileText, 
  RefreshCw, 
  Filter,
  Download,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface LogEntry {
  id: string;
  timestamp: Date;
  workflow: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  executionId?: string;
}

const N8nLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      workflow: 'fetch_daily_invoices',
      level: 'success',
      message: 'Günlük faturalar başarıyla çekildi - 15 adet fatura bulundu',
      executionId: 'exec_12345'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      workflow: 'sync_invoice_status',
      level: 'info',
      message: 'Fatura durum senkronizasyonu başlatıldı',
      executionId: 'exec_12344'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      workflow: 'download_invoice_pdf',
      level: 'error',
      message: 'PDF indirme başarısız - Bağlantı zaman aşımı',
      details: { invoiceId: 'INV-2024-001', error: 'Connection timeout' },
      executionId: 'exec_12343'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      workflow: 'send_notification',
      level: 'warning',
      message: 'Bildirim gönderildi ancak bazı alıcılara ulaşılamadı',
      executionId: 'exec_12342'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      workflow: 'fetch_daily_invoices',
      level: 'success',
      message: 'Otomatik günlük fatura çekme tamamlandı - 8 adet fatura',
      executionId: 'exec_12341'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const levelIcons = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />
  };

  const levelColors = {
    info: 'default',
    success: 'default',
    warning: 'secondary',
    error: 'destructive'
  } as const;

  const workflowNames = {
    fetch_daily_invoices: 'Günlük Fatura Çekme',
    sync_invoice_status: 'Durum Senkronizasyonu',
    download_invoice_pdf: 'PDF İndirme',
    send_notification: 'Bildirim Gönderme'
  };

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.workflow.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Workflow filter
    if (workflowFilter !== 'all') {
      filtered = filtered.filter(log => log.workflow === workflowFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, workflowFilter]);

  const refreshLogs = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      workflow: log.workflow,
      level: log.level,
      message: log.message,
      executionId: log.executionId,
      details: log.details
    }));

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            n8n Execution Logs
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={refreshLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Log ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Seviye" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Workflow'lar</SelectItem>
              <SelectItem value="fetch_daily_invoices">Günlük Fatura Çekme</SelectItem>
              <SelectItem value="sync_invoice_status">Durum Senkronizasyonu</SelectItem>
              <SelectItem value="download_invoice_pdf">PDF İndirme</SelectItem>
              <SelectItem value="send_notification">Bildirim Gönderme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {levelIcons[log.level]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={levelColors[log.level]} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {workflowNames[log.workflow as keyof typeof workflowNames]}
                        </span>
                        {log.executionId && (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {log.executionId}
                          </code>
                        )}
                      </div>
                      <p className="text-sm text-foreground mb-1">{log.message}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(log.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Detayları göster
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Filtrelerinize uygun log bulunamadı</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Stats */}
        <div className="flex justify-between items-center pt-2 border-t text-sm text-muted-foreground">
          <span>{filteredLogs.length} log gösteriliyor</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {logs.filter(l => l.level === 'success').length} başarılı
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {logs.filter(l => l.level === 'error').length} hata
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nLogViewer;