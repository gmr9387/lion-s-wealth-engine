import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { LinkedAccountsSection } from "@/components/settings/LinkedAccountsSection";
import { ReferralSettingsSection } from "@/components/settings/ReferralSettingsSection";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  notification_preferences: {
    scoreUpdates: boolean;
    disputeStatus: boolean;
    fundingOpportunities: boolean;
    actionReminders: boolean;
  } | null;
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData as unknown as Profile);
        }
      }

      setLoading(false);
    };

    fetchUserAndProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your account preferences and security
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="w-fit">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <ProfileSection
        user={user}
        initialName={profile?.full_name || user.user_metadata?.full_name || ""}
        initialPhone={profile?.phone || ""}
      />

      <SecuritySection />

      <NotificationSection
        userId={user.id}
        initialPreferences={profile?.notification_preferences ?? null}
      />

      <SubscriptionSection />

      <LinkedAccountsSection />

      <ReferralSettingsSection />
    </div>
  );
}
