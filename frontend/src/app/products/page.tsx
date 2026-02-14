"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";

import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  MoreHorizontal,
  Grid3X3,
  List,
  Eye,
  BarChart3,
  X,
  DollarSign,
  Truck,
  Tag
} from "lucide-react";
import { ProductForm } from "@/components/forms/ProductForm";
import { productApi, supplierApi } from "@/lib/api";
import { Product, Supplier } from "@/types/inventory";

export default function ProductsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [advancedFilters, setAdvancedFilters] = useState({
    category: '',
    supplier: '',
    priceRange: { min: 0, max: 10000 },
    stockStatus: '',
    tags: [] as string[]
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    // Only load data if we have meaningful changes
    if (searchTerm !== '' || page > 1 || sortBy !== 'createdAt' || sortDir !== 'desc' || 
        Object.values(advancedFilters).some(v => 
          Array.isArray(v) ? v.length > 0 : 
          typeof v === 'string' ? v !== '' :
          typeof v === 'object' ? (v as any).min !== 0 || (v as any).max !== 10000 :
          v !== 0
        )) {
      loadData();
    } else if (searchTerm === '' && page === 1 && sortBy === 'createdAt' && sortDir === 'desc') {
      // Load initial data
      loadData();
    }
  }, [searchTerm, sortBy, sortDir, page, pageSize, advancedFilters]);

  // Extract available categories and tags from products
  useEffect(() => {
    if (products.length > 0) {
      const categories = [...new Set(products.map(p => p.category))].sort();
      const allTags = products.flatMap(p => p.tags || []).filter(Boolean);
      const uniqueTags = [...new Set(allTags)].sort();
      
      setAvailableCategories(categories);
      setAvailableTags(uniqueTags);
    }
  }, [products]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        setPage(1);
      }
    }, 500); // Increased to 500ms for smoother experience

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  // Maintain focus on search input
  useEffect(() => {
    if (searchInputRef.current && !loading) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productResult, suppliersResult] = await Promise.all([
        productApi.getAll({ search: searchTerm, sortBy, sortDir, page, pageSize }),
        supplierApi.getAll()
      ]);
      setProducts(productResult.data);
      setTotal(productResult.total);
      setSuppliers(suppliersResult.data || suppliersResult);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Out of Stock", color: "destructive", icon: XCircle };
    if (stock <= 5) return { status: "Low Stock", color: "secondary", icon: AlertTriangle };
    return { status: "In Stock", color: "default", icon: CheckCircle };
  };

  // Bulk operations
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id || p._id || ''));
    }
  };

  const bulkUpdateStock = async (newStock: number) => {
    try {
      const promises = selectedProducts.map(productId => 
        productApi.update(productId, { quantity: newStock })
      );
      await Promise.all(promises);
      setSelectedProducts([]);
      await loadData();
    } catch (err) {
      setError('Failed to update stock for selected products');
    }
  };

  const bulkDeleteProducts = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    
    try {
      const promises = selectedProducts.map(productId => 
        productApi.delete(productId)
      );
      await Promise.all(promises);
      setSelectedProducts([]);
      await loadData();
    } catch (err) {
      setError('Failed to delete selected products');
    }
  };

  const exportSelectedProducts = () => {
    const selectedProductData = products.filter(p => 
      selectedProducts.includes(p.id || p._id || '')
    );
    
    const csvContent = [
      ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Supplier', 'Description'],
      ...selectedProductData.map(p => [
        p.name,
        p.sku,
        p.category,
        p.price.toString(),
        p.quantity.toString(),
        p.supplier,
        p.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_products_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await productApi.create({
        name: productData.name,
        sku: productData.sku || `SKU${Date.now()}`,
        category: productData.category,
        price: productData.price,
        costPrice: productData.costPrice || 0,
        quantity: productData.stock,
        supplier: productData.supplierName || "",
        description: productData.description || "",
        unit: productData.unit || "pcs",
        minStockLevel: productData.minStockLevel || 0,
        reorderPoint: productData.reorderPoint || 0,
        isActive: productData.isActive ?? true,
        // Additional fields
        barcode: productData.barcode || "",
        weight: productData.weight || 0,
        dimensions: productData.dimensions || "",
        tags: productData.tags || [],
        imageUrls: productData.images || [],
        mainImageUrl: productData.mainImage || null,
      });
      // Refresh the data to show the new product
      await loadData();
      // Notify other components that a new product was added
      localStorage.setItem('productAdded', 'true');
    } catch (err) {
      setError('Failed to add product');
      console.error('Error adding product:', err);
    }
  };

  const handleEditProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      setLoading(true);
      console.log('Updating product with data:', productData);
      console.log('Product ID:', editingProduct.id || editingProduct._id);
      
      // Validate required fields
      if (!productData.name || productData.name.trim() === "") {
        throw new Error("Product name is required");
      }
      
      if (productData.price === undefined || productData.price === null || isNaN(Number(productData.price)) || Number(productData.price) < 0) {
        throw new Error("Valid price is required");
      }
      
      if (productData.stock === undefined || productData.stock === null || isNaN(Number(productData.stock)) || Number(productData.stock) < 0) {
        throw new Error("Valid quantity is required");
      }

      const updatePayload = {
        name: productData.name.trim(),
        sku: productData.sku || "",
        category: productData.category || "",
        price: Number(productData.price),
        costPrice: Number(productData.costPrice) || 0,
        quantity: Number(productData.stock),
        supplier: productData.supplierName || "",
        description: productData.description || "",
        unit: productData.unit || "pcs",
        minStockLevel: Number(productData.minStockLevel) || 0,
        reorderPoint: Number(productData.reorderPoint) || 0,
        isActive: productData.isActive ?? true,
        // Additional fields
        barcode: productData.barcode || "",
        weight: Number(productData.weight) || 0,
        dimensions: productData.dimensions || "",
        tags: productData.tags || [],
        imageUrls: productData.images || [],
        mainImageUrl: productData.mainImage || null,
      };
      
      console.log('Update payload:', updatePayload);
      console.log('Payload JSON:', JSON.stringify(updatePayload));
      
      const result = await productApi.update(editingProduct.id || editingProduct._id || '', updatePayload);
      
      console.log('Update result:', result);
      
      // Refresh the data to show the updated product
      await loadData();
      setError(null); // Clear any previous errors
      console.log('Product updated successfully');
      
      // Close the form after successful update
      closeForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to update product: ${errorMessage}`);
      console.error('Error updating product:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        productData,
        editingProduct
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData: any) => {
    if (editingProduct) {
      await handleEditProduct(productData);
    } else {
      await handleAddProduct(productData);
    }
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Pagination handlers
  const totalPages = Math.ceil(total / pageSize);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Calculate summary stats
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockCount = products.filter(p => p.quantity <= 5 && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-700 mb-2">Loading Products</div>
            <div className="text-gray-500">Please wait while we fetch your inventory...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-6">
          <div className="p-4 bg-red-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</div>
            <div className="text-gray-500 mb-4">{error}</div>
            <Button 
              onClick={loadData}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and track stock levels
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Products</span>
            </div>
            <div className="text-2xl font-bold mt-2">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
            </div>
            <div className="text-2xl font-bold mt-2">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Low Stock</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Analytics
          </CardTitle>
          <CardDescription>Key insights and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Top Categories */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Top Categories</h4>
              <div className="space-y-1">
                {Object.entries(
                  products.reduce((acc, p) => {
                    acc[p.category] = (acc[p.category] || 0) + 1;
                    return acc;
                  }, {} as { [key: string]: number })
                )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-medium">{count} products</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Price Distribution */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Price Distribution</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Under $50</span>
                  <span className="font-medium">
                    {products.filter(p => p.price < 50).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">$50 - $200</span>
                  <span className="font-medium">
                    {products.filter(p => p.price >= 50 && p.price < 200).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Over $200</span>
                  <span className="font-medium">
                    {products.filter(p => p.price >= 200).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Insights */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Stock Insights</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">High Stock (&gt;50)</span>
                  <span className="font-medium text-green-600">
                    {products.filter(p => p.quantity > 50).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medium Stock (10-50)</span>
                  <span className="font-medium text-yellow-600">
                    {products.filter(p => p.quantity >= 10 && p.quantity <= 50).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Low Stock (&lt;10)</span>
                  <span className="font-medium text-red-600">
                    {products.filter(p => p.quantity < 10).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            Smart Filters & Search
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Find products with advanced filtering and real-time search capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Enhanced Search */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="pl-12 pr-12 h-12 w-full rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="🔍 Search products by name, SKU, or category..."
                      value={searchInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setSearchTerm(searchInput);
                          setPage(1);
                        }
                      }}
                      autoFocus
                      disabled={loading}
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {searchInput && !loading && (
                      <button
                        onClick={() => {
                          setSearchInput('');
                          setSearchTerm('');
                          setPage(1);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                  {Object.values(advancedFilters).some(v => 
                    Array.isArray(v) ? v.length > 0 : 
                    typeof v === 'string' ? v !== '' :
                    typeof v === 'object' ? (v as any).min !== 0 || (v as any).max !== 10000 :
                    v !== 0
                  ) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </Button>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <Button
                    type="button"
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none h-10 px-4 transition-all duration-200"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none h-10 px-4 transition-all duration-200"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={() => setIsFormOpen(true)} 
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={advancedFilters.category}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <select
                    value={advancedFilters.supplier}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id || supplier._id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Status</label>
                  <select
                    value={advancedFilters.stockStatus}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={advancedFilters.priceRange.min}
                      onChange={(e) => setAdvancedFilters(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                      }))}
                      className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={advancedFilters.priceRange.max}
                      onChange={(e) => setAdvancedFilters(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) || 10000 }
                      }))}
                      className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const isSelected = advancedFilters.tags.includes(tag);
                          setAdvancedFilters(prev => ({
                            ...prev,
                            tags: isSelected 
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          advancedFilters.tags.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAdvancedFilters({
                        category: '',
                        supplier: '',
                        priceRange: { min: 0, max: 10000 },
                        stockStatus: '',
                        tags: []
                      });
                    }}
                    className="flex-1"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => setPage(1)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStock = prompt('Enter new stock level:');
                    if (newStock !== null) {
                      bulkUpdateStock(Number(newStock));
                    }
                  }}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Update Stock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSelectedProducts}
                  className="text-purple-700 border-purple-300 hover:bg-purple-100"
                >
                  Export CSV
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={bulkDeleteProducts}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Display */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Product Inventory
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2 text-base">
                📦 Showing <span className="font-semibold text-blue-600">{products.length}</span> of <span className="font-semibold text-gray-800">{total}</span> products
                {searchTerm && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    for "{searchTerm}"
                  </span>
                )}
              </CardDescription>
            </div>
            {products.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllProducts}
                  className="text-sm"
                >
                  {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full bg-white">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-blue-50/50 transition-colors duration-200 group" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                      Product Name
                      {sortBy === "name" && (
                        <span className="text-blue-600 font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-blue-50/50 transition-colors duration-200 group" onClick={() => handleSort("sku")}>
                    <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                      SKU
                      {sortBy === "sku" && (
                        <span className="text-blue-600 font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-blue-50/50 transition-colors duration-200 group" onClick={() => handleSort("category")}>
                    <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                      Category
                      {sortBy === "category" && (
                        <span className="text-blue-600 font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-sm cursor-pointer hover:bg-blue-50/50 transition-colors duration-200 group" onClick={() => handleSort("price")}>
                    <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                      Price
                      {sortBy === "price" && (
                        <span className="text-blue-600 font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={selectAllProducts}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-sm text-gray-700">Stock</th>
                  <th className="text-left p-4 font-semibold text-sm text-gray-700">Supplier</th>
                  <th className="text-left p-4 font-semibold text-sm text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockInfo = getStockStatus(product.quantity);
                  const StockIcon = stockInfo.icon;
                  
                  return (
                    <tr key={product.id || product._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200 group">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id || product._id || '')}
                          onChange={() => toggleProductSelection(product.id || product._id || '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="p-4">
                        <div className="group-hover:translate-x-1 transition-transform duration-200">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold font-mono text-blue-700 group-hover:bg-blue-100 transition-colors duration-200">
                          {product.sku}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {product.quantity}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 truncate max-w-32 group-hover:text-gray-800 transition-colors duration-200">
                          {product.supplier}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold w-fit shadow-sm hover:shadow-md transition-all duration-200 ${
                          stockInfo.color === 'destructive' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' :
                          stockInfo.color === 'secondary' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' :
                          'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                        }`}>
                          <StockIcon className="h-3 w-3" />
                          {stockInfo.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditForm(product)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setViewingProduct(product)}
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-all duration-200 rounded-lg"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700 mb-2">
                    {searchTerm ? 'No products found' : 'No products yet'}
                  </div>
                  <div className="text-gray-500 mb-6">
                    {searchTerm 
                      ? `No products match your search for "${searchTerm}"`
                      : 'Get started by adding your first product to the inventory'
                    }
                  </div>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Product
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const stockInfo = getStockStatus(product.quantity);
                const StockIcon = stockInfo.icon;
                
                return (
                  <Card key={product.id || product._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {product.mainImage ? (
                          <img 
                            src={product.mainImage} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              const nextElement = target.nextElementSibling as HTMLElement;
                              if (nextElement) nextElement.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="hidden items-center justify-center text-gray-400">
                          <Package className="h-12 w-12" />
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                            stockInfo.color === 'destructive' ? 'bg-red-100 text-red-700 border-red-200' :
                            stockInfo.color === 'secondary' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            <StockIcon className="h-3 w-3" />
                            {stockInfo.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Stock: {product.quantity}</span>
                          <span className="font-mono text-xs">{product.sku}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{product.category}</span>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditForm(product)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} products
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <select 
                    value={pageSize.toString()} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="h-8 rounded border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(1)} 
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(totalPages)} 
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        product={editingProduct || undefined}
        suppliers={suppliers}
      />

      {/* Product View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">Product Details</CardTitle>
                    <CardDescription>{viewingProduct.name}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewingProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product Name</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">SKU</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md font-mono">{viewingProduct.sku || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.category || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Unit</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.unit}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.description || 'No description provided'}</div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Selling Price</label>
                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md font-semibold text-green-700">
                      ${viewingProduct.price.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cost Price</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                      ${viewingProduct.costPrice?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profit Margin</label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md font-semibold text-blue-700">
                      {viewingProduct.costPrice && viewingProduct.price > 0 
                        ? `${(((viewingProduct.price - viewingProduct.costPrice) / viewingProduct.price) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Inventory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Stock</label>
                    <div className={`mt-1 p-3 border rounded-md font-semibold ${
                      viewingProduct.quantity === 0 ? 'bg-red-50 border-red-200 text-red-700' :
                      viewingProduct.quantity <= (viewingProduct.minStockLevel || 10) ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      {viewingProduct.quantity} {viewingProduct.unit}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Min Stock Level</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.minStockLevel || 10}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reorder Point</label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.reorderPoint || 25}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              {viewingProduct.supplier && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-orange-600" />
                    Supplier
                  </h3>
                  <div className="p-3 bg-gray-50 border rounded-md">{viewingProduct.supplier}</div>
                </div>
              )}

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-teal-600" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingProduct.barcode && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Barcode</label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md font-mono">{viewingProduct.barcode}</div>
                    </div>
                  )}
                  {viewingProduct.weight && viewingProduct.weight > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Weight</label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.weight} kg</div>
                    </div>
                  )}
                  {viewingProduct.dimensions && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dimensions</label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingProduct.dimensions}</div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={viewingProduct.isActive ? "default" : "secondary"}>
                        {viewingProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {viewingProduct.createdAt ? new Date(viewingProduct.createdAt).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {viewingProduct.updatedAt ? new Date(viewingProduct.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4 bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewingProduct(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setViewingProduct(null);
                openEditForm(viewingProduct);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
} 