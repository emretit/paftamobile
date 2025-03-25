
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { ExchangeRate } from "../types/exchangeRateTypes";
import { getCurrencyIcon, getCurrencyName } from "../utils/exchangeRateUtils";

interface MainCurrencyCardProps {
  rate: ExchangeRate;
}

export const MainCurrencyCard: React.FC<MainCurrencyCardProps> = ({ rate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      {/* Background pattern for visual interest */}
      <div className="absolute top-0 right-0 opacity-5 p-4">
        <span className="text-6xl font-bold">{getCurrencyIcon(rate.currency_code)}</span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium text-lg flex items-center">
          <span className="mr-2 font-bold text-2xl text-primary dark:text-primary-dark">{getCurrencyIcon(rate.currency_code)}</span>
          {rate.currency_code}
        </span>
        <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary-dark/10 border-primary/20 dark:border-primary-dark/20 text-primary dark:text-primary-dark">
          {getCurrencyName(rate.currency_code)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-700/30">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Alış</span>
          <div className="flex items-center">
            <TrendingDown className="mr-1.5 text-green-500" size={18} />
            <span className="font-medium text-base">{rate.forex_buying?.toLocaleString('tr-TR', {maximumFractionDigits: 4})}</span>
          </div>
        </div>
        
        <div className="flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-700/30">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Satış</span>
          <div className="flex items-center">
            <TrendingUp className="mr-1.5 text-red-500" size={18} />
            <span className="font-medium text-base">{rate.forex_selling?.toLocaleString('tr-TR', {maximumFractionDigits: 4})}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCurrencyCard;
