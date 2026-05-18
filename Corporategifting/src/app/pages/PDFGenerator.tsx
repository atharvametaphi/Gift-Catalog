import React, { useEffect, useState } from 'react';
import { Item, Category, Subcategory, Settings } from '../types';
import { STORAGE_KEYS } from '../mockData';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Download, Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react';

export const PDFGenerator: React.FC = () => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [pdfConfig, setPdfConfig] = useState({
    catalogueTitle: 'Product Catalogue',
    clientName: '',
    layoutType: '2' as '1' | '2' | '3' | '4',
    pageSize: 'A4' as 'A4' | 'Letter',
    orientation: 'portrait' as 'portrait' | 'landscape',
    showPrice: true,
    showMoq: true,
    showSku: true,
    showCategory: true,
    showSubcategory: true,
    showDescription: true,
    showTags: false,
    includeCoverPage: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedIds = localStorage.getItem('selectedItemsForPDF');
    const itemsData = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const categoriesData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const subcategoriesData = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (storedIds) setSelectedItemIds(JSON.parse(storedIds));
    if (itemsData) setItems(JSON.parse(itemsData));
    if (categoriesData) setCategories(JSON.parse(categoriesData));
    if (subcategoriesData) setSubcategories(JSON.parse(subcategoriesData));
    if (settingsData) setSettings(JSON.parse(settingsData));
  };

  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));

  const generatePDF = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: pdfConfig.orientation,
        unit: 'mm',
        format: pdfConfig.pageSize === 'A4' ? 'a4' : 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      if (pdfConfig.includeCoverPage) {
        doc.setFontSize(32);
        doc.text(pdfConfig.catalogueTitle, pageWidth / 2, 80, { align: 'center' });

        if (pdfConfig.clientName) {
          doc.setFontSize(20);
          doc.text(pdfConfig.clientName, pageWidth / 2, 100, { align: 'center' });
        }

        if (settings) {
          doc.setFontSize(12);
          doc.text(settings.companyName, pageWidth / 2, 120, { align: 'center' });
        }

        doc.setFontSize(10);
        doc.text(new Date().toLocaleDateString(), pageWidth / 2, 140, { align: 'center' });

        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      const cols = parseInt(pdfConfig.layoutType);
      const margin = 15;
      const cardWidth = (pageWidth - margin * 2 - (cols - 1) * 5) / cols;
      const cardHeight = 80;

      let currentCol = 0;
      let currentRow = 0;

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        const category = categories.find((c) => c.id === item.categoryId);
        const subcategory = subcategories.find((s) => s.id === item.subcategoryId);

        const xPos = margin + currentCol * (cardWidth + 5);
        yPos = 20 + currentRow * (cardHeight + 5);

        if (yPos + cardHeight > pageHeight - 20) {
          doc.addPage();
          currentRow = 0;
          yPos = 20;
        }

        doc.rect(xPos, yPos, cardWidth, cardHeight);

        let textY = yPos + 5;
        doc.setFontSize(12);
        const nameLines = doc.splitTextToSize(item.itemName, cardWidth - 10);
        doc.text(nameLines.slice(0, 2), xPos + 5, textY);
        textY += nameLines.slice(0, 2).length * 6;

        doc.setFontSize(8);

        if (pdfConfig.showSku && item.itemCode) {
          doc.text(`SKU: ${item.itemCode}`, xPos + 5, textY);
          textY += 4;
        }

        if (pdfConfig.showCategory && category) {
          doc.text(`Category: ${category.name}`, xPos + 5, textY);
          textY += 4;
        }

        if (pdfConfig.showSubcategory && subcategory) {
          doc.text(`Subcategory: ${subcategory.name}`, xPos + 5, textY);
          textY += 4;
        }

        if (pdfConfig.showDescription && item.shortDescription) {
          const descLines = doc.splitTextToSize(item.shortDescription, cardWidth - 10);
          doc.text(descLines.slice(0, 3), xPos + 5, textY);
          textY += descLines.slice(0, 3).length * 4;
        }

        if (pdfConfig.showPrice && item.price) {
          doc.setFontSize(10);
          doc.text(`Price: $${item.price}`, xPos + 5, textY);
          textY += 5;
        }

        if (pdfConfig.showMoq && item.minimumOrderQuantity) {
          doc.setFontSize(8);
          doc.text(`MOQ: ${item.minimumOrderQuantity}`, xPos + 5, textY);
        }

        currentCol++;
        if (currentCol >= cols) {
          currentCol = 0;
          currentRow++;
        }
      }

      if (settings) {
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.text(settings.defaultPdfFooter, pageWidth / 2, footerY, { align: 'center' });
      }

      const fileName = `${pdfConfig.catalogueTitle.replace(/\s+/g, '-')}-${
        pdfConfig.clientName || 'Catalogue'
      }-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Catalogue Generator</h1>
          <p className="text-gray-600">Customize and generate your product catalogue</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Selected Products ({selectedItems.length})</h2>
            {selectedItems.length === 0 ? (
              <p className="text-gray-500">No products selected. Go to Catalogue to select products.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedItems.map((item) => {
                  const primaryImage = item.images.find((img) => img.isPrimary);
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      {primaryImage && (
                        <img
                          src={primaryImage.imageUrl}
                          alt={item.itemName}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.itemName}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              PDF Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catalogue Title</label>
                <input
                  type="text"
                  value={pdfConfig.catalogueTitle}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, catalogueTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  value={pdfConfig.clientName}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Products per Row</label>
                <select
                  value={pdfConfig.layoutType}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, layoutType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="1">1 per row</option>
                  <option value="2">2 per row</option>
                  <option value="3">3 per row</option>
                  <option value="4">4 per row</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select
                  value={pdfConfig.pageSize}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, pageSize: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                <select
                  value={pdfConfig.orientation}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, orientation: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Show in PDF:</p>
                <div className="space-y-2">
                  {[
                    { key: 'includeCoverPage', label: 'Cover Page' },
                    { key: 'showPrice', label: 'Price' },
                    { key: 'showMoq', label: 'Minimum Order Quantity' },
                    { key: 'showSku', label: 'SKU / Item Code' },
                    { key: 'showCategory', label: 'Category' },
                    { key: 'showSubcategory', label: 'Subcategory' },
                    { key: 'showDescription', label: 'Description' },
                    { key: 'showTags', label: 'Tags' },
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfConfig[option.key as keyof typeof pdfConfig] as boolean}
                        onChange={(e) =>
                          setPdfConfig({ ...pdfConfig, [option.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
