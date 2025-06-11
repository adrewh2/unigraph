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
    label: "Unigraph Overview",
    userData: {
      description: "An overview of Unigraph's capabilities and features.",
    },
  });

  // Definition node
  const n_definition = g.createNode({
    id: "unigraph_overview_definition",
    type: "unigraph_overview_definition",
    label: "What is Unigraph?",
    userData: {
      description:
        "Unigraph is a next-generation platform for thinking, communicating, and organizing knowledge.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_definition.getId(), {
    label: "definition",
    type: "unigraph_overview_edge",
  });

  // Supports node
  const n_supports = g.createNode({
    id: "unigraph_overview_supports",
    type: "unigraph_overview_supports",
    label: "Supports",
    userData: {
      description: "Core capabilities supported by Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_supports.getId(), {
    label: "supports",
    type: "unigraph_overview_edge",
  });

  // Supported features
  const n_text_media = g.createNode({
    id: "unigraph_overview_supports_text_media",
    type: "unigraph_overview_feature",
    label: "Text and media communication",
    userData: {
      description: "Communicate using text and media.",
    },
  });
  const n_semantic = g.createNode({
    id: "unigraph_overview_supports_semantic",
    type: "unigraph_overview_feature",
    label: "Semantic knowledge modeling",
    userData: {
      description: "Model knowledge semantically.",
    },
  });
  const n_code_data = g.createNode({
    id: "unigraph_overview_supports_code_data",
    type: "unigraph_overview_feature",
    label: "Code, data science, and analytics workflows",
    userData: {
      description: "Integrate code, data science, and analytics.",
    },
  });
  const n_collab = g.createNode({
    id: "unigraph_overview_supports_collab",
    type: "unigraph_overview_feature",
    label: "Collaboration and organizational logic",
    userData: {
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
    label: "Vision",
    userData: {
      description: "The future impact of Unigraph.",
    },
  });
  g.createEdgeIfMissing(n1.getId(), n_vision.getId(), {
    label: "vision",
    type: "unigraph_overview_edge",
  });

  // Web 3.0 statement
  const n_web3 = g.createNode({
    id: "unigraph_overview_vision_web3",
    type: "unigraph_overview_vision_statement",
    label: "Web 3.0",
    userData: {
      description: "If successful, Unigraph would become the face of Web 3.0.",
    },
  });
  g.createEdgeIfMissing(n_vision.getId(), n_web3.getId(), {
    type: "unigraph_overview_edge",
  });

  // --- Human-Centric Codification Subgraph ---

  // Root node for this subgraph
  const n_codification_root = g.createNode({
    id: "unigraph_codification_root",
    type: "unigraph_codification_root",
    label: "Human-Centric Codification",
    userData: {
      description:
        "Unigraph aims to enable codification of systems and knowledge in a way that is human-centric.",
    },
  });

  // Link to Vision node
  g.createEdgeIfMissing(
    "unigraph_overview_vision",
    n_codification_root.getId(),
    {
      type: "unigraph_overview_edge",
      label: "enables",
    }
  );

  // Human interpretable and interactive node
  const n_codification_human = g.createNode({
    id: "unigraph_codification_human",
    type: "unigraph_codification_human",
    label: "Human interpretable and interactive",
    userData: {
      description:
        "Codification should be understandable and interactive for humans.",
    },
  });
  g.createEdgeIfMissing(
    n_codification_root.getId(),
    n_codification_human.getId(),
    {
      type: "unigraph_overview_edge",
    }
  );

  // Writing application node
  const n_writing_app = g.createNode({
    id: "unigraph_writing_app",
    type: "unigraph_writing_app",
    label: "High-powered Writing Application",
    userData: {
      description: "Unigraph offers a high-powered writing application.",
    },
  });
  g.createEdgeIfMissing(n_codification_root.getId(), n_writing_app.getId(), {
    type: "unigraph_overview_edge",
  });

  // Writing app features
  const writing_features = [
    { id: "tagging", label: "Tagging" },
    { id: "linking", label: "Linking" },
    { id: "typing", label: "Typing" },
    { id: "data_access_controls", label: "Data access controls" },
    { id: "dynamic_structures", label: "Dynamic structures" },
    { id: "spatial_navigation", label: "Spatial navigation and interaction" },
    { id: "codification", label: "Codification" },
  ];
  writing_features.forEach((feature) => {
    const n = g.createNode({
      id: `unigraph_writing_app_${feature.id}`,
      type: "unigraph_writing_app_feature",
      label: feature.label,
      userData: {},
    });
    g.createEdgeIfMissing(n_writing_app.getId(), n.getId(), {
      type: "unigraph_overview_edge",
    });
  });

  // Entity concept node
  const n_entity_core = g.createNode({
    id: "unigraph_entity_core",
    type: "unigraph_entity_core",
    label: "Entity",
    userData: {
      description:
        "At its core, every object in Unigraph is an Entity. An entity is a single unit of data. It can be a sentence, an image, an annotation on an image, a document, a comment on the document, a link between entities, etc.",
    },
  });
  g.createEdgeIfMissing(n_codification_root.getId(), n_entity_core.getId(), {
    type: "unigraph_overview_edge",
    label: "core concept",
  });

  // Features node (legacy, for compatibility)
  const n2 = g.createNode({
    id: "unigraph_overview_features",
    type: "unigraph_overview_features",
    label: "Features",
    userData: {
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
