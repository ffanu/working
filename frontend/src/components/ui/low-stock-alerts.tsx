'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/lib/config';
import { 
  AlertTriangle, Package, TrendingDown, Bell, 
  Settings, Filter, Eye, EyeOff, Download,
  Plus, Minus, RefreshCw, Zap, Target
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  supplier: string;
  costPrice?: number;
  price: number;
  minStockLevel?: number;
  reorderPoint?: number;
  lastRestocked?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  supplier: string;
  lastRestocked: string;
  daysUntilStockout: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  costPrice: number;
  retailPrice: number;
}

interface LowStockAlertsProps {
  className?: string;
}

export function LowStockAlerts({ className = '' }: LowStockAlertsProps) {
  const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all',
    search: ''
  });
  const [globalSettings, setGlobalSettings] = useState({
    defaultMinStock: 10,
    defaultReorderPoint: 25,
    enableAutoAlerts: true,
    alertThreshold: 0.2
  });

  // Fetch real product data and calculate low stock alerts
  useEffect(() => {
    const fetchLowStockAlerts = async () => {
      try {
        setLoading(true);
        
        // Fetch products from API
        let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const products: Product[] = await response.json();
        
        // Calculate low stock alerts based on real data
        const lowStockProducts = products
          .filter(product => {
            const minLevel = product.minStockLevel || globalSettings.defaultMinStock;
            const reorderPoint = product.reorderPoint || globalSettings.defaultReorderPoint;
            
            // Product is low stock if current quantity is below reorder point
            return product.quantity <= reorderPoint;
          })
          .map(product => {
            const minLevel = product.minStockLevel || globalSettings.defaultMinStock;
            const reorderPoint = product.reorderPoint || globalSettings.defaultReorderPoint;
            
            // Calculate priority based on stock levels
            let priority: 'critical' | 'high' | 'medium' | 'low';
            if (product.quantity <= minLevel) {
              priority = 'critical';
            } else if (product.quantity <= minLevel * 1.5) {
              priority = 'high';
            } else if (product.quantity <= reorderPoint * 0.8) {
              priority = 'medium';
            } else {
              priority = 'low';
            }
            
            // Calculate days until stockout (rough estimation)
            // Assuming average daily sales based on category
            const avgDailySales = getAverageDailySales(product.category);
            const daysUntilStockout = avgDailySales > 0 ? Math.floor(product.quantity / avgDailySales) : 999;
            
            // Get last restocked date (if available)
            const lastRestocked = product.lastRestocked || new Date().toISOString().split('T')[0];
            
            return {
              id: product._id,
              name: product.name,
              sku: product.sku,
              currentStock: product.quantity,
              minStockLevel: minLevel,
              reorderPoint: reorderPoint,
              supplier: product.supplier || 'Unknown Supplier',
              lastRestocked: lastRestocked,
              daysUntilStockout: daysUntilStockout,
              priority,
              category: product.category,
              costPrice: product.costPrice || 0,
              retailPrice: product.price
            };
          })
          .sort((a, b) => {
            // Sort by priority: critical first, then by days until stockout
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.daysUntilStockout - b.daysUntilStockout;
          });
        
        setAlerts(lowStockProducts);
      } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        // Fallback to empty array if API fails
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockAlerts();
  }, [globalSettings.defaultMinStock, globalSettings.defaultReorderPoint]);

  // Helper function to estimate average daily sales by category
  const getAverageDailySales = (category: string): number => {
    // This would ideally come from actual sales data
    // For now, using reasonable estimates based on category
    const categoryEstimates: { [key: string]: number } = {
      'Electronics': 2,
      'Clothing': 5,
      'Kitchen': 3,
      'Home & Office': 2,
      'Health & Beauty': 4,
      'Books': 1,
      'Sports': 2,
      'Toys': 3,
      'Automotive': 1,
      'Garden': 1
    };
    
    return categoryEstimates[category] || 2; // Default to 2 units per day
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Package className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filters.priority !== 'all' && alert.priority !== filters.priority) return false;
    if (filters.category !== 'all' && alert.category !== filters.category) return false;
    if (filters.search && !alert.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const criticalAlerts = filteredAlerts.filter(alert => alert.priority === 'critical');
  const highAlerts = filteredAlerts.filter(alert => alert.priority === 'high');
  const totalAlerts = filteredAlerts.length;

  const exportAlerts = () => {
    const csvContent = [
      ['Product Name', 'SKU', 'Current Stock', 'Min Stock', 'Priority', 'Supplier', 'Days Until Stockout'],
      ...filteredAlerts.map(alert => [
        alert.name,
        alert.sku,
        alert.currentStock.toString(),
        alert.minStockLevel.toString(),
        alert.priority,
        alert.supplier,
        alert.daysUntilStockout.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'low-stock-alerts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateStockLevel = async (productId: string, newLevel: number) => {
    try {
      // Update stock level via API
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: Math.max(0, newLevel) }),
      });

      if (response.ok) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === productId 
            ? { ...alert, currentStock: Math.max(0, newLevel) }
            : alert
        ));
      } else {
        console.error('Failed to update stock level');
      }
    } catch (error) {
      console.error('Error updating stock level:', error);
    }
  };

  const refreshAlerts = async () => {
    setLoading(true);
    try {
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
      if (response.ok) {
        const products: Product[] = await response.json();
        
        const lowStockProducts = products
          .filter(product => {
            const minLevel = product.minStockLevel || globalSettings.defaultMinStock;
            const reorderPoint = product.reorderPoint || globalSettings.defaultReorderPoint;
            return product.quantity <= reorderPoint;
          })
          .map(product => {
            const minLevel = product.minStockLevel || globalSettings.defaultMinStock;
            const reorderPoint = product.reorderPoint || globalSettings.defaultReorderPoint;
            
            let priority: 'critical' | 'high' | 'medium' | 'low';
            if (product.quantity <= minLevel) {
              priority = 'critical';
            } else if (product.quantity <= minLevel * 1.5) {
              priority = 'high';
            } else if (product.quantity <= reorderPoint * 0.8) {
              priority = 'medium';
            } else {
              priority = 'low';
            }
            
            const avgDailySales = getAverageDailySales(product.category);
            const daysUntilStockout = avgDailySales > 0 ? Math.floor(product.quantity / avgDailySales) : 999;
            const lastRestocked = product.lastRestocked || new Date().toISOString().split('T')[0];
            
            return {
              id: product._id,
              name: product.name,
              sku: product.sku,
              currentStock: product.quantity,
              minStockLevel: minLevel,
              reorderPoint: reorderPoint,
              supplier: product.supplier || 'Unknown Supplier',
              lastRestocked: lastRestocked,
              daysUntilStockout: daysUntilStockout,
              priority,
              category: product.category,
              costPrice: product.costPrice || 0,
              retailPrice: product.price
            };
          })
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.daysUntilStockout - b.daysUntilStockout;
          });
        
        setAlerts(lowStockProducts);
      }
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(alerts.map(alert => alert.category))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Low Stock Alerts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage products with low inventory levels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={refreshAlerts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAlerts} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
            <CardDescription>Configure global low stock alert parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Default Minimum Stock Level</label>
                <Input
                  type="number"
                  value={globalSettings.defaultMinStock}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    defaultMinStock: parseInt(e.target.value) || 0
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Default Reorder Point</label>
                <Input
                  type="number"
                  value={globalSettings.defaultReorderPoint}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    defaultReorderPoint: parseInt(e.target.value) || 0
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alert Threshold (%)</label>
                <Input
                  type="number"
                  value={globalSettings.alertThreshold * 100}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    alertThreshold: (parseInt(e.target.value) || 0) / 100
                  }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={globalSettings.enableAutoAlerts}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    enableAutoAlerts: e.target.checked
                  }))}
                  className="rounded"
                />
                <label className="text-sm font-medium">Enable Auto Alerts</label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-gray-600">Products need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-gray-600">Immediate action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
            <p className="text-xs text-gray-600">Order within days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Reorder</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {globalSettings.enableAutoAlerts ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-gray-600">Automated ordering</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium">Search Products</label>
              <Input
                type="text"
                placeholder="Search by name or SKU..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>
            {filteredAlerts.length} products require attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getPriorityIcon(alert.priority)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{alert.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {alert.sku} • {alert.category}</p>
                      <p className="text-sm text-gray-500">Supplier: {alert.supplier}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                        {alert.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {alert.daysUntilStockout === 999 ? 'No sales data' : `${alert.daysUntilStockout} days left`}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div>Current: <span className="font-medium">{alert.currentStock}</span></div>
                      <div>Min Level: <span className="font-medium">{alert.minStockLevel}</span></div>
                      <div>Reorder at: <span className="font-medium">{alert.reorderPoint}</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStockLevel(alert.id, alert.currentStock - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium">Stock: {alert.currentStock}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStockLevel(alert.id, alert.currentStock + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Target className="h-3 w-3 mr-1" />
                      Set Reminder
                    </Button>
                    <Button size="sm" variant="default">
                      Order Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No low stock alerts found with current filters</p>
                <p className="text-sm">All products are well-stocked!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common low stock management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" onClick={refreshAlerts}>
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Refresh Alerts</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Auto Reorder</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" onClick={exportAlerts}>
              <Download className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Export Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Configure</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
