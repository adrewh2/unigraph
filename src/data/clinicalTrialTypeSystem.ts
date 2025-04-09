import { Edge, MarkerType, Node } from "@xyflow/react";
import {
  Connection,
  DataInstance,
  DataType,
  Function,
} from "./../types/typeSystem";

/**
 * We need to define the TypeSystemConfig interface here since it's missing
 */
export interface TypeSystemConfig {
  name: string;
  description?: string;
  types: DataType[];
  instances: DataInstance[];
  functions: Function[];
  connections: Connection[];
}

/**
 * A basic implementation of the TypeRegistry interface for clinical trials
 */
export class DemoTypeRegistry {
  public config: TypeSystemConfig;

  constructor(config: TypeSystemConfig) {
    this.config = config;
  }

  getType(typeId: string) {
    return this.config.types.find((type) => type.id === typeId) || null;
  }

  getInstance(instanceId: string) {
    return (
      this.config.instances.find((instance) => instance.id === instanceId) ||
      null
    );
  }

  getFunction(functionId: string) {
    return this.config.functions.find((func) => func.id === functionId) || null;
  }

  findInstancesByType(typeId: string) {
    return this.config.instances.filter((instance) => instance.type === typeId);
  }

  findCompatibleFunctions(dataTypeId: string) {
    return this.config.functions.filter((func) => {
      return func.inputs.some((input) => input.type === dataTypeId);
    });
  }

  /**
   * Get compatible functions for a specific data instance
   */
  findCompatibleFunctionsForInstance(instanceId: string) {
    const instance = this.getInstance(instanceId);
    if (!instance) return [];

    return this.findCompatibleFunctions(instance.type);
  }

  /**
   * Get compatible data instances for a specific function input
   */
  findCompatibleInstancesForFunction(functionId: string, inputName: string) {
    const func = this.getFunction(functionId);
    if (!func) return [];

    const input = func.inputs.find((i) => i.name === inputName);
    if (!input) return [];

    return this.findInstancesByType(input.type);
  }
}

