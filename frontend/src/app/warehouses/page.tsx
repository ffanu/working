'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { warehousesApi } from '@/lib/api/warehouses';
import { Warehouse } from '@/types/inventory';
import WarehouseForm from '@/components/forms/WarehouseForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Building2 } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [searchTerm, warehouses]);

  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      const response = await warehousesApi.getAll();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWarehouses = () => {
    if (!searchTerm.trim()) {
      setFilteredWarehouses(warehouses);
      return;
    }

    const filtered = warehouses.filter(warehouse =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (warehouse.city && warehouse.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (warehouse.contactPerson && warehouse.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredWarehouses(filtered);
  };

  const handleCreateWarehouse = async (warehouseData: Omit<Warehouse, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      console.log('Creating warehouse with data:', warehouseData);
      const result = await warehousesApi.create(warehouseData);
      console.log('Warehouse created successfully:', result);
      setShowForm(false);
      await loadWarehouses();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      alert(`Failed to create warehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWarehouse = async (warehouseData: Omit<Warehouse, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingWarehouse?.id) return;
    
    try {
      setIsSubmitting(true);
      await warehousesApi.update(editingWarehouse.id, warehouseData);
      setEditingWarehouse(null);
      setShowForm(false);
      loadWarehouses();
    } catch (error) {
      console.error('Error updating warehouse:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      await warehousesApi.delete(id);
      loadWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    }
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingWarehouse(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Store':
        return '🏪';
      case 'Distribution Center':
        return '🚚';
      default:
        return '🏭';
    }
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <WarehouseForm
            warehouse={editingWarehouse || undefined}
            onSubmit={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouses</h1>
          <p className="text-gray-600">Manage your warehouse locations and inventory</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Warehouses Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouses...</p>
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first warehouse.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                Create Warehouse
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <Card key={warehouse.id || warehouse._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(warehouse.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <p className="text-sm text-gray-600">{warehouse.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(warehouse.status || 'Active')}>
                    {warehouse.status || 'Active'}
                  </Badge>
                </div>
                {warehouse.isDefault && (
                  <Badge variant="secondary" className="mt-2">
                    Default
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {(warehouse.address || warehouse.city || warehouse.state || warehouse.postalCode || warehouse.country) && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      {warehouse.address && <p>{warehouse.address}</p>}
                      {(warehouse.city || warehouse.state || warehouse.postalCode) && (
                        <p>{[warehouse.city, warehouse.state, warehouse.postalCode].filter(Boolean).join(', ')}</p>
                      )}
                      {warehouse.country && <p>{warehouse.country}</p>}
                    </div>
                  </div>
                )}

                {warehouse.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{warehouse.contactPhone}</span>
                  </div>
                )}

                {warehouse.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{warehouse.contactEmail}</span>
                  </div>
                )}

                {warehouse.description && (
                  <p className="text-sm text-gray-600">{warehouse.description}</p>
                )}

                {/* Show a message if no details are available */}
                {!warehouse.address && !warehouse.city && !warehouse.contactPhone && !warehouse.contactEmail && !warehouse.description && (
                  <p className="text-sm text-gray-500 italic">No additional details provided</p>
                )}

                {/* Special Features */}
                {(warehouse.hasRefrigeration || warehouse.hasFreezer || warehouse.hasHazardousStorage || warehouse.hasSecuritySystem) && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Special Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {warehouse.hasRefrigeration && <Badge variant="outline" className="text-xs">❄️ Refrigeration</Badge>}
                      {warehouse.hasFreezer && <Badge variant="outline" className="text-xs">🧊 Freezer</Badge>}
                      {warehouse.hasHazardousStorage && <Badge variant="outline" className="text-xs">⚠️ Hazardous</Badge>}
                      {warehouse.hasSecuritySystem && <Badge variant="outline" className="text-xs">🔒 Security</Badge>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWarehouse(warehouse)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWarehouse(warehouse.id || warehouse._id || '')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </MainLayout>
  );
}
