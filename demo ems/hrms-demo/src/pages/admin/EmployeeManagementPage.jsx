import { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, X, UserPlus,
  Mail, Phone, Briefcase, Building2, CalendarDays,
  IndianRupee, MapPin, User, AlertTriangle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { employees as initialEmployees, departments, designations } from '../../data/employees';

const ROLES    = ['employee', 'teamlead', 'manager', 'hr', 'admin'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const emptyForm = {
  name: '', email: '', phone: '', designation: '', department: '',
  role: 'employee', status: 'Active', joinDate: '', salary: '',
  manager: '', location: 'Indore', gender: 'Male', dob: '',
};

/* ── Small reusable form pieces ─────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
          <AlertTriangle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = `w-full border rounded-lg px-3 py-2 text-sm
  bg-white dark:bg-slate-700/60
  text-slate-800 dark:text-slate-100
  placeholder-slate-400 dark:placeholder-slate-500
  border-slate-200 dark:border-slate-600
  focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
  transition-colors`;

function Input({ value, onChange, type = 'text', placeholder = '', ...rest }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} {...rest} />;
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} className={inputCls}>
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function DetailTile({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
      {Icon && <Icon size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function FormSection({ title }) {
  return (
    <div className="col-span-full mt-2 mb-1">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{title}</p>
      <div className="h-px bg-indigo-100 dark:bg-indigo-900/40 mt-1" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function EmployeeManagementPage() {
  const { toasts, removeToast, toast } = useToast();
  const [employeeList, setEmployeeList] = useState(initialEmployees);
  const [search, setSearch]             = useState('');
  const [filterDept, setFilterDept]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [viewModal,   setViewModal]   = useState(null);
  const [editModal,   setEditModal]   = useState(null); // null | 'new' | employee object
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [errors, setErrors]           = useState({});

  const nextId = employeeList.length
    ? Math.max(...employeeList.map(e => e.id)) + 1
    : 1;

  /* ── Filtering ── */
  const filtered = employeeList.filter(e => {
    const q = search.toLowerCase();
    return (
      (!q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q)) &&
      (!filterDept   || e.department === filterDept) &&
      (!filterStatus || e.status     === filterStatus)
    );
  });

  /* ── Form helpers ── */
  const bind = key => ({
    value: form[key] ?? '',
    onChange: e => {
      setForm(p => ({ ...p, [key]: e.target.value }));
      setErrors(p => ({ ...p, [key]: '' }));
    },
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name = 'Full name is required';
    if (!form.email.trim())  e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.department)    e.department = 'Select a department';
    if (!form.designation)   e.designation = 'Select a designation';
    if (!form.joinDate)      e.joinDate = 'Join date is required';
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0)
                             e.salary = 'Enter a valid salary';
    return e;
  };

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setEditModal('new');
  };

  const openEdit = emp => {
    setForm({ ...emp, salary: String(emp.salary) });
    setErrors({});
    setEditModal(emp);
  };

  const saveEmployee = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const avatar  = form.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const payload = { ...form, avatar, salary: parseInt(form.salary, 10) };
    if (editModal === 'new') {
      setEmployeeList(prev => [...prev, { ...payload, id: nextId }]);
      toast(`${form.name} added successfully`, 'success');
    } else {
      setEmployeeList(prev => prev.map(e => e.id === editModal.id ? { ...payload, id: e.id } : e));
      toast(`${form.name} updated successfully`, 'success');
    }
    setEditModal(null);
  };

  const confirmDelete = () => {
    setEmployeeList(prev => prev.filter(e => e.id !== deleteModal.id));
    toast(`${deleteModal.name} has been removed`, 'error');
    setDeleteModal(null);
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Employee Management</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {filtered.length} of {employeeList.length} employees
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={openAdd}>Add Employee</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, designation…"
              className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm
                bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
                placeholder-slate-400 dark:placeholder-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm
              bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm
              bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Employee', 'Department', 'Designation', 'Role', 'Status', 'Join Date', 'Salary', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400 dark:text-slate-500">
                    No employees match your search / filters.
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={emp.avatar} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">{emp.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{emp.designation}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={emp.status.toLowerCase()}>{emp.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{emp.joinDate}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                    ₹{Number(emp.salary).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewModal(emp)} title="View"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                          hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(emp)} title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                          hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteModal(emp)} title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                          hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── VIEW MODAL ── */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Employee Details"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setViewModal(null)}>Close</Button>
            <Button variant="primary" icon={Edit2} onClick={() => { openEdit(viewModal); setViewModal(null); }}>Edit</Button>
          </div>
        }
      >
        {viewModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30 flex-shrink-0">
                {viewModal.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{viewModal.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{viewModal.designation}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge status={viewModal.status.toLowerCase()}>{viewModal.status}</Badge>
                  <span className="capitalize text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {viewModal.role}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <DetailTile icon={Mail}  label="Email" value={viewModal.email} />
                <DetailTile icon={Phone} label="Phone" value={viewModal.phone} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Work</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <DetailTile icon={Building2}    label="Department"  value={viewModal.department} />
                <DetailTile icon={Briefcase}    label="Designation" value={viewModal.designation} />
                <DetailTile icon={CalendarDays} label="Join Date"   value={viewModal.joinDate} />
                <DetailTile icon={IndianRupee}  label="Salary"      value={`₹${Number(viewModal.salary).toLocaleString('en-IN')}`} />
                <DetailTile icon={User}         label="Manager"     value={viewModal.manager || '—'} />
                <DetailTile icon={MapPin}       label="Location"    value={viewModal.location} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Personal</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <DetailTile icon={User}         label="Gender"        value={viewModal.gender} />
                <DetailTile icon={CalendarDays} label="Date of Birth" value={viewModal.dob} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal === 'new' ? 'Add New Employee' : `Edit — ${editModal?.name ?? ''}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button variant="primary" icon={editModal === 'new' ? Plus : Edit2} onClick={saveEmployee}>
              {editModal === 'new' ? 'Add Employee' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <FormSection title="Personal Information" />
          <Field label="Full Name" required error={errors.name}>
            <Input {...bind('name')} placeholder="e.g. Ravi Kumar" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input {...bind('email')} type="email" placeholder="name@deepiotics.com" />
          </Field>
          <Field label="Phone">
            <Input {...bind('phone')} placeholder="+91 98765 00000" />
          </Field>
          <Field label="Date of Birth">
            <Input {...bind('dob')} type="date" />
          </Field>
          <Field label="Gender">
            <Select {...bind('gender')} options={['Male', 'Female', 'Other']} />
          </Field>

          <FormSection title="Work Details" />
          <Field label="Department" required error={errors.department}>
            <Select {...bind('department')} options={departments} />
          </Field>
          <Field label="Designation" required error={errors.designation}>
            <Select {...bind('designation')} options={designations} />
          </Field>
          <Field label="Role">
            <Select {...bind('role')} options={ROLES} />
          </Field>
          <Field label="Status">
            <Select {...bind('status')} options={STATUSES} />
          </Field>
          <Field label="Join Date" required error={errors.joinDate}>
            <Input {...bind('joinDate')} type="date" />
          </Field>
          <Field label="Salary (₹ / month)" required error={errors.salary}>
            <Input {...bind('salary')} type="number" placeholder="e.g. 80000" />
          </Field>
          <Field label="Reporting Manager">
            <Input {...bind('manager')} placeholder="Manager's full name" />
          </Field>
          <Field label="Location">
            <Input {...bind('location')} placeholder="City" />
          </Field>
        </div>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Employee"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>Delete</Button>
          </div>
        }
      >
        {deleteModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/60">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {deleteModal.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white">{deleteModal.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {deleteModal.designation} · {deleteModal.department}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/60">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-snug">
                This will permanently remove this employee. This action <strong>cannot be undone</strong>.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
