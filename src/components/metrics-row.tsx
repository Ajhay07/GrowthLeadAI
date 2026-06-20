import { LeadData } from "@/types/lead";
import { TrendingUp, Target, GlobeLock, Users } from "lucide-react";

interface MetricsRowProps {
  leads: LeadData[];
}

export function MetricsRow({ leads }: MetricsRowProps) {
  const total = leads.length;
  const avgOpportunity = total
    ? Math.round(leads.reduce((sum, l) => sum + l.opportunityScore, 0) / total)
    : 0;
  const highPriority = leads.filter((l) => l.opportunityScore >= 75).length;
  const noWebsite = leads.filter((l) => !l.hasWebsite).length;

  const metrics = [
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      color: "#8A8F98",
    },
    {
      label: "Avg Opportunity",
      value: avgOpportunity,
      icon: TrendingUp,
      color: "#D4A24E",
    },
    {
      label: "High Priority",
      value: highPriority,
      icon: Target,
      color: "#C45B4E",
    },
    {
      label: "No Website",
      value: noWebsite,
      icon: GlobeLock,
      color: "#6B8E76",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
          >
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${metric.color}1A` }}
            >
              <Icon className="h-4.5 w-4.5" style={{ color: metric.color }} />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight leading-none">
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metric.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}