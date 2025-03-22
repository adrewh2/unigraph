import { FilterRuleDefinition } from "../../components/filters/FilterRuleDefinition";
import { Node } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { GetInclusiveTypesAndTags } from "../filterUtils";

describe("GetInclusiveTypesAndTags", () => {
  it("should return included types and tags excluding the excluded ones", () => {
    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type1", "type2"],
          tags: ["tag1", "tag2"],
        },
      },
      {
        id: "2",
        operator: "exclude",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type2"],
          tags: ["tag2"],
        },
      },
      {
        id: "3",
        operator: "include",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type3"],
          tags: ["tag3"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: ["type1", "type3"],
      tags: ["tag1", "tag3"],
    });
  });

  it("should handle empty rules", () => {
    const rules: FilterRuleDefinition[] = [];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: [],
      tags: [],
    });
  });

  it("should handle rules with no conditions", () => {
    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "typesAndTags",
        conditions: {},
      },
      {
        id: "2",
        operator: "exclude",
        ruleMode: "typesAndTags",
        conditions: {},
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: [],
      tags: [],
    });
  });

  it("should handle rules with only included types and tags", () => {
    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type1", "type2"],
          tags: ["tag1", "tag2"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: ["type1", "type2"],
      tags: ["tag1", "tag2"],
    });
  });

  it("should handle rules with only excluded types and tags", () => {
    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "exclude",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type1", "type2"],
          tags: ["tag1", "tag2"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: [],
      tags: [],
    });
  });

  it("should ignore rules with non-matching ruleMode", () => {
    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "entities",
        conditions: {
          nodes: ["node1"],
        },
      },
      {
        id: "2",
        operator: "exclude",
        ruleMode: "entities",
        conditions: {
          nodes: ["node2"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, new SceneGraph());

    expect(result).toEqual({
      types: [],
      tags: [],
    });
  });

  it("should include types and tags from nodes specified in entities ruleMode", () => {
    const sceneGraph = new SceneGraph();
    const node1 = new Node("node1", { type: "type1", tags: new Set(["tag1"]) });
    const node2 = new Node("node2", { type: "type2", tags: new Set(["tag2"]) });
    const node3 = new Node("node3", { type: "type3", tags: new Set(["tag3"]) });

    sceneGraph.getGraph().addNode(node1);
    sceneGraph.getGraph().addNode(node2);
    sceneGraph.getGraph().addNode(node3);

    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "entities",
        conditions: {
          nodes: ["node1", "node2"],
        },
      },
      {
        id: "2",
        operator: "exclude",
        ruleMode: "typesAndTags",
        conditions: {
          types: ["type2"],
          tags: ["tag2"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, sceneGraph);

    expect(result).toEqual({
      types: ["type1"],
      tags: ["tag1"],
    });
  });

  it("should handle entities ruleMode with no matching nodes", () => {
    const sceneGraph = new SceneGraph();
    const node1 = new Node("node1", { type: "type1", tags: new Set(["tag1"]) });
    const node2 = new Node("node2", { type: "type2", tags: new Set(["tag2"]) });

    sceneGraph.getGraph().addNode(node1);
    sceneGraph.getGraph().addNode(node2);

    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "entities",
        conditions: {
          nodes: ["node3"], // Node3 does not exist
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, sceneGraph);

    expect(result).toEqual({
      types: [],
      tags: [],
    });
  });

  it("should handle entities ruleMode with mixed include and exclude rules", () => {
    const sceneGraph = new SceneGraph();
    const node1 = new Node("node1", { type: "type1", tags: new Set(["tag1"]) });
    const node2 = new Node("node2", { type: "type2", tags: new Set(["tag2"]) });
    const node3 = new Node("node3", { type: "type3", tags: new Set(["tag3"]) });

    sceneGraph.getGraph().addNode(node1);
    sceneGraph.getGraph().addNode(node2);
    sceneGraph.getGraph().addNode(node3);

    const rules: FilterRuleDefinition[] = [
      {
        id: "1",
        operator: "include",
        ruleMode: "entities",
        conditions: {
          nodes: ["node1", "node2"],
        },
      },
      {
        id: "2",
        operator: "exclude",
        ruleMode: "entities",
        conditions: {
          nodes: ["node2"],
        },
      },
    ];

    const result = GetInclusiveTypesAndTags(rules, sceneGraph);

    expect(result).toEqual({
      types: ["type1"],
      tags: ["tag1"],
    });
  });
});
