import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMfaStatus() {
  const [hasMfa, setHasMfa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<any[]>([]);

  const checkMfaStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;

      const verifiedFactors = data.totp.filter((f) => f.status === "verified");
      setFactors(verifiedFactors);
      setHasMfa(verifiedFactors.length > 0);
    } catch (error) {
      console.error("Error checking MFA status:", error);
      setHasMfa(false);
      setFactors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkMfaStatus();
  }, [checkMfaStatus]);

  const unenrollMfa = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      await checkMfaStatus();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    hasMfa,
    factors,
    loading,
    checkMfaStatus,
    unenrollMfa,
  };
}
