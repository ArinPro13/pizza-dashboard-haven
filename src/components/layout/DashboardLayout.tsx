
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MenuIcon, X } from "lucide-react";
import PageTransition from "./PageTransition";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/90 backdrop-blur-sm px-4 md:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
