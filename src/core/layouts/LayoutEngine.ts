import { SceneGraph } from "../model/SceneGraph";
import { computeCustomLayout, CustomLayoutType } from "./CustomLayoutEngine";
import {
  GraphologyLayoutEngine,
  GraphologyLayoutType,
} from "./GraphologyLayoutEngine";
import {
  GraphvizLayoutEngine,
  GraphvizLayoutType,
} from "./GraphvizLayoutEngine";
import { NodePositionData } from "./layoutHelpers";

export enum PresetLayoutType {
  Preset = "Preset",
  NodePositions = "NodePositions", // Use the positions stored in the graph nodes
}

export type LayoutEngineOption =
  | GraphvizLayoutType
  | GraphologyLayoutType
  | CustomLayoutType
  | PresetLayoutType;

export const LayoutEngineOptionLabels = [
  ...Object.values(GraphvizLayoutType),
  ...Object.values(GraphologyLayoutType),
  ...Object.values(CustomLayoutType),
  ...Object.values(PresetLayoutType),
];

export interface ILayoutEngineResult {
  positions: NodePositionData;
  svg?: string;
  layoutType: LayoutEngineOption | string;
}

// Map to store pending layout computations by ID
const pendingComputations = new Map<
  string,
  {
    resolve: (result: ILayoutEngineResult) => void;
    reject: (error: Error) => void;
  }
>();

// Create a worker instance for layout computations
let layoutWorker: Worker | null = null;

// Initialize the layout worker
function getLayoutWorker(): Worker {
  if (!layoutWorker) {
    // Create the worker
    layoutWorker = new Worker(new URL("./LayoutWorker.ts", import.meta.url), {
      type: "module",
    });

    // Set up message handler
    layoutWorker.onmessage = (e: MessageEvent) => {
      const response = e.data;
      const pendingComputation = pendingComputations.get(response.id);

      if (pendingComputation) {
        if (response.error) {
          pendingComputation.reject(new Error(response.error));
        } else {
          pendingComputation.resolve(response.result);
        }
        pendingComputations.delete(response.id);
      }
    };

    // Handle worker errors
    layoutWorker.onerror = (error) => {
      console.error("Layout worker error:", error);
      // On critical worker errors, we'll reset the worker
      layoutWorker = null;
    };
  }

  return layoutWorker;
}

export class LayoutEngine {
  private static isComputingSafeLayout: boolean = false;

  public static async safeComputeLayout(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult | null> {
    if (LayoutEngine.isComputingSafeLayout) {
      console.log("Layout computation already in progress, skipping...");
      return null;
    }
    LayoutEngine.isComputingSafeLayout = true;
    console.log("Computing layout using worker...");
    const startTime = Date.now();

    try {
      const result = await LayoutEngine.computeLayoutWithWorker(
        sceneGraph,
        layoutType
      );
      return result;
    } catch (error) {
      console.error(
        "Worker layout computation failed, falling back to main thread:",
        error
      );
      // Fallback to main thread computation if worker fails
      return await LayoutEngine.computeLayout(sceneGraph, layoutType);
    } finally {
      LayoutEngine.isComputingSafeLayout = false;
      const endTime = Date.now();
      console.log(
        `${layoutType} Layout computation took ${endTime - startTime} ms`
      );
    }
  }

  /**
   * Compute layout using a web worker
   */
  private static computeLayoutWithWorker(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult> {
    return new Promise((resolve, reject) => {
      try {
        // Generate a unique ID for this computation
        const id = `layout-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Store the callbacks
        pendingComputations.set(id, { resolve, reject });

        // Serialize the scene graph for the worker
        const serializedGraph = sceneGraph.toSerialized();

        // Send the message to the worker
        getLayoutWorker().postMessage({
          id,
          action: "computeLayout",
          layoutType,
          serializedGraph,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async computeLayout(
    sceneGraph: SceneGraph,
    layoutType: LayoutEngineOption
  ): Promise<ILayoutEngineResult> {
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
  }
}

export const Compute_Layout = (
  sceneGraph: SceneGraph,
  layoutType: LayoutEngineOption
): Promise<ILayoutEngineResult | null> => {
  return LayoutEngine.safeComputeLayout(sceneGraph, layoutType);
};
