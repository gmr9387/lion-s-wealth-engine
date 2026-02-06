import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Zap, Lock, ArrowRight, Loader2, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number");

export default function ResetPassword() {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user arrived via password reset link (has access_token in URL hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      setMode("update");
    }

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setErrors({ password: result.error.errors[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been reset successfully.",
      });
      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {mode === "request" && !sent && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Reset Your Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 bg-card border-border ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" variant="premium" size="xl" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Sign In
              </Link>
            </div>
          </>
        )}

        {mode === "request" && sent && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive it? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
            <Link to="/auth">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        )}

        {mode === "update" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
              <p className="text-muted-foreground mt-2">
                Choose a strong password for your account
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 h-12 bg-card border-border ${errors.password ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 h-12 bg-card border-border ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" variant="premium" size="xl" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
