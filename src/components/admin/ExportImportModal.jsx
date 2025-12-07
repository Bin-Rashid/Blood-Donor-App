// src/components/admin/ExportImportModal.jsx
import React, { useState } from 'react';
import { X, Download, Upload, FileText, FileSpreadsheet, Mail, Printer } from 'lucide-react';

const ExportImportModal = ({ mode, onClose, selectedDonors = [], onImportComplete }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState({
    name: true,
    phone: true,
    email: true,
    bloodType: true,
    district: true,
    lastDonation: true,
    createdAt: true,
  });
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleExport = () => {
    // In a real app, you would make an API call to export data
    alert(`Exporting ${selectedDonors.length || 'all'} donors as ${exportFormat.toUpperCase()}`);
    onClose();
  };

  const handleImport = () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImporting(true);
    // Simulate import process
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setImporting(false);
            alert('Import completed successfully!');
            onImportComplete?.();
            onClose();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['text/csv', 'application/json'].includes(file.type)) {
        alert('Please select a CSV or JSON file');
        return;
      }
      setImportFile(file);
    }
  };

  if (mode === 'export') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Download className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Export Donors</h3>
                <p className="text-sm text-gray-600">
                  Export {selectedDonors.length > 0 ? `${selectedDonors.length} selected donors` : 'all donors'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'csv', label: 'CSV', icon: FileSpreadsheet },
                  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
                  { id: 'json', label: 'JSON', icon: FileText },
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                      exportFormat === format.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <format.icon className={`w-5 h-5 ${
                      exportFormat === format.id ? 'text-red-600' : 'text-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{format.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Fields to Export
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(exportFields).map(([field, checked]) => (
                  <label key={field} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setExportFields(prev => ({
                        ...prev,
                        [field]: e.target.checked
                      }))}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-red-600" defaultChecked />
                  <span className="text-sm">Include headers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-red-600" />
                  <span className="text-sm">Compress as ZIP</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-red-600" />
                  <span className="text-sm">Email export to myself</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Import Mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Import Donors</h3>
              <p className="text-sm text-gray-600">Upload donor data from file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {importFile ? importFile.name : 'Drag & drop or click to select'}
              </p>
              <input
                type="file"
                id="import-file"
                className="hidden"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="import-file"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: CSV, JSON, Excel
              </p>
            </div>
          </div>

          {/* Import Progress */}
          {importing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importing... {importProgress}%
              </label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Processing donor records...
              </p>
            </div>
          )}

          {/* Import Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Import Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="import-mode" defaultChecked className="text-red-600" />
                <span className="text-sm">Add new donors only</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="import-mode" className="text-red-600" />
                <span className="text-sm">Update existing donors</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="import-mode" className="text-red-600" />
                <span className="text-sm">Replace all donors</span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CSV files should include headers</li>
              <li>• Required fields: name, phone, blood_type</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Download template for reference</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;