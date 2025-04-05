import { SceneGraph } from "../model/SceneGraph";
import { SerializedSceneGraph } from "../model/SerializedSceneGraph";
import { computeCustomLayout, CustomLayoutType } from "./CustomLayoutEngine";
import {
  GraphologyLayoutEngine,
  GraphologyLayoutType,
} from "./GraphologyLayoutEngine";
import {
  GraphvizLayoutEngine,
  GraphvizLayoutType,
} from "./GraphvizLayoutEngine";
import { ILayoutEngineResult, LayoutEngineOption } from "./LayoutEngine";

// Define message format for the worker
interface LayoutWorkerMessage {
  id: string;
  action: "computeLayout";
  layoutType: LayoutEngineOption;
  serializedGraph: SerializedSceneGraph;
}

interface LayoutWorkerResponse {
  id: string;
  result?: ILayoutEngineResult;
  error?: string;
}

// Create a SceneGraph instance from serialized data
function deserializeSceneGraph(
  serializedGraph: SerializedSceneGraph
): SceneGraph {
  const sceneGraph = new SceneGraph();
  sceneGraph.fromSerialized(serializedGraph);
  return sceneGraph;
}

// Handle the layout computation in the worker context
async function handleComputeLayout(
  message: LayoutWorkerMessage
): Promise<ILayoutEngineResult> {
  const { layoutType, serializedGraph } = message;
  const sceneGraph = deserializeSceneGraph(serializedGraph);

  try {
    // Handle different layout types
    if (
      Object.values(GraphologyLayoutType).includes(
        layoutType as GraphologyLayoutType
      )
    ) {
      const positions = await new GraphologyLayoutEngine().computeLayout(
        sceneGraph.getGraph(),
        layoutType as GraphologyLayoutType
      );
      return { positions, layoutType };
    } else if (
      Object.values(GraphvizLayoutType).includes(
        layoutType as GraphvizLayoutType
      )
    ) {
      const output = await GraphvizLayoutEngine.computeLayout(
        sceneGraph,
        layoutType as GraphvizLayoutType
      );
      return { ...output, layoutType };
    } else if (
      Object.values(CustomLayoutType).includes(layoutType as CustomLayoutType)
    ) {
      const positions = computeCustomLayout(
        sceneGraph,
        layoutType as CustomLayoutType
      );
      return { positions, layoutType };
    }

    throw new Error("Invalid layout type: " + layoutType);
  } catch (error) {
    console.error("Error in layout worker:", error);
    throw error;
  }
}

// Worker message handler
self.onmessage = async (e: MessageEvent<LayoutWorkerMessage>) => {
  const message = e.data;

  try {
    if (message.action === "computeLayout") {
      const result = await handleComputeLayout(message);
      const response: LayoutWorkerResponse = {
        id: message.id,
        result,
      };
      self.postMessage(response);
    }
  } catch (error) {
    const response: LayoutWorkerResponse = {
      id: message.id,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};

export {}; // Ensure this is treated as a module
