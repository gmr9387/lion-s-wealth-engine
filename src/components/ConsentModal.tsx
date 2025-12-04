import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle } from "lucide-react";
import { useCreateConsent, CONSENT_TEXTS } from "@/hooks/useConsent";

interface ConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consentType: keyof typeof CONSENT_TEXTS;
  title: string;
  description?: string;
  onConsent: (consentId: string) => void;
  onCancel?: () => void;
}

export function ConsentModal({
  open,
  onOpenChange,
  consentType,
  title,
  description,
  onConsent,
  onCancel,
}: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const createConsent = useCreateConsent();

  const consentText = CONSENT_TEXTS[consentType];

  const handleConsent = async () => {
    if (!agreed) return;

    setLoading(true);
    try {
      const consent = await createConsent.mutateAsync({
        consent_type: consentType,
        consent_text: consentText,
      });
      onConsent(consent.id);
      onOpenChange(false);
      setAgreed(false);
    } catch (error) {
      console.error("Consent error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAgreed(false);
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning banner for high-risk consent types */}
          {(consentType === "million_mode" || consentType === "funding_application") && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Important Notice</p>
                <p className="text-muted-foreground mt-1">
                  This action may result in hard inquiries on your credit report and could temporarily impact your credit score.
                </p>
              </div>
            </div>
          )}

          {/* Consent text */}
          <div className="rounded-lg border border-border bg-muted/50">
            <ScrollArea className="h-48 p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {consentText}
              </p>
            </ScrollArea>
          </div>

          {/* E-Sign agreement */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
            <Checkbox
              id="consent-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent-agree" className="text-sm cursor-pointer">
              I have read and agree to the terms above. I understand that by checking this box and clicking "Sign & Proceed", I am providing my electronic signature and consent.
            </Label>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground text-center">
            Electronic signature timestamp: {new Date().toLocaleString()}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="premium"
            onClick={handleConsent}
            disabled={!agreed || loading}
          >
            {loading ? "Processing..." : "Sign & Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
