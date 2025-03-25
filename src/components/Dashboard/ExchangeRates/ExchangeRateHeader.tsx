
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, AlertCircle } from "lucide-react";
import { UpdateStatus } from "../types/exchangeRateTypes";
import { formatDate } from "../utils/exchangeRateUtils";
import { StatusBadge } from "@/components/ui/status-badge";

interface ExchangeRateHeaderProps {
  lastUpdateStatus: UpdateStatus | null;
  lastUpdated: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const ExchangeRateHeader: React.FC<ExchangeRateHeaderProps> = ({ 
  lastUpdateStatus, 
  lastUpdated, 
  isRefreshing, 
  onRefresh 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
      <CardTitle className="text-lg font-semibold flex items-center">
        <span>TCMB Döviz Kurları</span>
        {lastUpdateStatus && (
          <div className="ml-3">
            {lastUpdateStatus.status === 'success' ? (
              <StatusBadge variant="success" label="Güncel" size="sm" />
            ) : (
              <div className="flex items-center">
                <StatusBadge variant="error" label="Hata" size="sm" />
                <span className="ml-2 text-xs text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {lastUpdateStatus.message || 'Güncelleme hatası'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardTitle>
      <div className="flex items-center space-x-3">
        {lastUpdated && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock size={14} className="mr-1" />
            <span>Son Güncelleme: {formatDate(lastUpdated)}</span>
          </div>
        )}
        <button 
          onClick={onRefresh} 
          className="p-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-primary-dark/20 transition-colors"
          disabled={isRefreshing}
          title="Kurları Güncelle"
        >
          <RefreshCw 
            size={18} 
            className={`text-primary dark:text-primary-dark ${isRefreshing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default ExchangeRateHeader;
