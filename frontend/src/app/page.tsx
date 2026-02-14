"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
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
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock data - replace with actual API calls when available
// import { productApi } from "@/lib/api/products";
// import { saleApi } from "@/lib/api/sales";
// import { purchaseApi } from "@/lib/api/purchases";
// import { customerApi } from "@/lib/api/customers";
// import { supplierApi } from "@/lib/api/suppliers";

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalPurchases: number;
  averageOrderValue: number;
  monthlySales: Array<{
    month: string;
    revenue: number;
    sales: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topCustomers: Array<{
    id: number;
    name: string;
    totalSpent: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    sold: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock: number;
    minStock: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const products = Array.from({ length: 45 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, stock: Math.floor(Math.random() * 100) }));
      const sales = Array.from({ length: 156 }, (_, i) => ({ id: i + 1, totalAmount: Math.floor(Math.random() * 1000) + 100 }));
      const purchases = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, totalAmount: Math.floor(Math.random() * 2000) + 500 }));
      const customers = Array.from({ length: 43 }, (_, i) => ({ id: i + 1, name: `Customer ${i + 1}` }));
      const suppliers = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Supplier ${i + 1}` }));

      // Calculate metrics
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);
      const totalSales = sales.length;
      const totalProducts = products.length;
      const totalCustomers = customers.length;
      const totalSuppliers = suppliers.length;
      const totalPurchases = purchases.reduce((sum: number, purchase: any) => sum + purchase.totalAmount, 0);
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Generate monthly sales data
      const monthlySales = [
        { month: 'Jan', revenue: 4500, sales: 12 },
        { month: 'Feb', revenue: 5200, sales: 15 },
        { month: 'Mar', revenue: 4800, sales: 13 },
        { month: 'Apr', revenue: 6100, sales: 18 },
        { month: 'May', revenue: 5800, sales: 16 },
        { month: 'Jun', revenue: 7200, sales: 22 },
        { month: 'Jul', revenue: 6800, sales: 20 },
        { month: 'Aug', revenue: 8100, sales: 25 },
        { month: 'Sep', revenue: 9200, sales: 28 },
        { month: 'Oct', revenue: 8800, sales: 26 },
        { month: 'Nov', revenue: 10100, sales: 32 },
        { month: 'Dec', revenue: 11500, sales: 35 }
      ];

      // Generate category distribution
      const categoryDistribution = [
        { name: 'Electronics', value: 35, color: '#10b981' },
        { name: 'Clothing', value: 28, color: '#3b82f6' },
        { name: 'Home & Garden', value: 22, color: '#f59e0b' },
        { name: 'Others', value: 15, color: '#8b5cf6' }
      ];

      // Generate top customers
      const topCustomers = customers.slice(0, 5).map((customer: any, index: number) => ({
        id: customer.id,
        name: customer.name,
        totalSpent: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 50) + 10
      }));

      // Generate top products
      const topProducts = products.slice(0, 5).map((product: any, index: number) => ({
        id: product.id,
        name: product.name,
        sold: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }));

      // Generate low stock products
      const lowStockProducts = products.filter((p: any) => p.stock < 10).slice(0, 5).map((product: any) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
          minStock: 10
        }));

      // Generate recent activity
      const recentActivity = [
        { id: 1, type: 'sale', description: 'New sale completed', timestamp: '2 minutes ago', amount: 245 },
        { id: 2, type: 'product', description: 'Product added to inventory', timestamp: '15 minutes ago' },
        { id: 3, type: 'customer', description: 'New customer registered', timestamp: '1 hour ago' },
        { id: 4, type: 'purchase', description: 'Purchase order received', timestamp: '2 hours ago', amount: 1200 }
      ];

      setData({
        totalRevenue,
        totalSales,
        totalProducts,
        totalCustomers,
        totalSuppliers,
        totalPurchases,
        averageOrderValue,
        monthlySales,
        categoryDistribution,
        topCustomers,
        topProducts,
        lowStockProducts,
        recentActivity
      });

    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Loading your business insights...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Error loading dashboard data</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-full mx-auto px-4 lg:px-6 pt-6 pb-12 space-y-6">
          {/* Enhanced Header Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Business Dashboard
                      </h1>
                    </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-800">Live Data</span>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm font-medium">Today</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                    </div>
                  </div>
                </div>

          {/* Key Metrics Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-6">
            {/* Total Revenue */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl shadow-xl border border-emerald-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${data.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-white/80">This month</p>
                </div>
              </div>
            </div>
          </div>

            {/* Total Sales */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl border border-blue-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">+8.2%</span>
                  </div>
                </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Total Sales</p>
                    <p className="text-2xl font-bold text-white">{data.totalSales}</p>
                    <p className="text-xs text-white/80">Orders completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-3xl shadow-xl border border-purple-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Package className="h-6 w-6 text-white" />
                  </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">+5.1%</span>
                  </div>
                </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Total Products</p>
                    <p className="text-2xl font-bold text-white">{data.totalProducts}</p>
                    <p className="text-xs text-white/80">In inventory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl shadow-xl border border-orange-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Users className="h-6 w-6 text-white" />
                  </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">+15.3%</span>
                  </div>
                </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Total Customers</p>
                    <p className="text-2xl font-bold text-white">{data.totalCustomers}</p>
                    <p className="text-xs text-white/80">Active users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Suppliers */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-3xl shadow-xl border border-teal-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Truck className="h-6 w-6 text-white" />
                  </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">+3.7%</span>
                  </div>
                </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Total Suppliers</p>
                    <p className="text-2xl font-bold text-white">{data.totalSuppliers}</p>
                    <p className="text-xs text-white/80">Active partners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-3xl shadow-xl border border-red-400/30 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-white">
                      <ArrowDownRight className="h-4 w-4" />
                      <span className="text-sm font-semibold">Alert</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white/90">Low Stock</p>
                    <p className="text-2xl font-bold text-white">{data.lowStockProducts.length}</p>
                    <p className="text-xs text-white/80">Items need restock</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
            {/* Sales Performance Chart */}
            <div className="group">
              <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 h-[350px]">
                <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-4 lg:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Sales Performance</h3>
                        <p className="text-gray-600 font-medium">Revenue and sales count over the last 12 months</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Revenue</span>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Sales Count</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlySales}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#64748b" 
                          fontSize={12}
                          fontWeight={500}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12}
                          fontWeight={500}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#64748b" 
                          fontSize={12}
                          fontWeight={500}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            padding: '12px 16px'
                          }}
                          labelStyle={{
                            color: '#374151',
                            fontWeight: '600',
                            margin: 0
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone" 
                          dataKey="sales" 
                          yAxisId="right"
                          stroke="#10b981" 
                          strokeWidth={3}
                          fill="none"
                          strokeDasharray="0"
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers Component */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl shadow-xl border border-teal-200/50 hover:shadow-2xl transition-all duration-300 h-[350px]">
                <div className="relative p-4 lg:p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Top Customers</h3>
                        <p className="text-gray-600 text-sm">Most valuable customers & their activity</p>
                    </div>
                  </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-200 transition-colors">
                        This Month
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {data.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer.id} className="bg-white/70 rounded-xl p-3 border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${
                              index === 0 ? 'from-teal-500 to-teal-600' :
                              index === 1 ? 'from-cyan-500 to-cyan-600' :
                              index === 2 ? 'from-emerald-500 to-emerald-600' :
                              index === 3 ? 'from-blue-500 to-blue-600' :
                              'from-indigo-500 to-indigo-600'
                            } rounded-full flex items-center justify-center`}>
                              <span className="text-white font-semibold text-sm">
                                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                        <div>
                              <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                              <div className="text-xs text-gray-600">{customer.orders} orders</div>
                        </div>
                        </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">${customer.totalSpent.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total spent</div>
                      </div>
                    </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`${
                                index === 0 ? 'bg-teal-500' :
                                index === 1 ? 'bg-cyan-500' :
                                index === 2 ? 'bg-emerald-500' :
                                index === 3 ? 'bg-blue-500' :
                                'bg-indigo-500'
                              } h-1.5 rounded-full`} 
                              style={{ width: `${Math.max(20, (customer.totalSpent / 20000) * 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            index === 0 ? 'text-teal-600' :
                            index === 1 ? 'text-cyan-600' :
                            index === 2 ? 'text-emerald-600' :
                            index === 3 ? 'text-blue-600' :
                            'text-indigo-600'
                          }`}>
                            {Math.max(20, Math.floor((customer.totalSpent / 20000) * 100))}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-200">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-800">Total Revenue</span>
                      </div>
                      <span className="text-lg font-bold text-teal-900">
                        ${data.topCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-teal-700 mt-1">From top 5 customers this month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Performance Chart */}
            <div className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-xl border border-orange-200/50 hover:shadow-2xl transition-all duration-300 h-[350px]">
                <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 lg:p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                        <PieChart className="h-6 w-6 text-white" />
                      </div>
                        <div>
                        <h3 className="text-xl font-bold text-gray-900">Product Performance</h3>
                        <p className="text-gray-600 text-sm">Category breakdown and insights</p>
                        </div>
                        </div>
                      </div>
                  
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {/* Category Chart */}
                    <div className="col-span-2 h-[230px] overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={data.categoryDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={30}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {data.categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              padding: '8px 12px'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Category Breakdown */}
                    <div className="col-span-1 h-[230px] flex flex-col justify-center space-y-2">
                      {data.categoryDistribution.map((category, index) => (
                        <div key={category.name} className="bg-white/70 rounded-xl p-2 border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-2 h-2 rounded-full shadow-sm" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                        <div>
                                <div className="text-xs font-semibold text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-600">{Math.floor(Math.random() * 20) + 5} products</div>
                        </div>
                        </div>
                            <div className="text-right">
                              <div className="text-xs font-bold" style={{ color: category.color }}>{category.value}%</div>
                              <div className="text-xs text-gray-500">${(Math.random() * 50000 + 10000).toFixed(0)}</div>
                      </div>
                    </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full shadow-sm" 
                              style={{ 
                                width: `${category.value}%`,
                                background: `linear-gradient(to right, ${category.color}88, ${category.color})`
                              }}
                            ></div>
                  </div>
                </div>
                      ))}
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-semibold text-green-800">Top Performer</span>
                        </div>
                        <div className="text-xs text-green-700">Electronics category leads with highest revenue and consistent growth trend</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Recent Activity, Top Customers & Quick Actions */}
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
            {/* Recent Activity Timeline */}
            <div className="group">
              <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-gray-600 text-sm">Latest business events</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 transition-all duration-200">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'sale' ? 'bg-green-100' :
                          activity.type === 'product' ? 'bg-blue-100' :
                          activity.type === 'customer' ? 'bg-purple-100' :
                          'bg-orange-100'
                        }`}>
                          {activity.type === 'sale' ? <DollarSign className="h-4 w-4 text-green-600" /> :
                           activity.type === 'product' ? <Package className="h-4 w-4 text-blue-600" /> :
                           activity.type === 'customer' ? <Users className="h-4 w-4 text-purple-600" /> :
                           <Truck className="h-4 w-4 text-orange-600" />}
                          </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            {activity.amount && (
                              <span className="text-xs font-semibold text-green-600">${activity.amount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="group">
              <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
                      <p className="text-gray-600 text-sm">Best performing items</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.topProducts.slice(0, 4).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.sold} sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="group">
              <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                      <p className="text-gray-600 text-sm">Common tasks</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => router.push('/products/new')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                          </div>
                      <span className="text-sm font-medium text-gray-900">Add New Product</span>
                    </button>
                    <button 
                      onClick={() => router.push('/sales/pos')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                          </div>
                      <span className="text-sm font-medium text-gray-900">Create Sale</span>
                    </button>
                    <button 
                      onClick={() => router.push('/customers')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                        </div>
                      <span className="text-sm font-medium text-gray-900">Add Customer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}