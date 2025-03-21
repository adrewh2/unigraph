import { RenderingManager } from "../../controllers/RenderingManager";
import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import { getLegendMode } from "../../store/appConfigStore";
import { IEntity } from "../model/entity/abstractEntity";

export const getNodeIsVisible = (node: IEntity): boolean =>
  RenderingManager.getVisibility(node, getNodeLegendConfig(), getLegendMode());

export const getNodeColor = (node: IEntity): string =>
  RenderingManager.getColor(node, getNodeLegendConfig(), getLegendMode());

export const getEdgeIsVisible = (edge: IEntity): boolean =>
  RenderingManager.getVisibility(edge, getEdgeLegendConfig(), getLegendMode());

export const getEdgeColor = (edge: IEntity): string =>
  RenderingManager.getColor(edge, getEdgeLegendConfig(), getLegendMode());
