'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { modificationApi } from '@/lib/api/modifications';
import { ModifyInstallmentPlanRequest } from '@/types/modification';

export default function TestModificationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testModificationAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: ModifyInstallmentPlanRequest = {
        installmentPlanId: "68d90fece8248448a44b9f21",
        modificationType: "ChangeInstallmentCount",
        reason: "Test from frontend",
        requestedBy: "customer123",
        newInstallmentCount: 10
      };

      console.log('Testing modification API with request:', request);
      const result = await modificationApi.previewModification(request);
      console.log('API result:', result);
      setResult(result);
    } catch (error) {
      console.error('API test failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Modification API</h1>
      
      <Button onClick={testModificationAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test Modification API'}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-bold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-800">Success!</h3>
          <pre className="text-sm mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}


