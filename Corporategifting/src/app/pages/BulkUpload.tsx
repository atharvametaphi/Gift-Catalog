import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const BulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    toast.success('Bulk upload simulated successfully! In production, this would process the CSV/Excel file.');
    setFile(null);
  };

  const downloadTemplate = () => {
    const csvContent = `Category,Subcategory,Item Name,SKU,Short Description,Price,MOQ,Colors,Material,Dimensions,Branding Options,Tags,Status
Office Essentials,Desk Accessories,Premium Pen Set,PEN-001,High-quality writing instruments,25.99,100,Black|Blue,Metal,15cm,Laser engraving,premium|office|writing,active
Tech Gifts,Power Banks,Portable Charger,PB-002,20000mAh power bank,45.99,50,Black|White,Aluminum,6x3x0.8in,Logo printing,tech|charging|portable,active`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Upload</h1>
        <p className="text-gray-600">Upload multiple products using CSV or Excel file</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Before You Upload</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Download the template file to see the required format</li>
                <li>Category and Subcategory must already exist in the system</li>
                <li>Item Name is required</li>
                <li>SKU must be unique if provided</li>
                <li>Use pipe (|) to separate multiple values (e.g., colors, tags)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Download Template</h2>
          <p className="text-gray-600 mb-4">Download the CSV template to see the required format and column headers.</p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Upload Your File</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition">
            <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {file ? file.name : 'Drag and drop your CSV/Excel file here, or click to browse'}
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition"
            >
              Select File
            </label>
          </div>

          {file && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition w-full justify-center"
              >
                <Upload className="w-5 h-5" />
                Process Upload
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Column Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              'Category',
              'Subcategory',
              'Item Name',
              'SKU',
              'Short Description',
              'Price',
              'MOQ',
              'Colors',
              'Material',
              'Dimensions',
              'Branding Options',
              'Tags',
              'Status',
            ].map((col) => (
              <div key={col} className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                {col}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
