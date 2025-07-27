import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useN8nTrigger } from '../../hooks/useN8nTrigger';
import { supabase } from '../../integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Eye
} from 'lucide-react';

interface WorkflowRun {
  id: string;
  workflow: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startTime: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
}

const WorkflowMonitor: React.FC = () => {
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { 
    loading: n8nLoading,
    fetchDailyInvoices,
    syncInvoiceStatus,
    downloadInvoicePdf,
    sendNotification
  } = useN8nTrigger();

  // Simulate workflow runs (in real app, this would come from n8n API or database)
  const loadWorkflowRuns = async () => {
    try {
      setLoading(true);
      
      // Get from localStorage for demo
      const saved = localStorage.getItem('n8n-workflow-runs');
      if (saved) {
        setWorkflowRuns(JSON.parse(saved));
      } else {
        // Initialize with some sample data
        const sampleRuns: WorkflowRun[] = [
          {
            id: '1',
            workflow: 'fetch_daily_invoices',
            status: 'success',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() - 3540000).toISOString(),
            duration: 60000,
            result: { invoicesProcessed: 15 }
          },
          {
            id: '2',
            workflow: 'sync_invoice_status',
            status: 'running',
            startTime: new Date(Date.now() - 300000).toISOString()
          }
        ];
        setWorkflowRuns(sampleRuns);
        localStorage.setItem('n8n-workflow-runs', JSON.stringify(sampleRuns));
      }
    } catch (error) {
      console.error('Error loading workflow runs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new workflow run
  const addWorkflowRun = (workflow: string) => {
    const newRun: WorkflowRun = {
      id: Date.now().toString(),
      workflow,
      status: 'running',
      startTime: new Date().toISOString()
    };
    
    const updatedRuns = [newRun, ...workflowRuns.slice(0, 19)]; // Keep last 20
    setWorkflowRuns(updatedRuns);
    localStorage.setItem('n8n-workflow-runs', JSON.stringify(updatedRuns));
  };

  // Trigger workflows with monitoring
  const triggerWithMonitoring = async (workflowName: string, triggerFn: () => Promise<any>) => {
    addWorkflowRun(workflowName);
    
    try {
      const result = await triggerFn();
      
      // Update run status to success
      setWorkflowRuns(prev => prev.map(run => 
        run.workflow === workflowName && run.status === 'running'
          ? {
              ...run,
              status: 'success',
              endTime: new Date().toISOString(),
              duration: Date.now() - new Date(run.startTime).getTime(),
              result
            }
          : run
      ));
      
    } catch (error: any) {
      // Update run status to error
      setWorkflowRuns(prev => prev.map(run => 
        run.workflow === workflowName && run.status === 'running'
          ? {
              ...run,
              status: 'error',
              endTime: new Date().toISOString(),
              duration: Date.now() - new Date(run.startTime).getTime(),
              error: error.message
            }
          : run
      ));
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      success: 'default',
      error: 'destructive',
      waiting: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'running' ? 'Çalışıyor' :
         status === 'success' ? 'Başarılı' :
         status === 'error' ? 'Hata' : 'Bekliyor'}
      </Badge>
    );
  };

  useEffect(() => {
    loadWorkflowRuns();
    
    // Auto refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadWorkflowRuns, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workflow İzleme
          </h3>
          <p className="text-muted-foreground">n8n workflow'larının durumunu takip edin</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Otomatik Yenile
          </Button>
          <Button onClick={loadWorkflowRuns} disabled={loading} size="sm" variant="outline">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Yenile
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Workflow Tetikleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => triggerWithMonitoring('fetch_daily_invoices', fetchDailyInvoices)}
              disabled={n8nLoading}
              size="sm"
            >
              Günlük Fatura Çekme
            </Button>
            <Button 
              onClick={() => triggerWithMonitoring('sync_invoice_status', () => syncInvoiceStatus([]))}
              disabled={n8nLoading}
              size="sm"
              variant="outline"
            >
              Durum Senkronizasyonu
            </Button>
            <Button 
              onClick={() => triggerWithMonitoring('send_notification', () => sendNotification('test', { message: 'Test bildirimi' }))}
              disabled={n8nLoading}
              size="sm"
              variant="outline"
            >
              Test Bildirimi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {workflowRuns.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Henüz workflow çalıştırılmamış. Yukarıdaki butonlarla test edebilirsiniz.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {workflowRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <div className="font-medium">{run.workflow}</div>
                      <div className="text-sm text-muted-foreground">
                        Başlatıldı: {formatTime(run.startTime)}
                        {run.duration && ` • Süre: ${formatDuration(run.duration)}`}
                      </div>
                      {run.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Hata: {run.error}
                        </div>
                      )}
                      {run.result && (
                        <div className="text-sm text-green-600 mt-1">
                          Sonuç: {JSON.stringify(run.result, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(run.status)}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowMonitor;