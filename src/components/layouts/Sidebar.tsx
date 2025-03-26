
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  FileText,
  ShoppingBag,
  FileSignature,
  Menu,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const sidebarLinks = [
    {
      icon: Home,
      text: "Kontrol Paneli",
      path: "/",
    },
    {
      icon: Users,
      text: "Müşteriler",
      path: "/customers",
    },
    {
      icon: Package,
      text: "Ürünler",
      path: "/products",
    },
    {
      icon: FileSignature,
      text: "Teklifler",
      path: "/proposals",
    },
    {
      icon: ShoppingCart,
      text: "Siparişler",
      path: "/orders",
    },
    {
      icon: ShoppingBag,
      text: "Satın Alma",
      path: "/purchases",
    },
    {
      icon: FileText,
      text: "Raporlar",
      path: "/reports",
    },
  ];

  return (
    <div className={cn("flex flex-col gap-4 py-4", isCollapsed ? "px-2" : "px-4")}>
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/" className="font-semibold text-lg">
            TEK.İF.
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 py-4">
        <nav className="flex flex-col gap-2">
          {sidebarLinks.map((link, index) => (
            <Link
              to={link.path}
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors",
                location.pathname === link.path ? "bg-secondary text-secondary-foreground" : ""
              )}
            >
              <link.icon className="h-5 w-5" />
              {!isCollapsed && <span>{link.text}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
