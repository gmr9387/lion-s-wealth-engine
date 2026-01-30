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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Loader2 } from "lucide-react";

const tradelineSchema = z.object({
  creditorName: z
    .string()
    .trim()
    .min(1, "Creditor name is required")
    .max(100, "Name must be less than 100 characters"),
  accountType: z.string().min(1, "Account type is required"),
  creditLimit: z.coerce
    .number()
    .min(0, "Credit limit must be positive")
    .max(1000000, "Credit limit seems too high"),
  currentBalance: z.coerce
    .number()
    .min(0, "Balance must be positive")
    .max(1000000, "Balance seems too high"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  isNegative: z.boolean(),
  dateOpened: z.string().optional(),
  accountNumberMasked: z
    .string()
    .max(20, "Account number too long")
    .optional(),
  bureau: z.enum(["experian", "equifax", "transunion"]).optional(),
});

type TradelineFormData = z.infer<typeof tradelineSchema>;

interface TradelineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TradelineFormData) => Promise<void>;
}

const accountTypes = [
  "Credit Card",
  "Installment Loan",
  "Mortgage",
  "Auto Loan",
  "Student Loan",
  "Personal Loan",
  "Collection",
  "Other",
];

const paymentStatuses = [
  "Current",
  "30 Days Late",
  "60 Days Late",
  "90 Days Late",
  "120+ Days Late",
  "Charge Off",
  "In Collections",
  "Paid",
  "Closed",
];

export function TradelineForm({
  open,
  onOpenChange,
  onSubmit,
}: TradelineFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TradelineFormData>({
    resolver: zodResolver(tradelineSchema),
    defaultValues: {
      creditorName: "",
      accountType: "",
      creditLimit: 0,
      currentBalance: 0,
      paymentStatus: "Current",
      isNegative: false,
      dateOpened: "",
      accountNumberMasked: "",
    },
  });

  const isNegative = watch("isNegative");

  const handleFormSubmit = async (data: TradelineFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding tradeline:", error);
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
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Add Tradeline</DialogTitle>
          </div>
          <DialogDescription>
            Add a credit account from your credit report
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Creditor Name */}
          <div className="space-y-2">
            <Label htmlFor="creditorName">Creditor Name *</Label>
            <Input
              id="creditorName"
              placeholder="e.g., Capital One, Chase"
              {...register("creditorName")}
              className="bg-background"
            />
            {errors.creditorName && (
              <p className="text-xs text-destructive">
                {errors.creditorName.message}
              </p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type *</Label>
            <Select onValueChange={(value) => setValue("accountType", value)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-xs text-destructive">
                {errors.accountType.message}
              </p>
            )}
          </div>

          {/* Credit Limit & Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <Input
                id="creditLimit"
                type="number"
                placeholder="0"
                {...register("creditLimit")}
                className="bg-background"
              />
              {errors.creditLimit && (
                <p className="text-xs text-destructive">
                  {errors.creditLimit.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                type="number"
                placeholder="0"
                {...register("currentBalance")}
                className="bg-background"
              />
              {errors.currentBalance && (
                <p className="text-xs text-destructive">
                  {errors.currentBalance.message}
                </p>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status *</Label>
            <Select
              onValueChange={(value) => setValue("paymentStatus", value)}
              defaultValue="Current"
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bureau */}
          <div className="space-y-2">
            <Label htmlFor="bureau">Reporting Bureau</Label>
            <Select onValueChange={(value) => setValue("bureau", value as any)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select bureau (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Opened */}
          <div className="space-y-2">
            <Label htmlFor="dateOpened">Date Opened</Label>
            <Input
              id="dateOpened"
              type="date"
              {...register("dateOpened")}
              className="bg-background"
            />
          </div>

          {/* Account Number (masked) */}
          <div className="space-y-2">
            <Label htmlFor="accountNumberMasked">
              Account Number (last 4 digits)
            </Label>
            <Input
              id="accountNumberMasked"
              placeholder="xxxx1234"
              maxLength={8}
              {...register("accountNumberMasked")}
              className="bg-background"
            />
          </div>

          {/* Is Negative */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
            <div>
              <Label htmlFor="isNegative" className="cursor-pointer">
                Negative Item
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Mark if this account has derogatory marks
              </p>
            </div>
            <Switch
              id="isNegative"
              checked={isNegative}
              onCheckedChange={(checked) => setValue("isNegative", checked)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="premium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Tradeline"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
