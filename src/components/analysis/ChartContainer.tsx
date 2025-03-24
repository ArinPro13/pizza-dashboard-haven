
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  className,
  action,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
};
