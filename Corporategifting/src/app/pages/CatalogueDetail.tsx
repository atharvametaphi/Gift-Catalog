import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Catalogue, Item, Category, Subcategory, CatalogueProduct, PDFCatalogue } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import { ArrowLeft, Download, Save, Check, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { syncBackendToStorage } from '../services/storageSync';
import logo from '../../imports/image-3.png';

export const CatalogueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedImages, setSelectedImages] = useState<Map<string, string>>(new Map());
  const [gridLayout, setGridLayout] = useState<'4' | '6' | '9' | '12' | '16' | '20' | ''>('');
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      await syncBackendToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync catalogue details.';
      toast.error(message);
    }

    const cataloguesData = localStorage.getItem(STORAGE_KEYS.CATALOGUES);
    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);

    if (cataloguesData) {
      const catalogues: Catalogue[] = JSON.parse(cataloguesData);
      const foundCatalogue = catalogues.find((c) => c.id === id);
      if (foundCatalogue) {
        setCatalogue(foundCatalogue);
        const imageMap = new Map<string, string>();
        foundCatalogue.products.forEach((p) => {
          imageMap.set(p.itemId, p.selectedImageId);
        });
        setSelectedImages(imageMap);
      }
    }
    if (itemsData) setItems(JSON.parse(itemsData));
    if (categoriesData) setCategories(JSON.parse(categoriesData));
    if (subcategoriesData) setSubcategories(JSON.parse(subcategoriesData));
  };

  const handleImageSelect = (itemId: string, imageId: string) => {
    const newMap = new Map(selectedImages);
    newMap.set(itemId, imageId);
    setSelectedImages(newMap);
  };

  const handleSave = () => {
    if (!catalogue) return;

    const updatedProducts: CatalogueProduct[] = catalogue.products.map((p) => ({
      itemId: p.itemId,
      selectedImageId: selectedImages.get(p.itemId) || p.selectedImageId,
    }));

    const updatedCatalogue: Catalogue = {
      ...catalogue,
      products: updatedProducts,
      updatedAt: new Date(),
    };

    const cataloguesData = localStorage.getItem(STORAGE_KEYS.CATALOGUES);
    if (cataloguesData) {
      const catalogues: Catalogue[] = JSON.parse(cataloguesData);
      const index = catalogues.findIndex((c) => c.id === id);
      if (index !== -1) {
        catalogues[index] = updatedCatalogue;
        localStorage.setItem(STORAGE_KEYS.CATALOGUES, JSON.stringify(catalogues));
        setCatalogue(updatedCatalogue);
        toast.success('Catalogue saved successfully');
      }
    }
  };

  const handlePreviewPDF = async () => {
    if (!catalogue) return;

    if (!gridLayout) {
      toast.error('Please select PDF grid layout before generating PDF.');
      return;
    }

    try {
      const pdfBlob = await generatePDFDocument();
      const url = URL.createObjectURL(pdfBlob);
      setPdfDataUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF preview');
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfDataUrl || !catalogue || !currentUser) return;

    const fileName = `${catalogue.catalogueTitle.replace(/\s+/g, '-')}-${
      catalogue.clientName.replace(/\s+/g, '-')
    }-${new Date().toISOString().split('T')[0]}.pdf`;

    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = fileName;
    link.click();

    // Save PDF metadata to All PDFs
    const pdfMetadata: PDFCatalogue = {
      id: `pdf${Date.now()}`,
      catalogueId: catalogue.id,
      catalogueTitle: catalogue.catalogueTitle,
      clientName: catalogue.clientName,
      fileName: fileName,
      pdfDataUrl: pdfDataUrl,
      gridLayout: gridLayout as any,
      productCount: catalogue.products.length,
      createdBy: currentUser.id,
      createdAt: new Date(),
    };

    const pdfsData = localStorage.getItem(STORAGE_KEYS.PDFS);
    const pdfs: PDFCatalogue[] = pdfsData ? JSON.parse(pdfsData) : [];
    pdfs.unshift(pdfMetadata); // Add to beginning of array
    localStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(pdfs));

    toast.success('PDF downloaded successfully!');
    setShowPreview(false);
  };

  const generatePDFDocument = async (): Promise<Blob> => {
    if (!catalogue) throw new Error('No catalogue');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Cover Page
      // Background decoration
      doc.setFillColor(250, 248, 245);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Red accent line at top
      doc.setFillColor(229, 41, 56);
      doc.rect(0, 0, pageWidth, 3, 'F');

      // Add logo image at top
      try {
        const logoImg = new Image();
        logoImg.src = logo;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });
        const logoHeight = 30;
        const logoWidth = logoHeight * (logoImg.width / logoImg.height);
        doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, 30, logoWidth, logoHeight);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }

      // Decorative line
      doc.setDrawColor(232, 228, 220);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 30, 70, pageWidth / 2 + 30, 70);

      // Main title
      doc.setFontSize(36);
      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(catalogue.catalogueTitle, pageWidth - 40);
      doc.text(titleLines, pageWidth / 2, 100, { align: 'center' });

      // Client name
      doc.setFontSize(18);
      doc.setTextColor(229, 41, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(catalogue.clientName, pageWidth / 2, 130, { align: 'center' });

      // Notes if provided
      if (catalogue.notes) {
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        const notesLines = doc.splitTextToSize(catalogue.notes, pageWidth - 60);
        doc.text(notesLines, pageWidth / 2, 150, { align: 'center' });
      }

      // Date
      doc.setFontSize(9);
      doc.setTextColor(138, 138, 138);
      const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(formattedDate, pageWidth / 2, pageHeight - 30, { align: 'center' });

      // Product count
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `${catalogue.products.length} Premium ${catalogue.products.length === 1 ? 'Product' : 'Products'}`,
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );

      // Footer decoration
      doc.setFillColor(229, 41, 56);
      doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

      // Product Pages with Grid Layout
      const productsPerPage = parseInt(gridLayout);
      let cols, rows;

      // Determine grid dimensions based on layout
      switch (gridLayout) {
        case '4': cols = 2; rows = 2; break;  // 2x2
        case '6': cols = 3; rows = 2; break;  // 3x2
        case '9': cols = 3; rows = 3; break;  // 3x3
        case '12': cols = 4; rows = 3; break; // 4x3
        case '16': cols = 4; rows = 4; break; // 4x4
        case '20': cols = 5; rows = 4; break; // 5x4
        default: cols = 3; rows = 3;
      }

      const cardMargin = 10;
      const gapBetweenCards = 5;
      const cardWidth = (pageWidth - cardMargin * 2 - (cols - 1) * gapBetweenCards) / cols;
      const cardHeight = (pageHeight - cardMargin * 2 - (rows - 1) * gapBetweenCards) / rows;

      let currentProduct = 0;
      let pageIndex = 2;

      while (currentProduct < catalogue.products.length) {
        doc.addPage();

        // Page background
        doc.setFillColor(250, 248, 245);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Top and bottom accent lines
        doc.setFillColor(229, 41, 56);
        doc.rect(0, 0, pageWidth, 2, 'F');
        doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

        // Render products in grid
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (currentProduct >= catalogue.products.length) break;

            const product = catalogue.products[currentProduct];
            const item = items.find((i) => i.id === product.itemId);
            if (!item) {
              currentProduct++;
              continue;
            }

            const category = categories.find((c) => c.id === item.categoryId);
            const subcategory = subcategories.find((s) => s.id === item.subcategoryId);
            const selectedImageId = selectedImages.get(product.itemId) || product.selectedImageId;

            const xPos = cardMargin + col * (cardWidth + gapBetweenCards);
            const yPos = cardMargin + row * (cardHeight + gapBetweenCards);

            // Card border
            doc.setDrawColor(232, 228, 220);
            doc.setLineWidth(0.3);
            doc.rect(xPos, yPos, cardWidth, cardHeight);

            let cardY = yPos + 3;
            const cardPadding = 3;

            // Product Name
            const fontSize = productsPerPage <= 9 ? 9 : (productsPerPage <= 12 ? 8 : 7);
            doc.setFontSize(fontSize);
            doc.setTextColor(26, 26, 26);
            doc.setFont('helvetica', 'bold');
            const nameLines = doc.splitTextToSize(item.itemName, cardWidth - cardPadding * 2);
            doc.text(nameLines.slice(0, 2), xPos + cardPadding, cardY);
            cardY += nameLines.slice(0, 2).length * (fontSize / 2) + 2;

            // Image placeholder
            const imgHeight = productsPerPage <= 9 ? 25 : (productsPerPage <= 12 ? 20 : 15);
            const imgWidth = cardWidth - cardPadding * 2;
            doc.setFillColor(240, 240, 240);
            doc.rect(xPos + cardPadding, cardY, imgWidth, imgHeight, 'F');
            doc.setFontSize(6);
            doc.setTextColor(180, 180, 180);
            doc.text('IMAGE', xPos + cardWidth / 2, cardY + imgHeight / 2, { align: 'center' });
            cardY += imgHeight + 2;

            // SKU
            if (catalogue.showSku && item.itemCode) {
              doc.setFontSize(6);
              doc.setTextColor(138, 138, 138);
              doc.setFont('courier', 'normal');
              doc.text(`SKU: ${item.itemCode}`, xPos + cardPadding, cardY);
              cardY += 3;
            }

            // Price
            if (catalogue.showPrice && item.price) {
              const priceSize = productsPerPage <= 9 ? 10 : (productsPerPage <= 12 ? 8 : 7);
              doc.setFontSize(priceSize);
              doc.setTextColor(229, 41, 56); // Red color matching logo
              doc.setFont('helvetica', 'bold');
              doc.text(`₹${item.price.toLocaleString('en-IN')}`, xPos + cardPadding, cardY);
              cardY += priceSize / 2 + 2;
            }

            // Description
            if (catalogue.showDescription && item.shortDescription) {
              doc.setFontSize(6);
              doc.setTextColor(90, 90, 90);
              doc.setFont('helvetica', 'normal');
              const descLines = doc.splitTextToSize(item.shortDescription, cardWidth - cardPadding * 2);
              const maxLines = productsPerPage <= 9 ? 3 : (productsPerPage <= 12 ? 2 : 1);
              doc.text(descLines.slice(0, maxLines), xPos + cardPadding, cardY);
            }

            currentProduct++;
          }
        }

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(`${pageIndex}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        pageIndex++;
      }

      return doc.output('blob');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (!catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p className="text-xl" style={{ color: colors.text.tertiary }}>Catalogue not found</p>
      </div>
    );
  }

  const catalogueItems = items.filter((item) =>
    catalogue.products.some((p) => p.itemId === item.id)
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="p-8 max-w-[1900px] mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/catalogues')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl transition mb-6 font-medium"
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
            <ArrowLeft className="w-5 h-5" />
            Back to Catalogues
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-5xl mb-3"
                style={{ fontFamily: 'Georgia, serif', color: colors.text.primary, fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                {catalogue.catalogueTitle}
              </h1>
              <p className="text-xl mb-3" style={{ color: colors.accent.gold, fontWeight: 500 }}>
                {catalogue.clientName}
              </p>
              {catalogue.notes && (
                <p className="text-base max-w-3xl leading-relaxed" style={{ color: colors.text.tertiary }}>
                  {catalogue.notes}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition font-medium"
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
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={handlePreviewPDF}
                disabled={!gridLayout}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.accent.gold,
                  color: '#FFFFFF',
                }}
              >
                <Download className="w-5 h-5" />
                {gridLayout ? 'Preview PDF' : 'Select Grid Layout First'}
              </button>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
        >
          <h2 className="text-base mb-3" style={{ color: colors.text.primary, fontWeight: 600 }}>
            PDF Grid Layout
          </h2>
          <p className="text-xs mb-3" style={{ color: colors.text.secondary }}>
            Select how to arrange products in the PDF catalogue
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { value: '4', label: '2×2', description: '4 per page' },
              { value: '6', label: '3×2', description: '6 per page' },
              { value: '9', label: '3×3', description: '9 per page' },
              { value: '12', label: '4×3', description: '12 per page' },
              { value: '16', label: '4×4', description: '16 per page' },
              { value: '20', label: '5×4', description: '20 per page' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setGridLayout(option.value as any)}
                className="p-3 rounded-lg transition-all duration-300 text-center"
                style={{
                  border: gridLayout === option.value ? `2px solid ${colors.accent.gold}` : `1px solid ${colors.border}`,
                  backgroundColor: gridLayout === option.value ? colors.hover : 'transparent',
                }}
              >
                <div className="mb-1">
                  <span className="text-lg font-bold" style={{ color: colors.accent.gold }}>
                    {option.value}
                  </span>
                  {gridLayout === option.value && (
                    <Check className="w-4 h-4 mx-auto mt-1" style={{ color: colors.accent.gold }} />
                  )}
                </div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: colors.text.primary }}>
                  {option.label}
                </p>
                <p className="text-xs" style={{ color: colors.text.tertiary, fontSize: '10px' }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2
            className="text-3xl"
            style={{ fontFamily: 'Georgia, serif', color: colors.text.primary, fontWeight: 600 }}
          >
            Selected Products
          </h2>
          <p className="text-lg" style={{ color: colors.text.secondary }}>
            {catalogueItems.length} {catalogueItems.length === 1 ? 'product' : 'products'} in this catalogue
          </p>
        </div>

        <div className="space-y-6">
          {catalogueItems.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);
            const subcategory = subcategories.find((s) => s.id === item.subcategoryId);
            const selectedImageId = selectedImages.get(item.id);

            return (
              <div
                key={item.id}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
              >
                <div className="flex gap-8">
                  <div className="flex-1">
                    <h3
                      className="text-2xl mb-3 leading-snug"
                      style={{ fontFamily: 'Georgia, serif', color: colors.text.primary, fontWeight: 600 }}
                    >
                      {item.itemName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.secondary,
                        }}
                      >
                        {category?.name}
                      </span>
                      <span
                        className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.text.secondary,
                        }}
                      >
                        {subcategory?.name}
                      </span>
                    </div>
                    <p className="text-base mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
                      {item.shortDescription}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5" style={{ color: colors.accent.gold }} />
                        <p className="text-base font-semibold" style={{ color: colors.text.primary }}>
                          Select Image for PDF Catalogue
                        </p>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-3">
                        {item.images.map((image) => {
                          const isSelected = selectedImageId === image.id;
                          return (
                            <button
                              key={image.id}
                              onClick={() => handleImageSelect(item.id, image.id)}
                              className="relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300"
                              style={{
                                border: isSelected ? `3px solid ${colors.accent.gold}` : `2px solid ${colors.border}`,
                                width: '160px',
                                height: '160px',
                                boxShadow: isSelected ? '0 4px 12px rgba(201, 169, 97, 0.3)' : 'none',
                              }}
                            >
                              <img
                                src={image.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div
                                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                                  style={{ backgroundColor: colors.accent.gold }}
                                >
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                              {image.isPrimary && (
                                <div
                                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    color: '#FFFFFF',
                                  }}
                                >
                                  Primary
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      {item.itemCode && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SKU</p>
                          <p className="text-base" style={{ color: colors.text.primary, fontFamily: 'Courier, monospace' }}>{item.itemCode}</p>
                        </div>
                      )}
                      {item.price && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</p>
                          <p
                            className="text-xl"
                            style={{ fontFamily: 'Georgia, serif', color: colors.accent.gold, fontWeight: 600 }}
                          >
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {item.minimumOrderQuantity && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MOQ</p>
                          <p className="text-base" style={{ color: colors.text.primary }}>{item.minimumOrderQuantity} units</p>
                        </div>
                      )}
                      {item.material && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Material</p>
                          <p className="text-base" style={{ color: colors.text.primary }}>{item.material}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                  PDF Preview
                </h2>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Review your catalogue before downloading
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-lg transition font-medium text-sm"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.text.secondary,
                    backgroundColor: 'transparent',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium shadow-sm text-sm"
                  style={{
                    backgroundColor: colors.accent.gold,
                    color: '#FFFFFF',
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {pdfDataUrl && (
                <iframe
                  src={pdfDataUrl}
                  className="w-full h-full rounded-lg"
                  style={{ border: `1px solid ${colors.border}` }}
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
