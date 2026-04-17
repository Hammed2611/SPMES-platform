// ─── Users ─────────────────────────────────────────────────────────────────
export const USERS = [
  { id: 'L001', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@university.edu', password: 'lecturer123', role: 'lecturer', avatar: 'SJ', department: 'Computer Science', joinDate: '2019-08-01' },
  { id: 'L002', name: 'Prof. Daniel Osei',  email: 'daniel.osei@university.edu',  password: 'lecturer123', role: 'lecturer', avatar: 'DO', department: 'Software Engineering', joinDate: '2017-01-15' },
  { id: 'A001', name: 'Admin User',          email: 'admin@university.edu',         password: 'admin123',    role: 'admin',    avatar: 'AU', department: 'Admin Office', joinDate: '2015-06-01' },
  { id: 'S001', name: 'James Wilson',        email: 'james.wilson@student.edu',     password: 'student123',  role: 'student',  avatar: 'JW', department: 'Computer Science', joinDate: '2023-09-01' },
  { id: 'S002', name: 'Amara Okafor',        email: 'amara.okafor@student.edu',     password: 'student123',  role: 'student',  avatar: 'AO', department: 'Software Engineering', joinDate: '2023-09-01' },
  { id: 'S003', name: 'Liam Chen',           email: 'liam.chen@student.edu',        password: 'student123',  role: 'student',  avatar: 'LC', department: 'Computer Science', joinDate: '2023-09-01' },
  { id: 'S004', name: 'Elena Rodriguez',     email: 'elena.rodriguez@student.edu',  password: 'student123',  role: 'student',  avatar: 'ER', department: 'Cybersecurity', joinDate: '2022-09-01' },
  { id: 'S005', name: 'Marcus Thompson',     email: 'marcus.thompson@student.edu',  password: 'student123',  role: 'student',  avatar: 'MT', department: 'Data Science', joinDate: '2023-09-01' },
  { id: 'S006', name: 'Fatima Al-Hassan',   email: 'fatima.alhassan@student.edu',   password: 'student123',  role: 'student',  avatar: 'FA', department: 'AI & ML', joinDate: '2022-09-01' },
];

// ─── Projects ───────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: 'P001', studentId: 'S001', lecturerId: 'L001',
    title: 'AI-Driven Traffic Optimization System',
    description: 'A machine learning pipeline that dynamically adjusts city traffic lights using real-time sensor data, reducing congestion by up to 34%.',
    category: 'Artificial Intelligence', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-10', deadline: '2025-03-15',
    status: 'graded', tags: ['ML', 'IoT', 'Python', 'TensorFlow'],
    rubric: {
      innovation:    { score: 88, weight: 25, comment: 'Highly creative approach with practical real-world impact. Algorithm design is novel.' },
      technical:     { score: 92, weight: 40, comment: 'Excellent implementation quality. Clean, modular codebase with proper documentation.' },
      presentation:  { score: 80, weight: 20, comment: 'Clear slides and confident delivery. Could improve Q&A handling.' },
      documentation: { score: 85, weight: 15, comment: 'Well-structured report. Some sections need more depth on methodology.' },
    },
    finalScore: 88.05,
    peerReviews: [{ reviewerId: 'S002', score: 86, comment: 'Great system. Performance metrics were impressive.' }],
  },
  {
    id: 'P002', studentId: 'S002', lecturerId: 'L001',
    title: 'Decentralized Identity Framework',
    description: 'A blockchain-based digital identity system that allows users to control their personal data without relying on central authorities.',
    category: 'Cybersecurity', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-12', deadline: '2025-03-15',
    status: 'pending', tags: ['Blockchain', 'Web3', 'Solidity', 'React'],
    rubric: {
      innovation:    { score: 0, weight: 25, comment: '' },
      technical:     { score: 0, weight: 40, comment: '' },
      presentation:  { score: 0, weight: 20, comment: '' },
      documentation: { score: 0, weight: 15, comment: '' },
    },
    finalScore: null,
    peerReviews: [],
  },
  {
    id: 'P003', studentId: 'S003', lecturerId: 'L001',
    title: 'Smart Agriculture Monitoring System',
    description: 'IoT-powered crop health monitoring platform using soil sensors, weather APIs, and a mobile dashboard for real-time farmer alerts.',
    category: 'Internet of Things', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-11', deadline: '2025-03-15',
    status: 'under_review', tags: ['IoT', 'Arduino', 'React Native', 'Firebase'],
    rubric: {
      innovation:    { score: 0, weight: 25, comment: '' },
      technical:     { score: 0, weight: 40, comment: '' },
      presentation:  { score: 0, weight: 20, comment: '' },
      documentation: { score: 0, weight: 15, comment: '' },
    },
    finalScore: null,
    peerReviews: [{ reviewerId: 'S001', score: 82, comment: 'Solid concept. Hardware integration was impressive.' }],
  },
  {
    id: 'P004', studentId: 'S004', lecturerId: 'L001',
    title: 'Secure Telemedicine Platform',
    description: 'End-to-end encrypted video consultation platform with zero-knowledge patient records and HIPAA-compliant data storage.',
    category: 'Healthcare Tech', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-09', deadline: '2025-03-15',
    status: 'graded', tags: ['WebRTC', 'Encryption', 'Node.js', 'PostgreSQL'],
    rubric: {
      innovation:    { score: 75, weight: 25, comment: 'Good problem choice. Encryption approach is solid.' },
      technical:     { score: 80, weight: 40, comment: 'Well-built. Some performance bottlenecks under load testing.' },
      presentation:  { score: 79, weight: 20, comment: 'Good presentation. Could have demonstrated live video better.' },
      documentation: { score: 72, weight: 15, comment: 'Adequate documentation but lacks API reference section.' },
    },
    finalScore: 77.8,
    peerReviews: [],
  },
  {
    id: 'P005', studentId: 'S005', lecturerId: 'L002',
    title: 'Real-Time Stock Sentiment Analyzer',
    description: 'NLP-powered sentiment analysis tool that scrapes financial news and social media to predict short-term stock movements.',
    category: 'Data Science', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-13', deadline: '2025-03-15',
    status: 'pending', tags: ['NLP', 'Python', 'BERT', 'FastAPI'],
    rubric: {
      innovation:    { score: 0, weight: 25, comment: '' },
      technical:     { score: 0, weight: 40, comment: '' },
      presentation:  { score: 0, weight: 20, comment: '' },
      documentation: { score: 0, weight: 15, comment: '' },
    },
    finalScore: null,
    peerReviews: [],
  },
  {
    id: 'P006', studentId: 'S006', lecturerId: 'L002',
    title: 'Adaptive Learning AI Tutor',
    description: 'A personalized AI tutoring system that adapts difficulty based on student performance patterns using reinforcement learning.',
    category: 'AI & Education', semester: '2024/2025 Sem 1',
    submittedAt: '2025-03-08', deadline: '2025-03-15',
    status: 'graded', tags: ['RL', 'Python', 'Django', 'React'],
    rubric: {
      innovation:    { score: 94, weight: 25, comment: 'Outstanding innovation. The adaptive algorithm is state-of-the-art.' },
      technical:     { score: 91, weight: 40, comment: 'Exceptional code quality and system design.' },
      presentation:  { score: 89, weight: 20, comment: 'Engaging demo. Live system worked flawlessly.' },
      documentation: { score: 93, weight: 15, comment: 'Comprehensive and professionally written.' },
    },
    finalScore: 91.9,
    peerReviews: [{ reviewerId: 'S005', score: 93, comment: 'Best project in the cohort by far.' }],
  },
];

