import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Item, Category, Subcategory, Catalogue, CatalogueProduct } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import { Search, BookOpen, X, Check, Plus, SlidersHorizontal, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';
import { syncBackendToStorage } from '../services/storageSync';

export const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [catalogueForm, setCatalogueForm] = useState({
    catalogueTitle: '',
    clientName: '',
    notes: '',
    showPrice: true,
    showSku: true,
    showMoq: false,
  });
  const [productForm, setProductForm] = useState({
    categoryId: '',
    subcategoryId: '',
    itemName: '',
    itemCode: '',
    description: '',
    detailedDescription: '',
    price: '',
    minimumOrderQuantity: '',
    colors: '',
    material: '',
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive',
    images: [] as string[],
  });
  const [colorList, setColorList] = useState<{ name: string; rgb: string }[]>([]);
  const [currentColor, setCurrentColor] = useState({ name: '', rgb: '' });
  const [tagInput, setTagInput] = useState('');
  const [autoFilledName, setAutoFilledName] = useState('');
  const [manuallyEditedName, setManuallyEditedName] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [activeDetailImage, setActiveDetailImage] = useState(0);
  const { currentUser } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync products.';
      toast.error(message);
    }

    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);

    if (itemsData) {
      setItems(JSON.parse(itemsData));
    } else {
      setItems([]);
    }

    if (categoriesData) {
      setCategories(JSON.parse(categoriesData));
    } else {
      setCategories([]);
    }

    if (subcategoriesData) {
      setSubcategories(JSON.parse(subcategoriesData));
    } else {
      setSubcategories([]);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleViewDetail = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDetailItem(item);
    setActiveDetailImage(0);
    setShowDetailModal(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !productForm.tags.includes(tagInput.trim())) {
      setProductForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const openCreateCatalogue = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one product');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateCatalogue = async () => {
    if (!catalogueForm.catalogueTitle.trim()) {
      toast.error('Please enter a catalogue title');
      return;
    }
    if (!catalogueForm.clientName.trim()) {
      toast.error('Please enter a client name');
      return;
    }

    const selectedItemList = Array.from(selectedItems)
      .map((itemId) => items.find((item) => item.id === itemId))
      .filter((item): item is Item => Boolean(item));

    if (selectedItemList.length === 0) {
      toast.error('Please select at least one valid product');
      return;
    }

    const selectedCategoryId = selectedItemList[0].categoryId;
    const selectedSubcategoryId = selectedItemList[0].subcategoryId;

    if (!selectedCategoryId || !selectedSubcategoryId) {
      toast.error('Selected products must have category and subcategory');
      return;
    }

    const products: CatalogueProduct[] = selectedItemList.map((item) => {
      const primaryImage = item?.images.find((img) => img.isPrimary);
      return {
        itemId: item.id,
        selectedImageId: primaryImage?.id || '',
      };
    });

    try {
      const response = await backendApi.createCatalog({
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubcategoryId,
        description: catalogueForm.notes.trim(),
        status: 'active',
        itemIds: selectedItemList.map((item) => item.id),
      });

      await loadData();

      const createdCatalogId = String(response?.catalog?.id || '');
      if (createdCatalogId) {
        const cataloguesData = localStorage.getItem(STORAGE_KEYS.CATALOGUES);
        const catalogues: Catalogue[] = cataloguesData ? JSON.parse(cataloguesData) : [];
        let hasUpdatedCatalogue = false;
        const updatedCatalogues = catalogues.map((catalogue) => {
          if (catalogue.id !== createdCatalogId) {
            return catalogue;
          }

          hasUpdatedCatalogue = true;
          return {
            ...catalogue,
            catalogueTitle: catalogueForm.catalogueTitle,
            clientName: catalogueForm.clientName,
            notes: catalogueForm.notes,
            products,
            showPrice: catalogueForm.showPrice,
            showSku: catalogueForm.showSku,
            showMoq: catalogueForm.showMoq,
            showCategory: true,
            showSubcategory: true,
            showDescription: true,
            showTags: false,
            createdBy: currentUser?.id || '',
            updatedAt: new Date(),
          };
        });

        if (!hasUpdatedCatalogue) {
          updatedCatalogues.unshift({
            id: createdCatalogId,
            catalogueTitle: catalogueForm.catalogueTitle,
            clientName: catalogueForm.clientName,
            notes: catalogueForm.notes,
            products,
            showPrice: catalogueForm.showPrice,
            showSku: catalogueForm.showSku,
            showMoq: catalogueForm.showMoq,
            showCategory: true,
            showSubcategory: true,
            showDescription: true,
            showTags: false,
            createdBy: currentUser?.id || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            categoryId: selectedCategoryId,
            subcategoryId: selectedSubcategoryId,
            status: 'active',
            backendDescription: catalogueForm.notes.trim(),
          });
        }

        localStorage.setItem(STORAGE_KEYS.CATALOGUES, JSON.stringify(updatedCatalogues));
      }

      toast.success('Catalogue created successfully! You can view it in the Catalogues section.');
      setShowCreateModal(false);
      setCatalogueForm({
        catalogueTitle: '',
        clientName: '',
        notes: '',
        showPrice: true,
        showSku: true,
        showMoq: false,
      });
      setSelectedItems(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create catalogue.';
      toast.error(message);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setProductForm({ ...productForm, categoryId, subcategoryId: '' });
    setManuallyEditedName(false);
    updateAutoFilledName(categoryId, '');
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setProductForm({ ...productForm, subcategoryId });
    updateAutoFilledName(productForm.categoryId, subcategoryId);
  };

  const updateAutoFilledName = (categoryId: string, subcategoryId: string) => {
    if (categoryId && subcategoryId) {
      const category = categories.find(c => c.id === categoryId);
      const subcategory = subcategories.find(s => s.id === subcategoryId);
      if (category && subcategory) {
        const newName = `${category.name} - ${subcategory.name}`;
        setAutoFilledName(newName);
        if (!manuallyEditedName) {
          setProductForm(prev => ({ ...prev, itemName: newName }));
        }
      }
    }
  };

  const handleProductNameChange = (value: string) => {
    setProductForm({ ...productForm, itemName: value });
    if (value !== autoFilledName) {
      setManuallyEditedName(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileUrls: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          fileUrls.push(reader.result as string);
          if (fileUrls.length === files.length) {
            setProductForm(prev => ({ ...prev, images: [...prev.images, ...fileUrls] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (currentColor.name && currentColor.rgb) {
      setColorList([...colorList, currentColor]);
      setCurrentColor({ name: '', rgb: '' });
    } else {
      toast.error('Please select a color name and enter RGB code');
    }
  };

  const removeColor = (index: number) => {
    setColorList(colorList.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async () => {
    if (!productForm.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!productForm.subcategoryId) {
      toast.error('Please select a subcategory');
      return;
    }
    if (!productForm.itemName.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (productForm.images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    try {
      await backendApi.createProduct({
        categoryId: productForm.categoryId || null,
        subCategoryId: productForm.subcategoryId || null,
        name: productForm.itemName.trim(),
        description: (productForm.description || productForm.detailedDescription || '').trim(),
        status: productForm.status,
        sku: productForm.itemCode.trim() || undefined,
        price: productForm.price ? Number(productForm.price.replace(/,/g, '')) : null,
        images: productForm.images,
      });

      await loadData();

      toast.success('Product created successfully!');
      setShowAddProductModal(false);
      setProductForm({
        categoryId: '',
        subcategoryId: '',
        itemName: '',
        itemCode: '',
        description: '',
        detailedDescription: '',
        price: '',
        minimumOrderQuantity: '',
        colors: '',
        material: '',
        tags: [],
        status: 'active',
        images: [],
      });
      setColorList([]);
      setCurrentColor({ name: '', rgb: '' });
      setTagInput('');
      setAutoFilledName('');
      setManuallyEditedName(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product.';
      toast.error(message);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || item.categoryId === filterCategory;
    const matchesStatus = filterStatus === '' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="p-4 max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1
                className="text-2xl mb-1"
                style={{ color: colors.text.primary, fontWeight: 600 }}
              >
                Product Collection
              </h1>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Curate premium corporate gifts and build client catalogues
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/bulk-upload')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-sm text-sm"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.cardBg;
                }}
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">Bulk Upload</span>
              </button>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-sm text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: colors.text.tertiary }}
            />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text.primary,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" style={{ color: colors.text.tertiary }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text.primary,
                minWidth: '150px',
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text.primary,
                minWidth: '120px',
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Selection Bar */}
        {selectedItems.size > 0 && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center justify-between shadow-sm"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.accent.gold }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: colors.text.primary }}>
                  {selectedItems.size} {selectedItems.size === 1 ? 'Product' : 'Products'} Selected
                </p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                  Ready to create a custom catalogue
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-4 py-2 rounded-lg transition font-medium text-sm"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Clear Selection
              </button>
              <button
                onClick={openCreateCatalogue}
                className="px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium shadow-sm text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                <BookOpen className="w-4 h-4" />
                Create Catalogue
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);
            const subcategory = subcategories.find((s) => s.id === item.subcategoryId);
            const primaryImage = item.images.find((img) => img.isPrimary);
            const isSelected = selectedItems.has(item.id);

            return (
              <div
                key={item.id}
                onClick={(e) => handleViewDetail(item, e)}
                className="group cursor-pointer rounded-lg overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: colors.cardBg,
                  border: isSelected ? `2px solid ${colors.accent.gold}` : `1px solid ${colors.border}`,
                  boxShadow: isSelected ? '0 4px 12px rgba(201, 169, 97, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {primaryImage ? (
                    <img
                      src={primaryImage.imageUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: colors.text.tertiary }}>
                      <span className="text-xs">No Image</span>
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(item.id);
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-110"
                      style={{
                        backgroundColor: isSelected ? colors.accent.gold : 'rgba(255, 255, 255, 0.95)',
                        border: isSelected ? 'none' : `2px solid ${colors.border}`,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm"
                      style={{
                        backgroundColor: item.status === 'active' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(220, 38, 38, 0.9)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                      }}
                    >
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3
                    className="text-sm mb-2 line-clamp-2 leading-snug"
                    style={{ color: colors.text.primary, fontWeight: 600 }}
                  >
                    {item.itemName}
                  </h3>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span
                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: colors.hover,
                        color: colors.text.secondary,
                        fontSize: '10px',
                      }}
                    >
                      {category?.name}
                    </span>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: colors.hover,
                        color: colors.text.secondary,
                        fontSize: '10px',
                      }}
                    >
                      {subcategory?.name}
                    </span>
                  </div>

                  {item.itemCode && (
                    <p className="mb-2" style={{ color: colors.text.tertiary, fontFamily: 'Courier, monospace', fontSize: '10px' }}>
                      SKU: {item.itemCode}
                    </p>
                  )}

                  {item.price && (
                    <p
                      className="text-base mb-2"
                      style={{ color: colors.accent.gold, fontWeight: 600 }}
                    >
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  )}

                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: colors.text.secondary }}>
                    {item.shortDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <p className="text-sm" style={{ color: colors.text.tertiary }}>
              No products found matching your filters
            </p>
          </div>
        )}
      </div>

      {/* Create Catalogue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-2xl max-w-2xl w-full"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="p-4 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl mb-1"
                    style={{ color: colors.text.primary, fontWeight: 600 }}
                  >
                    Create Catalogue
                  </h2>
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    Configure your custom catalogue with {selectedItems.size} selected {selectedItems.size === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg transition"
                  style={{ color: colors.text.tertiary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Catalogue Title *
                </label>
                <input
                  type="text"
                  value={catalogueForm.catalogueTitle}
                  onChange={(e) =>
                    setCatalogueForm({ ...catalogueForm, catalogueTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="e.g., Spring 2024 Premium Corporate Collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Client Name *
                </label>
                <input
                  type="text"
                  value={catalogueForm.clientName}
                  onChange={(e) =>
                    setCatalogueForm({ ...catalogueForm, clientName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="e.g., ABC Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={catalogueForm.notes}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  rows={3}
                  placeholder="Add any special notes, requirements, or customization details..."
                />
              </div>

              <div className="pt-3 border-t" style={{ borderColor: colors.border }}>
                <p className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Display Preferences
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'showPrice', label: 'Show Product Pricing' },
                    { key: 'showSku', label: 'Show SKU Codes' },
                    { key: 'showMoq', label: 'Show Minimum Order Quantities' },
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={catalogueForm[option.key as keyof typeof catalogueForm] as boolean}
                          onChange={(e) =>
                            setCatalogueForm({ ...catalogueForm, [option.key]: e.target.checked })
                          }
                          className="w-6 h-6 rounded-md border-2 transition"
                          style={{
                            accentColor: colors.accent.gold,
                            borderColor: colors.border,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition font-medium text-sm"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCatalogue}
                className="flex-1 px-4 py-2 rounded-lg transition font-medium shadow-sm text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                Create Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="p-4 border-b sticky top-0 bg-inherit z-10" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl mb-1"
                    style={{ color: colors.text.primary, fontWeight: 600 }}
                  >
                    Add New Product
                  </h2>
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    Create a new product for your catalogue
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddProductModal(false);
                    setProductForm({
                      categoryId: '',
                      subcategoryId: '',
                      itemName: '',
                      itemCode: '',
                      description: '',
                      detailedDescription: '',
                      price: '',
                      minimumOrderQuantity: '',
                      colors: '',
                      material: '',
                      tags: [],
                      status: 'active',
                      images: [],
                    });
                    setTagInput('');
                    setAutoFilledName('');
                    setManuallyEditedName(false);
                  }}
                  className="p-1 rounded-lg transition"
                  style={{ color: colors.text.tertiary }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Category <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.filter(c => c.status === 'active').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Subcategory <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={productForm.subcategoryId}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!productForm.categoryId}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories
                    .filter(s => s.categoryId === productForm.categoryId && s.status === 'active')
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Product Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productForm.itemName}
                  onChange={(e) => handleProductNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="Auto-filled from category and subcategory"
                />
                {autoFilledName && (
                  <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                    Auto-filled as: {autoFilledName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  SKU / Item Code
                </label>
                <input
                  type="text"
                  value={productForm.itemCode}
                  onChange={(e) => setProductForm({ ...productForm, itemCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  placeholder="e.g., TWG-HP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Short Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  rows={2}
                  placeholder="Brief description of the product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Detailed Description
                </label>
                <textarea
                  value={productForm.detailedDescription}
                  onChange={(e) => setProductForm({ ...productForm, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  rows={3}
                  placeholder="Detailed product information..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Price (₹)
                  </label>
                  <input
                    type="text"
                    value={productForm.price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (!isNaN(Number(value)) || value === '') {
                        const formatted = value ? parseFloat(value).toLocaleString('en-IN') : '';
                        setProductForm({ ...productForm, price: formatted });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text.primary,
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    MOQ (Minimum Order Quantity)
                  </label>
                  <input
                    type="number"
                    value={productForm.minimumOrderQuantity}
                    onChange={(e) => setProductForm({ ...productForm, minimumOrderQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text.primary,
                    }}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Available Colors
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={currentColor.name}
                    onChange={(e) => setCurrentColor({ ...currentColor, name: e.target.value })}
                    className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text.primary,
                    }}
                  >
                    <option value="">Select color name</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Orange">Orange</option>
                    <option value="Purple">Purple</option>
                    <option value="Pink">Pink</option>
                    <option value="Brown">Brown</option>
                    <option value="Gray">Gray</option>
                    <option value="Navy">Navy</option>
                    <option value="Beige">Beige</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentColor.rgb}
                      onChange={(e) => setCurrentColor({ ...currentColor, rgb: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                      }}
                      placeholder="RGB (e.g., 255,0,0)"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-3 py-2 rounded-lg transition text-sm"
                      style={{
                        backgroundColor: colors.accent.gold,
                        color: '#FFFFFF',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {colorList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {colorList.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs flex items-center gap-2"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.primary,
                        }}
                      >
                        {color.name} ({color.rgb})
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div></div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Material
                  </label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text.primary,
                    }}
                    placeholder="e.g., Leather, Metal, Plastic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text.primary,
                    }}
                    placeholder="Type tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 rounded-lg transition text-sm"
                    style={{
                      backgroundColor: colors.accent.gold,
                      color: '#FFFFFF',
                    }}
                  >
                    Add
                  </button>
                </div>
                {productForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {productForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.primary,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={productForm.status === 'active'}
                      onChange={() => setProductForm({ ...productForm, status: 'active' })}
                      className="w-4 h-4"
                      style={{ accentColor: colors.accent.gold }}
                    />
                    <span className="text-sm" style={{ color: colors.text.secondary }}>
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={productForm.status === 'inactive'}
                      onChange={() => setProductForm({ ...productForm, status: 'inactive' })}
                      className="w-4 h-4"
                      style={{ accentColor: colors.accent.gold }}
                    />
                    <span className="text-sm" style={{ color: colors.text.secondary }}>
                      Inactive
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Product Images
                </label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition"
                  style={{ borderColor: colors.border }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto mb-2" style={{ color: colors.text.tertiary }} />
                  <p className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>
                    Click to upload images
                  </p>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>
                    PNG, JPG up to 10MB (multiple files allowed)
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {productForm.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <div
                            className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: colors.accent.gold, color: '#ffffff', fontSize: '10px' }}
                          >
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex gap-3" style={{ borderColor: colors.border }}>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setProductForm({
                    categoryId: '',
                    subcategoryId: '',
                    itemName: '',
                    itemCode: '',
                    description: '',
                    detailedDescription: '',
                    price: '',
                    minimumOrderQuantity: '',
                    colors: '',
                    material: '',
                    tags: [],
                    status: 'active',
                    images: [],
                  });
                  setTagInput('');
                  setAutoFilledName('');
                  setManuallyEditedName(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg transition font-medium text-sm"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text.secondary,
                  backgroundColor: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="flex-1 px-4 py-2 rounded-lg transition font-medium shadow-sm text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedDetailItem && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            style={{ backgroundColor: colors.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b flex items-center justify-between sticky top-0" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <h3 className="text-base" style={{ color: colors.text.primary, fontWeight: 600 }}>
                Product Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg transition"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Images Section */}
                <div>
                  <div className="rounded-lg overflow-hidden mb-3" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                    <img
                      src={selectedDetailItem.images[activeDetailImage]?.imageUrl || 'https://via.placeholder.com/400'}
                      alt={selectedDetailItem.itemName}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  {selectedDetailItem.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedDetailItem.images.map((image, index) => (
                        <div
                          key={image.id}
                          onClick={() => setActiveDetailImage(index)}
                          className="rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                          style={{
                            border: activeDetailImage === index ? `2px solid ${colors.accent.gold}` : `1px solid ${colors.border}`,
                          }}
                        >
                          <img
                            src={image.imageUrl}
                            alt={selectedDetailItem.itemName}
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl mb-2" style={{ color: colors.text.primary, fontWeight: 600 }}>
                      {selectedDetailItem.itemName}
                    </h2>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: selectedDetailItem.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                          color: selectedDetailItem.status === 'active' ? '#15803d' : '#DC2626',
                          fontSize: '10px',
                        }}
                      >
                        {selectedDetailItem.status}
                      </span>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.secondary,
                          fontSize: '10px',
                        }}
                      >
                        {categories.find(c => c.id === selectedDetailItem.categoryId)?.name}
                      </span>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.secondary,
                          fontSize: '10px',
                        }}
                      >
                        {subcategories.find(s => s.id === selectedDetailItem.subcategoryId)?.name}
                      </span>
                    </div>
                  </div>

                  {selectedDetailItem.itemCode && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>SKU</label>
                      <p className="text-sm" style={{ color: colors.text.primary, fontFamily: 'Courier, monospace' }}>
                        {selectedDetailItem.itemCode}
                      </p>
                    </div>
                  )}

                  {selectedDetailItem.price && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Price</label>
                      <p className="text-2xl" style={{ color: colors.accent.gold, fontWeight: 600 }}>
                        ₹{selectedDetailItem.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  {selectedDetailItem.minimumOrderQuantity && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Minimum Order Quantity</label>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        {selectedDetailItem.minimumOrderQuantity} units
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Description</label>
                    <p className="text-sm leading-relaxed" style={{ color: colors.text.primary }}>
                      {selectedDetailItem.shortDescription}
                    </p>
                    {selectedDetailItem.detailedDescription && (
                      <p className="text-sm leading-relaxed mt-2" style={{ color: colors.text.secondary }}>
                        {selectedDetailItem.detailedDescription}
                      </p>
                    )}
                  </div>

                  {selectedDetailItem.colors && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Available Colors</label>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        {selectedDetailItem.colors}
                      </p>
                    </div>
                  )}

                  {selectedDetailItem.material && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Material</label>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        {selectedDetailItem.material}
                      </p>
                    </div>
                  )}

                  {selectedDetailItem.tags && selectedDetailItem.tags.length > 0 && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.text.secondary, fontWeight: 500 }}>Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedDetailItem.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: colors.hover,
                              color: colors.text.secondary,
                              fontSize: '10px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t flex justify-end gap-2" style={{ borderColor: colors.border }}>
              <button
                onClick={() => {
                  toggleSelectItem(selectedDetailItem.id);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 rounded-lg transition text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                {selectedItems.has(selectedDetailItem.id) ? 'Remove from Selection' : 'Add to Selection'}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-lg transition text-sm"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
