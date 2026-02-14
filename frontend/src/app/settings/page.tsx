'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  DollarSign, 
  Globe, 
  Shield, 
  Database, 
  Mail, 
  Smartphone,
  Monitor,
  Wifi,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface SystemSettings {
  general: {
    companyName: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    currencySymbol: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlerts: boolean;
    orderAlerts: boolean;
    systemAlerts: boolean;
    alertThreshold: number;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: string;
    twoFactorAuth: boolean;
    loginAttempts: number;
    ipWhitelist: string[];
  };
  integrations: {
    emailService: string;
    smsService: string;
    backupService: string;
    apiEnabled: boolean;
    webhookUrl: string;
  };
  appearance: {
    theme: string;
    sidebarCollapsed: boolean;
    dashboardLayout: string;
    showNotifications: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      companyName: 'Inventory Management System',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      currencySymbol: '$'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      orderAlerts: true,
      systemAlerts: true,
      alertThreshold: 10
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      twoFactorAuth: false,
      loginAttempts: 5,
      ipWhitelist: []
    },
    integrations: {
      emailService: 'smtp',
      smsService: 'twilio',
      backupService: 'aws',
      apiEnabled: true,
      webhookUrl: ''
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      dashboardLayout: 'grid',
      showNotifications: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Data management state
  const [isClearingData, setIsClearingData] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [dataStats, setDataStats] = useState({
    products: 0,
    customers: 0,
    purchases: 0,
    sales: 0
  });

  useEffect(() => {
    loadSettings();
    loadDataStats();
  }, []);

  // Load data statistics
  const loadDataStats = async () => {
    try {
      const [productsRes, customersRes, purchasesRes, salesRes] = await Promise.all([
        fetch('http://localhost:5236/api/products'),
        fetch('http://localhost:5236/api/customers'),
        fetch('http://localhost:5236/api/purchases'),
        fetch('http://localhost:5236/api/sales')
      ]);

      const [products, customers, purchases, sales] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        purchasesRes.json(),
        salesRes.json()
      ]);

      setDataStats({
        products: products.total || products.data?.length || 0,
        customers: customers.total || customers.data?.length || 0,
        purchases: purchases.total || purchases.data?.length || 0,
        sales: sales.total || sales.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Mock loading - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings would be loaded from API here
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Mock save - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Clear all data function
  const handleClearAllData = async () => {
    if (!showClearConfirmation) {
      setShowClearConfirmation(true);
      return;
    }

    try {
      setIsClearingData(true);
      
      const response = await fetch('http://localhost:5236/api/backup/clear', {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('All data has been cleared successfully!');
        // Refresh data stats
        await loadDataStats();
        setShowClearConfirmation(false);
      } else {
        throw new Error('Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data. Please try again.');
    } finally {
      setIsClearingData(false);
    }
  };

  // Export data function
  const handleExportData = async () => {
    try {
      setIsExportingData(true);
      
      // Create a comprehensive data export
      const [productsRes, customersRes, suppliersRes, purchasesRes, salesRes, warehousesRes] = await Promise.all([
        fetch('http://localhost:5236/api/products'),
        fetch('http://localhost:5236/api/customers'),
        fetch('http://localhost:5236/api/suppliers'),
        fetch('http://localhost:5236/api/purchases'),
        fetch('http://localhost:5236/api/sales'),
        fetch('http://localhost:5236/api/warehouses')
      ]);

      const [products, customers, suppliers, purchases, sales, warehouses] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        suppliersRes.json(),
        purchasesRes.json(),
        salesRes.json(),
        warehousesRes.json()
      ]);

      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          products: products.data || products,
          customers: customers.data || customers,
          suppliers: suppliers.data || suppliers,
          purchases: purchases.data || purchases,
          sales: sales.data || sales,
          warehouses: warehouses.data || warehouses
        }
      };

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure system preferences and behavior</p>
        </div>
        <div className="flex items-center space-x-2">
          {saved && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <Input
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency Symbol</label>
                  <Input
                    value={settings.general.currencySymbol}
                    onChange={(e) => updateSetting('general', 'currencySymbol', e.target.value)}
                    placeholder="$"
                    maxLength={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Appearance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dashboard Layout</label>
                  <select
                    value={settings.appearance.dashboardLayout}
                    onChange={(e) => updateSetting('appearance', 'dashboardLayout', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Collapsed Sidebar</h4>
                  <p className="text-sm text-gray-600">Start with sidebar collapsed</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appearance.sidebarCollapsed}
                    onChange={(e) => updateSetting('appearance', 'sidebarCollapsed', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Notifications</h4>
                  <p className="text-sm text-gray-600">Display notification badges</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appearance.showNotifications}
                    onChange={(e) => updateSetting('appearance', 'showNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Clear All Data Section */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Clear All Data
                    </h3>
                    <p className="text-red-700 mb-4">
                      This action will permanently delete all data from the system including:
                    </p>
                    <ul className="list-disc list-inside text-red-700 mb-4 space-y-1">
                      <li>All products and inventory</li>
                      <li>All customers and suppliers</li>
                      <li>All purchases and sales transactions</li>
                      <li>All stock movements and warehouse data</li>
                      <li>All financial records and ledgers</li>
                      <li>All user accounts and settings</li>
                    </ul>
                    <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                      <p className="text-red-800 font-medium">
                        ⚠️ Warning: This action cannot be undone!
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleClearAllData}
                        disabled={isClearingData}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isClearingData ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Clearing Data...
                          </>
                        ) : showClearConfirmation ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Confirm Clear All Data
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Clear All Data
                          </>
                        )}
                      </Button>
                      {showClearConfirmation && (
                        <Button
                          variant="outline"
                          onClick={() => setShowClearConfirmation(false)}
                          disabled={isClearingData}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Export Section */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-start space-x-3">
                  <Database className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Export Data
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Export your data before clearing to keep a backup.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleExportData}
                        disabled={isExportingData}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        {isExportingData ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4 mr-2" />
                            Export All Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Statistics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  System Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{dataStats.products}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{dataStats.customers}</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{dataStats.purchases}</div>
                    <div className="text-sm text-gray-600">Purchases</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">{dataStats.sales}</div>
                    <div className="text-sm text-gray-600">Sales</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  );
}