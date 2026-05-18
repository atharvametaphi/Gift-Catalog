import http from "./http";

export const catalogService = {
  getCategories: async () => {
    const { data } = await http.get("/categories");
    return data;
  },
  createCategory: async (payload) => {
    const { data } = await http.post("/categories", payload);
    return data;
  },
  updateCategory: async (id, payload) => {
    const { data } = await http.put(`/categories/${id}`, payload);
    return data;
  },
  deleteCategory: async (id) => {
    const { data } = await http.delete(`/categories/${id}`);
    return data;
  },
  getSubCategories: async () => {
    const { data } = await http.get("/subcategories");
    return data;
  },
  createSubCategory: async (payload) => {
    const { data } = await http.post("/subcategories", payload);
    return data;
  },
  updateSubCategory: async (id, payload) => {
    const { data } = await http.put(`/subcategories/${id}`, payload);
    return data;
  },
  deleteSubCategory: async (id) => {
    const { data } = await http.delete(`/subcategories/${id}`);
    return data;
  },
  getProducts: async () => {
    try {
      const { data } = await http.get("/products");
      return data;
    } catch (error) {
      const statusCode = error?.response?.status;
      if (statusCode !== 404) {
        throw error;
      }

      const { data } = await http.get("/items");
      return data;
    }
  },
  createProduct: async (payload) => {
    const { data } = await http.post("/products", payload);
    return data;
  },
  updateProduct: async (id, payload) => {
    const { data } = await http.put(`/products/${id}`, payload);
    return data;
  },
  deleteProduct: async (id) => {
    const { data } = await http.delete(`/products/${id}`);
    return data;
  },
  getCatalogs: async () => {
    const { data } = await http.get("/catalogs");
    return data;
  },
  createCatalog: async (payload) => {
    const { data } = await http.post("/catalogs", payload);
    return data;
  },
  updateCatalog: async (id, payload) => {
    const { data } = await http.put(`/catalogs/${id}`, payload);
    return data;
  },
  // Backward-compatible aliases.
  getItems: async () => {
    const { data } = await http.get("/products");
    return data;
  },
  createItem: async (payload) => {
    const { data } = await http.post("/products", payload);
    return data;
  },
  updateItem: async (id, payload) => {
    const { data } = await http.put(`/products/${id}`, payload);
    return data;
  },
  deleteItem: async (id) => {
    const { data } = await http.delete(`/products/${id}`);
    return data;
  },
};
