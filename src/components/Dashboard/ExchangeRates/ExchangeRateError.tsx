
import React from 'react';
import { AlertCircle } from "lucide-react";

interface ExchangeRateErrorProps {
  error: string;
}

export const ExchangeRateError: React.FC<ExchangeRateErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
      <AlertCircle className="mr-2" size={20} />
      <span>{error}</span>
    </div>
  );
};

export default ExchangeRateError;
