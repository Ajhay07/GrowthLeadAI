import { RawBusiness } from "@/types/business";
import { AuditDetails } from "@/types/lead";

export interface ScoreResult {
  growthScore: number;
  digitalPresenceScore: number;
  opportunityScore: number;
  websiteQualityScore: number | null;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Growth Score: proxy for "this business is doing well offline."
 * Rating contributes up to 60 points, review count (log-scaled,
 * diminishing returns) contributes up to 40 points.
 */
function calculateGrowthScore(business: RawBusiness): number {
  const ratingComponent = (business.rating / 5) * 60;

  // log scale so 50 reviews and 2000 reviews aren't 40x apart in score
  const reviewComponent =
    Math.min(Math.log10(business.reviewCount + 1) / Math.log10(1000), 1) * 40;

  return Math.round(clamp(ratingComponent + reviewComponent));
}

/**
 * Website Quality Score: only meaningful if a website exists.
 * Each signal contributes a fixed point value, summing to 100.
 */
function calculateWebsiteQualityScore(audit: AuditDetails): number | null {
  if (audit.error === "no_website") return null;

  // Site exists but failed to load at all -> treat as very low quality,
  // not "no website", since it's a real (broken) digital presence.
  if (audit.statusCode === null) return 5;

  let score = 0;
  if (audit.hasSSL) score += 25;
  if (audit.hasMobileViewport) score += 25;
  if (audit.hasAnalytics) score += 20;
  if (audit.hasSocialLinks) score += 15;

  // load time: full marks under 1s, tapering to 0 by 5s
  if (audit.loadTimeMs !== null) {
    const loadScore = clamp(15 * (1 - (audit.loadTimeMs - 1000) / 4000), 0, 15);
    score += loadScore;
  }

  return Math.round(clamp(score));
}

/**
 * Digital Presence Score: 0 if no website at all (or dead link).
 * Otherwise mirrors website quality score directly.
 */
function calculateDigitalPresenceScore(
  websiteQualityScore: number | null
): number {
  if (websiteQualityScore === null) return 0;
  return websiteQualityScore;
}

/**
 * Opportunity Score: the core ranking metric.
 * Rewards the GAP between high growth and low digital presence,
 * not either score in isolation.
 */
function calculateOpportunityScore(
  growthScore: number,
  digitalPresenceScore: number
): number {
  const gap = growthScore - digitalPresenceScore;

  // Base score weights growth heavily (a struggling business with no
  // website is a low-value lead), then adds a bonus proportional to gap.
  const base = growthScore * 0.5;
  const gapBonus = clamp(gap, 0, 100) * 0.5;

  return Math.round(clamp(base + gapBonus));
}

export function calculateScores(
  business: RawBusiness,
  audit: AuditDetails
): ScoreResult {
  const growthScore = calculateGrowthScore(business);
  const websiteQualityScore = calculateWebsiteQualityScore(audit);
  const digitalPresenceScore = calculateDigitalPresenceScore(websiteQualityScore);
  const opportunityScore = calculateOpportunityScore(
    growthScore,
    digitalPresenceScore
  );

  return {
    growthScore,
    digitalPresenceScore,
    opportunityScore,
    websiteQualityScore,
  };
}