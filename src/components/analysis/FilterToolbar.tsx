
import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FilterToolbarProps {
  children: ReactNode;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({ children, className }) => {
  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className="p-4">
        <div className="filter-toolbar">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

interface FilterItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const FilterItem: React.FC<FilterItemProps> = ({ label, children, className }) => {
  return (
    <div className={cn("filter-item", className)}>
      <span className="filter-label">{label}</span>
      {children}
    </div>
  );
};
