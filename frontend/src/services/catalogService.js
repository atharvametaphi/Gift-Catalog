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
  getItems: async () => {
    const { data } = await http.get("/items");
    return data;
  },
  createItem: async (payload) => {
    const { data } = await http.post("/items", payload);
    return data;
  },
  updateItem: async (id, payload) => {
    const { data } = await http.put(`/items/${id}`, payload);
    return data;
  },
  deleteItem: async (id) => {
    const { data } = await http.delete(`/items/${id}`);
    return data;
  },
};
