import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useMfaStatus } from "@/hooks/useMfaStatus";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

export function SecuritySection() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const { hasMfa, factors, loading: mfaLoading, checkMfaStatus, unenrollMfa } = useMfaStatus();
  const [disablingMfa, setDisablingMfa] = useState(false);

  const handleDisableMfa = async () => {
    if (factors[0]?.id) {
      setDisablingMfa(true);
      const result = await unenrollMfa(factors[0].id);
      setDisablingMfa(false);
      if (result.success) {
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been removed from your account.",
        });
      } else {
        toast({
          title: "Failed to disable 2FA",
          description: result.error,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {hasMfa ? (
                <ShieldCheck className="w-5 h-5 text-success" />
              ) : (
                <Shield className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {hasMfa ? "Your account is protected with 2FA" : "Add an extra layer of security"}
                </p>
              </div>
            </div>
            {mfaLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : hasMfa ? (
              <Button variant="outline" size="sm" disabled={disablingMfa} onClick={handleDisableMfa}>
                {disablingMfa ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4 mr-1" />
                    Disable
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setTwoFactorDialogOpen(true)}>
                Enable
              </Button>
            )}
          </div>
        </div>
      </div>

      <PasswordChangeDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
      <TwoFactorSetup
        open={twoFactorDialogOpen}
        onOpenChange={setTwoFactorDialogOpen}
        onSuccess={checkMfaStatus}
      />
    </>
  );
}
