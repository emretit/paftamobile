
import React from 'react';
import { ExchangeRate } from "../types/exchangeRateTypes";
import { getCurrencyName, getCurrencyIcon } from "../utils/exchangeRateUtils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface OtherCurrenciesTableProps {
  rates: ExchangeRate[];
}

export const OtherCurrenciesTable: React.FC<OtherCurrenciesTableProps> = ({ rates }) => {
  if (rates.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <p className="text-gray-500 dark:text-gray-400">Diğer döviz kurları bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="text-left font-medium">Para Birimi</TableHead>
            <TableHead className="text-right font-medium">Alış</TableHead>
            <TableHead className="text-right font-medium">Satış</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.currency_code} className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2 font-medium text-primary dark:text-primary-dark">{getCurrencyIcon(rate.currency_code)}</span>
                  <div>
                    <span className="font-medium">{rate.currency_code}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{getCurrencyName(rate.currency_code)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{rate.forex_buying?.toLocaleString('tr-TR')}</TableCell>
              <TableCell className="text-right font-medium">{rate.forex_selling?.toLocaleString('tr-TR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OtherCurrenciesTable;
