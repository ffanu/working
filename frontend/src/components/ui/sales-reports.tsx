'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from './badge';
import { Input } from './input';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  Download, Filter, BarChart3, PieChart, 
  CalendarDays, Users, Package, Target,
  ArrowUpRight, ArrowDownRight, Minus,
  RefreshCw
} from 'lucide-react';
import { API_CONFIG } from '@/lib/config';

interface SalesData {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  customers: number;
}

interface SalesReportProps {
  className?: string;
}

export function SalesReports({ className = '' }: SalesReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }

        const sales = await response.json();
        const salesArray = sales.data || sales;

        if (!Array.isArray(salesArray) || salesArray.length === 0) {
          setSalesData([]);
          return;
        }

        // Process sales data to create daily breakdown
        const dailyData: { [key: string]: any } = {};
        
        salesArray.forEach((sale: any) => {
          const saleDate = new Date(sale.saleDate || sale.createdAt || Date.now());
          const dateKey = saleDate.toISOString().split('T')[0];
          
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              date: dateKey,
              revenue: 0,
              profit: 0,
              orders: 0,
              customers: new Set<string>()
            };
          }
          
          dailyData[dateKey].revenue += sale.totalAmount || 0;
          dailyData[dateKey].orders += 1;
          if (sale.customerId) dailyData[dateKey].customers.add(sale.customerId);
          
          // Calculate profit for this sale
          const saleCost = sale.items?.reduce((sum: number, item: any) => {
            const cost = item.costPrice || item.unitPrice * 0.7;
            return sum + (cost * item.quantity);
          }, 0) || 0;
          dailyData[dateKey].profit += (sale.totalAmount || 0) - saleCost;
        });

        // Convert to array and sort by date
        const processedData = Object.values(dailyData)
          .map((day: any) => ({
            ...day,
            customers: (day.customers as Set<string>).size
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setSalesData(processedData);

      } catch (err) {
        console.error('Error fetching sales data:', err);
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`);
    if (response.ok) {
      const sales = await response.json();
      const salesArray = sales.data || sales;
      
              if (Array.isArray(salesArray) && salesArray.length > 0) {
          const dailyData: { [key: string]: any } = {};
          
          salesArray.forEach((sale: any) => {
            const saleDate = new Date(sale.saleDate || sale.createdAt || Date.now());
            const dateKey = saleDate.toISOString().split('T')[0];
            
            if (!dailyData[dateKey]) {
              dailyData[dateKey] = {
                date: dateKey,
                revenue: 0,
                profit: 0,
                orders: 0,
                customers: new Set<string>()
              };
            }
            
            dailyData[dateKey].revenue += sale.totalAmount || 0;
            dailyData[dateKey].orders += 1;
            if (sale.customerId) dailyData[dateKey].customers.add(sale.customerId);
            
            const saleCost = sale.items?.reduce((sum: number, item: any) => {
              const cost = item.costPrice || item.unitPrice * 0.7;
              return sum + (cost * item.quantity);
            }, 0) || 0;
            dailyData[dateKey].profit += (sale.totalAmount || 0) - saleCost;
          });

          const processedData = Object.values(dailyData)
            .map((day: any) => ({
              ...day,
              customers: (day.customers as Set<string>).size
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setSalesData(processedData);
      }
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPeriodData = () => {
    if (salesData.length === 0) return [];
    
    const today = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return salesData.filter(item => 
            item.date >= customStartDate && item.date <= customEndDate
          );
        }
        return salesData;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }
    
    return salesData.filter(item => new Date(item.date) >= startDate);
  };

  const getSummaryStats = () => {
    const periodData = getPeriodData();
    if (periodData.length === 0) return null;

    const totalRevenue = periodData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = periodData.reduce((sum, item) => sum + item.profit, 0);
    const totalOrders = periodData.reduce((sum, item) => sum + item.orders, 0);
    const totalCustomers = periodData.reduce((sum, item) => sum + item.customers, 0);

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      totalCustomers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  };

  const exportData = () => {
    const periodData = getPeriodData();
    if (periodData.length === 0) return;

    const csvContent = [
      ['Date', 'Revenue', 'Profit', 'Orders', 'Customers'],
      ...periodData.map(item => [
        item.date,
        item.revenue.toString(),
        item.profit.toString(),
        item.orders.toString(),
        item.customers.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const summaryStats = getSummaryStats();

  if (!summaryStats || salesData.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No sales data available</p>
        <p className="text-sm text-gray-500">Start making sales to see reports here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">Date-wise sales analysis and performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Report Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {selectedPeriod === 'custom' && (
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <span>to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-sm text-gray-600">
              Last {getPeriodData().length} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalProfit)}</div>
            <div className="text-sm text-gray-600">
              {summaryStats.profitMargin.toFixed(1)}% margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalOrders}</div>
            <div className="text-sm text-gray-600">
              {formatCurrency(summaryStats.averageOrderValue)} avg. order
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCustomers}</div>
            <div className="text-sm text-gray-600">
              {formatCurrency(summaryStats.totalRevenue / summaryStats.totalCustomers)} per customer
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Breakdown</CardTitle>
          <CardDescription>Revenue and orders for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getPeriodData().slice(-10).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(day.revenue)}</div>
                  <div className="text-xs text-gray-600">{day.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
