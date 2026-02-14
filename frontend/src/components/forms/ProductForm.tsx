"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Image as ImageIcon,
  Barcode,
  Info,
  TrendingUp,
  Shield,
  Palette,
  Plus,
  ShoppingBag,
  Coins,
  Warehouse,
  Camera
} from "lucide-react";
import { Product, Supplier, Category } from "@/types/inventory";
import { categoryApi } from "@/lib/api/categories";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductFormData) => void;
  product?: Product;
  suppliers?: Supplier[];
}

interface ProductFormData {
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  images?: string[];
  mainImage?: string;
  minStockLevel: number;
  reorderPoint: number;
  weight?: number;
  dimensions?: string;
  tags?: string[];
  isActive: boolean;
}

export function ProductForm({ isOpen, onClose, onSubmit, product, suppliers = [] }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || 0,
    costPrice: product?.costPrice || 0,
    stock: product?.quantity || 0,
    unit: product?.unit || "pcs",
    supplierId: undefined, // Will be set based on supplier name
    supplierName: product?.supplier || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    images: product?.images || [],
    mainImage: product?.mainImage || "",
    minStockLevel: product?.minStockLevel || 10,
    reorderPoint: product?.reorderPoint || 25,
    weight: product?.weight || 0,
    dimensions: product?.dimensions || "",
    tags: product?.tags || [],
    isActive: product?.isActive ?? true,
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [newTag, setNewTag] = useState("");

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryApi.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Auto-generate SKU if not provided
  useEffect(() => {
    if (!formData.sku && formData.name && formData.category) {
      const categoryPrefix = formData.category.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({
        ...prev,
        sku: `${categoryPrefix}-${timestamp}`
      }));
    }
  }, [formData.name, formData.category]);

  // Auto-calculate reorder point if min stock level changes
  useEffect(() => {
    if (formData.minStockLevel > 0) {
      setFormData(prev => ({
        ...prev,
        reorderPoint: Math.max(prev.minStockLevel + 15, prev.reorderPoint)
      }));
    }
  }, [formData.minStockLevel]);

  // Reset form data when product changes (for editing)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || 0,
        costPrice: product.costPrice || 0,
        stock: product.quantity || 0,
        unit: product.unit || "pcs",
        supplierId: undefined, // Will be set based on supplier name
        supplierName: product.supplier || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        images: product.images || [],
        mainImage: product.mainImage || "",
        minStockLevel: product.minStockLevel || 10,
        reorderPoint: product.reorderPoint || 25,
        weight: product.weight || 0,
        dimensions: product.dimensions || "",
        tags: product.tags || [],
        isActive: product.isActive ?? true,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.costPrice > formData.price) {
      alert("Cost price cannot be higher than selling price");
      return;
    }
    
    if (formData.reorderPoint <= formData.minStockLevel) {
      alert("Reorder point must be higher than minimum stock level");
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId || s._id === formData.supplierId);
    
    console.log('Form submitting with data:', formData);
    console.log('Selected supplier:', selectedSupplier);
    
    onSubmit({
      ...formData,
      supplierName: selectedSupplier?.name || "",
    });
    // Don't close here - let the parent component handle closing after successful operation
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "costPrice" || name === "stock" || name === "minStockLevel" || name === "reorderPoint" || name === "weight" 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const calculateProfitMargin = () => {
    if (formData.price > 0 && formData.costPrice > 0) {
      return ((formData.price - formData.costPrice) / formData.price * 100).toFixed(1);
    }
    return "0.0";
  };

  const getStockStatus = () => {
    if (formData.stock === 0) return { status: "Out of Stock", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (formData.stock <= formData.minStockLevel) return { status: "Low Stock", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    if (formData.stock <= formData.reorderPoint) return { status: "Reorder Soon", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    return { status: "In Stock", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  if (!isOpen) return null;

  const stockStatus = getStockStatus();
  const profitMargin = calculateProfitMargin();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {product ? "Edit Product" : "Add New Product"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {product ? "Update product information" : "Create a new product with comprehensive details"}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1">
                <TabsTrigger 
                  value="basic" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 transition-all duration-200"
                >
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="pricing" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 transition-all duration-200"
                >
                  <Coins className="h-4 w-4 text-green-600" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 transition-all duration-200"
                >
                  <Warehouse className="h-4 w-4 text-orange-600" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 transition-all duration-200"
                >
                  <Camera className="h-4 w-4 text-purple-600" />
                  Media
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Product Name *
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                      SKU
                    </label>
                    <Input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                      className="w-full bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loadingCategories}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingCategories ? "Loading categories..." : "Select category"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
                      Supplier
                    </label>
                    <select
                      id="supplierId"
                      name="supplierId"
                      value={formData.supplierId || ""}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id || supplier._id} value={supplier.id || supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter detailed product description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                      Barcode
                    </label>
                    <Input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode || ""}
                      onChange={handleChange}
                      placeholder="Enter barcode or scan"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        variant="outline" 
                        size="sm"
                        className="px-4"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags?.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-gray-200"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Selling Price ($) *
                    </label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
                      Cost Price ($)
                    </label>
                    <Input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>
                </div>

                {formData.price > 0 && formData.costPrice > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        Profit Margin: {profitMargin}%
                      </span>
                      <span className="text-sm text-blue-600">
                        Profit per unit: ${(formData.price - formData.costPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                      Unit of Measure
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="l">Liters (l)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="m">Meters (m)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="box">Boxes</option>
                      <option value="pack">Packs</option>
                      <option value="set">Sets</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight || 0}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                      Dimensions (L × W × H cm)
                    </label>
                    <Input
                      type="text"
                      id="dimensions"
                      name="dimensions"
                      value={formData.dimensions || ""}
                      placeholder="e.g., 30 × 20 × 10"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Current Stock *
                    </label>
                    <Input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                      placeholder="0"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
                      Min Stock Level
                    </label>
                    <Input
                      type="number"
                      id="minStockLevel"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      min="0"
                      placeholder="10"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">
                      Reorder Point
                    </label>
                    <Input
                      type="number"
                      id="reorderPoint"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleChange}
                      min="0"
                      placeholder="25"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Stock Status Display */}
                <div className={`${stockStatus.bgColor} ${stockStatus.borderColor} border p-4 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Stock Status: {stockStatus.status}
                    </span>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {formData.stock} {formData.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Product is active and available for sale
                  </label>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <div className="space-y-4">
                  <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700">
                    Main Image URL
                  </label>
                  <Input
                    type="url"
                    id="mainImage"
                    name="mainImage"
                    value={formData.mainImage || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/main-image.jpg"
                    className="w-full"
                  />
                  {formData.mainImage && (
                    <div className="mt-3">
                      <img 
                        src={formData.mainImage} 
                        alt="Main product image" 
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center text-gray-400 w-40 h-40 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                    Additional Image URLs (one per line)
                  </label>
                  <textarea
                    id="images"
                    name="images"
                    value={formData.images?.join('\n') || ""}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim());
                      setFormData(prev => ({ ...prev, images: urls }));
                    }}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                  />
                  {formData.images && formData.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {formData.images.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Product image ${index + 1}`} 
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {product ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 