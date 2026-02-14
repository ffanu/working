"use client";

import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, User, Package, Calendar, Settings, CheckCircle, Search, X, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/api/customers";
import { productApi } from "@/lib/api";
import { installmentApi } from "@/lib/api/installments";
import { PrintReceiptButton } from "@/components/installments/ReceiptButton";

interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  priorDue?: number;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category?: string;
  quantity: number;
  description?: string;
  sku?: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  interestPercent: number;
  subtotal: number;
  category?: string;
  description?: string;
}

export default function POSInstallmentPage() {
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now()}`);
  const [grandTotal, setGrandTotal] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [installmentNumber, setInstallmentNumber] = useState(6);
  const [downPayment, setDownPayment] = useState<number | ''>('');
  const [interestRate, setInterestRate] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [installmentPlan, setInstallmentPlan] = useState<any[]>([]);
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingInstallment, setIsCreatingInstallment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdInstallment, setCreatedInstallment] = useState<any>(null);
  
  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Product search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  
  // Dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 300 });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [customersResponse, productsResponse] = await Promise.all([
          customerApi.getAll(),
          productApi.getAll()
        ]);
        
        setCustomers(customersResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Calculate grand total
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    setGrandTotal(total);
  }, [cartItems]);

  // Update dropdown position when shown
  useEffect(() => {
    if (showProductDropdown && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showProductDropdown]);

  // Click outside to close dropdown and handle scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    const handleScroll = () => {
      if (showProductDropdown && searchInputRef.current) {
        const rect = searchInputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showProductDropdown]);

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1, interestPercent: number = 0) => {
    const productId = product._id || product.id || '';
    const subtotal = product.price * quantity;
    const cartItem: CartItem = {
      id: `${productId}-${Date.now()}`,
      productId: productId,
      name: product.name,
      price: product.price,
      quantity,
      interestPercent,
      subtotal,
      category: product.category,
      description: product.description
    };
    
    setCartItems([...cartItems, cartItem]);
    setSearchTerm("");
    setShowProductDropdown(false);
    searchInputRef.current?.focus();
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    addToCart(product, 1, 0);
  };

  // Calculate installment plan
  const calculateInstallmentPlan = () => {
    if (cartItems.length === 0) {
      alert('Please add products to cart first');
      return;
    }

    const totalAmount = grandTotal;
    const principal = totalAmount - (downPayment === '' ? 0 : downPayment);
    
    // Flat Interest Method: Total Interest = Principal × Rate × Time
    const totalInterest = principal * (interestRate / 100);
    const totalPayable = principal + totalInterest;
    const monthlyPayment = totalPayable / installmentNumber;
    
    // Distribute interest and principal evenly
    const interestPerInstallment = totalInterest / installmentNumber;
    const principalPerInstallment = principal / installmentNumber;

    const plan = [];
    let remainingBalance = principal;
    const start = new Date(startDate);

    for (let i = 1; i <= installmentNumber; i++) {
      const installDate = new Date(start);
      installDate.setMonth(start.getMonth() + i - 1);
      
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);
      
      // For the last installment, adjust to ensure exact principal is covered
      const currentPrincipal = (i === installmentNumber) ? remainingBalance : principalPerInstallment;
      const currentInterest = (i === installmentNumber) ? (monthlyPayment - currentPrincipal) : interestPerInstallment;
      
      const openingBalance = remainingBalance;
      remainingBalance = Math.max(0, remainingBalance - currentPrincipal);

      plan.push({
        installmentNo: i,
        installDate: installDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        openingBalance: openingBalance,
        principalAmount: currentPrincipal,
        interestAmount: currentInterest,
        totalAmount: monthlyPayment,
        remainingBalance: remainingBalance,
        status: 'Pending'
      });
    }

    setInstallmentPlan(plan);
  };

  const createInstallmentPlan = async () => {
    if (cartItems.length === 0 || !selectedCustomer) {
      alert('Please add products to cart and select a customer');
      return;
    }

    if (downPayment === '' || (typeof downPayment === 'number' && downPayment < 0)) {
      alert('Please enter a valid down payment amount');
      return;
    }

    setIsCreatingInstallment(true);
    setError(null);

    try {
      // Prepare the installment plan data
      const customerId = selectedCustomer._id || selectedCustomer.id;
      if (!customerId) {
        alert('Invalid customer selected. Please select a valid customer.');
        return;
      }

      const installmentPlanData = {
        customerId: customerId,
        products: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'Uncategorized',
          description: item.description || '',
          totalPrice: item.subtotal
        })),
        totalPrice: grandTotal,
        downPayment: typeof downPayment === 'string' ? 0 : downPayment,
        numberOfInstallments: installmentNumber,
        interestRate: interestRate,
        startDate: startDate
      };

      // For now, create individual plans for each product
      // TODO: Implement multi-product plan creation in backend
      const results = [];
      for (const item of cartItems) {
        const singleProductPlan = {
          SaleId: invoiceNo,
          CustomerId: customerId,
          ProductId: item.productId,
          TotalPrice: item.subtotal,
          DownPayment: (typeof downPayment === 'string' ? 0 : downPayment) * (item.subtotal / grandTotal), // Proportional down payment
          NumberOfMonths: installmentNumber,
          InterestRate: interestRate,
          StartDate: new Date(startDate).toISOString()
        };
        
        const result = await installmentApi.createPlan(singleProductPlan);
        results.push(result);
      }
      
      // Show success message and store the first created installment for receipt
      setShowSuccessMessage(true);
      setCreatedInstallment(results[0]); // Store the first installment for receipt generation
      
      // Reset form after successful creation
      setTimeout(() => {
        setCartItems([]);
        setSelectedCustomer(null);
        setDownPayment('');
        setInstallmentPlan([]);
        setInvoiceNo(`INV-${Date.now()}`);
        setShowSuccessMessage(false);
        setCreatedInstallment(null);
      }, 5000); // Increased timeout to give time to print receipt

    } catch (error) {
      console.error('Error creating installment plan:', error);
      setError('Failed to create installment plan. Please try again.');
    } finally {
      setIsCreatingInstallment(false);
    }
  };

  // Get unique categories from products
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat))))];

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2">
          <div className="max-w-[1600px] mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading POS system...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2">
          <div className="max-w-[1600px] mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-600 mb-4">⚠️</div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2">
        <div className="max-w-[1600px] mx-auto space-y-4">
          
          {/* Combined Summary & Customer Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-4">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-lg text-white p-3">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Calculator className="h-4 w-4" />
                </div>
                Sale Summary & Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5">
              <div className="grid grid-cols-1 lg:grid-cols-8 gap-1.5">
                {/* Invoice No */}
                <div>
                  <Label className="text-xs font-medium text-gray-600">Invoice</Label>
                  <Input
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="h-5 text-xs border border-gray-300 focus:border-blue-500 mt-0.5"
                    placeholder="INV-001"
                  />
                </div>

                {/* Customer Selection */}
                <div className="lg:col-span-3">
                  <Label className="text-xs font-medium text-gray-600">Customer</Label>
                  <Select onValueChange={(value) => {
                    const customer = customers.find(c => (c._id || c.id) === value);
                    setSelectedCustomer(customer || null);
                  }}>
                    <SelectTrigger className="h-6 border border-gray-300 focus:border-purple-500 mt-0.5 px-4 py-2">
                      <SelectValue placeholder="Select customer">
                        {selectedCustomer ? selectedCustomer.name : "Select customer"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id || customer.id} value={customer._id || customer.id || ''}>
                          <div className="flex flex-col py-1.5 px-2">
                            <span className="font-medium text-sm">{customer.name}</span>
                            <span className="text-xs text-gray-500">{customer.phone}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact & Prior Due - Combined */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-gray-50 border border-gray-200 rounded p-1 text-center">
                      <div className="text-xs text-gray-600 font-medium">Contact</div>
                      <div className="text-xs font-semibold">
                        {selectedCustomer ? selectedCustomer.phone : '-'}
                      </div>
                    </div>
                    <div className={`border rounded p-1 text-center ${
                      selectedCustomer && (selectedCustomer.priorDue || 0) > 0 
                        ? "bg-red-50 border-red-200" 
                        : "bg-green-50 border-green-200"
                    }`}>
                      <div className={`text-xs font-medium ${
                        selectedCustomer && (selectedCustomer.priorDue || 0) > 0 ? "text-red-600" : "text-green-600"
                      }`}>Prior Due</div>
                      <div className={`text-xs font-bold ${
                        selectedCustomer && (selectedCustomer.priorDue || 0) > 0 ? "text-red-700" : "text-green-700"
                      }`}>
                        {selectedCustomer ? `$${(selectedCustomer.priorDue || 0).toFixed(2)}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total & Items - Combined */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-green-50 border border-green-200 rounded p-1 text-center">
                      <div className="text-xs text-green-600 font-medium">Total</div>
                      <div className="text-xs font-bold text-green-700">${grandTotal.toFixed(2)}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-1 text-center">
                      <div className="text-xs text-blue-600 font-medium">Items</div>
                      <div className="text-xs font-bold text-blue-700">{cartItems.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Product Selection Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-4 overflow-visible">
            <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-t-lg text-white p-3">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                Product Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Product List / Search Bar */}
                <div className="space-y-4">
                  <div className="space-y-3 relative" style={{ zIndex: 1000 }}>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Search className="h-4 w-4 text-green-500" />
                      Search Products
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search by name or barcode..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowProductDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowProductDropdown(searchTerm.length > 0)}
                        className="h-10 pl-10 border-2 border-gray-200 focus:border-green-500"
                      />
                    </div>
                    
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Categories Filter</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button 
                          key={category} 
                          variant={selectedCategory === category ? "default" : "outline"} 
                          size="sm" 
                          className={`text-xs ${
                            selectedCategory === category 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "hover:bg-green-50 hover:border-green-300"
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Selected Products Table */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Selected Products ({cartItems.length} items)
                  </Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600">
                        <div>Product</div>
                        <div className="text-center">Qty</div>
                        <div className="text-right">Price</div>
                        <div className="text-right">Subtotal</div>
                        <div className="text-center">Interest%</div>
                        <div className="text-center">Action</div>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No products selected
                        </div>
                      ) : (
                        cartItems.map((item, index) => (
                          <div key={item.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                            <div className="grid grid-cols-6 gap-2 items-center text-sm">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-center">{item.quantity}</div>
                              <div className="text-right">${item.price.toFixed(2)}</div>
                              <div className="text-right font-semibold text-green-600">${item.subtotal.toFixed(2)}</div>
                              <div className="text-center">{item.interestPercent}%</div>
                              <div className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(index)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Cart Summary */}
                    {cartItems.length > 0 && (
                      <div className="bg-blue-50 border-t px-4 py-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-blue-800">Total Items: {cartItems.length}</span>
                          <span className="font-bold text-blue-800 text-lg">Total: ${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Section: Installment Plan (left) + Installment Details (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Installment Plan Table - Left (2/3 width) */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-lg text-white p-3">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  Installment Plan ({installmentNumber} payments)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-gray-600 text-xs">#</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600 text-xs">Install Date</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600 text-xs">Pay Date</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600 text-xs">Opening</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600 text-xs">Net</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600 text-xs">Interest</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600 text-xs">Ins</th>
                        <th className="px-2 py-2 text-right font-medium text-gray-600 text-xs">Closing</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600 text-xs">Status</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600 text-xs">Remarks</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600 text-xs">Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installmentPlan.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-6 text-center text-gray-500">
                            Add products and click "Calculate" to generate installment plan
                          </td>
                        </tr>
                      ) : (
                        installmentPlan.map((installment, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-2 py-2 font-medium text-xs">{installment.installmentNo}</td>
                            <td className="px-2 py-2 text-xs">{installment.installDate}</td>
                            <td className="px-2 py-2 text-xs">{installment.dueDate}</td>
                            <td className="px-2 py-2 text-right text-xs font-semibold">${installment.openingBalance.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right text-xs">${installment.principalAmount.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right text-xs text-orange-600">${installment.interestAmount.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right text-xs">${installment.totalAmount.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right text-xs font-semibold">${installment.remainingBalance.toFixed(2)}</td>
                            <td className="px-2 py-2 text-center">
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                {installment.status}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center text-xs text-gray-500">-</td>
                            <td className="px-2 py-2 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  // Handle payment logic here
                                  console.log('Payment for installment:', installment.installmentNo);
                                }}
                              >
                                Pay
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installment Details - Right (1/3 width) */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-lg text-white p-3">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Settings className="h-4 w-4" />
                  </div>
                  Installment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium mb-1">Total Price</div>
                    <div className="text-2xl font-bold text-green-700">${grandTotal.toFixed(2)}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Down Payment</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={downPayment}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setDownPayment('');
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              setDownPayment(numValue);
                            }
                          }
                        }}
                        className="h-8 border border-gray-300 focus:border-green-500 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Number of Installments</Label>
                      <Input
                        type="number"
                        value={installmentNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setInstallmentNumber(6);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              setInstallmentNumber(numValue);
                            }
                          }
                        }}
                        className="h-8 border border-gray-300 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Interest Rate & Total</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={interestRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setInterestRate(5);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                setInterestRate(numValue);
                              }
                            }
                          }}
                          className="h-8 border border-gray-300 focus:border-orange-500 text-sm"
                          placeholder="5.0"
                        />
                        <div className="bg-orange-50 border border-orange-200 rounded h-8 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-700">
                            ${((grandTotal - (downPayment === '' ? 0 : downPayment)) * (interestRate / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-8 border border-gray-300 text-sm"
                      />
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <div className="pt-3">
                    <Button
                      onClick={calculateInstallmentPlan}
                      disabled={cartItems.length === 0}
                      className="w-full h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-50 text-sm"
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      Calculate
                    </Button>
                  </div>

                  {/* Confirm Sale Button - Moved here */}
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      disabled={cartItems.length === 0 || !selectedCustomer || isCreatingInstallment}
                      className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl disabled:opacity-50"
                      onClick={createInstallmentPlan}
                    >
                      {isCreatingInstallment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : showSuccessMessage ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Created Successfully!
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Sale
                        </>
                      )}
                    </Button>
                    
                    {/* Receipt Button - Show after successful creation */}
                    {showSuccessMessage && createdInstallment && (
                      <div className="mt-3 pt-3 border-t border-green-200 bg-green-50 rounded-lg p-3">
                        <div className="text-center text-green-700 text-sm mb-3 font-medium">
                          ✅ Sale confirmed successfully! You can now print the receipt.
                        </div>
                        <PrintReceiptButton
                          installmentPlan={createdInstallment}
                          variant="default"
                          size="default"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Product Dropdown Portal - Positioned at top level */}
        {showProductDropdown && searchTerm && filteredProducts.length > 0 && (
          <div 
            ref={productDropdownRef}
            className="fixed bg-white border-2 border-green-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
            style={{ 
              zIndex: 99999,
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: '240px'
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">${product.price.toFixed(2)} • {product.category || 'No Category'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Stock: {product.quantity}</div>
                    <div className="text-xs text-gray-400">{product.sku || 'No SKU'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}