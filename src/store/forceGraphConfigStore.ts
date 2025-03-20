export interface IForceGraphRenderConfig {
  nodeTextLabels: boolean;
  linkWidth: number;
  nodeSize: number;
  linkTextLabels: boolean;
  nodeOpacity: number;
  linkOpacity: number;
  chargeStrength: number;
}

export const DEFAULT_FORCE_GRAPH_RENDER_CONFIG: IForceGraphRenderConfig = {
  nodeTextLabels: false,
  linkWidth: 2,
  nodeSize: 6,
  linkTextLabels: true,
  nodeOpacity: 1,
  linkOpacity: 1,
  //phyics
  chargeStrength: -30, // default.
};
