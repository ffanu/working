"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { Database, Loader2 } from "lucide-react";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeedData = async () => {
    if (!confirm('This will create dummy data for testing. Are you sure you want to proceed?')) {
      return;
    }

    try {
      setIsSeeding(true);
      setMessage(null);

      const response = await fetch('http://localhost:5236/api/seed/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage(`✅ ${result.message}`);
    } catch (error) {
      console.error('Seeding error:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Data Seeding</h1>
            <p className="text-gray-600">Generate dummy data for testing the inventory system</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Generate Test Data
              </CardTitle>
              <CardDescription>
                This will create approximately 50 records each for:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>• Suppliers</div>
                <div>• Customers</div>
                <div>• Products</div>
                <div>• Purchases</div>
                <div>• Sales</div>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <Button 
                onClick={handleSeedData} 
                disabled={isSeeding}
                className="w-full"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Generate Test Data
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 mt-4">
                <p><strong>Note:</strong> This will add new data to your database. Existing data will not be affected.</p>
                <p>The process may take a few moments to complete.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 