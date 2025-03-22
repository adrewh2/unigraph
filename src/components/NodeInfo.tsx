import { ChevronRight, Focus, Maximize, ZoomIn } from "lucide-react";
import React, { useMemo } from "react";
import { NodeId } from "../core/model/Node";
import { getCurrentSceneGraph } from "../store/appConfigStore";
import { getSelectedNodeId } from "../store/graphInteractionStore";
import { Badge } from "./Badge";
import styles from "./NodeInfo.module.css";

interface NodeInfoProps {
  onFocusNode?: (nodeId: NodeId) => void;
  onExpandNeighborhood?: (nodeId: NodeId) => void;
  onZoomToNode?: (nodeId: NodeId) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  onFocusNode,
  onExpandNeighborhood,
  onZoomToNode,
}) => {
  const selectedNodeId = getSelectedNodeId();
  const sceneGraph = getCurrentSceneGraph();

  const nodeData = useMemo(() => {
    if (!selectedNodeId) return null;

    const node = sceneGraph.getGraph().getNode(selectedNodeId);
    if (!node) return null;

    const connectedEdges = sceneGraph
      .getGraph()
      .getEdgesConnectedToNodes(selectedNodeId);
    const neighbors = connectedEdges.map((edge) => {
      const otherId =
        edge.getSource() === selectedNodeId
          ? edge.getTarget()
          : edge.getSource();
      const otherNode = sceneGraph.getGraph().getNode(otherId);
      return {
        id: otherId,
        label: otherNode.getLabel(),
        type: otherNode.getType(),
        edgeType: edge.getType(),
        isSource: edge.getSource() === selectedNodeId,
      };
    });

    return {
      id: node.getId(),
      label: node.getLabel(),
      type: node.getType(),
      description: node.getDescription(),
      tags: Array.from(node.getTags()),
      userData: node.getData().userData,
      neighbors,
      position: node.getPosition(),
      dimensions: node.getDimensions(),
    };
  }, [selectedNodeId, sceneGraph]);

  if (!nodeData) {
    return (
      <div className={styles.emptyState}>
        <p>No node selected</p>
        <p className={styles.hint}>Click on a node to view its details</p>
      </div>
    );
  }

  return (
    <div className={styles.nodeInfoCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{nodeData.label || "Unnamed Node"}</h3>
        <div className={styles.actions}>
          {onFocusNode && (
            <button
              onClick={() => onFocusNode(nodeData.id)}
              className={styles.actionButton}
              title="Focus on node"
            >
              <Focus size={16} />
            </button>
          )}
          {onExpandNeighborhood && (
            <button
              onClick={() => onExpandNeighborhood(nodeData.id)}
              className={styles.actionButton}
              title="Expand neighborhood"
            >
              <Maximize size={16} />
            </button>
          )}
          {onZoomToNode && (
            <button
              onClick={() => onZoomToNode(nodeData.id)}
              className={styles.actionButton}
              title="Zoom to node"
            >
              <ZoomIn size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.typeLabel}>Type</div>
          <Badge text={nodeData.type} color="#4e84d5" />
        </div>

        {nodeData.description && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Description</div>
            <p className={styles.description}>{nodeData.description}</p>
          </div>
        )}

        {nodeData.tags.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Tags</div>
            <div className={styles.tagsList}>
              {nodeData.tags.map((tag) => (
                <Badge key={tag} text={tag} color="#6b7280" small />
              ))}
            </div>
          </div>
        )}

        {nodeData.neighbors.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Connected Nodes</div>
            <div className={styles.neighborsList}>
              {nodeData.neighbors.map((neighbor) => (
                <div key={neighbor.id} className={styles.neighborItem}>
                  <div className={styles.neighborDirection}>
                    {neighbor.isSource ? (
                      <ChevronRight size={12} className={styles.outgoing} />
                    ) : (
                      <ChevronRight size={12} className={styles.incoming} />
                    )}
                  </div>
                  <div className={styles.neighborInfo}>
                    <div className={styles.neighborLabel}>
                      {neighbor.label || neighbor.id}
                    </div>
                    <div className={styles.neighborType}>
                      {neighbor.edgeType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nodeData.position && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Position</div>
            <div className={styles.coordinates}>
              <span>X: {nodeData.position.x.toFixed(2)}</span>
              <span>Y: {nodeData.position.y.toFixed(2)}</span>
              {nodeData.position.z !== undefined && (
                <span>Z: {nodeData.position.z.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeInfo;
