import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ChartBarStacked, 
  ChartPie,
  Calendar, 
  Download, 
  ChevronDown, 
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/statcard";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, User } from "@shared/schema";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Period = "7days" | "30days" | "3months" | "1year";

export default function Analytics() {
  const [period, setPeriod] = useState<Period>("30days");

  // Fetch tickets and users
  const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Calculate stats
  const stats = {
    totalTickets: tickets?.length || 0,
    avgResponseTime: tickets?.length ? "3.2h" : "0h",
    ticketsByStatus: {
      open: tickets?.filter(t => t.status === "open").length || 0,
      in_progress: tickets?.filter(t => t.status === "in_progress").length || 0,
      pending: tickets?.filter(t => t.status === "pending").length || 0,
      resolved: tickets?.filter(t => t.status === "resolved").length || 0,
      closed: tickets?.filter(t => t.status === "closed").length || 0,
    },
    ticketsByPriority: {
      low: tickets?.filter(t => t.priority === "low").length || 0,
      medium: tickets?.filter(t => t.priority === "medium").length || 0,
      high: tickets?.filter(t => t.priority === "high").length || 0,
      critical: tickets?.filter(t => t.priority === "critical").length || 0,
    },
    userStats: {
      total: users?.length || 0,
      agents: users?.filter(u => u.role === "agent").length || 0,
      employees: users?.filter(u => u.role === "employee").length || 0,
      resolution: {
        total: tickets?.filter(t => t.status === "resolved" || t.status === "closed").length || 0,
        previousTotal: 0, // Would be calculated from historical data
        percentChange: 12,
      }
    }
  };

  // Mock data for the charts (would be derived from actual data in production)
  const lineChartData = [
    { name: "Mon", created: 12, resolved: 8 },
    { name: "Tue", created: 19, resolved: 12 },
    { name: "Wed", created: 15, resolved: 17 },
    { name: "Thu", created: 21, resolved: 18 },
    { name: "Fri", created: 18, resolved: 24 },
    { name: "Sat", created: 9, resolved: 10 },
    { name: "Sun", created: 5, resolved: 7 },
  ];

  const categoryData = [
    { name: "Hardware", value: 25 },
    { name: "Software", value: 40 },
    { name: "Network", value: 15 },
    { name: "Email", value: 10 },
    { name: "Access", value: 8 },
    { name: "Other", value: 2 },
  ];

  const topAgentsData = [
    { name: "John Smith", role: "Agent", resolved: 48, percentChange: 5, trend: "up" },
    { name: "Maria Garcia", role: "Agent", resolved: 42, percentChange: 8, trend: "up" },
    { name: "Alex Kumar", role: "Admin", resolved: 37, percentChange: 3, trend: "down" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-3">
          <Select value={period} onValueChange={(val) => setPeriod(val as Period)}>
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

      {/* Summary Stats */}
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
              value={stats.totalTickets}
              change={{ value: 12, trend: "up" }}
              icon={<ChartBarStacked className="h-5 w-5" />}
              iconBgColor="bg-primary bg-opacity-10"
              iconColor="text-primary"
            />
            <StatCard
              title="Average Response Time"
              value={stats.avgResponseTime}
              change={{ value: 8, trend: "down" }}
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-warning bg-opacity-10"
              iconColor="text-warning"
            />
            <StatCard
              title="Resolution Rate"
              value={`${Math.round((stats.ticketsByStatus.resolved / Math.max(stats.totalTickets, 1)) * 100)}%`}
              change={{ value: 5, trend: "up" }}
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-secondary bg-opacity-10"
              iconColor="text-secondary"
            />
            <StatCard
              title="User Satisfaction"
              value="92%"
              change={{ value: 3, trend: "up" }}
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-accent bg-opacity-10"
              iconColor="text-accent"
            />
          </>
        )}
      </div>

      {/* Main Metrics */}
      <Tabs defaultValue="ticketMetrics">
        <TabsList className="mb-4">
          <TabsTrigger value="ticketMetrics">Ticket Metrics</TabsTrigger>
          <TabsTrigger value="userMetrics">User Metrics</TabsTrigger>
          <TabsTrigger value="performanceMetrics">Performance</TabsTrigger>
        </TabsList>

        {/* Ticket Metrics Tab */}
        <TabsContent value="ticketMetrics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Ticket Activity Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Ticket Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingTickets ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#3B82F6" 
                        activeDot={{ r: 8 }} 
                        name="Created" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#10B981" 
                        name="Resolved" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Ticket Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Ticket Category Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingTickets ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] flex flex-col justify-center">
                    {categoryData.map((category, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">{category.value}%</span>
                        </div>
                        <Progress value={category.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ticket Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Ticket Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatusCard 
                  title="Open" 
                  count={stats.ticketsByStatus.open} 
                  icon={<Circle className="h-4 w-4 text-yellow-500" />} 
                  color="bg-yellow-100" 
                />
                <StatusCard 
                  title="In Progress" 
                  count={stats.ticketsByStatus.in_progress} 
                  icon={<ArrowRight className="h-4 w-4 text-blue-500" />} 
                  color="bg-blue-100" 
                />
                <StatusCard 
                  title="Pending" 
                  count={stats.ticketsByStatus.pending} 
                  icon={<Clock className="h-4 w-4 text-orange-500" />} 
                  color="bg-orange-100" 
                />
                <StatusCard 
                  title="Resolved" 
                  count={stats.ticketsByStatus.resolved} 
                  icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
                  color="bg-green-100" 
                />
                <StatusCard 
                  title="Closed" 
                  count={stats.ticketsByStatus.closed} 
                  icon={<AlertCircle className="h-4 w-4 text-gray-500" />} 
                  color="bg-gray-100" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Ticket Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <PriorityCard 
                  title="Critical" 
                  count={stats.ticketsByPriority.critical} 
                  percentage={Math.round((stats.ticketsByPriority.critical / Math.max(stats.totalTickets, 1)) * 100)} 
                  color="bg-purple-100" 
                  progressColor="bg-purple-500"
                />
                <PriorityCard 
                  title="High" 
                  count={stats.ticketsByPriority.high} 
                  percentage={Math.round((stats.ticketsByPriority.high / Math.max(stats.totalTickets, 1)) * 100)} 
                  color="bg-red-100" 
                  progressColor="bg-red-500"
                />
                <PriorityCard 
                  title="Medium" 
                  count={stats.ticketsByPriority.medium} 
                  percentage={Math.round((stats.ticketsByPriority.medium / Math.max(stats.totalTickets, 1)) * 100)} 
                  color="bg-yellow-100" 
                  progressColor="bg-yellow-500"
                />
                <PriorityCard 
                  title="Low" 
                  count={stats.ticketsByPriority.low} 
                  percentage={Math.round((stats.ticketsByPriority.low / Math.max(stats.totalTickets, 1)) * 100)} 
                  color="bg-green-100" 
                  progressColor="bg-green-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Metrics Tab */}
        <TabsContent value="userMetrics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary">{stats.userStats.total}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Users</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.userStats.agents}</div>
                        <div className="text-sm text-gray-600 mt-1">Support Agents</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.userStats.employees}</div>
                        <div className="text-sm text-gray-600 mt-1">Employees</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performing Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Top Performing Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAgentsData.map((agent, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.role}</TableCell>
                        <TableCell>{agent.resolved}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {agent.trend === "up" ? 
                              <ArrowUp className="h-4 w-4 text-green-500 mr-1" /> : 
                              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                            }
                            <span className={agent.trend === "up" ? "text-green-600" : "text-red-600"}>
                              {agent.percentChange}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Resolution By Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Ticket Resolution By Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ChartPie className="h-16 w-16 mx-auto mb-2" />
                  <p className="text-sm">Department resolution statistics would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performanceMetrics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Response Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ChartBarStacked className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm">Response time trend analysis would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Time by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Resolution Time by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Calendar className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm">Category resolution time analysis would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">SLA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SlaCard title="Critical Issues" percentage={94} target={95} />
                  <SlaCard title="High Priority" percentage={98} target={90} />
                  <SlaCard title="Medium & Low" percentage={100} target={85} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

function StatusCard({ title, count, icon, color }: StatusCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <div className="flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
  );
}

interface PriorityCardProps {
  title: string;
  count: number;
  percentage: number;
  color: string;
  progressColor: string;
}

function PriorityCard({ title, count, percentage, color, progressColor }: PriorityCardProps) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{title}</span>
        <Badge>{count}</Badge>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={progressColor} />
      <div className="text-xs text-gray-500 mt-2 text-right">{percentage}% of total</div>
    </div>
  );
}

interface SlaCardProps {
  title: string;
  percentage: number;
  target: number;
}

function SlaCard({ title, percentage, target }: SlaCardProps) {
  const isOnTarget = percentage >= target;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="flex items-end space-x-2">
        <div className="text-2xl font-bold">{percentage}%</div>
        <div className="text-sm text-gray-500">of {target}% target</div>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 mt-2" 
        indicatorClassName={isOnTarget ? "bg-green-500" : "bg-red-500"} 
      />
      <div className="flex items-center mt-2">
        {isOnTarget ? (
          <Badge className="bg-green-100 text-green-800">On Target</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800">Below Target</Badge>
        )}
      </div>
    </div>
  );
}
