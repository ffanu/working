"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  FileText, 
  Download,
  BarChart3,
  Activity,
  Clock,
  Sparkles,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MoreHorizontal,
  Receipt,
  CreditCard,
  Calendar,
  User,
  Building
} from "lucide-react";
import { useRouter } from "next/navigation";
import { productApi, customerApi, saleApi } from "@/lib/api";
import { Sale, SaleItem, Product, Customer } from "@/types/inventory";
import { Input } from "@/components/ui/input";

export default function SalesPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [searchTerm, sortBy, sortDir, page, pageSize]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 500); // Increased to 500ms for smoother experience

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Maintain focus on search input
  useEffect(() => {
    if (searchInputRef.current && !loading) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const salesResult = await saleApi.getAll({ 
        search: searchTerm, 
        sortBy, 
        sortDir, 
        page, 
        pageSize
      });
      
      console.log('Sales data loaded:', salesResult);
      console.log('Number of sales:', salesResult.data?.length || salesResult?.length);
      
      setSales(salesResult.data || salesResult);
      setTotal(salesResult.total || (Array.isArray(salesResult) ? salesResult.length : 0));
    } catch (err) {
      console.error("Error loading sales:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = () => {
    router.push('/sales/new');
  };

  const handleGenerateInvoice = async (saleId: string) => {
    try {
      setGeneratingInvoice(saleId);
      const result = await saleApi.generateInvoice(saleId);
      alert(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber}`);
      loadData(); // Reload data to show the invoice number
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // When switching to a new field, default to descending (newest/highest first)
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Remove client-side filtering since we're using server-side pagination
  // const filteredSales = sales?.filter(sale => {
  //   const matchesSearch = !searchTerm || 
  //     sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     sale.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
  //   // NEW: Warehouse filtering
  //   const matchesWarehouse = !warehouseFilter || sale.warehouseId === warehouseFilter;
    
  //   return matchesSearch && matchesWarehouse;
  // }) || [];

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 mb-6 border border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                    Sales Management
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Track transactions and manage revenue
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Real-time sync</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/sales/pos')} 
                className="h-9 px-4 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <Receipt className="mr-1 h-4 w-4" />
                POS Terminal
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full blur-xl"></div>
      </div>

      {/* Enhanced Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full -translate-y-6 translate-x-6"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-700">Total Sales</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">${sales?.reduce((sum, sale) => sum + sale.totalAmount, 0)?.toFixed(2) || '0.00'}</div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+15.3% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full -translate-y-6 translate-x-6"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-700">Sales Count</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{total}</div>
                <div className="flex items-center text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+8.2% growth</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full -translate-y-6 translate-x-6"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-700">Average Sale</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">${sales && sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length).toFixed(2) : '0.00'}</div>
                <div className="flex items-center text-xs text-purple-600">
                  <Target className="h-3 w-3 mr-1" />
                  <span>Per transaction</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters & Search */}
      <Card className="mb-8 bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Search
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    className="pl-12 h-12 w-full rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Search by Invoice No, Customer, Location..."
                    value={searchInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        setSearchTerm(searchInput);
                        setPage(1);
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setSearchTerm(searchInput)}
                  className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchInput(""); setSearchTerm(""); }}
                  className="h-12 px-6 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Sales Table */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Sales Transactions
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Complete list of sales with advanced search and pagination
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Live Data</span>
            </div>
          </div>
        </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('invoiceNumber')}
                      >
                        Invoice No {getSortIcon('invoiceNumber')}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('customerName')}
                      >
                        Customer {getSortIcon('customerName')}
                      </button>
                    </th>
                    {/* Location column (Shop/Warehouse) */}
                    <th className="text-left p-3 font-medium">
                      Location
                    </th>
                    <th className="text-left p-3 font-medium">Items</th>
                    <th className="text-left p-3 font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Total {getSortIcon('totalAmount')}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('saleDate')}
                      >
                        Date {getSortIcon('saleDate')}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">Payment</th>
                    <th className="text-left p-3 font-medium">Invoice</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale.id || sale._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-blue-600">{sale.invoiceNumber || `#${sale.id || sale._id}`}</div>
                        {sale.invoiceNumber && <div className="text-xs text-gray-400">ID: {(sale.id || sale._id || '').substring(0, 8)}...</div>}
                      </td>
                      <td className="p-3">{sale.customerName}</td>
                      {/* Location column - show shop or warehouse */}
                      <td className="p-3">
                        <div className="text-sm">
                          {sale.shopName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-purple-600" />
                              <div>
                                <div className="font-medium text-purple-900">{sale.shopName}</div>
                                {sale.shopLocation && <div className="text-gray-500 text-xs">{sale.shopLocation}</div>}
                              </div>
                            </div>
                          )}
                          {sale.warehouseName && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"></path><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"></path></svg>
                              <div>
                                <div className="font-medium text-blue-900">{sale.warehouseName}</div>
                                {sale.warehouseLocation && <div className="text-gray-500 text-xs">{sale.warehouseLocation}</div>}
                              </div>
                            </div>
                          )}
                          {!sale.shopName && !sale.warehouseName && <span className="text-gray-400">N/A</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {sale.items?.map((item, index) => (
                            <div key={index}>
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-medium">${sale.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td className="p-3">{new Date(sale.saleDate || sale.createdAt || '').toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="p-3">{sale.paymentMethod}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {sale.invoiceNumber ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/sales/${sale.id || sale._id}/invoice`)}
                              title="View Invoice"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateInvoice(sale.id || sale._id || '')}
                              disabled={generatingInvoice === (sale.id || sale._id)}
                            >
                              {generatingInvoice === (sale.id || sale._id) ? (
                                'Generating...'
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-1" />
                                  Generate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/sales/${sale.id || sale._id}`)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/sales/pos?edit=${sale.id || sale._id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} sales</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Items per page selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                          }}
                          className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {/* Navigation controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          disabled={page <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(pageNum)}
                                className="h-8 w-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page >= totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          disabled={page >= totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </CardContent>
      </Card>
    </MainLayout>
  );
} 