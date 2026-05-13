'use client';
import { useState } from 'react';
import Link from 'next/link';

// ─── Palette (matches AgileEdge brand) ───────────────────────────────────────
const NAVY   = '#1E3A5F';
const NAVY2  = '#2D5480';
const GOLD   = '#C9A84C';
const GOLD_L = '#E8C97A';
const SLATE  = '#5A7898';
const CREAM  = '#F5F8FF';
const WHITE  = '#FFFFFF';
const GREEN  = '#2D7A4F';
const BORDER = '#D1DCF0';

// ─── Per-certification rich data ─────────────────────────────────────────────
const CERT_DATA = {
  sa: {
    code: 'SA',
    title: 'SAFe Agilist',
    subtitle: 'Leading SAFe® 6.0 Certification',
    role: 'Leadership',
    hours: 16,
    pdus: 16,
    seus: 16,
    enrolled: '12,400+',
    firstPassRate: '94%',
    price: 995,
    earlyBird: 400,
    desc: 'Gain the knowledge and tools necessary to lead a Lean-Agile enterprise by leveraging the Scaled Agile Framework® (SAFe®). Understand the foundational mindset, principles, and practices of SAFe at the team and program levels.',
    prerequisites: [
      '5+ years experience in software development, testing, QA, or product/project management',
      'Familiarity with Agile concepts and principles',
      'Experience working in an enterprise or organizational setting',
    ],
    examReqs: [
      'Pass the SAFe Agilist (SA) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included in course registration',
      'One free retake available',
    ],
    highlights: [
      { icon: 'clock', label: '16 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '16 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'Lean-Agile Mindset', 'SAFe Principles', 'ART Execution', 'PI Planning',
      'Business Agility', 'Agile Coaching', 'Change Leadership', 'Value Streams',
      'Team Collaboration', 'Backlog Management', 'OKRs & Metrics', 'DevOps Culture',
    ],
    careers: [
      { title: 'Agile Coach', min: 89, max: 132 },
      { title: 'Agile Transformation Lead', min: 105, max: 155 },
      { title: 'Change Manager', min: 95, max: 138 },
      { title: 'Lean-Agile Program Manager', min: 98, max: 145 },
    ],
    employers: ['Accenture', 'Deloitte', 'JPMorgan Chase', 'Bank of America', 'IBM', 'Cisco'],
    modules: [
      {
        title: 'Thriving in the Digital Age with Business Agility',
        topics: ['Digital disruption & opportunity', 'The business agility imperative', 'SAFe as the operating model'],
      },
      {
        title: 'Becoming a Lean-Agile Leader',
        topics: ['Lean-Agile mindset', 'SAFe core values', 'Lean thinking principles', 'Leading change'],
      },
      {
        title: 'Establishing Team and Technical Agility',
        topics: ['Agile teams and ARTs', 'Scrum & XP practices', 'Built-in quality', 'DevOps & continuous delivery'],
      },
      {
        title: 'Building Solutions with Agile Product Delivery',
        topics: ['Customer centricity', 'Design thinking', 'Program Increment execution', 'Continuous exploration'],
      },
      {
        title: 'Exploring Lean Portfolio Management',
        topics: ['Lean portfolio strategy', 'Portfolio Kanban', 'Lean budgeting', 'Portfolio governance'],
      },
      {
        title: 'Leading the Change',
        topics: ['Creating urgency', 'Reaching the tipping point', 'Sustaining and accelerating transformation'],
      },
    ],
    faqs: [
      { q: 'Who should attend the SAFe Agilist course?', a: 'Executives, managers, directors, and change agents responsible for leading SAFe transformations at any level of the organization.' },
      { q: 'What is the exam format?', a: '45 multiple-choice questions, 90 minutes, 73% passing score. The exam fee is included and one free retake is provided.' },
      { q: 'How long is the SAFe Agilist certification valid?', a: 'Your SAFe certification is valid for one year. Annual renewal requires 10 continuing education hours and a nominal renewal fee.' },
      { q: 'Is this course delivered online or in person?', a: 'We offer both virtual (live, instructor-led over Zoom) and in-person formats. Check the schedule for upcoming dates and locations.' },
      { q: 'What happens after I register?', a: 'You will receive a confirmation email with class details, pre-reading materials, and a link to the SAFe Community Platform within 24 hours.' },
    ],
  },

  ssm: {
    code: 'SSM',
    title: 'SAFe Scrum Master',
    subtitle: 'SAFe® Scrum Master 6.0 Certification',
    role: 'Scrum Master',
    hours: 16,
    pdus: 16,
    seus: 16,
    enrolled: '9,800+',
    firstPassRate: '93%',
    price: 895,
    earlyBird: 350,
    desc: 'Develop the skills to facilitate and coach Scrum teams in a SAFe enterprise. Master the practices and tools needed to support ART execution, manage dependencies, and deliver value consistently every iteration.',
    prerequisites: [
      '3+ years working in Agile teams as a Scrum Master or team lead',
      'Basic familiarity with Scrum and agile fundamentals',
      'Experience collaborating in cross-functional teams',
    ],
    examReqs: [
      'Pass the SAFe Scrum Master (SSM) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included in registration',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '16 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '16 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'Scrum at Scale', 'PI Planning Facilitation', 'Iteration Execution', 'Team Coaching',
      'Dependency Management', 'Impediment Removal', 'Servant Leadership', 'ART Ceremonies',
      'Kanban', 'Metrics & Predictability', 'Inspect & Adapt', 'Agile Estimation',
    ],
    careers: [
      { title: 'SAFe Scrum Master', min: 98, max: 121 },
      { title: 'Agile Team Facilitator', min: 92, max: 115 },
      { title: 'Iteration Manager', min: 88, max: 110 },
      { title: 'Agile Coach', min: 95, max: 132 },
    ],
    employers: ['Amazon', 'Microsoft', 'Capital One', 'Cognizant', 'Infosys', 'Wells Fargo'],
    modules: [
      {
        title: 'Introducing Scrum in SAFe',
        topics: ['SAFe overview', 'Scrum team roles', 'Agile Release Trains', 'SAFe values & principles'],
      },
      {
        title: 'Experiencing PI Planning',
        topics: ['PI Planning event', 'Team PI objectives', 'Iteration planning', 'Dependencies & risks'],
      },
      {
        title: 'Finishing the PI',
        topics: ['Iteration execution', 'System demo', 'Inspect & Adapt', 'Innovation & planning iteration'],
      },
      {
        title: 'Coaching the Agile Team',
        topics: ['Servant leadership', 'Removing impediments', 'Coaching team dynamics', 'Conflict resolution'],
      },
      {
        title: 'Improving Flow with Kanban & XP',
        topics: ['Team Kanban', 'XP practices', 'Built-in quality', 'Technical debt management'],
      },
    ],
    faqs: [
      { q: 'Do I need a Certified ScrumMaster (CSM) before taking SSM?', a: 'No. SSM is independent of CSM. However, prior Scrum experience (practicing or training) is strongly recommended.' },
      { q: 'How does SSM differ from a standard Scrum Master certification?', a: 'SSM focuses specifically on the enterprise scale. You learn to facilitate ceremonies at the ART level, manage cross-team dependencies, and coordinate within a scaled agile context.' },
      { q: 'What exam do I take after the course?', a: 'The SAFe Scrum Master (SSM) 6.0 exam — 45 questions, 90 minutes, 73% passing score. Included in your registration.' },
      { q: 'Is this course relevant if my company is not fully SAFe yet?', a: 'Absolutely. The practices and coaching skills translate to any team using Scrum, even outside a full SAFe implementation.' },
    ],
  },

  sasm: {
    code: 'SASM',
    title: 'SAFe Advanced Scrum Master',
    subtitle: 'SAFe® Advanced Scrum Master 6.0 Certification',
    role: 'Scrum Master',
    hours: 16,
    pdus: 16,
    seus: 16,
    enrolled: '5,200+',
    firstPassRate: '91%',
    price: 1095,
    earlyBird: 895,
    desc: 'Go beyond the basics. Develop advanced coaching techniques, master complex team dynamics, and learn to facilitate flow at the ART level. Designed for experienced Scrum Masters ready to take on enterprise-wide challenges.',
    prerequisites: [
      'Active SAFe Scrum Master (SSM) certification OR equivalent Scrum Master experience',
      '2+ years practicing as a Scrum Master or Iteration Manager',
      'Familiarity with SAFe roles and ceremonies',
    ],
    examReqs: [
      'Pass the SAFe Advanced Scrum Master (SASM) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '16 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '16 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'Advanced Coaching', 'ART Facilitation', 'Cross-Team Dependencies', 'Lean Problem Solving',
      'Team Anti-Patterns', 'Scaled Retrospectives', 'Executive Alignment', 'Organizational Change',
      'Flow Metrics', 'Value Stream Mapping', 'Communities of Practice', 'Technical Agility',
    ],
    careers: [
      { title: 'Senior Scrum Master', min: 110, max: 138 },
      { title: 'Agile Coach', min: 105, max: 145 },
      { title: 'Release Train Engineer', min: 120, max: 155 },
      { title: 'Agile Program Manager', min: 108, max: 142 },
    ],
    employers: ['Accenture', 'Deloitte', 'Nike', 'Target', 'Lockheed Martin', 'USAA'],
    modules: [
      {
        title: 'Applying Advanced Scrum Master Skills',
        topics: ['SASM role overview', 'Moving from team to ART level', 'Advanced facilitation techniques'],
      },
      {
        title: 'Coaching Patterns and Anti-Patterns',
        topics: ['Common team dysfunction', 'Coaching stances', 'Conflict resolution at scale', 'Difficult conversations'],
      },
      {
        title: 'Improving Flow at ART Level',
        topics: ['Team Kanban mastery', 'WIP limits & flow', 'ART flow metrics', 'Continuous improvement'],
      },
      {
        title: 'Facilitating Large-Scale Problem Solving',
        topics: ['Scaled retrospectives', 'Problem-solving workshops', 'Root cause analysis', 'Improvement backlog'],
      },
      {
        title: 'Building Communities of Practice',
        topics: ['CoP structure & facilitation', 'Knowledge sharing', 'Capability development', 'Lean Agile Center of Excellence'],
      },
    ],
    faqs: [
      { q: 'Do I need SSM before taking SASM?', a: 'An active SSM is recommended but not strictly required. Equivalent Scrum Master experience (2+ years) is accepted.' },
      { q: 'What is the main difference between SSM and SASM?', a: 'SSM focuses on executing Scrum within a SAFe ART. SASM goes deeper into coaching at the ART level, advanced problem-solving, and organizational change.' },
      { q: 'Will this help me move into an RTE role?', a: 'SASM is one of the recommended stepping stones toward the Release Train Engineer role. It builds the coaching and facilitation skills needed at program level.' },
    ],
  },

  popm: {
    code: 'POPM',
    title: 'SAFe Product Owner / Product Manager',
    subtitle: 'SAFe® POPM 6.0 Certification',
    role: 'Product Owner',
    hours: 16,
    pdus: 16,
    seus: 16,
    enrolled: '10,100+',
    firstPassRate: '93%',
    price: 995,
    earlyBird: 795,
    desc: 'Master product ownership at enterprise scale. Learn to connect customer needs to team-level backlogs, define vision and roadmaps, and prioritize work across Agile Release Trains to maximize business value.',
    prerequisites: [
      '3+ years experience in product management, business analysis, or product ownership',
      'Familiarity with Agile and Scrum concepts',
      'Experience engaging stakeholders and managing requirements',
    ],
    examReqs: [
      'Pass the SAFe Product Owner/Product Manager (POPM) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '16 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '16 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'Product Vision', 'Roadmapping', 'PI Objectives', 'Story Mapping',
      'Backlog Prioritization', 'Stakeholder Engagement', 'Design Thinking', 'OKRs',
      'Value Stream Management', 'Feature Definition', 'Lean Business Cases', 'MVP Thinking',
    ],
    careers: [
      { title: 'Product Owner', min: 97, max: 141 },
      { title: 'Product Manager', min: 110, max: 160 },
      { title: 'Business Analyst', min: 88, max: 115 },
      { title: 'Digital Product Lead', min: 120, max: 165 },
    ],
    employers: ['Apple', 'Google', 'Spotify', 'Pfizer', 'Goldman Sachs', 'Boeing'],
    modules: [
      {
        title: 'Becoming a Product Owner/Product Manager',
        topics: ['POPM role clarity', 'PO vs PM responsibilities', 'Customer centricity', 'Personas & empathy mapping'],
      },
      {
        title: 'Defining the Vision',
        topics: ['Product vision statement', 'Solution vision', 'Lean business cases', 'Solution roadmap'],
      },
      {
        title: 'Building the Backlog',
        topics: ['Epics, features & stories', 'Story writing', 'Acceptance criteria', 'WSJF prioritization'],
      },
      {
        title: 'Planning the Program Increment',
        topics: ['PI Planning preparation', 'Team PI objectives', 'ART PI objectives', 'Capacity planning'],
      },
      {
        title: 'Executing the PI',
        topics: ['Iteration execution', 'Backlog refinement', 'Continuous exploration', 'Value delivery metrics'],
      },
    ],
    faqs: [
      { q: 'What is the difference between the Product Owner and Product Manager roles in SAFe?', a: 'In SAFe, the Product Manager owns the vision and program backlog (Features), while the Product Owner works at the team level managing the team backlog (Stories). This course covers both roles.' },
      { q: 'Is POPM relevant for non-software product teams?', a: 'Yes. POPM applies to any value stream — hardware, services, or software. The principles of customer centricity and backlog prioritization are universal.' },
      { q: 'What certification do I earn?', a: 'Upon passing the POPM exam, you earn the SAFe® 6 Product Owner / Product Manager certification from Scaled Agile, Inc.' },
    ],
  },

  devops: {
    code: 'SDP',
    title: 'SAFe DevOps',
    subtitle: 'SAFe® DevOps Practitioner 6.0 Certification',
    role: 'Technical',
    hours: 16,
    pdus: 16,
    seus: 16,
    enrolled: '6,300+',
    firstPassRate: '90%',
    price: 995,
    earlyBird: 795,
    desc: 'Learn to implement a Continuous Delivery Pipeline and DevOps culture in a SAFe enterprise. Build the technical and organizational practices needed to release on demand and deliver value faster, safer, and more sustainably.',
    prerequisites: [
      '3+ years in software development, testing, QA, or operations/infrastructure',
      'Basic understanding of Agile or SAFe practices',
      'Familiarity with CI/CD concepts is helpful but not required',
    ],
    examReqs: [
      'Pass the SAFe DevOps Practitioner (SDP) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '16 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '16 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'CI/CD Pipeline', 'Infrastructure as Code', 'DevSecOps', 'Test Automation',
      'Continuous Exploration', 'Release on Demand', 'Feature Toggles', 'Deployment Pipeline',
      'Monitoring & Observability', 'Cloud Architecture', 'Security Automation', 'Value Stream Mapping',
    ],
    careers: [
      { title: 'DevOps Engineer', min: 105, max: 148 },
      { title: 'Release Manager', min: 98, max: 130 },
      { title: 'DevOps Coach', min: 115, max: 155 },
      { title: 'Site Reliability Engineer', min: 120, max: 165 },
    ],
    employers: ['Netflix', 'Amazon', 'Microsoft', 'Google', 'Red Hat', 'ServiceNow'],
    modules: [
      {
        title: 'Applying DevOps in a SAFe Enterprise',
        topics: ['DevOps definition & benefits', 'CALMR approach', 'SAFe and DevOps alignment', 'Value stream identification'],
      },
      {
        title: 'Continuous Exploration',
        topics: ['Hypothesis-driven development', 'User research & feedback', 'Minimum Viable Product', 'Feature flagging'],
      },
      {
        title: 'Continuous Integration',
        topics: ['Trunk-based development', 'Automated testing', 'Build and test automation', 'Quality gates'],
      },
      {
        title: 'Continuous Deployment',
        topics: ['Deployment pipeline design', 'Infrastructure as code', 'Immutable infrastructure', 'Rollback strategies'],
      },
      {
        title: 'Release on Demand',
        topics: ['Release strategy options', 'Feature toggles', 'Canary releases', 'Production monitoring'],
      },
    ],
    faqs: [
      { q: 'Do I need a development background to take SAFe DevOps?', a: 'A technical background helps but is not mandatory. Operations, QA, and release management professionals benefit equally from this course.' },
      { q: 'What tools are covered in the course?', a: 'The course is tool-agnostic. Concepts apply to any CI/CD toolchain (Jenkins, GitHub Actions, GitLab, Azure DevOps, etc.).' },
      { q: 'How does SAFe DevOps relate to DORA metrics?', a: 'SAFe DevOps directly maps to DORA metrics — deployment frequency, lead time for changes, change failure rate, and mean time to restore. You will learn how to improve all four.' },
    ],
  },

  rte: {
    code: 'RTE',
    title: 'SAFe Release Train Engineer',
    subtitle: 'SAFe® Release Train Engineer 6.0 Certification',
    role: 'Leadership',
    hours: 24,
    pdus: 24,
    seus: 24,
    enrolled: '4,500+',
    firstPassRate: '90%',
    price: 1295,
    earlyBird: 1095,
    desc: 'Become the servant leader and chief Scrum Master of the Agile Release Train. Master the facilitation, coaching, and continuous improvement skills required to lead an ART from PI Planning through delivery and beyond.',
    prerequisites: [
      'Active SSM or SASM certification is strongly recommended',
      '5+ years of experience in Agile delivery, program management, or coaching',
      'Experience participating in at least one PI Planning event',
    ],
    examReqs: [
      'Pass the SAFe Release Train Engineer (RTE) 6.0 exam (45 questions, 90 minutes, 73% passing score)',
      'Exam fee included',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '24 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '24 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'ART Facilitation', 'PI Planning Execution', 'Program Risk Management', 'Coaching at Scale',
      'Dependency Management', 'Metrics & Reporting', 'Executive Stakeholder Management', 'Relentless Improvement',
      'Systems Thinking', 'Release Management', 'ART Launch', 'Innovation Culture',
    ],
    careers: [
      { title: 'Release Train Engineer', min: 120, max: 165 },
      { title: 'Senior Agile Coach', min: 118, max: 158 },
      { title: 'Program Director', min: 125, max: 170 },
      { title: 'Transformation Lead', min: 115, max: 160 },
    ],
    employers: ['Lockheed Martin', 'Boeing', 'Raytheon', 'Verizon', 'KPMG', 'EY'],
    modules: [
      {
        title: 'Introducing the RTE Role',
        topics: ['RTE responsibilities', 'Servant leadership at ART level', 'Comparing RTE, SM, and coach roles', 'Building credibility'],
      },
      {
        title: 'Launching the ART',
        topics: ['ART design & composition', 'Establishing team norms', 'PI cadence setup', 'Initial PI Planning'],
      },
      {
        title: 'Facilitating PI Planning',
        topics: ['PI Planning facilitation guide', 'Managing logistics', 'Facilitating breakouts', 'Managing risk & dependencies'],
      },
      {
        title: 'Executing the PI',
        topics: ['ART sync cadence', 'System demos', 'Metrics & dashboards', 'Tracking PI objectives'],
      },
      {
        title: 'Improving ART Performance',
        topics: ['Inspect & Adapt facilitation', 'Problem-solving workshop', 'Innovation & Planning iteration', 'Relentless improvement backlog'],
      },
      {
        title: 'Coaching for Business Agility',
        topics: ['Lean portfolio alignment', 'Executive coaching', 'Scaling to multiple ARTs', 'Leading organizational transformation'],
      },
    ],
    faqs: [
      { q: 'What is the primary responsibility of an RTE?', a: 'The RTE is the servant leader and coach of the ART. They facilitate ART events and processes, help teams deliver value, and drive relentless improvement across the train.' },
      { q: 'Can I take RTE without SSM?', a: 'Technically yes, but SSM or equivalent Scrum Master experience is strongly recommended. RTE builds on team-level agile coaching skills.' },
      { q: 'How many ARTs does a typical RTE manage?', a: 'One RTE per ART is the standard. Large organizations may have one senior RTE overseeing multiple ARTs with Program Coaches supporting each.' },
      { q: 'What salary can an RTE expect?', a: 'RTEs in the US typically earn $120K–$165K depending on industry, location, and experience level.' },
    ],
  },

  spc: {
    code: 'SPC',
    title: 'SAFe Program Consultant',
    subtitle: 'SAFe® Program Consultant 6.0 Certification',
    role: 'Consultant / Trainer',
    hours: 32,
    pdus: 32,
    seus: 32,
    enrolled: '3,200+',
    firstPassRate: '89%',
    price: 3995,
    earlyBird: 3495,
    desc: 'The most comprehensive SAFe certification available. Become a certified SAFe Program Consultant (SPC) — qualified to train all SAFe courses, launch ARTs, lead enterprise transformations, and deliver SAFe coaching at every level of the organization.',
    prerequisites: [
      'SAFe Agilist (SA) certification or significant SAFe practitioner experience',
      '5+ years of enterprise leadership, consulting, or agile coaching experience',
      'Experience participating in multiple PI Planning events and ART launches',
    ],
    examReqs: [
      'Pass the SAFe Program Consultant (SPC) 6.0 exam (60 questions, 120 minutes, 73% passing score)',
      'Exam fee included',
      'One free retake provided',
    ],
    highlights: [
      { icon: 'clock', label: '32 Hours', sub: 'Live Instructor-Led' },
      { icon: 'cert', label: '32 PDUs / SEUs', sub: 'Continual Learning Credits' },
      { icon: 'shield', label: 'Exam Fee', sub: 'Included in Registration' },
      { icon: 'community', label: '1-Year SAFe', sub: 'Community Membership' },
      { icon: 'studio', label: 'SAFe Studio', sub: 'Access Included' },
      { icon: 'support', label: 'Exam Support', sub: 'Comprehensive Prep' },
    ],
    skills: [
      'SAFe Training Delivery', 'ART Launch Facilitation', 'Lean Portfolio Management', 'Enterprise Coaching',
      'Change Management', 'Executive Alignment', 'Solution Train Coordination', 'Business Agility Strategy',
      'Lean-Agile Center of Excellence', 'Scaling Frameworks', 'WSJF & Flow', 'Organizational Design',
    ],
    careers: [
      { title: 'SAFe Program Consultant', min: 140, max: 190 },
      { title: 'Enterprise Agile Coach', min: 145, max: 195 },
      { title: 'Agile Transformation Director', min: 155, max: 210 },
      { title: 'Independent SAFe Trainer', min: 150, max: 220 },
    ],
    employers: ['Big 4 Consulting', 'Accenture', 'Cognizant', 'McKinsey', 'Booz Allen Hamilton', 'MITRE'],
    modules: [
      {
        title: 'Becoming a SAFe Program Consultant',
        topics: ['SPC role & responsibilities', 'Training others in SAFe', 'Consulting mindset', 'Building your practice'],
      },
      {
        title: 'Leading the SAFe Implementation',
        topics: ['SAFe Implementation Roadmap', 'Training Executives & Managers', 'Identifying Value Streams', 'ART design'],
      },
      {
        title: 'Launching the ART',
        topics: ['ART launch preparation', 'Readiness assessment', 'First PI Planning facilitation', 'Launch retrospective'],
      },
      {
        title: 'Coaching Portfolio Execution',
        topics: ['Lean Portfolio Management', 'Portfolio Kanban', 'Lean budgeting guardrails', 'Portfolio metrics'],
      },
      {
        title: 'Extending SAFe Across the Enterprise',
        topics: ['Solution Train overview', 'Large Solution SAFe', 'Full SAFe configuration', 'Scaling across geographies'],
      },
      {
        title: 'Sustaining and Improving',
        topics: ['Measuring business agility', 'Business Agility Index', 'Continuous improvement at scale', 'Building a LACE'],
      },
    ],
    faqs: [
      { q: 'What can an SPC do that other SAFe certifications cannot?', a: 'SPCs are the only practitioners authorized by Scaled Agile to train and certify others in SAFe courses. They can lead enterprise implementations, launch ARTs, and provide strategic coaching at all levels.' },
      { q: 'Is the SPC course worth the investment?', a: 'SPCs consistently report significant ROI — through increased consulting rates, access to large enterprise projects, and the ability to build an independent SAFe training practice.' },
      { q: 'What is the exam format for the SPC?', a: '60 questions, 120-minute time limit, 73% passing score. The exam covers all SAFe configurations and the full implementation roadmap.' },
      { q: 'Do I need SA certification before SPC?', a: 'SA certification is recommended but not strictly required. Equivalent enterprise agile experience is considered.' },
      { q: 'What is the annual renewal process?', a: 'SPC renewal requires 40 Continuing Education hours annually, active participation in the SAFe Community, and a renewal fee to Scaled Agile.' },
    ],
  },
};

// ─── Shared benefits (all certs) ─────────────────────────────────────────────
const WHY_AGILEEDGE = [
  { title: 'Authorized SAFe Partner', desc: 'We are an official Scaled Agile Gold Partner. Every trainer is a certified SPC with real enterprise transformation experience.' },
  { title: 'Live, Practical Training', desc: 'No pre-recorded lectures. Every session is live, facilitated, and grounded in real-world enterprise case studies.' },
  { title: 'Exam Pass Guarantee', desc: 'Comprehensive exam prep, practice tests, and a structured study guide are provided. We offer a free retake support session if needed.' },
  { title: 'Small Cohort Sizes', desc: 'We cap cohorts at 20 participants for personalized coaching, richer discussions, and direct instructor attention.' },
  { title: 'Post-Training Support', desc: 'Access to your instructor and a private community for 90 days post-training. Ask questions, share blockers, and get coaching as you implement.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', title: 'VP Engineering, Accenture', text: 'World-class facilitation and deep enterprise expertise. The most practical, applicable SAFe training I have experienced — and I have attended several.' , rating: 5 },
  { name: 'Marcus Williams', title: 'Agile Coach, JPMorgan Chase', text: 'Within 6 months of completing the training, I launched two ARTs and saw a 40% improvement in delivery predictability. The ROI has been extraordinary.', rating: 5 },
  { name: 'Priya Patel', title: 'Director PMO, Cognizant', text: 'Our team of 12 went through training together. The cohort approach and real-world case studies made all the difference. Highly recommend for any enterprise team.', rating: 5 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `$${n.toLocaleString()}`;

const ICON_PATHS = {
  clock:     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
  cert:      'M12 15l-2 5 5-3 5 3-2-5M12 2a10 10 0 1 0 0 20',
  shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  community: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  studio:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  support:   'M9 12l2 2 4-4M7 10h.01M12 2a10 10 0 1 0 0 20',
  check:     'M20 6L9 17l-5-5',
  arrow:     'M5 12h14M12 5l7 7-7 7',
  chevron:   'M6 9l6 6 6-6',
  star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  salary:    'M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 0 0 7H6',
  user:      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  book:      'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  building:  'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4',
};

function SvgIcon({ name, size = 20, color = GREEN, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path d={ICON_PATHS[name] || ICON_PATHS.check} />
    </svg>
  );
}

function StarRow({ count = 5, filled = 5 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i < filled ? GOLD : '#E2E8F0'} stroke={i < filled ? GOLD : '#CBD5E1'} strokeWidth="1">
          <path d={ICON_PATHS.star} />
        </svg>
      ))}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CertDetailClient({ certId }) {
  const cert = CERT_DATA[certId];
  const [openModule, setOpenModule] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  if (!cert) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: NAVY }}>Certification Not Found</h2>
        <p style={{ color: SLATE }}>The certification you are looking for does not exist.</p>
        <Link href="/" style={{ color: GOLD, fontWeight: 600 }}>← Back to Home</Link>
      </div>
    );
  }

  const roleColor = {
    Leadership:       { bg: '#EBF2FF', color: '#1E3A5F' },
    'Scrum Master':   { bg: '#D1FAE5', color: '#065F46' },
    'Product Owner':  { bg: '#FEF3C7', color: '#92400E' },
    Technical:        { bg: '#EDE9FE', color: '#5B21B6' },
    'Consultant / Trainer': { bg: '#FCE7F3', color: '#9D174D' },
  }[cert.role] || { bg: '#F1F5F9', color: '#475569' };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: CREAM, color: NAVY, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .cd-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .cd-section { padding: 64px 0; }
        .cd-section-alt { background: ${WHITE}; }
        .cd-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .cd-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; }
        .cd-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .cd-card { background: white; border: 1px solid ${BORDER}; border-radius: 14px; padding: 28px; }
        .cd-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
        .cd-enroll-btn { background: linear-gradient(135deg, ${GOLD}, ${GOLD_L}); color: ${NAVY}; border: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .2s; }
        .cd-enroll-btn:hover { opacity: .88; }
        .cd-outline-btn { background: transparent; color: ${NAVY}; border: 2px solid ${NAVY}; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s, color .15s; }
        .cd-outline-btn:hover { background: ${NAVY}; color: white; }
        .cd-skill-chip { background: #EBF2FF; color: ${NAVY}; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 20px; border: 1px solid #C7D9F0; }
        .cd-accordion-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; background: white; border: 1px solid ${BORDER}; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 600; color: ${NAVY}; text-align: left; transition: background .15s; }
        .cd-accordion-btn:hover { background: #F8FBFF; }
        .cd-accordion-body { padding: 0 22px 20px; background: white; border: 1px solid ${BORDER}; border-top: none; border-radius: 0 0 10px 10px; margin-top: -2px; }
        .cd-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${GOLD}; margin-bottom: 10px; }
        .cd-section-title { font-family: 'Playfair Display', serif; font-size: 32px; color: ${NAVY}; font-weight: 600; line-height: 1.25; margin-bottom: 14px; }
        @media (max-width: 768px) {
          .cd-grid-3 { grid-template-columns: 1fr; }
          .cd-grid-2 { grid-template-columns: 1fr; }
          .cd-grid-4 { grid-template-columns: repeat(2,1fr); }
          .cd-hero-inner { flex-direction: column !important; }
          .cd-hero-right { display: none !important; }
          .cd-section-title { font-size: 24px; }
          .cd-section { padding: 44px 0; }
        }
        @media (max-width: 480px) {
          .cd-grid-4 { grid-template-columns: 1fr; }
          .cd-container { padding: 0 16px; }
        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 0' }}>
        <div className="cd-container">
          <div style={{ fontSize: 13, color: SLATE, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: SLATE, textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#CBD5E1' }}>›</span>
            <Link href="/?page=certifications" style={{ color: SLATE, textDecoration: 'none' }}>Certifications</Link>
            <span style={{ color: '#CBD5E1' }}>›</span>
            <span style={{ color: NAVY, fontWeight: 600 }}>{cert.title}</span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, color: WHITE, padding: '60px 0 52px' }}>
        <div className="cd-container">
          <div className="cd-hero-inner" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span className="cd-tag" style={{ background: 'rgba(201,168,76,.2)', color: GOLD_L }}>{cert.code}</span>
                <span className="cd-tag" style={{ background: roleColor.bg + '22', color: GOLD_L, border: `1px solid ${GOLD}44` }}>{cert.role}</span>
                <span className="cd-tag" style={{ background: 'rgba(255,255,255,.1)', color: '#C7D9F0' }}>{cert.hours} Hours</span>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{cert.title}</h1>
              <div style={{ fontSize: 16, color: GOLD_L, fontWeight: 500, marginBottom: 18 }}>{cert.subtitle}</div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.82)', lineHeight: 1.7, maxWidth: 580, marginBottom: 28 }}>{cert.desc}</p>

              {/* Ratings row */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRow filled={5} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>4.9/5 rating</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                  <strong style={{ color: WHITE }}>{cert.enrolled}</strong> enrolled
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                  <strong style={{ color: WHITE }}>{cert.firstPassRate}</strong> first-time pass rate
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/quick-register" style={{ textDecoration: 'none' }}>
                  <button className="cd-enroll-btn">Enroll Now →</button>
                </Link>
                <Link href="/?page=certifications" style={{ textDecoration: 'none' }}>
                  <button className="cd-outline-btn" style={{ borderColor: 'rgba(255,255,255,.4)', color: WHITE }}>View Schedule</button>
                </Link>
              </div>
            </div>

            {/* Right — price card */}
            <div className="cd-hero-right" style={{ flexShrink: 0, width: 300, background: WHITE, borderRadius: 16, padding: 28, color: NAVY }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: SLATE, marginBottom: 6 }}>Early Bird Price</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: NAVY, fontWeight: 700, marginBottom: 2 }}>{fmt(cert.earlyBird)}</div>
              <div style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>
                <span style={{ textDecoration: 'line-through' }}>{fmt(cert.price)}</span>
                {' '}— Save {fmt(cert.price - cert.earlyBird)}
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  [`${cert.hours} Hours`, 'Live training'],
                  ['Exam Fee', 'Included'],
                  ['1-Year SAFe', 'Community access'],
                  [cert.pdus + ' PDUs', 'Continual learning'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: NAVY }}>{k}</span>
                    <span style={{ color: SLATE }}>{v}</span>
                  </div>
                ))}
              </div>
              <Link href="/quick-register" style={{ textDecoration: 'none', display: 'block' }}>
                <button className="cd-enroll-btn" style={{ width: '100%', textAlign: 'center' }}>Enroll Now</button>
              </Link>
              <div style={{ textAlign: 'center', fontSize: 12, color: SLATE, marginTop: 10 }}>Secure checkout · Instant confirmation</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Highlights ── */}
      <div className="cd-section cd-section-alt">
        <div className="cd-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="cd-section-label">What You Get</div>
            <h2 className="cd-section-title">Course Highlights</h2>
          </div>
          <div className="cd-grid-3">
            {cert.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ position: 'relative', flexShrink: 0, width: 52, height: 52 }}>
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: '#F5EFE6', opacity: .85 }} />
                  <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, background: '#EBF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SvgIcon name={h.icon} size={22} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{h.label}</div>
                  <div style={{ fontSize: 13, color: SLATE }}>{h.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Prerequisites ── */}
      <div className="cd-section">
        <div className="cd-container">
          <div className="cd-grid-2" style={{ alignItems: 'start' }}>
            <div>
              <div className="cd-section-label">Before You Enroll</div>
              <h2 className="cd-section-title" style={{ fontSize: 26 }}>Prerequisites</h2>
              <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                We recommend the following experience to get the most out of this course.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cert.prerequisites.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
                    <span style={{ color: GREEN, marginTop: 2, flexShrink: 0 }}><SvgIcon name="check" size={15} /></span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="cd-section-label">Certification Exam</div>
              <h2 className="cd-section-title" style={{ fontSize: 26 }}>Exam Requirements</h2>
              <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Everything you need to know about the certification exam.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cert.examReqs.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: NAVY, lineHeight: 1.55 }}>
                    <span style={{ color: GOLD, marginTop: 2, flexShrink: 0 }}><SvgIcon name="check" size={15} color={GOLD} /></span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Career Outcomes ── */}
      <div className="cd-section cd-section-alt">
        <div className="cd-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="cd-section-label">Advance Your Career</div>
            <h2 className="cd-section-title">Career Outcomes & Salary Ranges</h2>
            <p style={{ color: SLATE, maxWidth: 520, margin: '0 auto', fontSize: 15, lineHeight: 1.7 }}>
              SAFe-certified professionals command premium salaries. Here are typical US market ranges for roles you can pursue after this certification.
            </p>
          </div>
          <div className="cd-grid-4" style={{ marginBottom: 44 }}>
            {cert.careers.map((c, i) => (
              <div key={i} className="cd-card" style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <SvgIcon name="user" size={20} color={NAVY} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: GREEN }}>
                  {fmt(c.min * 1000)} – {fmt(c.max * 1000)}
                </div>
                <div style={{ fontSize: 11, color: SLATE, marginTop: 4 }}>Avg. US salary</div>
              </div>
            ))}
          </div>

          {/* Hiring companies */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: SLATE, marginBottom: 20 }}>Our graduates work at</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {cert.employers.map(e => (
                <span key={e} style={{ fontSize: 13, fontWeight: 600, color: NAVY2, background: WHITE, border: `1px solid ${BORDER}`, padding: '6px 16px', borderRadius: 20 }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="cd-section">
        <div className="cd-container">
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: 36 }}>
            <div className="cd-section-label">Core Competencies</div>
            <h2 className="cd-section-title">Skills You Will Learn</h2>
            <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7 }}>
              Every skill listed below is covered with hands-on practice, real-world examples, and enterprise case studies.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {cert.skills.map(s => (
              <span key={s} className="cd-skill-chip">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Curriculum ── */}
      <div className="cd-section cd-section-alt">
        <div className="cd-container">
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="cd-section-label">What You Will Study</div>
              <h2 className="cd-section-title">Curriculum</h2>
              <p style={{ color: SLATE, fontSize: 15, lineHeight: 1.7 }}>
                {cert.modules.length} modules · {cert.hours} hours of live instruction · Exam prep included
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cert.modules.map((m, i) => (
                <div key={i}>
                  <button
                    className="cd-accordion-btn"
                    style={{ borderRadius: openModule === i ? '10px 10px 0 0' : 10 }}
                    onClick={() => setOpenModule(openModule === i ? null : i)}
                  >
                    <span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginRight: 10, fontFamily: 'monospace' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {m.title}
                    </span>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: openModule === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                      <path d={ICON_PATHS.chevron} />
                    </svg>
                  </button>
                  {openModule === i && (
                    <div className="cd-accordion-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                        {m.topics.map(t => (
                          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: SLATE }}>
                            <span style={{ color: GREEN, flexShrink: 0, marginTop: 2 }}><SvgIcon name="check" size={13} /></span>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Why AgileEdge ── */}
      <div className="cd-section">
        <div className="cd-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="cd-section-label">Our Difference</div>
            <h2 className="cd-section-title">Why AgileEdge</h2>
          </div>
          <div className="cd-grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
            {WHY_AGILEEDGE.map((w, i) => (
              <div key={i} className="cd-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SvgIcon name="check" size={18} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{w.title}</div>
                <div style={{ fontSize: 14, color: SLATE, lineHeight: 1.65 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="cd-section cd-section-alt">
        <div className="cd-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="cd-section-label">What Graduates Say</div>
            <h2 className="cd-section-title">Testimonials</h2>
          </div>
          <div className="cd-grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="cd-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <StarRow filled={t.rating} />
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WHITE, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: SLATE }}>{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="cd-section">
        <div className="cd-container">
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="cd-section-label">Common Questions</div>
              <h2 className="cd-section-title">Frequently Asked Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cert.faqs.map((f, i) => (
                <div key={i}>
                  <button
                    className="cd-accordion-btn"
                    style={{ borderRadius: openFaq === i ? '10px 10px 0 0' : 10 }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{f.q}</span>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={SLATE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                      <path d={ICON_PATHS.chevron} />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="cd-accordion-body">
                      <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7, paddingTop: 4 }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, padding: '64px 0', color: WHITE }}>
        <div className="cd-container" style={{ textAlign: 'center' }}>
          <div className="cd-section-label" style={{ color: GOLD_L }}>Ready to Get Certified?</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 700, marginBottom: 14, lineHeight: 1.25 }}>
            Start Your {cert.title} Journey
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join {cert.enrolled} professionals who have advanced their careers with AgileEdge SAFe training.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/quick-register" style={{ textDecoration: 'none' }}>
              <button className="cd-enroll-btn" style={{ fontSize: 17, padding: '16px 40px' }}>Enroll Now — {fmt(cert.earlyBird)}</button>
            </Link>
            <Link href="/?page=certifications" style={{ textDecoration: 'none' }}>
              <button className="cd-outline-btn" style={{ borderColor: 'rgba(255,255,255,.35)', color: WHITE, fontSize: 15 }}>← All Certifications</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