// ─── Announcements / Notifications ──────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 'N001', type: 'deadline', message: 'Grading deadline for Semester 1 projects is in 3 days.', date: '2025-03-12', read: false },
  { id: 'N002', type: 'submission', message: 'Amara Okafor submitted her project for review.', date: '2025-03-12', read: false },
  { id: 'N003', type: 'grade', message: 'Your project "AI-Driven Traffic Optimization" has been graded.', date: '2025-03-13', read: true },
  { id: 'N004', type: 'review', message: 'A peer review was submitted for your project.', date: '2025-03-11', read: true },
  { id: 'N005', type: 'system', message: 'System maintenance scheduled for Sunday 02:00–04:00 WAT.', date: '2025-03-10', read: true },
];

// ─── Audit Log ───────────────────────────────────────────────────────────────
export const AUDIT_LOG = [
  { id: 'AL001', userId: 'L001', action: 'GRADE_FINALIZED', target: 'P001', timestamp: '2025-03-13T14:22:00Z', details: 'Final score: 88.05' },
  { id: 'AL002', userId: 'L001', action: 'GRADE_FINALIZED', target: 'P004', timestamp: '2025-03-13T16:05:00Z', details: 'Final score: 77.80' },
  { id: 'AL003', userId: 'L002', action: 'GRADE_FINALIZED', target: 'P006', timestamp: '2025-03-12T11:30:00Z', details: 'Final score: 91.90' },
  { id: 'AL004', userId: 'A001', action: 'USER_CREATED',   target: 'S005', timestamp: '2025-03-01T09:00:00Z', details: 'New student registered' },
];

// ─── Grade Distribution Buckets ──────────────────────────────────────────────
export const getGradeLetter = (score) => {
  if (score === null || score === undefined) return 'N/A';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const getGradeColor = (score) => {
  if (score === null || score === undefined) return 'text-slate-400';
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getGradeBadgeClass = (score) => {
  if (score === null || score === undefined) return 'bg-slate-100 text-slate-500';
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 80) return 'bg-blue-100 text-blue-700';
  if (score >= 70) return 'bg-amber-100 text-amber-700';
  if (score >= 60) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
};
