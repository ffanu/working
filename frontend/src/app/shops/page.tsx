"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Clock, 
  Building, Users, Package, Settings, Eye, MoreHorizontal, Warehouse
} from "lucide-react";
import { shopApi, Shop } from "@/lib/api/shops";
import { warehousesApi } from "@/lib/api/warehouses";
import { useRouter } from "next/navigation";

export default function ShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const shopsData = await shopApi.getAll();
      setShops(shopsData);
    } catch (err) {
      console.error("Error loading shops:", err);
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setShowForm(true);
  };

  const handleDelete = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;
    
    try {
      await shopApi.delete(shopId);
      await loadData();
    } catch (err) {
      console.error("Error deleting shop:", err);
      alert("Failed to delete shop");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingShop(null);
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
            <div className="text-lg">Loading shops...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
            <p className="text-gray-600">Manage your retail locations and branches</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Shop
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shops by name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No shops match your search criteria." : "Get started by creating your first shop."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Shop
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id || shop._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shop.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {shop.address}, {shop.city}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/shops/${shop.id || shop._id}/warehouses`)}
                        title="Manage Warehouses"
                      >
                        <Warehouse className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(shop)}
                        title="Edit Shop"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(shop.id || shop._id || '')}
                        title="Delete Shop"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {shop.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {shop.phone}
                        </div>
                      )}
                      {shop.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {shop.email}
                        </div>
                      )}
                    </div>

                    {/* Manager Info */}
                    {shop.managerName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        Manager: {shop.managerName}
                      </div>
                    )}

                    {/* Business Hours */}
                    {shop.businessHours && Object.keys(shop.businessHours).length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>Mon-Fri: 9AM-9PM</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shop.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shop.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {shop.isMainBranch && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Main Branch
                        </span>
                      )}
                    </div>

                    {/* Warehouse Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-3 w-3" />
                      {shop.warehouseCount || 0} warehouses
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Shop Form Modal */}
        {showForm && (
          <ShopForm
            shop={editingShop}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </MainLayout>
  );
}

// Shop Form Component
interface ShopFormProps {
  shop?: Shop | null;
  onClose: () => void;
  onSubmit: () => void;
}

function ShopForm({ shop, onClose, onSubmit }: ShopFormProps) {
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    code: shop?.code || '',
    address: shop?.address || '',
    city: shop?.city || '',
    state: shop?.state || '',
    postalCode: shop?.postalCode || '',
    country: shop?.country || '',
    phone: shop?.phone || '',
    email: shop?.email || '',
    managerName: shop?.managerName || '',
    managerPhone: shop?.managerPhone || '',
    managerEmail: shop?.managerEmail || '',
    timeZone: shop?.timeZone || 'UTC',
    currency: shop?.currency || 'USD',
    language: shop?.language || 'en',
    isActive: shop?.isActive ?? true,
    isMainBranch: shop?.isMainBranch || false,
    creditLimit: shop?.creditLimit || 0,
    taxRate: shop?.taxRate || 10,
    createdBy: shop?.createdBy || 'System',
    updatedBy: 'System',
    businessHours: shop?.businessHours || {},
    allowNegativeStock: shop?.allowNegativeStock || false,
    requireWarehouseSelection: shop?.requireWarehouseSelection || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate shop name
    if (!formData.name.trim()) {
      setError('Shop name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build shop data - only include name and any filled fields
      const shopData: any = {
        name: formData.name.trim(),
        isActive: formData.isActive,
        isMainBranch: formData.isMainBranch,
        allowNegativeStock: formData.allowNegativeStock,
        requireWarehouseSelection: formData.requireWarehouseSelection,
        timeZone: formData.timeZone || 'UTC',
        currency: formData.currency || 'USD',
        language: formData.language || 'en',
        taxRate: formData.taxRate || 10,
        businessHours: formData.businessHours || {},
      };

      // Add optional fields only if they have values
      if (formData.description) shopData.description = formData.description;
      if (formData.code) shopData.code = formData.code;
      if (formData.address) shopData.address = formData.address;
      if (formData.city) shopData.city = formData.city;
      if (formData.state) shopData.state = formData.state;
      if (formData.postalCode) shopData.postalCode = formData.postalCode;
      if (formData.country) shopData.country = formData.country;
      if (formData.phone) shopData.phone = formData.phone;
      if (formData.email) shopData.email = formData.email;
      if (formData.managerName) shopData.managerName = formData.managerName;
      if (formData.managerPhone) shopData.managerPhone = formData.managerPhone;
      if (formData.managerEmail) shopData.managerEmail = formData.managerEmail;
      if (formData.creditLimit) shopData.creditLimit = formData.creditLimit;
      if (formData.createdBy) shopData.createdBy = formData.createdBy;
      if (formData.updatedBy) shopData.updatedBy = formData.updatedBy;

      if (shop) {
        await shopApi.update(shop.id || shop._id || '', shopData);
      } else {
        await shopApi.create(shopData);
      }

      onSubmit();
    } catch (err) {
      console.error("Error saving shop:", err);
      setError(err instanceof Error ? err.message : "Failed to save shop");
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
              {shop ? 'Edit Shop' : 'Add New Shop'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

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
                  Shop Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter shop name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Code
                </label>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., MAIN, BRANCH1"
                />
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
                placeholder="Enter shop description"
              />
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
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
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            {/* Manager Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manager Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Name
                  </label>
                  <Input
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    placeholder="Manager name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Phone
                  </label>
                  <Input
                    name="managerPhone"
                    value={formData.managerPhone}
                    onChange={handleChange}
                    placeholder="Manager phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Email
                  </label>
                  <Input
                    name="managerEmail"
                    type="email"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    placeholder="Manager email"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Dhaka">Dhaka</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                    <option value="INR">INR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <Input
                    name="taxRate"
                    type="number"
                    value={formData.taxRate}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Active
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isMainBranch"
                    checked={formData.isMainBranch}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Main Branch
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (shop ? 'Update Shop' : 'Create Shop')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
