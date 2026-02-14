'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  FileText,
  Calendar,
  User,
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
  X,
  BarChart3,
  Activity,
  Clock,
  Sparkles,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Building,
  Receipt,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface Purchase {
  id: string;
  poNumber: string;
  supplierName: string;
  purchaseDate: string;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  totalAmount: number;
  amountPaid: number;
  outstanding: number;
  itemCount: number;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Mock data - replace with real API calls
  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      
      // Real API call - fetch all purchases for client-side pagination
      const response = await fetch('http://localhost:5236/api/purchases?pageSize=1000');
      const data = await response.json();
      
      // Transform API data to match interface
      const purchases: Purchase[] = (data.data || data).map((purchase: any) => ({
        id: purchase.id,
        poNumber: purchase.poNumber || purchase.purchaseOrderNumber || `PO-${purchase.id?.slice(-6) || 'Unknown'}`,
        supplierName: purchase.supplierName || 'Unknown Supplier',
        purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: purchase.status || 'pending',
        totalAmount: purchase.totalAmount || purchase.total || 0,
        amountPaid: purchase.amountPaid || 0,
        outstanding: (purchase.totalAmount || 0) - (purchase.amountPaid || 0),
        itemCount: purchase.items?.length || 0,
        referenceNumber: purchase.invoiceNumber || purchase.challanNumber || '',
        notes: purchase.notes || '',
        createdAt: purchase.createdAt ? new Date(purchase.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        updatedAt: purchase.updatedAt ? new Date(purchase.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      
      setPurchases(purchases);
      
      // If no real data, show empty state
      if (purchases.length === 0) {
        setPurchases([]);
      }
      
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const purchaseDate = new Date(purchase.purchaseDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

  // Update total items when filtered purchases change
  useEffect(() => {
    setTotalItems(filteredPurchases.length);
    // Reset to first page if current page is beyond total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredPurchases.length, currentPage, totalPages]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Handler functions for buttons
  const handleViewPurchase = (purchaseId: string) => {
    router.push(`/purchases/${purchaseId}`);
  };

  const handleEditPurchase = (purchaseId: string) => {
    router.push(`/purchases/${purchaseId}/edit`);
  };

  const handleDownloadPurchase = (purchaseId: string) => {
    // TODO: Implement download functionality
    console.log('Download purchase:', purchaseId);
  };

  const handleDeletePurchase = (purchaseId: string) => {
    // TODO: Implement delete functionality with confirmation
    console.log('Delete purchase:', purchaseId);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 p-4 mb-6 border border-white/20 shadow-lg">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-teal-600/8 via-cyan-600/8 to-emerald-600/8"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-900 to-emerald-900 bg-clip-text text-transparent">
                    Purchase Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage purchase orders and supplier transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
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
                onClick={() => router.push('/purchases/new')} 
                className="h-9 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg text-sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                New Purchase
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-400/15 to-emerald-400/15 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-cyan-400/15 to-teal-400/15 rounded-full blur-xl"></div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases List */}
      <div className="space-y-4">
        {paginatedPurchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{purchase.poNumber}</h3>
                      <Badge className={getStatusBadgeColor(purchase.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(purchase.status)}
                          <span>{purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{purchase.supplierName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{purchase.itemCount} items</span>
                      </div>
                      {purchase.referenceNumber && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{purchase.referenceNumber}</span>
                        </div>
                      )}
                    </div>
                    {purchase.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        {purchase.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">${(purchase.totalAmount || 0).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      Paid: ${(purchase.amountPaid || 0).toFixed(2)}
                    </div>
                    {(purchase.outstanding || 0) > 0 && (
                      <div className="text-sm text-red-600">
                        Outstanding: ${(purchase.outstanding || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPurchase(purchase.id)}
                      title="View Purchase"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPurchase(purchase.id)}
                      title="Edit Purchase"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadPurchase(purchase.id)}
                      title="Download Purchase"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePurchase(purchase.id)}
                      title="Delete Purchase"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {startIndex + 1} to {Math.min(endIndex, filteredPurchases.length)} of {filteredPurchases.length} purchases</span>
                <div className="flex items-center gap-2">
                  <span>Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPurchases.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first purchase order.'}
            </p>
            <Button 
              onClick={() => router.push('/purchases/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Purchase
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{purchases.length}</div>
                <div className="text-sm text-gray-600">Total Purchases</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {purchases.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${purchases.reduce((sum, p) => sum + (p.outstanding || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Outstanding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}