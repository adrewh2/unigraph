/**
 * Type System Schema Definition
 *
 * This file defines interfaces for a type system that supports
 * data types, instances, and functions for analytics pipelines.
 */

// Base interface for all schema elements
export interface SchemaElement {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

// Data type definition
export interface DataType extends SchemaElement {
  properties: {
    [propertyName: string]: {
      type: string;
      description?: string;
      required?: boolean;
      defaultValue?: any;
    };
  };
}

// Data instance definition
export interface DataInstance extends SchemaElement {
  type: string; // References a DataType.id
  data?: Record<string, any>; // Actual data values if available
  preview?:
    | {
        columns?: Array<{ name: string; type: string; width?: number }>;
        rows?: Array<Record<string, any>>;
      }
    | Record<string, any>
    | string; // Preview representation
}

// Function parameter/input definition
export interface FunctionParameter {
  name: string;
  type: string; // References a DataType.id or built-in type
  description?: string;
  required?: boolean;
  defaultValue?: any;
}

// Function output definition
export interface FunctionOutput {
  name: string;
  type: string; // References a DataType.id or built-in type
  description?: string;
}

// Function definition
export interface Function extends SchemaElement {
  inputs: FunctionParameter[];
  outputs: FunctionOutput[];
  implementation?: string; // Reference to actual function implementation
}

// Connection between function and data instance
export interface Connection {
  id: string;
  source: string; // DataInstance.id or Function.id
  sourcePort?: string; // Optional port name (e.g., 'output-data')
  target: string; // Function.id or DataInstance.id
  targetPort?: string; // Optional port name (e.g., 'input-data')
}

// Complete analytics pipeline configuration
export interface TypeSystemConfig {
  name: string;
  description?: string;
  types: DataType[];
  instances: DataInstance[];
  functions: Function[];
  connections: Connection[];
}

// Type registry for managing types and instances
export interface TypeRegistry {
  getType(typeId: string): DataType | null;
  getInstance(instanceId: string): DataInstance | null;
  getFunction(functionId: string): Function | null;
  findInstancesByType(typeId: string): DataInstance[];
  findCompatibleFunctions(dataTypeId: string): Function[];
}

// Node position data for layout
export interface NodePositionData {
  [nodeId: string]: {
    x: number;
    y: number;
    z?: number;
  };
}
