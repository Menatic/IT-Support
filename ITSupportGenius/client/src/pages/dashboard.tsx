import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  TicketCheck, 
  Clock, 
  CheckCircle, 
  Zap, 
  ChevronDown, 
  Download, 
  ChartLine, 
  ChartPie 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/statcard";
import { SystemHealthCard } from "@/components/ui/system-health-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, SystemMetric } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState("7days");
  const { user } = useAuth();

  const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: systemMetrics, isLoading: isLoadingMetrics } = useQuery<SystemMetric[]>({
    queryKey: ["/api/system-metrics"],
  });

  // Calculate ticket stats
  const ticketStats = {
    total: tickets?.length || 0,
    open: tickets?.filter(t => t.status === "open" || t.status === "in_progress").length || 0,
    resolvedToday: tickets?.filter(t => 
      t.status === "resolved" && 
      t.resolvedAt && 
      new Date(t.resolvedAt).toDateString() === new Date().toDateString()
    ).length || 0,
    avgResponseTime: tickets?.length ? "3.2h" : "0h" // Would calculate from actual data in a real implementation
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingTickets ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Tickets"
              value={ticketStats.total}
              change={{ value: 12, trend: "up" }}
              icon={<TicketCheck className="h-5 w-5" />}
              iconBgColor="bg-primary bg-opacity-10"
              iconColor="text-primary"
            />
            <StatCard
              title="Open Tickets"
              value={ticketStats.open}
              change={{ value: 5, trend: "up" }}
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-warning bg-opacity-10"
              iconColor="text-warning"
            />
            <StatCard
              title="Resolved Today"
              value={ticketStats.resolvedToday}
              change={{ value: 18, trend: "up" }}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-secondary bg-opacity-10"
              iconColor="text-secondary"
            />
            <StatCard
              title="Avg. Response Time"
              value={ticketStats.avgResponseTime}
              change={{ value: 8, trend: "down" }}
              icon={<Zap className="h-5 w-5" />}
              iconBgColor="bg-accent bg-opacity-10"
              iconColor="text-accent"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ticket Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Ticket Activity</CardTitle>
            <p className="text-sm text-gray-500">Tickets created and resolved over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-400">
                <ChartLine className="h-16 w-16 mx-auto mb-2" />
                <p className="text-sm">Chart displaying ticket trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Ticket Categories</CardTitle>
            <p className="text-sm text-gray-500">Distribution of tickets by category</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-400">
                <ChartPie className="h-16 w-16 mx-auto mb-2" />
                <p className="text-sm">Chart displaying ticket category distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="px-6 py-5 flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Recent Tickets</CardTitle>
            <p className="text-sm text-gray-500">Latest support tickets submitted by users</p>
          </div>
          <Button variant="link" className="text-primary">
            View all tickets →
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-200 overflow-x-auto">
            {isLoadingTickets ? (
              <div className="p-8">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : tickets && tickets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.slice(0, 5).map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell className="text-sm text-gray-500">{ticket.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                            <div className="text-sm text-gray-500">{user?.department}</div>
                          </div>
                        </div>
                      </TableCell>
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
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="link" className="h-8 px-2 text-primary">View</Button>
                          {(user?.role === "admin" || user?.role === "agent") && (
                            <Button variant="link" className="h-8 px-2 text-green-600">Assign</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No tickets found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">System Health</CardTitle>
          <p className="text-sm text-gray-500">Current status of monitored systems</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingMetrics ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))
            ) : systemMetrics && systemMetrics.length > 0 ? (
              systemMetrics.map((metric) => (
                <SystemHealthCard
                  key={metric.id}
                  name={metric.systemName}
                  status={metric.status as "healthy" | "warning" | "critical"}
                  metrics={{
                    cpu: metric.cpuUsage,
                    memory: metric.memoryUsage,
                    disk: metric.diskUsage,
                  }}
                />
              ))
            ) : (
              <div className="col-span-3 p-8 text-center">
                <p className="text-gray-500">No system metrics available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
