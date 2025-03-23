import React from "react";
import { findNodeInForceGraph } from "../core/force-graph/forceGraphHelpers";
import { NodeId } from "../core/model/Node";
import { flyToNode } from "../core/webgl/webglHelpers";
import useAppConfigStore from "../store/appConfigStore";
import styles from "./MultiNodeInfo.module.css";
import NodeInfo from "./NodeInfo";

interface MultiNodeInfoProps {
  nodeIds: NodeId[];
  onFocusNode?: (nodeId: NodeId) => void;
  onZoomToNode?: (nodeId: NodeId) => void;
}

const MultiNodeInfo: React.FC<MultiNodeInfoProps> = ({
  nodeIds,
  onFocusNode,
  onZoomToNode,
}) => {
  const { forceGraphInstance, activeView } = useAppConfigStore();

  const handleFocusNode = (nodeId: NodeId) => {
    if (onFocusNode) {
      onFocusNode(nodeId);
      return;
    }

    // Default behavior if no custom handler provided
    if (forceGraphInstance && activeView === "ForceGraph3d") {
      const node = findNodeInForceGraph(forceGraphInstance, nodeId);
      if (node) {
        flyToNode(forceGraphInstance, node);
      }
    }
  };

  return (
    <div className={styles.multiNodeContainer}>
      <div className={styles.selectedCountLabel}>
        {nodeIds.length} node{nodeIds.length !== 1 ? "s" : ""} selected
      </div>
      <div className={styles.nodeList}>
        {nodeIds.map((nodeId) => (
          <div key={nodeId} className={styles.nodeInfoWrapper}>
            <NodeInfo
              nodeId={nodeId}
              onFocusNode={handleFocusNode}
              onZoomToNode={onZoomToNode}
              compact={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiNodeInfo;
