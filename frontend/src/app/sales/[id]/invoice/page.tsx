"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import { saleApi } from "@/lib/api/sales";

interface Sale {
  id?: string;
  _id?: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  createdAt?: string;
  invoiceNumber?: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printStatus, setPrintStatus] = useState<string>('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'screen' | 'print'>('screen');
  const [previewZoom, setPreviewZoom] = useState(75);

  // Add print-specific styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .invoice-print-content, .invoice-print-content * {
          visibility: visible;
        }
        .invoice-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print\\:hidden {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadSale();
    
    // Add print event listeners for debugging
    const handleBeforePrint = () => {
      console.log('Before print event triggered');
      setPrintStatus('Print dialog opened');
    };
    
    const handleAfterPrint = () => {
      console.log('After print event triggered');
      setPrintStatus('Print dialog closed');
      setTimeout(() => setPrintStatus(''), 2000);
    };
    
    // Check if print is supported
    if (typeof window !== 'undefined') {
      console.log('Print support check:');
      console.log('- window.print available:', typeof window.print === 'function');
      console.log('- window.matchMedia available:', typeof window.matchMedia === 'function');
      
      if (typeof window.matchMedia === 'function') {
        const printMedia = window.matchMedia('print');
        console.log('- Print media query supported:', printMedia !== null);
      }
    }
    
    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'p') {
          e.preventDefault();
          handlePrint();
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePrintPreview();
        }
      }
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [params.id]);

  const loadSale = async () => {
    try {
      setLoading(true);
      const saleData = await saleApi.getById(params.id as string);
      setSale(saleData);
    } catch (err) {
      setError('Failed to load sale data');
      console.error('Error loading sale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('Print button clicked');
    setPrintStatus('Preparing print...');
    
    // Test if print is available
    if (typeof window.print !== 'function') {
      setPrintStatus('Print function not available');
      alert('Print function not available. Please use Ctrl+P (Cmd+P on Mac) instead.');
      return;
    }
    
    // Close preview if open
    if (showPrintPreview) {
      setShowPrintPreview(false);
      setPreviewMode('screen');
    }
    
    // Test browser capabilities
    console.log('Browser print capabilities:');
    console.log('- User agent:', navigator.userAgent);
    console.log('- Platform:', navigator.platform);
    console.log('- Print function:', typeof window.print);
    
    // Add a small delay to ensure all styles are loaded
    setTimeout(() => {
      console.log('Triggering print...');
      setPrintStatus('Triggering print...');
      try {
        // Force a reflow to ensure all styles are applied
        document.body.offsetHeight;
        
        // Try different print methods
        if (typeof window.print === 'function') {
          window.print();
          console.log('Print triggered successfully');
          setPrintStatus('Print triggered successfully');
        } else {
          throw new Error('Print function not available');
        }
        
        // Clear status after a delay
        setTimeout(() => setPrintStatus(''), 3000);
      } catch (error) {
        console.error('Print error:', error);
        setPrintStatus('Print failed');
        alert('Print failed. Please try again or use browser print (Ctrl+P / Cmd+P)');
      }
    }, 100);
  };

  const handleDownload = () => {
    // Use browser's print dialog with PDF save option
    // This is the most reliable cross-browser method
    if (typeof window !== 'undefined') {
      // Set title for PDF filename
      const originalTitle = document.title;
      document.title = `Invoice-${sale.invoiceNumber || params.id}`;
      
      // Trigger print dialog (user can save as PDF)
      window.print();
      
      // Restore original title after a short delay
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  const handlePrintPreview = () => {
    if (!showPrintPreview) {
      setPreviewMode('print');
      setShowPrintPreview(true);
      // Scroll to top to show the preview
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPreviewMode('screen');
      setShowPrintPreview(false);
    }
  };

  const handleClosePreview = () => {
    setShowPrintPreview(false);
    setPreviewMode('screen');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error || 'Sale not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header - Hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handlePrintPreview}
            variant="outline" 
            className="flex items-center gap-2"
          >
            {showPrintPreview ? 'Hide Preview' : 'Print Preview'}
          </Button>
          <Button 
            onClick={() => {
              try {
                window.print();
              } catch (error) {
                console.error('Direct print error:', error);
                alert('Direct print failed. Please use the main print button or Ctrl+P');
              }
            }} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            Direct Print
          </Button>
          <div className="text-xs text-gray-500 mt-1 print:hidden">
            Or use Ctrl+P (Cmd+P on Mac) to print | Ctrl+V (Cmd+V on Mac) for preview
          </div>
          {printStatus && (
            <div className="text-xs text-blue-600 mt-1 print:hidden">
              Status: {printStatus}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1 print:hidden">
            Browser: {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown'} | 
            Print: {typeof window !== 'undefined' && typeof window.print === 'function' ? 'Available' : 'Not Available'}
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Print Instructions - Hidden when printing */}
      <div className="bg-blue-100 border border-blue-300 p-3 mb-4 rounded-lg print:hidden">
        <p className="text-sm text-blue-800">
          💡 <strong>Print Tip:</strong> For best results, use "Save as PDF" in your browser's print dialog.
        </p>
        <p className="text-sm text-blue-800 mt-1">
          📱 <strong>Preview:</strong> Click "Print Preview" to see exactly how your invoice will look when printed.
        </p>
      </div>

      {/* Print Preview Overlay */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Print Preview</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  This preview shows exactly how your invoice will look when printed
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Zoom:</label>
                  <select 
                    value={previewZoom} 
                    onChange={(e) => setPreviewZoom(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                  </select>
                  <span className="text-xs text-gray-500">({previewZoom}%)</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Now
                  </Button>
                  <Button 
                    onClick={handleClosePreview}
                    variant="outline"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className={`transform origin-top-left`} style={{ 
                transform: `scale(${previewZoom / 100})`,
                width: `${100 / (previewZoom / 100)}%`
              }}>
                {/* Invoice Preview - This will look exactly like the printed version */}
                <div className="bg-white border border-gray-300 shadow-none max-w-5xl mx-auto">
                  <div className="border-b-2 border-gray-300 bg-white p-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-600 rounded-lg">
                            <FileText className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                            <p className="text-lg text-gray-600 font-medium">
                              #{sale.invoiceNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoice Date</div>
                        <div className="text-xl font-semibold text-gray-900">
                          {new Date(sale.saleDate || sale.createdAt || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-0">
                    {/* Company and Customer Info */}
                    <div className="p-8 pb-6 bg-white">
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900">From</h3>
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <div className="text-xl font-bold text-gray-900">Inventory Management System</div>
                            <div>123 Business Street</div>
                            <div>City, State 12345</div>
                            <div className="pt-2">
                              <span className="text-gray-500">Phone:</span> (555) 123-4567
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span> info@inventory.com
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900">Bill To</h3>
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <div className="text-xl font-semibold text-gray-900">{sale.customerName}</div>
                            <div className="text-sm text-gray-500">Customer ID: {sale.customerId}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-8 pb-6">
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Item</th>
                              <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Quantity</th>
                              <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Unit Price</th>
                              <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-300">
                            {sale.items?.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-gray-900">{item.productName}</td>
                                <td className="py-4 px-6 text-right text-gray-700">{item.quantity}</td>
                                <td className="py-4 px-6 text-right text-gray-700">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td className="py-4 px-6 text-right font-semibold text-gray-900">
                                  ${item.totalPrice?.toFixed(2) || '0.00'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="px-8 pb-6">
                      <div className="flex justify-end">
                        <div className="w-80">
                          <div className="bg-white border border-gray-300 rounded-lg p-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-medium text-gray-700">Subtotal:</span>
                                <span className="text-gray-900">${sale.totalAmount?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-medium text-gray-700">Tax:</span>
                                <span className="text-gray-900">$0.00</span>
                              </div>
                              <div className="border-t border-gray-300 pt-3">
                                <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                                  <span>Total:</span>
                                  <span>${sale.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="px-8 pb-8">
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                            Payment Information
                          </h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Method:</span>
                              <span className="font-medium">{sale.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status:</span>
                              <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                                sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                                sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                            Notes
                          </h4>
                          <div className="text-gray-700 bg-white border border-gray-300 rounded-lg p-4 min-h-[80px]">
                            {sale.notes || 'No additional notes'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-8 bg-white border-t border-gray-300">
                      <div className="text-center space-y-3">
                        <p className="text-lg font-medium text-gray-900">Thank you for your business!</p>
                        <p className="text-sm text-gray-600">
                          This is a computer-generated invoice. No signature required.
                        </p>
                        <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>Generated on {new Date().toLocaleDateString()}</span>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice */}
      <Card className={`invoice-print-content max-w-5xl mx-auto shadow-lg print:shadow-none print:border-0 bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-300 print:bg-white ${
        showPrintPreview ? 'print-preview' : ''
      }`}>
        <CardHeader className="border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white print:bg-white print:border-gray-300">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-4xl font-bold text-gray-900 tracking-tight">INVOICE</CardTitle>
                  <CardDescription className="text-lg text-gray-600 font-medium">
                    #{sale.invoiceNumber || 'N/A'}
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoice Date</div>
              <div className="text-xl font-semibold text-gray-900">
                {new Date(sale.saleDate || sale.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Company and Customer Info */}
          <div className="p-8 pb-6 bg-white print:bg-white">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">From</h3>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="text-xl font-bold text-gray-900">Inventory Management System</div>
                  <div>123 Business Street</div>
                  <div>City, State 12345</div>
                  <div className="pt-2">
                    <span className="text-gray-500">Phone:</span> (555) 123-4567
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span> info@inventory.com
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Bill To</h3>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="text-xl font-semibold text-gray-900">{sale.customerName}</div>
                  <div className="text-sm text-gray-500">Customer ID: {sale.customerId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 pb-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden print:border-gray-300">
              <table className="w-full">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Item</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Quantity</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Unit Price</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700 uppercase tracking-wide text-sm">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{item.productName}</td>
                      <td className="py-4 px-6 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-4 px-6 text-right text-gray-700">${item.unitPrice?.toFixed(2) || '0.00'}</td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">
                        ${item.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 pb-6">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="bg-gray-50 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="text-gray-900">${sale.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-gray-700">Tax:</span>
                      <span className="text-gray-900">$0.00</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                        <span>Total:</span>
                        <span>${sale.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Payment Information
                </h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method:</span>
                    <span className="font-medium">{sale.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                  Notes
                </h4>
                <div className="text-gray-700 bg-gray-50 rounded-lg p-4 min-h-[80px] print:bg-white print:border print:border-gray-300">
                  {sale.notes || 'No additional notes'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-gray-50 border-t border-gray-200 print:bg-white print:border-gray-300">
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-gray-900">Thank you for your business!</p>
              <p className="text-sm text-gray-600">
                This is a computer-generated invoice. No signature required.
              </p>
              <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Generated on {new Date().toLocaleDateString()}</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
} 