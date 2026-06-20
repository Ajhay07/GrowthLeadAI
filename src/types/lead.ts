export interface AuditDetails {
  hasSSL: boolean;
  hasMobileViewport: boolean;
  loadTimeMs: number | null;
  hasAnalytics: boolean;
  hasSocialLinks: boolean;
  statusCode: number | null;
  error?: string;
}

export interface LeadData {
  id: string;
  searchId: string;
  placeId: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  hasWebsite: boolean;
  websiteQualityScore: number | null;
  growthScore: number;
  digitalPresenceScore: number;
  opportunityScore: number;
  aiInsight: string | null;
  auditDetails: AuditDetails | null;
  createdAt: Date;
}

export interface SearchInput {
  city: string;
  category: string;
}