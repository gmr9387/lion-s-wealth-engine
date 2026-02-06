import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  TrendingUp,
  Target,
  Building2,
  Settings,
  LogOut,
  Shield,
  Zap,
  Crown,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Credit Report", href: "/app/credit", icon: CreditCard },
  { name: "Disputes", href: "/app/disputes", icon: FileText },
  { name: "Wealth Plan", href: "/app/wealth", icon: TrendingUp },
  { name: "Funding Timeline", href: "/app/funding", icon: Target },
  { name: "Million Mode", href: "/app/million-mode", icon: Crown },
  { name: "Business", href: "/app/business", icon: Building2 },
];

const secondaryNav = [
  { name: "Settings", href: "/app/settings", icon: Settings },
];

const adminNav = [
  { name: "Admin", href: "/app/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-sidebar flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img src={lweLogo} alt="LWE" className="h-8 w-8 object-cover" />
          </div>
          <span className="text-lg font-bold text-gradient-gold">LWE</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
              <img src={lweLogo} alt="Lion's Wealth Engine" className="h-9 w-9 object-cover" />
            </div>
            <div>
              <span className="text-xl font-bold text-gradient-gold">Lion's Wealth Engine</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Credit • Wealth • Funding
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Nav */}
          <div className="border-t border-border px-3 py-4">
            {secondaryNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin Nav - Only visible to admins */}
            {isAdmin && adminNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-warning/10 text-warning"
                      : "text-warning/70 hover:bg-warning/10 hover:text-warning"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>

          {/* Pro Badge - Hidden on mobile for space */}
          <div className="hidden lg:block border-t border-border p-4">
            <div className="rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Elite Member</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock advanced features and higher credit limits
              </p>
              <Button variant="premium" size="sm" className="w-full">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
