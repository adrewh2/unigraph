import { create } from "zustand";
import { NodeId } from "../core/model/Node";

interface DocumentState {
  id: string;
  nodeId: NodeId;
  content: string;
  lexicalState: string; // Serialized Lexical state
  lastModified: number;
  tags: string[];
}

interface DocumentStore {
  // State
  documents: Record<NodeId, DocumentState>;
  activeDocument: NodeId | null;

  // Actions
  createDocument: (nodeId: NodeId) => void;
  updateDocument: (
    nodeId: NodeId,
    content: string,
    lexicalState: string,
    tags?: string[]
  ) => void;
  setActiveDocument: (nodeId: NodeId | null) => void;
  deleteDocument: (nodeId: NodeId) => void;
  getDocumentByNodeId: (nodeId: NodeId) => DocumentState | null;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: {},
  activeDocument: null,

  createDocument: (nodeId) => {
    if (get().documents[nodeId]) {
      console.log(`Document for ${nodeId} alraedy exists.`);
      return;
    }
    set((state) => ({
      documents: {
        ...state.documents,
        [nodeId]: {
          id: `doc-${nodeId}`,
          nodeId,
          content: "",
          lexicalState: "",
          lastModified: Date.now(),
          tags: [],
        },
      },
    }));
  },

  updateDocument: (nodeId, content, lexicalState, tags) => {
    set((state) => {
      const doc = state.documents[nodeId];
      if (!doc) return state;

      return {
        documents: {
          ...state.documents,
          [nodeId]: {
            ...doc,
            content,
            lexicalState,
            lastModified: Date.now(),
            tags: tags || doc.tags,
          },
        },
      };
    });
  },

  setActiveDocument: (nodeId) => {
    console.log("Setting active document:", nodeId);
    // Create document if it doesn't exist
    if (nodeId && !get().documents[nodeId]) {
      console.log("Creating new document for:", nodeId);
      get().createDocument(nodeId);
    }
    set({ activeDocument: nodeId });
    console.log("New active document state:", get().activeDocument);
  },

  deleteDocument: (nodeId) => {
    set((state) => {
      const { [nodeId]: _, ...remainingDocs } = state.documents;
      return {
        documents: remainingDocs,
        activeDocument:
          state.activeDocument === nodeId ? null : state.activeDocument,
      };
    });
  },

  getDocumentByNodeId: (nodeId) => {
    return get().documents[nodeId] || null;
  },
}));

// Utility selectors
export const useActiveDocument = () => {
  return useDocumentStore((state) => {
    const activeId = state.activeDocument;
    return activeId ? state.documents[activeId] : null;
  });
};

export const useDocument = (nodeId: NodeId) => {
  return useDocumentStore((state) => state.documents[nodeId]);
};
