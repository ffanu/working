"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Plus, Download, Search, Filter, Eye, Edit, Trash2, 
  RefreshCw, DollarSign, Package, Calendar, User, 
  CheckCircle, Clock, XCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface Refund {
  id: string;
  refundId: string;
  date: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  type: 'Product Return' | 'Refund Only' | 'Exchange';
  customerName: string;
  customerContact: string;
  originalInvoice: string;
  totalAmount: number;
  refundMethod: string;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");

  // Load refunds from API
  useEffect(() => {
  const loadRefunds = async () => {
    try {
      setLoading(true);
      
      // Real API call
      const response = await fetch('http://localhost:5236/api/refunds');
      const data = await response.json();
      
      // Transform API data to match interface
      const refunds: Refund[] = (data.data || data).map((refund: any) => ({
        id: refund.id,
        refundId: refund.refundId || refund.refundNumber || `R-${refund.id.slice(-6)}`,
        customerName: refund.customerName || 'Unknown Customer',
        customerId: refund.customerId || 'N/A',
        refundDate: refund.refundDate ? new Date(refund.refundDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: refund.status || 'pending',
        totalAmount: refund.totalAmount || refund.total || 0,
        itemsCount: refund.items?.length || 0,
        createdAt: refund.createdAt ? new Date(refund.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      
      // No mock data - show real data only
      setRefunds(refunds);
      } catch (error) {
        console.error("Error loading refunds:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRefunds();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Approved':
        return 'text-blue-600 bg-blue-100';
      case 'Draft':
        return 'text-gray-600 bg-gray-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Draft':
        return <Edit className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.refundId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refunds & Returns</h1>
            <p className="text-gray-600 mt-1">Manage product returns and refunds</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/refunds/new">
                <Plus className="h-4 w-4 mr-2" />
                New Return/Refund
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search refunds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value)}
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>

              <Select 
                value={dateFilter} 
                onValueChange={(value) => setDateFilter(value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </Select>

              <Select 
                value={shopFilter} 
                onValueChange={(value) => setShopFilter(value)}
              >
                <option value="all">All Shops</option>
                <option value="banani">Banani Branch</option>
                <option value="dhanmondi">Dhanmondi Branch</option>
                <option value="gulshan">Gulshan Branch</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Refunds List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Refunds & Returns ({filteredRefunds.length})
            </CardTitle>
            <CardDescription>
              Manage all refund and return requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRefunds.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No refunds found</h3>
                <p className="text-gray-600 mb-4">Get started by creating a new refund or return request.</p>
                <Button asChild>
                  <Link href="/refunds/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Refund
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Refund ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.map((refund) => (
                      <tr key={refund.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-blue-600">{refund.refundId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(refund.date)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{refund.customerName}</div>
                            <div className="text-sm text-gray-500">{refund.customerContact}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{refund.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            <span className="ml-1">{refund.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-green-600">{formatCurrency(refund.totalAmount)}</div>
                          <div className="text-sm text-gray-500">{refund.refundMethod}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-blue-600">{refund.originalInvoice}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/refunds/${refund.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/refunds/${refund.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}