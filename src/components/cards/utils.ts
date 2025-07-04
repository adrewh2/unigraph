import { Graph } from "../../core/model/Graph";

export interface StoryCardOptions {
  basePath?: "public" | "docs" | string;
}

export const createStoryCardNodeFromMarkdown = (
  title: string,
  markdownFile: string,
  graph: Graph,
  options?: StoryCardOptions
) => {
  // Process the markdown file path based on different patterns
  let processedMarkdownFile = markdownFile;

  // Handle paths that already start with specific prefixes
  if (markdownFile.startsWith("docs/")) {
    // Already has the docs/ prefix, use as is
    processedMarkdownFile = markdownFile;
  } else if (markdownFile.startsWith("public/")) {
    // Already has the public/ prefix, use as is
    processedMarkdownFile = markdownFile;
  }
  // Handle options-based path construction
  else if (options?.basePath) {
    if (options.basePath === "docs") {
      processedMarkdownFile = `docs/${markdownFile}`;
    } else if (options.basePath === "public") {
      processedMarkdownFile = `public/storyCardFiles/${markdownFile}`;
    } else {
      // Custom base path
      processedMarkdownFile = `${options.basePath}/${markdownFile}`;
    }
  }
  // Default to public/storyCardFiles if no specific path is provided
  else {
    processedMarkdownFile = `public/storyCardFiles/${markdownFile}`;
  }

  // Create a new story card node with the given markdown file
  const node = graph.createNode({
    type: "storyCard",
    userData: {
      title: title || "Story Card",
      markdownFile: processedMarkdownFile,
    },
  });

  // Add tags to the node
  node.addTag("storyCard");
  node.addTag("EntryPoint");

  return node;
};
