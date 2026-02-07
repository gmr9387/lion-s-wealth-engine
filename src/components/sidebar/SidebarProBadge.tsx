import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarProBadge() {
  return (
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
  );
}
