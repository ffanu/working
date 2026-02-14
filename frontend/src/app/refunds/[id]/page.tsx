"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft, Edit, Printer, CheckCircle, XCircle, Clock,
  Package, User, DollarSign, FileText, Calendar, Phone, Mail,
  AlertTriangle, CheckCircle2, X
} from "lucide-react";
import Link from "next/link";

interface RefundItem {
  id: string;
  productName: string;
  sku: string;
  batch: string;
  expiry: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  notes: string;
}

interface Refund {
  id: string;
  refundId: string;
  date: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  type: 'Product Return' | 'Refund Only' | 'Exchange';
  customerName: string;
  customerContact: string;
  customerEmail: string;
  originalInvoice: string;
  reason: string;
  refundMethod: string;
  totalAmount: number;
  adjustmentNotes: string;
  requestedBy: string;
  approvedBy?: string;
  items: RefundItem[];
  createdAt: string;
  updatedAt: string;
  auditTrail: {
    status: string;
    timestamp: string;
    user: string;
    notes?: string;
  }[];
}

export default function RefundDetailPage({ params }: { params: { id: string } }) {
  const [refund, setRefund] = useState<Refund | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefund = async () => {
      try {
        setLoading(true);
        
        // Real API call
        const response = await fetch(`http://localhost:5236/api/refunds/${params.id}`);
        if (response.ok) {
          const refundData = await response.json();
          
          // Transform API data to match interface
          const refund: Refund = {
            id: refundData.id,
            refundId: refundData.refundId || refundData.refundNumber || `R-${refundData.id.slice(-6)}`,
            date: refundData.refundDate ? new Date(refundData.refundDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: refundData.status || 'pending',
            type: refundData.type || 'Product Return',
            customerName: refundData.customerName || 'Unknown Customer',
            customerContact: refundData.customerContact || 'N/A',
            customerEmail: refundData.customerEmail || 'N/A',
            originalInvoice: refundData.originalInvoice || 'N/A',
            reason: refundData.reason || 'N/A',
            refundMethod: refundData.refundMethod || 'Cash',
            totalAmount: refundData.totalAmount || refundData.total || 0,
            adjustmentNotes: refundData.adjustmentNotes || '',
            requestedBy: refundData.requestedBy || 'Admin',
            approvedBy: refundData.approvedBy,
            items: refundData.items || [],
            createdAt: refundData.createdAt ? new Date(refundData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            updatedAt: refundData.updatedAt ? new Date(refundData.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            auditTrail: refundData.auditTrail || []
          };
          
          setRefund(refund);
        } else {
          // If no real data, use mock data for demonstration
          const mockRefund: Refund = {
            id: params.id,
            refundId: "R-1001",
            date: "2024-01-15",
            status: "Completed",
            type: "Product Return",
            customerName: "John Doe",
            customerContact: "01712345678",
            customerEmail: "john@example.com",
            originalInvoice: "INV-105",
            reason: "Damaged screen",
            refundMethod: "Cash",
            totalAmount: 1200,
            adjustmentNotes: "Screen replacement required",
            requestedBy: "Admin",
            approvedBy: "Manager",
            items: [
              {
                id: "1",
                productName: "iPhone 14",
                sku: "IP14",
                batch: "B123",
                expiry: "2025-12-31",
                quantity: 1,
                unitPrice: 1200,
                refundAmount: 1200,
                notes: "Damaged screen"
              }
            ],
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T14:30:00Z",
            auditTrail: [
              {
                status: "Draft",
                timestamp: "2024-01-15T10:00:00Z",
                user: "Admin",
                notes: "Refund request created"
              },
              {
                status: "Pending",
                timestamp: "2024-01-15T10:15:00Z",
                user: "Admin",
                notes: "Submitted for approval"
              },
              {
                status: "Approved",
                timestamp: "2024-01-15T12:00:00Z",
                user: "Manager",
                notes: "Approved for processing"
              },
              {
                status: "Completed",
                timestamp: "2024-01-15T14:30:00Z",
                user: "Admin",
                notes: "Refund processed successfully"
              }
            ]
          };
          
          setRefund(mockRefund);
        }
      } catch (error) {
        console.error("Error loading refund:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRefund();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Draft':
        return <Edit className="h-4 w-4" />;
      case 'Cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!refund) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Refund not found</h3>
            <p className="text-gray-600 mb-4">The refund you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/refunds">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Refunds
              </Link>
            </Button>
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
          <div className="flex items-center">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <Link href="/refunds">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Refunds
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{refund.refundId}</h1>
              <p className="text-gray-600 mt-1">Refund & Return Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Badge className={`${getStatusColor(refund.status)} flex items-center`}>
              {getStatusIcon(refund.status)}
              <span className="ml-1">{refund.status}</span>
            </Badge>
            <Button variant="outline" asChild>
              <Link href={`/refunds/${refund.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Refund Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Refund Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Refund ID</label>
                    <p className="text-lg font-semibold text-blue-600">{refund.refundId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-lg font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(refund.date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-lg font-semibold">{refund.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge className={`${getStatusColor(refund.status)} flex items-center w-fit`}>
                      {getStatusIcon(refund.status)}
                      <span className="ml-1">{refund.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Original Invoice</label>
                    <p className="text-lg font-semibold text-blue-600">{refund.originalInvoice}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Refund Method</label>
                    <p className="text-lg font-semibold">{refund.refundMethod}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Reason</label>
                    <p className="text-lg font-semibold">{refund.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="text-lg font-semibold">{refund.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact</label>
                    <p className="text-lg font-semibold flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {refund.customerContact}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg font-semibold flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {refund.customerEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Outstanding Balance</label>
                    <p className="text-lg font-semibold text-red-600">$150.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products/Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Products/Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">SKU</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Expiry</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Qty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Unit Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Refund Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refund.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{item.productName}</td>
                          <td className="py-3 px-4 text-gray-600">{item.sku}</td>
                          <td className="py-3 px-4 text-gray-600">{item.batch}</td>
                          <td className="py-3 px-4 text-gray-600">{item.expiry}</td>
                          <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 px-4 font-semibold text-green-600">{formatCurrency(item.refundAmount)}</td>
                          <td className="py-3 px-4 text-gray-600">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Refund Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Refund Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-lg font-medium">Total Refund Amount</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(refund.totalAmount)}</span>
                  </div>
                  
                  {refund.adjustmentNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Adjustment Notes</label>
                      <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{refund.adjustmentNotes}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Attached Documents</label>
                    <div className="mt-2 p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">No documents attached</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval & Audit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Approval & Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested By</label>
                  <p className="font-semibold">{refund.requestedBy}</p>
                </div>
                
                {refund.approvedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approved By</label>
                    <p className="font-semibold">{refund.approvedBy}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-600">{formatDate(refund.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-600">{formatDate(refund.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {refund.auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{entry.status}</p>
                        <p className="text-xs text-gray-500">{entry.user}</p>
                        <p className="text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
                        {entry.notes && (
                          <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/refunds/${refund.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Refund
                  </Link>
                </Button>
                <Button className="w-full" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Return Note
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Receipt
                </Button>
                {refund.status === 'Pending' && (
                  <Button className="w-full" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {refund.status === 'Draft' && (
                  <Button className="w-full" variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
