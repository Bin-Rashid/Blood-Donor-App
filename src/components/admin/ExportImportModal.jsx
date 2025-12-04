import React, { useState } from 'react';
import { X, Download, Upload, FileText, FileSpreadsheet, File, Check } from 'lucide-react';
import { supabase } from '../../services/supabase';
import * as XLSX from 'xlsx';

const ExportImportModal = ({ mode, onClose, selectedDonors, onImportComplete }) => {
  const [step, setStep] = useState(1);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportFields, setExportFields] = useState([
    'id', 'name', 'phone', 'email', 'blood_type', 'district', 'city', 'age', 
    'last_donation_date', 'created_at', 'eligibility'
  ]);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableFields = [
    { id: 'id', label: 'ID', default: true },
    { id: 'name', label: 'Name', default: true },
    { id: 'phone', label: 'Phone', default: true },
    { id: 'email', label: 'Email', default: true },
    { id: 'blood_type', label: 'Blood Type', default: true },
    { id: 'district', label: 'District', default: true },
    { id: 'city', label: 'City', default: true },
    { id: 'age', label: 'Age', default: true },
    { id: 'last_donation_date', label: 'Last Donation', default: true },
    { id: 'created_at', label: 'Registration Date', default: true },
    { id: 'eligibility', label: 'Eligibility Status', default: true },
    { id: 'address', label: 'Address', default: false },
    { id: 'gender', label: 'Gender', default: false },
    { id: 'occupation', label: 'Occupation', default: false },
    { id: 'emergency_contact', label: 'Emergency Contact', default: false },
    { id: 'medical_conditions', label: 'Medical Conditions', default: false },
  ];

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('donors').select('*');
      
      if (selectedDonors.length > 0) {
        query = query.in('id', selectedDonors);
      }
      
      const { data: donors, error } = await query;
      
      if (error) throw error;

      // Calculate eligibility for each donor
      const processedData = donors.map(donor => {
        const eligibility = calculateEligibility(donor.last_donation_date);
        return {
          ...donor,
          eligibility: eligibility.status === 'eligible' ? 'Eligible' : `Not Eligible (${eligibility.daysLeft} days left)`
        };
      });

      // Filter selected fields
      const filteredData = processedData.map(donor => {
        const filteredDonor = {};
        exportFields.forEach(field => {
          if (donor[field] !== undefined) {
            filteredDonor[field] = donor[field];
          }
        });
        return filteredDonor;
      });

      // Export based on format
      switch (exportFormat) {
        case 'excel':
          exportToExcel(filteredData);
          break;
        case 'csv':
          exportToCSV(filteredData);
          break;
        case 'pdf':
          alert('PDF export will be available soon!');
          break;
      }

      setIsLoading(false);
      setStep(3);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
      setIsLoading(false);
    }
  };

  const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { status: 'eligible', daysLeft: 0 };
    
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const isEligible = lastDonation <= threeMonthsAgo;
    const timeDiff = today.getTime() - lastDonation.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const daysLeft = Math.max(0, 90 - daysDiff);
    
    return { 
      status: isEligible ? 'eligible' : 'not-eligible', 
      daysLeft 
    };
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Donors');
    XLSX.writeFile(wb, `donors_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = (data) => {
    const headers = exportFields.join(',');
    const rows = data.map(row => 
      exportFields.map(field => `"${row[field] || ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donors_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select a CSV or Excel file');
        return;
      }
      setImportFile(file);
      setStep(2);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsLoading(true);
      setImportProgress(0);

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          let rows = [];
          
          if (importFile.name.endsWith('.csv')) {
            rows = parseCSV(data);
          } else {
            rows = parseExcel(data);
          }

          setImportProgress(30);

          // Validate and process rows
          const validRows = [];
          const invalidRows = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const progress = 30 + (i / rows.length) * 60;
            setImportProgress(progress);

            // Basic validation
            if (!row.name || !row.phone) {
              invalidRows.push({ row: i + 1, reason: 'Missing name or phone' });
              continue;
            }

            // Check if donor already exists
            const { data: existing } = await supabase
              .from('donors')
              .select('id')
              .eq('phone', row.phone)
              .single();

            if (existing) {
              // Update existing donor
              await supabase
                .from('donors')
                .update({
                  name: row.name,
                  email: row.email || '',
                  blood_type: row.blood_type || '',
                  district: row.district || '',
                  city: row.city || '',
                  age: row.age || null,
                  last_donation_date: row.last_donation_date || null
                })
                .eq('id', existing.id);
              validRows.push({ ...row, action: 'updated' });
            } else {
              // Insert new donor
              const { data: newDonor } = await supabase
                .from('donors')
                .insert([{
                  name: row.name,
                  phone: row.phone,
                  email: row.email || '',
                  blood_type: row.blood_type || '',
                  district: row.district || '',
                  city: row.city || '',
                  age: row.age || null,
                  last_donation_date: row.last_donation_date || null
                }])
                .select();
              
              if (newDonor) {
                validRows.push({ ...row, action: 'created' });
              }
            }
          }

          setImportProgress(100);
          setImportResult({
            total: rows.length,
            successful: validRows.length,
            failed: invalidRows.length,
            invalidRows: invalidRows
          });

          setIsLoading(false);
          setStep(3);

          if (onImportComplete) {
            setTimeout(onImportComplete, 1000);
          }

        } catch (error) {
          console.error('Import processing error:', error);
          alert('Error processing import file');
          setIsLoading(false);
        }
      };

      reader.readAsBinaryString(importFile);
      
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data');
      setIsLoading(false);
    }
  };

  const parseCSV = (csvData) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      if (!line.trim()) return null;
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return row;
    }).filter(row => row !== null);
  };

  const parseExcel = (excelData) => {
    const workbook = XLSX.read(excelData, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const toggleField = (fieldId) => {
    setExportFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const selectAllFields = () => {
    setExportFields(availableFields.map(field => field.id));
  };

  const deselectAllFields = () => {
    setExportFields([]);
  };

  const selectDefaultFields = () => {
    setExportFields(availableFields.filter(field => field.default).map(field => field.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {mode === 'export' ? (
              <Download className="w-5 h-5 text-green-600" />
            ) : (
              <Upload className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'export' ? 'Export Donors' : 'Import Donors'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {mode === 'export' ? (
            // Export Content
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Export Format</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setExportFormat('excel')}
                        className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                          exportFormat === 'excel' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <FileSpreadsheet className={`w-8 h-8 mb-2 ${
                          exportFormat === 'excel' ? 'text-red-600' : 'text-gray-500'
                        }`} />
                        <span>Excel (.xlsx)</span>
                      </button>
                      
                      <button
                        onClick={() => setExportFormat('csv')}
                        className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                          exportFormat === 'csv' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <FileText className={`w-8 h-8 mb-2 ${
                          exportFormat === 'csv' ? 'text-red-600' : 'text-gray-500'
                        }`} />
                        <span>CSV (.csv)</span>
                      </button>
                      
                      <button
                        onClick={() => setExportFormat('pdf')}
                        className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                          exportFormat === 'pdf' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <File className={`w-8 h-8 mb-2 ${
                          exportFormat === 'pdf' ? 'text-red-600' : 'text-gray-500'
                        }`} />
                        <span>PDF (.pdf)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700">Select Fields to Export</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllFields}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Select All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={deselectAllFields}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Deselect All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={selectDefaultFields}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Default
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableFields.map(field => (
                        <label
                          key={field.id}
                          className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${
                            exportFields.includes(field.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 hover:border-red-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={exportFields.includes(field.id)}
                            onChange={() => toggleField(field.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm">{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Export Scope</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                        <input
                          type="radio"
                          name="scope"
                          defaultChecked
                          className="text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-medium">All Donors</div>
                          <div className="text-sm text-gray-500">Export complete donor database</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                        <input
                          type="radio"
                          name="scope"
                          disabled={selectedDonors.length === 0}
                          className="text-red-600 focus:ring-red-500 disabled:opacity-50"
                        />
                        <div>
                          <div className="font-medium">Selected Donors Only</div>
                          <div className="text-sm text-gray-500">
                            {selectedDonors.length > 0 
                              ? `Export ${selectedDonors.length} selected donor(s)`
                              : 'No donors selected'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Preparing export...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait while we process your data</p>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Successful!</h3>
                  <p className="text-gray-600">Your donor data has been exported successfully.</p>
                  <p className="text-sm text-gray-500 mt-2">The download should start automatically.</p>
                </div>
              )}
            </>
          ) : (
            // Import Content
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Select File to Import
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </p>
                    <input
                      type="file"
                      id="import-file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="import-file"
                      className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Import Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• File must contain columns: name, phone (required)</li>
                      <li>• Optional columns: email, blood_type, district, city, age</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Existing donors with same phone will be updated</li>
                      <li>• New donors will be created</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sample Format</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 border">name</th>
                            <th className="p-2 border">phone</th>
                            <th className="p-2 border">email</th>
                            <th className="p-2 border">blood_type</th>
                            <th className="p-2 border">district</th>
                            <th className="p-2 border">city</th>
                            <th className="p-2 border">age</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border">John Doe</td>
                            <td className="p-2 border">01712345678</td>
                            <td className="p-2 border">john@example.com</td>
                            <td className="p-2 border">A+</td>
                            <td className="p-2 border">Dhaka</td>
                            <td className="p-2 border">Gulshan</td>
                            <td className="p-2 border">30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && importFile && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-700">Ready to Import</h3>
                      <p className="text-sm text-gray-500">{importFile.name}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Import Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                        <input
                          type="radio"
                          name="import-mode"
                          defaultChecked
                          className="text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-medium">Update or Create</div>
                          <div className="text-sm text-gray-500">
                            Update existing donors, create new ones
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                        <input
                          type="radio"
                          name="import-mode"
                          className="text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-medium">Create Only (No Updates)</div>
                          <div className="text-sm text-gray-500">
                            Skip existing donors, only create new ones
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {isLoading && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Importing...</span>
                        <span>{importProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && importResult && (
                <div className="space-y-6">
                  <div className={`text-center py-6 rounded-xl ${
                    importResult.successful > 0 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {importResult.successful > 0 ? (
                      <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    ) : (
                      <X className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Import {importResult.successful > 0 ? 'Completed' : 'Failed'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Processed {importResult.total} records
                      </p>
                      <p className="text-green-600 font-medium">
                        {importResult.successful} successful
                      </p>
                      {importResult.failed > 0 && (
                        <p className="text-red-600">
                          {importResult.failed} failed
                        </p>
                      )}
                    </div>
                  </div>

                  {importResult.invalidRows.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Failed Rows</h4>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                        {importResult.invalidRows.map((row, index) => (
                          <div key={index} className="text-sm text-red-700 mb-1">
                            Row {row.row}: {row.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-500">
                    Donor database has been updated successfully.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          {step === 1 && mode === 'export' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (exportFields.length === 0) {
                    alert('Please select at least one field to export');
                    return;
                  }
                  setStep(2);
                  setTimeout(handleExport, 500);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Export Data'}
              </button>
            </>
          )}

          {step === 2 && mode === 'import' && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Importing...' : 'Start Import'}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;