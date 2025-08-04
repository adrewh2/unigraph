import { supabase } from "../utils/supabaseClient";

export interface Document {
  id: string;
  title: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data: any; // JSONB field for additional data
  user_id: string;
  project_id?: string | null;
  parent_id?: string | null;
  created_at?: string;
  last_updated_at?: string | null;
}

export interface CreateDocumentParams {
  title: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data: any;
  project_id?: string;
  parent_id?: string;
}

export interface UpdateDocumentParams {
  id: string;
  title?: string;
  content?: string;
  extension?: string;
  metadata?: any;
  data?: any;
  project_id?: string;
  parent_id?: string;
}

// Create a new document
export async function createDocument(
  params: CreateDocumentParams
): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        title: params.title,
        content: params.content || "",
        extension: params.extension || "md",
        metadata: params.metadata || {},
        data: params.data,
        project_id: params.project_id,
        parent_id: params.parent_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get a single document by id
export async function getDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update a document
export async function updateDocument(
  params: UpdateDocumentParams
): Promise<Document> {
  const updateData: Partial<Document> = {};

  if (params.title !== undefined) updateData.title = params.title;
  if (params.content !== undefined) updateData.content = params.content;
  if (params.extension !== undefined) updateData.extension = params.extension;
  if (params.metadata !== undefined) updateData.metadata = params.metadata;
  if (params.data !== undefined) updateData.data = params.data;
  if (params.project_id !== undefined)
    updateData.project_id = params.project_id;
  if (params.parent_id !== undefined) updateData.parent_id = params.parent_id;

  const { data, error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a document
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) throw error;
}

// List documents with optional filters
export async function listDocuments({
  userId,
  projectId,
  parentId,
  extension,
}: {
  userId?: string;
  projectId?: string;
  parentId?: string;
  extension?: string;
} = {}): Promise<Document[]> {
  let query = supabase.from("documents").select("*");

  if (userId) query = query.eq("user_id", userId);
  if (projectId) query = query.eq("project_id", projectId);
  if (parentId) query = query.eq("parent_id", parentId);
  if (extension) query = query.eq("extension", extension);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get documents by project
export async function getDocumentsByProject(
  projectId: string
): Promise<Document[]> {
  return listDocuments({ projectId });
}

// Get child documents of a parent document
export async function getChildDocuments(parentId: string): Promise<Document[]> {
  return listDocuments({ parentId });
}

// Search documents by title or content
export async function searchDocuments({
  userId,
  searchTerm,
  projectId,
}: {
  userId?: string;
  searchTerm: string;
  projectId?: string;
}): Promise<Document[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);

  if (userId) query = query.eq("user_id", userId);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get document tree (hierarchy)
export async function getDocumentTree({
  userId,
  projectId,
}: {
  userId?: string;
  projectId?: string;
} = {}): Promise<Document[]> {
  // Get all documents and build tree structure
  const documents = await listDocuments({ userId, projectId });

  // Filter to only root documents (no parent_id)
  const rootDocuments = documents.filter((doc) => !doc.parent_id);

  // Build tree structure recursively
  const buildTree = (parentId: string | null): Document[] => {
    return documents
      .filter((doc) => doc.parent_id === parentId)
      .map((doc) => ({
        ...doc,
        children: buildTree(doc.id),
      }));
  };

  return rootDocuments.map((doc) => ({
    ...doc,
    children: buildTree(doc.id),
  }));
}

// Duplicate a document
export async function duplicateDocument(
  documentId: string,
  newTitle?: string
): Promise<Document> {
  // Get the original document
  const originalDoc = await getDocument(documentId);

  // Create a new document with the same content but new title
  const newTitleText = newTitle || `${originalDoc.title} (Copy)`;

  return createDocument({
    title: newTitleText,
    content: originalDoc.content,
    extension: originalDoc.extension,
    metadata: originalDoc.metadata,
    data: originalDoc.data,
    project_id: originalDoc.project_id ?? undefined,
    parent_id: originalDoc.parent_id ?? undefined,
  });
}

// Move document to different project
export async function moveDocumentToProject(
  documentId: string,
  newProjectId: string
): Promise<Document> {
  return updateDocument({
    id: documentId,
    project_id: newProjectId,
  });
}

// Get document statistics
export async function getDocumentStats({
  userId,
  projectId,
}: {
  userId?: string;
  projectId?: string;
} = {}): Promise<{
  total: number;
  byExtension: Record<string, number>;
  byProject: Record<string, number>;
}> {
  const documents = await listDocuments({ userId, projectId });

  const byExtension: Record<string, number> = {};
  const byProject: Record<string, number> = {};

  documents.forEach((doc) => {
    // Count by extension
    const ext = doc.extension || "md";
    byExtension[ext] = (byExtension[ext] || 0) + 1;

    // Count by project
    if (doc.project_id) {
      byProject[doc.project_id] = (byProject[doc.project_id] || 0) + 1;
    }
  });

  return {
    total: documents.length,
    byExtension,
    byProject,
  };
}

// Get documents by extension
export async function getDocumentsByExtension(
  extension: string,
  {
    userId,
    projectId,
  }: {
    userId?: string;
    projectId?: string;
  } = {}
): Promise<Document[]> {
  return listDocuments({ userId, projectId, extension });
}
