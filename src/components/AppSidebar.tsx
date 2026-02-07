import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import lweLogo from "@/assets/lwe-logo.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarProBadge } from "@/components/sidebar/SidebarProBadge";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
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
          {isOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
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

          <SidebarNavigation
            isAdmin={isAdmin}
            onItemClick={closeSidebar}
            onLogout={handleLogout}
          />

          <SidebarProBadge />
        </div>
      </aside>
    </>
  );
}
