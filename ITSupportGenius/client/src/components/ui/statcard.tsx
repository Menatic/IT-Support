import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({ title, value, change, icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <div className={`${iconColor}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.trend === "up" 
                      ? (title.includes("Time") ? "text-red-600" : "text-green-600")
                      : (title.includes("Time") ? "text-green-600" : "text-red-600")
                  }`}>
                    {change.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span className="ml-1">{change.value}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
