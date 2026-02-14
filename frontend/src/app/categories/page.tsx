"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { categoryApi } from "@/lib/api/categories";
import { productApi, saleApi, stockMovementsApi } from "@/lib/api";
import { Category } from "@/types/inventory";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FolderOpen, 
  Settings, 
  X,
  Layers,
  Tag,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Sparkles,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  Eye,
  MoreHorizontal,
  Copy,
  Archive,
  TrendingDown,
  Calendar,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

export default function CategoriesPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [analyticsCategory, setAnalyticsCategory] = useState<Category | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    growthRate: number;
    recentActivities: any[];
    stockDistribution: {
      highStock: number;
      mediumStock: number;
      lowStock: number;
      outOfStock: number;
    };
    loading: boolean;
  }>({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    growthRate: 0,
    recentActivities: [],
    stockDistribution: {
      highStock: 0,
      mediumStock: 0,
      lowStock: 0,
      outOfStock: 0
    },
    loading: false
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    loadCategories();
  }, [searchTerm, currentPage, pageSize]);

  useEffect(() => {
    if (categories.length > 0) {
      setTotalPages(Math.ceil(totalItems / pageSize));
    }
  }, [pageSize, totalItems]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Maintain focus on search input after loading
  useEffect(() => {
    if (searchInputRef.current && !loading && searchInput) {
      searchInputRef.current.focus();
    }
  }, [loading, searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const target = event.target as Element;
        // Don't close if clicking inside the dropdown or on the dropdown button
        if (!target.closest('[data-dropdown-menu]') && !target.closest('[data-dropdown-button]')) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryApi.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        sortBy: 'name',
        sortDir: 'asc'
      });
      
      // Handle both paginated and non-paginated responses
      if (result.data) {
        setCategories(result.data);
        setTotalItems(result.total || result.data.length);
        setTotalPages(Math.ceil((result.total || result.data.length) / pageSize));
      } else {
        // Fallback to getAllCategories if getAll doesn't return paginated data
        const fallbackResult = await categoryApi.getAllCategories();
        setCategories(fallbackResult);
        setTotalItems(fallbackResult.length);
        setTotalPages(Math.ceil(fallbackResult.length / pageSize));
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await loadCategories(); // Reload the list
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleCloseView = () => {
    setViewingCategory(null);
  };

  const loadAnalyticsData = async (category: Category) => {
    setAnalyticsData(prev => ({ ...prev, loading: true }));
    
    try {
      // Get all products to filter by category
      const allProductsResponse = await productApi.getAll();
      const allProducts = allProductsResponse.data || [];
      
      // Filter products by category name (since we don't have category ID filtering in API)
      console.log('Filtering products for category:', category.name);
      console.log('Available products:', allProducts.map((p: any) => ({ name: p.name, category: p.category })));
      
      const categoryProducts = allProducts.filter((product: any) => {
        // Normalize strings for comparison (trim whitespace and handle case)
        const productCategory = (product.category || '').toString().trim();
        const productCategoryName = (product.categoryName || '').toString().trim();
        const categoryName = (category.name || '').toString().trim();
        const categoryId = category.id || category._id;
        
        const matches = productCategory === categoryName || 
                       productCategoryName === categoryName ||
                       product.categoryId === categoryId ||
                       // Also try case-insensitive comparison
                       productCategory.toLowerCase() === categoryName.toLowerCase();
        
        if (matches) {
          console.log('Found matching product:', product.name, 'with category:', product.category);
        }
        
        return matches;
      });
      
      console.log('Found', categoryProducts.length, 'products for category', category.name);
      
      const totalProducts = categoryProducts.length;
      const activeProducts = categoryProducts.filter((product: any) => product.isActive !== false).length;
      
      // Get sales data for these products
      const allSalesResponse = await saleApi.getAll();
      const allSales = allSalesResponse.data || [];
      
      // Calculate total sales for this category's products
      let totalSales = 0;
      const productIds = categoryProducts.map((p: any) => p.id || p._id);
      
      allSales.forEach((sale: any) => {
        if (sale.items) {
          sale.items.forEach((item: any) => {
            if (productIds.includes(item.productId)) {
              totalSales += (item.price || 0) * (item.quantity || 0);
            }
          });
        }
      });
      
      // Calculate growth rate based on recent vs older sales
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      let recentSales = 0;
      let olderSales = 0;
      
      allSales.forEach((sale: any) => {
        const saleDate = new Date(sale.date || sale.createdAt);
        if (sale.items) {
          sale.items.forEach((item: any) => {
            if (productIds.includes(item.productId)) {
              const saleAmount = (item.price || 0) * (item.quantity || 0);
              if (saleDate >= thirtyDaysAgo) {
                recentSales += saleAmount;
              } else if (saleDate >= sixtyDaysAgo) {
                olderSales += saleAmount;
              }
            }
          });
        }
      });
      
      const growthRate = olderSales > 0 ? ((recentSales - olderSales) / olderSales) * 100 : 0;
      
      // Get recent stock movements for activity feed
      const stockMovements = await stockMovementsApi.getAll();
      const recentActivities = (stockMovements || [])
        .filter((movement: any) => {
          return productIds.includes(movement.productId);
        })
        .slice(0, 5)
        .map((movement: any) => ({
          action: movement.type === 'in' ? 'Stock Added' : 
                  movement.type === 'out' ? 'Stock Removed' : 
                  movement.type === 'sale' ? 'Product Sold' : 'Stock Updated',
          item: movement.productName || 'Unknown Product',
          time: new Date(movement.date || movement.createdAt).toLocaleDateString(),
          type: movement.type === 'in' ? 'success' : 
                movement.type === 'out' ? 'warning' : 
                movement.type === 'sale' ? 'info' : 'info'
        }));
      
      // Calculate stock distribution
      let highStock = 0;
      let mediumStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      
      categoryProducts.forEach((product: any) => {
        const quantity = product.quantity || 0;
        const reorderPoint = product.reorderPoint || product.minStockLevel || 10; // Default to 10 if no reorder point
        const highStockThreshold = reorderPoint * 2;
        
        if (quantity === 0) {
          outOfStock++;
        } else if (quantity <= reorderPoint) {
          lowStock++;
        } else if (quantity <= highStockThreshold) {
          mediumStock++;
        } else {
          highStock++;
        }
      });
      
      const stockDistribution = {
        highStock,
        mediumStock,
        lowStock,
        outOfStock
      };
      
      setAnalyticsData({
        totalProducts,
        activeProducts,
        totalSales,
        growthRate,
        recentActivities,
        stockDistribution,
        loading: false
      });
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleViewAnalytics = async (category: Category) => {
    setAnalyticsCategory(category);
    setOpenDropdown(null);
    await loadAnalyticsData(category);
  };

  const handleCloseAnalytics = () => {
    setAnalyticsCategory(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleToggleDropdown = (categoryId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (openDropdown === categoryId) {
      setOpenDropdown(null);
      return;
    }

    // Calculate position for fixed dropdown
    const button = buttonRefs.current[categoryId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 224 // 224px is dropdown width (56 * 4)
      });
    }

    setOpenDropdown(categoryId);
  };

  const handleDuplicateCategory = async (category: Category) => {
    try {
      const duplicatedCategory = {
        ...category,
        name: `${category.name} (Copy)`,
        code: `${category.code}_COPY_${Date.now()}`,
        id: undefined,
        _id: undefined
      };
      await categoryApi.create(duplicatedCategory);
      await loadCategories();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error duplicating category:', err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await categoryApi.delete(categoryId);
        await loadCategories();
        setOpenDropdown(null);
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const updatedCategory = { ...category, isActive: !category.isActive };
      await categoryApi.update(category.id || category._id || '', updatedCategory);
      await loadCategories();
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error updating category status:', err);
    }
  };

  // Using server-side filtering with pagination, so no client-side filtering needed
  const filteredCategories = categories;

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Error Loading Categories</h2>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => loadCategories()} className="mt-2">Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 mb-6 border border-white/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                    Category Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Organize and structure your product categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Real-time sync</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowForm(true)} 
                className="h-10 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Search Section */}
      <Card className="mb-8 bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories by name, code, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchTerm(searchInput);
                  setCurrentPage(1);
                }
              }}
              className="pl-12 h-12 w-full rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id || category._id} className="group relative bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color || '#10b981' }}></div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </CardTitle>
                </div>
                <Badge 
                  variant={category.isDefault ? "default" : "secondary"}
                  className={`${
                    category.isDefault 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.isDefault ? "Default" : category.level === 1 ? "Root" : "Sub"}
                </Badge>
              </div>
              <CardDescription className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-mono">{category.code}</span>
                  <span>•</span>
                  <span>Level {category.level}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {category.description || "No description provided"}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Products</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{category.productCount || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/30">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Value</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${category.totalValue || 0}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                  onClick={() => handleViewCategory(category)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="relative">
                  <Button 
                    ref={(el) => { buttonRefs.current[category.id || category._id || ''] = el; }}
                    variant="outline" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                    onClick={(e) => handleToggleDropdown(category.id || category._id || '', e)}
                    data-dropdown-button
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-0"></div>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredCategories.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} categories
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <span className="text-sm text-gray-600">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {totalPages > 1 && (
              <>
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {filteredCategories.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200/50 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FolderOpen className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No categories found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              {searchInput ? `No categories match "${searchInput}"` : "Get started by creating your first category"}
            </p>
            {!searchInput && (
              <Button 
                onClick={() => setShowForm(true)}
                className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory || undefined}
          onSave={handleSaveCategory}
          onCancel={handleCancelForm}
          parentCategories={categories.filter(c => c.id !== editingCategory?.id && c._id !== editingCategory?._id)}
        />
      )}

      {/* Category View Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Category Details</h2>
              <Button variant="ghost" size="sm" onClick={handleCloseView}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingCategory.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingCategory.code}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingCategory.description || 'No description provided'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={viewingCategory.isActive ? "default" : "secondary"}>
                      {viewingCategory.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Products</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingCategory.productCount || 0}</div>
                </div>
              </div>

              {viewingCategory.parentCategoryName && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Parent Category</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">{viewingCategory.parentCategoryName}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                    {viewingCategory.createdAt ? new Date(viewingCategory.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Updated At</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                    {viewingCategory.updatedAt ? new Date(viewingCategory.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {viewingCategory.tags && viewingCategory.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {viewingCategory.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseView}>
                Close
              </Button>
              <Button onClick={() => {
                handleCloseView();
                handleEditCategory(viewingCategory);
              }}>
                Edit Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Analytics Modal */}
      {analyticsCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Category Analytics</h2>
                  <p className="text-gray-600">{analyticsCategory.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseAnalytics}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {analyticsData.loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading analytics...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Products */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Total Products</p>
                        <p className="text-2xl font-bold text-blue-900">{analyticsData.totalProducts}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Active Products */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Active Products</p>
                        <p className="text-2xl font-bold text-green-900">{analyticsData.activeProducts}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Total Sales */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Total Sales</p>
                        <p className="text-2xl font-bold text-orange-900">${analyticsData.totalSales.toFixed(2)}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Rate */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Growth Rate</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {analyticsData.growthRate >= 0 ? '+' : ''}{analyticsData.growthRate.toFixed(1)}%
                        </p>
                      </div>
                      {analyticsData.growthRate >= 0 ? (
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-purple-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sales Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Trend (Last 6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Product Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.totalProducts > 0 ? (
                    <div className="space-y-3">
                      {/* High Stock */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">High Stock</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(analyticsData.stockDistribution.highStock / analyticsData.totalProducts) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((analyticsData.stockDistribution.highStock / analyticsData.totalProducts) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Medium Stock */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Medium Stock</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-yellow-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(analyticsData.stockDistribution.mediumStock / analyticsData.totalProducts) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((analyticsData.stockDistribution.mediumStock / analyticsData.totalProducts) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Low Stock */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Low Stock</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-red-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(analyticsData.stockDistribution.lowStock / analyticsData.totalProducts) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((analyticsData.stockDistribution.lowStock / analyticsData.totalProducts) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Out of Stock */}
                      {analyticsData.stockDistribution.outOfStock > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-600">Out of Stock</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-red-600 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${(analyticsData.stockDistribution.outOfStock / analyticsData.totalProducts) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-red-600">
                              {Math.round((analyticsData.stockDistribution.outOfStock / analyticsData.totalProducts) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Stock Summary */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Total Products:</span> {analyticsData.totalProducts}
                          </div>
                          <div>
                            <span className="font-medium">Need Attention:</span> {analyticsData.stockDistribution.lowStock + analyticsData.stockDistribution.outOfStock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No products in this category</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recentActivities.length > 0 ? analyticsData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'info' ? 'bg-blue-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-gray-600 text-xs">{activity.item}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No recent activity for this category</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseAnalytics}>
                Close
              </Button>
              <Button onClick={() => {
                handleCloseAnalytics();
                // Could open detailed reports here
                alert('Detailed reports feature coming soon!');
              }}>
                View Detailed Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Position Dropdown Portal */}
      {openDropdown && (
        <div 
          className="fixed w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm"
          style={{ 
            zIndex: 999999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
          data-dropdown-menu
        >
          <div className="py-2">
            {categories.filter(cat => (cat.id || cat._id) === openDropdown).map(category => (
              <div key={category.id || category._id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDuplicateCategory(category);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mr-3 transition-colors">
                    <Copy className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Duplicate Category</div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-500">Create a copy</div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleActive(category);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mr-3 transition-colors">
                    <Archive className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{category.isActive ? 'Deactivate' : 'Activate'}</div>
                    <div className="text-xs text-gray-500 group-hover:text-orange-500">
                      {category.isActive ? 'Disable category' : 'Enable category'}
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewAnalytics(category);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-purple-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center mr-3 transition-colors">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-xs text-gray-500 group-hover:text-purple-500">Performance data</div>
                  </div>
                </button>
                
                <div className="border-t border-gray-100 my-2 mx-2"></div>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteCategory(category.id || category._id || '');
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center mr-3 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Delete Category</div>
                    <div className="text-xs text-gray-500 group-hover:text-red-500">Permanent removal</div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
