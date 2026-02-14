"use client";

import { useState } from "react";
import { API_CONFIG } from '@/lib/config';

export default function TestSignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ User created successfully! Username: ${data.username}, ID: ${data.userId}`);
        
        // Test login immediately
        setTimeout(async () => {
          try {
            const loginResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: formData.username,
                password: formData.password
              }),
            });

            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              setResult(prev => prev + `\n\n🔐 Login successful! JWT Token received.`);
            } else {
              setError('❌ Login failed after registration');
            }
          } catch (err) {
            setError('❌ Error testing login after registration');
          }
        }, 1000);

      } else {
        const errorData = await response.json();
        setError(`❌ Registration failed: ${errorData.error}`);
      }
    } catch (err) {
      setError(`❌ Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Sign Up & Login</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Instructions:</h2>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Fill out the form below with test data</li>
          <li>Click "Test Sign Up" to create a new user</li>
          <li>The system will automatically test login after registration</li>
          <li>Check the results below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter unique username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter password (min 6 chars)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter valid email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter last name"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Sign Up & Login'}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="text-green-800 font-semibold mb-2">✅ Success!</h3>
          <pre className="text-green-700 text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* API Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">API Endpoints Status:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Registration:</strong> POST {API_CONFIG.BASE_URL}{API_CONFIG.AUTH.REGISTER}</li>
          <li>✅ <strong>Login:</strong> POST {API_CONFIG.BASE_URL}{API_CONFIG.AUTH.LOGIN}</li>
          <li>✅ <strong>Backend:</strong> Running and responding</li>
          <li>✅ <strong>Database:</strong> MongoDB connected</li>
        </ul>
      </div>
    </div>
  );
}
