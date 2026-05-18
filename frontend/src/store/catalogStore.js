import { create } from "zustand";
import { catalogService } from "../services/catalogService";

export const layoutModes = ["grid-3", "grid-4", "list"];

const initialFilters = {
  search: "",
  categoryId: "all",
  subCategoryId: "all",
};

const sortByCreatedAtDesc = (a, b) => {
  const aTime = new Date(a.createdAt || 0).getTime();
  const bTime = new Date(b.createdAt || 0).getTime();
  return bTime - aTime;
};

const normalizeArray = (records) =>
  (Array.isArray(records) ? records : [])
    .filter((record) => record && typeof record === "object")
    .sort(sortByCreatedAtDesc);

const buildVisibleCatalogItems = (dbItems, dbCatalogs) => {
  const catalogItemIds = new Set(
    dbCatalogs.flatMap((catalog) =>
      Array.isArray(catalog?.itemIds) ? catalog.itemIds : [],
    ),
  );

  // Backward-compatible fallback when no catalogs exist yet.
  if (catalogItemIds.size === 0) {
    return dbItems;
  }

  return dbItems.filter((item) => catalogItemIds.has(item.id));
};

const buildCatalogState = (dbCategories, dbSubCategories, dbItems, dbCatalogs) => ({
  dbCategories,
  dbSubCategories,
  dbItems,
  dbCatalogs,
  categories: dbCategories,
  subCategories: dbSubCategories,
  catalogItems: buildVisibleCatalogItems(dbItems, dbCatalogs),
  createdCatalogs: dbCatalogs,
});

export const useCatalogStore = create((set, get) => ({
  ...buildCatalogState([], [], [], []),
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
      const [categoriesResult, subCategoriesResult, productsResult, catalogsResult] = await Promise.allSettled([
        catalogService.getCategories(),
        catalogService.getSubCategories(),
        catalogService.getProducts(),
        catalogService.getCatalogs(),
      ]);

      let categoriesError = null;
      let subCategoriesError = null;
      let productsError = null;
      let catalogsError = null;

      const dbCategories =
        categoriesResult.status === "fulfilled"
          ? normalizeArray(categoriesResult.value.categories)
          : ((categoriesError = categoriesResult.reason), []);
      const dbSubCategories =
        subCategoriesResult.status === "fulfilled"
          ? normalizeArray(subCategoriesResult.value.subCategories)
          : ((subCategoriesError = subCategoriesResult.reason), []);
      const dbItems =
        productsResult.status === "fulfilled"
          ? normalizeArray(productsResult.value.products || productsResult.value.items)
          : ((productsError = productsResult.reason), []);
      const dbCatalogs =
        catalogsResult.status === "fulfilled"
          ? normalizeArray(catalogsResult.value.catalogs)
          : ((catalogsError = catalogsResult.reason), []);

      const firstError = categoriesError || subCategoriesError || productsError || catalogsError;

      set((state) => ({
        ...state,
        ...buildCatalogState(dbCategories, dbSubCategories, dbItems, dbCatalogs),
        catalogLoading: false,
        catalogLoaded: true,
        catalogError: firstError ? firstError?.response?.data?.message || firstError?.message || "Some data failed to load." : "",
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

  addItem: async ({ name, description, status, images, categoryId, subCategoryId }) => {
    await catalogService.createProduct({ name, description, status, images, categoryId, subCategoryId });
    await get().loadCatalogData();
  },

  addSubCategory: async ({ name, categoryId, description, status }) => {
    await catalogService.createSubCategory({ name, categoryId, description, status });
    await get().loadCatalogData();
  },

  addCategory: async ({ name, description, status }) => {
    await catalogService.createCategory({ name, description, status });
    await get().loadCatalogData();
  },

  updateCategory: async ({ id, name, description, status }) => {
    await catalogService.updateCategory(id, { name, description, status });
    await get().loadCatalogData();
  },

  deleteCategory: async (id) => {
    await catalogService.deleteCategory(id);
    await get().loadCatalogData();
  },

  updateSubCategory: async ({ id, name, categoryId, description, status }) => {
    await catalogService.updateSubCategory(id, { name, categoryId, description, status });
    await get().loadCatalogData();
  },

  deleteSubCategory: async (id) => {
    await catalogService.deleteSubCategory(id);
    await get().loadCatalogData();
  },

  updateItem: async ({ id, name, images, description, status, categoryId, subCategoryId }) => {
    await catalogService.updateProduct(id, { name, images, description, status, categoryId, subCategoryId });
    await get().loadCatalogData();
  },

  deleteItem: async (id) => {
    await catalogService.deleteProduct(id);
    await get().loadCatalogData();
  },

  createCatalog: async ({ categoryId, subCategoryId, description = "", status = "active", itemIds = [] }) => {
    await catalogService.createCatalog({
      categoryId,
      subCategoryId,
      description,
      status,
      itemIds,
    });
    await get().loadCatalogData();
  },

  updateCatalog: async ({ id, categoryId, subCategoryId, description = "", status = "active", itemIds = [] }) => {
    await catalogService.updateCatalog(id, {
      categoryId,
      subCategoryId,
      description,
      status,
      itemIds,
    });
    await get().loadCatalogData();
  },
}));
