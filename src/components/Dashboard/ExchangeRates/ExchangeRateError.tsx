
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExchangeRateErrorProps {
  error: string;
}

export const ExchangeRateError: React.FC<ExchangeRateErrorProps> = ({ error }) => {
  return (
    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  );
};

export default ExchangeRateError;
