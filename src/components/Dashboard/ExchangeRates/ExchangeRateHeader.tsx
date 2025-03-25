
import React from 'react';
import { RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "../utils/exchangeRateUtils";
import { UpdateStatus } from "../types/exchangeRateTypes";
import StatusBadge from "@/components/ui/status-badge";

interface ExchangeRateHeaderProps {
  lastUpdateStatus: UpdateStatus | null;
  lastUpdated: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const ExchangeRateHeader: React.FC<ExchangeRateHeaderProps> = ({
  lastUpdateStatus,
  lastUpdated,
  isRefreshing,
  onRefresh
}) => {
  const getStatusBadge = () => {
    if (!lastUpdateStatus) return null;
    
    const statusConfig = {
      'success': {
        variant: 'success',
        label: 'Başarılı',
        icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />
      },
      'pending': {
        variant: 'warning',
        label: 'İşleniyor',
        icon: <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />
      },
      'error': {
        variant: 'error',
        label: 'Hata',
        icon: <XCircle className="w-3.5 h-3.5 mr-1" />
      },
      'partial': {
        variant: 'warning',
        label: 'Kısmi Başarılı',
        icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />
      }
    };
    
    const config = statusConfig[lastUpdateStatus.status as keyof typeof statusConfig] || statusConfig.error;
    
    return (
      <div className="flex items-center">
        <StatusBadge 
          variant={config.variant as any} 
          label={
            <div className="flex items-center">
              {config.icon}
              {config.label}
            </div>
          } 
          size="sm" 
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
          {lastUpdateStatus.message}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <h2 className="text-lg font-semibold flex items-center text-primary dark:text-primary-dark">
          <span className="mr-2">TCMB Döviz Kurları</span>
          {getStatusBadge()}
        </h2>
        {lastUpdated && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>Son Güncelleme: {formatDate(lastUpdated)}</span>
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center text-xs h-8"
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
      </Button>
    </div>
  );
};

export default ExchangeRateHeader;
