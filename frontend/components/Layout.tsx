import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Squads", href: "/squads", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Leave", href: "/leave", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Audit", href: "/audit", icon: Shield },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Squad Attendance</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
