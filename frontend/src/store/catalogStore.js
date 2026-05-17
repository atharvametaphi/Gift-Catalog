import { create } from "zustand";
import { catalogItems as seedItems, categories as seedCategories, subCategories as seedSubCategories } from "../constants/catalogData";
import { catalogService } from "../services/catalogService";

export const layoutModes = ["grid-3", "grid-4", "list"];

const initialFilters = {
  search: "",
  categoryId: "all",
  subCategoryId: "all",
};

const cloneCatalogItems = (items) =>
  items.map((item) => ({
    ...item,
    images: [...item.images],
  }));

const cloneRecords = (records) => records.map((record) => ({ ...record }));

const seedCatalog = {
  categories: cloneRecords(seedCategories),
  subCategories: cloneRecords(seedSubCategories),
  items: cloneCatalogItems(seedItems),
};

const sortByCreatedAtDesc = (a, b) => {
  const aTime = new Date(a.createdAt || 0).getTime();
  const bTime = new Date(b.createdAt || 0).getTime();
  return bTime - aTime;
};

const mergeById = (seedRecords, dbRecords) => {
  const mergedMap = new Map();

  for (const record of [...dbRecords, ...seedRecords]) {
    if (!record?.id) {
      continue;
    }

    if (!mergedMap.has(record.id)) {
      mergedMap.set(record.id, record);
    }
  }

  return Array.from(mergedMap.values()).sort(sortByCreatedAtDesc);
};

const withMergedCatalog = (dbCategories, dbSubCategories, dbItems) => ({
  dbCategories,
  dbSubCategories,
  dbItems,
  categories: mergeById(seedCatalog.categories, dbCategories),
  subCategories: mergeById(seedCatalog.subCategories, dbSubCategories),
  catalogItems: mergeById(seedCatalog.items, dbItems),
});

export const useCatalogStore = create((set, get) => ({
  ...withMergedCatalog([], [], []),
  catalogLoading: false,
  catalogLoaded: false,
  catalogError: "",
  layoutMode: "grid-4",
  filters: initialFilters,
  selectedItems: {},

  loadCatalogData: async () => {
    if (get().catalogLoading) {
      return;
    }

    set((state) => ({
      ...state,
      catalogLoading: true,
      catalogError: "",
    }));

    try {
      const [categoriesResponse, subCategoriesResponse, itemsResponse] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getSubCategories(),
        catalogService.getItems(),
      ]);

      const dbCategories = Array.isArray(categoriesResponse.categories) ? categoriesResponse.categories : [];
      const dbSubCategories = Array.isArray(subCategoriesResponse.subCategories) ? subCategoriesResponse.subCategories : [];
      const dbItems = Array.isArray(itemsResponse.items) ? itemsResponse.items : [];

      set((state) => ({
        ...state,
        ...withMergedCatalog(dbCategories, dbSubCategories, dbItems),
        catalogLoading: false,
        catalogLoaded: true,
        catalogError: "",
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        catalogLoading: false,
        catalogLoaded: true,
        catalogError: error?.response?.data?.message || "Unable to load catalog data from database.",
      }));
    }
  },

  setLayoutMode: (layoutMode) =>
    set((state) =>
      layoutModes.includes(layoutMode) ? { ...state, layoutMode } : state,
    ),

  updateFilters: (nextFilters) =>
    set((state) => ({
      ...state,
      filters: {
        ...state.filters,
        ...nextFilters,
      },
    })),

  clearFilters: () =>
    set((state) => ({
      ...state,
      filters: initialFilters,
    })),

  toggleItemSelection: (itemId, imageIndex = 0) =>
    set((state) => {
      const selectedItems = { ...state.selectedItems };

      if (selectedItems[itemId]) {
        delete selectedItems[itemId];
      } else {
        selectedItems[itemId] = { imageIndex };
      }

      return { ...state, selectedItems };
    }),

  setSelectedImage: (itemId, imageIndex) =>
    set((state) => {
      if (!state.selectedItems[itemId]) {
        return state;
      }

      return {
        ...state,
        selectedItems: {
          ...state.selectedItems,
          [itemId]: {
            ...state.selectedItems[itemId],
            imageIndex,
          },
        },
      };
    }),

  clearSelections: () =>
    set((state) => ({
      ...state,
      selectedItems: {},
    })),

  addItem: async ({ name, images, categoryId, subCategoryId }) => {
    await catalogService.createItem({ name, images, categoryId, subCategoryId });
    await get().loadCatalogData();
  },

  addSubCategory: async ({ name }) => {
    await catalogService.createSubCategory({ name });
    await get().loadCatalogData();
  },

  addCategory: async ({ name }) => {
    await catalogService.createCategory({ name });
    await get().loadCatalogData();
  },

  updateCategory: async ({ id, name }) => {
    await catalogService.updateCategory(id, { name });
    await get().loadCatalogData();
  },

  deleteCategory: async (id) => {
    await catalogService.deleteCategory(id);
    await get().loadCatalogData();
  },

  updateSubCategory: async ({ id, name }) => {
    await catalogService.updateSubCategory(id, { name });
    await get().loadCatalogData();
  },

  deleteSubCategory: async (id) => {
    await catalogService.deleteSubCategory(id);
    await get().loadCatalogData();
  },

  updateItem: async ({ id, name, images, description, categoryId, subCategoryId }) => {
    await catalogService.updateItem(id, { name, images, description, categoryId, subCategoryId });
    await get().loadCatalogData();
  },

  deleteItem: async (id) => {
    await catalogService.deleteItem(id);
    await get().loadCatalogData();
  },
}));
