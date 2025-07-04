/**
 * Utility to load and parse markdown files from different locations in the project
 */

/**
 * Loads a markdown file from the specified path
 * @param path Path to the markdown file. Can be:
 *             - Absolute path (e.g., "public/storyCardFiles/file.md", "docs/file.md")
 *             - Relative path (e.g., "file.md") - defaults to public/storyCardFiles
 * @returns Promise with the markdown content as a string
 */
export async function loadMarkdownFile(path: string): Promise<string> {
  try {
    // Normalize the path
    const normalizedPath = path.startsWith("/") ? path.substring(1) : path;
    let fetchPath = "";

    // Handle different path formats
    if (normalizedPath.startsWith("public/")) {
      // Path already includes public/ prefix - strip "public/" for fetching
      fetchPath = `/${normalizedPath.substring(7)}`;
    } else if (normalizedPath.startsWith("docs/")) {
      // Path explicitly mentions docs/ - keep it as is for fetching
      fetchPath = `/${normalizedPath}`;
    } else if (!normalizedPath.includes("/")) {
      // Simple filename - assume public/storyCardFiles
      fetchPath = `/storyCardFiles/${normalizedPath}`;
    } else {
      // Relative path with directory structure - assume public/storyCardFiles
      fetchPath = `/storyCardFiles/${normalizedPath}`;
    }

    // Add .md extension if not present
    if (!fetchPath.endsWith(".md")) {
      fetchPath = `${fetchPath}.md`;
    }

    console.log(`Attempting to load markdown file from: ${fetchPath}`);

    const response = await fetch(fetchPath);

    if (!response.ok) {
      console.error(
        `Failed to load markdown file: ${fetchPath}, status: ${response.status}`
      );

      // If the path didn't start with docs/ or public/, try docs/ as a fallback
      if (!path.startsWith("docs/") && !path.startsWith("public/")) {
        console.log("Trying fallback to docs folder...");
        return loadMarkdownFile(`docs/${path}`);
      }

      throw new Error(`Failed to load markdown file: ${fetchPath}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error loading markdown file:", error);
    return `Error loading markdown file: ${path}. Please check the browser console for details.`;
  }
}
