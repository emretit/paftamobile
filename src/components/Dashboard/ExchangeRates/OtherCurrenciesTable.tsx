
import React from 'react';
import { ExchangeRate } from "../types/exchangeRateTypes";
import { getCurrencyName } from "../utils/exchangeRateUtils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface OtherCurrenciesTableProps {
  rates: ExchangeRate[];
}

export const OtherCurrenciesTable: React.FC<OtherCurrenciesTableProps> = ({ rates }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Para Birimi</TableHead>
            <TableHead className="text-right">Alış</TableHead>
            <TableHead className="text-right">Satış</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.currency_code} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2 font-medium">{rate.currency_code}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getCurrencyName(rate.currency_code)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{rate.forex_buying?.toLocaleString('tr-TR')}</TableCell>
              <TableCell className="text-right">{rate.forex_selling?.toLocaleString('tr-TR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OtherCurrenciesTable;
