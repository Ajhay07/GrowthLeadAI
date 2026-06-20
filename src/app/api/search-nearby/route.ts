import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchBusinessesNearby } from "@/lib/services/places-nearby";
import { auditWebsite } from "@/lib/services/audit";
import { calculateScores } from "@/lib/services/scoring";
import { generateInsight } from "@/lib/services/ai-insight";
import { RawBusiness } from "@/types/business";
import { LeadData } from "@/types/lead";

interface NearbyRequestBody {
  lat: number;
  lng: number;
  radiusMeters: number;
  category: string;
}

async function processBusiness(
  business: RawBusiness,
  searchId: string
): Promise<LeadData | null> {
  try {
    const audit = await auditWebsite(business.website);
    const scores = calculateScores(business, audit);
    const aiInsight = await generateInsight(business, audit, scores);

    const saved = await db.lead.create({
      data: {
        searchId,
        placeId: business.placeId,
        name: business.name,
        category: business.category,
        address: business.address,
        phone: business.phone,
        website: business.website,
        rating: business.rating,
        reviewCount: business.reviewCount,
        hasWebsite: !!business.website,
        websiteQualityScore: scores.websiteQualityScore,
        growthScore: scores.growthScore,
        digitalPresenceScore: scores.digitalPresenceScore,
        opportunityScore: scores.opportunityScore,
        aiInsight,
        auditDetails: JSON.stringify(audit),
      },
    });

    return {
      id: saved.id,
      searchId: saved.searchId,
      placeId: saved.placeId,
      name: saved.name,
      category: saved.category,
      address: saved.address,
      phone: saved.phone,
      website: saved.website,
      rating: saved.rating,
      reviewCount: saved.reviewCount,
      hasWebsite: saved.hasWebsite,
      websiteQualityScore: saved.websiteQualityScore,
      growthScore: saved.growthScore,
      digitalPresenceScore: saved.digitalPresenceScore,
      opportunityScore: saved.opportunityScore,
      aiInsight: saved.aiInsight,
      auditDetails: audit,
      createdAt: saved.createdAt,
    };
  } catch (err) {
    console.error(`Failed to process business ${business.name}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: NearbyRequestBody = await req.json();
    const { lat, lng, radiusMeters, category } = body;

    if (lat === undefined || lng === undefined || !category?.trim()) {
      return NextResponse.json(
        { error: "Location and category are required." },
        { status: 400 }
      );
    }

    const search = await db.search.create({
      data: { city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, category: category.trim() },
    });

    const businesses = await searchBusinessesNearby({
      lat,
      lng,
      radiusMeters: radiusMeters || 3000,
      category,
    });

    const results = await Promise.all(
      businesses.map((business) => processBusiness(business, search.id))
    );

    const leads = results
      .filter((lead): lead is LeadData => lead !== null)
      .sort((a, b) => b.opportunityScore - a.opportunityScore);

    return NextResponse.json({ searchId: search.id, leads });
  } catch (err) {
    console.error("Nearby search pipeline failed:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}