
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExchangeRate } from "../types/exchangeRateTypes";
import { getCurrencyIcon, getCurrencyName } from "../utils/exchangeRateUtils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface OtherCurrenciesTableProps {
  rates: ExchangeRate[];
}

const OtherCurrenciesTable: React.FC<OtherCurrenciesTableProps> = ({ rates }) => {
  if (!rates.length) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Diğer döviz kurları bulunamadı.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-700/30">
          <TableRow>
            <TableHead className="w-[120px] font-medium text-gray-600 dark:text-gray-300">Para Birimi</TableHead>
            <TableHead className="font-medium text-gray-600 dark:text-gray-300">İsim</TableHead>
            <TableHead className="text-right font-medium text-gray-600 dark:text-gray-300">Alış</TableHead>
            <TableHead className="text-right font-medium text-gray-600 dark:text-gray-300">Satış</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow 
              key={rate.currency_code}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="mr-2 font-bold text-lg text-primary dark:text-primary-dark">{getCurrencyIcon(rate.currency_code)}</span>
                  {rate.currency_code}
                </div>
              </TableCell>
              <TableCell>{getCurrencyName(rate.currency_code)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <TrendingDown className="mr-1.5 text-green-500" size={16} />
                  <span>{rate.forex_buying?.toLocaleString('tr-TR', {maximumFractionDigits: 4})}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <TrendingUp className="mr-1.5 text-red-500" size={16} />
                  <span>{rate.forex_selling?.toLocaleString('tr-TR', {maximumFractionDigits: 4})}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OtherCurrenciesTable;
