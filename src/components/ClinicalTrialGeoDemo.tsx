import React from "react";
import { clinicalTrialGeoPipeline } from "../data/clinicalTrialGeoPipeline";
import TypeSystemPanel from "./reactflow/TypeSystemPanel";

const ClinicalTrialGeoDemo: React.FC = () => {
  return (
    <TypeSystemPanel
      initialData={{
        nodes: [
          // Add type nodes
          ...clinicalTrialGeoPipeline.types.map((type, idx) => ({
            id: type.id,
            type: "typeNode",
            position: { x: 100, y: 100 + idx * 150 },
            data: {
              label: type.name,
              description: type.description,
              properties: Object.entries(type.properties).reduce<
                Record<string, any>
              >((acc, [name, prop]) => {
                acc[name] = prop.type;
                return acc;
              }, {}),
            },
          })),
          // Add instance nodes
          ...clinicalTrialGeoPipeline.instances.map((instance, idx) => ({
            id: instance.id,
            type: "dataNode",
            position: { x: 400, y: 100 + idx * 200 },
            data: {
              label: instance.name,
              description: instance.description,
              typeName: instance.type.replace("type-", ""),
            },
          })),
          // Add function nodes
          ...clinicalTrialGeoPipeline.functions.map((func, idx) => ({
            id: func.id,
            type: "functionNode",
            position: { x: 700, y: 100 + idx * 200 },
            data: {
              label: func.name,
              description: func.description,
              inputs: func.inputs.map((input) => ({
                name: input.name,
                type: input.type.replace("type-", ""),
                required: input.required,
              })),
              outputs: func.outputs.map((output) => ({
                name: output.name,
                type: output.type.replace("type-", ""),
              })),
              tags: func.tags,
            },
          })),
        ],
        edges: clinicalTrialGeoPipeline.connections.map((conn) => ({
          id: conn.id,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourcePort ?? "data-out",
          targetHandle: conn.targetPort ?? "data-in",
          animated: true,
          style: { stroke: "#4caf50" },
        })),
      }}
    />
  );
};

export default ClinicalTrialGeoDemo;
