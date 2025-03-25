
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
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-lg flex items-center">
          <span className="mr-2 font-bold text-2xl">{getCurrencyIcon(rate.currency_code)}</span>
          {rate.currency_code}
        </span>
        <Badge variant="outline" className="text-xs">
          {getCurrencyName(rate.currency_code)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <ArrowDownRight className="mr-1 text-green-500" size={16} />
          <span className="text-gray-600 dark:text-gray-300">Alış:</span>
          <span className="ml-1 font-medium">{rate.forex_buying?.toLocaleString('tr-TR')}</span>
        </div>
        
        <div className="flex items-center">
          <ArrowUpRight className="mr-1 text-red-500" size={16} />
          <span className="text-gray-600 dark:text-gray-300">Satış:</span>
          <span className="ml-1 font-medium">{rate.forex_selling?.toLocaleString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
};

export default MainCurrencyCard;
