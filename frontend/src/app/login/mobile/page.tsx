'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileCard, MobileCardContent, MobileCardDescription, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileInput } from '@/components/ui/mobile-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { API_CONFIG } from '@/lib/config';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function MobileLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { isMobile, isIOS, isAndroid } = useMobile();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Use auth context to login
        login(data.accessToken, data.refreshToken, data.user);
        
        setSuccess("Login successful! Redirecting...");
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!registerForm.username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    
    if (registerForm.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      setLoading(false);
      return;
    }
    
    if (!registerForm.password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    
    if (registerForm.password.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    if (!registerForm.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Registration successful! You can now login.");
        
        // Clear form and switch to login
        setTimeout(() => {
          setRegisterForm({
            username: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
          });
          setIsLogin(true);
          setSuccess(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          setError(`Validation errors: ${errorMessages.join(', ')}`);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError(`Registration failed (${response.status}). Please try again.`);
        }
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (isLogin) {
      setLoginForm(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inventory Manager
          </h1>
          <p className="text-sm text-gray-600 px-2">
            {isLogin ? "Welcome back! Please sign in to your account." : "Create your account to get started."}
          </p>
        </div>

        {/* Auth Card */}
        <MobileCard className="shadow-xl border-0 mx-2" variant="elevated">
          <MobileCardHeader className="text-center pb-4">
            <MobileCardTitle>
              {isLogin ? "Sign In" : "Create Account"}
            </MobileCardTitle>
            <MobileCardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Fill in the details to create your account"
              }
            </MobileCardDescription>
          </MobileCardHeader>
          
          <MobileCardContent>
            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 text-sm">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <MobileInput
                  label="Username"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                />

                <MobileInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  required
                  autoComplete="current-password"
                />

                <MobileButton 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                  loading={loading}
                  size="lg"
                >
                  {!loading && (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </MobileButton>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <MobileInput
                    label="First Name"
                    placeholder="First name"
                    value={registerForm.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                  <MobileInput
                    label="Last Name"
                    placeholder="Last name"
                    value={registerForm.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>

                <MobileInput
                  label="Username"
                  placeholder="Choose a username"
                  value={registerForm.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                />

                <MobileInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                />

                <MobileInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={registerForm.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  required
                  autoComplete="new-password"
                />

                <MobileButton 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={loading}
                  loading={loading}
                  size="lg"
                >
                  {!loading && (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </MobileButton>
              </form>
            )}

            {/* Toggle Form Type */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            {isLogin && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Admin:</strong> admin / admin123</p>
                  <p><strong>User:</strong> demo / demo123</p>
                </div>
              </div>
            )}
          </MobileCardContent>
        </MobileCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 Inventory Manager. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

