
export interface SalesPerformanceData {
  id: string;
  month: string;
  total_proposals: number;
  accepted_proposals: number;
  total_value: number;
  conversion_rate: number;
  employee_id?: string;
  employee_name?: string;
  success_rate?: number;
}
