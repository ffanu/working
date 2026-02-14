"use client";

import { useState, useEffect } from "react";
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
  Building,
  CreditCard as InstallmentIcon,
  Percent,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { installmentApi } from "@/lib/api/installments";
import { InstallmentPlan } from "@/types/installment";
import { ReceiptButton } from "@/components/installments/ReceiptButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InstallmentSalesPage() {
  const [installmentSales, setInstallmentSales] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch installment sales data
  useEffect(() => {
    const fetchInstallmentSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await installmentApi.getAllPlans();
        setInstallmentSales(data);
      } catch (err) {
        console.error('Error fetching installment sales:', err);
        setError('Failed to load installment sales. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstallmentSales();
  }, []);

  // Calculate statistics
  const totalRevenue = installmentSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const activeInstallments = installmentSales.filter(sale => sale.status === 'Active').length;
  const completedInstallments = installmentSales.filter(sale => sale.status === 'Completed').length;
  const overdueInstallments = installmentSales.filter(sale => sale.status === 'Overdue').length;

  // Calculate pagination
  const totalItems = installmentSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filter and sort data
  const filteredSales = installmentSales.filter(sale => {
    const matchesSearch = !searchTerm || 
      sale.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sale.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    let aValue = a[sortBy as keyof InstallmentPlan];
    let bValue = b[sortBy as keyof InstallmentPlan];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedSales = sortedSales.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading installment sales...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-indigo-600/5 to-blue-600/5"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                    <InstallmentIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                      Installment Sales
                    </h1>
                    <p className="text-sm text-gray-600">
                      Manage and track all installment plans and payments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    <span>Real-time data</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/pos-installment">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    New Installment Sale
                  </Button>
                </Link>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-blue-200">
                <ArrowUpRight className="inline h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Plans</CardTitle>
              <Activity className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{activeInstallments}</div>
              <p className="text-xs text-green-200">
                <ArrowUpRight className="inline h-3 w-3 mr-1" />
                +8 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{completedInstallments}</div>
              <p className="text-xs text-purple-200">
                <ArrowUpRight className="inline h-3 w-3 mr-1" />
                +15 this month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{overdueInstallments}</div>
              <p className="text-xs text-red-200">
                <ArrowDownRight className="inline h-3 w-3 mr-1" />
                -2 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Installment Sales List
                </CardTitle>
                <CardDescription>
                  {filteredSales.length} of {installmentSales.length} installment plans
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by customer ID, installment ID, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Installment Sales Table */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        Installment ID
                        {sortBy === 'id' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('customerId')}>
                      <div className="flex items-center gap-1">
                        Customer
                        {sortBy === 'customerId' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalPrice')}>
                      <div className="flex items-center gap-1">
                        Total Amount
                        {sortBy === 'totalPrice' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Installment Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSales.map((sale) => {
                    const paidInstallments = sale.payments?.filter(p => p.status === 'Paid').length || 0;
                    const nextDuePayment = sale.payments?.find(p => p.status === 'Pending');
                    
                    return (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{sale.id?.slice(-8) || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{formatDate(sale.createdAt || new Date().toISOString())}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">Customer {sale.customerId?.slice(-4) || 'N/A'}</div>
                          <div className="text-sm text-gray-500">ID: {sale.customerId || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{formatCurrency(sale.totalPrice)}</div>
                          <div className="text-sm text-gray-500">Down: {formatCurrency(sale.downPayment)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{sale.numberOfInstallments} months</div>
                          <div className="text-sm text-gray-500">{formatCurrency(sale.installmentAmount)}/month</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                            {getStatusIcon(sale.status)}
                            {sale.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(paidInstallments / sale.numberOfInstallments) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {paidInstallments}/{sale.numberOfInstallments} paid
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {nextDuePayment ? (
                            <div>
                              <div className="font-medium text-gray-900">{formatDate(nextDuePayment.dueDate)}</div>
                              <div className="text-sm text-gray-500">{formatCurrency(nextDuePayment.amountDue)}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Completed</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {nextDuePayment && sale.status === 'Active' && (
                              <Link href={`/installment-sales/${sale.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 hover:bg-green-100 text-green-600 font-medium"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pay
                                </Button>
                              </Link>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-100">
                              <Eye className="h-4 w-4 text-purple-600" />
                            </Button>
                            <ReceiptButton 
                              installmentPlan={sale}
                              variant="ghost"
                              size="sm"
                              showText={false}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length} results</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </MainLayout>
  );
}