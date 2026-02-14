'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supplierLedgerApi } from '@/lib/api/supplierLedger';
import { supplierApi } from '@/lib/api/suppliers';
import { SupplierLedger, Supplier } from '@/types/inventory';

export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [supplierLedger, setSupplierLedger] = useState<any[]>([]);
  const [supplierSummary, setSupplierSummary] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierLedger();
      loadSupplierSummary();
    }
  }, [selectedSupplier, dateRange]);

  const loadSuppliers = async () => {
    try {
      const response = await supplierApi.getAll();
      setSuppliers(response.data);
    } catch (err) {
      setError('Failed to load suppliers');
    }
  };

  const loadSupplierLedger = async () => {
    if (!selectedSupplier) return;
    
    setLoading(true);
    try {
      const response = await supplierLedgerApi.getDetailedBySupplier(
        selectedSupplier,
        dateRange.start || undefined,
        dateRange.end || undefined
      );
      setSupplierLedger(response.data);
    } catch (err) {
      setError('Failed to load supplier ledger');
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierSummary = async () => {
    if (!selectedSupplier) return;
    
    try {
      const summary = await supplierLedgerApi.getSupplierLedgerSummary(selectedSupplier);
      setSupplierSummary(summary);
    } catch (err) {
      setError('Failed to load supplier summary');
    }
  };

  const filteredLedger = supplierLedger.filter(entry => {
    const matchesSearch = entry.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || entry.transactionType === selectedType;

    return matchesSearch && matchesType;
  });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Purchase':
        return 'bg-blue-100 text-blue-800';
      case 'Payment':
        return 'bg-green-100 text-green-800';
      case 'Credit':
        return 'bg-red-100 text-red-800';
      case 'Adjustment':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Ledger</h1>
          <p className="text-gray-600 mt-2">Track supplier transactions and balances</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Supplier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a supplier</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} - {supplier.email}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSupplier && supplierSummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Current Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(supplierSummary.currentBalance || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Transactions</p>
                    <p className="text-2xl font-bold">{supplierSummary.totalTransactions || 0}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Last Transaction</p>
                    <p className="text-lg font-semibold">
                      {supplierSummary.lastTransactionDate 
                        ? formatDate(supplierSummary.lastTransactionDate)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Last Amount</p>
                    <p className="text-lg font-semibold">
                      {supplierSummary.lastTransactionAmount 
                        ? formatCurrency(supplierSummary.lastTransactionAmount)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Tabs */}
          <Tabs defaultValue="ledger" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ledger" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Ledger
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ledger" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Transaction Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="all">All Types</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Payment">Payment</option>
                        <option value="Credit">Credit</option>
                        <option value="Adjustment">Adjustment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ledger Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading ledger...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Type</th>
                            <th className="text-left p-3">Reference</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-right p-3">Amount</th>
                            <th className="text-right p-3">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLedger.map((entry, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3">{formatDate(entry.transactionDate)}</td>
                              <td className="p-3">
                                <Badge className={getTransactionTypeColor(entry.transactionType)}>
                                  {entry.transactionType}
                                </Badge>
                              </td>
                              <td className="p-3">{entry.reference}</td>
                              <td className="p-3">{entry.description}</td>
                              <td className="p-3 text-right">
                                <span className={`flex items-center justify-end gap-1 ${
                                  entry.amount > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {entry.amount > 0 ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4" />
                                  )}
                                  {formatCurrency(Math.abs(entry.amount))}
                                </span>
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {formatCurrency(entry.balanceAfter)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {supplierSummary.supplierName}</p>
                        <p><strong>Current Balance:</strong> {formatCurrency(supplierSummary.currentBalance || 0)}</p>
                        <p><strong>Total Transactions:</strong> {supplierSummary.totalTransactions || 0}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-2">
                        <p><strong>Last Transaction:</strong> {supplierSummary.lastTransactionDate ? formatDate(supplierSummary.lastTransactionDate) : 'N/A'}</p>
                        <p><strong>Last Type:</strong> {supplierSummary.lastTransactionType || 'N/A'}</p>
                        <p><strong>Last Amount:</strong> {supplierSummary.lastTransactionAmount ? formatCurrency(supplierSummary.lastTransactionAmount) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Analytics features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </MainLayout>
  );
} 