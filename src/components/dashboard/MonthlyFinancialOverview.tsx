import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useMonthlyFinancials } from "@/hooks/useMonthlyFinancials";
import { supabase } from "@/integrations/supabase/client";

const FINANCIAL_CATEGORIES = [
  { key: 'revenue', label: 'Revenue', subcategories: ['Product Sales', 'Service Revenue', 'Other Revenue'] },
  { key: 'cogs', label: 'Cost of Goods Sold', subcategories: ['Direct Materials', 'Direct Labor', 'Manufacturing Overhead'] },
  { key: 'gross_profit', label: 'Gross Profit', subcategories: [] },
  { key: 'opex', label: 'Operating Expenses', subcategories: ['Salaries', 'Rent', 'Utilities', 'Marketing', 'Admin'] },
  { key: 'ebitda', label: 'EBITDA', subcategories: [] },
  { key: 'depreciation', label: 'Depreciation', subcategories: [] },
  { key: 'ebit', label: 'EBIT', subcategories: [] },
  { key: 'interest', label: 'Interest', subcategories: ['Interest Income', 'Interest Expense'] },
  { key: 'tax', label: 'Tax', subcategories: [] },
  { key: 'net_profit', label: 'Net Profit', subcategories: [] },
  { key: 'cash_flow', label: 'Cash Flow', subcategories: ['Operating CF', 'Investing CF', 'Financing CF'] },
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const MonthlyFinancialOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingCell, setEditingCell] = useState<{ category: string; subcategory: string; month: number } | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { financials, loading, upsertFinancial, refetch } = useMonthlyFinancials();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth check - user:', user?.id);
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, fetching financials for year:', selectedYear);
      refetch(selectedYear);
    }
  }, [selectedYear, refetch, isAuthenticated]);

  const getFinancialValue = (category: string, subcategory: string, month: number) => {
    const financial = financials.find(f => 
      f.category === category && 
      f.subcategory === subcategory && 
      f.month === month && 
      f.year === selectedYear
    );
    return financial?.amount || 0;
  };

  const handleCellEdit = (category: string, subcategory: string, month: number, currentValue: number) => {
    setEditingCell({ category, subcategory, month });
    setTempValue(currentValue.toString());
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    const value = parseFloat(tempValue) || 0;
    
    try {
      await upsertFinancial({
        year: selectedYear,
        month: editingCell.month,
        category: editingCell.category,
        subcategory: editingCell.subcategory,
        amount: value,
      });
      
      setEditingCell(null);
      setTempValue('');
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const calculateMonthlyTotal = (month: number) => {
    return financials
      .filter(f => f.month === month && f.year === selectedYear)
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const calculateCategoryTotal = (category: string) => {
    return financials
      .filter(f => f.category === category && f.year === selectedYear)
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getChartData = () => {
    return MONTHS.map(month => {
      const monthlyRevenue = financials
        .filter(f => f.month === month.value && f.year === selectedYear && f.category === 'revenue')
        .reduce((sum, f) => sum + f.amount, 0);
      
      const monthlyExpenses = financials
        .filter(f => f.month === month.value && f.year === selectedYear && 
                (f.category === 'cogs' || f.category === 'opex'))
        .reduce((sum, f) => sum + f.amount, 0);

      const monthlyProfit = financials
        .filter(f => f.month === month.value && f.year === selectedYear && f.category === 'net_profit')
        .reduce((sum, f) => sum + f.amount, 0);

      return {
        month: month.label.substring(0, 3),
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        profit: monthlyProfit,
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Category', 'Subcategory', ...MONTHS.map(m => m.label), 'Total'];
    const rows = [];
    
    FINANCIAL_CATEGORIES.forEach(category => {
      if (category.subcategories.length > 0) {
        category.subcategories.forEach(subcategory => {
          const row = [
            category.label,
            subcategory,
            ...MONTHS.map(month => getFinancialValue(category.key, subcategory, month.value)),
            calculateCategoryTotal(category.key)
          ];
          rows.push(row);
        });
      } else {
        const row = [
          category.label,
          '',
          ...MONTHS.map(month => getFinancialValue(category.key, '', month.value)),
          calculateCategoryTotal(category.key)
        ];
        rows.push(row);
      }
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly_financial_overview_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to view financial data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monthly Financial Overview</h2>
          <p className="text-gray-600">Track your financial performance month by month</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Financial Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Data - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Category</TableHead>
                  <TableHead className="w-32">Subcategory</TableHead>
                  {MONTHS.map(month => (
                    <TableHead key={month.value} className="text-center min-w-24">
                      {month.label.substring(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FINANCIAL_CATEGORIES.map(category => (
                  category.subcategories.length > 0 ? (
                    category.subcategories.map((subcategory, index) => (
                      <TableRow key={`${category.key}-${subcategory}`}>
                        {index === 0 && (
                          <TableCell rowSpan={category.subcategories.length} className="font-medium">
                            {category.label}
                          </TableCell>
                        )}
                        <TableCell className="text-sm">{subcategory}</TableCell>
                        {MONTHS.map(month => {
                          const value = getFinancialValue(category.key, subcategory, month.value);
                          const isEditing = editingCell?.category === category.key && 
                                           editingCell?.subcategory === subcategory && 
                                           editingCell?.month === month.value;
                          
                          return (
                            <TableCell key={month.value} className="text-center">
                              {isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <Input
                                    type="number"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="h-8 w-20 text-center"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCellSave();
                                      if (e.key === 'Escape') handleCellCancel();
                                    }}
                                    autoFocus
                                  />
                                  <Button size="sm" onClick={handleCellSave}>✓</Button>
                                  <Button size="sm" variant="ghost" onClick={handleCellCancel}>✗</Button>
                                </div>
                              ) : (
                                <button
                                  className="hover:bg-gray-100 p-1 rounded w-full"
                                  onClick={() => handleCellEdit(category.key, subcategory, month.value, value)}
                                >
                                  {formatCurrency(value)}
                                </button>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium">
                          {formatCurrency(calculateCategoryTotal(category.key))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key={category.key}>
                      <TableCell className="font-medium">{category.label}</TableCell>
                      <TableCell>-</TableCell>
                      {MONTHS.map(month => {
                        const value = getFinancialValue(category.key, '', month.value);
                        const isEditing = editingCell?.category === category.key && 
                                         editingCell?.subcategory === '' && 
                                         editingCell?.month === month.value;
                        
                        return (
                          <TableCell key={month.value} className="text-center">
                            {isEditing ? (
                              <div className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="h-8 w-20 text-center"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellSave();
                                    if (e.key === 'Escape') handleCellCancel();
                                  }}
                                  autoFocus
                                />
                                <Button size="sm" onClick={handleCellSave}>✓</Button>
                                <Button size="sm" variant="ghost" onClick={handleCellCancel}>✗</Button>
                              </div>
                            ) : (
                              <button
                                className="hover:bg-gray-100 p-1 rounded w-full"
                                onClick={() => handleCellEdit(category.key, '', month.value, value)}
                              >
                                {formatCurrency(value)}
                              </button>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">
                        {formatCurrency(calculateCategoryTotal(category.key))}
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                <Bar dataKey="profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyFinancialOverview;