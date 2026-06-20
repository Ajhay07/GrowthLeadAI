"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchForm } from "@/components/search-form";
import { MapSearch } from "@/components/map-search";
import { LeadTable } from "@/components/lead-table";
import { LeadTableSkeleton } from "@/components/lead-table-skeleton";
import { MetricsRow } from "@/components/metrics-row";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadData } from "@/types/lead";
import { AlertCircle, MapPin, Search } from "lucide-react";

export default function Home() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<"city" | "map">("city");
  const [searchError, setSearchError] = useState<string | null>(null);

  function handleResults(results: LeadData[]) {
    setLeads(results);
    setHasSearched(true);
    setSearchError(results.length === 0 ? "no-results" : null);
  }

  function handleError(message: string) {
    setSearchError(message);
    setHasSearched(true);
    setLeads([]);
  }

  return (
    <main className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 -z-10 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, #D4A24E 0%, transparent 40%), radial-gradient(circle at 80% 100%, #6B8E76 0%, transparent 40%)",
        }}
      />

      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 shrink-0">
              <svg viewBox="0 0 32 32" className="h-8 w-8">
                <rect
                  x="4" y="4" width="24" height="24" rx="7"
                  fill="#0B0E14"
                  className="dark:fill-white/5"
                />
                <path
                  d="M16 9L23 16L16 23L9 16L16 9Z"
                  fill="#D4A24E"
                />
                <path
                  d="M16 13.5L19.5 17L16 20.5L12.5 17L16 13.5Z"
                  fill="#0B0E14"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                GrowthLead AI
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Find local businesses ready for digital transformation
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchMode === "city" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("city")}
              className="gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search by</span> City
            </Button>
            <Button
              variant={searchMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("map")}
              className="gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5" />
              Search on Map
            </Button>
          </div>

          {searchMode === "city" ? (
            <SearchForm
              onResults={handleResults}
              onLoadingChange={setIsLoading}
              onError={handleError}
            />
          ) : (
            <MapSearch
              onResults={handleResults}
              onLoadingChange={setIsLoading}
              onError={handleError}
            />
          )}
        </Card>

        {!hasSearched && !isLoading && (
          <Card className="p-10 sm:p-12 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              {searchMode === "city"
                ? "Enter a city and category above to discover high-opportunity leads."
                : "Click a location on the map and enter a category to discover leads near that area."}
            </p>
          </Card>
        )}

        {isLoading && <LeadTableSkeleton />}

        {hasSearched && !isLoading && searchError === "no-results" && (
          <Card className="p-10 sm:p-12 text-center space-y-2">
            <p className="font-medium">No businesses found in this area.</p>
            <p className="text-sm text-muted-foreground">
              Try a wider radius, a different category, or a nearby city.
            </p>
          </Card>
        )}

        {hasSearched && !isLoading && searchError && searchError !== "no-results" && (
          <Card className="p-10 sm:p-12 text-center space-y-2 border-destructive/30">
            <AlertCircle className="h-5 w-5 text-destructive mx-auto" />
            <p className="font-medium">Something went wrong.</p>
            <p className="text-sm text-muted-foreground">{searchError}</p>
          </Card>
        )}

        {hasSearched && !isLoading && !searchError && (
          <>
            <MetricsRow leads={leads} />
            <LeadTable leads={leads} />
          </>
        )}
      </div>
    </main>
  );
}