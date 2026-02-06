import { usePlaidConnections } from "@/hooks/usePlaidConnections";
import { Building2, CreditCard, Wallet, Loader2, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaidAccountsListProps {
  className?: string;
}

const accountTypeIcons: Record<string, typeof CreditCard> = {
  depository: Wallet,
  credit: CreditCard,
  loan: Building2,
  investment: Building2,
};

export function PlaidAccountsList({ className }: PlaidAccountsListProps) {
  const { data: connections, isLoading, error } = usePlaidConnections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        Failed to load linked accounts.
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="text-center py-6">
        <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No linked accounts yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Link a bank account to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {connections.map((conn) => {
        const Icon = accountTypeIcons[conn.account_type || ""] || Building2;

        return (
          <div
            key={conn.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {conn.account_name || "Account"}
                </h4>
                {conn.account_mask && (
                  <span className="text-xs text-muted-foreground">
                    ••••{conn.account_mask}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {conn.institution_name && (
                  <span className="text-xs text-muted-foreground">
                    {conn.institution_name}
                  </span>
                )}
                {conn.account_subtype && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                    {conn.account_subtype}
                  </span>
                )}
              </div>
              {(conn.owner_name || conn.owner_email) && (
                <div className="flex items-center gap-3 mt-1.5">
                  {conn.owner_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {conn.owner_name}
                    </div>
                  )}
                  {conn.owner_email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {conn.owner_email}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                Active
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
