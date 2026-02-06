import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, Share2, Users, Gift, CheckCircle2, Loader2 } from "lucide-react";

export function ReferralSection() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Count referrals
      if (profile?.referral_code) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("referred_by", profile.referral_code);

        setReferralCount(count || 0);
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = `LWE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("user_id", user.id);

      if (error) throw error;

      setReferralCode(code);
      toast({
        title: "Referral code generated!",
        description: "Share your code to earn rewards.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (!referralCode) return;
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  const shareCode = async () => {
    if (!referralCode) return;
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Lion's Wealth Engine",
          text: "Start your AI-guided credit optimization journey!",
          url: referralLink,
        });
      } catch {
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!referralCode ? (
        <div className="text-center py-6">
          <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start Earning Referral Rewards
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Generate your unique referral code and share it with friends. 
            Earn rewards for every person who joins.
          </p>
          <Button variant="premium" onClick={generateReferralCode} disabled={generating}>
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Gift className="w-4 h-4 mr-2" />
            )}
            Generate Referral Code
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{referralCount}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{referralCount}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-background font-mono text-center text-lg tracking-wider"
              />
              <Button variant="outline" size="icon" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/auth?ref=${referralCode}`}
                readOnly
                className="bg-background text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <Button variant="premium" className="w-full" onClick={shareCode}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Link
          </Button>
        </>
      )}
    </div>
  );
}
