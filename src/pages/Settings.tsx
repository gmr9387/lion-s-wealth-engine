import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  CreditCard,
  Lock,
  Save,
  Loader2,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useMfaStatus } from "@/hooks/useMfaStatus";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const { hasMfa, factors, loading: mfaLoading, checkMfaStatus, unenrollMfa } = useMfaStatus();
  const [disablingMfa, setDisablingMfa] = useState(false);
  const [notifications, setNotifications] = useState({
    scoreUpdates: true,
    disputeStatus: true,
    fundingOpportunities: true,
    actionReminders: true,
  });

  const {
    subscribed,
    tier,
    subscriptionEnd,
    loading: subscriptionLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    checkoutLoading,
    portalLoading,
  } = useSubscription();

  // Handle subscription success/cancel from URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get("subscription");
    if (subscriptionStatus === "success") {
      toast({
        title: "Subscription successful!",
        description: "Welcome to CWE-X! Your subscription is now active.",
      });
      checkSubscription();
    } else if (subscriptionStatus === "canceled") {
      toast({
        title: "Checkout canceled",
        description: "You can subscribe anytime from Settings.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch profile from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || user?.user_metadata?.full_name || "");
          setPhone(profileData.phone || "");
        } else {
          setFullName(user?.user_metadata?.full_name || "");
        }
      }
      
      setLoading(false);
    };
    
    fetchUserAndProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });

      if (authError) throw authError;

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Settings saved",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and security
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-background"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="pl-10 bg-background"
                maxLength={20}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} variant="premium">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Security Section */}
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
              <Button 
                variant="outline" 
                size="sm"
                disabled={disablingMfa}
                onClick={async () => {
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
                }}
              >
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

      {/* Notifications Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { 
              key: "scoreUpdates", 
              title: "Credit Score Updates", 
              description: "Get notified when your score changes" 
            },
            { 
              key: "disputeStatus", 
              title: "Dispute Status", 
              description: "Updates on your dispute progress" 
            },
            { 
              key: "fundingOpportunities", 
              title: "Funding Opportunities", 
              description: "New funding options available" 
            },
            { 
              key: "actionReminders", 
              title: "Action Reminders", 
              description: "Reminders for pending tasks" 
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSubscription}
            disabled={subscriptionLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${subscriptionLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {subscribed && tier && (
          <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-xl font-bold text-gradient-gold">
                  {SUBSCRIPTION_TIERS[tier].name}
                </p>
                {subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={openCustomerPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Manage
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SubscriptionCard
            tierKey="starter"
            currentTier={tier}
            onSubscribe={createCheckout}
            loading={checkoutLoading}
          />
          <SubscriptionCard
            tierKey="elite"
            currentTier={tier}
            onSubscribe={createCheckout}
            loading={checkoutLoading}
          />
        </div>
      </div>

      {/* Password Change Dialog */}
      <PasswordChangeDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />

      {/* Two-Factor Setup Dialog */}
      <TwoFactorSetup
        open={twoFactorDialogOpen}
        onOpenChange={setTwoFactorDialogOpen}
        onSuccess={checkMfaStatus}
      />
    </div>
  );
}
