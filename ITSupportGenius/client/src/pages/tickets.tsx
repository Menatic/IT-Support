import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Filter, 
  Search, 
  Loader2,
  ArrowDownUp,
  MoreVertical,
  MessageSquare,
  History,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Ticket, InsertTicket, insertTicketSchema, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Tickets() {
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tickets based on current tab
  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets", currentTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentTab !== "all") {
        params.append("status", currentTab);
      }
      
      const response = await fetch(`/api/tickets?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      
      return response.json();
    },
  });
  
  // Fetch users for assignee selection (admin only)
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: InsertTicket) => {
      const res = await apiRequest("POST", "/api/tickets", ticketData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Ticket created",
        description: "Your ticket has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTicket> }) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setIsUpdateDialogOpen(false);
      setSelectedTicket(null);
      toast({
        title: "Ticket updated",
        description: "The ticket has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create ticket form schema
  const createTicketFormSchema = insertTicketSchema.omit({
    requesterId: true,
    assigneeId: true,
  });
  
  type CreateTicketFormValues = z.infer<typeof createTicketFormSchema>;
  
  // Create ticket form
  const createForm = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "Software",
      status: "open",
    },
  });
  
  // Update ticket form schema
  const updateTicketFormSchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    assigneeId: z.number().optional().nullable(),
    description: z.string().optional(),
  });
  
  type UpdateTicketFormValues = z.infer<typeof updateTicketFormSchema>;
  
  // Update ticket form
  const updateForm = useForm<UpdateTicketFormValues>({
    resolver: zodResolver(updateTicketFormSchema),
    defaultValues: {
      status: selectedTicket?.status,
      priority: selectedTicket?.priority,
      assigneeId: selectedTicket?.assigneeId,
      description: selectedTicket?.description,
    },
  });
  
  // Reset update form when selected ticket changes
  useState(() => {
    if (selectedTicket) {
      updateForm.reset({
        status: selectedTicket.status,
        priority: selectedTicket.priority,
        assigneeId: selectedTicket.assigneeId,
        description: selectedTicket.description,
      });
    }
  });
  
  // Create ticket submit handler
  const onCreateSubmit = (data: CreateTicketFormValues) => {
    if (!user) return;
    
    createTicketMutation.mutate({
      ...data,
      requesterId: user.id,
    });
  };
  
  // Update ticket submit handler
  const onUpdateSubmit = (data: UpdateTicketFormValues) => {
    if (!selectedTicket) return;
    
    updateTicketMutation.mutate({
      id: selectedTicket.id,
      data,
    });
  };
  
  // Filter tickets by search query
  const filteredTickets = tickets?.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format priority badge
  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
      critical: "bg-purple-100 text-purple-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };
  
  // Format status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      pending: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>View and manage support tickets</CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search tickets..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            
            <TabsContent value={currentTab} className="m-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredTickets && filteredTickets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Title</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {ticket.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(ticket.priority)}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>{format(new Date(ticket.createdAt), "MMM d, h:mm a")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setIsUpdateDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Update
                              </DropdownMenuItem>
                              {(user?.role === "admin" || user?.role === "agent") && (
                                <>
                                  <DropdownMenuItem>
                                    <History className="mr-2 h-4 w-4" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Close Ticket
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No tickets found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Submit a new support ticket to get help with your issue.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed explanation of the issue" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Access">Access</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Update Ticket Dialog */}
      {selectedTicket && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Update Ticket #{selectedTicket.id}</DialogTitle>
              <DialogDescription>
                {selectedTicket.title}
              </DialogDescription>
            </DialogHeader>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 py-2">
                <FormField
                  control={updateForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Update the ticket description" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add additional details or updates to this ticket.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Only show status and priority fields to agents and admins */}
                {(user?.role === "admin" || user?.role === "agent") && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Only show assignee field to admins */}
                {user?.role === "admin" && (
                  <FormField
                    control={updateForm.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent to assign" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            <SelectGroup>
                              <SelectLabel>Agents</SelectLabel>
                              {users?.filter(u => u.role === "agent" || u.role === "admin").map((agent) => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateTicketMutation.isPending}>
                    {updateTicketMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Ticket"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
