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
    debug?: boolean;
  } = {}
): Promise<Node> => {
  const {
    maxLinksPerArticle = 50,
    bfsDepth = 3, // Default to 4 levels deep
    language = "en",
    debug = false,
  } = options;

  // Keep track of visited articles to avoid cycles
  const visitedArticles = new Set<string>();
  const nodeLevels = new Map<string, number>(); // Track node depths for debugging

  console.log(`Starting BFS from ${articleTitle} with max depth ${bfsDepth}`);

  // Queue for BFS with article titles and their depth level
  const queue: Array<{ title: string; depth: number; parentNode?: Node }> = [
    { title: articleTitle, depth: 0 },
  ];

  // Root node reference to return at the end
  let rootNode: Node | undefined;
  const baseApiUrl = `https://${language}.wikipedia.org/w/api.php`;

  while (queue.length > 0) {
    const { title, depth, parentNode } = queue.shift()!;

    // Always create or reuse the article node
    const articleNodeId = `Wiki: ${title}`;
    let articleNode = graph.maybeGetNode(articleNodeId as NodeId);

    // Always create the node if it doesn't exist
    if (!articleNode) {
      articleNode = graph.createNode({
        id: articleNodeId,
        type: "wikiArticle",
        userData: {
          title: title,
          url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
          tags: ["wikipedia", "article", `depth-${depth}`],
          depth: depth,
        },
      });
      if (debug)
        console.log(`Created node: ${articleNodeId} at depth ${depth}`);
    }

    // Always create the edge from parent to this node if parent exists
    if (parentNode) {
      // Prevent duplicate edges
      if (
        !graph
          .getEdges()
          .toArray()
          .some(
            (e) =>
              e.getSource() === parentNode.getId() &&
              e.getTarget() === articleNode.getId()
          )
      ) {
        graph.createEdge(parentNode.getId(), articleNode.getId(), {
          type: "WikiLink",
          label: title,
          userData: { depth },
        });
        if (debug)
          console.log(
            `Created edge from ${parentNode.getId()} to ${articleNode.getId()}`
          );
      }
    }

    // If already visited, skip further processing (but edge above is always created)
    if (visitedArticles.has(title)) {
      if (debug) console.log(`Skipping already visited article: ${title}`);
      continue;
    }

    if (depth > bfsDepth) {
      if (debug)
        console.log(
          `Skipping article beyond max depth: ${title} (depth ${depth})`
        );
      continue;
    }

    if (debug) console.log(`Processing article: ${title} at depth ${depth}`);
    visitedArticles.add(title);
    nodeLevels.set(title, depth);

    // Fetch article content with links
    const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
    try {
      const articleUrl = `${baseApiUrl}?action=query&format=json&prop=extracts|links&titles=${encodedTitle}&exintro=1&explaintext=1&pllimit=${maxLinksPerArticle * 2}&origin=*`;
      const response = await fetch(articleUrl);
      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === "-1") {
        if (debug) console.warn(`Article "${title}" not found`);
        continue;
      }

      const page = pages[pageId];
      const extract = page.extract || "No extract available";
      const links = page.links || [];
      const fullUrl = `https://${language}.wikipedia.org/wiki/${encodedTitle}`;

      // Update node with extract and description if it was just a stub before
      if (articleNode) {
        articleNode.setUserData(
          "description",
          extract.substring(0, 300) + (extract.length > 300 ? "..." : "")
        );
        articleNode.setUserData("fullContent", extract);
        articleNode.setUserData("lastModified", page.touched);
        articleNode.setUserData("url", fullUrl);
      }

      if (depth === 0) {
        rootNode = articleNode;
        if (debug) console.log(`Set root node: ${articleNode.getId()}`);
      }

      if (depth < bfsDepth) {
        // Now get content links - we need to make another API call to get the actual content HTML
        const contentUrl = `${baseApiUrl}?action=parse&format=json&page=${encodedTitle}&prop=text&origin=*`;
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();

        if (contentData.parse && contentData.parse.text) {
          const htmlContent = contentData.parse.text["*"];
          const contentLinks = new Set<string>();
          // FIX: Extract all <a href="/wiki/..."> links from the entire htmlContent, not just the first div
          const linkRegex = /<a href="\/wiki\/([^"#:]+)"[^>]*>([^<]+)<\/a>/g;
          let match;
          while ((match = linkRegex.exec(htmlContent)) !== null) {
            const linkTarget = decodeURIComponent(match[1]);
            // Normalize: trim, lower, collapse spaces
            const normalized = linkTarget
              .replace(/_/g, " ")
              .trim()
              .replace(/\s+/g, " ")
              .toLowerCase();
            contentLinks.add(normalized);
          }

          let linksAdded = 0;
          console.log("links are ", links);
          for (const link of links) {
            const linkTitle = link.title;
            const normalizedLinkTitle = linkTitle
              .trim()
              .replace(/\s+/g, " ")
              .toLowerCase();
            if (!contentLinks.has(normalizedLinkTitle)) continue;
            console.log("reached here with link ", linkTitle);

            const linkNodeId = `Wiki: ${linkTitle}`;
            let linkNode = graph.maybeGetNode(linkNodeId as NodeId);

            if (!linkNode) {
              const encodedLinkTitle = encodeURIComponent(
                linkTitle.replace(/ /g, "_")
              );
              const linkUrl = `https://${language}.wikipedia.org/wiki/${encodedLinkTitle}`;
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
              if (debug)
                console.log(
                  `Created new node: ${linkNodeId} at depth ${depth + 1}`
                );
            }

            // Always create the edge, even if the node already existed
            if (
              !graph
                .getEdges()
                .toArray()
                .some(
                  (e) =>
                    e.getSource() === articleNode.getId() &&
                    e.getTarget() === linkNode.getId()
                )
            ) {
              graph.createEdge(articleNode.getId(), linkNode.getId(), {
                type: "WikiLink",
                label: linkTitle,
                userData: { depth: depth + 1 },
              });
            }

            // Only queue for BFS if not visited and within link limit
            if (
              !visitedArticles.has(linkTitle) &&
              !queue.some((q) => q.title === linkTitle) &&
              linksAdded < maxLinksPerArticle
            ) {
              queue.push({
                title: linkTitle,
                depth: depth + 1,
                parentNode: articleNode,
              });
              if (debug)
                console.log(
                  `Queued for BFS: ${linkTitle} at depth ${depth + 1}`
                );
              linksAdded++;
            }
          }
        }
      } else {
        if (debug)
          console.log(
            `Reached max depth for ${title}, not fetching more links`
          );
      }
    } catch (error) {
      console.error(`Error processing article "${title}":`, error);
    }
  }

  // Log statistics about the BFS traversal
  console.log(
    `BFS traversal complete. Visited ${visitedArticles.size} articles.`
  );
  console.log(`Depth distribution:`);

  // Count articles at each depth level
  const depthCounts = new Map<number, number>();
  nodeLevels.forEach((depth) => {
    depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
  });

  // Log the counts
  for (let i = 0; i <= bfsDepth; i++) {
    console.log(`  Depth ${i}: ${depthCounts.get(i) || 0} articles`);
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

  console.log("Starting Wikipedia article graph generation...");

  // Load articles with different topics and depths
  const factorGraphArticle = await loadWikipediaArticle(graph, "Factor graph", {
    maxLinksPerArticle: 100, // Reduce to make sure we're processing correctly
    bfsDepth: 4, // Start with a reasonable depth
    debug: true, // Enable debugging
  });

  // Connect the article to the root node
  graph.createEdge(wikiRootNode.getId(), factorGraphArticle.getId(), {
    type: "WikiStart",
    label: "Factor Graph",
  });

  console.log("Wikipedia graph generation complete!");
  console.log(`Total nodes in graph: ${graph.getNodes().size()}`);
  console.log(`Total edges in graph: ${graph.getEdges().size()}`);

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
