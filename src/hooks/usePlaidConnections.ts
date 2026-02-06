import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlaidConnection {
  id: string;
  institution_name: string | null;
  institution_id: string | null;
  account_id: string | null;
  account_name: string | null;
  account_type: string | null;
  account_subtype: string | null;
  account_mask: string | null;
  owner_name: string | null;
  owner_email: string | null;
  status: string;
  created_at: string;
}

export function usePlaidConnections() {
  return useQuery({
    queryKey: ["plaid-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plaid_connections")
        .select(
          "id, institution_name, institution_id, account_id, account_name, account_type, account_subtype, account_mask, owner_name, owner_email, status, created_at"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlaidConnection[];
    },
  });
}
