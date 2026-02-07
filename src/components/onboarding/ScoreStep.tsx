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
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useRecordScore } from "@/hooks/useTradelineActions";
import { CreditBureau } from "@/types";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.coerce.number().min(300).max(850),
  bureau: z.enum(["experian", "equifax", "transunion"]),
});

interface ScoreStepProps {
  onNext: () => void;
}

export function ScoreStep({ onNext }: ScoreStepProps) {
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState({ score: "", bureau: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const recordScore = useRecordScore();

  const handleSubmit = async () => {
    setErrors({});
    const result = scoreSchema.safeParse({
      score: scoreData.score,
      bureau: scoreData.bureau,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await recordScore.mutateAsync({
        score: result.data.score,
        bureau: result.data.bureau as CreditBureau,
        source: "onboarding",
      });
      onNext();
    } catch (error) {
      console.error("Error recording score:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Add Your Credit Score</h2>
        <p className="text-sm text-muted-foreground">This helps us calculate your funding potential</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Credit Bureau</Label>
          <Select value={scoreData.bureau} onValueChange={(v) => setScoreData({ ...scoreData, bureau: v })}>
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
          <Label>Credit Score</Label>
          <Input
            type="number"
            min={300}
            max={850}
            placeholder="Enter your score (300-850)"
            value={scoreData.score}
            onChange={(e) => setScoreData({ ...scoreData, score: e.target.value })}
            className="bg-background text-xl font-semibold text-center"
          />
          {errors.score && <p className="text-xs text-destructive">{errors.score}</p>}
        </div>
      </div>

      <Button variant="premium" size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
      </Button>
    </div>
  );
}
