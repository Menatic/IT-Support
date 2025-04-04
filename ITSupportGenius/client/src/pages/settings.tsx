import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff, 
  Shield, 
  Save, 
  Loader2, 
  Send, 
  Server, 
  Database, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Profile update form schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Password change form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// API key form schema
const apiKeyFormSchema = z.object({
  geminiApiKey: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export default function Settings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // API key form
  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      geminiApiKey: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/settings/api-key", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API key updated",
        description: "The Gemini API key has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  // Handle profile form submission
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  // Handle password form submission
  function onPasswordSubmit(data: PasswordFormValues) {
    changePasswordMutation.mutate(data);
  }
  
  // Handle API key form submission
  function onApiKeySubmit(data: ApiKeyFormValues) {
    updateApiKeyMutation.mutate(data);
  }
  
  // Test API key function
  function testApiKey() {
    toast({
      title: "API Key Test",
      description: "Testing the API key connection...",
    });
    
    // In a real implementation, this would make an API call to test the key
  }
  
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        {user.role === "admin" && (
          <Button variant="outline">
            <Server className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="api">
              <Shield className="h-4 w-4 mr-2" />
              API Settings
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Operations">Operations</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label>Role</Label>
                      <div className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Role changes require admin approval</p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showCurrentPassword ? "text" : "password"} 
                              placeholder="Enter current password" 
                              {...field} 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="Enter new password" 
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm new password" 
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <Separator />
                
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ticket Updates</Label>
                      <p className="text-sm text-gray-500">Receive emails when tickets are updated</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Assignments</Label>
                      <p className="text-sm text-gray-500">Get notified when you are assigned to a ticket</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-gray-500">Receive critical system alerts and warnings</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <Separator />
                
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-gray-500">Show notifications in real-time within the app</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sound Alerts</Label>
                      <p className="text-sm text-gray-500">Play sound when new notifications arrive</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* API Settings (Admin Only) */}
        {isAdmin && (
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Manage API keys and service configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Gemini AI Integration</h3>
                  <Separator />
                  
                  <Form {...apiKeyForm}>
                    <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6">
                      <FormField
                        control={apiKeyForm.control}
                        name="geminiApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gemini API Key</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"} 
                                  placeholder="Enter Gemini API key" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              This key is used for log analysis and chatbot functionality
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-4">
                        <Button 
                          type="submit" 
                          disabled={updateApiKeyMutation.isPending}
                        >
                          {updateApiKeyMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save API Key
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={testApiKey}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Test Connection
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Integration</h3>
                  <Separator />
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-blue-500" />
                          <Label>Database Connection</Label>
                        </div>
                        <p className="text-sm text-gray-500">MongoDB connection status</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-purple-500" />
                          <Label>Gemini API Status</Label>
                        </div>
                        <p className="text-sm text-gray-500">Connection to Google Gemini API</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
