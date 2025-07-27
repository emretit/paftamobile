import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { useN8nTrigger } from '../../hooks/useN8nTrigger';

interface WorkflowStatus {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'running';
  lastRun?: Date;
  nextRun?: Date;
}

const N8nStatusIndicator: React.FC = () => {
  const { loading } = useN8nTrigger();
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([
    {
      name: 'Günlük Fatura Çekme',
      status: 'active',
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000) // 22 hours from now
    },
    {
      name: 'Durum Senkronizasyonu',
      status: 'active',
      lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      name: 'PDF İndirme',
      status: 'inactive',
    },
    {
      name: 'Bildirim Gönderme',
      status: 'active',
      lastRun: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    }
  ]);

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('connected');

  const getStatusIcon = (status: WorkflowStatus['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: WorkflowStatus['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktif</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Çalışıyor</Badge>;
      case 'error':
        return <Badge variant="destructive">Hata</Badge>;
      default:
        return <Badge variant="secondary">Pasif</Badge>;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes} dakika önce`;
    } else {
      return `${hours} saat önce`;
    }
  };

  const checkConnection = () => {
    setConnectionStatus('checking');
    // Simulate connection check
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);
  };

  // Simulate workflow status updates
  useEffect(() => {
    if (loading) {
      setWorkflowStatuses(prev => prev.map(workflow => 
        workflow.name === 'Günlük Fatura Çekme' 
          ? { ...workflow, status: 'running' as const }
          : workflow
      ));
    } else {
      setWorkflowStatuses(prev => prev.map(workflow => 
        workflow.name === 'Günlük Fatura Çekme' 
          ? { ...workflow, status: 'active' as const, lastRun: new Date() }
          : workflow
      ));
    }
  }, [loading]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">n8n Bağlantı Durumu</span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default" className="bg-green-500">Bağlı</Badge>
                </>
              )}
              {connectionStatus === 'disconnected' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Bağlantı Yok</Badge>
                </>
              )}
              {connectionStatus === 'checking' && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <Badge variant="secondary">Kontrol Ediliyor</Badge>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnection}
                disabled={connectionStatus === 'checking'}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Test
              </Button>
            </div>
          </div>

          {/* Workflows Status */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workflow Durumları
            </h4>
            
            {workflowStatuses.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <div className="font-medium text-sm">{workflow.name}</div>
                    {workflow.lastRun && (
                      <div className="text-xs text-muted-foreground">
                        Son çalışma: {formatRelativeTime(workflow.lastRun)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {workflowStatuses.filter(w => w.status === 'active').length}
              </div>
              <div className="text-xs text-muted-foreground">Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {workflowStatuses.filter(w => w.status === 'running').length}
              </div>
              <div className="text-xs text-muted-foreground">Çalışıyor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {workflowStatuses.filter(w => w.status === 'error').length}
              </div>
              <div className="text-xs text-muted-foreground">Hata</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nStatusIndicator;