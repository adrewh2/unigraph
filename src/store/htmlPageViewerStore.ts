import { create } from "zustand";

interface HtmlPageViewerState {
  contentCache: Map<string, { html: string; url: string; title: string }>;
  activeTabId: string | null;
  setContent: (
    tabId: string,
    content: { html: string; url: string; title: string }
  ) => void;
  getContent: (
    tabId: string
  ) => { html: string; url: string; title: string } | undefined;
  setActiveTab: (tabId: string | null) => void;
  clearContent: (tabId: string) => void;
}

const useHtmlPageViewerStore = create<HtmlPageViewerState>((set, get) => ({
  contentCache: new Map(),
  activeTabId: null,

  setContent: (
    tabId: string,
    content: { html: string; url: string; title: string }
  ) => {
    console.log(
      "Store: Setting content for tabId:",
      tabId,
      "content length:",
      content.html.length
    );
    set((state) => {
      const newCache = new Map(state.contentCache);
      newCache.set(tabId, content);
      console.log("Store: Cache size after set:", newCache.size);
      return { contentCache: newCache };
    });
  },

  getContent: (tabId: string) => {
    const content = get().contentCache.get(tabId);
    console.log(
      "Store: Getting content for tabId:",
      tabId,
      "found:",
      !!content
    );
    return content;
  },

  setActiveTab: (tabId: string | null) => {
    set({ activeTabId: tabId });
  },

  clearContent: (tabId: string) => {
    set((state) => {
      const newCache = new Map(state.contentCache);
      newCache.delete(tabId);
      return { contentCache: newCache };
    });
  },
}));

export default useHtmlPageViewerStore;
