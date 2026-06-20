import { LeadData } from "@/types/lead";

export function exportLeadsToCsv(leads: LeadData[], filename = "growthlead-leads.csv") {
  const headers = [
    "Name",
    "Category",
    "Address",
    "Phone",
    "Website",
    "Rating",
    "Review Count",
    "Has Website",
    "Growth Score",
    "Digital Presence Score",
    "Opportunity Score",
    "AI Insight",
  ];

  const escapeCsvField = (value: string | number | boolean | null): string => {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.category,
      lead.address,
      lead.phone,
      lead.website,
      lead.rating,
      lead.reviewCount,
      lead.hasWebsite,
      lead.growthScore,
      lead.digitalPresenceScore,
      lead.opportunityScore,
      lead.aiInsight,
    ]
      .map(escapeCsvField)
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}