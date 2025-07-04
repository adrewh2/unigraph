/* eslint-disable unused-imports/no-unused-vars */
import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { createEdgesTo } from "../../../core/model/GraphUtils";
import { SceneGraph } from "../../../core/model/SceneGraph";

export const demo_Unigraph_Applications = () => {
  const graph = new Graph();

  const storyCards = graph.createNode({
    id: "Story Cards",
    type: "storyCard",
    userData: {
      title: "Story Cards",
      description:
        "Story cards are a way to represent complex information in a fun and interactive way.\nThey give creators a new paradigm for communication information, and users to explore different narratives that interest them.",
      tags: ["unigraph", "story cards", "interactive"],
    },
  });

  const interactiveHarryPotterTimeTravelAnalysis = graph.createNode({
    id: "Interactive Harry Potter Time Travel Analysis",
    type: "storyCard",
    userData: {
      title: "Interactive Harry Potter Time Travel Analysis",
      description:
        "An interactive analysis of time travel in the Harry Potter series, allowing users to explore different timelines and outcomes based on character decisions. Unigraph allows this thing to be easily codified, shared, and extendend to arbitrary complexity.",
      tags: ["harry potter", "time travel", "interactive"],
    },
  });

  const howToCreateRealMagic = graph.createNode({
    id: "Magic Explained",
    type: "storyCard",
    userData: {
      title: "Magic Explained",
      description:
        "What would it take to create real magic? How would we technically achieve transfiguration?",
      tags: ["unigraph", "magic", "applications"],
      markdownFile: "magicExplained/intro.md",
    },
  });

  const theInspirationOfStoryCardsInUnigraph = graph.createNode({
    id: "The Inspiration of Story Cards in Unigraph",
    type: "storyCard",
    userData: {
      title: "The Inspiration of Story Cards in Unigraph",
      description:
        "The inspiration for story cards in Unigraph comes from various sources, including interactive fiction, choose-your-own-adventure books, and the desire to create engaging, branching narratives that allow users to explore complex information in a fun and interactive way. Furthermore, taking a scientific approach to the codification, inspection, and navigation of information.",
      tags: ["unigraph", "story cards", "inspiration"],
      markdownFile: "unigraph/inspiration.md",
    },
  });

  const anIdea = graph.createNode({
    id: "An Idea",
    type: "storyCard",
    userData: {
      title: "An Idea",
      description:
        "An idea is a thought or suggestion as to a possible course of action. It can be a starting point for creating something new, or a way to solve a problem.",
      tags: ["idea", "thought", "suggestion"],
      markdownFile: "quips/anIdea.md",
    },
  });

  // Add a node that references a markdown file
  const numerologyInformation = graph.createNode({
    id: "Numerology Information",
    type: "storyCard",
    userData: {
      title: "What is Numerology?",
      markdownFile: "numerology.md", // This will be loaded from /public/posts/numerology.md
      tags: ["numerology", "belief systems", "markdown"],
    },
  });

  // Connect it to the story cards node
  graph.createEdge(storyCards.getId(), numerologyInformation.getId(), {
    type: "StoryChoice",
    label: "Learn about Numerology",
  });

  const astrologyInformation = graph.createNode({
    id: "Astrology Information",
    type: "storyCard",
    userData: {
      title: "Legitimacy in Astrology",
      markdownFile: "astrology.md", // This will be loaded from /public/posts/astrology.md
      tags: ["astrology", "belief systems", "markdown"],
    },
  });

  const aboutTheAlethiometer = graph.createNode({
    id: "About the Alethiometer",
    type: "storyCard",
    tags: ["EntryPoint"],
    userData: {
      title: "About the Alethiometer",
      description:
        "The alethiometer, or golden compass, is a fictional device from Philip Pullman's 'His Dark Materials' series. It is used to find truth and navigate complex moral landscapes.",
      tags: ["alethiometer", "golden compass", "fiction"],
      markdownFile: "alethiometer/intro.md", // This will be loaded from /public/posts/aboutTheAlethiometer.md
    },
  });

  const simpleCaseAlethiometer = graph.createNode({
    id: "Simple Case Alethiometer",
    type: "storyCard",
    userData: {
      title: "Simple Case Alethiometer",
      description:
        "A simple case of using the alethiometer to answer a question about the legitimacy of astrology.",
      tags: ["alethiometer", "factor graph", "simple case"],
      markdownFile: "alethiometer/simpleCase.md", // Make sure this path matches your directory structure
    },
  });

  const advancedCaseAlethiometer = graph.createNode({
    id: "Advanced Case Alethiometer",
    type: "storyCard",
    userData: {
      title: "Advanced Case Alethiometer",
      description:
        "An advanced case of using the alethiometer to answer a question about the legitimacy of astrology, involving multiple layers of complexity and decision-making.",
      tags: ["alethiometer", "astrology", "advanced case"],
      markdownFile: "alethiometer/advancedCase.md", // This will be loaded from /public/posts/advancedCaseAlethiometer.md
    },
  });

  const constraintGraph = graph.createNode({
    id: "Constraint Graph",
    type: "storyCard",
    userData: {
      title: "Constraint Graph",
      description:
        "A constraint graph is a way to represent relationships between different entities in a system, allowing for complex decision-making and analysis.",
      tags: ["constraint graph", "decision making", "analysis"],
      markdownFile: "constraintGraph.md", // This will be loaded from /public/posts/constraintGraph.md
    },
  });

  const factorGraph = graph.createNode({
    id: "Factor Graph",
    type: "storyCard",
    userData: {
      title: "Factor Graph",
      description:
        "A factor graph is a bipartite graph that represents the factorization of a function into a product of smaller functions, allowing for efficient computation and analysis of complex systems.",
      tags: ["factor graph", "computation", "analysis"],
      markdownFile: "factorGraph.md", // This will be loaded from /public/posts/factorGraph.md
    },
  });

  graph.createEdge(simpleCaseAlethiometer.getId(), constraintGraph.getId(), {
    type: "StoryChoice",
  });

  graph.createEdge(advancedCaseAlethiometer.getId(), factorGraph.getId(), {
    type: "StoryChoice",
  });

  const alethiometerCases = createEdgesTo(
    graph,
    aboutTheAlethiometer.getId(),
    [simpleCaseAlethiometer, advancedCaseAlethiometer].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  graph.createEdge(
    numerologyInformation.getId(),
    astrologyInformation.getId(),
    {
      type: "StoryChoice",
      label: "expansion",
    }
  );

  const conceptAlbumGallery = graph.createNode({
    id: "Concept Album Gallery",
    type: "storyCard",
    userData: {
      title: "Concept Album Gallery",
      description:
        "A gallery of concept albums, showcasing the intersection of music and storytelling through thematic and narrative coherence.",
      tags: ["concept album", "gallery", "music"],
      markdownFile: "conceptAlbum/gallery.md", // This will be loaded from /public/posts/conceptAlbumGallery.md
    },
  });

  const aboutUnigraph = graph.createNode({
    id: "About Unigraph",
    type: "storyCard",
    userData: {
      title: "About Unigraph",
      description:
        "Unigraph is a platform for creating and sharing interactive stories, allowing users to explore complex information in a fun and engaging way. It provides tools for codifying, inspecting, and navigating information, enabling a new paradigm for communication and interaction.",
      tags: ["unigraph", "platform", "interactive stories"],
      markdownFile: "unigraph/about.md", // This will be loaded from /public/posts/aboutUnigraph.md
    },
  });

  const composabilityInUnigraph = graph.createNode({
    id: "Composability in Unigraph",
    type: "storyCard",
    userData: {
      title: "Composability in Unigraph",
      description:
        "Composability in Unigraph refers to the ability to create complex applications by combining simple, reusable components. This allows for flexible and modular development, enabling users to build applications that can be easily extended and customized.",
      tags: ["unigraph", "composability", "modular development"],
      markdownFile: "unigraph/composability.md", // This will be loaded from /public/posts/composabilityInUnigraph.md
    },
  });

  const interspection = graph.createNode({
    id: "Interspection in Unigraph",
    type: "storyCard",
    userData: {
      title: "Interspection in Unigraph",
      description:
        "Interspection is the entire gamut of inspecting, navigating, and interacting with information in Unigraph. People can use Unigraph to inter information - codifying it in a standard language that allows it to be intered on in a unified application ecosystem. This spans from creating fun interactive stories, to complex linking annotation schemes across previously disparate data formats, or creating complex data science tools.",
      tags: ["unigraph", "interspection", "information", "codification"],
      markdownFile: "alethiometer/interspection.md", // This will be loaded from /public/posts/interspection.md
    },
  });

  graph.createEdge(aboutUnigraph.getId(), composabilityInUnigraph.getId(), {
    type: "StoryChoice",
    tags: ["EntryPoint"],
  });

  graph.createEdge(aboutUnigraph.getId(), interspection.getId(), {
    type: "StoryChoice",
    tags: ["EntryPoint"],
  });

  const demo_stories = createEdgesTo(
    graph,
    storyCards.getId(),
    [
      interactiveHarryPotterTimeTravelAnalysis,
      howToCreateRealMagic,
      theInspirationOfStoryCardsInUnigraph,
      aboutTheAlethiometer,
      anIdea,
      conceptAlbumGallery,
      aboutUnigraph,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  console.log("reached here");

  return new SceneGraph({
    graph,
    metadata: {
      name: "Unigraph Applications Story Cards",
      description:
        "An actual version for explaining how Unigraph Story Cards work.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "storyCard",
    },
  });
};
