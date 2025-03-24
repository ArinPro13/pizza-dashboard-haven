
import React from "react";
import { NavLink } from "./NavLink";
import { BarChart2, Users, ShoppingBag, ClipboardList, Home } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Sales Analysis", path: "/sales", icon: BarChart2 },
    { name: "Customer Analysis", path: "/customers", icon: Users },
    { name: "Inventory", path: "/inventory", icon: ShoppingBag },
    { name: "Staff", path: "/staff", icon: ClipboardList },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white transition-transform duration-300 lg:translate-x-0 lg:border-r lg:bg-white/50 lg:backdrop-blur-xl ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-lg font-semibold">Pizza Admin</span>
        </div>
        <button
          type="button"
          className="ml-auto block lg:hidden rounded-sm opacity-70 hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
