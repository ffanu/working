'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Upload,
  Calculator,
  Package,
  User,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  ShoppingCart
} from 'lucide-react';
import { productApi, supplierApi, purchaseApi } from '@/lib/api';
import { warehousesApi } from '@/lib/api/warehouses';

interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: {
    phone?: string;
    email?: string;
  };
}

interface Product {
  id: string;
  _id?: string;
  name: string;
  sku: string;
  price: number;
  costPrice?: number;
  taxRate?: number;
}

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  totalPrice: number;
  taxAmount: number;
  total: number;
}

interface PurchaseFormData {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierContact: string;
  warehouseId: string;
  warehouseName: string;
  purchaseDate: string;
  poNumber: string;
  referenceNumber: string;
  notes: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  outstanding: number;
  attachments: File[];
}

export default function CreatePurchasePage() {
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplierId: '',
    supplierName: '',
    supplierCode: '',
    supplierContact: '',
    warehouseId: '',
    warehouseName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    poNumber: '',
    referenceNumber: '',
    notes: '',
    items: [],
    subtotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    grandTotal: 0,
    paymentMethod: 'cash',
    amountPaid: 0,
    outstanding: 0,
    attachments: []
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Listen for storage events to refresh products when new ones are added
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'productAdded' && e.newValue === 'true') {
        refreshProducts();
        localStorage.removeItem('productAdded');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load real data from API - request all products without pagination
      const [productsResult, suppliersResult, warehousesResult] = await Promise.all([
        productApi.getAll({ page: 1, pageSize: 1000 }), // Request up to 1000 products
        supplierApi.getAll(),
        warehousesApi.getAll() // Use getAll instead of getActive
      ]);
      
      // Transform products to match the expected format
      const transformedProducts = productsResult.data.map((product: any) => ({
        id: product.id || product._id,
        _id: product._id,
        name: product.name,
        productSKU: product.sku,
        price: product.price,
        costPrice: product.costPrice || product.price,
        taxRate: 8.5 // Default tax rate
      }));
      
      // Transform suppliers to match the expected format
      const transformedSuppliers = (suppliersResult.data || suppliersResult).map((supplier: any) => ({
        id: supplier.id || supplier._id,
        name: supplier.name,
        code: supplier.code || supplier.name.substring(0, 3).toUpperCase(),
        contact: {
          phone: supplier.phone || supplier.contact?.phone,
          email: supplier.email || supplier.contact?.email
        }
      }));

      setProducts(transformedProducts);
      setSuppliers(transformedSuppliers);
      setWarehouses(warehousesResult.data || warehousesResult);
      
      // Debug: Log warehouses to see what's loaded
      console.log('Warehouses loaded:', warehousesResult.data || warehousesResult);
      console.log('Warehouses count:', (warehousesResult.data || warehousesResult).length);
      
      // Generate PO number only if not already set
      if (!formData.poNumber) {
        const poNumber = `PO-${Date.now().toString().slice(-6)}`;
        setFormData(prev => ({ ...prev, poNumber }));
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh products list (can be called from parent components)
  const refreshProducts = async () => {
    try {
      const productsResult = await productApi.getAll({ page: 1, pageSize: 1000 }); // Request all products
      const transformedProducts = productsResult.data.map((product: any) => ({
        id: product.id || product._id,
        _id: product._id,
        name: product.name,
        productSKU: product.sku,
        price: product.price,
        costPrice: product.costPrice || product.price,
        taxRate: 8.5
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierCode: supplier.code,
        supplierContact: `${supplier.contact.phone || ''} ${supplier.contact.email || ''}`.trim()
      }));
    }
  };

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      productSKU: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 8.5,
      discount: 0,
      totalPrice: 0,
      taxAmount: 0,
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    calculateTotals();
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-fill product details when product is selected
          if (field === 'productId' && value) {
            const product = products.find(p => p.id === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.productSKU = product.sku;
              updatedItem.unitPrice = product.costPrice || product.price;
              updatedItem.taxRate = product.taxRate || 8.5;
            }
          }
          
          // Calculate total for this item
          const quantity = field === 'quantity' ? value : updatedItem.quantity;
          const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice;
          const discount = field === 'discount' ? value : updatedItem.discount;
          const taxRate = field === 'taxRate' ? value : updatedItem.taxRate;
          
          const subtotal = quantity * unitPrice;
          const discountAmount = (subtotal * discount) / 100;
          const afterDiscount = subtotal - discountAmount;
          const taxAmount = (afterDiscount * taxRate) / 100;
          updatedItem.total = afterDiscount + taxAmount;
          
          return updatedItem;
        }
        return item;
      })
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    setFormData(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalDiscount = prev.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        return sum + (itemSubtotal * item.discount) / 100;
      }, 0);
      const afterDiscount = subtotal - totalDiscount;
      const totalTax = prev.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        return sum + (itemAfterDiscount * item.taxRate) / 100;
      }, 0);
      const grandTotal = afterDiscount + totalTax;
      const outstanding = grandTotal - prev.amountPaid;

      return {
        ...prev,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
        outstanding
      };
    });
  };

  const handleAmountPaidChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      amountPaid: value,
      outstanding: prev.grandTotal - value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleSubmit = async (action: 'save' | 'saveAndAdd' | 'preview') => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.supplierId) {
        alert('Please select a supplier');
        return;
      }
      
      if (!formData.warehouseId) {
        alert('Please select a warehouse');
        return;
      }
      
      if (formData.items.length === 0) {
        alert('Please add at least one item');
        return;
      }

      // Prepare purchase data for API
      const purchaseData = {
        poNumber: formData.poNumber,
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        supplierCode: formData.supplierCode,
        warehouseId: formData.warehouseId,
        orderDate: formData.purchaseDate,
        expectedDeliveryDate: formData.purchaseDate, // Using purchase date as expected delivery for now
        status: 'pending',
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSKU: item.productSKU,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount
        })),
        subtotal: formData.subtotal,
        taxTotal: formData.totalTax,
        total: formData.grandTotal,
        notes: formData.notes,
        attachments: formData.attachments
      };
      
      console.log('Saving purchase:', purchaseData);
      
      // Save purchase via API
      const result = await purchaseApi.create(purchaseData);
      console.log('Purchase saved successfully:', result);
      
      if (action === 'save') {
        alert(`Purchase ${result.poNumber || result.id} saved successfully! Stock levels have been updated.`);
        // Redirect to purchases list
        window.location.href = '/purchases';
      } else if (action === 'saveAndAdd') {
        alert(`Purchase ${result.poNumber || result.id} saved! Stock levels updated. Adding new purchase...`);
        // Reset form for new purchase
        setFormData(prev => ({
          ...prev,
          supplierId: '',
          supplierName: '',
          supplierCode: '',
          supplierContact: '',
          poNumber: `PO-${Date.now().toString().slice(-6)}`,
          referenceNumber: '',
          notes: '',
          items: [],
          subtotal: 0,
          totalTax: 0,
          totalDiscount: 0,
          grandTotal: 0,
          amountPaid: 0,
          outstanding: 0,
          attachments: []
        }));
      } else if (action === 'preview') {
        alert('Preview functionality would open here');
      }
      
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Error saving purchase. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Purchase</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshProducts} 
            variant="outline"
            disabled={loading}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh Products
          </Button>
          <Button 
            onClick={() => handleSubmit('preview')} 
            variant="outline"
            disabled={saving}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={() => handleSubmit('save')} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button 
            onClick={() => handleSubmit('saveAndAdd')} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
          <Button variant="outline" disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Supplier & Purchase Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Supplier & Purchase Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Supplier Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Supplier Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier Code</label>
                  <Input
                    value={formData.supplierCode}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Info</label>
                  <Input
                    value={formData.supplierContact}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Warehouse <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">({warehouses.length} available)</span>
                  </label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => {
                      const warehouse = warehouses.find(w => w.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        warehouseId: e.target.value,
                        warehouseName: warehouse?.name || ''
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => {
                      console.log('Rendering warehouse option:', warehouse);
                      return (
                        <option key={warehouse.id || warehouse._id} value={warehouse.id || warehouse._id}>
                          {warehouse.name} - {warehouse.address}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Right Column - Purchase Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Purchase Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    PO Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.poNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, poNumber: e.target.value }))}
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reference Number</label>
                  <Input
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    placeholder="Optional reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Items / Products</span>
              </div>
              <Button onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Product <span className="text-red-500">*</span></th>
                      <th className="text-left p-2 font-medium">Qty <span className="text-red-500">*</span></th>
                      <th className="text-left p-2 font-medium">Unit Price <span className="text-red-500">*</span></th>
                      <th className="text-left p-2 font-medium">Tax %</th>
                      <th className="text-left p-2 font-medium">Discount %</th>
                      <th className="text-left p-2 font-medium">Total</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </option>
                            ))}
                          </select>
                          {item.productSKU && (
                            <div className="text-xs text-gray-500 mt-1">SKU: {item.productSKU}</div>
                          )}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-20"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            className="w-24"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-16"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-16"
                          />
                        </td>
                        <td className="p-2">
                          <div className="font-medium">${item.total.toFixed(2)}</div>
                        </td>
                        <td className="p-2">
                          <Button
                            onClick={() => removeItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax:</span>
                <span className="font-medium">${formData.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Discount:</span>
                <span className="font-medium text-green-600">-${formData.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Grand Total:</span>
                <span>${formData.grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="partial">Partial Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount Paid</label>
                <Input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between">
                <span>Outstanding:</span>
                <span className={`font-medium ${formData.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${formData.outstanding.toFixed(2)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Files</span>
                  </label>
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit('preview')} 
            variant="outline"
            disabled={saving}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Purchase
          </Button>
          <Button 
            onClick={() => handleSubmit('save')} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button 
            onClick={() => handleSubmit('saveAndAdd')} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}