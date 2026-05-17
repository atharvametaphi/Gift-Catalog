export const byCreatedAtDesc = (a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const filterCatalogItems = (items, filters) => {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);
    const matchesCategory =
      filters.categoryId === "all" || item.categoryId === filters.categoryId;
    const matchesSubCategory =
      filters.subCategoryId === "all" || item.subCategoryId === filters.subCategoryId;

    return matchesSearch && matchesCategory && matchesSubCategory;
  });
};

