
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ExchangeRate } from "../types/exchangeRateTypes";
import { getCurrencyIcon, getCurrencyName } from "../utils/exchangeRateUtils";

interface MainCurrencyCardProps {
  rate: ExchangeRate;
}

export const MainCurrencyCard: React.FC<MainCurrencyCardProps> = ({ rate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-lg flex items-center">
          <span className="mr-2 font-bold text-2xl text-primary dark:text-primary-dark">{getCurrencyIcon(rate.currency_code)}</span>
          {rate.currency_code}
        </span>
        <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary-dark/10 border-primary/20 dark:border-primary-dark/20 text-primary dark:text-primary-dark">
          {getCurrencyName(rate.currency_code)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alış</span>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 text-green-500" size={16} />
            <span className="font-medium">{rate.forex_buying?.toLocaleString('tr-TR')}</span>
          </div>
        </div>
        
        <div className="flex flex-col p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Satış</span>
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 text-red-500" size={16} />
            <span className="font-medium">{rate.forex_selling?.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCurrencyCard;
