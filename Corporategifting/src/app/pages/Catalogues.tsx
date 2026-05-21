import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Catalogue } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { BookOpen, Calendar, Eye, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';
import { syncBackendToStorage } from '../services/storageSync';

export const Catalogues: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    loadCatalogues();
  }, []);

  const loadCatalogues = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync catalogues.';
      toast.error(message);
    }

    const data = localStorage.getItem(STORAGE_KEYS.CATALOGUES);
    if (data) {
      const parsedCatalogues: Catalogue[] = JSON.parse(data);
      setCatalogues(parsedCatalogues.filter((catalogue) => catalogue.status !== 'inactive'));
      return;
    }
    setCatalogues([]);
  };

  const handleDelete = async (catalogue: Catalogue) => {
    if (confirm(`Delete catalogue "${catalogue.catalogueTitle}"?`)) {
      if (catalogue.categoryId && catalogue.subcategoryId) {
        try {
          await backendApi.updateCatalog(catalogue.id, {
            categoryId: catalogue.categoryId,
            subCategoryId: catalogue.subcategoryId,
            description: catalogue.backendDescription || catalogue.notes || '',
            status: 'inactive',
            itemIds: catalogue.products.map((product) => product.itemId),
          });
        } catch (error) {
          // Keep current UI behavior even if backend soft-delete fails.
        }
      }

      const updated = catalogues.filter((c) => c.id !== catalogue.id);
      localStorage.setItem(STORAGE_KEYS.CATALOGUES, JSON.stringify(updated));
      setCatalogues(updated);
      toast.success('Catalogue deleted');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="p-4 max-w-[1900px] mx-auto">
        <div className="mb-4">
          <h1
            className="text-2xl mb-1"
            style={{ color: colors.text.primary, fontWeight: 600 }}
          >
            Catalogues
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Manage and share your curated product catalogues
          </p>
        </div>

        {catalogues.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: colors.accent.gold }} />
            <h3
              className="text-lg mb-2"
              style={{ color: colors.text.primary, fontWeight: 600 }}
            >
              No Catalogues Yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.text.tertiary }}>
              Create your first catalogue from the Products page
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-sm text-sm"
              style={{
                backgroundColor: colors.accent.gold,
                color: '#FFFFFF',
              }}
            >
              <Package className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catalogues.map((catalogue) => {
              const descriptionText = String(catalogue.notes || '').trim();
              const displayDescription = descriptionText.length > 0 ? descriptionText : 'No description';

              return (
                <div
                  key={catalogue.id}
                  className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="p-3">
                    <div className="mb-2">
                      <h3
                        className="text-sm mb-1 leading-snug line-clamp-2"
                        style={{ color: colors.text.primary, fontWeight: 600 }}
                      >
                        {catalogue.catalogueTitle}
                      </h3>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>
                        {catalogue.clientName}
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-2"
                      style={{
                        backgroundColor: colors.hover,
                        color: colors.accent.gold,
                        fontWeight: 500,
                      }}
                    >
                      <Package className="w-3 h-3" />
                      {catalogue.products.length} {catalogue.products.length === 1 ? 'Product' : 'Products'}
                    </div>

                    <p
                      className="text-xs mb-2 line-clamp-2 leading-relaxed break-words min-h-[32px]"
                      style={{ color: colors.text.tertiary }}
                    >
                      {displayDescription}
                    </p>

                    <div className="flex items-center gap-1 mb-2 text-xs" style={{ color: colors.text.tertiary }}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(catalogue.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                      <Link
                        to={`/catalogue/${catalogue.id}`}
                        className="flex-1 px-3 py-2 rounded-lg text-center transition flex items-center justify-center gap-1 text-xs shadow-sm"
                        style={{
                          backgroundColor: colors.accent.gold,
                          color: '#FFFFFF',
                          fontWeight: 500,
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        View & Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(catalogue)}
                        className="px-3 py-2 rounded-lg transition"
                        style={{
                          border: `1px solid ${colors.border}`,
                          color: '#DC2626',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
