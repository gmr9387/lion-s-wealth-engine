import { Gift } from "lucide-react";
import { ReferralSection } from "@/components/ReferralSection";

export function ReferralSettingsSection() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Referral Program</h2>
      </div>
      <ReferralSection />
    </div>
  );
}
