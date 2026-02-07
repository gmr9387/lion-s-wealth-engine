import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2 } from "lucide-react";
import { useCreateDispute } from "@/hooks/useDisputes";
import { CreditBureau } from "@/types";

interface DisputeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function DisputeStep({ onNext, onSkip }: DisputeStepProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ creditorName: "", reason: "", bureau: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createDispute = useCreateDispute();

  const handleSubmit = async () => {
    if (!data.creditorName || !data.reason || !data.bureau) {
      setErrors({
        creditorName: !data.creditorName ? "Required" : "",
        reason: !data.reason ? "Required" : "",
        bureau: !data.bureau ? "Required" : "",
      });
      return;
    }

    setLoading(true);
    try {
      await createDispute.mutateAsync({
        bureau: data.bureau as CreditBureau,
        reason: data.reason,
      });
      onNext();
    } catch (error) {
      console.error("Error creating dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Create Your First Dispute</h2>
        <p className="text-sm text-muted-foreground">Target a negative item on your report</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Creditor Name</Label>
          <Input
            placeholder="e.g., Capital One, Collection Agency"
            value={data.creditorName}
            onChange={(e) => setData({ ...data, creditorName: e.target.value })}
            className="bg-background"
          />
          {errors.creditorName && <p className="text-xs text-destructive">{errors.creditorName}</p>}
        </div>

        <div className="space-y-2">
          <Label>Bureau</Label>
          <Select value={data.bureau} onValueChange={(v) => setData({ ...data, bureau: v })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select bureau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="experian">Experian</SelectItem>
              <SelectItem value="equifax">Equifax</SelectItem>
              <SelectItem value="transunion">TransUnion</SelectItem>
            </SelectContent>
          </Select>
          {errors.bureau && <p className="text-xs text-destructive">{errors.bureau}</p>}
        </div>

        <div className="space-y-2">
          <Label>Dispute Reason</Label>
          <Select value={data.reason} onValueChange={(v) => setData({ ...data, reason: v })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_my_account">Not My Account</SelectItem>
              <SelectItem value="incorrect_balance">Incorrect Balance</SelectItem>
              <SelectItem value="incorrect_payment_history">Incorrect Payment History</SelectItem>
              <SelectItem value="account_closed">Account Should Show Closed</SelectItem>
              <SelectItem value="duplicate_account">Duplicate Account</SelectItem>
              <SelectItem value="outdated_information">Outdated Information</SelectItem>
            </SelectContent>
          </Select>
          {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={onSkip}>
          Skip for Now
        </Button>
        <Button variant="premium" size="lg" className="flex-1" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Dispute"}
        </Button>
      </div>
    </div>
  );
}
