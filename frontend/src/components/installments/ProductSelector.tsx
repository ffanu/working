"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  Filter
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
  description?: string;
}

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  onCancel?: () => void;
}

// Mock products - replace with actual API call
const mockProducts: Product[] = [
  {
    id: "prod_001",
    name: "iPhone 15 Pro Max",
    price: 1199.99,
    category: "Electronics",
    stock: 25,
    description: "Latest iPhone with advanced camera system"
  },
  {
    id: "prod_002", 
    name: "MacBook Pro 16-inch M3 Max",
    price: 3999.99,
    category: "Electronics",
    stock: 12,
    description: "Professional laptop with M3 Max chip"
  },
  {
    id: "prod_003",
    name: "Samsung 65\" QLED TV",
    price: 1299.99,
    category: "Electronics", 
    stock: 8,
    description: "4K QLED Smart TV with HDR"
  },
  {
    id: "prod_004",
    name: "Nike Air Jordan Retro",
    price: 189.99,
    category: "Footwear",
    stock: 45,
    description: "Classic basketball sneakers"
  },
  {
    id: "prod_005",
    name: "Dyson V15 Detect",
    price: 749.99,
    category: "Home Appliances",
    stock: 18,
    description: "Advanced cordless vacuum cleaner"
  },
  {
    id: "prod_006",
    name: "Sony WH-1000XM5",
    price: 399.99,
    category: "Electronics",
    stock: 32,
    description: "Noise-canceling wireless headphones"
  }
];

export function ProductSelector({ onProductSelect, onCancel }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      try {
        // Replace with actual API call
        // const response = await productApi.getAll();
        // setProducts(response);
        
        setTimeout(() => {
          setProducts(mockProducts);
          setFilteredProducts(mockProducts);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Product for Installment</h1>
            <p className="text-gray-600">Choose a product to create an installment plan</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Product for Installment</h1>
          <p className="text-gray-600">Choose a product to create an installment plan</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.filter((cat): cat is string => Boolean(cat)).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-12"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </CardTitle>
                      {product.category && (
                        <Badge variant="outline" className="mt-1">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  {product.stock !== undefined && (
                    <div className="text-sm text-gray-600">
                      Stock: <span className="font-medium">{product.stock}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleProductSelect(product)}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group-hover:shadow-lg transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Select for Installment
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or category filter.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <div className="flex justify-center pt-6">
            <Button variant="outline" onClick={onCancel} className="px-8">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
