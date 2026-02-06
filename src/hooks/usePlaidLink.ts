import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PlaidAccount {
  account_id: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  account_mask: string;
  institution_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
}

interface PlaidLinkState {
  loading: boolean;
  linkToken: string | null;
  error: string | null;
}

export function usePlaidLink() {
  const [state, setState] = useState<PlaidLinkState>({
    loading: false,
    linkToken: null,
    error: null,
  });
  const queryClient = useQueryClient();

  const createLinkToken = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke("plaid-link-token", {
        method: "POST",
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setState((s) => ({ ...s, linkToken: data.link_token, loading: false }));
      return data.link_token as string;
    } catch (err: any) {
      const message = err.message || "Failed to initialize bank link";
      setState((s) => ({ ...s, error: message, loading: false }));
      toast({
        title: "Connection Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const exchangeToken = useCallback(
    async (
      publicToken: string,
      institution: { name: string; institution_id: string } | null
    ): Promise<PlaidAccount[] | null> => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const { data, error } = await supabase.functions.invoke("plaid-exchange-token", {
          method: "POST",
          body: { public_token: publicToken, institution },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["plaid-connections"] });

        setState((s) => ({ ...s, loading: false }));

        toast({
          title: "Account Linked!",
          description: `Successfully connected ${data.accounts_linked} account(s) from ${institution?.name || "your bank"}.`,
        });

        return data.accounts as PlaidAccount[];
      } catch (err: any) {
        const message = err.message || "Failed to link account";
        setState((s) => ({ ...s, error: message, loading: false }));
        toast({
          title: "Link Failed",
          description: message,
          variant: "destructive",
        });
        return null;
      }
    },
    [queryClient]
  );

  return {
    ...state,
    createLinkToken,
    exchangeToken,
  };
}
