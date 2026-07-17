import { useState } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { payrollTable } from '../../data/payroll';

export default function AdminPayrollPage({ user }) {
  const { toasts, removeToast, toast } = useToast();
  const [processed, setProcessed] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const totalGross      = payrollTable.reduce((s, e) => s + e.gross, 0);
  const totalDeductions = payrollTable.reduce((s, e) => s + e.total_deductions, 0);
  const totalNet        = payrollTable.reduce((s, e) => s + e.net_pay, 0);

  const columns = [
    { key: 'name', label: 'Employee', render: (v, r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{r.avatar}</div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{v}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.designation}</p>
        </div>
      </div>
    )},
    { key: 'basic',   label: 'Basic',   render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'gross',   label: 'Gross',   render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'pf',      label: 'PF',      render: v => <span className="text-red-500 dark:text-red-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'tds',     label: 'TDS',     render: v => <span className="text-red-500 dark:text-red-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'net_pay', label: 'Net Pay', render: v => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'status',  label: 'Status',  render: () => <Badge status={processed ? 'processed' : 'pending'}>{processed ? 'Processed' : 'Pending'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payroll</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            July 2025 · {payrollTable.length} employees
          </p>
        </div>
        <Button
          variant={processed ? 'secondary' : 'primary'}
          icon={DollarSign}
          disabled={processed}
          onClick={() => setConfirmModal(true)}
        >
          {processed ? '✓ Payroll Processed' : 'Process Payroll'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Gross',      value: `₹${totalGross.toLocaleString('en-IN')}`,      color: 'indigo'  },
          { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString('en-IN')}`, color: 'red'     },
          { label: 'Total Net Pay',    value: `₹${totalNet.toLocaleString('en-IN')}`,         color: 'emerald' },
        ].map(({ label, value, color }) => (
          <div key={label}
            className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800/40 rounded-2xl p-5`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>
            <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Payroll table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Salary Sheet — July 2025</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {processed ? '✓ Disbursed successfully' : 'Pending disbursement'}
          </p>
        </div>
        <Table columns={columns} data={payrollTable} />
      </Card>

      {/* Confirm modal */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Confirm Payroll Processing"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button variant="primary" icon={DollarSign} onClick={() => {
              setProcessed(true);
              setConfirmModal(false);
              toast('Payroll for July 2025 processed & disbursed', 'success');
            }}>Confirm & Disburse</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Processing payroll for <strong>{payrollTable.length} employees</strong> for <strong>July 2025</strong>.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-100 dark:border-slate-700">
            {[
              ['Employees',        payrollTable.length],
              ['Total Gross',      `₹${totalGross.toLocaleString('en-IN')}`],
              ['Total Deductions', `₹${totalDeductions.toLocaleString('en-IN')}`],
              ['Net Payout',       `₹${totalNet.toLocaleString('en-IN')}`],
            ].map(([k, v], i) => (
              <div key={k} className={`flex justify-between ${i === 3 ? 'border-t border-slate-200 dark:border-slate-600 pt-2.5 font-bold' : ''}`}>
                <span className="text-slate-500 dark:text-slate-400">{k}</span>
                <span className={i === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">This action cannot be undone for the current cycle.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
