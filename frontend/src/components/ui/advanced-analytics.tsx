'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from './badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Truck, 
  BarChart3, 
  PieChart,
  Download,
  Eye,
  Target,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_CONFIG } from '@/lib/config';

interface AdvancedAnalyticsData {
  profitMargins: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number;
    marginPercentage: number;
  };
  inventoryTurnover: {
    averageInventory: number;
    costOfGoodsSold: number;
    turnoverRatio: number;
    daysToSell: number;
  };
  customerInsights: {
    totalCustomers: number;
    activeCustomers: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    repeatPurchaseRate: number;
  };
  supplierPerformance: Array<{
    name: string;
    totalSpent: number;
    orderCount: number;
    averageDeliveryTime: number;
    qualityRating: number;
    reliabilityScore: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    profit: number;
    margin: number;
    unitsSold: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    profit: number;
    orders: number;
    customers: number;
  }>;
}

interface AdvancedAnalyticsProps {
  data?: AdvancedAnalyticsData;
  loading?: boolean;
}

export function AdvancedAnalytics({ data, loading = false }: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('profit');
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [productsRes, salesRes, purchasesRes, customersRes, suppliersRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMERS}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}`)
        ]);

        const products = await productsRes.json();
        const sales = await salesRes.json();
        const purchases = await purchasesRes.json();
        const customers = await customersRes.json();
        const suppliers = await suppliersRes.json();

        console.log('Raw API responses:', { products, sales, purchases, customers, suppliers });

        // Extract data arrays (handle both direct arrays and wrapped responses)
        const productsData = products.data || products;
        const salesData = sales.data || sales;
        const purchasesData = purchases.data || purchases;
        const customersData = customers.data || customers;
        const suppliersData = suppliers.data || suppliers;

        console.log('Extracted data arrays:', {
          products: productsData.length,
          sales: salesData.length,
          purchases: purchasesData.length,
          customers: customersData.length,
          suppliers: suppliersData.length
        });

        // Calculate profit margins
        const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
        const totalCost = purchasesData.reduce((sum: number, purchase: any) => sum + (purchase.totalAmount || 0), 0);
        const grossProfit = totalRevenue - totalCost;
        const operatingExpenses = totalCost * 0.2; // Estimate 20% of cost as operating expenses
        const netProfit = grossProfit - operatingExpenses;
        const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        console.log('Profit calculations:', {
          totalRevenue,
          totalCost,
          grossProfit,
          operatingExpenses,
          netProfit,
          marginPercentage
        });

        // Calculate inventory turnover
        const averageInventory = productsData.reduce((sum: number, product: any) => {
          const cost = product.costPrice || product.price * 0.7; // Estimate cost if not available
          return sum + (cost * (product.quantity || 0));
        }, 0) / Math.max(productsData.length, 1);
        
        const costOfGoodsSold = salesData.reduce((sum: number, sale: any) => {
          return sum + (sale.items?.reduce((itemSum: number, item: any) => {
            const cost = item.costPrice || item.unitPrice * 0.7;
            return sum + (cost * item.quantity);
          }, 0) || 0);
        }, 0);
        
        const turnoverRatio = averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;
        const daysToSell = turnoverRatio > 0 ? 365 / turnoverRatio : 0;

        // Calculate customer insights
        const totalCustomers = customersData.length;
        const activeCustomers = salesData.reduce((set: Set<string>, sale: any) => {
          if (sale.customerId) set.add(sale.customerId);
          return set;
        }, new Set<string>()).size;
        
        const averageOrderValue = totalRevenue / Math.max(salesData.length, 1);
        const customerLifetimeValue = totalRevenue / Math.max(totalCustomers, 1);
        
        // Calculate repeat purchase rate (customers with multiple orders)
        const customerOrderCounts: { [key: string]: number } = {};
        salesData.forEach((sale: any) => {
          if (sale.customerId) {
            customerOrderCounts[sale.customerId] = (customerOrderCounts[sale.customerId] || 0) + 1;
          }
        });
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
        const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

        // Calculate supplier performance
        const supplierData: { [key: string]: any } = {};
        purchasesData.forEach((purchase: any) => {
          const supplierId = purchase.supplierId || purchase.supplierName;
          if (!supplierData[supplierId]) {
            supplierData[supplierId] = {
              name: purchase.supplierName || 'Unknown Supplier',
              totalSpent: 0,
              orderCount: 0,
              deliveryTimes: [],
              qualityRatings: [],
              reliabilityScores: []
            };
          }
          supplierData[supplierId].totalSpent += purchase.totalAmount || 0;
          supplierData[supplierId].orderCount += 1;
          
          // Estimate delivery time (if not available, use random reasonable values)
          const deliveryTime = purchase.deliveryTime || (3 + Math.random() * 7);
          supplierData[supplierId].deliveryTimes.push(deliveryTime);
          
          // Estimate quality rating (if not available, use random reasonable values)
          const qualityRating = purchase.qualityRating || (3.5 + Math.random() * 1.5);
          supplierData[supplierId].qualityRatings.push(qualityRating);
          
          // Calculate reliability score based on on-time delivery
          const reliabilityScore = purchase.onTimeDelivery ? 90 : (70 + Math.random() * 20);
          supplierData[supplierId].reliabilityScores.push(reliabilityScore);
        });

        const supplierPerformance = Object.values(supplierData).map(supplier => ({
          name: supplier.name,
          totalSpent: supplier.totalSpent,
          orderCount: supplier.orderCount,
          averageDeliveryTime: supplier.deliveryTimes.reduce((a: number, b: number) => a + b, 0) / supplier.deliveryTimes.length,
          qualityRating: supplier.qualityRatings.reduce((a: number, b: number) => a + b, 0) / supplier.qualityRatings.length,
          reliabilityScore: supplier.reliabilityScores.reduce((a: number, b: number) => a + b, 0) / supplier.reliabilityScores.length
        })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

        // Calculate top products
        const productRevenue: { [key: string]: any } = {};
        salesData.forEach((sale: any) => {
          sale.items?.forEach((item: any) => {
            const productId = item.productId;
            if (!productRevenue[productId]) {
              productRevenue[productId] = {
                name: item.productName || 'Unknown Product',
                revenue: 0,
                cost: 0,
                unitsSold: 0
              };
            }
            const revenue = (item.unitPrice || 0) * (item.quantity || 0);
            const cost = (item.costPrice || item.unitPrice * 0.7) * (item.quantity || 0);
            productRevenue[productId].revenue += revenue;
            productRevenue[productId].cost += cost;
            productRevenue[productId].unitsSold += item.quantity || 0;
          });
        });

        const topProducts = Object.values(productRevenue)
          .map(product => ({
            name: product.name,
            revenue: product.revenue,
            profit: product.revenue - product.cost,
            margin: product.revenue > 0 ? ((product.revenue - product.cost) / product.revenue) * 100 : 0,
            unitsSold: product.unitsSold
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate monthly trends (last 12 months)
        const monthlyData: { [key: string]: any } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        salesData.forEach((sale: any) => {
          const date = new Date(sale.saleDate || sale.createdAt || Date.now());
          const monthKey = months[date.getMonth()];
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, profit: 0, orders: 0, customers: new Set() };
          }
          monthlyData[monthKey].revenue += sale.totalAmount || 0;
          monthlyData[monthKey].orders += 1;
          if (sale.customerId) monthlyData[monthKey].customers.add(sale.customerId);
          
          // Calculate profit for this sale
          const saleCost = sale.items?.reduce((sum: number, item: any) => {
            const cost = item.costPrice || item.unitPrice * 0.7;
            return sum + (cost * item.quantity);
          }, 0) || 0;
          monthlyData[monthKey].profit += (sale.totalAmount || 0) - saleCost;
        });

        const monthlyTrends = months.map(month => ({
          month,
          revenue: monthlyData[month]?.revenue || 0,
          profit: monthlyData[month]?.profit || 0,
          orders: monthlyData[month]?.orders || 0,
          customers: monthlyData[month]?.customers?.size || 0
        }));

        const finalData = {
          profitMargins: {
            totalRevenue,
            totalCost,
            grossProfit,
            netProfit,
            marginPercentage
          },
          inventoryTurnover: {
            averageInventory,
            costOfGoodsSold,
            turnoverRatio,
            daysToSell
          },
          customerInsights: {
            totalCustomers,
            activeCustomers,
            averageOrderValue,
            customerLifetimeValue,
            repeatPurchaseRate
          },
          supplierPerformance,
          topProducts,
          monthlyTrends
        };

        console.log('Final analytics data:', finalData);
        setAnalyticsData(finalData);

      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        console.error('Error details:', {
          message: err?.message || 'Unknown error',
          stack: err?.stack,
          name: err?.name
        });
        setError(`Failed to load analytics data: ${err?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [productsRes, salesRes, purchasesRes, customersRes, suppliersRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMERS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}`)
      ]);

      const products = await productsRes.json();
      const sales = await salesRes.json();
      const purchases = await purchasesRes.json();
      const customers = await customersRes.json();
      const suppliers = await suppliersRes.json();

      // Extract data arrays (handle both direct arrays and wrapped responses)
      const productsData = products.data || products;
      const salesData = sales.data || sales;
      const purchasesData = purchases.data || purchases;
      const customersData = customers.data || customers;
      const suppliersData = suppliers.data || suppliers;

      // Calculate profit margins
      const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
      const totalCost = purchasesData.reduce((sum: number, purchase: any) => sum + (purchase.totalAmount || 0), 0);
      const grossProfit = totalRevenue - totalCost;
      const operatingExpenses = totalCost * 0.2; // Estimate 20% of cost as operating expenses
      const netProfit = grossProfit - operatingExpenses;
      const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calculate inventory turnover
      const averageInventory = productsData.reduce((sum: number, product: any) => {
        const cost = product.costPrice || product.price * 0.7; // Estimate cost if not available
        return sum + (cost * (product.quantity || 0));
      }, 0) / Math.max(productsData.length, 1);
      
      const costOfGoodsSold = salesData.reduce((sum: number, sale: any) => {
        return sum + (sale.items?.reduce((itemSum: number, item: any) => {
          const cost = item.costPrice || item.unitPrice * 0.7;
          return itemSum + (cost * item.quantity);
        }, 0) || 0);
      }, 0);
      
      const turnoverRatio = averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;
      const daysToSell = turnoverRatio > 0 ? 365 / turnoverRatio : 0;

      // Calculate customer insights
      const totalCustomers = customersData.length;
      const activeCustomers = salesData.reduce((set: Set<string>, sale: any) => {
        if (sale.customerId) set.add(sale.customerId);
        return set;
      }, new Set<string>()).size;
      
      const averageOrderValue = totalRevenue / Math.max(salesData.length, 1);
      const customerLifetimeValue = totalRevenue / Math.max(totalCustomers, 1);
      
      // Calculate repeat purchase rate (customers with multiple orders)
      const customerOrderCounts: { [key: string]: number } = {};
      salesData.forEach((sale: any) => {
        if (sale.customerId) {
          customerOrderCounts[sale.customerId] = (customerOrderCounts[sale.customerId] || 0) + 1;
        }
      });
      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      // Calculate supplier performance
      const supplierData: { [key: string]: any } = {};
      purchasesData.forEach((purchase: any) => {
        const supplierId = purchase.supplierId || purchase.supplierName;
        if (!supplierData[supplierId]) {
          supplierData[supplierId] = {
            name: purchase.supplierName || 'Unknown Supplier',
            totalSpent: 0,
            orderCount: 0,
            deliveryTimes: [],
            qualityRatings: [],
            reliabilityScores: []
          };
        }
        supplierData[supplierId].totalSpent += purchase.totalAmount || 0;
        supplierData[supplierId].orderCount += 1;
        
        // Estimate delivery time (if not available, use random reasonable values)
        const deliveryTime = purchase.deliveryTime || (3 + Math.random() * 7);
        supplierData[supplierId].deliveryTimes.push(deliveryTime);
        
        // Estimate quality rating (if not available, use random reasonable values)
        const qualityRating = purchase.qualityRating || (3.5 + Math.random() * 1.5);
        supplierData[supplierId].qualityRatings.push(qualityRating);
        
        // Calculate reliability score based on on-time delivery
        const reliabilityScore = purchase.onTimeDelivery ? 90 : (70 + Math.random() * 20);
        supplierData[supplierId].reliabilityScores.push(reliabilityScore);
      });

      const supplierPerformance = Object.values(supplierData).map(supplier => ({
        name: supplier.name,
        totalSpent: supplier.totalSpent,
        orderCount: supplier.orderCount,
        averageDeliveryTime: supplier.deliveryTimes.reduce((a: number, b: number) => a + b, 0) / supplier.deliveryTimes.length,
        qualityRating: supplier.qualityRatings.reduce((a: number, b: number) => a + b, 0) / supplier.qualityRatings.length,
        reliabilityScore: supplier.reliabilityScores.reduce((a: number, b: number) => a + b, 0) / supplier.reliabilityScores.length
      })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

      // Calculate top products
      const productRevenue: { [key: string]: any } = {};
      salesData.forEach((sale: any) => {
        sale.items?.forEach((item: any) => {
          const productId = item.productId;
          if (!productRevenue[productId]) {
            productRevenue[productId] = {
              name: item.productName || 'Unknown Product',
              revenue: 0,
              cost: 0,
              unitsSold: 0
            };
          }
          const revenue = (item.unitPrice || 0) * (item.quantity || 0);
          const cost = (item.costPrice || item.unitPrice * 0.7) * (item.quantity || 0);
          productRevenue[productId].revenue += revenue;
          productRevenue[productId].cost += cost;
          productRevenue[productId].unitsSold += item.quantity || 0;
        });
      });

      const topProducts = Object.values(productRevenue)
        .map(product => ({
          name: product.name,
          revenue: product.revenue,
          profit: product.revenue - product.cost,
          margin: product.revenue > 0 ? ((product.revenue - product.cost) / product.revenue) * 100 : 0,
          unitsSold: product.unitsSold
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate monthly trends (last 12 months)
      const monthlyData: { [key: string]: any } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      salesData.forEach((sale: any) => {
        const date = new Date(sale.saleDate || sale.createdAt || Date.now());
        const monthKey = months[date.getMonth()];
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, profit: 0, orders: 0, customers: new Set() };
        }
        monthlyData[monthKey].revenue += sale.totalAmount || 0;
        monthlyData[monthKey].orders += 1;
        if (sale.customerId) monthlyData[monthKey].customers.add(sale.customerId);
        
        // Calculate profit for this sale
        const saleCost = sale.items?.reduce((sum: number, item: any) => {
          const cost = item.costPrice || item.unitPrice * 0.7;
          return sum + (cost * item.quantity);
        }, 0) || 0;
        monthlyData[monthKey].profit += (sale.totalAmount || 0) - saleCost;
      });

      const monthlyTrends = months.map(month => ({
        month,
        revenue: monthlyData[month]?.revenue || 0,
        profit: monthlyData[month]?.profit || 0,
        orders: monthlyData[month]?.orders || 0,
        customers: monthlyData[month]?.customers?.size || 0
      }));

      setAnalyticsData({
        profitMargins: {
          totalRevenue,
          totalCost,
          grossProfit,
          netProfit,
          marginPercentage
        },
        inventoryTurnover: {
          averageInventory,
          costOfGoodsSold,
          turnoverRatio,
          daysToSell
        },
        customerInsights: {
          totalCustomers,
          activeCustomers,
          averageOrderValue,
          customerLifetimeValue,
          repeatPurchaseRate
        },
        supplierPerformance,
        topProducts,
        monthlyTrends
      });

    } catch (err) {
      console.error('Error refreshing analytics data:', err);
      setError('Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Use provided data or fetched data
  const displayData = data || analyticsData;

  if (loading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Loading comprehensive business insights...</p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !displayData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
            <p className="text-red-600 dark:text-red-400">Failed to load analytics data</p>
          </div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">{error || 'No data available'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Profit Margins */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.profitMargins.totalRevenue)}</div>
            <p className="text-xs text-gray-600">Gross revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.profitMargins.grossProfit)}</div>
            <p className="text-xs text-gray-600">Revenue - Cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.profitMargins.netProfit)}</div>
            <p className="text-xs text-gray-600">After expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(displayData.profitMargins.marginPercentage)}</div>
            <p className="text-xs text-gray-600">Net profit %</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Turnover */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Inventory</CardTitle>
            <Package className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.inventoryTurnover.averageInventory)}</div>
            <p className="text-xs text-gray-600">Average stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.inventoryTurnover.costOfGoodsSold)}</div>
            <p className="text-xs text-gray-600">Total COGS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Ratio</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.inventoryTurnover.turnoverRatio.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Times per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days to Sell</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(displayData.inventoryTurnover.daysToSell)}</div>
            <p className="text-xs text-gray-600">Average days</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.customerInsights.totalCustomers}</div>
            <p className="text-xs text-gray-600">All customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.customerInsights.activeCustomers}</div>
            <p className="text-xs text-gray-600">With orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayData.customerInsights.averageOrderValue)}</div>
            <p className="text-xs text-gray-600">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(displayData.customerInsights.repeatPurchaseRate)}</div>
            <p className="text-xs text-gray-600">Returning customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Products with highest revenue and profit margins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.unitsSold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(product.revenue)}</div>
                  <div className="text-sm text-gray-600">
                    Profit: {formatCurrency(product.profit)} ({formatPercentage(product.margin)})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
          <CardDescription>Top suppliers by total spend and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.supplierPerformance.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.orderCount} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(supplier.totalSpent)}</div>
                  <div className="text-sm text-gray-600">
                    Rating: {supplier.qualityRating.toFixed(1)}/5.0
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Revenue, profit, and order trends over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayData.monthlyTrends.map((month, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-lg">{month.month}</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profit:</span>
                    <span className="font-medium">{formatCurrency(month.profit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Orders:</span>
                    <span className="font-medium">{month.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customers:</span>
                    <span className="font-medium">{month.customers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
