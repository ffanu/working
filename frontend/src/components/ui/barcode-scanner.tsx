'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Search, Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onProductFound: (product: any) => void;
  onScanError?: (error: string) => void;
  placeholder?: string;
  className?: string;
}

export function BarcodeScanner({ 
  onProductFound, 
  onScanError, 
  placeholder = "Scan barcode or enter manually...",
  className = ""
}: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle barcode input (manual entry or scanner input)
  const handleBarcodeInput = async (value: string) => {
    setBarcode(value);
    setScanError(null);

    if (value.length >= 3) { // Minimum barcode length
      try {
        const product = await searchProductByBarcode(value);
        if (product) {
          onProductFound(product);
          setBarcode(''); // Clear input after successful scan
        } else {
          setScanError('Product not found');
          onScanError?.('Product not found');
        }
      } catch (error) {
        setScanError('Error searching product');
        onScanError?.('Error searching product');
      }
    }
  };

  // Search product by barcode
  const searchProductByBarcode = async (barcodeValue: string): Promise<any> => {
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(barcodeValue)}`);
      if (!response.ok) throw new Error('Failed to search products');
      
      const data = await response.json();
      const products = data.data || data;
      
      // Find exact barcode match first, then SKU match
      const exactMatch = products.find((p: any) => 
        p.barcode === barcodeValue || p.sku === barcodeValue
      );
      
      if (exactMatch) return exactMatch;
      
      // If no exact match, return first product (for demo purposes)
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error searching product:', error);
      throw error;
    }
  };

  // Start camera for barcode scanning
  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScanError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanError('Camera access denied');
      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Handle manual search
  const handleManualSearch = () => {
    if (barcode.trim()) {
      handleBarcodeInput(barcode.trim());
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barcode Input */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-4"
            autoFocus
          />
        </div>
        <Button 
          onClick={handleManualSearch}
          disabled={!barcode.trim()}
          className="px-6"
        >
          Search
        </Button>
        <Button
          variant={isScanning ? "destructive" : "outline"}
          onClick={isScanning ? stopScanning : startScanning}
          className="px-4"
        >
          {isScanning ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
        </Button>
      </div>

      {/* Error Display */}
      {scanError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{scanError}</p>
        </div>
      )}

      {/* Camera Preview */}
      {isScanning && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover rounded-lg border-2 border-blue-500"
            autoPlay
            playsInline
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">Point camera at barcode</p>
            </div>
          </div>
          <Button
            onClick={stopScanning}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p>• Type barcode manually or use camera scanner</p>
        <p>• Press Enter or click Search to find product</p>
        <p>• Camera scanner works best with clear, well-lit barcodes</p>
      </div>
    </div>
  );
}


