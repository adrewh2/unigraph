import { GraphvizLayoutType } from "../../core/layouts/GraphvizLayoutEngine";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";

const createGraph = (): Graph => {
  const tmp = new SceneGraph();
  const g = tmp.getGraph();

  // Root node
  const n1 = g.createNode({
    id: "unigraph_overview",
    type: "unigraph_overview",
    userData: {
      name: "Unigraph Overview",
      description: "An overview of Unigraph's capabilities and features.",
    },
  });

  // Definition node
  const n_definition = g.createNode({
    id: "unigraph_overview_definition",
    type: "unigraph_overview_definition",
    userData: {
      name: "What is Unigraph?",
      description:
        "Unigraph is a next-generation platform for thinking, communicating, and organizing knowledge.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_definition.getId(), {
    type: "unigraph_overview_edge",
    label: "definition",
  });

  // Supports node
  const n_supports = g.createNode({
    id: "unigraph_overview_supports",
    type: "unigraph_overview_supports",
    userData: {
      name: "Supports",
      description: "Core capabilities supported by Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_supports.getId(), {
    type: "unigraph_overview_edge",
    label: "supports",
  });

  // Supported features
  const n_text_media = g.createNode({
    id: "unigraph_overview_supports_text_media",
    type: "unigraph_overview_feature",
    userData: {
      name: "Text and media communication",
      description: "Communicate using text and media.",
    },
  });
  const n_semantic = g.createNode({
    id: "unigraph_overview_supports_semantic",
    type: "unigraph_overview_feature",
    userData: {
      name: "Semantic knowledge modeling",
      description: "Model knowledge semantically.",
    },
  });
  const n_code_data = g.createNode({
    id: "unigraph_overview_supports_code_data",
    type: "unigraph_overview_feature",
    userData: {
      name: "Code, data science, and analytics workflows",
      description: "Integrate code, data science, and analytics.",
    },
  });
  const n_collab = g.createNode({
    id: "unigraph_overview_supports_collab",
    type: "unigraph_overview_feature",
    userData: {
      name: "Collaboration and organizational logic",
      description: "Support collaboration and organizational logic.",
    },
  });

  // Link features to supports
  g.createEdgeIfMissing(n_supports.getId(), n_text_media.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_semantic.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_code_data.getId(), {
    type: "unigraph_overview_edge",
  });
  g.createEdgeIfMissing(n_supports.getId(), n_collab.getId(), {
    type: "unigraph_overview_edge",
  });

  // Vision node
  const n_vision = g.createNode({
    id: "unigraph_overview_vision",
    type: "unigraph_overview_vision",
    userData: {
      name: "Vision",
      description: "The future impact of Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_vision.getId(), {
    type: "unigraph_overview_edge",
    label: "vision",
  });

  // Web 3.0 statement
  const n_web3 = g.createNode({
    id: "unigraph_overview_vision_web3",
    type: "unigraph_overview_vision_statement",
    userData: {
      name: "Web 3.0",
      description: "If successful, Unigraph would become the face of Web 3.0.",
    },
  });
  g.createEdgeIfMissing(n_vision.getId(), n_web3.getId(), {
    type: "unigraph_overview_edge",
  });

  // Features node (legacy, for compatibility)
  const n2 = g.createNode({
    id: "unigraph_overview_features",
    type: "unigraph_overview_features",
    userData: {
      name: "Features",
      description: "Key features of Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n2.getId(), {
    type: "unigraph_overview_edge",
  });

  return g;
};

export const demo_scenegraph_unigraph_overview = () => {
  console.log("Building UnigraphOverview graph...");
  console.log("UnigraphOverview graph built.");

  return new SceneGraph({
    graph: createGraph(),
    metadata: {
      name: "UnigraphOverview",
      description:
        "A graph of the overview of Unigraph's capabilities and features.",
    },
    defaultAppConfig: {
      activeView: "ReactFlow",
      activeLayout: GraphvizLayoutType.Graphviz_dot,
      activeSceneGraph: "UnigraphOverview",
      windows: {
        showEntityDataCard: false, // dev tool
      },
      forceGraph3dOptions: {
        layout: "Layout",
      },
      legendMode: "type",
      activeFilter: null,
    },
  });
};
