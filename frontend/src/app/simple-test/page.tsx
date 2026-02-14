"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from '@/lib/config';

export default function SimpleTestPage() {
  const [status, setStatus] = useState("Initializing...");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    testSimpleFetch();
  }, []);

  const testSimpleFetch = async () => {
    try {
      setStatus("Testing fetch...");
      
      // Test 1: Simple fetch
      setStatus("Making fetch request...");
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
      setStatus(`Response status: ${response.status}`);
      
      if (response.ok) {
        const jsonData = await response.json();
        setStatus(`Success! Got ${jsonData.total || jsonData.length} products`);
        setData(jsonData);
      } else {
        setStatus(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Simple API Test</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-2">Status: <span className="font-semibold">{status}</span></p>
        <button 
          onClick={testSimpleFetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Again
        </button>
      </div>

      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Response Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
