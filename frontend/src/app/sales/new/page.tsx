"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowLeft, Plus, Trash2, Search, ShoppingCart, CreditCard, DollarSign, Receipt, Printer, Calculator, X, FileText, Warehouse, MapPin, Building } from "lucide-react";
import { productApi, customerApi, saleApi } from "@/lib/api";
import { warehousesApi } from "@/lib/api/warehouses";
import { shopApi } from "@/lib/api/shops";
import { Product, Customer, Warehouse as WarehouseType } from "@/types/inventory";

interface SalesFormData {
  customerId: string;
  // NEW: Warehouse relationship
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  items: SalesItem[];
  paymentMethod: string;
  notes?: string;
  cashReceived?: number;
  change?: number;
}

interface SalesItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSKU: string;
  // NEW: Warehouse-specific item tracking
  warehouseId: string;
  warehouseName: string;
  availableStock: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [products, setProducts] = useState<Product[]>([]); // Store warehouse-filtered products
  const [customers, setCustomers] = useState<Customer[]>([]);
  // NEW: Warehouse state
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  // NEW: Shop state
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SalesFormData>({
    customerId: "",
    // NEW: Warehouse relationship
    warehouseId: "",
    warehouseName: "",
    warehouseLocation: "",
    items: [],
    paymentMethod: "Cash",
    notes: "",
    cashReceived: 0,
    change: 0
  });

  // POS-specific states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const printRef = useRef<HTMLDivElement>(null);
  const formalInvoiceRef = useRef<HTMLDivElement>(null);

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
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Load warehouse-specific products when warehouse OR shop changes
  useEffect(() => {
    const locationId = formData.warehouseId || selectedShop;
    if (locationId && allProducts.length > 0) {
      loadWarehouseProducts(locationId);
    } else {
      // If no location selected, show all products
      setProducts(allProducts);
      setFilteredProducts([]);
    }
  }, [formData.warehouseId, selectedShop, allProducts]);

  const loadWarehouseProducts = async (warehouseId: string) => {
    try {
      // Import the warehouse stocks API
      const { warehouseStocksApi } = await import('@/lib/api/warehouseStocks');
      const warehouseStocks = await warehouseStocksApi.getByWarehouse(warehouseId);
      
      // Create a map of productId to warehouse-specific stock
      const stockMap = new Map(
        warehouseStocks.map(stock => [stock.productId, stock.availableQuantity])
      );
      
      // Filter products to only show those available in this warehouse
      // AND attach the warehouse-specific stock quantity
      const availableProducts = allProducts
        .filter(product => {
          const productId = product.id || product._id || '';
          const stock = stockMap.get(productId);
          return stock !== undefined && stock > 0;
        })
        .map(product => ({
          ...product,
          quantity: stockMap.get(product.id || product._id || '') || 0, // Override with warehouse-specific stock
          warehouseStock: stockMap.get(product.id || product._id || '') || 0 // Also store separately
        }));
      
      // Store available products for search filtering
      setProducts(availableProducts);
      console.log(`Filtered to ${availableProducts.length} products available in warehouse/shop ${warehouseId}`);
    } catch (err) {
      console.error("Error loading warehouse products:", err);
      setError("Failed to load warehouse products");
    }
  };

  // Product search effect
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  // Customer search effect
  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setFilteredCustomers([]);
    }
  }, [customerSearchTerm, customers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, customersData, warehousesData, shopsData] = await Promise.all([
        productApi.getAll({ page: 1, pageSize: 1000 }), // Load all products
        customerApi.getAll(),
        warehousesApi.getAll(), // Use getAll instead of getActive
        shopApi.getActive()
      ]);
      
      const allProductsData = productsData.data || productsData;
      setAllProducts(allProductsData); // Store all products
      setProducts(allProductsData); // Initially show all products
      setCustomers(customersData.data || customersData);
      // NEW: Set warehouses
      setWarehouses(warehousesData.data || warehousesData);
      // NEW: Set shops
      setShops(shopsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle warehouse selection
  const handleWarehouseChange = (warehouseId: string) => {
    const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
    setFormData(prev => ({
      ...prev,
      warehouseId: warehouseId,
      warehouseName: selectedWarehouse?.name || '',
      warehouseLocation: selectedWarehouse?.address || ''
    }));
    // Clear shop selection when warehouse is selected
    if (warehouseId) {
      setSelectedShop("");
    }
  };

  // NEW: Handle shop selection
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

  const addProductToCart = (product: Product) => {
    const existingItem = formData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: product.id || product._id || '',
          quantity: 1,
          unitPrice: product.price,
          productName: product.name,
          productSKU: product.sku,
          // NEW: Warehouse-specific item tracking
          warehouseId: formData.warehouseId, // Assuming warehouseId is set elsewhere or default
          warehouseName: formData.warehouseName, // Assuming warehouseName is set elsewhere or default
          availableStock: product.quantity // Assuming availableStock is the current stock
        }]
      }));
    }
    setSearchTerm('');
    setFilteredProducts([]);
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

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId: customer.id || customer._id || '' }));
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
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

  const handlePrintInvoice = () => {
    // Ensure we have the latest data
    if (formData.items.length === 0) {
      alert('No items to print in invoice');
      return;
    }
    
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    
    setIsPrinting(true);
    setTimeout(() => {
      if (printRef.current) {
        // Force a re-render to ensure latest data is shown
        window.print();
      }
      setIsPrinting(false);
    }, 100);
  };

  const generateFormalInvoice = () => {
    if (formData.items.length === 0) {
      alert('No items to generate invoice for');
      return;
    }
    
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    
    // Create a completely separate formal invoice window
    const invoiceWindow = window.open('', '_blank', 'width=900,height=1200');
    if (invoiceWindow) {
      const currentDate = new Date();
      const dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const transactionId = 'TXN-' + Date.now().toString().slice(-8);
      
      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Formal Invoice - ${invoiceNumber}</title>
            <meta charset="utf-8">
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .invoice-container { border: none; }
              }
              
              * { box-sizing: border-box; }
              
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f5f5f5; 
                color: #000;
                line-height: 1.4;
              }
              
              .invoice-container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border: 2px solid #000;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              
              .header { 
                text-align: center; 
                border-bottom: 3px solid #000; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              
              .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 10px; 
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              
              .company-tagline { 
                font-size: 16px; 
                margin-bottom: 15px; 
                font-style: italic;
              }
              
              .invoice-details { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px; 
                gap: 30px;
              }
              
              .customer-info {
                flex: 1;
              }
              
              .invoice-box { 
                border: 2px solid #000; 
                padding: 20px; 
                text-align: center; 
                min-width: 220px;
                background: #f9f9f9;
              }
              
              .invoice-box .label { 
                font-size: 12px; 
                font-weight: bold; 
                margin-bottom: 5px; 
                text-transform: uppercase;
                color: #666;
              }
              
              .invoice-box .value { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 15px; 
                color: #000;
              }
              
              .info-section h3 { 
                font-size: 18px; 
                font-weight: bold; 
                border-bottom: 2px solid #000; 
                padding-bottom: 8px; 
                margin-bottom: 15px; 
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              .info-section p { 
                margin: 8px 0; 
                font-size: 14px;
              }
              
              .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 30px; 
                border: 2px solid #000;
              }
              
              .items-table th { 
                background: #000; 
                color: white; 
                padding: 15px 10px; 
                text-align: center; 
                border: 1px solid #000; 
                font-weight: bold;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              .items-table td { 
                padding: 15px 10px; 
                border: 1px solid #000; 
                text-align: center;
                font-size: 14px;
                vertical-align: top;
              }
              
              .items-table .item-name { 
                text-align: left; 
                font-weight: bold; 
                min-width: 200px;
              }
              
              .items-table .sku { 
                color: #666; 
                font-size: 11px; 
                margin-top: 5px;
                font-style: italic;
              }
              
              .totals-section { 
                display: flex; 
                justify-content: flex-end; 
                margin-bottom: 30px; 
              }
              
              .totals-box { 
                width: 350px; 
                border: 2px solid #000; 
              }
              
              .totals-header { 
                background: #000; 
                color: white; 
                padding: 15px; 
                text-align: center;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              .totals-content { 
                padding: 20px; 
              }
              
              .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0; 
                font-size: 14px;
              }
              
              .total-row.total { 
                border-top: 2px solid #000; 
                padding-top: 15px; 
                font-size: 18px; 
                font-weight: bold; 
              }
              
              .payment-info { 
                border: 2px solid #000; 
                padding: 20px; 
                margin-bottom: 30px; 
                background: #f9f9f9;
              }
              
              .payment-info h4 { 
                font-weight: bold; 
                margin-bottom: 10px; 
                text-transform: uppercase;
                font-size: 16px;
                letter-spacing: 1px;
              }
              
              .payment-info .grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 30px; 
              }
              
              .footer { 
                text-align: center; 
                border-top: 2px solid #000; 
                padding-top: 20px; 
                margin-top: 30px; 
                font-size: 12px;
              }
              
              .footer h3 { 
                font-weight: bold; 
                margin-bottom: 10px; 
                font-size: 16px;
              }
              
              .terms { 
                margin-top: 20px; 
                padding: 20px; 
                border: 1px solid #ccc; 
                background: #f9f9f9;
                font-size: 11px;
                line-height: 1.4;
                text-align: left;
              }
              
              .print-button { 
                position: fixed; 
                top: 20px; 
                right: 20px; 
                padding: 12px 24px; 
                background: #000; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
              }
              
              .print-button:hover {
                background: #333;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              }
              
              .status-paid {
                color: #059669;
                font-weight: bold;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
            
            <div class="invoice-container">
              <div class="header">
                <div class="company-name">Inventory Management System</div>
                <div class="company-tagline">Professional Business Solutions</div>
                <div style="margin: 10px 0; font-size: 14px;">
                  123 Business Street, Suite 100, Business City, BC 12345
                </div>
                <div style="margin: 5px 0; font-size: 14px;">
                  Phone: (555) 123-4567 | Email: info@inventorysystem.com
                </div>
                <div style="margin: 5px 0; font-size: 14px;">
                  Website: www.inventorysystem.com | Tax ID: TAX-123456789
                </div>
              </div>
              
              <div class="invoice-details">
                <div class="customer-info">
                  <h3>Bill To:</h3>
                  <p style="font-weight: bold; font-size: 16px;">${selectedCustomer.name}</p>
                  <p>${selectedCustomer.email}</p>
                  <p>Customer Address</p>
                  <p>Customer City, State ZIP</p>
                  <p>Phone: Customer Phone</p>
                </div>
                
                <div class="invoice-box">
                  <div class="label">Invoice Number</div>
                  <div class="value">${invoiceNumber}</div>
                  <div class="label">Invoice Date</div>
                  <div class="value">${currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                  <div class="label">Due Date</div>
                  <div class="value">${dueDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.items.map(item => `
                    <tr>
                      <td class="item-name">
                        ${item.productName}
                        <div class="sku">SKU: ${item.productSKU}</div>
                      </td>
                      <td>${item.productSKU}</td>
                      <td>${item.quantity}</td>
                      <td>$${item.unitPrice.toFixed(2)}</td>
                      <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals-section">
                <div class="totals-box">
                  <div class="totals-header">
                    <h3>Invoice Summary</h3>
                  </div>
                  <div class="totals-content">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>$${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                      <span>Tax (10%):</span>
                      <span>$${calculateTax().toFixed(2)}</span>
                    </div>
                    <div class="total-row total">
                      <span>Total Amount:</span>
                      <span>$${calculateTotal().toFixed(2)}</span>
                    </div>
                    ${formData.paymentMethod === 'Cash' && formData.cashReceived ? `
                      <div class="total-row">
                        <span>Cash Received:</span>
                        <span>$${formData.cashReceived.toFixed(2)}</span>
                      </div>
                      <div class="total-row total status-paid">
                        <span>Change Due:</span>
                        <span>$${calculateChange().toFixed(2)}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <div class="payment-info">
                <div class="grid">
                  <div>
                    <h4>Payment Method:</h4>
                    <p style="font-size: 16px; font-weight: bold;">${formData.paymentMethod}</p>
                    <p style="font-size: 12px; color: #666;">Transaction ID: ${transactionId}</p>
                  </div>
                  <div>
                    <h4>Payment Status:</h4>
                    <p class="status-paid">PAID</p>
                    <p style="font-size: 12px; color: #666;">Payment Date: ${currentDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <h3>Thank you for your business!</h3>
                <p>This is a computer-generated invoice. No signature required.</p>
                
                <div class="terms">
                  <strong>Terms & Conditions:</strong><br><br>
                  • Payment is due within 30 days of invoice date<br>
                  • Late payments may incur additional charges of 1.5% per month<br>
                  • Returns accepted within 14 days with original receipt<br>
                  • All sales are final after 14 days<br>
                  • For questions or support, contact: support@inventorysystem.com<br>
                  • This invoice is valid for 90 days from the date of issue
                </div>
              </div>
            </div>
            
            <script>
              // Auto-focus the window for better UX
              window.focus();
            </script>
          </body>
        </html>
      `);
      
      invoiceWindow.document.close();
      
      // Wait for content to load then focus
      setTimeout(() => {
        invoiceWindow.focus();
      }, 100);
    }
  };

  const previewInvoice = () => {
    if (formData.items.length === 0) {
      alert('No items to preview in invoice');
      return;
    }
    
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    
    // Show invoice preview in a new window
    const invoiceWindow = window.open('', '_blank', 'width=800,height=1000');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Professional Invoice Preview</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
              .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
              .header { border-bottom: 3px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 36px; color: #1f2937; margin: 0 0 10px 0; }
              .company-info { color: #6b7280; margin-bottom: 5px; }
              .invoice-box { background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; }
              .invoice-box .label { font-size: 14px; color: #d1d5db; margin-bottom: 5px; }
              .invoice-box .value { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
              .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
              .info-section h3 { color: #1f2937; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; margin-bottom: 15px; }
              .info-section p { margin: 5px 0; color: #374151; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .items-table th { background: #1f2937; color: white; padding: 15px; text-align: left; border: 1px solid #374151; }
              .items-table td { padding: 15px; border: 1px solid #d1d5db; }
              .items-table tr:nth-child(even) { background: #f9fafb; }
              .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
              .totals-box { width: 320px; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
              .totals-header { background: #f3f4f6; padding: 15px; border-bottom: 1px solid #d1d5db; }
              .totals-header h3 { margin: 0; color: #1f2937; }
              .totals-content { padding: 20px; }
              .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
              .total-row.total { border-top: 1px solid #d1d5db; padding-top: 15px; font-size: 18px; font-weight: bold; color: #1f2937; }
              .payment-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .payment-info h4 { color: #1f2937; margin-bottom: 10px; }
              .payment-info .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .footer { text-align: center; border-top: 1px solid #d1d5db; padding-top: 20px; color: #6b7280; }
              .footer h3 { color: #1f2937; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h1>INVOICE</h1>
                    <div class="company-info">
                      <p style="font-size: 18px; font-weight: bold;">Inventory Management System</p>
                      <p>Professional Business Solutions</p>
                    </div>
                  </div>
                  <div class="invoice-box">
                    <div class="label">Invoice Date</div>
                    <div class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="label">Invoice #</div>
                    <div class="value">INV-${Date.now().toString().slice(-6)}</div>
                  </div>
                </div>
              </div>
              
              <div class="info-section">
                <div>
                  <h3>From:</h3>
                  <p style="font-weight: bold; font-size: 18px;">Inventory Management System</p>
                  <p>123 Business Street</p>
                  <p>Suite 100</p>
                  <p>Business City, BC 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: info@inventorysystem.com</p>
                </div>
                
                <div>
                  <h3>Bill To:</h3>
                  <p style="font-weight: bold; font-size: 18px;">${selectedCustomer.name}</p>
                  <p>${selectedCustomer.email}</p>
                  <p>Customer Address</p>
                  <p>Customer City, State ZIP</p>
                  <p>Phone: Customer Phone</p>
                </div>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.items.map(item => `
                    <tr>
                      <td style="font-weight: bold;">${item.productName}</td>
                      <td style="text-align: center; color: #6b7280;">${item.productSKU}</td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: center;">$${item.unitPrice.toFixed(2)}</td>
                      <td style="text-align: center; font-weight: bold;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals-section">
                <div class="totals-box">
                  <div class="totals-header">
                    <h3>Order Summary</h3>
                  </div>
                  <div class="totals-content">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>$${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                      <span>Tax (10%):</span>
                      <span>$${calculateTax().toFixed(2)}</span>
                    </div>
                    <div class="total-row total">
                      <span>Total Amount:</span>
                      <span>$${calculateTotal().toFixed(2)}</span>
                    </div>
                    ${formData.paymentMethod === 'Cash' && formData.cashReceived ? `
                      <div class="total-row">
                        <span>Cash Received:</span>
                        <span>$${formData.cashReceived.toFixed(2)}</span>
                      </div>
                      <div class="total-row total" style="color: #059669;">
                        <span>Change Due:</span>
                        <span>$${calculateChange().toFixed(2)}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <div class="payment-info">
                <div class="grid">
                  <div>
                    <h4>Payment Method:</h4>
                    <p>${formData.paymentMethod}</p>
                  </div>
                  <div>
                    <h4>Payment Status:</h4>
                    <p style="color: #059669; font-weight: bold;">PAID</p>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <h3>Thank you for your business!</h3>
                <p>This invoice was generated automatically by our system.</p>
                <p>For questions or support, please contact us at support@inventorysystem.com</p>
              </div>
            </div>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // NEW: Validate warehouse OR shop selection (at least one required)
    if (!formData.warehouseId && !selectedShop) {
      alert("Please select either a warehouse or a shop");
      return;
    }

    try {
      const selectedShopData = shops.find(shop => shop.id === selectedShop || shop._id === selectedShop);
      
      console.log("Selected customer:", selectedCustomer);
      console.log("Customer ID:", selectedCustomer.id || selectedCustomer._id);
      console.log("Selected shop:", selectedShop);
      console.log("Selected warehouse:", formData.warehouseId);
      
      const saleData = {
        customerId: selectedCustomer.id || selectedCustomer._id,
        customerName: selectedCustomer.name,
        // NEW: Include shop information
        shopId: selectedShop,
        shopName: selectedShopData?.name || '',
        shopLocation: selectedShopData?.address || '',
        // NEW: Include warehouse information
        warehouseId: formData.warehouseId,
        warehouseName: formData.warehouseName,
        warehouseLocation: formData.warehouseLocation,
        items: formData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSKU: item.productSKU,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          // NEW: Include warehouse information for each item
          warehouseId: item.warehouseId,
          warehouseName: item.warehouseName
        })),
        totalAmount: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        cashReceived: formData.cashReceived || 0,
        change: formData.change || 0
      };

      console.log("Sending sale data:", JSON.stringify(saleData, null, 2));
      await saleApi.create(saleData);
      alert("Sale completed successfully!");
      router.push("/sales");
    } catch (err) {
      console.error("Error creating sale:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/sales')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale (POS)</h1>
          <p className="text-gray-600">Quick sales and checkout with invoice printing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Product Search and Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Product Search
              </CardTitle>
              <CardDescription>Search and add products to cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Product Results */}
              {filteredProducts.length > 0 && (
                <div className="mt-4 max-h-48 overflow-y-auto border rounded-md">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id || product._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addProductToCart(product)}
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${product.price}</div>
                        <div className="text-sm text-gray-500">Stock: {product.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart Items ({formData.items.length})
              </CardTitle>
              <CardDescription>Manage your cart items</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm">Search and add products above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.productSKU}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <div className="text-right min-w-[100px]">
                          <div className="font-semibold">${item.unitPrice}</div>
                          <div className="text-sm text-gray-500">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Customer, Payment, and Totals */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline w-4 h-4 mr-2" />
              Select Customer
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search customers..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                onFocus={() => setShowCustomerSearch(true)}
                className="w-full"
              />
              {customerSearchTerm && (
                <button
                  onClick={() => setCustomerSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Customer List */}
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedCustomer?.id === customer.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NEW: Shop Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-2" />
              Select Shop
            </label>
            <select
              value={selectedShop}
              onChange={(e) => handleShopChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Shop</option>
              {shops.map(shop => (
                <option key={shop.id || shop._id} value={shop.id || shop._id}>
                  {shop.name} {shop.isMainBranch && '(Main Branch)'}
                </option>
              ))}
            </select>
            {selectedShop && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {shops.find(s => s.id === selectedShop || s._id === selectedShop)?.name}
              </div>
            )}
          </div>

          {/* NEW: Warehouse Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Warehouse className="inline w-4 h-4 mr-2" />
              Select Warehouse
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => handleWarehouseChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id || warehouse._id} value={warehouse.id || warehouse._id}>
                  {warehouse.name} ({warehouse.address})
                </option>
              ))}
            </select>
            {formData.warehouseName && (
              <div className="mt-2 text-sm text-gray-600">
                <MapPin className="inline w-4 h-4 mr-1" />
                {formData.warehouseLocation}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'].map((method) => (
                  <Button
                    key={method}
                    variant={formData.paymentMethod === method ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePaymentMethodChange(method)}
                    className="justify-start"
                  >
                    {method === 'Cash' && <DollarSign className="h-4 w-4 mr-2" />}
                    {method === 'Credit Card' && <CreditCard className="h-4 w-4 mr-2" />}
                    {method === 'Debit Card' && <CreditCard className="h-4 w-4 mr-2" />}
                    {method === 'Bank Transfer' && <Receipt className="h-4 w-4 mr-2" />}
                    {method}
                  </Button>
                ))}
              </div>

              {formData.paymentMethod === 'Cash' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Cash Received</label>
                  <Input
                    type="number"
                    step="0.01"
                    min={calculateTotal()}
                    value={formData.cashReceived || ''}
                    onChange={(e) => handleCashReceivedChange(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review totals and complete sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {formData.paymentMethod === 'Cash' && formData.cashReceived && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Received:</span>
                      <span>${formData.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Change:</span>
                      <span>${calculateChange().toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={formData.items.length === 0}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Complete Sale
                </Button>
                
                <Button
                  onClick={previewInvoice}
                  variant="outline"
                  className="w-full"
                  disabled={formData.items.length === 0}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Preview Invoice
                </Button>
                
                <Button
                  onClick={handlePrintInvoice}
                  variant="outline"
                  className="w-full"
                  disabled={formData.items.length === 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                
                <Button
                  onClick={generateFormalInvoice}
                  variant="outline"
                  className="w-full"
                  disabled={formData.items.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Formal Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Invoice for Printing */}
      <div className="hidden">
        <div ref={printRef} className="p-8 max-w-4xl mx-auto bg-white">
          {/* Invoice Header */}
          <div className="border-b-2 border-gray-800 pb-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
                <div className="text-gray-600">
                  <p className="text-lg font-semibold">Inventory Management System</p>
                  <p className="text-sm">Professional Business Solutions</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-800 text-white p-4 rounded-lg">
                  <p className="text-sm text-gray-300">Invoice Date</p>
                  <p className="text-xl font-bold">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-sm text-gray-300">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company and Customer Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">From:</h3>
              <div className="text-gray-700">
                <p className="font-semibold text-lg">Inventory Management System</p>
                <p>123 Business Street</p>
                <p>Suite 100</p>
                <p>Business City, BC 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@inventorysystem.com</p>
              </div>
            </div>
            
            {selectedCustomer && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-semibold text-lg">{selectedCustomer.name}</p>
                  <p>{selectedCustomer.email}</p>
                  <p>Customer Address</p>
                  <p>Customer City, State ZIP</p>
                  <p>Phone: Customer Phone</p>
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-4 py-3 text-left font-bold">Item Description</th>
                  <th className="border border-gray-600 px-4 py-3 text-center font-bold">SKU</th>
                  <th className="border border-gray-600 px-4 py-3 text-center font-bold">Quantity</th>
                  <th className="border border-gray-600 px-4 py-3 text-center font-bold">Unit Price</th>
                  <th className="border border-gray-600 px-4 py-3 text-center font-bold">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-3 font-medium">{item.productName}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-600">{item.productSKU}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">${item.unitPrice.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h3 className="font-bold text-gray-800">Order Summary</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%):</span>
                    <span className="font-medium">${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total Amount:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'Cash' && formData.cashReceived && (
                    <>
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between text-gray-700">
                          <span>Cash Received:</span>
                          <span className="font-medium">${formData.cashReceived.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-green-600">
                          <span>Change Due:</span>
                          <span>${calculateChange().toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Payment Method:</h4>
                <p className="text-gray-700">{formData.paymentMethod}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Payment Status:</h4>
                <p className="text-green-600 font-semibold">PAID</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-600 border-t border-gray-300 pt-6">
            <p className="text-lg font-semibold mb-2">Thank you for your business!</p>
            <p className="text-sm">This invoice was generated automatically by our system.</p>
            <p className="text-sm mt-2">For questions or support, please contact us at support@inventorysystem.com</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 