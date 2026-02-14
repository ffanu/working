"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Package, 
  Warehouse, 
  Store, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  category: string;
}

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  capacity: number;
}

interface Shop {
  _id: string;
  name: string;
  location: string;
  warehouseId: string;
}

interface WarehouseStock {
  _id: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;
  warehouseName: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  averageCost: number;
  location: string;
  lastUpdated: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
}


export default function TestWarehouseShopStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setTestResults([]);
      
      // Load all data in parallel
      const [productsRes, warehousesRes, shopsRes, stocksRes] = await Promise.all([
        fetch('http://localhost:5236/api/products'),
        fetch('http://localhost:5236/api/warehouses'),
        fetch('http://localhost:5236/api/shops'),
        fetch('http://localhost:5236/api/warehouse-stocks'),
      ]);

      const [productsData, warehousesData, shopsData, stocksData] = await Promise.all([
        productsRes.json(),
        warehousesRes.json(),
        shopsRes.json(),
        stocksRes.json()
      ]);

      setProducts(productsData);
      setWarehouses(warehousesData);
      setShops(shopsData);
      setWarehouseStocks(stocksData);

      addTestResult("✅ Data loaded successfully");
      addTestResult(`📦 Products: ${productsData.length}`);
      addTestResult(`🏭 Warehouses: ${warehousesData.length}`);
      addTestResult(`🏪 Shops: ${shopsData.length}`);
      addTestResult(`📊 Stock Records: ${stocksData.length}`);

    } catch (error) {
      console.error('Error loading data:', error);
      addTestResult(`❌ Error loading data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const initializeStocks = async () => {
    try {
      setLoading(true);
      addTestResult("🔄 Initializing warehouse stocks...");
      
      const response = await fetch('http://localhost:5236/api/stock-initialization/warehouse-stocks', {
        method: 'POST'
      });
      
      if (response.ok) {
        addTestResult("✅ Warehouse stocks initialized");
        await loadData();
      } else {
        addTestResult("❌ Failed to initialize warehouse stocks");
      }
    } catch (error) {
      addTestResult(`❌ Error initializing stocks: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const initializeShopStocks = async () => {
    try {
      setLoading(true);
      addTestResult("🔄 Initializing shop stocks...");
      
      const response = await fetch('http://localhost:5236/api/stock-initialization/shop-stocks', {
        method: 'POST'
      });
      
      if (response.ok) {
        addTestResult("✅ Shop stocks initialized");
        await loadData();
      } else {
        addTestResult("❌ Failed to initialize shop stocks");
      }
    } catch (error) {
      addTestResult(`❌ Error initializing shop stocks: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testStockTransfer = async () => {
    if (!selectedProduct || warehouses.length === 0 || shops.length === 0) {
      addTestResult("❌ Please select a product and ensure warehouses/shops exist");
      return;
    }

    try {
      setLoading(true);
      addTestResult(`🔄 Testing stock transfer for product: ${selectedProduct}`);
      
      const fromWarehouse = warehouses[0];
      const toShop = shops[0];
      const transferQuantity = 5;

      // Transfer stock from warehouse to shop
      const response = await fetch(`http://localhost:5236/api/stock-initialization/transfer/${selectedProduct}/${fromWarehouse._id}/${toShop._id}/${transferQuantity}`, {
        method: 'POST'
      });

      if (response.ok) {
        addTestResult(`✅ Stock transferred: ${transferQuantity} units from ${fromWarehouse.name} to ${toShop.name}`);
        await loadData();
      } else {
        addTestResult("❌ Failed to transfer stock");
      }
    } catch (error) {
      addTestResult(`❌ Error transferring stock: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testStockSale = async () => {
    if (!selectedProduct || shops.length === 0) {
      addTestResult("❌ Please select a product and ensure shops exist");
      return;
    }

    try {
      setLoading(true);
      addTestResult(`🔄 Testing stock sale for product: ${selectedProduct}`);
      
      const shop = shops[0];
      const saleQuantity = 2;

      // Update stock on sale
      const response = await fetch(`http://localhost:5236/api/stock-initialization/sale/${selectedProduct}/${shop._id}/${saleQuantity}`, {
        method: 'POST'
      });

      if (response.ok) {
        addTestResult(`✅ Stock sold: ${saleQuantity} units from ${shop.name}`);
        await loadData();
      } else {
        addTestResult("❌ Failed to process sale");
      }
    } catch (error) {
      addTestResult(`❌ Error processing sale: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getProductStockSummary = (productId: string) => {
    const productStocks = warehouseStocks.filter(stock => stock.productId === productId);
    const totalAvailable = productStocks.reduce((sum, stock) => sum + stock.availableQuantity, 0);
    const totalReserved = productStocks.reduce((sum, stock) => sum + stock.reservedQuantity, 0);
    const totalQuantity = productStocks.reduce((sum, stock) => sum + stock.totalQuantity, 0);
    const locations = productStocks.map(stock => ({
      name: stock.warehouseName,
      available: stock.availableQuantity,
      reserved: stock.reservedQuantity,
      total: stock.totalQuantity,
      isLowStock: stock.isLowStock,
      isOutOfStock: stock.isOutOfStock
    }));

    return {
      totalAvailable,
      totalReserved,
      totalQuantity,
      locations,
      count: productStocks.length
    };
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: "Out of Stock", color: "destructive", icon: XCircle };
    if (quantity <= 5) return { status: "Low Stock", color: "secondary", icon: AlertTriangle };
    return { status: "In Stock", color: "default", icon: CheckCircle };
  };

  const filteredStocks = selectedProduct 
    ? warehouseStocks.filter(stock => stock.productId === selectedProduct)
    : warehouseStocks;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouse & Shop Stock Test</h1>
            <p className="text-gray-600">Test warehouse-wise and shop-wise stock tracking</p>
          </div>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={initializeStocks} disabled={loading} className="w-full">
                Initialize Warehouse Stocks
              </Button>
              <Button onClick={initializeShopStocks} disabled={loading} className="w-full">
                Initialize Shop Stocks
              </Button>
              <Button onClick={testStockTransfer} disabled={loading || !selectedProduct} className="w-full">
                Test Stock Transfer
              </Button>
              <Button onClick={testStockSale} disabled={loading || !selectedProduct} className="w-full">
                Test Stock Sale
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Product for Testing:</label>
              <select 
                value={selectedProduct} 
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a product...</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet. Run some tests to see results here.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Stock Summary */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Product Stock Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const summary = getProductStockSummary(selectedProduct);
                const product = products.find(p => p._id === selectedProduct);
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{product?.name}</h3>
                        <p className="text-sm text-gray-600">SKU: {product?.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{summary.totalAvailable}</div>
                        <div className="text-sm text-gray-600">Available</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{summary.totalAvailable}</div>
                        <div className="text-sm text-gray-600">Available</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{summary.totalReserved}</div>
                        <div className="text-sm text-gray-600">Reserved</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{summary.totalQuantity}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Stock by Location:</h4>
                      {summary.locations.map((location, index) => {
                        const status = getStockStatus(location.available);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-4 w-4" />
                              <span className="font-medium">{location.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-semibold">{location.available}</div>
                                <div className="text-xs text-gray-600">Available</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{location.reserved}</div>
                                <div className="text-xs text-gray-600">Reserved</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{location.total}</div>
                                <div className="text-xs text-gray-600">Total</div>
                              </div>
                              <Badge variant={status.color as any}>
                                {status.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* All Stock Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              All Stock Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-left p-3">Available</th>
                    <th className="text-left p-3">Reserved</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => {
                    const status = getStockStatus(stock.availableQuantity);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={stock._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{stock.productName}</div>
                          <div className="text-sm text-gray-500">{stock.location}</div>
                        </td>
                        <td className="p-3 font-mono text-sm">{stock.productSKU}</td>
                        <td className="p-3">{stock.warehouseName}</td>
                        <td className="p-3">
                          <span className="font-medium">{stock.availableQuantity}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">{stock.reservedQuantity}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{stock.totalQuantity}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant={status.color as any} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {status.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(stock.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}
