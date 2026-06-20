import { RawBusiness } from "@/types/business";

interface SearchParams {
  city: string;
  category: string;
}

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
}

interface GooglePlacesResponse {
  places?: GooglePlace[];
}

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.primaryTypeDisplayName",
].join(",");

export async function searchBusinesses({
  city,
  category,
}: SearchParams): Promise<RawBusiness[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: `${category} in ${city}`,
        maxResultCount: 20,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Google Places API error:", response.status, errorBody);
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data: GooglePlacesResponse = await response.json();
  const places = data.places ?? [];

  return places.map((place): RawBusiness => ({
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown Business",
    category: place.primaryTypeDisplayName?.text ?? category,
    address: place.formattedAddress ?? `${city}`,
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
  }));
}