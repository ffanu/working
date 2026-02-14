"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { Package, Warehouse, Store, RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category: string;
}

interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
}

export default function TestDataPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [productsRes, warehousesRes, shopsRes] = await Promise.all([
        fetch('http://localhost:5236/api/products'),
        fetch('http://localhost:5236/api/warehouses'),
        fetch('http://localhost:5236/api/shops')
      ]);

      if (!productsRes.ok) throw new Error(`Products API failed: ${productsRes.status}`);
      if (!warehousesRes.ok) throw new Error(`Warehouses API failed: ${warehousesRes.status}`);
      if (!shopsRes.ok) throw new Error(`Shops API failed: ${shopsRes.status}`);

      const [productsData, warehousesData, shopsData] = await Promise.all([
        productsRes.json(),
        warehousesRes.json(),
        shopsRes.json()
      ]);

      setProducts(productsData.data || productsData || []);
      setWarehouses(warehousesData.data || warehousesData || []);
      setShops(shopsData.data || shopsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test Data (No Auth Required)</h1>
              <p className="text-gray-600">Loading data from backend...</p>
            </div>
            <Button onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test Data (No Auth Required)</h1>
              <p className="text-red-600">Error loading data: {error}</p>
            </div>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Test Data (No Auth Required)</h1>
            <p className="text-gray-600">Direct API data without authentication</p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Total products in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warehouses.length}</div>
              <p className="text-xs text-muted-foreground">Storage locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shops.length}</div>
              <p className="text-xs text-muted-foreground">Retail locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">Category: {product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Qty: {product.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warehouses List */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <p className="text-sm text-gray-600">{warehouse.address}</p>
                    <p className="text-sm text-gray-600">{warehouse.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shops List */}
        <Card>
          <CardHeader>
            <CardTitle>Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{shop.name}</h3>
                    <p className="text-sm text-gray-600">{shop.address}</p>
                    <p className="text-sm text-gray-600">{shop.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>To Access Full Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                This page shows data without authentication. To access the full dashboard with all features:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="/login" className="text-blue-600 hover:underline">Login Page</a></li>
                <li>Use credentials: <strong>admin</strong> / <strong>admin123</strong></li>
                <li>Access the full dashboard with analytics and management features</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The main dashboard requires authentication to protect sensitive business data.
                  This test page bypasses authentication for demonstration purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
