import { STORAGE_KEYS } from '../mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const safeJsonParse = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

export const setAuthToken = (token: string) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

const request = async (path: string, init: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});

  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = await safeJsonParse(response);

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

export const backendApi = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/me'),
  getCategories: () => request('/categories'),
  createCategory: (payload: { name: string; description?: string; status: 'active' | 'inactive' }) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCategory: (
    id: string,
    payload: { name: string; description?: string; status: 'active' | 'inactive' },
  ) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id: string) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),
  getSubcategories: () => request('/subcategories'),
  createSubcategory: (payload: {
    categoryId: string | null;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
  }) =>
    request('/subcategories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSubcategory: (
    id: string,
    payload: { categoryId: string | null; name: string; description?: string; status: 'active' | 'inactive' },
  ) =>
    request(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteSubcategory: (id: string) =>
    request(`/subcategories/${id}`, {
      method: 'DELETE',
    }),
  getProducts: () => request('/products'),
  createProduct: (payload: {
    categoryId: string | null;
    subCategoryId: string | null;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    images: string[];
  }) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (
    id: string,
    payload: {
      categoryId: string | null;
      subCategoryId: string | null;
      name: string;
      description?: string;
      status: 'active' | 'inactive';
      images: string[];
    },
  ) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: string) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),
  getCatalogs: () => request('/catalogs'),
  createCatalog: (payload: {
    categoryId: string;
    subCategoryId: string;
    description?: string;
    status?: 'active' | 'inactive';
    itemIds?: string[];
  }) =>
    request('/catalogs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCatalog: (
    id: string,
    payload: {
      categoryId: string;
      subCategoryId: string;
      description?: string;
      status?: 'active' | 'inactive';
      itemIds?: string[];
    },
  ) =>
    request(`/catalogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getUsers: () => request('/users'),
  createUser: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'viewer';
    status: 'active' | 'inactive';
  }) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateUser: (
    id: string,
    payload: {
      name: string;
      email: string;
      password?: string;
      role: 'admin' | 'manager' | 'viewer';
      status: 'active' | 'inactive';
    },
  ) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: string) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
};

