"use client";

import { useState } from "react";
import { API_CONFIG } from '@/lib/config';

export default function DebugRegisterPage() {
  const [testData, setTestData] = useState({
    username: 'testuser999',
    password: 'testpass999',
    email: 'test999@example.com',
    firstName: 'Test',
    lastName: 'User999'
  });
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...\n');
    
    try {
      setResult(prev => prev + `Sending data: ${JSON.stringify(testData, null, 2)}\n`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      setResult(prev => prev + `Response status: ${response.status}\n`);
      setResult(prev => prev + `Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`);
      
      const responseText = await response.text();
      setResult(prev => prev + `Response body: ${responseText}\n`);
      
      if (response.ok) {
        setResult(prev => prev + '✅ Registration successful!\n');
      } else {
        setResult(prev => prev + '❌ Registration failed!\n');
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testWithEmptyData = async () => {
    setLoading(true);
    setResult('Testing with empty data...\n');
    
    try {
      const emptyData = {
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
      };
      
      setResult(prev => prev + `Sending empty data: ${JSON.stringify(emptyData, null, 2)}\n`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emptyData),
      });
      
      setResult(prev => prev + `Response status: ${response.status}\n`);
      
      const responseText = await response.text();
      setResult(prev => prev + `Response body: ${responseText}\n`);
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Registration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={testData.username}
                onChange={(e) => setTestData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={testData.password}
                onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={testData.firstName}
                onChange={(e) => setTestData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={testData.lastName}
                onChange={(e) => setTestData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <button
                onClick={testRegistration}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Registration'}
              </button>
              
              <button
                onClick={testWithEmptyData}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Empty Data'}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap font-mono">{result}</pre>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Modify the test data if needed</li>
          <li>Click "Test Registration" to test with valid data</li>
          <li>Click "Test Empty Data" to see validation errors</li>
          <li>Check the results on the right</li>
        </ol>
      </div>
    </div>
  );
}
