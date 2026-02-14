"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { API_CONFIG } from '@/lib/config';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  PieChart, 
  Activity,
  Eye,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalPurchases: number;
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  topCustomers: Array<{ name: string; totalSpent: number; orders: number }>;
  monthlySales: Array<{ month: string; sales: number; revenue: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  recentActivity: Array<{ type: string; description: string; amount: number; date: string }>;
  lowStockProducts: Array<{ name: string; currentStock: number; minStock: number }>;
  pendingOrders: Array<{ type: string; description: string; amount: number; date: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PublicDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from the backend APIs
      const [productsRes, salesRes, purchasesRes, customersRes, suppliersRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASES}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMERS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}`)
      ]);

      // Parse responses
      const products = await productsRes.json();
      const sales = await salesRes.json();
      const purchases = await purchasesRes.json();
      const customers = await customersRes.json();
      const suppliers = await suppliersRes.json();

      // Extract data arrays (handle both direct arrays and wrapped responses)
      const productsData = Array.isArray(products) ? products : (products.data || []);
      const salesData = Array.isArray(sales) ? sales : (sales.data || []);
      const purchasesData = Array.isArray(purchases) ? purchases : (purchases.data || []);
      const customersData = Array.isArray(customers) ? customers : (customers.data || []);
      const suppliersData = Array.isArray(suppliers) ? suppliers : (suppliers.data || []);

      console.log('Loaded data:', {
        products: productsData.length,
        sales: salesData.length,
        purchases: purchasesData.length,
        customers: customersData.length,
        suppliers: suppliersData.length
      });

      // Calculate analytics
      const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
      const totalSales = salesData.length;
      const totalPurchases = purchasesData.length;
      const totalProducts = productsData.length;
      const totalCustomers = customersData.length;
      const totalSuppliers = suppliersData.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate top products by revenue
      const productRevenue: { [key: string]: { revenue: number; quantity: number; name: string } } = {};
      salesData.forEach((sale: any) => {
        sale.items?.forEach((item: any) => {
          const productId = item.productId;
          if (!productRevenue[productId]) {
            productRevenue[productId] = { revenue: 0, quantity: 0, name: item.productName || 'Unknown' };
          }
          productRevenue[productId].revenue += (item.unitPrice || 0) * (item.quantity || 0);
          productRevenue[productId].quantity += item.quantity || 0;
        });
      });

      const topProducts = Object.values(productRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate top customers
      const customerSpending: { [key: string]: { totalSpent: number; orders: number; name: string } } = {};
      salesData.forEach((sale: any) => {
        const customerId = sale.customerId;
        if (!customerSpending[customerId]) {
          customerSpending[customerId] = { totalSpent: 0, orders: 0, name: sale.customerName || 'Unknown' };
        }
        customerSpending[customerId].totalSpent += sale.totalAmount || 0;
        customerSpending[customerId].orders += 1;
      });

      const topCustomers = Object.values(customerSpending)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Calculate monthly sales (last 12 months)
      const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      salesData.forEach((sale: any) => {
        const date = new Date(sale.saleDate || sale.createdAt || Date.now());
        const monthKey = months[date.getMonth()];
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { sales: 0, revenue: 0 };
        }
        monthlyData[monthKey].sales += 1;
        monthlyData[monthKey].revenue += sale.totalAmount || 0;
      });

      const monthlySales = months.map(month => ({
        month,
        sales: monthlyData[month]?.sales || 0,
        revenue: monthlyData[month]?.revenue || 0
      }));

      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      productsData.forEach((product: any) => {
        const category = product.category || 'General';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categoryCount).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));

      // Generate recent activity
      const recentActivity = [
        ...salesData.slice(0, 3).map((sale: any) => ({
          type: 'sale',
          description: `Sale to ${sale.customerName || 'Customer'}`,
          amount: sale.totalAmount || 0,
          date: new Date(sale.saleDate || sale.createdAt).toLocaleDateString()
        })),
        ...purchasesData.slice(0, 2).map((purchase: any) => ({
          type: 'purchase',
          description: `Purchase from ${purchase.supplierName || 'Supplier'}`,
          amount: purchase.totalAmount || 0,
          date: new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
       .slice(0, 5);

      // Calculate low stock products
      const lowStockProducts = productsData
        .filter((product: any) => (product.currentStock || 0) <= (product.minStock || 10))
        .map((product: any) => ({
          name: product.name,
          currentStock: product.currentStock || 0,
          minStock: product.minStock || 10
        }))
        .slice(0, 5);

      // Generate pending orders (simplified)
      const pendingOrders = [
        ...salesData.slice(0, 2).map((sale: any) => ({
          type: 'sale',
          description: `Order from ${sale.customerName || 'Customer'}`,
          amount: sale.totalAmount || 0,
          date: new Date(sale.saleDate || sale.createdAt).toLocaleDateString()
        })),
        ...purchasesData.slice(0, 2).map((purchase: any) => ({
          type: 'purchase',
          description: `Order to ${purchase.supplierName || 'Supplier'}`,
          amount: purchase.totalAmount || 0,
          date: new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()
        }))
      ].slice(0, 4);

      setData({
        totalRevenue,
        totalSales,
        totalPurchases,
        totalProducts,
        totalCustomers,
        totalSuppliers,
        averageOrderValue,
        topProducts,
        topCustomers,
        monthlySales,
        categoryDistribution,
        recentActivity,
        lowStockProducts,
        pendingOrders
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError("Failed to load dashboard data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Loading Dashboard...
            </h1>
            <p className="text-xl text-gray-600">
              Fetching real-time data from the backend
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your business insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Dashboard Error
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-800 text-lg font-medium mb-2">Failed to Load Data</p>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              No Data Available
            </h1>
            <p className="text-xl text-gray-600">
              Dashboard data could not be loaded
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Business Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time insights from your inventory system
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-green-800 text-lg font-medium">
                ✅ Real Data Loaded Successfully!
              </p>
              <p className="text-green-700">
                This dashboard shows live data from your MongoDB database. 
                Products: {data.totalProducts}, Sales: {data.totalSales}, Customers: {data.totalCustomers}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${data.totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-blue-200 flex items-center mt-2">
                <TrendingUp className="mr-1 h-4 w-4" />
                From {data.totalSales} sales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
              <ShoppingCart className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalSales}</div>
              <p className="text-sm text-green-200 flex items-center mt-2">
                <Target className="mr-1 h-4 w-4" />
                Avg: ${data.averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Products</CardTitle>
              <Package className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalProducts}</div>
              <p className="text-sm text-purple-200 flex items-center mt-2">
                <Activity className="mr-1 h-4 w-4" />
                In inventory
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Customers</CardTitle>
              <Users className="h-5 w-5 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalCustomers}</div>
              <p className="text-sm text-orange-200 flex items-center mt-2">
                <Truck className="mr-1 h-4 w-4" />
                {data.totalSuppliers} suppliers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-green-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">${data.averageOrderValue.toFixed(2)}</div>
                  <div className="text-sm text-blue-600">Average Order Value</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{data.totalPurchases}</div>
                  <div className="text-sm text-green-600">Total Purchases</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{data.totalSuppliers}</div>
                  <div className="text-sm text-purple-600">Active Suppliers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-purple-600" />
                Product Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {data.lowStockProducts.length > 0 ? (
                  data.lowStockProducts.map((product, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-700">{product.name}</div>
                      <div className="text-red-600">
                        Stock: {product.currentStock} (Min: {product.minStock})
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">All products are well stocked!</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'sale' ? <ShoppingCart className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.description}</div>
                      <div className="text-sm text-gray-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${activity.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 capitalize">{activity.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Dashboard data loaded from MongoDB database in real-time.</p>
          <p className="mt-1">Products: {data.totalProducts} | Sales: {data.totalSales} | Revenue: ${data.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
