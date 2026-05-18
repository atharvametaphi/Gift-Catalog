import { backendApi } from './backendApi';
import { Catalogue, CatalogueProduct, Category, Item, ItemImage, Subcategory, User } from '../types';
import { STORAGE_KEYS } from '../mockData';

const toDateValue = (value?: string | Date) => {
  if (!value) {
    return new Date();
  }
  return new Date(value);
};

const toItemImage = (itemId: string, url: string, index: number, createdAt?: string) => {
  const timestamp = toDateValue(createdAt);
  const image: ItemImage = {
    id: `${itemId}-img-${index + 1}`,
    itemId,
    imageUrl: url,
    imageOrder: index + 1,
    isPrimary: index === 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return image;
};

const mapCategory = (entry: any): Category => ({
  id: String(entry?.id || ''),
  name: String(entry?.name || ''),
  description: String(entry?.description || ''),
  status: entry?.status === 'inactive' ? 'inactive' : 'active',
  createdAt: toDateValue(entry?.createdAt),
  updatedAt: toDateValue(entry?.updatedAt || entry?.createdAt),
});

const mapSubcategory = (entry: any): Subcategory => ({
  id: String(entry?.id || ''),
  categoryId: String(entry?.categoryId || ''),
  name: String(entry?.name || ''),
  description: String(entry?.description || ''),
  status: entry?.status === 'inactive' ? 'inactive' : 'active',
  createdAt: toDateValue(entry?.createdAt),
  updatedAt: toDateValue(entry?.updatedAt || entry?.createdAt),
});

const mapProduct = (entry: any): Item => {
  const itemId = String(entry?.id || '');
  const imageUrls = Array.isArray(entry?.images)
    ? entry.images.filter((image: unknown) => typeof image === 'string')
    : [];

  return {
    id: itemId,
    categoryId: String(entry?.categoryId || ''),
    subcategoryId: String(entry?.subCategoryId || ''),
    itemName: String(entry?.name || ''),
    shortDescription: String(entry?.description || ''),
    detailedDescription: String(entry?.description || ''),
    status: entry?.status === 'inactive' ? 'inactive' : 'active',
    images: imageUrls.map((imageUrl: string, index: number) =>
      toItemImage(itemId, imageUrl, index, entry?.createdAt),
    ),
    createdAt: toDateValue(entry?.createdAt),
    updatedAt: toDateValue(entry?.updatedAt || entry?.createdAt),
  };
};

const mapUser = (entry: any): User => ({
  id: String(entry?.id || ''),
  name: String(entry?.name || ''),
  email: String(entry?.email || ''),
  role: String(entry?.role || 'viewer'),
  roleId: String(entry?.role || 'viewer'),
  permissions: [],
  status: entry?.status === 'inactive' ? 'inactive' : 'active',
  createdAt: toDateValue(entry?.createdAt),
  updatedAt: toDateValue(entry?.updatedAt || entry?.createdAt),
});

const getSavedCatalogues = (): Catalogue[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.CATALOGUES);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const buildCatalogProducts = (itemIds: string[], itemMap: Map<string, Item>, previousProducts: CatalogueProduct[] = []) =>
  itemIds.map((itemId) => {
    const previous = previousProducts.find((product) => product.itemId === itemId);
    const item = itemMap.get(itemId);
    const primary = item?.images.find((image) => image.isPrimary);

    return {
      itemId,
      selectedImageId: previous?.selectedImageId || primary?.id || '',
    };
  });

const mapCatalogs = (entries: any[], items: Item[]): Catalogue[] => {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const existingById = new Map(getSavedCatalogues().map((catalogue) => [catalogue.id, catalogue]));

  return entries.map((entry) => {
    const id = String(entry?.id || '');
    const existing = existingById.get(id);
    const itemIds = Array.isArray(entry?.itemIds)
      ? entry.itemIds.filter((itemId: unknown) => typeof itemId === 'string')
      : [];

    return {
      id,
      catalogueTitle: String(existing?.catalogueTitle || entry?.name || ''),
      clientName: existing?.clientName || 'Corporate Client',
      notes: String(existing?.notes || entry?.description || ''),
      products: buildCatalogProducts(itemIds, itemMap, existing?.products || []),
      showPrice: existing?.showPrice ?? true,
      showSku: existing?.showSku ?? true,
      showMoq: existing?.showMoq ?? false,
      showCategory: existing?.showCategory ?? true,
      showSubcategory: existing?.showSubcategory ?? true,
      showDescription: existing?.showDescription ?? true,
      showTags: existing?.showTags ?? false,
      createdBy: existing?.createdBy || '',
      createdAt: toDateValue(entry?.createdAt || existing?.createdAt),
      updatedAt: toDateValue(entry?.updatedAt || entry?.createdAt || existing?.updatedAt),
      categoryId: String(entry?.categoryId || existing?.categoryId || ''),
      subcategoryId: String(entry?.subCategoryId || existing?.subcategoryId || ''),
      status: entry?.status === 'inactive' ? 'inactive' : 'active',
      backendDescription: String(entry?.description || ''),
    };
  });
};

export const syncBackendToStorage = async (options: { includeUsers?: boolean } = {}) => {
  const includeUsers = Boolean(options.includeUsers);

  const [categoriesResponse, subcategoriesResponse, productsResponse, catalogsResponse] = await Promise.all([
    backendApi.getCategories(),
    backendApi.getSubcategories(),
    backendApi.getProducts(),
    backendApi.getCatalogs(),
  ]);

  const categories = Array.isArray(categoriesResponse?.categories)
    ? categoriesResponse.categories.map(mapCategory)
    : [];
  const subcategories = Array.isArray(subcategoriesResponse?.subCategories)
    ? subcategoriesResponse.subCategories.map(mapSubcategory)
    : [];
  const items = Array.isArray(productsResponse?.items) ? productsResponse.items.map(mapProduct) : [];
  const catalogues = Array.isArray(catalogsResponse?.catalogs)
    ? mapCatalogs(catalogsResponse.catalogs, items)
    : [];

  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  localStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(subcategories));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  localStorage.setItem(STORAGE_KEYS.CATALOGUES, JSON.stringify(catalogues));

  if (includeUsers) {
    try {
      const usersResponse = await backendApi.getUsers();
      const users = Array.isArray(usersResponse?.users) ? usersResponse.users.map(mapUser) : [];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      // Non-admin users can still work with non-user modules.
    }
  }

  return { categories, subcategories, items, catalogues };
};

export const mapUserFromApi = mapUser;
export const mapProductFromApi = mapProduct;
