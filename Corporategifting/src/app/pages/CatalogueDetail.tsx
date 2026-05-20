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
import { backendApi } from '../services/backendApi';
import logo from '../../imports/logo.png';

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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfDataUrl);
      }
    };
  }, [pdfDataUrl]);

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
      const generatedPdfBlob = await generatePDFDocument();
      const typedPdfBlob = new Blob([await generatedPdfBlob.arrayBuffer()], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(typedPdfBlob);
      setPdfBlob(typedPdfBlob);
      setPdfDataUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('PDF preview generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to generate PDF preview: ${errorMessage}`);
    }
  };

  const handleDownloadPDF = () => {
    if (!catalogue || !currentUser) return;
    void (async () => {
      try {
        const fileName = `${catalogue.catalogueTitle.replace(/\s+/g, '-')}-${
          catalogue.clientName.replace(/\s+/g, '-')
        }-${new Date().toISOString().split('T')[0]}.pdf`;

        const blobToDataUrl = async (blob: Blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = typeof reader.result === 'string' ? reader.result : '';
              if (!result) {
                reject(new Error('Unable to read generated PDF.'));
                return;
              }
              resolve(result);
            };
            reader.onerror = () => reject(new Error('Unable to read generated PDF.'));
            reader.readAsDataURL(blob);
          });

        const pdfBlobToStore =
          pdfBlob ||
          (pdfDataUrl ? await fetch(pdfDataUrl).then((response) => response.blob()) : null);
        if (!pdfBlobToStore) {
          toast.error('PDF data is not available for download.');
          return;
        }

        const persistentPdfDataUrl = await blobToDataUrl(pdfBlobToStore);

        const link = document.createElement('a');
        link.href = persistentPdfDataUrl;
        link.download = fileName;
        link.click();

        // Save PDF metadata to backend collection.
        try {
          await backendApi.createPdf({
            catalogueId: catalogue.id,
            catalogueTitle: catalogue.catalogueTitle,
            clientName: catalogue.clientName,
            fileName,
            pdfDataUrl: persistentPdfDataUrl,
            gridLayout: gridLayout as '4' | '6' | '9' | '12' | '16' | '20',
            productCount: catalogue.products.length,
            createdBy: currentUser.id,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to store PDF in database.';
          toast.error(message);
        }

        // Keep local cache for backward compatibility.
        const pdfMetadata: PDFCatalogue = {
          id: `pdf${Date.now()}`,
          catalogueId: catalogue.id,
          catalogueTitle: catalogue.catalogueTitle,
          clientName: catalogue.clientName,
          fileName: fileName,
          pdfDataUrl: persistentPdfDataUrl,
          gridLayout: gridLayout as '4' | '6' | '9' | '12' | '16' | '20',
          productCount: catalogue.products.length,
          createdBy: currentUser.id,
          createdAt: new Date(),
        };

        const pdfsData = localStorage.getItem(STORAGE_KEYS.PDFS);
        const pdfs: PDFCatalogue[] = pdfsData ? JSON.parse(pdfsData) : [];
        pdfs.unshift(pdfMetadata);
        localStorage.setItem(STORAGE_KEYS.PDFS, JSON.stringify(pdfs));

        toast.success('PDF downloaded successfully!');
        setShowPreview(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to download PDF.';
        toast.error(message);
      }
    })();
  };

  type PdfImagePayload = {
    dataUrl: string;
    width: number;
    height: number;
  };

  const imageCache = new Map<string, Promise<PdfImagePayload | null>>();

  const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const imageElementToJpegPayload = (img: HTMLImageElement): PdfImagePayload | null => {
    try {
      const canvas = document.createElement('canvas');
      const width = (img.naturalWidth || img.width || 0);
      const height = (img.naturalHeight || img.height || 0);
      if (!width || !height) {
        return null;
      }

      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        width: canvas.width,
        height: canvas.height,
      };
    } catch {
      return null;
    }
  };

  const convertBlobToJpegPayload = async (blob: Blob): Promise<PdfImagePayload | null> => {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await loadImageElement(objectUrl);
      if (!image) {
        return null;
      }
      return imageElementToJpegPayload(image);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const loadImageForPdf = async (sourceUrl: string): Promise<PdfImagePayload | null> => {
    if (!sourceUrl) {
      return null;
    }

    try {
      if (sourceUrl.startsWith('data:image/')) {
        const directImage = await loadImageElement(sourceUrl);
        return directImage ? imageElementToJpegPayload(directImage) : null;
      }

      const response = await fetch(sourceUrl);
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith('image/')) {
          const payload = await convertBlobToJpegPayload(blob);
          if (payload) {
            return payload;
          }
        }
      }

      const fallbackImage = await loadImageElement(sourceUrl);
      if (fallbackImage) {
        return imageElementToJpegPayload(fallbackImage);
      }
    } catch {
      return null;
    }

    return null;
  };

  const getCachedPdfImage = (sourceUrl: string) => {
    if (!imageCache.has(sourceUrl)) {
      imageCache.set(sourceUrl, loadImageForPdf(sourceUrl));
    }
    return imageCache.get(sourceUrl)!;
  };

  const drawImageContained = (
    doc: jsPDF,
    image: PdfImagePayload,
    boxX: number,
    boxY: number,
    boxWidth: number,
    boxHeight: number,
  ) => {
    try {
      if (!image.width || !image.height) {
        return false;
      }

      const imageRatio = image.width / image.height;
      const boxRatio = boxWidth / boxHeight;

      let drawWidth = boxWidth;
      let drawHeight = boxHeight;

      if (imageRatio > boxRatio) {
        drawHeight = boxWidth / imageRatio;
      } else {
        drawWidth = boxHeight * imageRatio;
      }

      const offsetX = boxX + (boxWidth - drawWidth) / 2;
      const offsetY = boxY + (boxHeight - drawHeight) / 2;

      doc.addImage(image.dataUrl, 'JPEG', offsetX, offsetY, drawWidth, drawHeight, undefined, 'FAST');
      return true;
    } catch {
      return false;
    }
  };

  const resolveCatalogueImageUrl = (item: Item, selectedImageId?: string) => {
    if (!Array.isArray(item.images) || item.images.length === 0) {
      return '';
    }

    const selected = selectedImageId ? item.images.find((image) => image.id === selectedImageId) : undefined;
    const primary = item.images.find((image) => image.isPrimary);

    return selected?.imageUrl || primary?.imageUrl || item.images[0]?.imageUrl || '';
  };

  const getGridDimensions = (layout: string) => {
    switch (layout) {
      case '4':
        return { cols: 2, rows: 2, perPage: 4 };
      case '6':
        return { cols: 3, rows: 2, perPage: 6 };
      case '9':
        return { cols: 3, rows: 3, perPage: 9 };
      case '12':
        return { cols: 4, rows: 3, perPage: 12 };
      case '16':
        return { cols: 4, rows: 4, perPage: 16 };
      case '20':
        return { cols: 5, rows: 4, perPage: 20 };
      default:
        return { cols: 3, rows: 3, perPage: 9 };
    }
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
      const logoPayload = await getCachedPdfImage(logo);

      // Premium brochure-style PDF generation path.
      {
        const brochureMargin = 14;
        const contentWidth = pageWidth - brochureMargin * 2;
        const generatedDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const softPalettes = [
          { base: [250, 250, 249], accent: [196, 181, 253], accentSoft: [224, 242, 254], chip: [251, 207, 232] },
          { base: [250, 250, 249], accent: [187, 247, 208], accentSoft: [254, 215, 170], chip: [186, 230, 253] },
          { base: [250, 250, 249], accent: [224, 231, 255], accentSoft: [254, 202, 202], chip: [220, 252, 231] },
        ] as const;

        type ResolvedProduct = {
          item: Item;
          categoryName: string;
          subcategoryName: string;
          imageUrl: string;
        };

        const resolvedProducts: ResolvedProduct[] = catalogue.products
          .map((catalogueProduct) => {
            const item = items.find((entry) => entry.id === catalogueProduct.itemId);
            if (!item) return null;
            const categoryName = categories.find((entry) => entry.id === item.categoryId)?.name || 'Uncategorized';
            const subcategoryName = subcategories.find((entry) => entry.id === item.subcategoryId)?.name || 'General';
            const selectedImageId =
              selectedImages.get(catalogueProduct.itemId) || catalogueProduct.selectedImageId;
            const imageUrl = resolveCatalogueImageUrl(item, selectedImageId);
            return { item, categoryName, subcategoryName, imageUrl };
          })
          .filter((entry): entry is ResolvedProduct => Boolean(entry));

        const uniqueCategories = Array.from(new Set(resolvedProducts.map((entry) => entry.categoryName)));
        const uniqueSubcategories = Array.from(new Set(resolvedProducts.map((entry) => entry.subcategoryName)));

        const drawBackdrop = (paletteIndex: number) => {
          const palette = softPalettes[paletteIndex % softPalettes.length];
          doc.setFillColor(palette.base[0], palette.base[1], palette.base[2]);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');

          doc.setFillColor(palette.accent[0], palette.accent[1], palette.accent[2]);
          doc.roundedRect(-20, -10, pageWidth * 0.62, 50, 14, 14, 'F');

          doc.setFillColor(palette.accentSoft[0], palette.accentSoft[1], palette.accentSoft[2]);
          doc.roundedRect(pageWidth * 0.5, 22, pageWidth * 0.58, 46, 14, 14, 'F');

          doc.setFillColor(palette.chip[0], palette.chip[1], palette.chip[2]);
          doc.roundedRect(pageWidth * 0.68, pageHeight - 42, pageWidth * 0.34, 38, 10, 10, 'F');
        };

        const drawLogo = (x: number, y: number, targetHeight: number) => {
          if (!logoPayload || !logoPayload.width || !logoPayload.height) return;
          try {
            const width = targetHeight * (logoPayload.width / logoPayload.height);
            doc.addImage(logoPayload.dataUrl, 'JPEG', x, y, width, targetHeight);
          } catch {
            // Ignore logo image failures.
          }
        };

        const drawFooter = (pageNumber: number) => {
          doc.setDrawColor(228, 228, 228);
          doc.setLineWidth(0.3);
          doc.line(brochureMargin, pageHeight - 13, pageWidth - brochureMargin, pageHeight - 13);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(110, 110, 110);
          doc.text('Metaphi Innovations Private Limited', brochureMargin, pageHeight - 8.2);
          doc.text('www.metaphi.in | gifting@metaphi.in', pageWidth / 2, pageHeight - 8.2, { align: 'center' });
          doc.text(`Page ${pageNumber}`, pageWidth - brochureMargin, pageHeight - 8.2, { align: 'right' });
        };

        let pageNumber = 1;

        // Page 1: Cover
        drawBackdrop(0);
        drawLogo(brochureMargin, 10, 16);

        const heroProduct = resolvedProducts.find((entry) => Boolean(entry.imageUrl));
        if (heroProduct?.imageUrl) {
          const heroImage = await getCachedPdfImage(heroProduct.imageUrl);
          if (heroImage) {
            const heroX = brochureMargin;
            const heroY = 34;
            const heroW = contentWidth;
            const heroH = 92;
            doc.setDrawColor(236, 236, 236);
            doc.setLineWidth(0.3);
            doc.roundedRect(heroX, heroY, heroW, heroH, 4, 4, 'S');
            drawImageContained(doc, heroImage, heroX, heroY, heroW, heroH);
          }
        }

        doc.setFont('times', 'bold');
        doc.setTextColor(24, 28, 36);
        doc.setFontSize(32);
        const coverTitle = doc.splitTextToSize(
          catalogue.catalogueTitle || `Creative Corporate Gifting Collection ${new Date().getFullYear()}`,
          contentWidth,
        );
        doc.text(coverTitle.slice(0, 3), brochureMargin, 146);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(84, 93, 103);
        doc.setFontSize(12);
        doc.text('A curated gifting lookbook crafted for meaningful brand moments.', brochureMargin, 168);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 51, 59);
        doc.setFontSize(11);
        doc.text(`Prepared Exclusively for ${catalogue.clientName}`, brochureMargin, 181);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 126, 135);
        doc.setFontSize(10);
        doc.text(`Generated on ${generatedDate}`, brochureMargin, 189);

        drawFooter(pageNumber);

        // Page 2: Introduction
        doc.addPage();
        pageNumber += 1;
        drawBackdrop(1);
        drawLogo(brochureMargin, 10, 12);

        doc.setFont('times', 'bold');
        doc.setTextColor(24, 28, 36);
        doc.setFontSize(30);
        doc.text('Welcome', brochureMargin, 34);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(86, 95, 104);
        doc.setFontSize(11.2);
        const introText = doc.splitTextToSize(
          `Thank you for the opportunity to prepare this collection for ${catalogue.clientName}. ` +
            `This proposal showcases curated products designed for meaningful corporate gifting experiences.`,
          116,
        );
        doc.text(introText, brochureMargin, 48);

        doc.setDrawColor(228, 228, 228);
        doc.setLineWidth(0.4);
        doc.line(brochureMargin, 95, pageWidth - brochureMargin, 95);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 51, 59);
        doc.setFontSize(13);
        doc.text('Collection Highlights', brochureMargin, 108);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(93, 102, 111);
        doc.setFontSize(10.6);
        doc.text(
          `Products included: ${resolvedProducts.length}\n` +
            `Categories covered: ${uniqueCategories.length}\n` +
            `Sub-categories covered: ${uniqueSubcategories.length}`,
          brochureMargin,
          118,
        );

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(225, 225, 225);
        doc.roundedRect(pageWidth - brochureMargin - 72, 102, 72, 82, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(46, 52, 60);
        doc.text('Categories Included', pageWidth - brochureMargin - 67, 114);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.2);
        doc.setTextColor(98, 106, 115);
        const categoriesText = uniqueCategories.length ? uniqueCategories.join('\n') : 'No categories selected.';
        const categoryLines = doc.splitTextToSize(categoriesText, 60);
        doc.text(categoryLines.slice(0, 10), pageWidth - brochureMargin - 67, 123);

        if (catalogue.notes) {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(230, 230, 230);
          doc.roundedRect(brochureMargin, 192, contentWidth, 56, 4, 4, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(45, 51, 59);
          doc.setFontSize(11);
          doc.text('Client Note', brochureMargin + 4, 202);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(95, 103, 112);
          doc.setFontSize(9.8);
          const noteLines = doc.splitTextToSize(catalogue.notes, contentWidth - 8);
          doc.text(noteLines.slice(0, 6), brochureMargin + 4, 210);
        }

        drawFooter(pageNumber);

        // Product pages in selected grid layout
        const { cols, rows, perPage: productsPerPage } = getGridDimensions(gridLayout || '9');
        const headerHeight = 26;
        const footerReserve = 18;
        const gridTop = brochureMargin + headerHeight;
        const gridHeight = pageHeight - gridTop - brochureMargin - footerReserve;
        const gapBetweenCards = productsPerPage >= 16 ? 2.5 : productsPerPage >= 12 ? 3.2 : 4;
        const cardWidth = (contentWidth - (cols - 1) * gapBetweenCards) / cols;
        const cardHeight = (gridHeight - (rows - 1) * gapBetweenCards) / rows;

        for (let pageStart = 0; pageStart < resolvedProducts.length; pageStart += productsPerPage) {
          doc.addPage();
          pageNumber += 1;
          drawBackdrop(2 + Math.floor(pageStart / productsPerPage));
          drawLogo(brochureMargin, 9.5, 9.8);

          const pageProducts = resolvedProducts.slice(pageStart, pageStart + productsPerPage);
          const pageCategoryLine = Array.from(new Set(pageProducts.map((entry) => entry.categoryName))).join(' • ');

          doc.setFont('times', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(24, 28, 36);
          doc.text('Curated Product Selection', brochureMargin + 20, 16.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.2);
          doc.setTextColor(105, 113, 122);
          doc.text(
            doc.splitTextToSize(pageCategoryLine || 'Premium selections', 90),
            pageWidth - brochureMargin,
            15.6,
            { align: 'right' },
          );

          for (let cardIndex = 0; cardIndex < pageProducts.length; cardIndex += 1) {
            const product = pageProducts[cardIndex];
            const row = Math.floor(cardIndex / cols);
            const col = cardIndex % cols;
            const xPos = brochureMargin + col * (cardWidth + gapBetweenCards);
            const yPos = gridTop + row * (cardHeight + gapBetweenCards);

            const palette = softPalettes[(pageNumber + cardIndex) % softPalettes.length];
            const imageHeight = cardHeight * (productsPerPage >= 16 ? 0.46 : productsPerPage >= 12 ? 0.5 : 0.56);
            const cardPadding = productsPerPage >= 16 ? 1.8 : 2.4;

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(228, 228, 228);
            doc.setLineWidth(0.25);
            doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2.4, 2.4, 'FD');

            const imageX = xPos + cardPadding;
            const imageY = yPos + cardPadding;
            const imageW = cardWidth - cardPadding * 2;
            const imageH = imageHeight - cardPadding;

            doc.setFillColor(palette.accentSoft[0], palette.accentSoft[1], palette.accentSoft[2]);
            doc.roundedRect(imageX, imageY, imageW, imageH, 2, 2, 'F');

            let imageRendered = false;
            if (product.imageUrl) {
              const resolvedImage = await getCachedPdfImage(product.imageUrl);
              if (resolvedImage) {
                imageRendered = drawImageContained(doc, resolvedImage, imageX, imageY, imageW, imageH);
              }
            }

            if (!imageRendered) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(6.2);
              doc.setTextColor(170, 170, 170);
              doc.text('IMAGE', xPos + cardWidth / 2, imageY + imageH / 2, { align: 'center' });
            }

            let textY = yPos + imageHeight + (productsPerPage >= 16 ? 2.6 : 3);
            const nameSize = productsPerPage >= 16 ? 6.2 : productsPerPage >= 12 ? 7 : 8.2;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(nameSize);
            doc.setTextColor(28, 34, 42);
            const nameLines = doc.splitTextToSize(product.item.itemName || 'Untitled Product', cardWidth - cardPadding * 2);
            doc.text(nameLines.slice(0, 2), xPos + cardPadding, textY);
            textY += nameLines.slice(0, 2).length * (nameSize * 0.48) + 1.4;

            doc.setFillColor(palette.accent[0], palette.accent[1], palette.accent[2]);
            doc.roundedRect(xPos + cardPadding, textY - 1.4, cardWidth - cardPadding * 2, 4.4, 1.4, 1.4, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(productsPerPage >= 16 ? 5 : 6.2);
            doc.setTextColor(62, 69, 78);
            const metaText = `${product.categoryName} • ${product.subcategoryName}`;
            const metaLines = doc.splitTextToSize(metaText, cardWidth - cardPadding * 2 - 1.6);
            doc.text(metaLines[0] || '', xPos + cardPadding + 0.8, textY + 1.4);
            textY += 6;

            if (catalogue.showDescription && product.item.shortDescription) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(productsPerPage >= 16 ? 4.8 : 6);
              doc.setTextColor(103, 110, 118);
              const maxDescriptionLines = productsPerPage >= 16 ? 2 : productsPerPage >= 12 ? 3 : 4;
              const descriptionLines = doc.splitTextToSize(product.item.shortDescription, cardWidth - cardPadding * 2);
              doc.text(descriptionLines.slice(0, maxDescriptionLines), xPos + cardPadding, textY);
              textY += maxDescriptionLines * (productsPerPage >= 16 ? 2 : 2.5);
            }

            const infoBits: string[] = [];
            if (catalogue.showSku && product.item.itemCode) infoBits.push(`SKU ${product.item.itemCode}`);
            if (catalogue.showPrice && product.item.price) infoBits.push(`Rs. ${Number(product.item.price).toLocaleString('en-IN')}`);
            if (catalogue.showMoq && product.item.minimumOrderQuantity) infoBits.push(`MOQ ${product.item.minimumOrderQuantity}`);

            if (infoBits.length > 0) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(productsPerPage >= 16 ? 5 : 6.2);
              doc.setTextColor(42, 49, 57);
              const infoLines = doc.splitTextToSize(infoBits.join('  |  '), cardWidth - cardPadding * 2);
              doc.text(infoLines.slice(0, 2), xPos + cardPadding, Math.min(yPos + cardHeight - 2.4, textY + 2.4));
            }
          }

          drawFooter(pageNumber);
        }

        // Final CTA page
        doc.addPage();
        pageNumber += 1;
        drawBackdrop(1);
        drawLogo(brochureMargin, 14, 16);

        doc.setFont('times', 'bold');
        doc.setTextColor(24, 28, 36);
        doc.setFontSize(30);
        doc.text('Thank You', brochureMargin, 62);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(83, 92, 103);
        doc.setFontSize(13);
        const ctaLines = doc.splitTextToSize(
          'Let us create meaningful gifting experiences together.\n' +
            'We would be delighted to personalize the next version of this proposal for your upcoming campaigns.',
          contentWidth - 6,
        );
        doc.text(ctaLines, brochureMargin, 80);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(228, 228, 228);
        doc.roundedRect(brochureMargin, 132, contentWidth, 56, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(45, 51, 59);
        doc.text('Prepared For', brochureMargin + 4, 143);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(85, 93, 102);
        doc.text(catalogue.clientName, brochureMargin + 4, 152);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(45, 51, 59);
        doc.text('Contact', brochureMargin + 4, 166);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(92, 101, 110);
        doc.text('gifting@metaphi.in', brochureMargin + 4, 174);
        doc.text('www.metaphi.in', brochureMargin + 62, 174);
        doc.text(`Generated on ${generatedDate}`, brochureMargin + 112, 174);

        drawFooter(pageNumber);

        const pdfArrayBuffer = doc.output('arraybuffer');
        return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      }

      // Cover Page
      // Background decoration
      doc.setFillColor(250, 248, 245);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Red accent line at top
      doc.setFillColor(229, 41, 56);
      doc.rect(0, 0, pageWidth, 3, 'F');

      // Add logo image at top
      if (logoPayload && logoPayload.width && logoPayload.height) {
        try {
          const logoHeight = 30;
          const logoWidth = logoHeight * (logoPayload.width / logoPayload.height);
          doc.addImage(logoPayload.dataUrl, 'JPEG', (pageWidth - logoWidth) / 2, 30, logoWidth, logoHeight);
        } catch {
          // Ignore logo failure and continue PDF generation.
        }
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
      const { cols, rows, perPage: productsPerPage } = getGridDimensions(gridLayout);

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

        if (logoPayload && logoPayload.width && logoPayload.height) {
          try {
            const headerLogoHeight = 5.5;
            const headerLogoWidth = headerLogoHeight * (logoPayload.width / logoPayload.height);
            doc.addImage(logoPayload.dataUrl, 'JPEG', margin, 3.5, headerLogoWidth, headerLogoHeight);
          } catch {
            // Ignore logo failure and continue rendering product cards.
          }
        }

        // Render products in grid
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (currentProduct >= catalogue.products.length) break;

            try {
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
              const nameLines = doc.splitTextToSize(item.itemName || 'Untitled Product', cardWidth - cardPadding * 2);
              doc.text(nameLines.slice(0, 2), xPos + cardPadding, cardY);
              cardY += nameLines.slice(0, 2).length * (fontSize / 2) + 2;

              const imgHeight = productsPerPage <= 9 ? 25 : (productsPerPage <= 12 ? 20 : 15);
              const imgWidth = cardWidth - cardPadding * 2;
              const imageBoxX = xPos + cardPadding;
              const imageBoxY = cardY;
              const imageUrl = resolveCatalogueImageUrl(item, selectedImageId);
              let imageRendered = false;

              doc.setDrawColor(232, 228, 220);
              doc.setLineWidth(0.2);
              doc.rect(imageBoxX, imageBoxY, imgWidth, imgHeight);

              if (imageUrl) {
                const pdfImage = await getCachedPdfImage(imageUrl);
                if (pdfImage) {
                  imageRendered = drawImageContained(doc, pdfImage, imageBoxX, imageBoxY, imgWidth, imgHeight);
                }
              }

              if (!imageRendered) {
                doc.setFillColor(240, 240, 240);
                doc.rect(imageBoxX, imageBoxY, imgWidth, imgHeight, 'F');
                doc.setFontSize(6);
                doc.setTextColor(180, 180, 180);
                doc.text('IMAGE', xPos + cardWidth / 2, cardY + imgHeight / 2, { align: 'center' });
              }

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
                doc.setTextColor(229, 41, 56);
                doc.setFont('helvetica', 'bold');
                doc.text(`Rs. ${Number(item.price).toLocaleString('en-IN')}`, xPos + cardPadding, cardY);
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
            } catch (productRenderError) {
              console.error('Failed rendering product card in PDF:', productRenderError);
            } finally {
              currentProduct++;
            }
          }
        }

        // Page number
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(`${pageIndex}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        pageIndex++;
      }

      const pdfArrayBuffer = doc.output('arraybuffer');
      return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    } catch (error) {
      console.error('generatePDFDocument failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message || 'Unknown PDF generation error');
    }
  };

  if (!catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p className="text-xl" style={{ color: colors.text.tertiary }}>Catalogue not found</p>
      </div>
    );
  }

  const catalogueItems = catalogue.products
    .map((product) => items.find((item) => item.id === product.itemId))
    .filter((item): item is Item => Boolean(item));

  const previewGeneratedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const previewPastelPalettes = [
    { base: '#FAFAF9', accent: '#C4B5FD', accentSoft: '#E0F2FE', chip: '#FBCFE8' },
    { base: '#FAFAF9', accent: '#BBF7D0', accentSoft: '#FED7AA', chip: '#BAE6FD' },
    { base: '#FAFAF9', accent: '#E0E7FF', accentSoft: '#FECACA', chip: '#DCFCE7' },
  ];

  type PreviewResolvedProduct = {
    item: Item;
    categoryName: string;
    subcategoryName: string;
    imageUrl: string;
  };

  const previewResolvedProducts: PreviewResolvedProduct[] = catalogue.products
    .map((catalogueProduct) => {
      const item = items.find((entry) => entry.id === catalogueProduct.itemId);
      if (!item) return null;
      const categoryName = categories.find((entry) => entry.id === item.categoryId)?.name || 'Uncategorized';
      const subcategoryName = subcategories.find((entry) => entry.id === item.subcategoryId)?.name || 'General';
      const selectedImageId = selectedImages.get(catalogueProduct.itemId) || catalogueProduct.selectedImageId;
      const imageUrl = resolveCatalogueImageUrl(item, selectedImageId);
      return { item, categoryName, subcategoryName, imageUrl };
    })
    .filter((entry): entry is PreviewResolvedProduct => Boolean(entry));

  const previewUniqueCategories = Array.from(new Set(previewResolvedProducts.map((entry) => entry.categoryName)));
  const previewUniqueSubcategories = Array.from(new Set(previewResolvedProducts.map((entry) => entry.subcategoryName)));

  const previewGrid = getGridDimensions(gridLayout || '9');
  const previewProductPages: PreviewResolvedProduct[][] = [];
  for (let index = 0; index < previewResolvedProducts.length; index += previewGrid.perPage) {
    previewProductPages.push(previewResolvedProducts.slice(index, index + previewGrid.perPage));
  }

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
              <div className="space-y-6">
                <div
                  className="mx-auto rounded-lg p-6"
                  style={{
                    maxWidth: '900px',
                    backgroundColor: previewPastelPalettes[0].base,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: previewPastelPalettes[0].accentSoft }}>
                    {previewResolvedProducts[0]?.imageUrl ? (
                      <img
                        src={previewResolvedProducts[0].imageUrl}
                        alt="Cover hero"
                        className="w-full rounded-md object-cover"
                        style={{ maxHeight: '260px' }}
                      />
                    ) : (
                      <div className="w-full rounded-md flex items-center justify-center" style={{ height: '260px', backgroundColor: '#F3F4F6', color: colors.text.tertiary }}>
                        HERO IMAGE
                      </div>
                    )}
                  </div>
                  <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                  <h3 className="mt-4 text-4xl leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#181C24', fontWeight: 700 }}>
                    {catalogue.catalogueTitle || `Creative Corporate Gifting Collection ${new Date().getFullYear()}`}
                  </h3>
                  <p className="mt-3 text-base" style={{ color: '#535C67' }}>
                    A curated gifting lookbook crafted for meaningful brand moments.
                  </p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: '#2D333B' }}>
                    Prepared Exclusively for {catalogue.clientName}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#787E87' }}>
                    Generated on {previewGeneratedDate}
                  </p>
                </div>

                <div
                  className="mx-auto rounded-lg p-6"
                  style={{
                    maxWidth: '900px',
                    backgroundColor: previewPastelPalettes[1].base,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <img src={logo} alt="Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
                  <h3 className="mt-3 text-4xl" style={{ fontFamily: 'Georgia, serif', color: '#181C24', fontWeight: 700 }}>
                    Welcome
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: '#565F68', maxWidth: '720px' }}>
                    Thank you for the opportunity to prepare this collection for {catalogue.clientName}. This proposal showcases curated products designed for meaningful corporate gifting experiences.
                  </p>
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}` }}>
                      <p className="text-sm font-semibold" style={{ color: '#2D333B' }}>Collection Highlights</p>
                      <p className="text-sm mt-2" style={{ color: '#5D6670' }}>Products included: {previewResolvedProducts.length}</p>
                      <p className="text-sm" style={{ color: '#5D6670' }}>Categories covered: {previewUniqueCategories.length}</p>
                      <p className="text-sm" style={{ color: '#5D6670' }}>Sub-categories covered: {previewUniqueSubcategories.length}</p>
                    </div>
                    <div className="rounded-md p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}` }}>
                      <p className="text-sm font-semibold" style={{ color: '#2D333B' }}>Categories Included</p>
                      <p className="text-sm mt-2 whitespace-pre-line" style={{ color: '#5D6670' }}>
                        {previewUniqueCategories.length ? previewUniqueCategories.join('\n') : 'No categories selected.'}
                      </p>
                    </div>
                  </div>
                  {catalogue.notes && (
                    <div className="mt-4 rounded-md p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}` }}>
                      <p className="text-sm font-semibold" style={{ color: '#2D333B' }}>Client Note</p>
                      <p className="text-sm mt-2 leading-relaxed" style={{ color: '#5D6670' }}>{catalogue.notes}</p>
                    </div>
                  )}
                </div>

                {previewProductPages.length > 0 ? (
                  previewProductPages.map((pageItems, pageIndex) => (
                    <div
                      key={`preview-page-${pageIndex}`}
                      className="mx-auto rounded-lg p-6"
                      style={{
                        maxWidth: '900px',
                        backgroundColor: previewPastelPalettes[(pageIndex + 2) % previewPastelPalettes.length].base,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <img src={logo} alt="Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
                        <div className="text-right">
                          <p className="text-base font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#181C24' }}>
                            Curated Product Selection
                          </p>
                          <p className="text-xs" style={{ color: '#69717A' }}>
                            {Array.from(new Set(pageItems.map((entry) => entry.categoryName))).join(' • ') || 'Premium selections'}
                          </p>
                        </div>
                      </div>

                      <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${previewGrid.cols}, minmax(0, 1fr))` }}
                      >
                        {pageItems.map((entry, cardIndex) => {
                          const palette = previewPastelPalettes[(pageIndex + cardIndex) % previewPastelPalettes.length];
                          const infoBits: string[] = [];
                          if (catalogue.showSku && entry.item.itemCode) infoBits.push(`SKU ${entry.item.itemCode}`);
                          if (catalogue.showPrice && entry.item.price) infoBits.push(`Rs. ${Number(entry.item.price).toLocaleString('en-IN')}`);
                          if (catalogue.showMoq && entry.item.minimumOrderQuantity) infoBits.push(`MOQ ${entry.item.minimumOrderQuantity}`);

                          return (
                            <div
                              key={`preview-item-${pageIndex}-${entry.item.id}`}
                              className="rounded-md p-2"
                              style={{ border: `1px solid ${colors.border}`, backgroundColor: '#FFFFFF' }}
                            >
                              <div className="w-full mb-2 rounded-md overflow-hidden" style={{ aspectRatio: '4 / 3', backgroundColor: palette.accentSoft }}>
                                {entry.imageUrl ? (
                                  <img src={entry.imageUrl} alt={entry.item.itemName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: colors.text.tertiary }}>
                                    IMAGE
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-semibold leading-snug" style={{ color: '#1C222A' }}>
                                {entry.item.itemName}
                              </p>
                              <div className="mt-1 px-2 py-1 rounded-full text-[10px] inline-block" style={{ backgroundColor: palette.accent, color: '#3E454E' }}>
                                {entry.categoryName} • {entry.subcategoryName}
                              </div>
                              {catalogue.showDescription && entry.item.shortDescription && (
                                <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#676E76' }}>
                                  {entry.item.shortDescription}
                                </p>
                              )}
                              {infoBits.length > 0 && (
                                <p className="text-[11px] mt-2 font-semibold" style={{ color: '#2A3139' }}>
                                  {infoBits.join(' | ')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 text-center text-xs" style={{ color: colors.text.tertiary }}>
                        Page {pageIndex + 3}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="mx-auto rounded-lg p-6 text-sm"
                    style={{ maxWidth: '900px', border: `1px solid ${colors.border}`, color: colors.text.tertiary, backgroundColor: '#FFFFFF' }}
                  >
                    No products available for preview.
                  </div>
                )}

                <div
                  className="mx-auto rounded-lg p-6"
                  style={{
                    maxWidth: '900px',
                    backgroundColor: previewPastelPalettes[2].base,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                  <h3 className="mt-4 text-4xl" style={{ fontFamily: 'Georgia, serif', color: '#181C24', fontWeight: 700 }}>
                    Thank You
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: '#535C67', maxWidth: '760px' }}>
                    Let us create meaningful gifting experiences together. We would be delighted to personalize the next version of this proposal for your upcoming campaigns.
                  </p>
                  <div className="mt-5 rounded-md p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}` }}>
                    <p className="text-sm font-semibold" style={{ color: '#2D333B' }}>Prepared For</p>
                    <p className="text-sm mt-1" style={{ color: '#5D6670' }}>{catalogue.clientName}</p>
                    <p className="text-sm mt-3 font-semibold" style={{ color: '#2D333B' }}>Contact</p>
                    <p className="text-sm mt-1" style={{ color: '#5D6670' }}>gifting@metaphi.in</p>
                    <p className="text-sm" style={{ color: '#5D6670' }}>www.metaphi.in</p>
                    <p className="text-xs mt-2" style={{ color: '#7A818A' }}>Generated on {previewGeneratedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
