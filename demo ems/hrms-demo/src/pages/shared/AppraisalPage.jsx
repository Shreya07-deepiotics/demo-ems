import { useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { Award, Star, PenLine, Eye, Edit2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  appraisalCycle, myAppraisalHistory, teamAppraisals as initialTeamAppraisals,
  currentSelfAssessment, kpiLabels, gradeFromRating,
} from '../../data/appraisals';

/* ── KPI bar ─────────────────────────────────────────────────── */
function KpiBar({ label, value }) {
  const pct = ((value ?? 0) / 5) * 100;
  const color = value >= 4.5 ? 'bg-emerald-500' : value >= 3.5 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-6 text-right">{value ?? '—'}</span>
    </div>
  );
}

/* ── Status badge helper ─────────────────────────────────────── */
function AppraisalBadge({ status }) {
  const map = {
    'Completed':              'completed',
    'Manager Review':         'manager review',
    'Pending Manager Review': 'pending manager review',
    'Self Review Pending':    'self review pending',
  };
  return <Badge status={map[status] ?? 'pending'}>{status}</Badge>;
}

/* ── Cycle info bar ──────────────────────────────────────────── */
function CycleCard() {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{appraisalCycle.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appraisalCycle.period}</p>
        </div>
        <Badge status="in progress">{appraisalCycle.status}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Current Phase',        value: appraisalCycle.phase,            highlight: true  },
          { label: 'Self Assessment Due',   value: appraisalCycle.selfRatingDue,   highlight: false },
          { label: 'Final Declaration',     value: appraisalCycle.finalDeclaration,highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-700/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{label}</p>
            <p className={`text-sm font-bold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function AppraisalPage({ user, role }) {
  const { toasts, removeToast, toast } = useToast();

  /* ── Employee self-assessment state ── */
  const [submitted, setSubmitted]       = useState(currentSelfAssessment.submitted);
  const [selfModal, setSelfModal]       = useState(false);
  const [historyModal, setHistoryModal] = useState(null); // history item
  const [selfForm, setSelfForm]         = useState({
    delivery: '', quality: '', teamwork: '', initiative: '', overall: '', comments: '',
  });

  /* ── TeamLead / Manager review state ── */
  const [teamData, setTeamData]         = useState(initialTeamAppraisals);
  const [reviewModal, setReviewModal]   = useState(null); // team member
  const [viewModal, setViewModal]       = useState(null); // read-only detail
  const [reviewForm, setReviewForm]     = useState({ rating: '', feedback: '' });

  /* ── Submit self-assessment ── */
  const submitSelf = () => {
    if (!selfForm.overall || isNaN(selfForm.overall) || selfForm.overall < 1 || selfForm.overall > 5) {
      toast('Please enter a valid overall rating (1–5)', 'error'); return;
    }
    setSubmitted(true);
    setSelfModal(false);
    toast('Self-assessment submitted successfully!', 'success');
  };

  /* ── Submit manager rating ── */
  const submitReview = () => {
    const r = parseFloat(reviewForm.rating);
    if (!r || r < 1 || r > 5) { toast('Enter a valid rating (1–5)', 'error'); return; }
    setTeamData(prev => prev.map(m =>
      m.id === reviewModal.id
        ? { ...m, managerRating: r, managerFeedback: reviewForm.feedback, status: 'Completed' }
        : m
    ));
    toast(`Rating saved for ${reviewModal.name}`, 'success');
    setReviewModal(null);
  };

  const openReview = (m) => {
    setReviewForm({ rating: m.managerRating ?? '', feedback: m.managerFeedback ?? '' });
    setReviewModal(m);
  };

  const inputCls = `w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm
    bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
    placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500`;

  const isReviewer = role === 'teamlead' || role === 'manager';
  const isEmployee = role === 'employee';
  const isAdmin    = role === 'admin' || role === 'hr';

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Appraisals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {appraisalCycle.name} · {appraisalCycle.phase}
          </p>
        </div>
        {isEmployee && !submitted && (
          <Button variant="primary" icon={PenLine} onClick={() => setSelfModal(true)}>
            Submit Self-Assessment
          </Button>
        )}
        {isEmployee && submitted && (
          <div className="flex items-center gap-2">
            <Badge status="completed">Self-Assessment Submitted</Badge>
            <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setSelfModal(true)}>Edit</Button>
          </div>
        )}
      </div>

      {/* Cycle info */}
      <CycleCard />

      {/* ── EMPLOYEE VIEW ── */}
      {isEmployee && (
        <>
          {/* Current cycle status */}
          <Card>
            <CardHeader title="Current Cycle Status" subtitle="Annual Appraisal 2025" icon={Star} iconColor="text-indigo-600 dark:text-indigo-400" iconBg="bg-indigo-50 dark:bg-indigo-900/20" />
            {submitted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Self-assessment submitted on {currentSelfAssessment.submittedOn}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Awaiting manager review</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(kpiLabels).map(([k, label]) => (
                    <KpiBar key={k} label={label} value={currentSelfAssessment.kpis[k]} />
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Overall Rating</p>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{currentSelfAssessment.overall}<span className="text-sm text-slate-400 font-normal">/5</span></p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{gradeFromRating(currentSelfAssessment.overall)}</p>
                </div>
                {currentSelfAssessment.comments && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Comments</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{currentSelfAssessment.comments}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Self-assessment pending</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Due: {appraisalCycle.selfRatingDue}. Click "Submit Self-Assessment" to begin.</p>
                </div>
              </div>
            )}
          </Card>

          {/* History */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Award size={16} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appraisal History</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {myAppraisalHistory.map(h => (
                <div key={h.year} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{h.year}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{h.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{h.rating}<span className="text-xs text-slate-400 font-normal">/5</span></p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{h.hike} hike</p>
                    </div>
                    <Button variant="ghost" size="xs" icon={Eye} onClick={() => setHistoryModal(h)}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ── TEAMLEAD / MANAGER VIEW ── */}
      {isReviewer && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',     count: teamData.length,                                          color: 'indigo'  },
              { label: 'Completed', count: teamData.filter(m => m.status === 'Completed').length,    color: 'emerald' },
              { label: 'Pending',   count: teamData.filter(m => m.managerRating === null && m.selfRating !== null).length, color: 'amber' },
              { label: 'Not Started', count: teamData.filter(m => m.selfRating === null).length,    color: 'red'     },
            ].map(({ label, count, color }) => (
              <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800/40 rounded-2xl p-4`}>
                <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{count}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Team appraisal table */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Appraisal Review</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Annual Appraisal 2025 · Manager Review Phase</p>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {teamData.map(m => (
                <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar initials={m.avatar} size="md" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.designation}</p>
                      {m.selfSubmittedOn && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Submitted: {m.selfSubmittedOn}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Self</p>
                      <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{m.selfRating ?? '—'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Manager</p>
                      <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{m.managerRating ?? '—'}</p>
                    </div>
                    <AppraisalBadge status={m.status} />
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="xs" icon={Eye} onClick={() => setViewModal(m)}>View</Button>
                      {m.selfRating !== null && (
                        <Button variant="primary" size="xs" icon={Edit2} onClick={() => openReview(m)}>
                          {m.managerRating ? 'Edit Rating' : 'Rate'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ── ADMIN / HR VIEW ── */}
      {isAdmin && (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organisation Appraisal Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">All employees · Annual Appraisal 2025</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {teamData.map(m => (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar initials={m.avatar} size="md" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Self</p>
                    <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{m.selfRating ?? '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Manager</p>
                    <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{m.managerRating ?? '—'}</p>
                  </div>
                  <AppraisalBadge status={m.status} />
                  <Button variant="ghost" size="xs" icon={Eye} onClick={() => setViewModal(m)}>View</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══ SELF-ASSESSMENT MODAL ══ */}
      <Modal isOpen={selfModal} onClose={() => setSelfModal(false)}
        title="Self-Assessment — Annual Appraisal 2025" size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelfModal(false)}>Cancel</Button>
            <Button variant="primary" icon={PenLine} onClick={submitSelf}>Submit Assessment</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl text-sm text-indigo-700 dark:text-indigo-400">
            Rate yourself honestly on each KPI from <strong>1 (poor)</strong> to <strong>5 (excellent)</strong>.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(kpiLabels).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{label} (1–5)</label>
                <input type="number" min="1" max="5" step="0.1"
                  value={selfForm[key]}
                  onChange={e => setSelfForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="e.g. 4.0" className={inputCls} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Overall Self-Rating (1–5) <span className="text-red-500">*</span></label>
            <input type="number" min="1" max="5" step="0.1"
              value={selfForm.overall}
              onChange={e => setSelfForm(p => ({ ...p, overall: e.target.value }))}
              placeholder="e.g. 3.8" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Key Achievements & Comments</label>
            <textarea rows={4} value={selfForm.comments}
              onChange={e => setSelfForm(p => ({ ...p, comments: e.target.value }))}
              placeholder="Describe achievements, challenges, and goals for next cycle..."
              className={`${inputCls} resize-none`} />
          </div>
        </div>
      </Modal>

      {/* ══ MANAGER REVIEW MODAL ══ */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)}
        title={`Review — ${reviewModal?.name ?? ''}`} size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setReviewModal(null)}>Cancel</Button>
            <Button variant="primary" icon={CheckCircle} onClick={submitReview}>Save Rating</Button>
          </div>
        }
      >
        {reviewModal && (
          <div className="space-y-4">
            {/* Employee info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <Avatar initials={reviewModal.avatar} size="lg" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{reviewModal.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{reviewModal.designation}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                  Self Rating: {reviewModal.selfRating ?? '—'}/5 · {gradeFromRating(reviewModal.selfRating)}
                </p>
              </div>
            </div>
            {/* KPI scores from self */}
            {reviewModal.kpis && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Employee's KPI Self-Scores</p>
                <div className="space-y-2">
                  {Object.entries(kpiLabels).map(([k, label]) => (
                    <KpiBar key={k} label={label} value={reviewModal.kpis[k]} />
                  ))}
                </div>
              </div>
            )}
            {/* Employee's self comments */}
            {reviewModal.selfComments && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Employee's Comments</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{reviewModal.selfComments}"</p>
              </div>
            )}
            {/* Manager rating input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Your Rating (1–5) <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max="5" step="0.1"
                value={reviewForm.rating}
                onChange={e => setReviewForm(p => ({ ...p, rating: e.target.value }))}
                placeholder="e.g. 4.2" className={inputCls} />
              {reviewForm.rating && !isNaN(reviewForm.rating) && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                  Grade: {gradeFromRating(parseFloat(reviewForm.rating))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Manager Feedback</label>
              <textarea rows={3} value={reviewForm.feedback}
                onChange={e => setReviewForm(p => ({ ...p, feedback: e.target.value }))}
                placeholder="Provide constructive feedback for the employee..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}
      </Modal>

      {/* ══ VIEW DETAIL MODAL (read-only) ══ */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)}
        title={`Appraisal Detail — ${viewModal?.name ?? ''}`} size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setViewModal(null)}>Close</Button>
            {isReviewer && viewModal?.selfRating !== null && (
              <Button variant="primary" icon={Edit2} onClick={() => { openReview(viewModal); setViewModal(null); }}>
                {viewModal?.managerRating ? 'Edit Rating' : 'Add Rating'}
              </Button>
            )}
          </div>
        }
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
              <Avatar initials={viewModal.avatar} size="lg" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{viewModal.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{viewModal.designation}</p>
                <div className="mt-1.5"><AppraisalBadge status={viewModal.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center border border-purple-100 dark:border-purple-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Self Rating</p>
                <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{viewModal.selfRating ?? '—'}</p>
                <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-0.5">{gradeFromRating(viewModal.selfRating)}</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Manager Rating</p>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{viewModal.managerRating ?? '—'}</p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">{gradeFromRating(viewModal.managerRating)}</p>
              </div>
            </div>
            {viewModal.kpis && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">KPI Breakdown</p>
                <div className="space-y-2">
                  {Object.entries(kpiLabels).map(([k, label]) => (
                    <KpiBar key={k} label={label} value={viewModal.kpis[k]} />
                  ))}
                </div>
              </div>
            )}
            {viewModal.selfComments && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Self Comments</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{viewModal.selfComments}"</p>
              </div>
            )}
            {viewModal.managerFeedback && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Manager Feedback</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{viewModal.managerFeedback}"</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ══ HISTORY DETAIL MODAL ══ */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)}
        title={`Appraisal ${historyModal?.year ?? ''} — Details`} size="sm"
        footer={<Button variant="secondary" onClick={() => setHistoryModal(null)}>Close</Button>}
      >
        {historyModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Rating</p>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{historyModal.rating}<span className="text-xs font-normal text-slate-400">/5</span></p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Hike</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+{historyModal.hike}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Grade</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{historyModal.grade}</p>
            </div>
            {historyModal.kpis && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">KPI Scores</p>
                <div className="space-y-2">
                  {Object.entries(kpiLabels).map(([k, label]) => (
                    <KpiBar key={k} label={label} value={historyModal.kpis[k]} />
                  ))}
                </div>
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Manager Feedback</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{historyModal.feedback}"</p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
