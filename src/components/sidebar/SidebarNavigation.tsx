import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  TrendingUp,
  Target,
  Building2,
  Crown,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInboxNotifications } from "@/hooks/useInboxNotifications";

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

interface SidebarNavigationProps {
  isAdmin: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}

function NavItem({
  name,
  href,
  icon: Icon,
  isActive,
  onClick,
  variant = "default",
}: {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  isActive: boolean;
  onClick?: () => void;
  variant?: "default" | "admin";
}) {
  const activeClass = variant === "admin"
    ? "bg-warning/10 text-warning"
    : "bg-primary/10 text-primary";
  const inactiveClass = variant === "admin"
    ? "text-warning/70 hover:bg-warning/10 hover:text-warning"
    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground";

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive ? activeClass : inactiveClass
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-colors",
          isActive
            ? variant === "admin" ? "text-warning" : "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {name}
      {isActive && variant === "default" && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </Link>
  );
}

function NotificationNavItem({ onClick }: { onClick?: () => void }) {
  const location = useLocation();
  const { unreadCount } = useInboxNotifications();
  const isActive = location.pathname === "/app/notifications";

  return (
    <Link
      to="/app/notifications"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      <Bell
        className={cn(
          "h-5 w-5 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      Notifications
      {unreadCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1.5">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function SidebarNavigation({ isAdmin, onItemClick, onLogout }: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <>
      {/* Primary navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            {...item}
            isActive={location.pathname === item.href}
            onClick={onItemClick}
          />
        ))}

        {/* Notifications link with badge */}
        <NotificationNavItem onClick={onItemClick} />
      </nav>

      {/* Secondary & Admin navigation */}
      <div className="border-t border-border px-3 py-4">
        {secondaryNav.map((item) => (
          <NavItem
            key={item.name}
            {...item}
            isActive={location.pathname === item.href}
            onClick={onItemClick}
          />
        ))}

        {isAdmin &&
          adminNav.map((item) => (
            <NavItem
              key={item.name}
              {...item}
              isActive={location.pathname === item.href}
              onClick={onItemClick}
              variant="admin"
            />
          ))}

        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );
}
