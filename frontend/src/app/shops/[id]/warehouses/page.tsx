"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Clock, 
  Package, ArrowLeft, Building, Settings
} from "lucide-react";
import { shopApi, Shop } from "@/lib/api/shops";
import { warehousesApi, Warehouse } from "@/lib/api/warehouses";

export default function ShopWarehousesPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopData, warehousesData] = await Promise.all([
        shopApi.getById(shopId),
        warehousesApi.getByShopId(shopId)
      ]);
      setShop(shopData);
      setWarehouses(warehousesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load shop and warehouse data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      loadData();
    }
  }, [shopId]);

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    warehouse.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowForm(true);
  };

  const handleDelete = async (warehouseId: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      await warehousesApi.delete(warehouseId);
      await loadData();
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      alert("Failed to delete warehouse");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingWarehouse(null);
  };

  const handleFormSubmit = async () => {
    await loadData();
    handleFormClose();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading warehouses...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!shop) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop not found</h2>
            <Button onClick={() => router.push('/shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push('/shops')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{shop.name} - Warehouses</h1>
            <p className="text-gray-600">Manage warehouses for {shop.name}</p>
          </div>
        </div>

        {/* Shop Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{shop.address}, {shop.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium">{shop.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Manager</p>
                <p className="font-medium">{shop.managerName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Warehouses Grid */}
        {filteredWarehouses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No warehouses match your search criteria." : "Get started by creating your first warehouse for this shop."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Warehouse
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <Card key={warehouse.id || warehouse._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {warehouse.address}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(warehouse)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(warehouse.id || warehouse._id || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Type and Status */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {warehouse.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        warehouse.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {warehouse.contactPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {warehouse.contactPhone}
                        </div>
                      )}
                      {warehouse.contactEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {warehouse.contactEmail}
                        </div>
                      )}
                    </div>

                    {/* Operating Hours */}
                    {warehouse.operatingHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {warehouse.operatingHours}
                      </div>
                    )}

                    {/* Capacity Info */}
                    {warehouse.totalCapacity && (
                      <div className="text-sm text-gray-600">
                        Capacity: {warehouse.usedCapacity || 0} / {warehouse.totalCapacity}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Warehouse Form Modal */}
        {showForm && (
          <WarehouseForm
            shopId={shopId}
            shopName={shop.name}
            warehouse={editingWarehouse}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </MainLayout>
  );
}

// Warehouse Form Component
interface WarehouseFormProps {
  shopId: string;
  shopName: string;
  warehouse?: Warehouse | null;
  onClose: () => void;
  onSubmit: () => void;
}

function WarehouseForm({ shopId, shopName, warehouse, onClose, onSubmit }: WarehouseFormProps) {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    description: warehouse?.description || '',
    type: warehouse?.type || 'Warehouse',
    address: warehouse?.address || '',
    city: warehouse?.city || '',
    state: warehouse?.state || '',
    postalCode: warehouse?.postalCode || '',
    country: warehouse?.country || '',
    contactPerson: warehouse?.contactPerson || '',
    contactPhone: warehouse?.contactPhone || '',
    contactEmail: warehouse?.contactEmail || '',
    status: warehouse?.status || 'Active',
    operatingHours: warehouse?.operatingHours || '',
    totalCapacity: warehouse?.totalCapacity || 0,
    maxProducts: warehouse?.maxProducts || 0,
    hasRefrigeration: warehouse?.hasRefrigeration || false,
    hasFreezer: warehouse?.hasFreezer || false,
    hasHazardousStorage: warehouse?.hasHazardousStorage || false,
    hasSecuritySystem: warehouse?.hasSecuritySystem || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const warehouseData = {
        ...formData,
        shopId,
        shopName,
        isActive: formData.status === 'Active',
        isDefault: warehouse?.isDefault || false,
      };

      if (warehouse) {
        await warehousesApi.update(warehouse.id || warehouse._id || '', warehouseData);
      } else {
        await warehousesApi.create(warehouseData);
      }

      onSubmit();
    } catch (err) {
      console.error("Error saving warehouse:", err);
      setError("Failed to save warehouse");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Creating warehouse for <strong>{shopName}</strong>
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="main">Main Warehouse</option>
                  <option value="secondary">Secondary Warehouse</option>
                  <option value="storage">Storage Facility</option>
                  <option value="distribution">Distribution Center</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter warehouse description"
              />
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State/Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <Input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <Input
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <Input
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    placeholder="e.g., 9AM-6PM"
                  />
                </div>
              </div>
            </div>

            {/* Capacity Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Capacity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Capacity
                  </label>
                  <Input
                    name="totalCapacity"
                    type="number"
                    value={formData.totalCapacity}
                    onChange={handleChange}
                    placeholder="Total capacity"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Products
                  </label>
                  <Input
                    name="maxProducts"
                    type="number"
                    value={formData.maxProducts}
                    onChange={handleChange}
                    placeholder="Maximum products"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasRefrigeration"
                    checked={formData.hasRefrigeration}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Refrigeration
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasFreezer"
                    checked={formData.hasFreezer}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Freezer
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasHazardousStorage"
                    checked={formData.hasHazardousStorage}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Hazardous Storage
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasSecuritySystem"
                    checked={formData.hasSecuritySystem}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Security System
                </label>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (warehouse ? 'Update Warehouse' : 'Create Warehouse')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
