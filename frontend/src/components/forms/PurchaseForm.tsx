"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, Search, Save, Download, Upload, Calculator, AlertCircle, CheckCircle, Clock, TrendingUp, Package, DollarSign, FileText, Copy, Warehouse, MapPin } from "lucide-react";
import { Product, Supplier, Purchase, PurchaseItem, Warehouse as WarehouseType } from "@/types/inventory";

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchaseData: PurchaseFormData) => void;
  products: Product[];
  suppliers: Supplier[];
  warehouses: WarehouseType[];
}

interface PurchaseFormData {
  supplierId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: PurchaseFormItem[];
  paymentMethod: string;
  challanNumber?: string;
  invoiceNumber?: string;
  deliveryNote?: string;
  expectedDeliveryDate?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  purchaseOrderNumber?: string;
  paymentTerms?: string;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  notes?: string;
}

interface PurchaseFormItem {
  productId: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
}

export function PurchaseForm({ isOpen, onClose, onSubmit, products, suppliers, warehouses }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplierId: '',
    warehouseId: '',
    warehouseName: '',
    warehouseLocation: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }],
    paymentMethod: 'Cash'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Debug: Log warehouses to see if they're being passed
  useEffect(() => {
    console.log('Warehouses received:', warehouses);
    console.log('Warehouses length:', warehouses?.length);
  }, [warehouses]);

  const handleWarehouseChange = (warehouseId: string) => {
    console.log('Warehouse selected:', warehouseId);
    const selectedWarehouse = warehouses.find(w => w.id === warehouseId || w._id === warehouseId);
    console.log('Selected warehouse:', selectedWarehouse);
    
    setFormData(prev => ({
      ...prev,
      warehouseId: warehouseId,
      warehouseName: selectedWarehouse?.name || '',
      warehouseLocation: selectedWarehouse?.address || ''
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitCost: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseFormItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.warehouseId) {
      alert('Please select a warehouse');
      return;
    }
    
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }
    
    if (formData.items.some(item => !item.productId || item.quantity <= 0 || item.unitCost <= 0)) {
      alert('Please fill in all required item fields');
      return;
    }
    
    onSubmit(formData);
  };

  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitCost);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Purchase Order</h2>
            <p className="text-gray-600 mt-1">Add supplier details, select warehouse, and add purchase items</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Package className="inline w-4 h-4 mr-2" />
                Supplier *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id || supplier._id} value={supplier.id || supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Warehouse className="inline w-4 h-4 mr-2" />
                Warehouse *
              </label>
              <select
                value={formData.warehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses && warehouses.length > 0 ? (
                  warehouses.map(warehouse => (
                    <option key={warehouse.id || warehouse._id} value={warehouse.id || warehouse._id}>
                      {warehouse.name} - {warehouse.address}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No warehouses available</option>
                )}
              </select>
              {formData.warehouseName && (
                <div className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formData.warehouseLocation}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <DollarSign className="inline w-4 h-4 mr-2" />
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Purchase Items Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
              <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="bg-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Items Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-4 px-4 py-2 bg-white rounded-md border">
              <div className="col-span-3 font-medium text-gray-700">Product *</div>
              <div className="col-span-2 font-medium text-gray-700">Quantity *</div>
              <div className="col-span-2 font-medium text-gray-700">Unit Cost *</div>
              <div className="col-span-2 font-medium text-gray-700">Batch Number</div>
              <div className="col-span-2 font-medium text-gray-700">Expiry Date</div>
              <div className="col-span-1 font-medium text-gray-700">Action</div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-white rounded-md border hover:shadow-sm transition-shadow">
                  {/* Product Selection */}
                  <div className="col-span-3">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id || product._id} value={product.id || product._id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  {/* Batch Number */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.batchNumber || ''}
                      onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Batch #"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="col-span-2">
                    <input
                      type="date"
                      value={item.expiryDate || ''}
                      onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Action Button */}
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      variant="outline"
                      size="sm"
                      disabled={formData.items.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Item Total */}
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Items Total:</span>
                <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about this purchase..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
              <Save className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 