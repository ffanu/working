"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Store, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  ShoppingBag,
  BarChart3
} from "lucide-react";

interface ShopStockData {
  shopId: string;
  shopName: string;
  totalProducts: number;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  products: ShopStock[];
}

interface ShopStock {
  _id: string;
  productId: string;
  productName: string;
  productSKU: string;
  warehouseId: string;  // This is actually the shop ID in the shop-wise context
  warehouseName: string; // This is actually the shop name in the shop-wise context
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  averageCost: number;
  location: string;
  lastUpdated: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

interface ShopSummary {
  totalShops: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  shopStats: Array<{
    ShopId: string;
    ShopName: string;
    ProductCount: number;
    TotalQuantity: number;
    TotalValue: number;
    LowStockCount: number;
    OutOfStockCount: number;
  }>;
}

interface UniqueProduct {
  productId: string;
  productName: string;
  productSKU: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  totalValue: number;
  shopCount: number;
  shops: Array<{
    shopId: string;
    shopName: string;
    availableQuantity: number;
    reservedQuantity: number;
    totalQuantity: number;
    averageCost: number;
  }>;
}

export default function ShopWiseStocksPage() {
  const [shopData, setShopData] = useState<ShopStockData[]>([]);
  const [uniqueProducts, setUniqueProducts] = useState<UniqueProduct[]>([]);
  const [summary, setSummary] = useState<ShopSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalvalue");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"shops" | "products">("products");

  useEffect(() => {
    loadData();
  }, [sortBy, sortDir]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load shop-wise stocks
      const stocksResponse = await fetch(
        `http://localhost:5236/api/warehousestocks/shop-wise?sortBy=${sortBy}&sortDir=${sortDir}`
      );
      const stocksData = await stocksResponse.json();
      const shopStocks = stocksData.data || [];
      setShopData(shopStocks);

      // Process data to create unique products view
      const productMap = new Map<string, UniqueProduct>();
      
      shopStocks.forEach((shop: ShopStockData) => {
        shop.products.forEach((product) => {
          const key = product.productId;
          
          if (productMap.has(key)) {
            const existing = productMap.get(key)!;
            existing.totalQuantity += product.totalQuantity;
            existing.availableQuantity += product.availableQuantity;
            existing.reservedQuantity += product.reservedQuantity;
            existing.totalValue += product.totalQuantity * product.averageCost;
            existing.shopCount += 1;
            existing.shops.push({
              shopId: shop.shopId,  // Use shop-level shopId
              shopName: shop.shopName, // Use shop-level shopName
              availableQuantity: product.availableQuantity,
              reservedQuantity: product.reservedQuantity,
              totalQuantity: product.totalQuantity,
              averageCost: product.averageCost
            });
          } else {
            productMap.set(key, {
              productId: product.productId,
              productName: product.productName,
              productSKU: product.productSKU,
              totalQuantity: product.totalQuantity,
              availableQuantity: product.availableQuantity,
              reservedQuantity: product.reservedQuantity,
              totalValue: product.totalQuantity * product.averageCost,
              shopCount: 1,
              shops: [{
                shopId: shop.shopId,  // Use shop-level shopId
                shopName: shop.shopName, // Use shop-level shopName
                availableQuantity: product.availableQuantity,
                reservedQuantity: product.reservedQuantity,
                totalQuantity: product.totalQuantity,
                averageCost: product.averageCost
              }]
            });
          }
        });
      });

      const uniqueProductsArray = Array.from(productMap.values());
      
      // Sort unique products
      uniqueProductsArray.sort((a, b) => {
        switch (sortBy) {
          case 'totalvalue':
            return sortDir === 'desc' ? b.totalValue - a.totalValue : a.totalValue - b.totalValue;
          case 'totalquantity':
            return sortDir === 'desc' ? b.totalQuantity - a.totalQuantity : a.totalQuantity - b.totalQuantity;
          case 'shopname':
          default:
            return sortDir === 'desc' 
              ? b.productName.localeCompare(a.productName)
              : a.productName.localeCompare(b.productName);
        }
      });
      
      setUniqueProducts(uniqueProductsArray);

      // Load summary
      const summaryResponse = await fetch('http://localhost:5236/api/warehousestocks/shop-wise/summary');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shopData.filter(shop =>
    shop.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = uniqueProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productSKU.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShopStatus = (shop: ShopStockData) => {
    if (shop.outOfStockItems > 0) return { label: "Has Out of Stock", color: "destructive", icon: XCircle };
    if (shop.lowStockItems > 0) return { label: "Has Low Stock", color: "destructive", icon: AlertTriangle };
    return { label: "Good Stock", color: "default", icon: CheckCircle };
  };

  const toggleShopExpansion = (shopId: string) => {
    setExpandedShop(expandedShop === shopId ? null : shopId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading shop-wise stocks...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {viewMode === "shops" ? "Shop-wise Stock Overview" : "Product Stock Summary"}
            </h1>
            <p className="text-gray-600">
              {viewMode === "shops" 
                ? "View stock levels organized by shop" 
                : "View unique products with total quantities across all shops"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("products")}
                className="rounded-r-none"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
              <Button
                variant={viewMode === "shops" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("shops")}
                className="rounded-l-none"
              >
                <Store className="h-4 w-4 mr-2" />
                Shops
              </Button>
            </div>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Shops</p>
                    <p className="text-2xl font-bold">{summary.totalShops}</p>
                  </div>
                  <Store className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {viewMode === "products" ? "Unique Products" : "Total Products"}
                    </p>
                    <p className="text-2xl font-bold">
                      {viewMode === "products" ? uniqueProducts.length : summary.totalProducts}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold">{summary.totalQuantity.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold">${summary.totalValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={viewMode === "shops" ? "Search shops..." : "Search products..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="totalvalue">Sort by Value</option>
                <option value="totalquantity">Sort by Quantity</option>
                <option value="totalproducts">Sort by Products</option>
                <option value="shopname">Sort by Name</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products View */}
        {viewMode === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const isExpanded = expandedShop === product.productId;
              
              return (
                <Card key={product.productId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {product.productName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          SKU: {product.productSKU} • {product.shopCount} locations
                        </p>
                      </div>
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {product.totalQuantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Available</p>
                        <p className="text-lg font-semibold">{product.availableQuantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Reserved</p>
                        <p className="text-lg font-semibold">{product.reservedQuantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="text-lg font-semibold">{product.totalQuantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-lg font-semibold">${product.totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShopExpansion(product.productId)}
                      className="w-full"
                    >
                      {isExpanded ? "Hide" : "Show"} Shop Details ({product.shops.length})
                    </Button>

                    {/* Expanded Shop List */}
                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-3">Stock by shop:</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {product.shops.map((shop) => (
                            <div key={shop.shopId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{shop.shopName}</p>
                                <p className="text-xs text-gray-600">Available: {shop.availableQuantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{shop.totalQuantity}</p>
                                <p className="text-xs text-gray-600">total</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Shop Cards */}
        {viewMode === "shops" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredShops.map((shop) => {
              const status = getShopStatus(shop);
              const StatusIcon = status.icon;
              const isExpanded = expandedShop === shop.shopId;
              
              return (
                <Card key={shop.shopId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          {shop.shopName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {shop.totalProducts} products • {shop.totalQuantity.toLocaleString()} total units
                        </p>
                      </div>
                      <Badge variant={status.color as any} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Available</p>
                        <p className="text-lg font-semibold">{shop.availableQuantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reserved</p>
                        <p className="text-lg font-semibold">{shop.reservedQuantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-lg font-semibold">${shop.totalValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-lg font-semibold text-orange-600">{shop.lowStockItems}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShopExpansion(shop.shopId)}
                      className="w-full"
                    >
                      {isExpanded ? "Hide" : "Show"} Products ({shop.products.length})
                    </Button>

                    {/* Expanded Product List */}
                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-3">Products in this shop:</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {shop.products.map((product) => (
                            <div key={product._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{product.productName}</p>
                                <p className="text-xs text-gray-600">{product.productSKU}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{product.availableQuantity}</p>
                                <p className="text-xs text-gray-600">available</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results Messages */}
        {viewMode === "products" && filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check if products have been added.</p>
            </CardContent>
          </Card>
        )}

        {viewMode === "shops" && filteredShops.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check if shops have been set up.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
