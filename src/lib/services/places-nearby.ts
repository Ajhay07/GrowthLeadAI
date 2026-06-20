import { RawBusiness } from "@/types/business";

interface NearbySearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
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

// Maps common free-text category inputs to Google's fixed place-type enum.
// searchNearby requires includedTypes from this enum, unlike searchText's
// free-text query. Extend this map as needed for your demo categories.
const CATEGORY_TYPE_MAP: Record<string, string> = {
  plumber: "plumber",
  restaurant: "restaurant",
  food: "restaurant",
  dentist: "dentist",
  gym: "gym",
  fitness: "gym",
  cafe: "cafe",
  coffee: "cafe",
  salon: "hair_salon",
  "hair salon": "hair_salon",
  spa: "spa",
  bakery: "bakery",
  electrician: "electrician",
  florist: "florist",
  veterinarian: "veterinary_care",
  vet: "veterinary_care",
  lawyer: "lawyer",
  "law firm": "lawyer",
  "auto repair": "car_repair",
  mechanic: "car_repair",
  "real estate": "real_estate_agency",
  hotel: "lodging",
};

function resolvePlaceType(category: string): string {
  const key = category.trim().toLowerCase();
  return CATEGORY_TYPE_MAP[key] ?? "establishment";
}

export async function searchBusinessesNearby({
  lat,
  lng,
  radiusMeters,
  category,
}: NearbySearchParams): Promise<RawBusiness[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const placeType = resolvePlaceType(category);

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: [placeType],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Google Places Nearby error:", response.status, errorBody);
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data: GooglePlacesResponse = await response.json();
  const places = data.places ?? [];

  return places.map((place): RawBusiness => ({
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown Business",
    category: place.primaryTypeDisplayName?.text ?? category,
    address: place.formattedAddress ?? "",
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
  }));
}