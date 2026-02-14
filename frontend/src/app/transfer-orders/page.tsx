"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Package, 
  Search, 
  Plus, 
  RefreshCw, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square
} from "lucide-react";
import { transferOrderApi } from "@/lib/api/transferOrders";

interface TransferOrder {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  fromLocationName: string;
  fromLocationType: string;
  toLocationId: string;
  toLocationName: string;
  toLocationType: string;
  items: TransferOrderItem[];
  status: string;
  requestDate: string;
  completedDate?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  totalItems: number;
  totalValue: number;
}

interface TransferOrderItem {
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  transferredQuantity: number;
  remainingQuantity: number;
  isFullyTransferred: boolean;
}

interface TransferSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export default function TransferOrdersPage() {
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([]);
  const [summary, setSummary] = useState<TransferSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load transfer orders
      const ordersResponse = await fetch('http://localhost:5236/api/transfer-orders');
      const ordersResult = await ordersResponse.json();
      const ordersData = ordersResult.data || ordersResult; // Handle both formats
      setTransferOrders(Array.isArray(ordersData) ? ordersData : []);

      // Load summary (try to get it, but don't fail if it doesn't exist)
      try {
        const summaryResponse = await fetch('http://localhost:5236/api/transfer-orders/summary');
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        } else {
          // Calculate summary from the orders data
          setSummary({
            total: ordersData.length || 0,
            pending: ordersData.filter((o: any) => o.status === 'Pending').length || 0,
            inProgress: ordersData.filter((o: any) => o.status === 'InProgress').length || 0,
            completed: ordersData.filter((o: any) => o.status === 'Completed').length || 0,
            cancelled: ordersData.filter((o: any) => o.status === 'Cancelled').length || 0,
          });
        }
      } catch (summaryError) {
        console.log('Summary endpoint not available, calculating from data');
        // Calculate summary from the orders data
        setSummary({
          total: ordersData.length || 0,
          pending: ordersData.filter((o: any) => o.status === 'Pending').length || 0,
          inProgress: ordersData.filter((o: any) => o.status === 'InProgress').length || 0,
          completed: ordersData.filter((o: any) => o.status === 'Completed').length || 0,
          cancelled: ordersData.filter((o: any) => o.status === 'Cancelled').length || 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingAction(id);
      await transferOrderApi.approve(id, "Admin User"); // In a real app, get current user
      await loadData(); // Refresh the list
      alert("Transfer order approved successfully!");
    } catch (error) {
      console.error("Error approving transfer order:", error);
      alert("Failed to approve transfer order");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setProcessingAction(id);
      await transferOrderApi.complete(id);
      await loadData(); // Refresh the list
      alert("Transfer order completed successfully!");
    } catch (error) {
      console.error("Error completing transfer order:", error);
      alert("Failed to complete transfer order");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this transfer order?")) {
      return;
    }
    
    try {
      setProcessingAction(id);
      await transferOrderApi.cancel(id);
      await loadData(); // Refresh the list
      alert("Transfer order cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling transfer order:", error);
      alert("Failed to cancel transfer order");
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Pending":
        return { label: "Pending", color: "secondary", icon: Clock };
      case "InProgress":
        return { label: "In Progress", color: "default", icon: ArrowRight };
      case "Completed":
        return { label: "Completed", color: "default", icon: CheckCircle };
      case "Cancelled":
        return { label: "Cancelled", color: "destructive", icon: XCircle };
      default:
        return { label: status, color: "secondary", icon: AlertCircle };
    }
  };

  const filteredOrders = transferOrders.filter(order => {
    const matchesSearch = order.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.fromLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.toLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transfer orders...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transfer Orders</h1>
          <p className="text-gray-600">Manage stock transfers between warehouses and shops</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/transfer-orders/new'}>
            <Plus className="h-4 w-4 mr-2" />
            New Transfer Order
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.inProgress}</p>
                </div>
                <ArrowRight className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{summary.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transfer orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Orders ({filteredOrders.length} orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Transfer #</th>
                  <th className="text-left p-3">From</th>
                  <th className="text-left p-3">To</th>
                  <th className="text-left p-3">Items</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Requested By</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{order.transferNumber}</div>
                        {order.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {order.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{order.fromLocationName}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {order.fromLocationType}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{order.toLocationName}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {order.toLocationType}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{order.totalItems}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} products
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">${order.totalValue.toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={statusInfo.color as any} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{order.requestedBy}</div>
                        {order.approvedBy && (
                          <div className="text-xs text-gray-500">
                            Approved by: {order.approvedBy}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        <div>{new Date(order.requestDate).toLocaleDateString()}</div>
                        {order.completedDate && (
                          <div className="text-xs">
                            Completed: {new Date(order.completedDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {order.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(order.id)}
                                disabled={processingAction === order.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(order.id)}
                                disabled={processingAction === order.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {order.status === "InProgress" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplete(order.id)}
                                disabled={processingAction === order.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(order.id)}
                                disabled={processingAction === order.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {(order.status === "Completed" || order.status === "Cancelled") && (
                            <span className="text-xs text-gray-500 italic">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}
