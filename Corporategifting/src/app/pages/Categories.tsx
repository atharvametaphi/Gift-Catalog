import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Power, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';
import { syncBackendToStorage } from '../services/storageSync';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  const { colors } = useTheme();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync categories.';
      toast.error(message);
    }

    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (data) {
      setCategories(JSON.parse(data));
      return;
    }

    setCategories([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await backendApi.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        });
        toast.success('Category updated successfully');
      } else {
        await backendApi.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        });
        toast.success('Category created successfully');
      }

      await loadCategories();
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save category.';
      toast.error(message);
    }
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await backendApi.deleteCategory(category.id);
        toast.success('Category deleted successfully');
        await loadCategories();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete category.';
        toast.error(message);
      }
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      await backendApi.updateCategory(category.id, {
        name: category.name,
        description: category.description || '',
        status: category.status === 'active' ? 'inactive' : 'active',
      });
      toast.success(`Category ${category.status === 'active' ? 'deactivated' : 'activated'}`);
      await loadCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category status.';
      toast.error(message);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: colors.text.primary, fontWeight: 600 }}>Categories</h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>Manage product categories</p>
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
          Add Category
        </button>
      </div>

      <div className="rounded-xl shadow-sm mb-6 p-4" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.text.tertiary }} />
          <input
            type="text"
            placeholder="Search categories..."
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
      </div>

      <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <table className="w-full">
          <thead style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Name</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Description</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Status</th>
              <th className="px-6 py-4 text-left text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Created</th>
              <th className="px-6 py-4 text-right text-sm" style={{ color: colors.text.secondary, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ borderColor: colors.border }}>
            {filteredCategories.map((category, index) => (
              <tr
                key={category.id}
                className="transition"
                style={{ borderBottom: index < filteredCategories.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td className="px-6 py-4 text-sm" style={{ color: colors.text.primary, fontWeight: 500 }}>{category.name}</td>
                <td className="px-6 py-4 text-sm" style={{ color: colors.text.secondary }}>{category.description || '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: category.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                      color: category.status === 'active' ? '#15803d' : '#DC2626',
                      fontWeight: 500,
                    }}
                  >
                    {category.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: colors.text.secondary }}>
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleStatus(category)}
                      className="p-2 rounded-lg transition"
                      title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                      style={{ color: colors.text.secondary }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 rounded-lg transition"
                      title="Edit"
                      style={{ color: colors.accent.gold }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
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
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.text.tertiary }}>No categories found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="rounded-xl shadow-xl max-w-md w-full" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h2 className="text-xl" style={{ color: colors.text.primary, fontWeight: 600 }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
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
                <label className="block text-sm mb-2" style={{ color: colors.text.primary, fontWeight: 500 }}>
                  Category Name *
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
