"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft, Save, Send, CheckCircle, Printer, X, Plus,
  Package, User, DollarSign, FileText, Upload, Calendar
} from "lucide-react";
import Link from "next/link";

interface RefundItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  batch: string;
  expiry: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  notes: string;
}

interface RefundFormData {
  refundId: string;
  date: string;
  status: string;
  type: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  originalInvoice: string;
  reason: string;
  refundMethod: string;
  totalAmount: number;
  adjustmentNotes: string;
  requestedBy: string;
  approvedBy: string;
  items: RefundItem[];
}

export default function NewRefundPage() {
  const [formData, setFormData] = useState<RefundFormData>({
    refundId: "",
    date: new Date().toISOString().split('T')[0],
    status: "Draft",
    type: "Product Return",
    customerId: "",
    customerName: "",
    customerContact: "",
    customerEmail: "",
    originalInvoice: "",
    reason: "",
    refundMethod: "Cash",
    totalAmount: 0,
    adjustmentNotes: "",
    requestedBy: "Admin", // This would come from auth context
    approvedBy: "",
    items: []
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate refund ID
  useEffect(() => {
    const generateRefundId = () => {
      const timestamp = Date.now().toString().slice(-6);
      return `R-${timestamp}`;
    };
    setFormData(prev => ({ ...prev, refundId: generateRefundId() }));
  }, []);

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        // Real API calls
        const [customersResponse, productsResponse] = await Promise.all([
          fetch('http://localhost:5236/api/customers'),
          fetch('http://localhost:5236/api/products?pageSize=1000')
        ]);
        
        const customersData = await customersResponse.json();
        const productsData = await productsResponse.json();
        
        // Transform customers data
        const customers = (customersData.data || customersData).map((customer: any) => ({
          id: customer.id,
          name: customer.name || 'Unknown Customer',
          contact: customer.contact || customer.phone || 'N/A',
          email: customer.email || 'N/A'
        }));
        
        // Transform products data
        const products = (productsData.data || productsData).map((product: any) => ({
          id: product.id,
          name: product.name || 'Unknown Product',
          sku: product.sku || product.code || 'N/A',
          price: product.price || 0,
          stock: product.stock || product.quantity || 0
        }));
        
        setCustomers(customers);
        setProducts(products);
        
        // If no real data, use mock data for demonstration
        if (customers.length === 0) {
          setCustomers([
            { id: "1", name: "John Doe", contact: "01712345678", email: "john@example.com" },
            { id: "2", name: "Jane Smith", contact: "01787654321", email: "jane@example.com" },
            { id: "3", name: "Mike Johnson", contact: "01755555555", email: "mike@example.com" }
          ]);

          setProducts([
            { id: "1", name: "iPhone 14", sku: "IP14", price: 1200 },
            { id: "2", name: "Samsung Galaxy S23", sku: "SGS23", price: 1000 },
            { id: "3", name: "MacBook Pro", sku: "MBP13", price: 2000 }
          ]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof RefundFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerContact: customer.contact,
        customerEmail: customer.email
      }));
    }
  };

  const handleAddItem = () => {
    const newItem: RefundItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      sku: "",
      batch: "",
      expiry: "",
      quantity: 1,
      unitPrice: 0,
      refundAmount: 0,
      notes: ""
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleItemChange = (itemId: string, field: keyof RefundItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate refund amount
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.refundAmount = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleItemChange(itemId, 'productId', product.id);
      handleItemChange(itemId, 'productName', product.name);
      handleItemChange(itemId, 'sku', product.sku);
      handleItemChange(itemId, 'unitPrice', product.price);
      handleItemChange(itemId, 'refundAmount', product.price);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Calculate total amount
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + item.refundAmount, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.items]);

  const handleSubmit = async (action: 'draft' | 'submit' | 'approve') => {
    try {
      setLoading(true);
      
      const status = action === 'draft' ? 'Draft' : 
                   action === 'submit' ? 'Pending' : 'Approved';
      
      const submitData = {
        ...formData,
        status,
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting refund:', submitData);
      
      // Here you would make API call
      // await refundsApi.create(submitData);
      
      alert(`Refund ${action === 'draft' ? 'saved as draft' : action === 'submit' ? 'submitted for approval' : 'approved and processed'} successfully!`);
      
    } catch (error) {
      console.error('Error submitting refund:', error);
      alert('Error submitting refund. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <Link href="/refunds">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Refunds
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Refund/Return</h1>
              <p className="text-gray-600 mt-1">Create a new refund or return request</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('submit')} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
            <Button onClick={() => handleSubmit('approve')} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Process
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Return/Refund Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Return/Refund Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="refundId">Refund ID</Label>
                    <Input
                      id="refundId"
                      value={formData.refundId}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <option value="">Select type</option>
                      <option value="Product Return">Product Return</option>
                      <option value="Refund Only">Refund Only</option>
                      <option value="Exchange">Exchange</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Input
                      id="status"
                      value={formData.status}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="originalInvoice">Reference Invoice/Sales Order</Label>
                    <Input
                      id="originalInvoice"
                      value={formData.originalInvoice}
                      onChange={(e) => handleInputChange('originalInvoice', e.target.value)}
                      placeholder="e.g., INV-105"
                    />
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select onValueChange={(value) => handleCustomerSelect(value)}>
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.contact}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerContact">Contact</Label>
                    <Input
                      id="customerContact"
                      value={formData.customerContact}
                      onChange={(e) => handleInputChange('customerContact', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Return/Refund</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="e.g., Damaged item, Wrong size"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products/Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Products/Items
                  </div>
                  <Button onClick={handleAddItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No products added yet. Click "Add Product" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Product {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label>Product</Label>
                            <Select onValueChange={(value) => handleProductSelect(item.id, value)}>
                              <option value="">Select product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - {product.sku}
                                </option>
                              ))}
                            </Select>
                          </div>
                          
                          <div>
                            <Label>SKU</Label>
                            <Input
                              value={item.sku}
                              onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                          
                          <div>
                            <Label>Batch/Lot</Label>
                            <Input
                              value={item.batch}
                              onChange={(e) => handleItemChange(item.id, 'batch', e.target.value)}
                              placeholder="e.g., B123"
                            />
                          </div>
                          
                          <div>
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={item.expiry}
                              onChange={(e) => handleItemChange(item.id, 'expiry', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div>
                            <Label>Refund Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.refundAmount}
                              onChange={(e) => handleItemChange(item.id, 'refundAmount', parseFloat(e.target.value) || 0)}
                              className="bg-gray-50"
                            />
                          </div>
                          
                          <div>
                            <Label>Notes</Label>
                            <Input
                              value={item.notes}
                              onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                              placeholder="e.g., Damaged screen"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="refundMethod">Refund Method</Label>
                    <Select 
                      value={formData.refundMethod} 
                      onValueChange={(value) => handleInputChange('refundMethod', value)}
                    >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                      <option value="Credit Note">Credit Note</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="totalAmount">Total Refund Amount</Label>
                    <Input
                      id="totalAmount"
                      value={formatCurrency(formData.totalAmount)}
                      readOnly
                      className="bg-gray-50 text-lg font-semibold"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="adjustmentNotes">Adjustment Notes</Label>
                  <Textarea
                    id="adjustmentNotes"
                    value={formData.adjustmentNotes}
                    onChange={(e) => handleInputChange('adjustmentNotes', e.target.value)}
                    placeholder="Any additional notes or adjustments..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="documents">Attach Documents</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload proof of defect, receipt, or other documents</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Files
                    </Button>
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
                  <Label htmlFor="requestedBy">Requested By</Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Select 
                    value={formData.approvedBy} 
                    onValueChange={(value) => handleInputChange('approvedBy', value)}
                  >
                    <option value="">Select approver</option>
                    <option value="manager">Manager</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Created:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{formData.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(formData.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span>{formData.refundMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-blue-600">{formData.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubmit('draft')} 
                    disabled={loading}
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubmit('submit')} 
                    disabled={loading}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubmit('approve')} 
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Process
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Return Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
