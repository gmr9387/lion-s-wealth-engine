import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomeStreamsProps {
  strategies: Record<string, any>;
}

const defaultStreams = [
  {
    name: "Gig Economy",
    type: "active",
    potential: "$1,000 - $3,000/mo",
    status: "active",
    description: "DoorDash, Uber, TaskRabbit",
  },
  {
    name: "Freelance Services",
    type: "active",
    potential: "$500 - $2,000/mo",
    status: "recommended",
    description: "Skills-based services on Fiverr, Upwork",
  },
  {
    name: "Reselling",
    type: "semi-passive",
    potential: "$300 - $1,500/mo",
    status: "recommended",
    description: "Amazon FBA, eBay arbitrage",
  },
  {
    name: "Content Creation",
    type: "passive",
    potential: "$0 - $5,000/mo",
    status: "future",
    description: "YouTube, TikTok, blogging",
  },
  {
    name: "Dividend Income",
    type: "passive",
    potential: "Variable",
    status: "future",
    description: "Stock dividends, REITs",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  recommended: "bg-primary/10 text-primary border-primary/30",
  future: "bg-muted text-muted-foreground border-border",
};

export function IncomeStreams({ strategies }: IncomeStreamsProps) {
  const streams = (strategies?.income_sources as typeof defaultStreams) || defaultStreams;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Income Stream Opportunities</h2>
        <Button variant="glow" size="sm">
          Add Income Stream
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-4 transition-all hover:shadow-md",
              statusColors[stream.status] || statusColors.future
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-foreground">{stream.name}</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded capitalize",
                stream.type === "active" ? "bg-primary/20 text-primary" :
                stream.type === "semi-passive" ? "bg-accent/20 text-accent" :
                "bg-success/20 text-success"
              )}>
                {stream.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
            <p className="text-sm font-medium text-success">{stream.potential}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
