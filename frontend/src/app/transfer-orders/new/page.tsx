"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { transferOrderApi, TransferOrder, TransferOrderItem } from "@/lib/api/transferOrders";
import { 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  MapPin,
  User,
  FileText,
  Trash2
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'shop';
  address?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unitCost: number;
  availableStock?: number;
}

export default function NewTransferOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<TransferOrder>>({
    fromLocationId: '',
    fromLocationName: '',
    fromLocationType: 'warehouse',
    toLocationId: '',
    toLocationName: '',
    toLocationType: 'warehouse',
    items: [],
    requestedBy: 'Admin User', // Default for now
    notes: ''
  });

  // Data
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [shops, setShops] = useState<Location[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<TransferOrderItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Filter products when "from" location changes
  useEffect(() => {
    if (formData.fromLocationId && formData.fromLocationType === 'warehouse') {
      loadWarehouseProducts(formData.fromLocationId);
    } else {
      setProducts(allProducts);
    }
  }, [formData.fromLocationId, formData.fromLocationType, allProducts]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load warehouses
      const warehousesResponse = await fetch('http://localhost:5236/api/warehouses');
      const warehousesResult = await warehousesResponse.json();
      const warehousesData = warehousesResult.data || warehousesResult; // Handle both formats
      setWarehouses(Array.isArray(warehousesData) ? warehousesData.map((w: any) => ({
        id: w.id || w._id,
        name: w.name,
        type: 'warehouse' as const,
        address: w.address
      })) : []);

      // Load shops
      const shopsResponse = await fetch('http://localhost:5236/api/shops');
      const shopsResult = await shopsResponse.json();
      const shopsData = shopsResult.data || shopsResult; // Handle both formats
      setShops(Array.isArray(shopsData) ? shopsData.map((s: any) => ({
        id: s.id || s._id,
        name: s.name,
        type: 'shop' as const,
        address: s.address
      })) : []);

      // Load products with large page size to get all products
      const productsResponse = await fetch('http://localhost:5236/api/products?page=1&pageSize=1000');
      const productsResult = await productsResponse.json();
      const productsData = productsResult.data || productsResult; // Handle both formats
      const loadedProducts = Array.isArray(productsData) ? productsData.map((p: any) => ({
        id: p.id || p._id,
        name: p.name,
        sku: p.sku,
        unitCost: p.costPrice || p.price || 0
      })) : [];
      
      setAllProducts(loadedProducts);
      setProducts(loadedProducts);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseProducts = async (warehouseId: string) => {
    try {
      // Fetch warehouse stocks for the selected warehouse
      const response = await fetch(`http://localhost:5236/api/warehousestocks/warehouse/${warehouseId}`);
      if (!response.ok) {
        console.error('Failed to fetch warehouse stocks');
        setProducts(allProducts);
        return;
      }
      
      const warehouseStocks = await response.json();
      
      // Filter products to only show those with stock in this warehouse
      const availableProductIds = warehouseStocks
        .filter((stock: any) => stock.availableQuantity > 0)
        .map((stock: any) => stock.productId);
      
      const availableProducts = allProducts.filter(product =>
        availableProductIds.includes(product.id)
      );
      
      // Add available stock info to products
      const productsWithStock = availableProducts.map(product => {
        const stock = warehouseStocks.find((s: any) => s.productId === product.id);
        return {
          ...product,
          availableStock: stock?.availableQuantity || 0
        };
      });
      
      setProducts(productsWithStock);
      console.log(`Filtered to ${productsWithStock.length} products available in warehouse ${warehouseId}`);
    } catch (err) {
      console.error("Error loading warehouse products:", err);
      setProducts(allProducts);
    }
  };

  const getAllLocations = () => [
    ...warehouses,
    ...shops
  ];

  const handleLocationChange = (field: 'from' | 'to', locationId: string) => {
    const location = getAllLocations().find(l => l.id === locationId);
    if (location) {
      if (field === 'from') {
        setFormData(prev => ({
          ...prev,
          fromLocationId: location.id,
          fromLocationName: location.name,
          fromLocationType: location.type
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          toLocationId: location.id,
          toLocationName: location.name,
          toLocationType: location.type
        }));
      }
    }
  };

  const addProduct = () => {
    const newItem: TransferOrderItem = {
      productId: '',
      productName: '',
      productSKU: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      transferredQuantity: 0,
      remainingQuantity: 0,
      isFullyTransferred: false
    };
    setSelectedProducts(prev => [...prev, newItem]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const getProductStock = async (productId: string, locationId: string) => {
    try {
      const response = await fetch(`http://localhost:5236/api/warehouse-stocks/product/${productId}/warehouse/${locationId}`);
      if (response.ok) {
        const stockData = await response.json();
        return stockData.availableQuantity || 0;
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
    return 0;
  };

  const updateProduct = (index: number, field: keyof TransferOrderItem, value: any) => {
    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        
        // If product changed, update name and sku
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.productSKU = product.sku;
            updated.unitCost = product.unitCost;
          }
        }
        
        // Recalculate total cost
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCost = updated.quantity * updated.unitCost;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const totalItems = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = selectedProducts.reduce((sum, item) => sum + item.totalCost, 0);
    return { totalItems, totalValue };
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.fromLocationId || !formData.toLocationId) {
        setError('Please select both from and to locations');
        return;
      }

      if (formData.fromLocationId === formData.toLocationId) {
        setError('From and To locations cannot be the same');
        return;
      }

      if (selectedProducts.length === 0) {
        setError('Please add at least one product');
        return;
      }

      if (selectedProducts.some(item => !item.productId || item.quantity <= 0)) {
        setError('Please ensure all products are selected and have valid quantities');
        return;
      }

      if (!formData.requestedBy?.trim()) {
        setError('Please enter who is requesting this transfer');
        return;
      }

      // Prepare transfer order data
      const transferOrderData: TransferOrder = {
        transferNumber: `TEMP-${Date.now()}`, // Temporary number, will be overwritten by service
        fromLocationId: formData.fromLocationId!,
        fromLocationName: formData.fromLocationName!,
        fromLocationType: formData.fromLocationType!,
        toLocationId: formData.toLocationId!,
        toLocationName: formData.toLocationName!,
        toLocationType: formData.toLocationType!,
        items: selectedProducts.map(item => ({
          ...item,
          remainingQuantity: item.quantity, // Initially all quantity is remaining
          transferredQuantity: 0,
          isFullyTransferred: false
        })),
        requestedBy: formData.requestedBy!,
        notes: formData.notes || '',
        status: 'Pending',
        requestDate: new Date().toISOString()
      };

      console.log('Creating transfer order:', transferOrderData);
      await transferOrderApi.create(transferOrderData);
      
      alert('Transfer order created successfully!');
      router.push('/transfer-orders');
    } catch (error) {
      console.error('Error creating transfer order:', error);
      setError(`Failed to create transfer order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const { totalItems, totalValue } = calculateTotals();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/transfer-orders')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transfer Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold">New Transfer Order</h1>
              <p className="text-gray-600">Create a new stock transfer between locations</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromLocation">From Location</Label>
                    <select
                      id="fromLocation"
                      value={formData.fromLocationId}
                      onChange={(e) => handleLocationChange('from', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select from location...</option>
                      <optgroup label="Warehouses">
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Shops">
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="toLocation">To Location</Label>
                    <select
                      id="toLocation"
                      value={formData.toLocationId}
                      onChange={(e) => handleLocationChange('to', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select to location...</option>
                      <optgroup label="Warehouses">
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Shops">
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="requestedBy">Requested By</Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                    placeholder="Enter your name or ID"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or instructions..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products to Transfer
                  </div>
                  <Button onClick={addProduct} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products added yet</p>
                    <p className="text-sm">Click "Add Product" to start</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProducts.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label>Product</Label>
                            <select
                              value={item.productId}
                              onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select product...</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.sku}){product.availableStock !== undefined ? ` - Available: ${product.availableStock}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Unit Cost</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => updateProduct(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Total</Label>
                              <div className="mt-1 font-medium">
                                ${item.totalCost.toFixed(2)}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span className="font-medium">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span className="font-medium">{selectedProducts.length}</span>
                </div>
                
                {formData.fromLocationName && formData.toLocationName && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">From:</span>
                        <span>{formData.fromLocationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">To:</span>
                        <span>{formData.toLocationName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleSubmit} 
                disabled={saving || selectedProducts.length === 0}
                className="w-full"
              >
                {saving ? 'Creating...' : 'Create Transfer Order'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/transfer-orders')}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
