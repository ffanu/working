'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { 
  Shield, 
  User, 
  Users, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

export interface UserRole {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  permissions: string[];
}

interface RoleBasedAccessProps {
  className?: string;
}

export function RoleBasedAccess({ className = '' }: RoleBasedAccessProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });

  // Sample data
  useEffect(() => {
    const samplePermissions: Permission[] = [
      { id: '1', name: 'View Dashboard', description: 'Access to view dashboard and basic analytics', resource: 'dashboard', action: 'read' },
      { id: '2', name: 'Manage Products', description: 'Create, edit, and delete products', resource: 'products', action: 'write' },
      { id: '3', name: 'View Products', description: 'View product information only', resource: 'products', action: 'read' },
      { id: '4', name: 'Manage Sales', description: 'Create and manage sales orders', resource: 'sales', action: 'write' },
      { id: '5', name: 'View Sales', description: 'View sales information only', resource: 'sales', action: 'read' },
      { id: '6', name: 'Manage Purchases', description: 'Create and manage purchase orders', resource: 'purchases', action: 'write' },
      { id: '7', name: 'View Purchases', description: 'View purchase information only', resource: 'purchases', action: 'read' },
      { id: '8', name: 'Manage Customers', description: 'Create and manage customer records', resource: 'customers', action: 'write' },
      { id: '9', name: 'View Customers', description: 'View customer information only', resource: 'customers', action: 'read' },
      { id: '10', name: 'Manage Suppliers', description: 'Create and manage supplier records', resource: 'suppliers', action: 'write' },
      { id: '11', name: 'View Suppliers', description: 'View supplier information only', resource: 'suppliers', action: 'read' },
      { id: '12', name: 'Manage Users', description: 'Create and manage user accounts', resource: 'users', action: 'write' },
      { id: '13', name: 'View Users', description: 'View user information only', resource: 'users', action: 'read' },
      { id: '14', name: 'System Settings', description: 'Access to system configuration', resource: 'settings', action: 'write' },
      { id: '15', name: 'View Reports', description: 'Access to advanced analytics and reports', resource: 'reports', action: 'read' },
      { id: '16', name: 'Export Data', description: 'Export data to various formats', resource: 'data', action: 'export' }
    ];

    const sampleRoles: Role[] = [
      {
        id: '1',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: samplePermissions.map(p => p.id),
        userCount: 2,
        isSystem: true
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Can manage products, sales, and customers',
        permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '15', '16'],
        userCount: 5,
        isSystem: false
      },
      {
        id: '3',
        name: 'Sales Staff',
        description: 'Can manage sales and view products',
        permissions: ['1', '3', '4', '5', '9', '15'],
        userCount: 8,
        isSystem: false
      },
      {
        id: '4',
        name: 'Inventory Staff',
        description: 'Can manage products and purchases',
        permissions: ['1', '2', '3', '6', '7', '10', '11', '15'],
        userCount: 6,
        isSystem: false
      },
      {
        id: '5',
        name: 'Viewer',
        description: 'Read-only access to basic information',
        permissions: ['1', '3', '5', '7', '9', '11', '15'],
        userCount: 12,
        isSystem: false
      }
    ];

    const sampleUsers: UserRole[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@company.com',
        role: 'Super Admin',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        permissions: samplePermissions.map(p => p.id)
      },
      {
        id: '2',
        username: 'manager1',
        email: 'manager1@company.com',
        role: 'Manager',
        status: 'active',
        lastLogin: '2024-01-15T09:15:00Z',
        permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '15', '16']
      },
      {
        id: '3',
        username: 'sales1',
        email: 'sales1@company.com',
        role: 'Sales Staff',
        status: 'active',
        lastLogin: '2024-01-15T08:45:00Z',
        permissions: ['1', '3', '4', '5', '9', '15']
      }
    ];

    setPermissions(samplePermissions);
    setRoles(sampleRoles);
    setUsers(sampleUsers);
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(false);
  };

  const handleEditRole = () => {
    setIsEditing(true);
  };

  const handleSaveRole = () => {
    if (selectedRole) {
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? selectedRole : r));
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original role data
    const originalRole = roles.find(r => r.id === selectedRole?.id);
    if (originalRole) setSelectedRole(originalRole);
  };

  const handleAddRole = () => {
    if (newRole.name && newRole.description) {
      const role: Role = {
        id: Date.now().toString(),
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        userCount: 0,
        isSystem: false
      };
      setRoles(prev => [...prev, role]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowAddRole(false);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
    }
  };

  const togglePermission = (permissionId: string) => {
    if (selectedRole) {
      const newPermissions = selectedRole.permissions.includes(permissionId)
        ? selectedRole.permissions.filter(p => p !== permissionId)
        : [...selectedRole.permissions, permissionId];
      
      setSelectedRole({ ...selectedRole, permissions: newPermissions });
    }
  };

  const getPermissionColor = (permission: string) => {
    const perm = permissions.find(p => p.id === permission);
    if (!perm) return 'bg-gray-100 text-gray-800';
    
    switch (perm.resource) {
      case 'dashboard': return 'bg-blue-100 text-blue-800';
      case 'products': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'purchases': return 'bg-orange-100 text-orange-800';
      case 'customers': return 'bg-indigo-100 text-indigo-800';
      case 'suppliers': return 'bg-pink-100 text-pink-800';
      case 'users': return 'bg-red-100 text-red-800';
      case 'settings': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Button onClick={() => setShowAddRole(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Roles
              </CardTitle>
              <CardDescription>Select a role to manage permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {role.userCount} users
                          </Badge>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!role.isSystem && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRole();
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Details & Permissions */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {selectedRole.name}
                    </CardTitle>
                    <CardDescription>{selectedRole.description}</CardDescription>
                  </div>
                  {!selectedRole.isSystem && (
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSaveRole} size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit} size="sm">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleEditRole} size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-center space-x-2 p-2 rounded border ${
                            selectedRole.permissions.includes(permission.id)
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            disabled={!isEditing || selectedRole.isSystem}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {permission.description}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPermissionColor(permission.id)}`}
                          >
                            {permission.resource}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Users with this Role</h4>
                    <div className="space-y-2">
                      {users
                        .filter(user => user.role === selectedRole.name)
                        .map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm text-gray-900">{user.username}</div>
                              <div className="text-xs text-gray-600">{user.email}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              {user.lastLogin && (
                                <span className="text-xs text-gray-500">
                                  Last: {new Date(user.lastLogin).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-600">Choose a role from the list to view and manage its permissions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Role</CardTitle>
              <CardDescription>Create a new role with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Sales Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Brief description of the role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRole({
                              ...newRole,
                              permissions: [...newRole.permissions, permission.id]
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: newRole.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddRole(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole}>
                  Create Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

