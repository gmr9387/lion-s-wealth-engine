import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Consent, ConsentInsert } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useConsents() {
  return useQuery({
    queryKey: ["consents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("consents")
        .select("*")
        .eq("user_id", user.id)
        .order("signed_at", { ascending: false });

      if (error) throw error;
      return data as Consent[];
    },
  });
}

export function useLatestConsent(consentType: string) {
  return useQuery({
    queryKey: ["consent", "latest", consentType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("consents")
        .select("*")
        .eq("user_id", user.id)
        .eq("consent_type", consentType)
        .order("signed_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as Consent | null;
    },
  });
}

export function useCreateConsent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consent: Omit<ConsentInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("consents")
        .insert({ 
          ...consent, 
          user_id: user.id,
          ip_address: null, // Would be captured server-side in production
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;
      return data as Consent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast({ title: "Consent recorded" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Consent text templates
export const CONSENT_TEXTS = {
  credit_dispute: `I hereby authorize Lion's Wealth Engine to submit credit disputes on my behalf to the credit bureaus (Experian, Equifax, TransUnion). I understand that:

1. This action may affect my credit file
2. I am providing truthful and accurate information
3. The dispute will be submitted using my personal information
4. Results may take 30-45 days to process
5. I have reviewed the dispute details and agree to proceed

By signing, I acknowledge that I have read and agree to these terms.`,

  credit_pull: `I authorize Lion's Wealth Engine to obtain my credit report from one or more credit bureaus for the purpose of credit analysis and recommendations. I understand that:

1. This may result in a soft or hard inquiry on my credit file
2. Hard inquiries may temporarily impact my credit score
3. My credit information will be used solely for the stated purpose
4. I can revoke this authorization at any time for future pulls

By signing, I authorize this credit inquiry.`,

  funding_application: `I authorize Lion's Wealth Engine to submit funding applications on my behalf to financial institutions. I understand that:

1. Applications may result in hard credit inquiries
2. I am responsible for any approved credit products
3. My information will be shared with potential lenders
4. I am providing accurate income and financial information
5. Approval is not guaranteed

By signing, I authorize these funding applications.`,

  million_mode: `I authorize Lion's Wealth Engine to execute the Million Mode funding sequence on my behalf. I understand that:

1. Multiple credit applications will be submitted
2. Multiple hard inquiries will occur within a short timeframe
3. This strategy carries increased risk
4. I have reviewed the proposed sequence and timing
5. I accept responsibility for any approved credit products
6. Results will vary based on my credit profile

This is an advanced strategy that requires careful consideration.

By signing, I authorize the Million Mode execution.`,
};
