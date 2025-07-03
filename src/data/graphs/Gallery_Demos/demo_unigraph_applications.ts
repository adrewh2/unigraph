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
        "Story cards are a way to represent complex information in a fun and interactive way. They allow creators a new paradigm for communication information, and users to explore different narratives that interest them.",
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
    id: "How to Create Real Magic",
    type: "storyCard",
    userData: {
      title: "How to Create Real Magic",
      description:
        "What would it take to create real magic? How would we technically achieve transfiguration?",
      tags: ["unigraph", "magic", "applications"],
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
    },
  });

  const demo_stories = createEdgesTo(
    graph,
    storyCards.getId(),
    [
      interactiveHarryPotterTimeTravelAnalysis,
      howToCreateRealMagic,
      theInspirationOfStoryCardsInUnigraph,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  const interspection = graph.createNode({
    id: "Interspection in Unigraph",
    type: "storyCard",
    userData: {
      title: "Interspection in Unigraph",
      description:
        "Interspection is the entire gamut of inspecting, navigating, and interacting with information in Unigraph. People can use Unigraph to inter information - codifying it in a standard language that allows it to be intered on in a unified application ecosystem. This spans from creating fun interactive stories, to complex linking annotation schemes across previously disparate data formats, or creating complex data science tools.",
      tags: ["unigraph", "interspection", "information", "codification"],
    },
  });

  graph.createEdge(storyCards.getId(), interspection.getId(), {
    type: "concept",
  });

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
