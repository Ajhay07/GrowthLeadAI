"use client";

import { useState } from "react";
import { LeadData } from "@/types/lead";
import { OpportunityBadge } from "@/components/opportunity-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Globe, GlobeLock, Star, ArrowUpDown, Flame } from "lucide-react";
import { exportLeadsToCsv } from "@/lib/csv-export";

interface LeadTableProps {
  leads: LeadData[];
}

type SortKey = "opportunityScore" | "growthScore" | "rating" | "reviewCount";

export function LeadTable({ leads }: LeadTableProps) {
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("opportunityScore");

  const sortedLeads = [...leads].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return bVal - aVal;
  });

  function handleSort(key: SortKey) {
    setSortKey(key);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {leads.length} Lead{leads.length !== 1 ? "s" : ""} Found
          </h2>
          <p className="text-sm text-muted-foreground">
            Ranked by opportunity score, highest first
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportLeadsToCsv(leads)}
          disabled={leads.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Business</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Rating <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Digital Status</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("growthScore")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Growth <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("opportunityScore")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Opportunity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Insight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30 border-l-2"
                  style={{
                    borderLeftColor:
                      lead.opportunityScore >= 75
                        ? "#D4A24E"
                        : lead.opportunityScore >= 50
                        ? "#8A8F98"
                        : "transparent",
                  }}
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {lead.opportunityScore >= 85 && (
                        <Flame className="h-3.5 w-3.5 text-[#D4A24E] shrink-0" fill="#D4A24E" />
                      )}
                      <span className="font-semibold text-[0.925rem]">{lead.name}</span>
                    </div>
                    <div className="text-[0.8125rem] text-muted-foreground/80 mt-0.5">
                      {lead.category} · {lead.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                      {lead.rating?.toFixed(1) ?? "—"}
                      <span className="text-muted-foreground">
                        ({lead.reviewCount ?? 0})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.hasWebsite ? (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Has Site ({lead.digitalPresenceScore})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-dashed">
                        <GlobeLock className="h-3 w-3" />
                        No Website
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{lead.growthScore}</TableCell>
                  <TableCell>
                    <OpportunityBadge score={lead.opportunityScore} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedLead?.name}</DialogTitle>
            <DialogDescription>
              {selectedLead?.category} · {selectedLead?.address}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground mb-1">Growth</div>
                <div className="text-lg font-semibold">{selectedLead?.growthScore}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground mb-1">Digital</div>
                <div className="text-lg font-semibold">
                  {selectedLead?.digitalPresenceScore}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground mb-1">Opportunity</div>
                <div className="text-lg font-semibold text-amber-500">
                  {selectedLead?.opportunityScore}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1.5">AI Insight</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedLead?.aiInsight}
              </p>
            </div>
            {selectedLead?.website && (
              <p className="text-xs text-muted-foreground break-all">
                {selectedLead.website}
              </p>
            )}
            {selectedLead?.phone && (
              <p className="text-xs text-muted-foreground">{selectedLead.phone}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}