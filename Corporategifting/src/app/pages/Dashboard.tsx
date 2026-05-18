import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Category, Subcategory, Item } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import {
  Package,
  FolderTree,
  GitBranch,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { syncBackendToStorage } from '../services/storageSync';

export const Dashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync dashboard data.';
      toast.error(message);
    }

    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);

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
    if (itemsData) {
      setItems(JSON.parse(itemsData));
    } else {
      setItems([]);
    }
  };

  const stats = [
    {
      label: 'Total Categories',
      value: categories.length,
      icon: FolderTree,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Subcategories',
      value: subcategories.length,
      icon: GitBranch,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Products',
      value: items.length,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      label: 'Active Products',
      value: items.filter((i) => i.status === 'active').length,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      label: 'Inactive Products',
      value: items.filter((i) => i.status === 'inactive').length,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const quickActions = [
    { label: 'View Products', path: '/items', icon: Package, color: 'bg-blue-600' },
    { label: 'View Catalogues', path: '/catalogues', icon: FileText, color: 'bg-purple-600' },
    { label: 'All PDFs', path: '/all-pdfs', icon: FileText, color: 'bg-green-600' },
    { label: 'Categories', path: '/categories', icon: Plus, color: 'bg-orange-600' },
    { label: 'Settings', path: '/settings', icon: TrendingUp, color: 'bg-indigo-600' },
  ];

  const recentItems = items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="mb-8 max-w-[1800px] mx-auto">
        <h1 className="text-4xl mb-2" style={{ fontFamily: 'serif', color: '#1A1A1A', fontWeight: 600 }}>
          Dashboard
        </h1>
        <p style={{ color: '#5A5A5A', letterSpacing: '0.3px' }}>
          Welcome to Luxury Gifting Studio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 max-w-[1800px] mx-auto">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl shadow-sm p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0E8D8' }}>
                  <Icon className="w-6 h-6" style={{ color: '#C9A961' }} />
                </div>
              </div>
              <p className="text-3xl mb-1" style={{ fontFamily: 'serif', color: '#1A1A1A', fontWeight: 600 }}>{stat.value}</p>
              <p className="text-sm" style={{ color: '#8A8A8A' }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8 max-w-[1800px] mx-auto">
        <h2 className="text-2xl mb-4" style={{ fontFamily: 'serif', color: '#1A1A1A', fontWeight: 600 }}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="rounded-xl shadow-sm p-6 hover:shadow-md transition group"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition" style={{ backgroundColor: '#F0E8D8' }}>
                  <Icon className="w-6 h-6" style={{ color: '#C9A961' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{action.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl shadow-sm max-w-[1800px] mx-auto" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}>
        <div className="p-6 border-b" style={{ borderColor: '#E8E4DC' }}>
          <h2 className="text-2xl" style={{ fontFamily: 'serif', color: '#1A1A1A', fontWeight: 600 }}>Recently Added Products</h2>
        </div>
        <div className="p-6">
          {recentItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A961' }} />
              <p style={{ color: '#8A8A8A' }}>No products added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => {
                const primaryImage = item.images.find((img) => img.isPrimary);
                const category = categories.find((c) => c.id === item.categoryId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg transition hover:bg-gray-50"
                    style={{ border: '1px solid #E8E4DC' }}
                  >
                    <img
                      src={primaryImage?.imageUrl || 'https://via.placeholder.com/80'}
                      alt={item.itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>{item.itemName}</h3>
                      <p className="text-sm" style={{ color: '#8A8A8A' }}>{category?.name}</p>
                      <p className="text-xs mt-1" style={{ color: '#8A8A8A' }}>
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: item.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                          color: item.status === 'active' ? '#15803d' : '#DC2626',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
