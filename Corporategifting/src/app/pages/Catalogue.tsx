import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Item, Category, Subcategory } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { Search, Filter, FileText, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

export const Catalogue: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);

    if (itemsData) setItems(JSON.parse(itemsData));
    if (categoriesData) setCategories(JSON.parse(categoriesData));
    if (subcategoriesData) setSubcategories(JSON.parse(subcategoriesData));
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

  const selectAll = () => {
    const allIds = new Set(filteredItems.map((item) => item.id));
    setSelectedItems(allIds);
    toast.success(`Selected ${allIds.size} items`);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    toast.success('Selection cleared');
  };

  const generatePDF = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item');
      return;
    }
    localStorage.setItem('selectedItemsForPDF', JSON.stringify(Array.from(selectedItems)));
    navigate('/pdf-generator');
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalogue</h1>
          <p className="text-gray-600">Browse and select products for PDF generation</p>
        </div>
        {selectedItems.size > 0 && (
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <FileText className="w-5 h-5" />
            Generate PDF ({selectedItems.size})
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Select All Visible
          </button>
          <button
            onClick={clearSelection}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <Square className="w-4 h-4" />
            Clear Selection
          </button>
          <div className="ml-auto text-sm text-gray-600 py-2">
            {selectedItems.size} of {filteredItems.length} selected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const category = categories.find((c) => c.id === item.categoryId);
          const subcategory = subcategories.find((s) => s.id === item.subcategoryId);
          const primaryImage = item.images.find((img) => img.isPrimary);
          const isSelected = selectedItems.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelectItem(item.id)}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer transition ${
                isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="relative h-48 bg-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage.imageUrl}
                    alt={item.itemName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.itemName}</h3>
                {item.itemCode && (
                  <p className="text-xs text-gray-500 mb-2 font-mono">{item.itemCode}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {category?.name}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                    {subcategory?.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.shortDescription}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
};
