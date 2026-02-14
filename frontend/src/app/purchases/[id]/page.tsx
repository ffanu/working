"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowLeft, Edit, Printer, Download, Calendar, Phone, MapPin, FileText, DollarSign, Package, Truck, User } from "lucide-react";
import { purchaseApi } from "@/lib/api";

interface Purchase {
  id?: string;
  _id?: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: string;
  status: 'received' | 'pending' | 'cancelled';
  paymentMethod: string;
  challanNumber?: string;
  invoiceNumber?: string;
  deliveryNote?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  purchaseOrderNumber?: string;
  paymentTerms?: string;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  notes?: string;
  createdAt?: string;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPurchase(params.id as string);
    }
  }, [params.id]);

  const loadPurchase = async (id: string) => {
    try {
      setLoading(true);
      const result = await purchaseApi.getById(id);
      setPurchase(result);
    } catch (err) {
      setError('Failed to load purchase details');
      console.error('Error loading purchase:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSubtotal = () => {
    return purchase?.items.reduce((total, item) => total + item.totalCost, 0) || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading purchase details...</div>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error || 'Purchase not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Purchase #{purchase.id || purchase._id}</h1>
              <p className="text-muted-foreground">{purchase.supplierName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.push(`/purchases/${purchase.id || purchase._id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Purchase Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchase Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(purchase.purchaseDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <div className="mt-1">{purchase.paymentMethod}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                    <div className="mt-1">{purchase.paymentTerms || 'Not specified'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Order Number</label>
                    <div className="mt-1">{purchase.purchaseOrderNumber || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Challan Number</label>
                    <div className="mt-1">{purchase.challanNumber || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                    <div className="mt-1">{purchase.invoiceNumber || 'Not specified'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Purchase Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Product</th>
                        <th className="text-left p-2 font-medium">Quantity</th>
                        <th className="text-left p-2 font-medium">Unit Cost</th>
                        <th className="text-left p-2 font-medium">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchase.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">${item.unitCost.toFixed(2)}</td>
                          <td className="p-2 font-medium">${item.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${(purchase.discountAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${(purchase.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${(purchase.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${purchase.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchase.expectedDeliveryDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(purchase.expectedDeliveryDate)}
                    </div>
                  </div>
                )}
                {purchase.actualDeliveryDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actual Delivery</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(purchase.actualDeliveryDate)}
                    </div>
                  </div>
                )}
                {purchase.deliveryAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                    <div className="mt-1 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>{purchase.deliveryAddress}</span>
                    </div>
                  </div>
                )}
                {purchase.deliveryNote && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Note</label>
                    <div className="mt-1">{purchase.deliveryNote}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchase.contactPerson && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                    <div className="mt-1">{purchase.contactPerson}</div>
                  </div>
                )}
                {purchase.contactPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {purchase.contactPhone}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {purchase.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{purchase.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 