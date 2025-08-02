export interface ResourceId {
  id: string;
  type: string;
  label?: string;
  description?: string;
  [key: string]: any;
}
