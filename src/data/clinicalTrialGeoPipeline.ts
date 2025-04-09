import { TypeSystemConfig } from "../types/typeSystem";

export const clinicalTrialGeoPipeline: TypeSystemConfig = {
  name: "Environmental Health Study",
  description:
    "A pipeline that joins geolocation data with patient IDs to study environmental health impacts.",

  types: [
    {
      id: "type-patient",
      name: "Patient",
      description: "Clinical trial participant data",
      tags: ["demographic", "subject"],
      properties: {
        patientId: { type: "string", required: true },
        age: { type: "number", required: true },
        sex: { type: "string", required: true },
        studyGroup: { type: "string", description: "Treatment group" },
      },
    },
    {
      id: "type-geolocation",
      name: "Geolocation",
      description: "Geolocation data for environmental exposure",
      tags: ["location", "environment"],
      properties: {
        patientId: { type: "string", required: true },
        latitude: { type: "number", required: true },
        longitude: { type: "number", required: true },
        timestamp: { type: "date", required: true },
      },
    },
    {
      id: "type-exposure",
      name: "EnvironmentalExposure",
      description: "Environmental exposure data for patients",
      tags: ["analysis", "exposure"],
      properties: {
        patientId: { type: "string", required: true },
        exposureLevel: { type: "number", required: true },
        riskCategory: { type: "string", description: "Low, Medium, High" },
      },
    },
  ],

  instances: [
    {
      id: "data-patients",
      name: "Patient Data",
      description: "Clinical trial participant demographic data",
      type: "type-patient",
      tags: ["demographic"],
    },
    {
      id: "data-geolocations",
      name: "Geolocation Data",
      description: "Geolocation data for patients",
      type: "type-geolocation",
      tags: ["location"],
    },
  ],

  functions: [
    {
      id: "func-join-geolocation",
      name: "Join Geolocation Data",
      description: "Joins geolocation data with patient IDs",
      tags: ["data", "join"],
      inputs: [
        { name: "patients", type: "type-patient", required: true },
        { name: "geolocations", type: "type-geolocation", required: true },
      ],
      outputs: [
        {
          name: "exposureData",
          type: "type-exposure",
          description: "Environmental exposure data",
        },
      ],
    },
  ],

  connections: [
    {
      id: "conn-1",
      source: "data-patients",
      sourcePort: "data-out",
      target: "func-join-geolocation",
      targetPort: "input-patients",
    },
    {
      id: "conn-2",
      source: "data-geolocations",
      sourcePort: "data-out",
      target: "func-join-geolocation",
      targetPort: "input-geolocations",
    },
  ],
};
