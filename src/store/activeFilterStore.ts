import { createStore } from "zustand";
import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";

interface Filter {
  name?: string;
  description?: string;
  filterRules: FilterRuleDefinition[];
}

interface ActiveFiltersState {
  activeFilter: Filter | null;
}

const useActiveFilterStore = createStore<ActiveFiltersState>((set) => ({
  activeFilter: null,
  setActiveFilter: (activeFilter: Filter) => set({ activeFilter }),
  getActiveFilter: () => useActiveFilterStore.getState().activeFilter,
}));

export const setActiveFilter = (activeFilter: Filter) => {
  useActiveFilterStore.setState(() => ({
    activeFilter,
  }));
};

export const getActiveFilter = () => {
  return useActiveFilterStore.getState().activeFilter;
};

export default useActiveFilterStore;
