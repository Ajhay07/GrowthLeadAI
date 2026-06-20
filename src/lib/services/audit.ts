import * as cheerio from "cheerio";
import { AuditDetails } from "@/types/lead";

const FETCH_TIMEOUT_MS = 5000;

/**
 * Audits a business website for basic quality/health signals.
 * Pass null/undefined for businesses with no website at all —
 * returns immediately with hasWebsite-equivalent false signals.
 */
export async function auditWebsite(
  url: string | null
): Promise<AuditDetails> {
  if (!url) {
    return {
      hasSSL: false,
      hasMobileViewport: false,
      loadTimeMs: null,
      hasAnalytics: false,
      hasSocialLinks: false,
      statusCode: null,
      error: "no_website",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GrowthLeadAIBot/1.0; +https://growthlead.ai/bot)",
      },
    });

    const loadTimeMs = Date.now() - startTime;
    clearTimeout(timeout);

    const html = await response.text();
    const $ = cheerio.load(html);

    const hasSSL = response.url.startsWith("https://");
    const hasMobileViewport =
      $('meta[name="viewport"]').length > 0;

    const analyticsPatterns = [
      "google-analytics.com",
      "googletagmanager.com",
      "gtag(",
      "fbq(",
      "connect.facebook.net",
      "hotjar.com",
      "clarity.ms",
    ];
    const hasAnalytics = analyticsPatterns.some((pattern) =>
      html.includes(pattern)
    );

    const socialDomains = [
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "twitter.com",
      "x.com",
      "tiktok.com",
    ];
    const hasSocialLinks = $("a[href]")
      .map((_, el) => $(el).attr("href") || "")
      .get()
      .some((href) => socialDomains.some((domain) => href.includes(domain)));

    return {
      hasSSL,
      hasMobileViewport,
      loadTimeMs,
      hasAnalytics,
      hasSocialLinks,
      statusCode: response.status,
    };
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : "unknown_error";

    return {
      hasSSL: false,
      hasMobileViewport: false,
      loadTimeMs: null,
      hasAnalytics: false,
      hasSocialLinks: false,
      statusCode: null,
      error: message,
    };
  }
}