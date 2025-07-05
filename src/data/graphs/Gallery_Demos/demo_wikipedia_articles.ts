import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { Node, NodeId } from "../../../core/model/Node";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Fetches a Wikipedia article and creates a node with links to related articles
 * Performs a breadth-first search to a specified depth
 * @param graph The graph to add nodes to
 * @param articleTitle The title of the Wikipedia article to fetch
 * @param options Optional configuration for the fetch operation
 * @returns Promise with the root article node
 */
export const loadWikipediaArticle = async (
  graph: Graph,
  articleTitle: string = "Factor_graph",
  options: {
    maxLinksPerArticle?: number;
    bfsDepth?: number;
    language?: string;
  } = {}
): Promise<Node> => {
  const { maxLinksPerArticle = 10, bfsDepth = 1, language = "en" } = options;

  // Keep track of visited articles to avoid cycles
  const visitedArticles = new Set<string>();

  // Queue for BFS with article titles and their depth level
  const queue: Array<{ title: string; depth: number; parentNode?: Node }> = [
    { title: articleTitle, depth: 0 },
  ];

  // Root node reference to return at the end
  let rootNode: Node | undefined;

  const baseApiUrl = `https://${language}.wikipedia.org/w/api.php`;

  while (queue.length > 0) {
    const { title, depth, parentNode } = queue.shift()!;

    // Skip if we've already processed this article or exceeded max depth
    if (visitedArticles.has(title) || depth > bfsDepth) {
      continue;
    }

    visitedArticles.add(title);

    // Encode the article title for the URL
    const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));

    try {
      // Fetch article content with links
      const articleUrl = `${baseApiUrl}?action=query&format=json&prop=extracts|links&titles=${encodedTitle}&exintro=1&explaintext=1&pllimit=${maxLinksPerArticle * 2}&origin=*`;
      const response = await fetch(articleUrl);
      const data = await response.json();

      // Extract the page data
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === "-1") {
        console.warn(`Article "${title}" not found`);
        continue;
      }

      const page = pages[pageId];
      const extract = page.extract || "No extract available";
      const links = page.links || [];
      const fullUrl = `https://${language}.wikipedia.org/wiki/${encodedTitle}`;

      // Create the article node
      const articleNode = graph.createNode({
        id: `Wiki: ${title}`,
        type: "wikiArticle",
        userData: {
          title: title,
          description:
            extract.substring(0, 300) + (extract.length > 300 ? "..." : ""),
          url: fullUrl,
          fullContent: extract,
          lastModified: page.touched,
          tags: ["wikipedia", "article", `depth-${depth}`],
          depth: depth, // Store depth for potential UI filtering
        },
      });

      // Store the root node to return later
      if (depth === 0) {
        rootNode = articleNode;
      }

      // Connect to parent node if it exists
      if (parentNode) {
        graph.createEdge(parentNode.getId(), articleNode.getId(), {
          type: "WikiLink",
          label: title,
        });
      }

      // Now get content links - we need to make another API call to get the actual content HTML
      // to determine which links are in the main content
      const contentUrl = `${baseApiUrl}?action=parse&format=json&page=${encodedTitle}&prop=text&origin=*`;
      const contentResponse = await fetch(contentUrl);
      const contentData = await contentResponse.json();

      // Only proceed if we can get the content
      if (contentData.parse && contentData.parse.text) {
        const htmlContent = contentData.parse.text["*"];

        // Process links if we haven't reached max depth
        if (depth < bfsDepth) {
          // Get valid links from the article content
          const contentLinks = new Set<string>();

          // Extract links from the HTML content that are in the main article body
          // This uses a regex approach - in a production app, proper HTML parsing would be better
          const mainContentMatches = htmlContent.match(
            /<div class="mw-parser-output">([\s\S]*?)<\/div>/
          );
          if (mainContentMatches && mainContentMatches[1]) {
            const mainContent = mainContentMatches[1];
            const linkRegex = /<a href="\/wiki\/([^"]+)"[^>]*>([^<]+)<\/a>/g;
            let match;

            while ((match = linkRegex.exec(mainContent)) !== null) {
              const linkTarget = decodeURIComponent(match[1]);
              // Skip special pages, files, etc.
              if (!linkTarget.includes(":") && !linkTarget.includes("#")) {
                contentLinks.add(linkTarget.replace(/_/g, " "));
              }
            }
          }

          // Filter links to only include those in the content
          let linksAdded = 0;

          for (const link of links) {
            // Skip non-article namespace links
            if (link.ns !== 0) continue;

            const linkTitle = link.title;

            // For all valid links, create nodes and edges immediately
            // This ensures they appear in the graph even if we don't process them further
            const encodedLinkTitle = encodeURIComponent(
              linkTitle.replace(/ /g, "_")
            );
            const linkUrl = `https://${language}.wikipedia.org/wiki/${encodedLinkTitle}`;

            // Check if we've already created this node to avoid duplicates
            const linkNodeId = `Wiki: ${linkTitle}`;
            let linkNode = graph.maybeGetNode(linkNodeId as NodeId);

            if (!linkNode) {
              // Create a basic node for the link
              linkNode = graph.createNode({
                id: linkNodeId,
                type: "wikiArticle",
                userData: {
                  title: linkTitle,
                  url: linkUrl,
                  tags: ["wikipedia", "linked-article", `depth-${depth + 1}`],
                  depth: depth + 1,
                },
              });
            }

            // Create an edge from the current article to this link
            graph.createEdge(articleNode.getId(), linkNode.getId(), {
              type: "WikiLink",
              label: linkTitle,
            });

            // Only add links that appear in the content to the BFS queue for further processing
            if (
              contentLinks.has(linkTitle) &&
              linksAdded < maxLinksPerArticle &&
              !visitedArticles.has(linkTitle)
            ) {
              // Add to BFS queue for next level
              queue.push({
                title: linkTitle,
                depth: depth + 1,
                parentNode: articleNode,
              });

              linksAdded++;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing article "${title}":`, error);
    }
  }

  // Return the root node or an error node if something went wrong
  if (!rootNode) {
    return graph.createNode({
      id: `Wiki Error: ${articleTitle}`,
      type: "wikiArticle",
      userData: {
        title: `Failed to load: ${articleTitle}`,
        description: `Error fetching Wikipedia article`,
        tags: ["wikipedia", "error"],
      },
    });
  }

  return rootNode;
};

export const demo_Wikipedia_Articles = async () => {
  const graph = new Graph();

  // Create a root node for Wikipedia articles
  const wikiRootNode = graph.createNode({
    id: "Wikipedia Articles",
    type: "wikiRoot",
    userData: {
      title: "Wikipedia Articles Explorer",
      description:
        "Explore Wikipedia articles as an interactive graph. Click on nodes to expand the graph with more articles.",
      tags: ["wikipedia", "knowledge graph"],
    },
  });

  // Load articles with different topics and depths
  //   const graphTheoryArticle = await loadWikipediaArticle(graph, "Graph theory", {
  //     maxLinksPerArticle: 5,
  //     bfsDepth: 2,
  //   });

  const factorGraphArticle = await loadWikipediaArticle(graph, "Factor graph", {
    maxLinksPerArticle: 100,
    bfsDepth: 4,
  });

  //   // You can add more starting points for different topics
  //   const artificialIntelligenceArticle = await loadWikipediaArticle(
  //     graph,
  //     "Artificial intelligence",
  //     {
  //       maxLinksPerArticle: 5,
  //       bfsDepth: 1,
  //     }
  //   );

  // Connect all articles to the root node
  //   graph.createEdge(wikiRootNode.getId(), graphTheoryArticle.getId(), {
  //     type: "WikiStart",
  //     label: "Graph Theory",
  //   });

  graph.createEdge(wikiRootNode.getId(), factorGraphArticle.getId(), {
    type: "WikiStart",
    label: "Factor Graph",
  });

  //   graph.createEdge(
  //     wikiRootNode.getId(),
  //     artificialIntelligenceArticle.getId(),
  //     {
  //       type: "WikiStart",
  //       label: "AI",
  //     }
  //   );

  return new SceneGraph({
    graph,
    metadata: {
      name: "Wikipedia Knowledge Network",
      description:
        "Explore Wikipedia articles and their connections as a knowledge graph with multiple levels of depth.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "ReactFlow",
    },
  });
};
