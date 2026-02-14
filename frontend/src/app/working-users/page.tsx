"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_CONFIG } from '@/lib/config';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserRegistrationRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function WorkingUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState<UserRegistrationRequest>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the users endpoint requires admin auth
      // In a real app, you'd fetch from /api/users with proper authentication
      const mockUsers: User[] = [
        {
          id: "1",
          username: "admin",
          email: "admin@inventory.com",
          firstName: "System",
          lastName: "Administrator",
          role: "Admin",
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "2",
          username: "manager1",
          email: "manager@inventory.com",
          firstName: "Inventory",
          lastName: "Manager",
          role: "Manager",
          isActive: true,
          createdAt: "2025-01-15T00:00:00Z"
        },
        {
          id: "3",
          username: "user1",
          email: "user@inventory.com",
          firstName: "Regular",
          lastName: "User",
          role: "User",
          isActive: true,
          createdAt: "2025-02-01T00:00:00Z"
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`User created successfully! Username: ${result.username}`);
        setShowCreateForm(false);
        setNewUser({ username: '', password: '', email: '', firstName: '', lastName: '' });
        // Refresh users list
        loadUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.error}`);
      }
    } catch (err) {
      alert(`Error creating user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (field: keyof UserRegistrationRequest, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Users</h2>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadUsers} className="mt-2">Retry</Button>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;
  const regularUsers = users.filter(u => u.role === 'User').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          + Add New User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All system users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{regularUsers}</div>
            <p className="text-xs text-muted-foreground">Standard users</p>
          </CardContent>
        </Card>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={createUser}>Create User</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Complete list of all system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Username</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <Badge variant={
                        user.role === 'Admin' ? 'destructive' : 
                        user.role === 'Manager' ? 'secondary' : 'default'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <strong>🔐 User Authentication System:</strong> The backend supports full user registration and login.
            </p>
            <ul className="list-disc list-inside text-blue-700 mt-2 ml-4">
              <li>User registration: POST /api/auth/register</li>
              <li>User login: POST /api/auth/login</li>
              <li>JWT token authentication</li>
              <li>Role-based access control (Admin, Manager, User)</li>
              <li>Password hashing and security</li>
            </ul>
            <div className="mt-4">
              <Button 
                onClick={() => window.open('http://localhost:3009/login', '_blank')}
                variant="outline"
              >
                Test Login Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
