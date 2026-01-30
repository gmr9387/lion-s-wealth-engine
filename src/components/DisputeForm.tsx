import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import { Tradeline } from "@/hooks/useTradelines";

const disputeSchema = z.object({
  tradelineId: z.string().optional(),
  bureau: z.enum(["experian", "equifax", "transunion"], {
    required_error: "Please select a bureau",
  }),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide a detailed reason (at least 10 characters)")
    .max(500, "Reason must be less than 500 characters"),
  disputeType: z.string().min(1, "Please select a dispute type"),
});

export type DisputeFormData = z.infer<typeof disputeSchema>;

interface DisputeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DisputeFormData) => Promise<void>;
  tradelines?: Tradeline[];
  preselectedTradeline?: Tradeline;
}

const disputeTypes = [
  { value: "not_mine", label: "Account Not Mine" },
  { value: "inaccurate_balance", label: "Inaccurate Balance" },
  { value: "inaccurate_status", label: "Inaccurate Payment Status" },
  { value: "inaccurate_dates", label: "Incorrect Dates" },
  { value: "duplicate_account", label: "Duplicate Account" },
  { value: "identity_theft", label: "Identity Theft / Fraud" },
  { value: "paid_collection", label: "Paid Collection Still Showing" },
  { value: "goodwill", label: "Goodwill Removal Request" },
  { value: "other", label: "Other (Specify)" },
];

export function DisputeForm({
  open,
  onOpenChange,
  onSubmit,
  tradelines = [],
  preselectedTradeline,
}: DisputeFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      tradelineId: preselectedTradeline?.id || "",
      bureau: undefined,
      reason: "",
      disputeType: "",
    },
  });

  const selectedType = watch("disputeType");

  const handleFormSubmit = async (data: DisputeFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">New Dispute</DialogTitle>
          </div>
          <DialogDescription>
            Create an FCRA-compliant dispute letter
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Consent Required</p>
            <p className="text-muted-foreground mt-1">
              You will need to provide e-signature consent before submission.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Select Tradeline (if available) */}
          {tradelines.length > 0 && (
            <div className="space-y-2">
              <Label>Account to Dispute</Label>
              <Select
                onValueChange={(value) => setValue("tradelineId", value)}
                defaultValue={preselectedTradeline?.id}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an account (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {tradelines.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.creditorName} - ${t.currentBalance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bureau */}
          <div className="space-y-2">
            <Label>Credit Bureau *</Label>
            <Select
              onValueChange={(value) =>
                setValue("bureau", value as "experian" | "equifax" | "transunion")
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select bureau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
            {errors.bureau && (
              <p className="text-xs text-destructive">{errors.bureau.message}</p>
            )}
          </div>

          {/* Dispute Type */}
          <div className="space-y-2">
            <Label>Dispute Type *</Label>
            <Select onValueChange={(value) => setValue("disputeType", value)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select dispute reason" />
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.disputeType && (
              <p className="text-xs text-destructive">
                {errors.disputeType.message}
              </p>
            )}
          </div>

          {/* Detailed Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Detailed Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Provide specific details about why this item is inaccurate or should be removed..."
              rows={4}
              {...register("reason")}
              className="bg-background resize-none"
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Be specific. Include dates, amounts, and any relevant details.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="premium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Dispute"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
