import React, { useEffect, useState } from 'react';
import { PDFCatalogue } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { FileText, Download, Eye, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { backendApi } from '../services/backendApi';

export const AllPdfs: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFCatalogue[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { colors } = useTheme();
  const gridLabelMap: Record<string, string> = {
    '4': '2×2',
    '6': '3×2',
    '9': '3×3',
    '12': '4×3',
    '16': '4×4',
    '20': '5×4',
  };

  useEffect(() => {
    void loadPdfs();
  }, []);

  const loadPdfs = async () => {
    try {
      const response = await backendApi.getPdfs();
      const remotePdfs: PDFCatalogue[] = Array.isArray(response?.pdfs) ? response.pdfs : [];
      setPdfs(remotePdfs);
      localStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(remotePdfs));
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load PDFs from database.';
      toast.error(message);
    }

    const data = localStorage.getItem(STORAGE_KEYS.PDFS);
    if (data) {
      setPdfs(JSON.parse(data));
    } else {
      setPdfs([]);
    }
  };

  const handleDownload = (pdf: PDFCatalogue) => {
    const link = document.createElement('a');
    link.href = pdf.pdfDataUrl;
    link.download = pdf.fileName;
    link.click();
    toast.success('PDF downloaded successfully');
  };

  const handlePreview = (pdf: PDFCatalogue) => {
    setPreviewUrl(pdf.pdfDataUrl);
    setShowPreview(true);
  };

  const handleDelete = (pdf: PDFCatalogue) => {
    if (confirm(`Delete PDF "${pdf.fileName}"?`)) {
      void (async () => {
        try {
          await backendApi.deletePdf(pdf.id);
          const updated = pdfs.filter((p) => p.id !== pdf.id);
          localStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(updated));
          setPdfs(updated);
          toast.success('PDF deleted successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete PDF.';
          toast.error(message);
        }
      })();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="p-4 max-w-[1900px] mx-auto">
        <div className="mb-3">
          <h1
            className="text-lg mb-1"
            style={{ color: colors.text.primary, fontWeight: 600 }}
          >
            All PDFs
          </h1>
          <p className="text-xs" style={{ color: colors.text.secondary }}>
            View and download all generated catalogue PDFs
          </p>
        </div>

        {pdfs.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: colors.accent.gold }} />
            <h3
              className="text-sm mb-1"
              style={{ color: colors.text.primary, fontWeight: 600 }}
            >
              No PDFs Generated Yet
            </h3>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>
              Generate PDFs from your catalogues to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-8 h-8 flex-shrink-0" style={{ color: colors.accent.gold }} />
                  </div>

                  <h3
                    className="text-sm mb-0.5 leading-snug"
                    style={{ color: colors.text.primary, fontWeight: 600 }}
                  >
                    {pdf.catalogueTitle}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: colors.text.secondary }}>
                    {pdf.clientName}
                  </p>

                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mb-2"
                    style={{
                      backgroundColor: colors.hover,
                      color: colors.accent.gold,
                      fontWeight: 500,
                      fontSize: '10px',
                    }}
                  >
                    {pdf.productCount} {pdf.productCount === 1 ? 'Product' : 'Products'} • {(gridLabelMap[String(pdf.gridLayout)] || 'Custom')} Grid
                  </div>

                  <div className="flex items-center gap-1 mb-2" style={{ color: colors.text.tertiary, fontSize: '10px' }}>
                    <Calendar className="w-3 h-3" />
                    <span>Created {new Date(pdf.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="flex gap-1.5 pt-2 border-t" style={{ borderColor: colors.border }}>
                    <button
                      onClick={() => handlePreview(pdf)}
                      className="flex-1 px-2 py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 shadow-sm"
                      style={{
                        backgroundColor: colors.accent.gold,
                        color: '#FFFFFF',
                        fontSize: '11px',
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(pdf)}
                      className="px-2 py-1.5 rounded-lg transition"
                      style={{
                        border: `1px solid ${colors.border}`,
                        color: colors.text.primary,
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pdf)}
                      className="px-2 py-1.5 rounded-lg transition"
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
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
              <h3 className="text-base" style={{ color: colors.text.primary, fontWeight: 600 }}>
                PDF Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 rounded-lg transition text-sm"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                Close
              </button>
            </div>
            <div className="p-3">
              <iframe
                src={previewUrl}
                className="w-full rounded-lg"
                style={{ height: 'calc(90vh - 120px)', border: `1px solid ${colors.border}` }}
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
