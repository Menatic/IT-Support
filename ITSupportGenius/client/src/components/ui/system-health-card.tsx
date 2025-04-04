import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SystemHealthCardProps {
  name: string;
  status: "healthy" | "warning" | "critical";
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export function SystemHealthCard({ name, status, metrics }: SystemHealthCardProps) {
  // Determine status color
  const statusColors = {
    healthy: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800",
  };

  // Determine progress bar colors based on usage
  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-primary";
    if (value < 75) return "bg-warning";
    return "bg-error";
  };

  return (
    <Card className="bg-gray-50 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-medium text-gray-900">{name}</h4>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">CPU Usage</span>
              <span className="text-gray-700 font-medium">{metrics.cpu}%</span>
            </div>
            <Progress value={metrics.cpu} className="h-2 bg-gray-200" indicatorClassName={getProgressColor(metrics.cpu)} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Memory Usage</span>
              <span className="text-gray-700 font-medium">{metrics.memory}%</span>
            </div>
            <Progress value={metrics.memory} className="h-2 bg-gray-200" indicatorClassName={getProgressColor(metrics.memory)} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Disk Space</span>
              <span className="text-gray-700 font-medium">{metrics.disk}%</span>
            </div>
            <Progress value={metrics.disk} className="h-2 bg-gray-200" indicatorClassName={getProgressColor(metrics.disk)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
