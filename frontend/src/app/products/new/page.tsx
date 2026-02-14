"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft, Save, Plus, X, Upload, Image as ImageIcon, 
  Package, DollarSign, Truck, Settings, Eye, Camera,
  AlertCircle, CheckCircle, Info
} from "lucide-react";
import Link from "next/link";

interface ProductFormData {
  // Core Info
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brand: string;
  description: string;
  
  // Pricing & Stock
  purchasePrice: number;
  sellingPrice: number;
  tax: string;
  discount: number;
  initialStock: number;
  warehouseId: string;
  reorderLevel: number;
  maxStock: number;
  batchSerial: string;
  
  // Media
  images: File[];
  video: File | null;
  
  // Supplier Info
  primarySupplierId: string;
  supplierCode: string;
  leadTime: number;
  
  // Variants/Attributes
  colors: string[];
  sizes: string[];
  tags: string[];
  
  // Advanced Info
  weight: number;
  weightUnit: string;
  length: number;
  width: number;
  height: number;
  dimensionUnit: string;
  status: string;
}

export default function AddProductPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    brand: "",
    description: "",
    purchasePrice: 0,
    sellingPrice: 0,
    tax: "",
    discount: 0,
    initialStock: 0,
    warehouseId: "",
    reorderLevel: 0,
    maxStock: 0,
    batchSerial: "",
    images: [],
    video: null,
    primarySupplierId: "",
    supplierCode: "",
    leadTime: 0,
    colors: [],
    sizes: [],
    tags: [],
    weight: 0,
    weightUnit: "kg",
    length: 0,
    width: 0,
    height: 0,
    dimensionUnit: "cm",
    status: "Active"
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data - replace with real API calls
        setCategories([
          { id: "1", name: "Electronics" },
          { id: "2", name: "Clothing" },
          { id: "3", name: "Books" },
          { id: "4", name: "Home & Garden" }
        ]);

        setWarehouses([
          { id: "1", name: "Main Warehouse", location: "Dhaka" },
          { id: "2", name: "Branch Warehouse", location: "Chittagong" }
        ]);

        setSuppliers([
          { id: "1", name: "Tech Supplier Co." },
          { id: "2", name: "Fashion Distributors" },
          { id: "3", name: "Book Publishers Ltd." }
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...formData.images, ...files];
    setFormData(prev => ({ ...prev, images: newImages }));

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, video: file }));
  };

  const addVariant = (type: 'colors' | 'sizes' | 'tags', value: string) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const removeVariant = (type: 'colors' | 'sizes' | 'tags', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.purchasePrice <= 0) newErrors.purchasePrice = "Purchase price must be greater than 0";
    if (formData.sellingPrice <= 0) newErrors.sellingPrice = "Selling price must be greater than 0";
    if (formData.initialStock < 0) newErrors.initialStock = "Initial stock cannot be negative";
    if (!formData.warehouseId) newErrors.warehouseId = "Warehouse is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: 'save' | 'saveAndAdd' | 'preview') => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        // Convert images to base64 or upload to server
        imageUrls: imagePreviews,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting product:', submitData);
      
      // Here you would make API call
      // await productApi.create(submitData);
      
      if (action === 'save') {
        alert('Product saved successfully!');
        // Redirect to products list
      } else if (action === 'saveAndAdd') {
        alert('Product saved! Adding another...');
        // Reset form
        setFormData({
          name: "",
          sku: "",
          barcode: "",
          categoryId: "",
          brand: "",
          description: "",
          purchasePrice: 0,
          sellingPrice: 0,
          tax: "",
          discount: 0,
          initialStock: 0,
          warehouseId: "",
          reorderLevel: 0,
          maxStock: 0,
          batchSerial: "",
          images: [],
          video: null,
          primarySupplierId: "",
          supplierCode: "",
          leadTime: 0,
          colors: [],
          sizes: [],
          tags: [],
          weight: 0,
          weightUnit: "kg",
          length: 0,
          width: 0,
          height: 0,
          dimensionUnit: "cm",
          status: "Active"
        });
        setImagePreviews([]);
      } else if (action === 'preview') {
        // Open preview modal or navigate to preview page
        alert('Preview functionality would open here');
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
              <p className="text-gray-600 mt-1">Create a new product in your inventory</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => handleSubmit('preview')} disabled={loading}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('save')} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => handleSubmit('saveAndAdd')} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Save & Add Another
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Core Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Core Information
                </CardTitle>
                <CardDescription>Basic product details and identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="sku">SKU / Product Code *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="e.g., PROD-001"
                    className={errors.sku ? "border-red-500" : ""}
                  />
                  {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode / QR Code</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Enter barcode or scan QR code"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Stock */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Pricing & Stock
                </CardTitle>
                <CardDescription>Pricing information and inventory management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.purchasePrice ? "border-red-500" : ""}
                    />
                    {errors.purchasePrice && <p className="text-sm text-red-500 mt-1">{errors.purchasePrice}</p>}
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.sellingPrice ? "border-red-500" : ""}
                    />
                    {errors.sellingPrice && <p className="text-sm text-red-500 mt-1">{errors.sellingPrice}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax">Tax</Label>
                    <Select 
                      value={formData.tax} 
                      onValueChange={(value) => handleInputChange('tax', value)}
                    >
                      <option value="">Select tax rate</option>
                      <option value="0">0% (No Tax)</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="initialStock">Initial Stock *</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      value={formData.initialStock}
                      onChange={(e) => handleInputChange('initialStock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className={errors.initialStock ? "border-red-500" : ""}
                    />
                    {errors.initialStock && <p className="text-sm text-red-500 mt-1">{errors.initialStock}</p>}
                  </div>
                  <div>
                    <Label htmlFor="warehouse">Warehouse *</Label>
                    <Select 
                      value={formData.warehouseId} 
                      onValueChange={(value) => handleInputChange('warehouseId', value)}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </option>
                      ))}
                    </Select>
                    {errors.warehouseId && <p className="text-sm text-red-500 mt-1">{errors.warehouseId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => handleInputChange('reorderLevel', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Maximum Stock</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="batchSerial">Batch / Serial Number</Label>
                  <Input
                    id="batchSerial"
                    value={formData.batchSerial}
                    onChange={(e) => handleInputChange('batchSerial', e.target.value)}
                    placeholder="Enter batch or serial number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="supplier">Supplier Info</TabsTrigger>
              <TabsTrigger value="variants">Variants/Attributes</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Info</TabsTrigger>
            </TabsList>

            {/* Media Tab */}
            <TabsContent value="media" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Product Media
                  </CardTitle>
                  <CardDescription>Upload product images and videos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <Label>Product Images</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drag & drop images here, or click to select</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Images
                      </Button>
                    </div>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <Label>Product Video / 3D View</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload product video or 3D view (optional)</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('video-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Video
                      </Button>
                    </div>
                    {formData.video && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {formData.video.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Supplier Info Tab */}
            <TabsContent value="supplier" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-orange-600" />
                    Supplier Information
                  </CardTitle>
                  <CardDescription>Primary supplier and procurement details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primarySupplier">Primary Supplier</Label>
                    <Select 
                      value={formData.primarySupplierId} 
                      onValueChange={(value) => handleInputChange('primarySupplierId', value)}
                    >
                      <option value="">Select primary supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="supplierCode">Supplier Code / SKU</Label>
                    <Input
                      id="supplierCode"
                      value={formData.supplierCode}
                      onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                      placeholder="Enter supplier's product code"
                    />
                  </div>

                  <div>
                    <Label htmlFor="leadTime">Lead Time (Days)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      value={formData.leadTime}
                      onChange={(e) => handleInputChange('leadTime', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variants/Attributes Tab */}
            <TabsContent value="variants" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                    Variants & Attributes
                  </CardTitle>
                  <CardDescription>Product variations and attributes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Colors */}
                  <div>
                    <Label>Colors</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.colors.map((color, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {color}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => removeVariant('colors', color)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Add color"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addVariant('colors', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addVariant('colors', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <Label>Sizes</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.sizes.map((size, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {size}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => removeVariant('sizes', size)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Add size"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addVariant('sizes', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addVariant('sizes', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags / Labels</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center">
                          {tag}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => removeVariant('tags', tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Add tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addVariant('tags', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addVariant('tags', input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Info Tab */}
            <TabsContent value="advanced" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Advanced Information
                  </CardTitle>
                  <CardDescription>Physical properties and advanced settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weightUnit">Weight Unit</Label>
                      <Select 
                        value={formData.weightUnit} 
                        onValueChange={(value) => handleInputChange('weightUnit', value)}
                      >
                        <option value="">Select unit</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                      </Select>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <Label>Dimensions (L × W × H)</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Input
                        placeholder="Length"
                        type="number"
                        step="0.01"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Width"
                        type="number"
                        step="0.01"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Height"
                        type="number"
                        step="0.01"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                      />
                      <Select 
                        value={formData.dimensionUnit} 
                        onValueChange={(value) => handleInputChange('dimensionUnit', value)}
                      >
                        <option value="">Select unit</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="m">Meters (m)</option>
                        <option value="in">Inches (in)</option>
                        <option value="ft">Feet (ft)</option>
                      </Select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button variant="outline" onClick={() => handleSubmit('preview')} disabled={loading}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => handleSubmit('save')} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={() => handleSubmit('saveAndAdd')} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
