import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Link2, ExternalLink } from "lucide-react";
import { usePlaidLink } from "@/hooks/usePlaidLink";
import { cn } from "@/lib/utils";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "premium" | "outline" | "glow";
  size?: "default" | "sm" | "lg";
}

declare global {
  interface Window {
    Plaid?: {
      create: (config: any) => { open: () => void; destroy: () => void };
    };
  }
}

export function PlaidLinkButton({
  onSuccess,
  className,
  variant = "premium",
  size = "default",
}: PlaidLinkButtonProps) {
  const { loading, createLinkToken, exchangeToken } = usePlaidLink();
  const [plaidReady, setPlaidReady] = useState(false);

  // Load Plaid Link SDK
  useEffect(() => {
    if (window.Plaid) {
      setPlaidReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => setPlaidReady(true);
    script.onerror = () => console.error("Failed to load Plaid Link SDK");
    document.head.appendChild(script);

    return () => {
      // Don't remove — other components may use it
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!plaidReady || !window.Plaid) return;

    const linkToken = await createLinkToken();
    if (!linkToken) return;

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (publicToken: string, metadata: any) => {
        const institution = metadata?.institution
          ? {
              name: metadata.institution.name,
              institution_id: metadata.institution.institution_id,
            }
          : null;

        await exchangeToken(publicToken, institution);
        onSuccess?.();
        handler.destroy();
      },
      onExit: (err: any) => {
        if (err) {
          console.warn("Plaid Link exited with error:", err);
        }
        handler.destroy();
      },
      onEvent: (eventName: string) => {
        console.log("Plaid event:", eventName);
      },
    });

    handler.open();
  }, [plaidReady, createLinkToken, exchangeToken, onSuccess]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || !plaidReady}
      className={cn("gap-2", className)}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Building2 className="w-4 h-4" />
          Link Bank Account
        </>
      )}
    </Button>
  );
}
