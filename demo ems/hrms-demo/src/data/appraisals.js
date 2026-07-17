export const appraisalCycle = {
  name: 'Annual Appraisal 2025',
  period: 'April 2024 – March 2025',
  status: 'In Progress',
  phase: 'Manager Review Phase',
  selfRatingDue: '30 Jun 2025',
  managerReviewDue: '31 Jul 2025',
  finalDeclaration: '31 Aug 2025',
};

export const myAppraisalHistory = [
  {
    year: '2024',
    rating: 4.2,
    grade: 'Exceeds Expectations',
    hike: '18%',
    feedback: 'Exceptional performance in backend optimization. Delivered key modules ahead of schedule.',
    kpis: { delivery: 4.5, quality: 4.0, teamwork: 4.2, initiative: 3.8 },
  },
  {
    year: '2023',
    rating: 3.8,
    grade: 'Meets Expectations',
    hike: '12%',
    feedback: 'Good consistent performance. Should take more ownership in critical decisions.',
    kpis: { delivery: 3.8, quality: 3.9, teamwork: 4.0, initiative: 3.5 },
  },
  {
    year: '2022',
    rating: 3.5,
    grade: 'Meets Expectations',
    hike: '10%',
    feedback: 'Solid first full year. Shows good potential. Continue developing leadership skills.',
    kpis: { delivery: 3.5, quality: 3.6, teamwork: 3.8, initiative: 3.2 },
  },
];

// Current cycle self-assessment (submitted by employee)
export const currentSelfAssessment = {
  submitted: true,
  submittedOn: '2025-06-28',
  kpis: { delivery: 4.0, quality: 4.0, teamwork: 4.2, initiative: 3.8 },
  overall: 4.0,
  comments: 'Delivered all sprint commitments on time. Led the API refactoring initiative. Looking forward to more architectural responsibilities.',
};

export const teamAppraisals = [
  {
    id: 1,  name: 'Arjun Sharma',  avatar: 'AS', designation: 'Sr. Software Engineer',
    selfRating: 4.0, managerRating: 4.2,
    status: 'Manager Review',
    selfSubmittedOn: '2025-06-25',
    kpis: { delivery: 4.5, quality: 4.0, teamwork: 4.2, initiative: 3.8 },
    selfComments: 'Delivered all modules on time. Took ownership of API layer redesign.',
    managerFeedback: 'Strong delivery, needs to improve documentation.',
  },
  {
    id: 6,  name: 'Kavya Reddy',   avatar: 'KR', designation: 'Frontend Developer',
    selfRating: 3.8, managerRating: null,
    status: 'Pending Manager Review',
    selfSubmittedOn: '2025-06-27',
    kpis: { delivery: 3.8, quality: 4.0, teamwork: 4.0, initiative: 3.5 },
    selfComments: 'Revamped the design system. Improved page load times by 40%.',
    managerFeedback: null,
  },
  {
    id: 7,  name: 'Aditya Kumar',  avatar: 'AK', designation: 'DevOps Engineer',
    selfRating: 4.2, managerRating: null,
    status: 'Pending Manager Review',
    selfSubmittedOn: '2025-06-26',
    kpis: { delivery: 4.2, quality: 4.0, teamwork: 3.8, initiative: 4.5 },
    selfComments: 'Set up full CI/CD pipeline. Reduced deployment time from 40min to 8min.',
    managerFeedback: null,
  },
  {
    id: 8,  name: 'Nisha Gupta',   avatar: 'NG', designation: 'UX Designer',
    selfRating: null, managerRating: null,
    status: 'Self Review Pending',
    selfSubmittedOn: null,
    kpis: null,
    selfComments: null,
    managerFeedback: null,
  },
  {
    id: 9,  name: 'Rahul Joshi',   avatar: 'RJ', designation: 'QA Engineer',
    selfRating: 3.5, managerRating: 3.6,
    status: 'Completed',
    selfSubmittedOn: '2025-06-24',
    kpis: { delivery: 3.8, quality: 4.0, teamwork: 3.5, initiative: 3.0 },
    selfComments: 'Maintained 98% test coverage. Identified critical regression bugs.',
    managerFeedback: 'Reliable team member. Should take more initiative in test automation.',
  },
  {
    id: 13, name: 'Deepak Singh',  avatar: 'DS', designation: 'Data Scientist',
    selfRating: 4.5, managerRating: null,
    status: 'Pending Manager Review',
    selfSubmittedOn: '2025-06-29',
    kpis: { delivery: 4.5, quality: 4.2, teamwork: 4.0, initiative: 4.8 },
    selfComments: 'Built 3 ML models that reduced churn by 22%. Published internal research paper.',
    managerFeedback: null,
  },
];

export const performanceChartData = [
  { name: 'Arjun S.',  selfRating: 4.0, managerRating: 4.2 },
  { name: 'Kavya R.',  selfRating: 3.8, managerRating: 0   },
  { name: 'Aditya K.', selfRating: 4.2, managerRating: 0   },
  { name: 'Nisha G.',  selfRating: 0,   managerRating: 0   },
  { name: 'Rahul J.',  selfRating: 3.5, managerRating: 3.6 },
  { name: 'Deepak S.', selfRating: 4.5, managerRating: 0   },
];

export const kpiLabels = {
  delivery:   'Delivery & Execution',
  quality:    'Work Quality',
  teamwork:   'Teamwork & Collaboration',
  initiative: 'Initiative & Innovation',
};

export const gradeFromRating = (r) => {
  if (!r) return '—';
  if (r >= 4.5) return 'Outstanding';
  if (r >= 4.0) return 'Exceeds Expectations';
  if (r >= 3.5) return 'Meets Expectations';
  if (r >= 3.0) return 'Needs Improvement';
  return 'Unsatisfactory';
};
