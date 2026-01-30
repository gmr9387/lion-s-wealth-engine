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
import { TrendingUp, Loader2 } from "lucide-react";
import { useRecordScore } from "@/hooks/useTradelineActions";
import { CreditBureau } from "@/types";

const scoreSchema = z.object({
  score: z.coerce
    .number()
    .min(300, "Score must be at least 300")
    .max(850, "Score cannot exceed 850"),
  bureau: z.enum(["experian", "equifax", "transunion"], {
    required_error: "Please select a bureau",
  }),
});

type ScoreFormData = z.infer<typeof scoreSchema>;

interface ScoreInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreInputModal({ open, onOpenChange }: ScoreInputModalProps) {
  const [loading, setLoading] = useState(false);
  const recordScore = useRecordScore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      score: 600,
    },
  });

  const handleFormSubmit = async (data: ScoreFormData) => {
    setLoading(true);
    try {
      await recordScore.mutateAsync({
        score: data.score,
        bureau: data.bureau as CreditBureau,
        source: "manual",
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording score:", error);
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Record Score</DialogTitle>
          </div>
          <DialogDescription>
            Add your current credit score from any bureau
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

          {/* Score */}
          <div className="space-y-2">
            <Label htmlFor="score">Credit Score *</Label>
            <Input
              id="score"
              type="number"
              min={300}
              max={850}
              placeholder="300-850"
              {...register("score")}
              className="bg-background text-2xl font-bold text-center"
            />
            {errors.score && (
              <p className="text-xs text-destructive">{errors.score.message}</p>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Enter your score between 300 and 850
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
                  Saving...
                </>
              ) : (
                "Save Score"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
