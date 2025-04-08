import DataNode from "./DataNode";
import FunctionNode from "./FunctionNode";
import TypeNode from "./TypeNode";

export * from "./DataNode";
export * from "./FunctionNode";
export * from "./TypeNode";

export const nodeTypes = {
  typeNode: TypeNode,
  dataNode: DataNode,
  functionNode: FunctionNode,
};
