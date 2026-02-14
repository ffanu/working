"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Truck,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Receipt,
  LogOut,
  User,
  Building2,
  FolderOpen,
  Building,
  Warehouse,
  Store,
  CreditCard,
} from "lucide-react";

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, color: "text-blue-500" },
    { name: "Categories", href: "/categories", icon: FolderOpen, color: "text-amber-500" },
    { name: "Products", href: "/products", icon: Package, color: "text-purple-500" },
    { name: "Suppliers", href: "/suppliers", icon: Truck, color: "text-orange-500" },
    { name: "Customers", href: "/customers", icon: UserCheck, color: "text-pink-500" },
    { name: "Warehouses", href: "/warehouses", icon: Building2, color: "text-indigo-500" },
    { name: "Shops", href: "/shops", icon: Building, color: "text-cyan-500" },
    { name: "Purchases", href: "/purchases", icon: TrendingDown, color: "text-red-500" },
    { name: "Sales", href: "/sales", icon: TrendingUp, color: "text-green-500" },
    { name: "Installment Sales", href: "/installment-sales", icon: CreditCard, color: "text-blue-600" },
    { name: "Warehouse-wise Stocks", href: "/warehouse-wise-stocks", icon: Warehouse, color: "text-slate-500" },
    { name: "Shop-wise Stocks", href: "/shop-wise-stocks", icon: Store, color: "text-teal-500" },
    { name: "Transfer Orders", href: "/transfer-orders", icon: Activity, color: "text-violet-500" },
    { name: "Supplier Ledger", href: "/suppliers/ledger", icon: Receipt, color: "text-lime-500" },
    { name: "Customer Ledger", href: "/customers/ledger", icon: Receipt, color: "text-rose-500" },
    { name: "Refunds & Returns", href: "/refunds", icon: Receipt, color: "text-yellow-500" },
    { name: "Cash Register", href: "/cash-register", icon: BarChart3, color: "text-emerald-500" },
    { name: "Users", href: "/users", icon: Users, color: "text-fuchsia-500" },
    { name: "Settings", href: "/settings", icon: Settings, color: "text-gray-500" },
  ];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-semibold text-gray-900">Inventory App</h1>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          <Link
            href="/login"
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <User className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500 transition-all duration-200" />
            Login
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold text-gray-900">Inventory App</h1>
      </div>
      
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role} • {user?.username}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200",
                  isActive ? "text-teal-500" : item.color
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 transition-all duration-200" />
          Logout
        </button>
      </div>
    </div>
  );
} 