import React, { useState, useRef } from 'react';
import { useProducts } from '../../../context/ProductContext';
import {
  Upload,
  Download,
  FileText,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  File,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Clock,
} from 'lucide-react';

type ImportType = 'Products' | 'Categories' | 'Inventory' | 'Customers' | 'Orders';
type ExportType = ImportType | 'All Products Report';

interface ImportLog {
  id: string;
  type: ImportType;
  filename: string;
  status: 'Success' | 'Failed' | 'Processing' | 'Partial';
  rowsTotal: number;
  rowsProcessed: number;
  rowsFailed: number;
  errors: string[];
  date: string;
}

const IMPORT_TYPES: { type: ImportType; icon: React.FC<any>; description: string }[] = [
  { type: 'Products', icon: Package, description: 'Import product catalog with images, pricing, stock' },
  { type: 'Categories', icon: BarChart3, description: 'Import category structure and subcategories' },
  { type: 'Inventory', icon: Package, description: 'Update stock levels from a CSV file' },
  { type: 'Customers', icon: Users, description: 'Import customer list from CRM or external source' },
  { type: 'Orders', icon: ShoppingCart, description: 'Import historical orders for records' },
];

const EXPORT_TYPES: { type: ExportType; icon: React.FC<any>; formats: string[] }[] = [
  { type: 'Products', icon: Package, formats: ['CSV', 'Excel', 'JSON'] },
  { type: 'Categories', icon: BarChart3, formats: ['CSV', 'Excel'] },
  { type: 'Inventory', icon: Package, formats: ['CSV', 'Excel'] },
  { type: 'Customers', icon: Users, formats: ['CSV', 'Excel', 'JSON'] },
  { type: 'Orders', icon: ShoppingCart, formats: ['CSV', 'Excel', 'JSON'] },
  { type: 'All Products Report', icon: FileText, formats: ['Excel', 'PDF'] },
];

const MOCK_LOGS: ImportLog[] = [
  { id: 'log-1', type: 'Products', filename: 'products_july_2026.csv', status: 'Success', rowsTotal: 45, rowsProcessed: 45, rowsFailed: 0, errors: [], date: '2026-07-25T10:30:00Z' },
  { id: 'log-2', type: 'Inventory', filename: 'stock_update.csv', status: 'Partial', rowsTotal: 30, rowsProcessed: 27, rowsFailed: 3, errors: ['Row 12: Invalid SKU "XYZ-999"', 'Row 18: Stock value cannot be negative', 'Row 24: Product not found'], date: '2026-07-22T14:15:00Z' },
  { id: 'log-3', type: 'Customers', filename: 'customers_june.csv', status: 'Failed', rowsTotal: 120, rowsProcessed: 0, rowsFailed: 120, errors: ['Invalid file format - expected CSV with headers'], date: '2026-07-18T09:00:00Z' },
];

const CSV_TEMPLATES: Record<ImportType, string[]> = {
  Products: ['name', 'sku', 'category', 'price', 'stock', 'status', 'description', 'material', 'weight'],
  Categories: ['name', 'slug', 'description', 'icon', 'parentCategory', 'displayOrder'],
  Inventory: ['sku', 'productId', 'currentStock', 'adjustment', 'reason'],
  Customers: ['name', 'phone', 'email', 'address', 'city', 'state', 'pincode'],
  Orders: ['orderId', 'customerPhone', 'products', 'totalAmount', 'status', 'date'],
};

