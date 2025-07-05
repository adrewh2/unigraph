/**
 * Utility function to replace Unigraph Vercel URLs with localhost when running locally
 * @param html HTML content that may contain unigraph.vercel.app links
 * @returns Updated HTML with appropriate URLs
 */
export function replaceUnigraphUrlsWithLocalhost(html: string): string {
  // Check if we're running locally by examining the current hostname
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isLocalhost) {
    // No need to replace if we're not running locally
    return html;
  }

  // Replace all occurrences of unigraph.vercel.app with localhost:3000
  return html.replace(
    /(href|src)=["'](https?:\/\/unigraph\.vercel\.app)([^"']*)["']/gi,
    '$1="http://localhost:3000$3"'
  );
}

/**
 * Returns the appropriate base URL for Unigraph based on the current environment
 * @returns Base URL for Unigraph (either localhost:3000 or unigraph.vercel.app)
 */
export function getUnigraphBaseUrl(): string {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return isLocalhost ? "http://localhost:3000" : "https://unigraph.vercel.app";
}
