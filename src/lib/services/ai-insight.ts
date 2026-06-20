import { RawBusiness } from "@/types/business";
import { AuditDetails } from "@/types/lead";
import { ScoreResult } from "./scoring";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GroqResponse {
  choices: { message: { content: string } }[];
}

/**
 * Generates a one-paragraph, sales-ready explanation of why this
 * business is (or isn't) a strong lead, grounded in real computed
 * signals rather than generic boilerplate.
 */
export async function generateInsight(
  business: RawBusiness,
  audit: AuditDetails,
  scores: ScoreResult
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return "AI insight unavailable: missing GROQ_API_KEY.";
  }

  const websiteStatus = !business.website
    ? "has no website at all"
    : audit.statusCode === null
    ? "has a website, but it appears broken or unreachable"
    : `has a website (load time ${audit.loadTimeMs}ms, SSL: ${audit.hasSSL ? "yes" : "no"}, mobile-friendly: ${audit.hasMobileViewport ? "yes" : "no"})`;

  const prompt = `You are a lead analyst for a web design/marketing agency. Write a concise, confident, 2-3 sentence explanation of why the following local business is (or isn't) a strong sales prospect for digital services. Be specific and reference the actual numbers given. Do not use generic filler phrases. Write in plain prose, no markdown, no bullet points.

Business: ${business.name}
Category: ${business.category}
Rating: ${business.rating} stars (${business.reviewCount} reviews)
Digital status: ${websiteStatus}
Growth Score: ${scores.growthScore}/100
Digital Presence Score: ${scores.digitalPresenceScore}/100
Opportunity Score: ${scores.opportunityScore}/100`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return "AI insight unavailable due to a temporary error.";
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content?.trim() ?? "AI insight unavailable.";
  } catch (err) {
    console.error("Groq fetch failed:", err);
    return "AI insight unavailable due to a temporary error.";
  }
}