// Clinical trial config definition follows...
export const clinicalTrialAnalyticsPipeline: TypeSystemConfig = {
  name: "Clinical Trial Data Analytics Pipeline",
  description:
    "Analytics pipeline for processing and analyzing clinical trial data",

  // Define data types for clinical trials
  types: [
    {
      id: "type-patient",
      name: "Patient",
      description: "Clinical trial participant data",
      tags: ["demographic", "subject"],
      properties: {
        patientId: {
          type: "string",
          required: true,
          description: "Unique patient identifier",
        },
        age: { type: "number", required: true },
        sex: { type: "string", required: true },
        ethnicity: { type: "string", required: true },
        weight: { type: "number", description: "Weight in kg" },
        height: { type: "number", description: "Height in cm" },
        medicalHistory: {
          type: "array",
          description: "List of pre-existing conditions",
        },
        concomitantMeds: {
          type: "array",
          description: "Other medications being taken",
        },
        studyGroup: {
          type: "string",
          description: "Treatment or control group assignment",
        },
      },
    },
    {
      id: "type-vitals",
      name: "VitalSigns",
      description: "Patient vital measurements during study visits",
      tags: ["measurement", "timeseries"],
      properties: {
        patientId: { type: "string", required: true },
        visitId: { type: "string", required: true },
        timestamp: { type: "date", required: true },
        systolicBP: {
          type: "number",
          description: "Systolic blood pressure (mmHg)",
        },
        diastolicBP: {
          type: "number",
          description: "Diastolic blood pressure (mmHg)",
        },
        heartRate: { type: "number", description: "Heart rate (bpm)" },
        temperature: { type: "number", description: "Body temperature (°C)" },
        respiratoryRate: { type: "number", description: "Breaths per minute" },
        oxygenSaturation: { type: "number", description: "SpO2 (%)" },
      },
    },
    {
      id: "type-labresult",
      name: "LabResult",
      description: "Laboratory test results",
      tags: ["measurement", "timeseries"],
      properties: {
        patientId: { type: "string", required: true },
        visitId: { type: "string", required: true },
        timestamp: { type: "date", required: true },
        testCode: { type: "string", required: true },
        testName: { type: "string", required: true },
        value: { type: "number", required: true },
        unit: { type: "string", required: true },
        referenceRangeLow: { type: "number" },
        referenceRangeHigh: { type: "number" },
        abnormalFlag: {
          type: "string",
          description: "H (high), L (low), or N (normal)",
        },
      },
    },
    {
      id: "type-adverseevent",
      name: "AdverseEvent",
      description: "Adverse event report",
      tags: ["safety", "event"],
      properties: {
        patientId: { type: "string", required: true },
        eventId: { type: "string", required: true },
        startDate: { type: "date", required: true },
        endDate: { type: "date" },
        description: { type: "string", required: true },
        severity: {
          type: "string",
          required: true,
          description: "Mild, Moderate, Severe",
        },
        serious: { type: "boolean", required: true },
        relatedToTreatment: {
          type: "string",
          description: "Related, Possibly, Not Related",
        },
        action: {
          type: "string",
          description: "None, Dose Reduced, Treatment Stopped, etc.",
        },
        outcome: { type: "string", description: "Resolved, Ongoing, etc." },
      },
    },
    {
      id: "type-efficacy",
      name: "EfficacyMeasure",
      description: "Primary and secondary efficacy outcomes",
      tags: ["outcome", "measurement"],
      properties: {
        patientId: { type: "string", required: true },
        visitId: { type: "string", required: true },
        timestamp: { type: "date", required: true },
        measureType: {
          type: "string",
          required: true,
          description: "Primary or secondary outcome measure",
        },
        endpoint: {
          type: "string",
          required: true,
          description: "Specific endpoint being measured",
        },
        value: { type: "number", required: true },
        unit: { type: "string" },
        clinicallySignificant: {
          type: "boolean",
          description: "Whether the change is clinically meaningful",
        },
      },
    },
    {
      id: "type-patientgroup",
      name: "PatientGroup",
      description: "Grouped patient data for analysis",
      tags: ["analysis", "group"],
      properties: {
        groupId: { type: "string", required: true },
        groupName: { type: "string", required: true },
        criteria: {
          type: "string",
          description: "Criteria used to form the group",
        },
        patientIds: {
          type: "array",
          required: true,
          description: "List of patient IDs in the group",
        },
        size: {
          type: "number",
          required: true,
          description: "Number of patients",
        },
      },
    },
    {
      id: "type-statistics",
      name: "StatisticalResults",
      description: "Statistical analysis results",
      tags: ["analysis", "outcome"],
      properties: {
        analysisType: {
          type: "string",
          required: true,
          description: "Type of statistical test performed",
        },
        groups: {
          type: "array",
          required: true,
          description: "Groups compared",
        },
        endpoint: { type: "string", required: true },
        pValue: {
          type: "number",
          description: "P-value from statistical test",
        },
        effectSize: { type: "number", description: "Magnitude of the effect" },
        confidenceInterval: {
          type: "object",
          description: "95% confidence interval",
        },
        significant: {
          type: "boolean",
          description: "Statistical significance",
        },
      },
    },
    {
      id: "type-visualization",
      name: "VisualizationData",
      description: "Prepared data for visualization",
      tags: ["reporting", "visualization"],
      properties: {
        chartType: {
          type: "string",
          required: true,
          description: "Type of visualization",
        },
        title: { type: "string", required: true },
        xAxis: { type: "string", description: "X-axis title" },
        yAxis: { type: "string", description: "Y-axis title" },
        labels: { type: "array", description: "Data labels" },
        datasets: { type: "array", required: true, description: "Data series" },
        options: { type: "object", description: "Visualization options" },
      },
    },
  ],

  // Define data instances for clinical trials
  instances: [
    {
      id: "data-patients",
      name: "Trial XYZ-123 Patients",
      description: "Clinical trial participant demographic data",
      type: "type-patient",
      tags: ["demographic", "baseline"],
      preview: {
        columns: [
          { name: "patientId", type: "string", width: 80 },
          { name: "age", type: "number", width: 60 },
          { name: "sex", type: "string", width: 60 },
          { name: "ethnicity", type: "string", width: 100 },
          { name: "studyGroup", type: "string", width: 100 },
        ],
        rows: [
          {
            patientId: "P001",
            age: 67,
            sex: "F",
            ethnicity: "White",
            studyGroup: "Treatment",
          },
          {
            patientId: "P002",
            age: 54,
            sex: "M",
            ethnicity: "Black",
            studyGroup: "Treatment",
          },
          {
            patientId: "P003",
            age: 61,
            sex: "M",
            ethnicity: "Hispanic",
            studyGroup: "Placebo",
          },
          {
            patientId: "P004",
            age: 48,
            sex: "F",
            ethnicity: "Asian",
            studyGroup: "Treatment",
          },
          {
            patientId: "P005",
            age: 72,
            sex: "F",
            ethnicity: "White",
            studyGroup: "Placebo",
          },
        ],
      },
    },
    {
      id: "data-vitalsigns",
      name: "Vital Signs Measurements",
      description: "Patient vital sign readings across all visits",
      type: "type-vitals",
      tags: ["measurement", "safety"],
      preview: {
        columns: [
          { name: "patientId", type: "string", width: 80 },
          { name: "visitId", type: "string", width: 80 },
          { name: "timestamp", type: "date", width: 100 },
          { name: "systolicBP", type: "number", width: 80 },
          { name: "diastolicBP", type: "number", width: 80 },
          { name: "heartRate", type: "number", width: 80 },
        ],
        rows: [
          {
            patientId: "P001",
            visitId: "V1",
            timestamp: "2023-01-10",
            systolicBP: 135,
            diastolicBP: 85,
            heartRate: 72,
          },
          {
            patientId: "P001",
            visitId: "V2",
            timestamp: "2023-02-10",
            systolicBP: 128,
            diastolicBP: 82,
            heartRate: 68,
          },
          {
            patientId: "P002",
            visitId: "V1",
            timestamp: "2023-01-12",
            systolicBP: 142,
            diastolicBP: 88,
            heartRate: 76,
          },
          {
            patientId: "P002",
            visitId: "V2",
            timestamp: "2023-02-12",
            systolicBP: 138,
            diastolicBP: 86,
            heartRate: 74,
          },
          {
            patientId: "P003",
            visitId: "V1",
            timestamp: "2023-01-15",
            systolicBP: 122,
            diastolicBP: 78,
            heartRate: 64,
          },
        ],
      },
    },
    {
      id: "data-labtests",
      name: "Laboratory Test Results",
      description: "Clinical laboratory results for all patients",
      type: "type-labresult",
      tags: ["measurement", "safety"],
      preview: {
        columns: [
          { name: "patientId", type: "string", width: 80 },
          { name: "visitId", type: "string", width: 80 },
          { name: "testName", type: "string", width: 120 },
          { name: "value", type: "number", width: 70 },
          { name: "unit", type: "string", width: 60 },
          { name: "abnormalFlag", type: "string", width: 60 },
        ],
        rows: [
          {
            patientId: "P001",
            visitId: "V1",
            testName: "Hemoglobin",
            value: 13.2,
            unit: "g/dL",
            abnormalFlag: "N",
          },
          {
            patientId: "P001",
            visitId: "V1",
            testName: "ALT",
            value: 32,
            unit: "U/L",
            abnormalFlag: "N",
          },
          {
            patientId: "P002",
            visitId: "V1",
            testName: "Hemoglobin",
            value: 11.8,
            unit: "g/dL",
            abnormalFlag: "L",
          },
          {
            patientId: "P002",
            visitId: "V1",
            testName: "ALT",
            value: 45,
            unit: "U/L",
            abnormalFlag: "H",
          },
          {
            patientId: "P003",
            visitId: "V1",
            testName: "Glucose",
            value: 105,
            unit: "mg/dL",
            abnormalFlag: "N",
          },
        ],
      },
    },
    {
      id: "data-adverse-events",
      name: "Adverse Event Reports",
      description: "All reported adverse events during the trial",
      type: "type-adverseevent",
      tags: ["safety", "event"],
      preview: {
        columns: [
          { name: "patientId", type: "string", width: 80 },
          { name: "description", type: "string", width: 150 },
          { name: "startDate", type: "date", width: 100 },
          { name: "severity", type: "string", width: 80 },
          { name: "serious", type: "boolean", width: 70 },
          { name: "relatedToTreatment", type: "string", width: 120 },
        ],
        rows: [
          {
            patientId: "P001",
            description: "Headache",
            startDate: "2023-01-15",
            severity: "Mild",
            serious: false,
            relatedToTreatment: "Possibly",
          },
          {
            patientId: "P002",
            description: "Nausea",
            startDate: "2023-01-20",
            severity: "Moderate",
            serious: false,
            relatedToTreatment: "Related",
          },
          {
            patientId: "P004",
            description: "Dizziness",
            startDate: "2023-02-05",
            severity: "Mild",
            serious: false,
            relatedToTreatment: "Possibly",
          },
          {
            patientId: "P005",
            description: "Rash",
            startDate: "2023-02-12",
            severity: "Moderate",
            serious: false,
            relatedToTreatment: "Related",
          },
          {
            patientId: "P002",
            description: "Chest Pain",
            startDate: "2023-02-28",
            severity: "Severe",
            serious: true,
            relatedToTreatment: "Not Related",
          },
        ],
      },
    },
    {
      id: "data-efficacy",
      name: "Primary Efficacy Outcomes",
      description: "Primary endpoint measurements for efficacy analysis",
      type: "type-efficacy",
      tags: ["outcome", "efficacy"],
      preview: {
        columns: [
          { name: "patientId", type: "string", width: 80 },
          { name: "visitId", type: "string", width: 80 },
          { name: "endpoint", type: "string", width: 150 },
          { name: "value", type: "number", width: 80 },
          { name: "unit", type: "string", width: 60 },
          { name: "clinicallySignificant", type: "boolean", width: 80 },
        ],
        rows: [
          {
            patientId: "P001",
            visitId: "V1",
            endpoint: "Tumor Size",
            value: 3.2,
            unit: "cm",
            clinicallySignificant: false,
          },
          {
            patientId: "P001",
            visitId: "V3",
            endpoint: "Tumor Size",
            value: 2.1,
            unit: "cm",
            clinicallySignificant: true,
          },
          {
            patientId: "P002",
            visitId: "V1",
            endpoint: "Tumor Size",
            value: 2.8,
            unit: "cm",
            clinicallySignificant: false,
          },
          {
            patientId: "P002",
            visitId: "V3",
            endpoint: "Tumor Size",
            value: 1.9,
            unit: "cm",
            clinicallySignificant: true,
          },
          {
            patientId: "P003",
            visitId: "V1",
            endpoint: "Tumor Size",
            value: 3.5,
            unit: "cm",
            clinicallySignificant: false,
          },
          {
            patientId: "P003",
            visitId: "V3",
            endpoint: "Tumor Size",
            value: 3.2,
            unit: "cm",
            clinicallySignificant: false,
          },
        ],
      },
    },
  ],

  // Define functions that can process clinical trial data
  functions: [
    {
      id: "func-patient-grouping",
      name: "Patient Stratification",
      description: "Group patients by demographic or clinical characteristics",
      tags: ["analysis", "grouping"],
      inputs: [
        { name: "patients", type: "type-patient", required: true },
        {
          name: "groupingAttribute",
          type: "string",
          required: true,
          defaultValue: "studyGroup",
        },
        { name: "includePatientIds", type: "array", required: false },
      ],
      outputs: [
        {
          name: "patientGroups",
          type: "type-patientgroup",
          description: "Stratified patient groups",
        },
      ],
    },
    {
      id: "func-vitals-analysis",
      name: "Vital Signs Analysis",
      description: "Analyze trends and changes in vital signs",
      tags: ["analysis", "safety"],
      inputs: [
        { name: "vitals", type: "type-vitals", required: true },
        { name: "patientGroups", type: "type-patientgroup", required: false },
        {
          name: "timepoints",
          type: "array",
          required: false,
          description: "Specific visits to analyze",
        },
      ],
      outputs: [
        {
          name: "statistics",
          type: "type-statistics",
          description: "Statistical analysis results",
        },
        {
          name: "visualization",
          type: "type-visualization",
          description: "Visualization-ready data",
        },
      ],
    },
    {
      id: "func-lab-abnormalities",
      name: "Lab Abnormality Detection",
      description: "Identify and summarize abnormal laboratory findings",
      tags: ["safety", "analysis"],
      inputs: [
        { name: "labResults", type: "type-labresult", required: true },
        { name: "patientGroups", type: "type-patientgroup", required: false },
        { name: "testsOfInterest", type: "array", required: false },
      ],
      outputs: [
        {
          name: "abnormalityReport",
          type: "type-statistics",
          description: "Summary of abnormalities by group",
        },
        {
          name: "visualization",
          type: "type-visualization",
          description: "Abnormality visualization data",
        },
      ],
    },
    {
      id: "func-ae-summary",
      name: "Adverse Event Summary",
      description:
        "Summarize adverse events by frequency, severity, and relatedness",
      tags: ["safety", "reporting"],
      inputs: [
        { name: "adverseEvents", type: "type-adverseevent", required: true },
        { name: "patients", type: "type-patient", required: true },
        {
          name: "groupByAttribute",
          type: "string",
          defaultValue: "studyGroup",
        },
      ],
      outputs: [
        {
          name: "aeSummary",
          type: "type-statistics",
          description: "Statistical summary of adverse events",
        },
        {
          name: "aeVisualization",
          type: "type-visualization",
          description: "Visualization data for AE reporting",
        },
      ],
    },
    {
      id: "func-efficacy-analysis",
      name: "Efficacy Endpoint Analysis",
      description: "Analyze primary and secondary efficacy endpoints",
      tags: ["efficacy", "analysis"],
      inputs: [
        { name: "efficacyData", type: "type-efficacy", required: true },
        { name: "patients", type: "type-patient", required: true },
        {
          name: "endpoint",
          type: "string",
          required: true,
          defaultValue: "Tumor Size",
        },
        { name: "visitOfInterest", type: "string", required: false },
      ],
      outputs: [
        {
          name: "efficacyStats",
          type: "type-statistics",
          description: "Statistical analysis of efficacy",
        },
        {
          name: "responderAnalysis",
          type: "type-statistics",
          description: "Responder rates analysis",
        },
        {
          name: "visualization",
          type: "type-visualization",
          description: "Visualization data for efficacy",
        },
      ],
    },
    {
      id: "func-benefit-risk",
      name: "Benefit-Risk Assessment",
      description: "Integrated analysis of efficacy and safety data",
      tags: ["analysis", "reporting"],
      inputs: [
        { name: "efficacyStats", type: "type-statistics", required: true },
        { name: "safetyStats", type: "type-statistics", required: true },
        { name: "patients", type: "type-patient", required: true },
      ],
      outputs: [
        {
          name: "benefitRiskAssessment",
          type: "type-statistics",
          description: "Combined benefit/risk metrics",
        },
        {
          name: "visualization",
          type: "type-visualization",
          description: "Benefit-risk visualization",
        },
      ],
    },
    {
      id: "func-report-generator",
      name: "Clinical Study Report Generator",
      description: "Generate components for clinical study reports",
      tags: ["reporting", "documentation"],
      inputs: [
        { name: "patientData", type: "type-patientgroup", required: true },
        { name: "efficacyAnalysis", type: "type-statistics", required: true },
        { name: "safetyAnalysis", type: "type-statistics", required: true },
        {
          name: "visualizations",
          type: "array",
          description: "Array of visualization data",
        },
      ],
      outputs: [
        {
          name: "reportSections",
          type: "object",
          description: "Structured report sections",
        },
        {
          name: "executiveSummary",
          type: "object",
          description: "Key findings summary",
        },
      ],
    },
  ],

  // Define connections between functions
  connections: [
    {
      id: "conn-1",
      source: "data-patients",
      sourcePort: "data-out",
      target: "func-patient-grouping",
      targetPort: "input-patients",
    },
    {
      id: "conn-2",
      source: "func-patient-grouping",
      sourcePort: "output-patientGroups",
      target: "func-vitals-analysis",
      targetPort: "input-patientGroups",
    },
    {
      id: "conn-3",
      source: "data-vitalsigns",
      sourcePort: "data-out",
      target: "func-vitals-analysis",
      targetPort: "input-vitals",
    },
    {
      id: "conn-4",
      source: "func-patient-grouping",
      sourcePort: "output-patientGroups",
      target: "func-lab-abnormalities",
      targetPort: "input-patientGroups",
    },
    {
      id: "conn-5",
      source: "data-labtests",
      sourcePort: "data-out",
      target: "func-lab-abnormalities",
      targetPort: "input-labResults",
    },
    {
      id: "conn-6",
      source: "data-adverse-events",
      sourcePort: "data-out",
      target: "func-ae-summary",
      targetPort: "input-adverseEvents",
    },
    {
      id: "conn-7",
      source: "data-patients",
      sourcePort: "data-out",
      target: "func-ae-summary",
      targetPort: "input-patients",
    },
    {
      id: "conn-8",
      source: "data-efficacy",
      sourcePort: "data-out",
      target: "func-efficacy-analysis",
      targetPort: "input-efficacyData",
    },
    {
      id: "conn-9",
      source: "data-patients",
      sourcePort: "data-out",
      target: "func-efficacy-analysis",
      targetPort: "input-patients",
    },
    {
      id: "conn-10",
      source: "func-efficacy-analysis",
      sourcePort: "output-efficacyStats",
      target: "func-benefit-risk",
      targetPort: "input-efficacyStats",
    },
    {
      id: "conn-11",
      source: "func-ae-summary",
      sourcePort: "output-aeSummary",
      target: "func-benefit-risk",
      targetPort: "input-safetyStats",
    },
    {
      id: "conn-12",
      source: "func-patient-grouping",
      sourcePort: "output-patientGroups",
      target: "func-report-generator",
      targetPort: "input-patientData",
    },
    {
      id: "conn-13",
      source: "func-efficacy-analysis",
      sourcePort: "output-efficacyStats",
      target: "func-report-generator",
      targetPort: "input-efficacyAnalysis",
    },
    {
      id: "conn-14",
      source: "func-ae-summary",
      sourcePort: "output-aeSummary",
      target: "func-report-generator",
      targetPort: "input-safetyAnalysis",
    },
  ],
};

