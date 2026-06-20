"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadData } from "@/types/lead";
import { Loader2, Search } from "lucide-react";

interface SearchFormProps {
  onResults: (leads: LeadData[]) => void;
  onLoadingChange: (loading: boolean) => void;
  onError?: (message: string) => void;
}

export function SearchForm({ onResults, onLoadingChange, onError }: SearchFormProps) {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim() || !category.trim()) return;

    setIsLoading(true);
    onLoadingChange(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category }),
      });

      if (!res.ok) {
        throw new Error("Search failed");
      }

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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <Label htmlFor="city" className="text-xs font-medium text-muted-foreground mb-1.5 block">
          City
        </Label>
        <Input
          id="city"
          placeholder="e.g. Austin"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={isLoading}
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
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Find Leads
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}