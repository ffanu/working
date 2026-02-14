"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft, Plus, Trash2, Search, ShoppingCart, CreditCard, DollarSign, 
  Receipt, Printer, Calculator, X, FileText, Warehouse, MapPin, 
  Package, Barcode, User, Calendar, Filter, Minus, Percent, 
  Save, RotateCcw, CheckCircle, Users, UserPlus
} from "lucide-react";
import { productApi, customerApi, saleApi } from "@/lib/api";
import { categoryApi } from "@/lib/api/categories";
import { warehousesApi } from "@/lib/api/warehouses";
import { shopApi, Shop } from "@/lib/api/shops";
import { Product, Customer, Warehouse as WarehouseType, Category } from "@/types/inventory";

interface SalesFormData {
  customerId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: SalesItem[];
  paymentMethod: string;
  notes?: string;
  cashReceived?: number;
  change?: number;
  totalDiscount?: number;
  taxRate?: number;
}

interface SalesItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSKU: string;
  barcode?: string;
  category?: string;
  warehouseId: string;
  warehouseName: string;
  availableStock: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

// Shop interface is now imported from the API

export default function POSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [products, setProducts] = useState<Product[]>([]); // Store location-filtered products
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<SalesFormData>({
    customerId: "",
    warehouseId: "",
    warehouseName: "",
    warehouseLocation: "",
    items: [],
    paymentMethod: "Cash",
    notes: "",
    cashReceived: 0,
    change: 0,
    totalDiscount: 0,
    taxRate: 10
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('Cashier 1');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingSaleId, setEditingSaleId] = useState<string>('');
  const [lastCreatedSale, setLastCreatedSale] = useState<any>(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  // Generate unique invoice number
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      const newInvoiceNumber = `INV-${year}${month}${day}-${timestamp}`;
      setInvoiceNumber(newInvoiceNumber);
    };
    
    generateInvoiceNumber();
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Load location-specific products when warehouse OR shop changes
  useEffect(() => {
    const locationId = formData.warehouseId || selectedShop;
    if (locationId && allProducts.length > 0) {
      loadLocationProducts(locationId);
    } else {
      // If no location selected, show all products
      setProducts(allProducts);
    }
  }, [formData.warehouseId, selectedShop, allProducts]);

  // Check for edit parameter and load sale for editing
  useEffect(() => {
    const editSaleId = searchParams.get('edit');
    if (editSaleId && !editMode) {
      loadSaleForEdit(editSaleId);
    }
  }, [searchParams, editMode]);

  // Product search effect
  useEffect(() => {
    if (searchTerm) {
      let filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }
      
      setFilteredProducts(filtered.slice(0, 20)); // Limit to 20 results
    } else {
      // Show all products or filter by category only
      let filtered = products;
      if (selectedCategory !== 'all') {
        filtered = products.filter(product => product.category === selectedCategory);
      }
      setFilteredProducts(filtered.slice(0, 20));
    }
  }, [searchTerm, products, selectedCategory]);

  // Customer search effect
  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered.slice(0, 10));
    } else {
      setFilteredCustomers([]);
    }
  }, [customerSearchTerm, customers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, customersData, warehousesData, categoriesData, shopsData] = await Promise.all([
        productApi.getAll({ page: 1, pageSize: 1000 }), // Load all products
        customerApi.getAll(),
        warehousesApi.getAll(),
        categoryApi.getAllCategories(),
        shopApi.getActive()
      ]);
      
      const allProductsData = productsData.data || productsData;
      setAllProducts(allProductsData); // Store all products
      setProducts(allProductsData); // Initially show all products
      setCustomers(customersData.data || customersData);
      setWarehouses(warehousesData.data || warehousesData);
      setCategories(categoriesData);
      setShops(shopsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadLocationProducts = async (locationId: string) => {
    try {
      // Import the warehouse stocks API
      const { warehouseStocksApi } = await import('@/lib/api/warehouseStocks');
      const locationStocks = await warehouseStocksApi.getByWarehouse(locationId);
      
      // Create a map of productId to location-specific stock
      const stockMap = new Map(
        locationStocks.map(stock => [stock.productId, stock.availableQuantity])
      );
      
      // Filter products to only show those available in this location
      // AND attach the location-specific stock quantity
      const availableProducts = allProducts
        .filter(product => {
          const productId = product.id || product._id || '';
          const stock = stockMap.get(productId);
          return stock !== undefined && stock > 0;
        })
        .map(product => ({
          ...product,
          quantity: stockMap.get(product.id || product._id || '') || 0, // Override with location-specific stock
        }));
      
      // Store available products for display
      setProducts(availableProducts);
      console.log(`Filtered to ${availableProducts.length} products available in location ${locationId}`);
    } catch (err) {
      console.error("Error loading location products:", err);
      setProducts(allProducts); // Fallback to all products on error
    }
  };

  const loadSaleForEdit = async (saleId: string) => {
    try {
      setLoading(true);
      const saleData = await saleApi.getById(saleId);
      
      // Set shop and warehouse
      setSelectedShop(saleData.shopId || '');
      if (saleData.shopId) {
        const shopWarehouses = await warehousesApi.getByShopId(saleData.shopId);
        setWarehouses(shopWarehouses);
      }
      
      // Set form data
      setFormData({
        customerId: saleData.customerId,
        warehouseId: saleData.warehouseId,
        warehouseName: saleData.warehouseName,
        warehouseLocation: saleData.warehouseLocation,
        items: saleData.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productSKU: item.productSKU,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          warehouseId: item.warehouseId || saleData.warehouseId,
          warehouseName: item.warehouseName || saleData.warehouseName,
          availableStock: 100 // Default value for editing
        })),
        paymentMethod: saleData.paymentMethod,
        notes: saleData.notes || '',
        cashReceived: saleData.cashReceived || 0,
        change: saleData.change || 0,
        totalDiscount: saleData.totalDiscount || 0,
        taxRate: 10
      });
      
      // Set customer
      const customer = customers.find(c => c.id === saleData.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
      
      setEditMode(true);
      setEditingSaleId(saleId);
    } catch (err) {
      console.error("Error loading sale for edit:", err);
      setError("Failed to load sale for editing");
    } finally {
      setLoading(false);
    }
  };

  const addProductToCart = (product: Product) => {
    const existingItemIndex = formData.items.findIndex(item => item.productId === (product.id || product._id));
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      updateItemQuantity(existingItemIndex, formData.items[existingItemIndex].quantity + 1);
    } else {
      // Add new product to cart
      const newItem: SalesItem = {
        productId: product.id || product._id || '',
        productName: product.name,
        productSKU: product.sku,
        barcode: product.barcode,
        category: product.category,
        quantity: 1,
        unitPrice: product.price,
        warehouseId: formData.warehouseId,
        warehouseName: formData.warehouseName,
        availableStock: product.quantity,
        discount: 0,
        discountType: 'percentage'
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
    
    // Clear search
    setSearchTerm('');
    setBarcodeInput('');
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemDiscount = (index: number, discount: number, type: 'percentage' | 'fixed') => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, discount, discountType: type } : item
      )
    }));
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id || customer._id || '' }));
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => (w.id || w._id) === warehouseId);
    if (warehouse) {
      setFormData(prev => ({
        ...prev,
        warehouseId: warehouseId,
        warehouseName: warehouse.name,
        warehouseLocation: warehouse.address || ''
      }));
    }
    // Clear shop selection when warehouse is selected
    if (warehouseId) {
      setSelectedShop("");
    }
  };

  const handleShopChange = (shopId: string) => {
    setSelectedShop(shopId);
    // Clear warehouse selection when shop is selected
    if (shopId) {
      setFormData(prev => ({
        ...prev,
        warehouseId: "",
        warehouseName: "",
        warehouseLocation: ""
      }));
    }
  };

  const calculateItemSubtotal = (item: SalesItem) => {
    const subtotal = item.quantity * item.unitPrice;
    if (item.discount && item.discount > 0) {
      if (item.discountType === 'percentage') {
        return subtotal * (1 - item.discount / 100);
      } else {
        return Math.max(0, subtotal - item.discount);
      }
    }
    return subtotal;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => total + calculateItemSubtotal(item), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.taxRate || 10) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const totalDiscount = formData.totalDiscount || 0;
    return subtotal + tax - totalDiscount;
  };

  const calculateChange = () => {
    if (formData.paymentMethod === 'Cash' && formData.cashReceived) {
      return formData.cashReceived - calculateTotal();
    }
    return 0;
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
      cashReceived: method === 'Cash' ? prev.cashReceived : 0,
      change: 0
    }));
  };

  const handleCashReceivedChange = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      cashReceived: amount,
      change: calculateChange()
    }));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      const product = products.find(p => p.barcode === barcodeInput.trim());
      if (product) {
        addProductToCart(product);
      } else {
        alert('Product not found with this barcode');
      }
    }
  };

  const handleHoldOrder = () => {
    // In a real app, save to local storage or database
    const holdData = {
      ...formData,
      selectedCustomer,
      selectedShop,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('heldOrder', JSON.stringify(holdData));
    alert('Order held successfully!');
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setFormData(prev => ({
        ...prev,
        items: [],
        totalDiscount: 0
      }));
      setSelectedCustomer(null);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastCreatedSale) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>INVENTORY SYSTEM</h2>
            <p>Receipt #${invoiceNumber}</p>
            <p>Date: ${currentDate}</p>
            <p>Cashier: ${currentUser}</p>
          </div>
          
          <div>
            <p><strong>Customer:</strong> ${lastCreatedSale.customerName}</p>
            <p><strong>Payment:</strong> ${lastCreatedSale.paymentMethod}</p>
            <hr>
            
            <h3>Items:</h3>
            ${lastCreatedSale.items.map((item: any) => `
              <div class="item">
                <span>${item.productName} x${item.quantity}</span>
                <span>$${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="total">
              <div class="item">
                <span>Subtotal:</span>
                <span>$${lastCreatedSale.subtotal.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Tax:</span>
                <span>$${lastCreatedSale.tax.toFixed(2)}</span>
              </div>
              <div class="item">
                <span><strong>TOTAL:</strong></span>
                <span><strong>$${lastCreatedSale.totalAmount.toFixed(2)}</strong></span>
              </div>
            </div>
            
            ${lastCreatedSale.cashReceived > 0 ? `
              <div class="item">
                <span>Cash Received:</span>
                <span>$${lastCreatedSale.cashReceived.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Change:</span>
                <span>$${lastCreatedSale.change.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePrintInvoice = () => {
    if (!lastCreatedSale) return;
    router.push(`/sales/${lastCreatedSale.id || lastCreatedSale._id}/invoice`);
  };

  const handleSubmit = async () => {
    // Walk-in customers are allowed (selectedCustomer can be null)
    
    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // Validate warehouse OR shop selection (at least one required)
    if (!formData.warehouseId && !selectedShop) {
      alert("Please select either a warehouse or a shop");
      return;
    }

    try {
      const selectedShopData = shops.find(shop => shop.id === selectedShop || shop._id === selectedShop);
      
      const saleData = {
        customerId: selectedCustomer?.id || 'walk-in',
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        // Shop information
        shopId: selectedShop,
        shopName: selectedShopData?.name || '',
        shopLocation: selectedShopData?.address || '',
        // Warehouse information
        warehouseId: formData.warehouseId,
        warehouseName: formData.warehouseName,
        warehouseLocation: formData.warehouseLocation,
        items: formData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSKU: item.productSKU,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: calculateItemSubtotal(item),
          discount: item.discount || 0,
          discountType: item.discountType || 'percentage',
          // Shop information for each item
          shopId: selectedShop,
          shopName: selectedShopData?.name || '',
          // Warehouse information for each item
          warehouseId: item.warehouseId,
          warehouseName: item.warehouseName
        })),
        totalAmount: calculateTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        totalDiscount: formData.totalDiscount || 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        cashReceived: formData.cashReceived || 0,
        change: formData.change || 0
      };

      if (editMode) {
        await saleApi.update(editingSaleId, saleData);
        alert("Sale updated successfully!");
        setEditMode(false);
        setEditingSaleId('');
        // Redirect back to sales list after successful edit
        router.push('/sales');
        return;
      } else {
        const createdSale = await saleApi.create(saleData);
        setLastCreatedSale(createdSale);
        setShowPrintOptions(true);
        alert("Sale completed successfully! Choose print option below.");
      }
      
      // Reset form
      setFormData({
        customerId: "",
        warehouseId: "",
        warehouseName: "",
        warehouseLocation: "",
        items: [],
        paymentMethod: "Cash",
        notes: "",
        cashReceived: 0,
        change: 0,
        totalDiscount: 0,
        taxRate: 10
      });
      setSelectedCustomer(null);
      setSelectedShop('');
    } catch (err) {
      console.error("Error creating sale:", err);
      alert("Failed to create sale");
    }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/sales')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
          <div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editMode ? `Edit Sale #${editingSaleId}` : 'Point of Sale (POS)'}
              </h1>
              <p className="text-gray-600">
                {editMode ? 'Edit existing sale with full POS features' : 'Enhanced POS with product cards and advanced features'}
              </p>
              {editMode && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/sales')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Sales List
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Invoice: {invoiceNumber}</div>
            <div className="text-sm text-gray-500">Date: {currentDate}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const saleId = prompt("Enter Sale ID to edit:");
                if (saleId) {
                  router.push(`/sales/pos?edit=${saleId}`);
                }
              }}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Sale
            </Button>
            {editMode && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setEditingSaleId('');
                  setFormData({
                    customerId: "",
                    warehouseId: "",
                    warehouseName: "",
                    warehouseLocation: "",
                    items: [],
                    paymentMethod: "Cash",
                    notes: "",
                    cashReceived: 0,
                    change: 0,
                    totalDiscount: 0,
                    taxRate: 10
                  });
                  setSelectedCustomer(null);
                  setSelectedShop('');
                  // Clear the edit query parameter
                  router.push('/sales/pos');
                }}
                className="flex items-center text-red-600"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
          <select
            value={selectedShop}
            onChange={(e) => handleShopChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
          <select
            value={formData.warehouseId}
            onChange={(e) => handleWarehouseChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Warehouse</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id || warehouse._id} value={warehouse.id || warehouse._id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{currentUser}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Product Search and Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Product Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Barcode Input */}
              <form onSubmit={handleBarcodeSubmit} className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Scan barcode or enter manually..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <Barcode className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </form>

              {/* Text Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id || category._id}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Cards Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Products ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id || product._id}
                    className="border rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow bg-white"
                    onClick={() => addProductToCart(product)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="font-medium text-sm mb-1 truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{product.sku}</div>
                      <div className="font-semibold text-green-600">${product.price}</div>
                      <div className="text-xs text-gray-400">Stock: {product.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Cart and Checkout */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={!selectedCustomer ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Walk-in
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Select
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/customers')}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>
                
                {selectedCustomer && (
                  <div className="p-2 bg-blue-50 rounded border">
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
                  </div>
                )}
                
                {showCustomerSearch && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search customers..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto border rounded">
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium text-sm">{customer.name}</div>
                          <div className="text-xs text-gray-600">{customer.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({formData.items.length})
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHoldOrder}
                    disabled={formData.items.length === 0}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Hold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={formData.items.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm">Search and add products</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 grid grid-cols-5 gap-2 pb-1 border-b">
                    <span>Product</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Disc</span>
                    <span>Total</span>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 text-sm">
                      <div className="truncate" title={item.productName}>
                        {item.productName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateItemQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>${item.unitPrice.toFixed(2)}</div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.discount || 0}
                          onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0, 'percentage')}
                          className="w-12 h-6 text-xs"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <div className="font-medium">${calculateItemSubtotal(item).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${(formData.totalDiscount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['Cash', 'Card', 'Mobile', 'Split'].map((method) => (
                  <Button
                    key={method}
                    variant={formData.paymentMethod === method ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePaymentMethodChange(method)}
                  >
                    {method === 'Cash' && <DollarSign className="h-4 w-4 mr-1" />}
                    {method === 'Card' && <CreditCard className="h-4 w-4 mr-1" />}
                    {method === 'Mobile' && <Receipt className="h-4 w-4 mr-1" />}
                    {method === 'Split' && <Calculator className="h-4 w-4 mr-1" />}
                    {method}
                  </Button>
                ))}
              </div>

              {formData.paymentMethod === 'Cash' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Cash Received</label>
                  <Input
                    type="number"
                    step="0.01"
                    min={calculateTotal()}
                    value={formData.cashReceived || ''}
                    onChange={(e) => handleCashReceivedChange(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                  {formData.cashReceived && formData.cashReceived >= calculateTotal() && (
                    <div className="mt-2 text-sm text-green-600">
                      Change: ${calculateChange().toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
            disabled={formData.items.length === 0}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            CHECKOUT ✅
          </Button>

          {/* Print Options - Show after successful sale */}
          {showPrintOptions && lastCreatedSale && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Sale Completed Successfully!
                </CardTitle>
                <CardDescription className="text-green-700">
                  Print your invoice below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center">
                  <Button
                    onClick={handlePrintInvoice}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white max-w-xs"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setShowPrintOptions(false);
                      setLastCreatedSale(null);
                    }}
                    variant="outline"
                    className="text-gray-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
