import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { payslips } from '../../data/payroll';

export default function PayslipsPage({ user }) {
  const { toasts, removeToast, toast } = useToast();
  const [selected, setSelected] = useState(null);

  const handleDownload = () => {
    toast(`Downloading payslip for ${selected?.month}...`, 'info');
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payslips</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{payslips.length} monthly salary statements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {payslips.map(p => (
          <Card key={p.id} hover padding={false}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge status="paid" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{p.month}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Paid on {p.paidOn}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Net Pay</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">₹{p.net_pay.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="xs" icon={Eye} onClick={() => setSelected(p)}>View</Button>
                  <Button variant="ghost" size="xs" icon={Download} onClick={() => { setSelected(p); setTimeout(() => toast(`Downloading ${p.month} payslip...`, 'info'), 100); }}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Payslip — ${selected.month}`}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
              <Button variant="primary" icon={Download} onClick={handleDownload}>Download PDF</Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-200 text-xs font-medium">EMS — Employee Management System</p>
                  <p className="font-bold text-lg mt-1">{user?.name}</p>
                  <p className="text-indigo-200 text-sm">{user?.designation} · {user?.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs font-medium">Net Pay</p>
                  <p className="font-extrabold text-2xl mt-1">₹{selected.net_pay.toLocaleString('en-IN')}</p>
                  <p className="text-indigo-200 text-xs mt-1">Paid on {selected.paidOn}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Earnings</p>
                <div className="space-y-2">
                  {[
                    ['Basic Salary',        selected.basic],
                    ['HRA',                 selected.hra],
                    ['Dearness Allowance',  selected.da],
                    ['Medical Allowance',   selected.medical],
                    ['Conveyance',          selected.conveyance],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{l}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{v.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Gross Pay</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{selected.gross.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Deductions</p>
                <div className="space-y-2">
                  {[
                    ['Provident Fund (PF)', selected.pf],
                    ['TDS',                 selected.tds],
                    ['Professional Tax',    selected.professional_tax],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{l}</span>
                      <span className="font-semibold text-red-500 dark:text-red-400">-₹{v.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Total Deductions</span>
                    <span className="text-red-500 dark:text-red-400">₹{selected.total_deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Net Pay (Take Home)</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{selected.net_pay.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
