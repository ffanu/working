'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Category } from '@/types/inventory';
import { categoryApi } from '@/lib/api/categories';
import { X, Save, Plus } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
  parentCategories?: Category[];
}

export function CategoryForm({ category, onSave, onCancel, parentCategories = [] }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    code: '',
    color: '#3B82F6',
    icon: 'Package',
    isActive: true,
    requiresSerialNumber: false,
    requiresBatchTracking: false,
    requiresExpiryDate: false,
    defaultShelfLifeDays: 365,
    defaultStorageConditions: 'Room Temperature',
    defaultProfitMargin: 30,
    defaultMarkupPercentage: 50,
    defaultMinStockLevel: 10,
    defaultReorderPoint: 5,
    tags: [],
    ...category
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.code) {
        throw new Error('Name and Code are required');
      }

      let savedCategory: Category;
      if (category?.id || category?._id) {
        // Update existing category
        const categoryId = category.id || category._id;
        if (!categoryId) throw new Error('Category ID is required');
        const success = await categoryApi.update(categoryId, formData);
        if (!success) {
          throw new Error('Failed to update category');
        }
        // For update, use the updated form data
        savedCategory = { ...category, ...formData } as Category;
      } else {
        // Create new category
        savedCategory = await categoryApi.create(formData);
      }

      onSave(savedCategory);
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Category name"
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="CAT-001"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              placeholder="Category description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentCategory">Parent Category</Label>
              <select
                value={formData.parentCategoryId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('parentCategoryId', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No Parent (Root Category)</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon || 'Package'}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="Package"
              />
            </div>

            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultProfitMargin">Default Profit Margin (%)</Label>
              <Input
                id="defaultProfitMargin"
                type="number"
                value={formData.defaultProfitMargin || 30}
                onChange={(e) => handleInputChange('defaultProfitMargin', parseFloat(e.target.value))}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="defaultMarkupPercentage">Default Markup (%)</Label>
              <Input
                id="defaultMarkupPercentage"
                type="number"
                value={formData.defaultMarkupPercentage || 50}
                onChange={(e) => handleInputChange('defaultMarkupPercentage', parseFloat(e.target.value))}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMinStockLevel">Default Min Stock Level</Label>
              <Input
                id="defaultMinStockLevel"
                type="number"
                value={formData.defaultMinStockLevel || 10}
                onChange={(e) => handleInputChange('defaultMinStockLevel', parseInt(e.target.value))}
                placeholder="10"
              />
            </div>

            <div>
              <Label htmlFor="defaultReorderPoint">Default Reorder Point</Label>
              <Input
                id="defaultReorderPoint"
                type="number"
                value={formData.defaultReorderPoint || 5}
                onChange={(e) => handleInputChange('defaultReorderPoint', parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded"
                />
                <span>Active</span>
              </Label>

              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.requiresSerialNumber || false}
                  onChange={(e) => handleInputChange('requiresSerialNumber', e.target.checked)}
                  className="rounded"
                />
                <span>Requires Serial Number</span>
              </Label>

              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.requiresBatchTracking || false}
                  onChange={(e) => handleInputChange('requiresBatchTracking', e.target.checked)}
                  className="rounded"
                />
                <span>Requires Batch Tracking</span>
              </Label>

              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.requiresExpiryDate || false}
                  onChange={(e) => handleInputChange('requiresExpiryDate', e.target.checked)}
                  className="rounded"
                />
                <span>Requires Expiry Date</span>
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                id="tags"
                placeholder="Add tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById('tags') as HTMLInputElement;
                  if (input.value) {
                    addTag(input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
