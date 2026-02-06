import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileText, DollarSign, Activity, Target, Loader2 } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalDisputes: number;
  disputesThisMonth: number;
  activeDisputes: number;
  totalTradelines: number;
  avgScore: number | null;
  totalBusinessEntities: number;
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        { count: totalUsers },
        { count: newUsersThisMonth },
        { count: totalDisputes },
        { count: disputesThisMonth },
        { count: activeDisputes },
        { count: totalTradelines },
        { data: scoreData },
        { count: totalBusinessEntities },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
        supabase.from("disputes").select("*", { count: "exact", head: true }),
        supabase.from("disputes").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
        supabase.from("disputes").select("*", { count: "exact", head: true }).in("status", ["draft", "pending_review", "submitted"]),
        supabase.from("tradelines").select("*", { count: "exact", head: true }),
        supabase.from("score_history").select("score").order("recorded_at", { ascending: false }).limit(100),
        supabase.from("business_entities").select("*", { count: "exact", head: true }),
      ]);

      const avgScore = scoreData && scoreData.length > 0
        ? Math.round(scoreData.reduce((sum, s) => sum + s.score, 0) / scoreData.length)
        : null;

      setData({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalDisputes: totalDisputes || 0,
        disputesThisMonth: disputesThisMonth || 0,
        activeDisputes: activeDisputes || 0,
        totalTradelines: totalTradelines || 0,
        avgScore,
        totalBusinessEntities: totalBusinessEntities || 0,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Total Users",
      value: data.totalUsers,
      change: `+${data.newUsersThisMonth} this month`,
      icon: Users,
      iconColor: "text-primary",
    },
    {
      title: "Total Disputes",
      value: data.totalDisputes,
      change: `+${data.disputesThisMonth} this month`,
      icon: FileText,
      iconColor: "text-accent",
    },
    {
      title: "Active Disputes",
      value: data.activeDisputes,
      change: "In progress",
      icon: Activity,
      iconColor: "text-warning",
    },
    {
      title: "Avg Credit Score",
      value: data.avgScore || "N/A",
      change: "Across all users",
      icon: TrendingUp,
      iconColor: "text-success",
    },
    {
      title: "Tradelines Tracked",
      value: data.totalTradelines,
      change: "Total accounts",
      icon: Target,
      iconColor: "text-primary",
    },
    {
      title: "Business Entities",
      value: data.totalBusinessEntities,
      change: "Registered",
      icon: DollarSign,
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
