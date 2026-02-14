"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, Filter, Truck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { supplierApi } from "@/lib/api";
import { Supplier } from "@/types/inventory";

export default function SuppliersPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm, sortBy, sortDir, page, pageSize]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 500); // Increased to 500ms for smoother experience

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Maintain focus on search input
  useEffect(() => {
    if (searchInputRef.current && !loading) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const result = await supplierApi.getAll({ search: searchTerm, sortBy, sortDir, page, pageSize });
      setSuppliers(result.data);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load suppliers');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (supplierData: any) => {
    try {
      setError(null); // Clear any previous errors
      const newSupplier = await supplierApi.create({
        name: supplierData.name,
        contactPerson: supplierData.contactPerson,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        status: supplierData.status,
        isActive: true,
      });
      loadSuppliers(); // Reload to get updated data
      setIsFormOpen(false); // Close the form after successful creation
    } catch (err) {
      setError('Failed to add supplier');
      console.error('Error adding supplier:', err);
    }
  };

  const handleEditSupplier = async (supplierData: any) => {
    if (!editingSupplier) return;
    
    try {
      setError(null); // Clear any previous errors
      await supplierApi.update(editingSupplier.id || editingSupplier._id || '', {
        name: supplierData.name,
        contactPerson: supplierData.contactPerson,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        status: supplierData.status,
        isActive: true,
      });
      
      loadSuppliers(); // Reload to get updated data
      setIsFormOpen(false); // Close the form after successful update
      setEditingSupplier(null); // Clear editing state
    } catch (err) {
      setError('Failed to update supplier');
      console.error('Error updating supplier:', err);
    }
  };

  const handleSubmit = async (supplierData: any) => {
    if (editingSupplier) {
      await handleEditSupplier(supplierData);
    } else {
      await handleAddSupplier(supplierData);
    }
  };

  const openEditForm = (supplier: Supplier) => {
    setError(null); // Clear any previous errors
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
    setError(null); // Clear any errors when closing form
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your supplier information and relationships
          </p>
        </div>
      </div>

      {/* Supplier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Suppliers</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Truck className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{total}</div>
            <p className="text-xs text-purple-600">Total number of suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">Active Suppliers</CardTitle>
            <div className="p-2 rounded-lg bg-teal-500/10">
              <Truck className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{suppliers.filter(s => s.status === 'Active').length}</div>
            <p className="text-xs text-teal-600">Currently active suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Inactive Suppliers</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Truck className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{suppliers.filter(s => s.status === 'Inactive').length}</div>
            <p className="text-xs text-orange-600">Inactive suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Search and filter your supplier data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Search suppliers by name, contact person, email, phone, or address..."
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      setSearchTerm(searchInput);
                      setPage(1);
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <Button onClick={() => { setError(null); setIsFormOpen(true); }} className="flex-shrink-0 h-10">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
          <CardDescription>A list of your suppliers with search and pagination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('contactperson')}
                    >
                      Contact Person {getSortIcon('contactperson')}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      Email {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('phone')}
                    >
                      Phone {getSortIcon('phone')}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">Address</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id || supplier._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{supplier.name}</td>
                    <td className="p-3">{supplier.contactPerson}</td>
                    <td className="p-3 text-gray-600">{supplier.email}</td>
                    <td className="p-3">{supplier.phone}</td>
                    <td className="p-3 text-sm text-gray-600">{supplier.address}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditForm(supplier)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} suppliers</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    {/* Navigation controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={page <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        disabled={page >= totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <SupplierForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        supplier={editingSupplier || undefined}
      />
    </MainLayout>
  );
} 