// Create and export a singleton instance with the clinical trial data
export const clinicalTrialRegistry = new DemoTypeRegistry(
  clinicalTrialAnalyticsPipeline
);

/**
 * Helper function to load the clinical trial pipeline into ReactFlow
 */
export function getClinicalTrialDemoNodes() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes for all data types first
  clinicalTrialAnalyticsPipeline.types.forEach((type, idx) => {
    nodes.push({
      id: type.id,
      type: "typeNode",
      position: { x: 100, y: 100 + idx * 120 },
      data: {
        label: type.name,
        description: type.description,
        properties: Object.entries(type.properties).reduce(
          (acc: { [key: string]: string }, [name, prop]) => {
            acc[name] = prop.type;
            return acc;
          },
          {}
        ),
      },
    });
  });

  // Create nodes for all data instances
  clinicalTrialAnalyticsPipeline.instances.forEach((instance, idx) => {
    nodes.push({
      id: instance.id,
      type: "dataNode",
      position: { x: 400, y: 100 + idx * 200 },
      data: {
        id: instance.id,
        label: instance.name,
        description: instance.description ?? "",
        typeName: instance.type.replace("type-", ""),
        // ...instance.preview,
      },
    });

    // Create edges from type to data instance
    const typeId = instance.type;
    edges.push({
      id: `edge-${typeId}-${instance.id}`,
      source: typeId,
      target: instance.id,
      sourceHandle: "type-out",
      targetHandle: "type-input",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: "#1976d2" },
      animated: false,
    });
  });

  // Create nodes for all functions
  clinicalTrialAnalyticsPipeline.functions.forEach((func, idx) => {
    nodes.push({
      id: func.id,
      type: "functionNode",
      position: { x: 800, y: 100 + idx * 200 },
      data: {
        id: func.id,
        label: func.name,
        description: func.description ?? "",
        inputs: func.inputs.map((input) => ({
          name: input.name,
          type: input.type.replace("type-", ""),
          description: input.description,
          required: input.required,
        })),
        outputs: func.outputs.map((output) => ({
          name: output.name,
          type: output.type.replace("type-", ""),
          description: output.description ?? "",
        })),
        tags: func.tags ?? [],
      },
    });
  });

  // Create all the connections
  clinicalTrialAnalyticsPipeline.connections.forEach((conn) => {
    edges.push({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourcePort ?? "data-out",
      targetHandle: conn.targetPort ?? "data-in",
      animated: true,
      style: { stroke: "#4caf50" },
    });
  });

  return { nodes, edges };
}
