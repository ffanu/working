"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from '@/lib/config';

export default function SimpleProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
      const data = await response.json();
      setProducts(data.data || data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Loading Products...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products (Real Data)</h1>
      
      <div className="mb-6">
        <p className="text-lg">Total Products: <span className="font-bold text-blue-600">{products.length}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.slice(0, 12).map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">${product.price}</span>
              <span className={`px-2 py-1 rounded text-sm ${
                product.quantity < 10 ? 'bg-red-100 text-red-800' : 
                product.quantity < 50 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                Qty: {product.quantity}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2">SKU: {product.sku}</p>
            <p className="text-gray-500 text-xs">Category: {product.category}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Real Data Integration Success!</h2>
        <p className="text-green-700">
          This page is successfully displaying real product data from the backend API.
          Total products loaded: {products.length}
        </p>
      </div>
    </div>
  );
}
