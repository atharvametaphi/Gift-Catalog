import React, { useEffect, useState } from 'react';
import { Category, Subcategory } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Power, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';
import { syncBackendToStorage } from '../services/storageSync';

export const Subcategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  const { colors } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync subcategories.';
      toast.error(message);
    }

    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSubcategory) {
        await backendApi.updateSubcategory(editingSubcategory.id, {
          categoryId: formData.categoryId || null,
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        });
        toast.success('Subcategory updated successfully');
      } else {
        await backendApi.createSubcategory({
          categoryId: formData.categoryId || null,
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        });
        toast.success('Subcategory created successfully');
      }

      await loadData();
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save subcategory.';
      toast.error(message);
    }
  };

  const handleDelete = async (subcategory: Subcategory) => {
    if (confirm(`Are you sure you want to delete "${subcategory.name}"?`)) {
      try {
        await backendApi.deleteSubcategory(subcategory.id);
        toast.success('Subcategory deleted successfully');
        await loadData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete subcategory.';
        toast.error(message);
      }
    }
  };

  const toggleStatus = async (subcategory: Subcategory) => {
    try {
      await backendApi.updateSubcategory(subcategory.id, {
        categoryId: subcategory.categoryId || null,
        name: subcategory.name,
        description: subcategory.description || '',
        status: subcategory.status === 'active' ? 'inactive' : 'active',
      });
      toast.success(`Subcategory ${subcategory.status === 'active' ? 'deactivated' : 'activated'}`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update subcategory status.';
      toast.error(message);
    }
  };

  const openModal = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setFormData({
        categoryId: subcategory.categoryId,
        name: subcategory.name,
        description: subcategory.description || '',
        status: subcategory.status,
      });
    } else {
      setEditingSubcategory(null);
      setFormData({ categoryId: '', name: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
    setFormData({ categoryId: '', name: '', description: '', status: 'active' });
  };

  const activeCategories = categories.filter((cat) => cat.status === 'active');

  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || sub.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: colors.text.primary, fontWeight: 600 }}>Subcategories</h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>Manage product subcategories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg transition text-sm shadow-sm"
          style={{
            backgroundColor: colors.accent.gold,
            color: '#FFFFFF',
          }}
        >
          <Plus className="w-5 h-5" />
          Add Subcategory
        </button>
      </div>

      <div className="rounded-xl shadow-sm mb-6 p-4" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.text.tertiary }} />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                color: colors.text.primary,
              }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              color: colors.text.primary,
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <table className="w-full">
          <thead style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Name</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Category</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Description</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Status</th>
              <th className="px-6 py-4 text-right text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubcategories.map((subcategory, index) => {
              const category = categories.find((c) => c.id === subcategory.categoryId);
              return (
                <tr
                  key={subcategory.id}
                  className="transition"
                  style={{ borderBottom: index < filteredSubcategories.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text.primary, fontWeight: 500 }}>{subcategory.name}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text.secondary }}>{category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text.secondary }}>{subcategory.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: subcategory.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        color: subcategory.status === 'active' ? '#15803d' : '#DC2626',
                        fontWeight: 500,
                      }}
                    >
                      {subcategory.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(subcategory)}
                        className="p-2 rounded-lg transition"
                        title={subcategory.status === 'active' ? 'Deactivate' : 'Activate'}
                        style={{ color: colors.text.secondary }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(subcategory)}
                        className="p-2 rounded-lg transition"
                        title="Edit"
                        style={{ color: colors.accent.gold }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subcategory)}
                        className="p-2 rounded-lg transition"
                        title="Delete"
                        style={{ color: '#DC2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSubcategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.text.tertiary }}>No subcategories found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="rounded-xl shadow-xl max-w-md w-full" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h2 className="text-xl" style={{ color: colors.text.primary, fontWeight: 600 }}>
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg transition"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.text.primary, fontWeight: 500 }}>Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.text.primary, fontWeight: 500 }}>
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.text.primary, fontWeight: 500 }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.text.primary, fontWeight: 500 }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                  }
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition text-sm"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg transition text-sm"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.text.secondary,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg transition text-sm shadow-sm"
                  style={{
                    backgroundColor: colors.accent.gold,
                    color: '#FFFFFF',
                  }}
                >
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
