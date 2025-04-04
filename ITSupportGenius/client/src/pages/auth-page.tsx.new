import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle, User, KeyRound, Mail, Building, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // If user is already logged in, redirect to homepage
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Handle login form submission
  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const loginData = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };
    loginMutation.mutate(loginData);
  }

  // Handle registration form submission
  function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const registerData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };
    
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    registerMutation.mutate(registerData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left side - Authentication forms */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
              <CheckCircle className="mr-2 h-8 w-8 text-primary" />
              IT Support AIOps
            </h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to access the support platform</p>
          </div>

          <Card>
            <CardHeader>
              <div className="mb-4">
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button 
                    variant={tab === "login" ? "default" : "outline"}
                    onClick={() => setTab("login")}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    variant={tab === "register" ? "default" : "outline"}
                    onClick={() => setTab("register")}
                    className="w-full"
                  >
                    Register
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="login-username" className="block text-sm font-medium">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input 
                        id="login-username" 
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input 
                        id="login-password" 
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="register-username" className="block text-sm font-medium">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input 
                        id="register-username" 
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-email" className="block text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input 
                        id="register-email" 
                        name="email"
                        type="text"
                        placeholder="your.email@company.com"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-name" className="block text-sm font-medium">Full Name</label>
                    <input 
                      id="register-name" 
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="register-role" className="block text-sm font-medium">Role</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <select 
                          id="register-role" 
                          name="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="employee"
                        >
                          <option value="employee">Employee</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="register-department" className="block text-sm font-medium">Department</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <select 
                          id="register-department" 
                          name="department"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="IT"
                        >
                          <option value="IT">IT</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-password" className="block text-sm font-medium">Password</label>
                    <input 
                      id="register-password" 
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium">Confirm Password</label>
                    <input 
                      id="register-confirm-password" 
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      minLength={6}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-primary">
        <div className="flex flex-col justify-center px-8 py-12 text-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">IT Support AIOps Platform</h2>
            <p className="text-lg mb-8">
              Streamline your IT support with AI-powered tools for faster issue resolution.
            </p>
            
            <div className="space-y-6">
              <FeatureItem icon={<TicketIcon />} title="Intelligent Ticketing">
                Create, track, and resolve support tickets with ease
              </FeatureItem>
              
              <FeatureItem icon={<AnalysisIcon />} title="AI Log Analysis">
                Automatically detect anomalies in system logs
              </FeatureItem>
              
              <FeatureItem icon={<ChatIcon />} title="AI Support Chatbot">
                Get immediate help from our AI assistant
              </FeatureItem>
              
              <FeatureItem icon={<DashboardIcon />} title="Analytics Dashboard">
                Gain insights with detailed support metrics
              </FeatureItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ 
  icon, 
  title, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-md p-3">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="mt-1 text-white text-opacity-80">{children}</p>
      </div>
    </div>
  );
}

// Feature icons
function TicketIcon() {
  return <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>;
}

function AnalysisIcon() {
  return <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>;
}

function ChatIcon() {
  return <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>;
}

function DashboardIcon() {
  return <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>;
}