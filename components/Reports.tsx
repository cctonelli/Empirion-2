
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon
} from 'lucide-react';

const MOCK_REPORTS = [
  { id: 1, type: 'DRE', date: 'Dec 31, 2025', round: 3 },
  { id: 2, type: 'Balance Sheet', date: 'Dec 31, 2025', round: 3 },
  { id: 3, type: 'Cash Flow', date: 'Dec 31, 2025', round: 3 },
];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('DRE');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500 mt-1">Audit your performance through standardized statements.</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
          <Download size={18} /> Export Full PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar for report selection */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Round 3 Statements</h3>
          {['DRE', 'Balance Sheet', 'Cash Flow', 'Market Share Analysis'].map(item => (
            <button
              key={item}
              onClick={() => setSelectedReport(item)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedReport === item 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span className="font-semibold">{item}</span>
              </div>
              <ChevronRight size={16} className={selectedReport === item ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[600px]">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedReport}</h2>
              <p className="text-slate-400 text-sm">Empirion Dynamics Corp. | Round 3 Fiscal Year 2025</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">FINALIZED</span>
              <p className="text-slate-400 text-xs mt-1">Generated: 12/31/2025</p>
            </div>
          </div>

          {selectedReport === 'DRE' && (
            <div className="space-y-6">
              <StatementRow label="Gross Revenue" value="R$ 1,250,000.00" isMain />
              <StatementRow label="(-) Sales Taxes (18%)" value="(R$ 225,000.00)" />
              <StatementRow label="Net Revenue" value="R$ 1,025,000.00" isHighlight />
              <StatementRow label="(-) Cost of Goods Sold (COGS)" value="(R$ 450,000.00)" />
              <StatementRow label="Gross Profit" value="R$ 575,000.00" isHighlight />
              <div className="py-4"></div>
              <StatementRow label="Operating Expenses (OPEX)" value="(R$ 320,000.00)" isMain />
              <StatementSubRow label="Marketing" value="R$ 120,000" />
              <StatementSubRow label="R&D" value="R$ 80,000" />
              <StatementSubRow label="General & Admin" value="R$ 120,000" />
              <StatementRow label="EBITDA" value="R$ 255,000.00" isHighlight color="text-blue-600" />
              <StatementRow label="Net Profit" value="R$ 185,000.00" isHighlight color="text-emerald-600" />
            </div>
          )}

          {selectedReport !== 'DRE' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <PieChartIcon size={64} className="mb-4 opacity-20" />
               <p className="text-lg font-medium">Detailed data for {selectedReport} is being compiled.</p>
               <p className="text-sm">Please check back in a few minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatementRow = ({ label, value, isMain = false, isHighlight = false, color = 'text-slate-900' }: any) => (
  <div className={`flex items-center justify-between py-2 ${isHighlight ? 'bg-slate-50 px-4 -mx-4 rounded-lg my-1' : ''}`}>
    <span className={`${isMain ? 'font-bold' : 'font-medium'} ${isHighlight ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
    <span className={`font-mono font-bold ${color}`}>{value}</span>
  </div>
);

const StatementSubRow = ({ label, value }: any) => (
  <div className="flex items-center justify-between py-1 pl-6">
    <span className="text-slate-400 text-sm italic">{label}</span>
    <span className="text-slate-500 text-sm font-mono">{value}</span>
  </div>
);

export default Reports;
