'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Warehouse } from '@/types/inventory';

interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSubmit: (warehouse: Omit<Warehouse, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function WarehouseForm({ warehouse, onSubmit, onCancel, isLoading = false }: WarehouseFormProps) {

  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    description: warehouse?.description || '',
    address: warehouse?.address || '',
    city: warehouse?.city || '',
    state: warehouse?.state || '',
    postalCode: warehouse?.postalCode || '',
    country: warehouse?.country || '',
    contactPerson: warehouse?.contactPerson || '',
    contactPhone: warehouse?.contactPhone || '',
    contactEmail: warehouse?.contactEmail || '',
    type: warehouse?.type || 'Warehouse',
    status: warehouse?.status || 'Active',
    isDefault: warehouse?.isDefault || false,
    totalCapacity: warehouse?.totalCapacity || '',
    maxProducts: warehouse?.maxProducts || '',
    operatingHours: warehouse?.operatingHours || '24/7',
    hasRefrigeration: warehouse?.hasRefrigeration || false,
    hasFreezer: warehouse?.hasFreezer || false,
    hasHazardousStorage: warehouse?.hasHazardousStorage || false,
    hasSecuritySystem: warehouse?.hasSecuritySystem || false,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, formData:', formData);
    
    // Only validate warehouse name
    if (!formData.name.trim()) {
      alert('Warehouse name is required');
      return;
    }
    
    // Build warehouse data - only include name and any filled fields
    const warehouseData: any = {
      name: formData.name.trim(),
      type: formData.type || 'Warehouse',
      isDefault: formData.isDefault,
      isActive: true,
      createdBy: 'Current User',
    };

    // Add all optional fields only if they have values
    if (formData.description) warehouseData.description = formData.description;
    if (formData.address) warehouseData.address = formData.address;
    if (formData.city) warehouseData.city = formData.city;
    if (formData.state) warehouseData.state = formData.state;
    if (formData.postalCode) warehouseData.postalCode = formData.postalCode;
    if (formData.country) warehouseData.country = formData.country;
    if (formData.contactPerson) warehouseData.contactPerson = formData.contactPerson;
    if (formData.contactPhone) warehouseData.contactPhone = formData.contactPhone;
    if (formData.contactEmail) warehouseData.contactEmail = formData.contactEmail;
    if (formData.status) warehouseData.status = formData.status;
    if (formData.totalCapacity) warehouseData.totalCapacity = parseFloat(formData.totalCapacity.toString());
    if (formData.maxProducts) warehouseData.maxProducts = parseInt(formData.maxProducts.toString());
    if (formData.operatingHours) warehouseData.operatingHours = formData.operatingHours;
    
    // Boolean fields
    warehouseData.hasRefrigeration = formData.hasRefrigeration;
    warehouseData.hasFreezer = formData.hasFreezer;
    warehouseData.hasHazardousStorage = formData.hasHazardousStorage;
    warehouseData.hasSecuritySystem = formData.hasSecuritySystem;

    console.log('Submitting warehouse data:', warehouseData);
    onSubmit(warehouseData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Main Warehouse"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select 
                value={formData.type} 
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Warehouse">Warehouse</option>
                <option value="Store">Store</option>
                <option value="Distribution Center">Distribution Center</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Warehouse description..."
            />
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="10001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="john@company.com"
              />
            </div>
          </div>

          {/* Capacity and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalCapacity">Total Capacity (m³)</Label>
              <Input
                id="totalCapacity"
                type="number"
                value={formData.totalCapacity}
                onChange={(e) => handleInputChange('totalCapacity', e.target.value)}
                placeholder="1000"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxProducts">Max Products</Label>
              <Input
                id="maxProducts"
                type="number"
                value={formData.maxProducts}
                onChange={(e) => handleInputChange('maxProducts', e.target.value)}
                placeholder="10000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operatingHours">Operating Hours</Label>
              <Input
                id="operatingHours"
                value={formData.operatingHours}
                onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                placeholder="24/7"
              />
            </div>
          </div>

          {/* Special Features */}
          <div className="space-y-4">
            <Label>Special Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasRefrigeration"
                  checked={formData.hasRefrigeration}
                  onChange={(e) => handleInputChange('hasRefrigeration', e.target.checked)}
                />
                <Label htmlFor="hasRefrigeration">Refrigeration</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasFreezer"
                  checked={formData.hasFreezer}
                  onChange={(e) => handleInputChange('hasFreezer', e.target.checked)}
                />
                <Label htmlFor="hasFreezer">Freezer</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasHazardousStorage"
                  checked={formData.hasHazardousStorage}
                  onChange={(e) => handleInputChange('hasHazardousStorage', e.target.checked)}
                />
                <Label htmlFor="hasHazardousStorage">Hazardous Storage</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasSecuritySystem"
                  checked={formData.hasSecuritySystem}
                  onChange={(e) => handleInputChange('hasSecuritySystem', e.target.checked)}
                />
                <Label htmlFor="hasSecuritySystem">Security System</Label>
              </div>
            </div>
          </div>

          {/* Status and Default */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                value={formData.status} 
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              />
              <Label htmlFor="isDefault">Set as Default Warehouse</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (warehouse ? 'Update Warehouse' : 'Create Warehouse')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