export const AdminImportExportPage: React.FC = () => {
  const { products } = useProducts();

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'logs' | 'templates'>('import');
  const [importing, setImporting] = useState<ImportType | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importLogs, setImportLogs] = useState<ImportLog[]>(MOCK_LOGS);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showPreviewError, setShowPreviewError] = useState<ImportLog | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImportType, setPendingImportType] = useState<ImportType | null>(null);

  const triggerImport = (type: ImportType) => {
    setPendingImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImportType) return;

    setImporting(pendingImportType);
    setImportProgress(0);

    // Simulate progressive import processing
    for (let i = 10; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 150));
      setImportProgress(i);
    }

    const mockRowCount = Math.floor(Math.random() * 50) + 10;
    const mockFailed = Math.floor(Math.random() * 3);
    const log: ImportLog = {
      id: `log-${Date.now()}`,
      type: pendingImportType,
      filename: file.name,
      status: mockFailed > 0 ? 'Partial' : 'Success',
      rowsTotal: mockRowCount,
      rowsProcessed: mockRowCount - mockFailed,
      rowsFailed: mockFailed,
      errors: mockFailed > 0 ? [`Row ${mockRowCount - 1}: Sample validation error`] : [],
      date: new Date().toISOString(),
    };
    setImportLogs(prev => [log, ...prev]);
    setImporting(null);
    setImportProgress(0);
    setPendingImportType(null);
  };

  const handleExport = async (type: ExportType, format: string) => {
    const key = `${type}-${format}`;
    setExporting(key);
    await new Promise(r => setTimeout(r, 800));

    if (type === 'Products' && format === 'CSV') {
      const headers = ['name', 'sku', 'category', 'price', 'discountPrice', 'stock', 'status'];
      const rows = products.map(p => [
        `"${p.name}"`, p.sku || '', `"${p.category}"`, p.price, p.discountPrice || '', p.stock, p.status || 'Published',
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    }
    setExporting(null);
  };

  const downloadTemplate = (type: ImportType) => {
    const headers = CSV_TEMPLATES[type];
    const sampleRow = headers.map(h => `sample_${h}`);
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `template_${type.toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusBadge = (status: ImportLog['status']) => {
    const map = {
      Success: 'bg-emerald-100 text-emerald-800',
      Failed: 'bg-red-100 text-red-700',
      Processing: 'bg-blue-100 text-blue-800 animate-pulse',
      Partial: 'bg-amber-100 text-amber-800',
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileSelect} className="hidden" />

      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <RefreshCw size={16} /> PRODUCT CATALOG • IMPORT / EXPORT
          </span>
          <h1 className="font-heading font-black text-2xl text-white mt-1">Import / Export Hub</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Sub-tabs */}
        <div className="flex gap-2 text-xs font-heading flex-wrap">
          {(['import', 'export', 'logs', 'templates'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer capitalize transition-colors ${activeTab === t ? 'bg-[#111111] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t === 'import' && <span className="flex items-center gap-1.5"><ArrowDown size={12} /> Import</span>}
              {t === 'export' && <span className="flex items-center gap-1.5"><ArrowUp size={12} /> Export</span>}
              {t === 'logs' && <span className="flex items-center gap-1.5"><Clock size={12} /> Import Logs</span>}
              {t === 'templates' && <span className="flex items-center gap-1.5"><FileText size={12} /> CSV Templates</span>}
            </button>
          ))}
        </div>

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800">
              <strong>Accepted formats:</strong> CSV (.csv), Excel (.xlsx, .xls), JSON (.json) <br />
              Download a template first to ensure correct column headers.
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {IMPORT_TYPES.map(({ type, icon: Icon, description }) => (
                <div key={type} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 rounded-xl"><Icon size={18} className="text-gray-600" /></div>
                    <div>
                      <h3 className="font-heading font-black text-sm text-[#111111]">Import {type}</h3>
                      <p className="text-[10px] text-gray-400">{description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => downloadTemplate(type)}
                      className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
                      title={`Download ${type} CSV Template`}
                    >
                      <Download size={13} className="text-[#F97316]" /> Download Template
                    </button>
                    <button
                      onClick={() => triggerImport(type)}
                      disabled={importing !== null}
                      className="py-2.5 px-3 bg-[#111111] hover:bg-[#F97316] disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {importing === type ? (
                        <><Loader2 size={13} className="animate-spin" /> Processing... {importProgress}%</>
                      ) : (
                        <><Upload size={13} /> Select File</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORT_TYPES.map(({ type, icon: Icon, formats }) => (
              <div key={type} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-100 rounded-xl"><Icon size={18} className="text-gray-600" /></div>
                  <h3 className="font-heading font-black text-sm text-[#111111]">{type}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formats.map(fmt => {
                    const key = `${type}-${fmt}`;
                    return (
                      <button key={fmt} onClick={() => handleExport(type as ExportType, fmt)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#F97316] hover:text-white text-gray-700 font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                        {exporting === key ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {importLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Clock size={36} className="mx-auto mb-3 text-gray-200" />
                <p className="font-bold text-sm">No Import Logs</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Filename</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Processed</th>
                      <th className="p-3 text-center">Failed</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-400">{new Date(log.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-bold text-[#111111]">{log.type}</td>
                        <td className="p-3 font-mono text-gray-500 max-w-[160px] truncate">{log.filename}</td>
                        <td className="p-3 text-center">{statusBadge(log.status)}</td>
                        <td className="p-3 text-center">
                          <span className="text-emerald-700 font-bold">{log.rowsProcessed}</span>
                          <span className="text-gray-400"> / {log.rowsTotal}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-red-600">{log.rowsFailed}</td>
                        <td className="p-3 text-right">
                          {log.errors.length > 0 && (
                            <button onClick={() => setShowPreviewError(log)} className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer">
                              View {log.errors.length} error(s)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPORT_TYPES.map(({ type }) => (
              <div key={type} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <File size={18} className="text-gray-400" />
                  <h3 className="font-heading font-black text-sm text-[#111111]">{type} Template</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {CSV_TEMPLATES[type].map(col => (
                    <span key={col} className="bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-0.5 rounded-full">{col}</span>
                  ))}
                </div>
                <button onClick={() => downloadTemplate(type)}
                  className="w-full py-2 bg-gray-100 hover:bg-[#111111] hover:text-white text-gray-700 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                  <Download size={13} /> Download CSV Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Preview Modal */}
      {showPreviewError && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-lg flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Import Errors
              </h3>
              <button onClick={() => setShowPreviewError(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {showPreviewError.errors.map((err, i) => (
                <div key={i} className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-mono">{err}</div>
              ))}
            </div>
            <button onClick={() => setShowPreviewError(null)} className="w-full py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImportExportPage;
