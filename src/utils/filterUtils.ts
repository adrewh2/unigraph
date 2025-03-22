import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";
import { EntityIds } from "../core/model/entity/entityIds";
import { NodeId } from "../core/model/Node";
import { SceneGraph } from "../core/model/SceneGraph";

export const GetInclusiveTypesAndTags = (
  rules: FilterRuleDefinition[],
  sceneGraph: SceneGraph
) => {
  const includedTypes = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "include" && rule.ruleMode === "typesAndTags") {
      return acc.concat(rule.conditions.types || []);
    }
    return acc;
  }, []);

  const excludedTypes = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "exclude" && rule.ruleMode === "typesAndTags") {
      return acc.concat(rule.conditions.types || []);
    }
    return acc;
  }, []);

  const includedTags = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "include" && rule.ruleMode === "typesAndTags") {
      return acc.concat(rule.conditions.tags || []);
    }
    return acc;
  }, []);

  const excludedTags = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "exclude" && rule.ruleMode === "typesAndTags") {
      return acc.concat(rule.conditions.tags || []);
    }
    return acc;
  }, []);

  const includedNodeIds = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "include" && rule.ruleMode === "entities") {
      return acc.concat(rule.conditions.nodes || []);
    }
    return acc;
  }, []);

  const excludedNodeIds = rules.reduce<string[]>((acc, rule) => {
    if (rule.operator === "exclude" && rule.ruleMode === "entities") {
      return acc.concat(rule.conditions.nodes || []);
    }
    return acc;
  }, []);

  const includedNodes = sceneGraph
    .getNodes()
    .getAll(new EntityIds(includedNodeIds.map((id) => id as NodeId)));
  const excludedNodes = sceneGraph
    .getNodes()
    .getAll(new EntityIds(excludedNodeIds.map((id) => id as NodeId)));

  const includedTypesFromNodes = includedNodes.map((node) => node.getType());
  const includedTagsFromNodes = includedNodes
    .toArray()
    .flatMap((node) => node.getTags());

  const excludedTypesFromNodes = excludedNodes.map((node) => node.getType());
  const excludedTagsFromNodes = excludedNodes
    .toArray()
    .flatMap((node) => node.getTags());

  const finalIncludedTypes = new Set(
    includedTypes
      .concat(includedTypesFromNodes)
      .filter(
        (type) =>
          !excludedTypes.includes(type) &&
          !excludedTypesFromNodes.includes(type)
      )
  );

  const finalIncludedTags = new Set(
    includedTags
      .concat(includedTagsFromNodes.flatMap((set) => Array.from(set)))
      .filter(
        (tag) =>
          !excludedTags.includes(tag) &&
          !excludedTagsFromNodes.some((set) => set.has(tag))
      )
  );

  const filteredNodes = sceneGraph
    .getNodes()
    .filter(
      (node) =>
        finalIncludedTypes.has(node.getType()) ||
        Array.from(node.getTags()).some((tag) => finalIncludedTags.has(tag))
    );
  const filteredEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(filteredNodes.getIds());

  return {
    node: {
      types: Array.from(finalIncludedTypes),
      tags: Array.from(finalIncludedTags),
    },
    edge: {
      types: filteredEdges.getTypes(),
      tags: filteredEdges.getTags(),
    },
  };
};
