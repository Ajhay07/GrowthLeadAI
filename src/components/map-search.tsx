"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadData } from "@/types/lead";
import { Loader2, Search, MapPin } from "lucide-react";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-100 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

interface MapSearchProps {
  onResults: (leads: LeadData[]) => void;
  onLoadingChange: (loading: boolean) => void;
  onError?: (message: string) => void;
}

export function MapSearch({ onResults, onLoadingChange, onError }: MapSearchProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!position || !category.trim()) return;

    setIsLoading(true);
    onLoadingChange(true);
    setError(null);

    try {
      const res = await fetch("/api/search-nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          radiusMeters: radiusKm * 1000,
          category,
        }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      onResults(data.leads);
    } catch (err) {
      setError("Search failed. Please try again.");
      onError?.("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <div className="space-y-4">
      <LeafletMap position={position} onPositionChange={setPosition} radiusKm={radiusKm} />

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Search Radius: {radiusKm} km
          </Label>
          <input
            type="range"
            min="1"
            max="15"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1 w-full">
          <Label htmlFor="category" className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Category
          </Label>
          <Input
            id="category"
            placeholder="e.g. Plumber"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !position || !category.trim()}
          className="w-full sm:w-auto px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Find Leads
            </>
          )}
        </Button>
      </div>

      {!position && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Click anywhere on the map to set your search area.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}