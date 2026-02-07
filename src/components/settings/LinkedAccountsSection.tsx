import { Building2 } from "lucide-react";
import { PlaidLinkButton } from "@/components/PlaidLinkButton";
import { PlaidAccountsList } from "@/components/PlaidAccountsList";

export function LinkedAccountsSection() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Linked Bank Accounts</h2>
        </div>
        <PlaidLinkButton size="sm" variant="premium" />
      </div>
      <PlaidAccountsList />
    </div>
  );
}
