"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck
} from "lucide-react";
import { API_CONFIG } from '@/lib/config';

interface DashboardData {
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalRevenue: number;
}

export default function TestDashboardPage() {
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

      console.log('Starting dashboard data fetch...');

      // Fetch data directly from backend APIs
      const [productsRes, salesRes, customersRes, suppliersRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMERS}`),
        fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS}`)
      ]);

      console.log('API responses received:', {
        products: productsRes.status,
        sales: salesRes.status,
        customers: customersRes.status,
        suppliers: suppliersRes.status
      });

      // Parse responses
      const products = await productsRes.json();
      const sales = await salesRes.json();
      const customers = await customersRes.json();
      const suppliers = await suppliersRes.json();

      console.log('Parsed API data:', {
        products: products,
        sales: sales,
        customers: customers,
        suppliers: suppliers
      });

      // Extract data arrays
      const productsData = products.data || products;
      const salesData = sales.data || sales;
      const customersData = customers.data || customers;
      const suppliersData = suppliers.data || suppliers;

      console.log('Extracted data arrays:', {
        productsLength: productsData?.length || 0,
        salesLength: salesData?.length || 0,
        customersLength: customersData?.length || 0,
        suppliersLength: suppliersData?.length || 0
      });

      // Calculate analytics
      const totalProducts = productsData?.length || 0;
      const totalSales = salesData?.length || 0;
      const totalCustomers = customersData?.length || 0;
      const totalSuppliers = suppliersData?.length || 0;
      const totalRevenue = salesData?.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0) || 0;

      const dashboardData = {
        totalProducts,
        totalSales,
        totalCustomers,
        totalSuppliers,
        totalRevenue
      };

      console.log('Calculated dashboard data:', dashboardData);
      setData(dashboardData);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
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
              Loading Test Dashboard...
            </h1>
            <p className="text-xl text-gray-600">
              Testing API calls without authentication
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
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
              <div className="text-red-800 text-lg font-medium mb-2">Failed to Load Data</div>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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
            Test Dashboard - No Authentication
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Testing if API calls work without authentication
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-800">
                ✅ API Calls Working Successfully!
              </h3>
              <p className="text-green-700 mt-1">
                This dashboard shows real data fetched directly from your MongoDB database.
                <br />
                <strong>Products:</strong> {data.totalProducts} | <strong>Sales:</strong> {data.totalSales} | <strong>Revenue:</strong> ${data.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Products</CardTitle>
              <Package className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalProducts}</div>
              <p className="text-sm text-blue-200 flex items-center mt-2">
                <TrendingUp className="mr-1 h-4 w-4" />
                In inventory
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
                <TrendingUp className="mr-1 h-4 w-4" />
                Transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${data.totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-purple-200 flex items-center mt-2">
                <TrendingUp className="mr-1 h-4 w-4" />
                Total earnings
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

        {/* Debug Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Raw data from API calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>Products API: {data.totalProducts} items</div>
              <div>Sales API: {data.totalSales} items</div>
              <div>Customers API: {data.totalCustomers} items</div>
              <div>Suppliers API: {data.totalSuppliers} items</div>
              <div>Total Revenue: ${data.totalRevenue.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>If you see the correct numbers above, the API calls are working!</p>
          <p className="mt-1">Check the browser console for detailed debugging information.</p>
        </div>
      </div>
    </div>
  );
}
