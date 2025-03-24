
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = 
    to === "/" 
      ? location.pathname === "/" 
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`sidebar-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
