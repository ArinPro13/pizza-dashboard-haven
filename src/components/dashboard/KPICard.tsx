
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className,
}) => {
  const isPositive = trend !== undefined ? trend > 0 : undefined;
  
  return (
    <div className={cn(
      "kpi-card bg-white rounded-xl p-6 border", 
      className
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="h-9 w-9 flex items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-sm text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
