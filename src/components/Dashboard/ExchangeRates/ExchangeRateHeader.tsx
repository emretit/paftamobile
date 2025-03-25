
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock } from "lucide-react";
import { UpdateStatus } from "../types/exchangeRateTypes";
import { formatDate } from "../utils/exchangeRateUtils";

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
    <div className="flex justify-between items-center">
      <CardTitle className="text-lg font-semibold flex items-center">
        <span>TCMB Döviz Kurları</span>
        {lastUpdateStatus && (
          <Badge 
            variant={lastUpdateStatus.status === 'success' ? 'outline' : 'destructive'}
            className="ml-3 text-xs"
          >
            {lastUpdateStatus.status === 'success' ? 'Güncel' : 'Hata'}
          </Badge>
        )}
      </CardTitle>
      <div className="flex items-center space-x-2">
        {lastUpdated && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock size={14} className="mr-1" />
            <span>Son Güncelleme: {formatDate(lastUpdated)}</span>
          </div>
        )}
        <button 
          onClick={onRefresh} 
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isRefreshing}
          title="Kurları Güncelle"
        >
          <RefreshCw 
            size={18} 
            className={`text-gray-500 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default ExchangeRateHeader;
