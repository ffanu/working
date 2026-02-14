"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { saleApi, productApi, customerApi } from "@/lib/api";
import { warehousesApi } from "@/lib/api/warehouses";
import { shopApi, Shop } from "@/lib/api/shops";
import { Product, Customer, Warehouse as WarehouseType } from "@/types/inventory";

interface SalesFormData {
  customerId: string;
  shopId: string;
  shopName: string;
  shopLocation: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: SalesItem[];
  paymentMethod: string;
  notes?: string;
}

interface SalesItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSKU: string;
  shopId: string;
  shopName: string;
  warehouseId: string;
  warehouseName: string;
}

export default function EditSalePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<SalesFormData>({
    customerId: '',
    shopId: '',
    shopName: '',
    shopLocation: '',
    warehouseId: '',
    warehouseName: '',
    warehouseLocation: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0, productName: '', productSKU: '', shopId: '', shopName: '', warehouseId: '', warehouseName: '' }],
    paymentMethod: 'Cash',
    notes: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saleId = params.id as string;

  useEffect(() => {
    loadData();
  }, [saleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saleData, productsData, customersData, warehousesData, shopsData] = await Promise.all([
        saleApi.getById(saleId),
        productApi.getAll(),
        customerApi.getAll(),
        warehousesApi.getActive(),
        shopApi.getActive()
      ]);

      setProducts(productsData.data || productsData);
      setCustomers(customersData.data || customersData);
      setWarehouses(warehousesData);
      setShops(shopsData);

      // Populate form with existing sale data
      setFormData({
        customerId: saleData.customerId,
        shopId: saleData.shopId || '',
        shopName: saleData.shopName || '',
        shopLocation: saleData.shopLocation || '',
        warehouseId: saleData.warehouseId || '',
        warehouseName: saleData.warehouseName || '',
        warehouseLocation: saleData.warehouseLocation || '',
        items: saleData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.productName || '',
          productSKU: item.productSKU || '',
          shopId: item.shopId || saleData.shopId || '',
          shopName: item.shopName || saleData.shopName || '',
          warehouseId: item.warehouseId || saleData.warehouseId || '',
          warehouseName: item.warehouseName || saleData.warehouseName || ''
        })),
        paymentMethod: saleData.paymentMethod,
        notes: saleData.notes || ''
      });

      // Set selected shop for warehouse filtering
      if (saleData.shopId) {
        setSelectedShop(saleData.shopId);
      }
    } catch (err) {
      setError("Failed to load sale data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = async (shopId: string) => {
    setSelectedShop(shopId);
    
    // Clear current warehouse selection
    setFormData(prev => ({
      ...prev,
      warehouseId: "",
      warehouseName: "",
      warehouseLocation: ""
    }));
    
    // Load warehouses for the selected shop
    if (shopId) {
      try {
        const shopWarehouses = await warehousesApi.getByShopId(shopId);
        setWarehouses(shopWarehouses);
        
        // Update shop info in form
        const selectedShopData = shops.find(shop => shop.id === shopId || shop._id === shopId);
        setFormData(prev => ({
          ...prev,
          shopId: shopId,
          shopName: selectedShopData?.name || '',
          shopLocation: selectedShopData?.address || ''
        }));
      } catch (err) {
        console.error("Error loading warehouses for shop:", err);
        setError("Failed to load warehouses for selected shop");
      }
    } else {
      // Load all warehouses if no shop selected
      try {
        const allWarehouses = await warehousesApi.getActive();
        setWarehouses(allWarehouses);
      } catch (err) {
        console.error("Error loading all warehouses:", err);
      }
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId || w._id === warehouseId);
    if (warehouse) {
      setFormData(prev => ({
        ...prev,
        warehouseId: warehouseId,
        warehouseName: warehouse.name,
        warehouseLocation: warehouse.address || ''
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        productId: '', 
        quantity: 1, 
        unitPrice: 0, 
        productName: '', 
        productSKU: '', 
        shopId: formData.shopId, 
        shopName: formData.shopName, 
        warehouseId: formData.warehouseId, 
        warehouseName: formData.warehouseName 
      }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof SalesItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // If product is selected, update product details
          if (field === 'productId' && typeof value === 'string') {
            const product = products.find(p => p.id === value || p._id === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.productSKU = product.sku || '';
              updatedItem.unitPrice = product.price || 0;
              updatedItem.shopId = formData.shopId;
              updatedItem.shopName = formData.shopName;
              updatedItem.warehouseId = formData.warehouseId;
              updatedItem.warehouseName = formData.warehouseName;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.customerId) {
      setError("Please select a customer");
      return;
    }
    
    if (formData.items.length === 0) {
      setError("Please add at least one item");
      return;
    }
    
    if (formData.items.some(item => !item.productId || item.quantity <= 0 || item.unitPrice <= 0)) {
      setError("Please fill in all item details correctly");
      return;
    }
    
    try {
      setError(null);
      
      // Prepare sale data
      const saleData = {
        customerId: formData.customerId,
        customerName: customers.find(c => c.id === formData.customerId)?.name || '',
        // Shop information
        shopId: formData.shopId,
        shopName: formData.shopName,
        shopLocation: formData.shopLocation,
        // Warehouse information
        warehouseId: formData.warehouseId,
        warehouseName: formData.warehouseName,
        warehouseLocation: formData.warehouseLocation,
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName || products.find(p => p.id === item.productId)?.name || '',
          productSKU: item.productSKU || products.find(p => p.id === item.productId)?.sku || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          // Shop information for each item
          shopId: item.shopId || formData.shopId,
          shopName: item.shopName || formData.shopName,
          // Warehouse information for each item
          warehouseId: item.warehouseId || formData.warehouseId,
          warehouseName: item.warehouseName || formData.warehouseName
        })),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || '',
        status: 'completed'
      };

      console.log('Updating sale data:', saleData);
      
      await saleApi.update(saleId, saleData);
      router.push(`/sales/${saleId}`);
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(`Failed to update sale: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/sales/${saleId}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sale
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sale #{saleId}</h1>
          <p className="text-gray-600">Update sale information</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Edit Sale Details</CardTitle>
          <CardDescription>Update the details for this sale</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shop and Warehouse Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shop</label>
                <select
                  value={selectedShop}
                  onChange={(e) => handleShopChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Shop</option>
                  {shops.map(shop => (
                    <option key={shop.id || shop._id} value={shop.id || shop._id}>
                      {shop.name} - {shop.address}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Warehouse</label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => handleWarehouseChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Items</label>
                <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium mb-1">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Total</label>
                      <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/sales/${saleId}`)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                Update Sale
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
} 