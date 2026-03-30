'use client';
import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { signIn, signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
const PaymentForm = dynamic(() => import('./PaymentForm'), { ssr: false });

// ============================================================
// BRAND: AgileEdge | "Transform at Scale"
// Design: Refined corporate editorial — deep navy + gold accent
// ============================================================

const BRAND = {
  name: "AgileEdge",
  tagline: "Transform at Scale",
  sub: "SAFe SPC Certification & Enterprise Agile Coaching"
};

const COLORS = `
  :root {
    --navy: #1E3A5F;
    --navy-mid: #2D5480;
    --navy-light: #4A7AB5;
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --gold-pale: #FDF6E3;
    --cream: #F5F8FF;
    --slate: #5A7898;
    --slate-light: #8BA6C4;
    --white: #FFFFFF;
    --success: #10B981;
    --danger: #EF4444;
    --border: #D1DCF0;
  }
`;

// ===================== DATA =====================
const CERTIFICATIONS = [
  { id: "sa", code: "SA", title: "SAFe Agilist", role: "Leadership", price: 995, earlyBird: 400, duration: "2 Days", seats: 20, available: 7, desc: "Foundation certification for enterprise agile leaders. Understand the Lean-Agile mindset and how to lead an agile transformation at enterprise scale.", outcomes: ["Lead SAFe transformations", "Apply SAFe principles", "Coach Agile teams", "Drive business agility"], audience: "Executives, managers, change agents" },
  { id: "ssm", code: "SSM", title: "SAFe Scrum Master", role: "Scrum Master", price: 895, earlyBird: 350, duration: "2 Days", seats: 20, available: 12, desc: "Become a skilled Scrum Master in a SAFe enterprise environment. Master facilitation, coaching, and servant leadership.", outcomes: ["Facilitate PI Planning", "Coach agile teams", "Remove impediments at scale", "Manage dependencies"], audience: "Scrum Masters, Team Leads, Project Managers" },
  { id: "sasm", code: "SASM", title: "SAFe Advanced Scrum Master", role: "Scrum Master", price: 1095, earlyBird: 895, duration: "2 Days", seats: 16, available: 4, desc: "Advanced coaching techniques for experienced Scrum Masters. Master patterns, anti-patterns, and coaching at ART level.", outcomes: ["Coach multiple teams", "ART-level facilitation", "Coaching at scale", "Lean problem-solving"], audience: "Experienced Scrum Masters seeking advanced skills" },
  { id: "popm", code: "POPM", title: "SAFe Product Owner/PM", role: "Product Owner", price: 995, earlyBird: 795, duration: "2 Days", seats: 20, available: 9, desc: "Master product ownership in a scaled agile environment. Learn to define vision, roadmaps, and prioritize the backlog at enterprise scale.", outcomes: ["Define product vision", "Prioritize PI objectives", "Manage program backlog", "Engage stakeholders"], audience: "Product Owners, Product Managers, Business Analysts" },
  { id: "devops", code: "SDP", title: "SAFe DevOps", role: "Technical", price: 995, earlyBird: 795, duration: "2 Days", seats: 18, available: 11, desc: "Implement DevOps and continuous delivery pipelines in a SAFe environment. Accelerate value delivery through technical excellence.", outcomes: ["Build CDVC pipeline", "DevOps culture", "Continuous integration", "Release on demand"], audience: "DevOps engineers, Release managers, Architects" },
  { id: "rte", code: "RTE", title: "SAFe Release Train Engineer", role: "Leadership", price: 1295, earlyBird: 1095, duration: "3 Days", seats: 12, available: 3, desc: "Become the chief Scrum Master of the Agile Release Train. Master ART facilitation, coaching, and continuous improvement.", outcomes: ["Facilitate PI Planning", "Coach the ART", "Drive relentless improvement", "Manage program risks"], audience: "Senior Scrum Masters, Program Managers, PMO leads" },
  { id: "spc", code: "SPC", title: "SAFe Program Consultant", role: "Leadership", price: 3995, earlyBird: 3495, duration: "4 Days", seats: 10, available: 2, desc: "The most comprehensive SAFe certification. Train and coach others in SAFe, lead transformations, and deliver SAFe training.", outcomes: ["Train all SAFe courses", "Lead transformations", "Launch ARTs", "Coach enterprise agility"], audience: "Consultants, Coaches, Senior change agents" },
  { id: "corp", code: "CORP", title: "Corporate Workshop", role: "Leadership", price: 0, earlyBird: 0, duration: "Custom", seats: 50, available: 50, desc: "Tailored SAFe training for your entire organization. We customize content, format, and delivery to your specific context and challenges.", outcomes: ["Context-specific content", "Private cohort", "Flexible scheduling", "Post-training coaching"], audience: "Enterprise teams, HR/L&D departments" }
];

const UPCOMING = [
  { certId: "sa", date: "2026-04-19", tz: "EST", format: "Virtual", price: 995, earlyBird: 400, ebDeadline: "2026-04-30", seats: 20, booked: 13 },
  { certId: "ssm", date: "2026-04-09", tz: "EST", format: "Virtual", price: 895, earlyBird: 350, ebDeadline: "2026-04-30", seats: 20, booked: 8 },
  { certId: "popm", date: "2026-04-05", tz: "PST", format: "In-Person, Chicago", price: 995, earlyBird: 795, ebDeadline: "2026-03-22", seats: 20, booked: 11 },
  { certId: "rte", date: "2026-04-12", tz: "EST", format: "Virtual", price: 1295, earlyBird: 1095, ebDeadline: "2026-03-29", seats: 12, booked: 9 },
  { certId: "spc", date: "2026-04-28", tz: "CST", format: "In-Person, Chicago", price: 3995, earlyBird: 3495, ebDeadline: "2026-04-14", seats: 10, booked: 8 }
];

const TESTIMONIALS = [
  { name: "Sarah Chen", title: "VP Engineering, Accenture", text: "The SAFe SPC training transformed how our entire portfolio operates. Within 6 months, we launched 4 ARTs and saw a 40% improvement in delivery predictability.", rating: 5, cert: "SAFe SPC" },
  { name: "Marcus Williams", title: "Agile Coach, JPMorgan Chase", text: "World-class facilitation and deep expertise. I've attended many SAFe trainings — this was by far the most practical, applicable, and energizing experience.", rating: 5, cert: "SAFe RTE" },
  { name: "Priya Patel", title: "Director PMO, Cognizant", text: "Our team of 12 went through the SSM training together. The cohort approach and real-world case studies made the difference. Highly recommend for any enterprise.", rating: 5, cert: "SAFe SSM" }
];

const ADMIN_STATS = { totalReg: 847, revenue: 623450, upcomingCourses: 5, avgSeatFill: 74 };

const CURRENCIES = { USD: { symbol: "$", rate: 1 }, EUR: { symbol: "€", rate: 0.92 }, GBP: { symbol: "£", rate: 0.79 }, INR: { symbol: "₹", rate: 83.5 }, CAD: { symbol: "C$", rate: 1.37 }, AUD: { symbol: "A$", rate: 1.54 } };

// ===================== HELPERS =====================
const fmt = (price, currency = "USD") => {
  const c = CURRENCIES[currency];
  return `${c.symbol}${Math.round(price * c.rate).toLocaleString()}`;
};

const getCert = (id) => CERTIFICATIONS.find(c => c.id === id);
const seatsLeft = (s) => s.seats - s.booked;
const isEarlyBird = (deadline) => new Date() < new Date(deadline);

// ===================== STYLES =====================
const globalStyles = `
  ${COLORS}
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--navy); overflow-x: hidden; }

  .display { font-family: 'Playfair Display', serif; }
  .mono { font-family: 'DM Mono', monospace; }

  /* Animations */
  @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 0 8px rgba(201,168,76,0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #EEF2F8; }
  ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

  /* Sections */
  .section { padding: 80px 0; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .section-label { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 44px); color: var(--navy); line-height: 1.2; }
  .section-title.light { color: var(--white); }
  .section-sub { font-size: 17px; color: var(--slate); margin-top: 12px; line-height: 1.6; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; text-decoration: none; }
  .btn-primary { background: var(--gold); color: var(--navy); }
  .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.3); }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--border); }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .btn-outline-navy { background: transparent; color: var(--navy); border: 1.5px solid var(--navy); }
  .btn-outline-navy:hover { background: var(--navy); color: var(--white); }
  .btn-ghost { background: transparent; color: var(--navy); padding: 10px 16px; }
  .btn-ghost:hover { background: rgba(0,0,0,0.05); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 8px 18px; font-size: 13px; }
  .btn-full { width: 100%; justify-content: center; }

  /* Cards */
  .card { background: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s; }
  .card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .card-navy { background: var(--navy); border-color: var(--border); }

  /* Badges */
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
  .badge-gold { background: var(--gold-pale); color: #8B6914; }
  .badge-navy { background: var(--navy); color: var(--gold); }
  .badge-green { background: #D1FAE5; color: #065F46; }
  .badge-red { background: #FEE2E2; color: #991B1B; }
  .badge-blue { background: #DBEAFE; color: #1E40AF; }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }

  /* Form */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--navy); background: white; transition: border-color 0.2s; outline: none; }
  .form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
  .form-hint { font-size: 12px; color: var(--slate); margin-top: 4px; }

  /* Nav */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; max-width: 1280px; margin: 0 auto; }
  .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-logo-mark { width: 36px; height: 36px; background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; color: var(--navy); }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--navy); }
  .nav-links { display: flex; gap: 4px; }
  .nav-link { padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: 500; color: var(--slate); cursor: pointer; transition: all 0.2s; border: none; background: none; }
  .nav-link:hover, .nav-link.active { color: var(--navy); background: rgba(30,58,95,0.06); }

  /* Hero */
  .hero { background: linear-gradient(135deg, #EBF2FF 0%, #E6EEFF 50%, #EEF4FF 100%); min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; }
  .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(30,58,95,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.04) 1px, transparent 1px); background-size: 60px 60px; }
  .hero-glow { position: absolute; top: 20%; right: 10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%); }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #8B6914; margin-bottom: 24px; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5.5vw, 72px); color: var(--navy); line-height: 1.1; margin-bottom: 24px; }
  .hero-title em { color: var(--gold); font-style: normal; }
  .hero-sub { font-size: 18px; color: var(--slate); line-height: 1.7; max-width: 520px; margin-bottom: 40px; }
  .hero-stats { display: flex; gap: 40px; margin-top: 48px; padding-top: 40px; border-top: 1px solid rgba(30,58,95,0.12); }
  .hero-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--gold); }
  .hero-stat-label { font-size: 13px; color: var(--slate-light); margin-top: 2px; }

  /* Cert cards */
  .cert-card { background: white; border: 1px solid rgba(0,0,0,0.07); border-radius: 14px; padding: 28px; transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
  .cert-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
  .cert-card:hover::before, .cert-card.selected::before { transform: scaleX(1); }
  .cert-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.1); transform: translateY(-3px); }
  .cert-card.selected { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
  .cert-code { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; color: var(--gold); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .cert-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--navy); margin-bottom: 10px; line-height: 1.2; }
  .cert-desc { font-size: 14px; color: var(--slate); line-height: 1.6; margin-bottom: 16px; }
  .cert-meta { display: flex; align-items: center; gap: 16px; font-size: 13px; color: var(--slate); margin-bottom: 20px; flex-wrap: wrap; }
  .cert-meta span { display: flex; align-items: center; gap: 5px; }
  .cert-price { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--navy); }
  .cert-eb { font-size: 13px; color: var(--success); }

  /* Progress steps */
  .steps { display: flex; gap: 0; margin-bottom: 40px; }
  .step { flex: 1; display: flex; align-items: center; gap: 12px; }
  .step-num { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; transition: all 0.3s; }
  .step-num.done { background: var(--gold); color: var(--navy); }
  .step-num.active { background: var(--navy); color: white; border: 2px solid var(--gold); animation: pulse-gold 2s infinite; }
  .step-num.pending { background: #F1F5F9; color: #94A3B8; }
  .step-info { flex: 1; }
  .step-label { font-size: 11px; color: var(--slate-light); text-transform: uppercase; letter-spacing: 1px; }
  .step-title { font-size: 14px; font-weight: 600; color: var(--navy); }
  .step-connector { height: 2px; flex: 1; background: #E2E8F0; margin: 0 8px; }
  .step-connector.done { background: var(--gold); }

  /* Seat indicator */
  .seat-bar { height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; }
  .seat-fill { height: 100%; border-radius: 2px; transition: width 0.6s; }

  /* Admin */
  .admin-layout { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; background: var(--navy); padding: 24px 0; flex-shrink: 0; }
  .sidebar-logo { padding: 0 20px 24px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
  .sidebar-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 20px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s; border: none; background: none; width: 100%; text-align: left; }
  .sidebar-nav-item:hover { color: white; background: rgba(255,255,255,0.06); }
  .sidebar-nav-item.active { color: var(--gold); background: rgba(201,168,76,0.08); border-left: 3px solid var(--gold); }
  .sidebar-section { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 16px 20px 6px; }
  .admin-main { flex: 1; background: #F8FAFC; overflow-y: auto; }
  .admin-header { background: white; border-bottom: 1px solid #E2E8F0; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--navy); }
  .admin-body { padding: 32px; }

  /* Stat cards */
  .stat-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #E2E8F0; }
  .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 30px; color: var(--navy); }
  .stat-label { font-size: 13px; color: var(--slate); margin-top: 4px; }
  .stat-trend { font-size: 12px; color: var(--success); margin-top: 8px; }

  /* Table */
  .table-wrap { background: white; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #F8FAFC; }
  th { padding: 12px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--slate); text-align: left; border-bottom: 1px solid #E2E8F0; }
  td { padding: 14px 20px; font-size: 14px; color: var(--navy); border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #FAFBFF; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
  .modal { background: white; border-radius: 16px; padding: 32px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; animation: fadeUp 0.3s; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--navy); margin-bottom: 24px; }

  /* Testimonials */
  .testi-card { background: white; border-radius: 14px; padding: 28px; border: 1px solid rgba(0,0,0,0.06); }
  .testi-stars { color: var(--gold); font-size: 14px; margin-bottom: 14px; }
  .testi-text { font-size: 15px; color: var(--navy-mid); line-height: 1.7; font-style: italic; margin-bottom: 20px; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #DBE8FF, #C8DBFF); display: flex; align-items: center; justify-content: center; color: var(--navy); font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .testi-name { font-weight: 600; font-size: 14px; }
  .testi-role { font-size: 12px; color: var(--slate); }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--navy); color: white; padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; border-left: 4px solid var(--gold); z-index: 999; animation: fadeUp 0.3s; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }

  /* Footer */
  .footer { background: #EEF2F8; color: var(--slate); }
  .footer-top { padding: 60px 0 40px; border-bottom: 1px solid var(--border); }
  .footer-bottom { padding: 20px 0; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
  .footer-heading { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--navy); margin-bottom: 16px; }
  .footer-link { display: block; font-size: 14px; color: var(--slate); margin-bottom: 8px; cursor: pointer; transition: color 0.2s; }
  .footer-link:hover { color: var(--gold); }

  /* Misc utils */
  .divider { height: 1px; background: #E2E8F0; margin: 24px 0; }
  .text-gold { color: var(--gold); }
  .text-navy { color: var(--navy); }
  .text-slate { color: var(--slate); }
  .text-white { color: white; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .font-mono { font-family: 'DM Mono', monospace; }
  .fw-600 { font-weight: 600; }
  .fw-700 { font-weight: 700; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }
  .mt-8 { margin-top: 32px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .gap-2 { gap: 8px; }
  .gap-4 { gap: 16px; }
  .gap-6 { gap: 24px; }
  .gap-8 { gap: 32px; }
  .w-full { width: 100%; }
  .p-4 { padding: 16px; }
  .p-6 { padding: 24px; }
  .rounded { border-radius: 8px; }
  .rounded-lg { border-radius: 12px; }
  .bg-navy { background: var(--navy); }
  .bg-gold { background: var(--gold); }
  .bg-cream { background: var(--cream); }
  .overflow-hidden { overflow: hidden; }
  .cursor-pointer { cursor: pointer; }
  .relative { position: relative; }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hero-stats { gap: 20px; }
    .hero-stat-num { font-size: 24px; }
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .steps { overflow-x: auto; }
    .admin-layout { flex-direction: column; }
    .sidebar { width: 100%; padding: 12px 0; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .admin-body { padding: 16px; }
  }
`;

// ===================== ICONS =====================
const Icon = ({ name, size = 16 }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    cert: "M12 15l-2 5 5-3 5 3-2-5M12 2a10 10 0 1 0 0 20",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    chart: "M18 20V10M12 20V4M6 20v-6",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    check: "M20 6L9 17l-5-5",
    arrow_right: "M5 12h14M12 5l7 7-7 7",
    arrow_left: "M19 12H5M12 19l-7-7 7-7",
    dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 0 0 7H6",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    globe: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
    clock: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
    plus: "M12 5v14M5 12h14",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    export: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    coupon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 1 1 2 2",
    lms: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22.5 10c0 .83-.34 1.58-.88 2.12A3 3 0 0 1 22 14h-1v1h1v1h-3v-4h1a1 1 0 0 0 0-2h-1V9h1a1 1 0 0 0 .5-.87C20.5 8.06 20.28 8 20 8a1 1 0 0 0-1 1H17a3 3 0 0 1 5.5-1.65c0 .23.03.44 0 .65",
    menu: "M3 12h18M3 6h18M3 18h18",
    x: "M18 6L6 18M6 6l12 12",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M11 12h1v4h1",
    wait: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
    cert2: "M9 12l2 2 4-4M7 10h.01M12 2a10 10 0 1 0 0 20",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      {icons[name] && <path d={icons[name]} />}
    </svg>
  );
};

// ===================== COMPONENTS =====================

const NavBar = ({ page, setPage }) => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.user;
  const user = session?.user;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-mark">AE</div>
          <span className="nav-logo-text">{BRAND.name}</span>
        </div>
        <div className="nav-links">
          {[['home', 'Home'], ['certifications', 'Certifications'], ['register', 'Register'], ['corporate', 'Corporate']].map(([id, label]) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/quick-register" className="btn btn-sm" style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.35)', textDecoration: 'none' }}>
            ⚡ Quick Register
          </a>
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.image ? (
                <img src={user.image} alt={user.name || 'User'} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--navy)', flexShrink: 0 }}>
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.email}
              </span>
              <a href="/dashboard" className="btn btn-sm" style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none', background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.35)' }}>
                My Account
              </a>
              <button className="btn btn-outline btn-sm" onClick={() => signOut({ callbackUrl: '/' })} style={{ fontSize: 12, padding: '6px 12px' }}>
                Logout
              </button>
            </div>
          ) : (
            <a href="/auth" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Login / Sign Up</a>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = ({ setPage }) => (
  <footer className="footer">
    <div className="container">
      <div className="footer-top">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="nav-logo-mark">AE</div>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'white' }}>{BRAND.name}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>{BRAND.sub}</p>
            <p style={{ fontSize: 13, marginTop: 16 }}>SAFe Program Consultant (SPC 6.0)</p>
          </div>
          <div>
            <div className="footer-heading">Certifications</div>
            {['SAFe Agilist', 'SAFe Scrum Master', 'POPM', 'RTE', 'SPC'].map(c => (
              <span key={c} className="footer-link" onClick={() => { setPreSelectedCert(cert.id); setPage('register'); }}>{c}</span>
            ))}
          </div>
          <div>
            <div className="footer-heading">Company</div>
            {['About', 'Corporate Training', 'Blog', 'Case Studies', 'Contact'].map(c => (
              <span key={c} className="footer-link">{c}</span>
            ))}
          </div>
          <div>
            <div className="footer-heading">Contact</div>
            <p style={{ fontSize: 14, marginBottom: 8 }}>📧 training@agile-edge.com</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>📍 Germantown, MD (Virtual & In-Person)</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['LinkedIn', 'Twitter', 'YouTube'].map(s => (
                <span key={s} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {BRAND.name}. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <span className="footer-link" style={{ display: 'inline' }}>Privacy Policy</span>
          <span className="footer-link" style={{ display: 'inline' }}>Terms of Service</span>
          <span className="footer-link" style={{ display: 'inline' }}>Refund Policy</span>
        </div>
      </div>
    </div>
  </footer>
);

const SeatBar = ({ total, booked, showText = true }) => {
  const left = total - booked;
  const pct = (booked / total) * 100;
  const color = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
  return (
    <div>
      {showText && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: left <= 3 ? '#EF4444' : '#64748B' }}>{left === 0 ? '🔴 Sold Out' : `${left} seat${left > 1 ? 's' : ''} left`}</span>
        <span style={{ color: '#94A3B8' }}>{booked}/{total}</span>
      </div>}
      <div className="seat-bar">
        <div className="seat-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const CourseCard = ({ session, currency, onRegister, onWaitlist }) => {
  const cert = getCert(session.certId);
  const left = seatsLeft(session);
  const eb = isEarlyBird(session.ebDeadline);
  const price = eb ? session.earlyBird : session.price;
  const dateStr = new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div className="cert-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span className="badge badge-navy">{cert?.code}</span>
        <span className="badge" style={{ background: session.format.startsWith('Virtual') ? '#EFF6FF' : '#F0FDF4', color: session.format.startsWith('Virtual') ? '#1E40AF' : '#15803D' }}>
          {session.format.startsWith('Virtual') ? '🎥 Virtual' : '📍 In-Person'}
        </span>
      </div>
      <div className="cert-code">{cert?.role}</div>
      <div className="cert-title">{cert?.title}</div>
      <div className="cert-meta">
        <span><Icon name="calendar" size={13} /> {dateStr}</span>
        <span><Icon name="clock" size={13} /> {cert?.duration}</span>
        <span><Icon name="globe" size={13} /> {session.tz}</span>
      </div>
      <SeatBar total={session.seats} booked={session.booked} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
        <div>
          <div className="cert-price">{fmt(price, currency)}</div>
          {eb && <div className="cert-eb">⚡ Early bird — save {fmt(session.price - session.earlyBird, currency)}</div>}
        </div>
        {left === 0
          ? <button className="btn btn-outline-navy btn-sm" onClick={() => onWaitlist(session)}>Join Waitlist</button>
          : <button className="btn btn-primary btn-sm" onClick={() => onRegister(session)}>Register →</button>
        }
      </div>
    </div>
  );
};

// ===================== ARTICLES CAROUSEL =====================

const ArticlesCarousel = () => {
  const [articles, setArticles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setArticles(d.slice(0, 10)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (articles.length < 2) return;
    const t = setInterval(() => {
      setIdx(i => (i + 1) % articles.length);
      setKey(k => k + 1);
    }, 4500);
    return () => clearInterval(t);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const CAT_LABELS = { agile: 'Agile', scrum: 'Scrum', kanban: 'Kanban', safe: 'SAFe', leadership: 'Leadership' };
  const CAT_BG    = { agile: '#EEF5FF', scrum: '#D1FAE5', kanban: '#FEF3C7', safe: '#F3E8FF', leadership: '#FEE2E2' };
  const CAT_COLOR = { agile: '#1E3A5F', scrum: '#065F46', kanban: '#92400E', safe: '#6B21A8', leadership: '#991B1B' };

  const go = (newIdx) => { setIdx(newIdx); setKey(k => k + 1); };

  const main = articles[idx];
  const prev = articles[(idx - 1 + articles.length) % articles.length];
  const next = articles[(idx + 1) % articles.length];

  return (
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', paddingTop: 64, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {/* Label row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px', borderBottom: '1px solid rgba(30,58,95,0.1)' }}>
          <div>
            <span style={{ color: '#1E3A5F', fontSize: 18, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>Latest Articles</span>
          </div>
          <a href="/articles" style={{ color: '#5A7898', fontSize: 13, textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1E3A5F'}
            onMouseLeave={e => e.currentTarget.style.color = '#5A7898'}>
            View all →
          </a>
        </div>

        {/* Cards row — side cards overlap behind center */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '24px 0 20px' }}>

          {/* Left card */}
          {articles.length > 1 && (
            <div
              onClick={() => go((idx - 1 + articles.length) % articles.length)}
              style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                width: 200, marginRight: -64,
                opacity: 0.5, cursor: 'pointer', transition: 'opacity 0.3s',
                transform: 'scale(0.88)', transformOrigin: 'right center',
                borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4',
                background: '#E4EDF8', boxShadow: '0 4px 16px rgba(30,58,95,0.1)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.72'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >
              {prev.cover_image_url
                ? <img src={prev.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.8)', transformOrigin: 'center center' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📝</div>}
            </div>
          )}

          {/* Center card — on top, highlighted */}
          <a key={key} href={`/articles/${main.slug}`} style={{
            flex: 1, position: 'relative', zIndex: 2, display: 'block', textDecoration: 'none',
            background: 'white', borderRadius: 18,
            boxShadow: '0 12px 48px rgba(30,58,95,0.18)',
            overflow: 'hidden', animation: 'fadeUp 0.4s ease forwards',
          }}>
            <div style={{ aspectRatio: '16/6', overflow: 'hidden', background: '#D8E6F5' }}>
              {main.cover_image_url
                ? <img src={main.cover_image_url} alt={main.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#DBEAFE,#C7D9F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📝</div>}
            </div>
            <div style={{ padding: '16px 22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ background: CAT_BG[main.category] || '#EEF5FF', color: CAT_COLOR[main.category] || '#1E3A5F', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                  {CAT_LABELS[main.category] || main.category}
                </span>
                <span style={{ color: '#8BA6C4', fontSize: 12 }}>
                  {main.published_at ? new Date(main.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
              </div>
              <h3 style={{ color: '#1E3A5F', fontSize: 19, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>{main.title}</h3>
              <p style={{ color: '#5A7898', fontSize: 13, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{main.summary}</p>
            </div>
          </a>

          {/* Right card */}
          {articles.length > 1 && (
            <div
              onClick={() => go((idx + 1) % articles.length)}
              style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                width: 200, marginLeft: -64,
                opacity: 0.5, cursor: 'pointer', transition: 'opacity 0.3s',
                transform: 'scale(0.88)', transformOrigin: 'left center',
                borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4',
                background: '#E4EDF8', boxShadow: '0 4px 16px rgba(30,58,95,0.1)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.72'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >
              {next.cover_image_url
                ? <img src={next.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.8)', transformOrigin: 'center center' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📝</div>}
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 20 }}>
          {articles.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, border: 'none', background: i === idx ? '#C9A84C' : 'rgba(30,58,95,0.18)', cursor: 'pointer', transition: 'all 0.35s', padding: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== PAGES =====================

const HomePage = ({ setPage, currency, setCurrency, toast }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <ArticlesCarousel />
      {/* Hero */}
      <div className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 40, paddingBottom: 80 }}>
          <div className="hero-eyebrow">
            <span style={{ width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%', display: 'inline-block' }} />
            EMPOWERING PROFESSIONALS ACROSS ORGANIZATIONS
          </div>
          <h1 className="hero-title">
            Enterprise Agile<br />
            <em>Transformation</em><br />
            at Scale
          </h1>
          <p className="hero-sub">
            We believe agile mastery goes beyond passing an exam. Our programs are designed to cultivate the right mindset and provide deep, practical understanding of modern agile practices. By combining expert instruction, actionable tools, and real-world insights, we empower professionals to stay ahead of industry trends and unlock new career possibilities.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setPage('certifications')}>
              View Certifications <Icon name="arrow_right" />
            </button>
            <a href="/quick-register" className="btn btn-outline" style={{ textDecoration: 'none', background: 'rgba(201,168,76,0.08)', borderColor: 'var(--gold)', color: 'var(--gold)' }}>
              ⚡ Quick Register — 60 Seconds
            </a>
            <button className="btn btn-outline" onClick={() => setPage('corporate')}>
              Corporate Training Inquiry
            </button>
          </div>
          <div className="hero-stats">
            {[['500+', 'Professionals Certified'], ['8+', 'SAFe Certifications'], ['95%', 'First-Time Pass Rate'], ['4.9★', 'Average Rating']].map(([num, label]) => (
              <div key={label}>
                <div className="hero-stat-num">{num}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currency selector */}
      <div style={{ background: 'var(--navy-mid)', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}><Icon name="globe" size={13} /> Currency:</span>
          <select className="form-input form-select" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 'auto', padding: '6px 32px 6px 12px', fontSize: 13, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            {Object.keys(CURRENCIES).map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* About - hidden */}
      {false && <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="section-label">About Your Trainer</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>SAFe SPC — <br />Trusted Enterprise Coach</h2>
              <p className="section-sub" style={{ marginBottom: 20 }}>With 10+ years of agile transformation experience across Fortune 500 companies, I bring real-world expertise to every training session. Not just theory — practical, applied SAFe at scale.</p>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.7, marginBottom: 28 }}>As a SAFe 6.0 Program Consultant (SPC), I've launched 20+ Agile Release Trains, coached 500+ professionals, and led PI Planning events across technology, finance, and healthcare sectors.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {['SAFe SPC 6.0', 'SAFe RTE', 'SAFe POPM', 'ICAgile ICP'].map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--gold)' }}><Icon name="check" size={14} /></span> {c}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #DBE8FF, #C8DBFF)', borderRadius: 20, padding: 40, color: 'var(--navy)', position: 'relative', border: '1px solid var(--border)' }}>
              <div style={{ position: 'absolute', top: 20, right: 20 }}><span className="badge badge-gold">SPC 6.0</span></div>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 8 }}>Dr. Michael Stern</div>
              <div style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 24 }}>SAFe Program Consultant · Enterprise Coach</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid rgba(30,58,95,0.15)', paddingTop: 24 }}>
                {[['10+', 'Years Experience'], ['500+', 'Professionals'], ['20+', 'ARTs Launched'], ['98%', 'Pass Rate']].map(([n, l]) => (
                  <div key={l}><div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--gold)' }}>{n}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* Certifications preview */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">SAFe Certifications</div>
            <h2 className="section-title">Choose Your Certification Path</h2>
            <p className="section-sub" style={{ margin: '12px auto 0', maxWidth: 520 }}>From foundational to advanced, we offer the complete SAFe certification curriculum delivered by a certified SPC.</p>
          </div>
          <div className="grid-4" style={{ marginBottom: 32 }}>
            {CERTIFICATIONS.slice(0, 4).map(cert => (
              <div key={cert.id} className="cert-card" onMouseEnter={() => setHovered(cert.id)} onMouseLeave={() => setHovered(null)} onClick={() => setPage('certifications')}>
                <div className="cert-code">{cert.code} · {cert.role}</div>
                <div className="cert-title">{cert.title}</div>
                <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginBottom: 12 }}>{cert.desc.slice(0, 80)}...</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--navy)' }}>{fmt(cert.earlyBird, currency)}</span>
                  <span className="badge badge-gold">{cert.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-outline-navy" onClick={() => setPage('certifications')}>View All 8 Certifications →</button>
          </div>
        </div>
      </section>

      {/* Upcoming courses */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label">Course Schedule</div>
              <h2 className="section-title">Upcoming Sessions</h2>
            </div>
            <button className="btn btn-outline-navy" onClick={() => setPage('register')}>View Full Schedule</button>
          </div>
          <div className="grid-3">
            {UPCOMING.slice(0, 3).map((s, i) => (
              <CourseCard key={i} session={s} currency={currency} onRegister={() => setPage('register')} onWaitlist={() => toast('Added to waitlist! We\'ll notify you when seats open.')} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: '#EEF5FF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Client Success Stories</div>
            <h2 className="section-title">Trusted by Enterprise Leaders</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card" style={{ background: 'white', border: '1px solid var(--border)' }}>
                <div className="testi-stars">{'★'.repeat(t.rating)}</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div style={{ marginTop: 4 }}><span className="badge badge-gold" style={{ fontSize: 10 }}>{t.cert}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ padding: '40px 0', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 600 }}>TRUSTED BY ENTERPRISE TEAMS FROM:</span>
            {['Accenture', 'JPMorgan', 'Cognizant', 'IBM', 'Deloitte', 'KPMG'].map(co => (
              <span key={co} style={{ fontSize: 15, fontWeight: 700, color: '#CBD5E1', letterSpacing: 1 }}>{co}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CertificationsPage = ({ setPage, currency, setPreSelectedCert }) => {
  const [roleFilter, setRoleFilter] = useState('All');
  const roles = ['All', 'Leadership', 'Scrum Master', 'Product Owner', 'Technical'];
  const filtered = roleFilter === 'All' ? CERTIFICATIONS : CERTIFICATIONS.filter(c => c.role === roleFilter);
  const [expanded, setExpanded] = useState(null);
  const { data: authSession, status: authStatus } = useSession();

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#EBF2FF 0%,#E6EEFF 100%)', padding: '120px 0 60px' }}>
        <div className="container">
          <div className="section-label">Our Programs</div>
          <h1 className="section-title" style={{ marginBottom: 12 }}>SAFe Certification Programs</h1>
          <p style={{ color: 'var(--slate)', fontSize: 17, maxWidth: 520 }}>Choose from the complete SAFe curriculum. Every certification is delivered live by our SAFe SPC with enterprise coaching built in.</p>
        </div>
      </div>
      <div className="section">
        <div className="container">

          {/* Optional Google sign-in banner */}
          {authStatus === 'unauthenticated' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 20px', marginBottom: 28, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>Sign in with Google to register faster</div>
                <div style={{ fontSize: 12, color: 'var(--slate)' }}>Your name and email will be auto-filled when you register. Optional — you can skip this.</div>
              </div>
              <button
                onClick={() => signIn('google', { callbackUrl: '/?page=certifications' })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#0B1629', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}
          {authStatus === 'authenticated' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px 20px', marginBottom: 28 }}>
              {authSession.user?.image
                ? <img src={authSession.user.image} alt="" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #86EFAC' }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'var(--navy)' }}>{(authSession.user?.name || authSession.user?.email || '?')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, fontSize: 13, color: 'var(--slate)' }}>
                Signed in as <strong style={{ color: 'var(--navy)' }}>{authSession.user?.name || authSession.user?.email}</strong> — details will auto-fill when you register
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11, color: 'var(--slate)', cursor: 'pointer', padding: '4px 10px', fontFamily: 'inherit' }}>Sign out</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline-navy'}`} onClick={() => setRoleFilter(r)}>{r}</button>
            ))}
          </div>
          <div className="grid-2">
            {filtered.map(cert => (
              <div key={cert.id} className={`cert-card ${expanded === cert.id ? 'selected' : ''}`} onClick={() => setExpanded(expanded === cert.id ? null : cert.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span className="badge badge-navy">{cert.code}</span>
                  <span className="badge badge-gold">{cert.duration}</span>
                </div>
                <div className="cert-code">{cert.role}</div>
                <div className="cert-title">{cert.title}</div>
                <div className="cert-desc">{cert.desc}</div>

                {expanded === cert.id && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 20, marginTop: 4 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--slate)', marginBottom: 10 }}>Learning Outcomes</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {cert.outcomes.map(o => <div key={o} style={{ fontSize: 13, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={13} color="var(--gold)" /> {o}</div>)}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16 }}>
                      <strong>Who Should Attend:</strong> {cert.audience}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <div>
                    {cert.price === 0 ? (
                      <div className="cert-price" style={{ fontSize: 18 }}>Custom Pricing</div>
                    ) : (
                      <>
                        <div className="cert-price">{fmt(cert.earlyBird, currency)} <span style={{ fontSize: 14, color: 'var(--slate)', textDecoration: 'line-through', fontFamily: 'DM Sans' }}>{fmt(cert.price, currency)}</span></div>
                        <div className="cert-eb">Early bird rate</div>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline-navy btn-sm" onClick={(e) => { e.stopPropagation(); setExpanded(expanded === cert.id ? null : cert.id); }}>
                      {expanded === cert.id ? 'Less ↑' : 'Details ↓'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setPreSelectedCert(cert.id); setPage('register'); }}>
                      Register →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RegistrationDetailsForm = memo(({ form, handleFormChange, corpEmails, handleCorpEmailChange, handleRemoveCorpEmail, waitlistMode, setStep, setCorpEmails, authSession, authStatus, onGoogleSignIn, onSignOut }) => (
  <div>
    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--navy)', marginBottom: 8 }}>
      {waitlistMode ? 'Join the Waitlist' : 'Your Registration Details'}
    </h2>
    <p style={{ color: 'var(--slate)', marginBottom: 24 }}>Fill in your details to {waitlistMode ? 'secure your spot on the waitlist' : 'complete your registration'}.</p>

    <div style={{ marginBottom: 16, textAlign: 'center' }}>
      {authStatus === 'loading' && <div style={{ marginBottom: 8, color: '#94A3B8' }}>Checking authentication state…</div>}
      {authSession ? (
        <div style={{ fontSize: 13, color: 'var(--navy)' }}>
          Signed in as <strong>{authSession.user?.name || authSession.user?.email}</strong>
          <button type="button" onClick={onSignOut} style={{ marginLeft: 12, border: 'none', background: '#ef4444', color: 'white', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      ) : (
        <button type="button" onClick={onGoogleSignIn} className="btn btn-outline-navy" style={{ marginBottom: 12 }}>
          Continue with Google
        </button>
      )}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[['name', 'Full Name', 'text', 'e.g. Jane Smith'], ['email', 'Work Email', 'email', 'jane@company.com'], ['phone', 'Phone Number', 'tel', '+1 555 000 0000'], ['company', 'Company / Organization', 'text', 'Acme Corp'], ['title', 'Job Title', 'text', 'Scrum Master'], ['country', 'Country', 'text', 'United States']].map(([key, label, type, placeholder]) => (
        <div key={`field-${key}`} className="form-group">
          <label className="form-label">{label}</label>
          <input autoComplete="off" type={type} className="form-input" placeholder={placeholder} value={form[key]} onChange={e => handleFormChange(key, e.target.value)} />
        </div>
      ))}
    </div>
    <div className="form-group">
      <label className="form-label">Experience Level</label>
      <select className="form-input form-select" value={form.experience} onChange={e => handleFormChange('experience', e.target.value)}>
        <option value="">Select your experience</option>
        <option>New to Agile</option>
        <option>1–3 years Agile experience</option>
        <option>3–5 years Agile experience</option>
        <option>5+ years Agile experience</option>
        <option>SAFe practitioner</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">GST / Tax Registration Number <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(optional)</span></label>
      <input autoComplete="off" className="form-input" placeholder="For invoice purposes" value={form.gst} onChange={e => handleFormChange('gst', e.target.value)} />
    </div>
    <div className="form-group">
      <label className="form-label">Special Accommodations <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(optional)</span></label>
      <textarea autoComplete="off" className="form-input" rows={2} placeholder="Accessibility needs, dietary requirements, etc." value={form.accommodation} onChange={e => handleFormChange('accommodation', e.target.value)} style={{ resize: 'vertical' }} />
    </div>

    {form.isCorporate && (
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="users" size={16} /> Corporate Bulk Registration</div>
        <div className="form-group">
          <label className="form-label">Number of Participants</label>
          <select className="form-input form-select" style={{ maxWidth: 200 }}>
            <option>5–10 participants (10% off)</option>
            <option>11–20 participants (15% off)</option>
            <option>21+ participants (Custom pricing)</option>
          </select>
        </div>
        <label className="form-label" style={{ marginBottom: 8 }}>Participant Emails</label>
        {corpEmails.map((email, i) => (
          <div key={`corp-email-${i}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input autoComplete="off" className="form-input" placeholder={`participant${i + 1}@company.com`} value={email} onChange={e => handleCorpEmailChange(i, e.target.value)} />
            {i > 0 && <button className="btn btn-sm" style={{ background: '#FEE2E2', color: 'var(--danger)', padding: '0 12px' }} onClick={() => handleRemoveCorpEmail(i)}>×</button>}
          </div>
        ))}
        <button className="btn btn-sm btn-outline-navy" onClick={() => { const newEmails = [...corpEmails, '']; setCorpEmails(newEmails); }} style={{ marginTop: 4 }}>+ Add Participant</button>
        <div className="form-hint" style={{ marginTop: 12 }}>Each participant will receive an individual enrollment confirmation and pre-course materials.</div>
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
      <button className="btn btn-primary" onClick={() => setStep(waitlistMode ? 5 : 4)}>
        {waitlistMode ? 'Join Waitlist →' : 'Proceed to Payment →'}
      </button>
    </div>
  </div>
));
RegistrationDetailsForm.displayName = 'RegistrationDetailsForm';

const RegistrationFlow = ({ currency, toast, preSelectedCert, setPage }) => {
  const [step, setStep] = useState(preSelectedCert ? 2 : 1);
  const [selected, setSelected] = useState(preSelectedCert || null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [waitlistMode, setWaitlistMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', title: '', country: '', experience: '', gst: '', accommodation: '', corpSize: '', isCorporate: false });
  const [corpEmails, setCorpEmails] = useState(['']);

  const { data: authSession, status } = useSession();

  useEffect(() => {
    if (authSession?.user) {
      setForm(f => ({
        ...f,
        name: f.name || authSession.user.name || '',
        email: f.email || authSession.user.email || '',
      }));
    }
  }, [authSession]);

  const handleFormChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCorpEmailChange = useCallback((index, value) => {
    setCorpEmails(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleRemoveCorpEmail = useCallback((index) => {
    setCorpEmails(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle quick link parameters from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const certParam = params.get('cert');
    const couponParam = params.get('coupon');
    const sessionParam = params.get('session');
    
    if (certParam && !selected) {
      setSelected(certParam);
    }
    if (couponParam) {
      setCoupon(couponParam);
    }
  }, []);

  const steps = ['Select Course', 'Choose Date', 'Your Details', 'Payment', 'Confirmation'];
  const session = selectedSession || UPCOMING[0];
  const cert = selected ? getCert(selected) : null;
  const eb = session && isEarlyBird(session.ebDeadline);
  const basePrice = session ? (eb ? session.earlyBird : session.price) : 0;
  const couponDiscount = couponApplied
    ? (couponApplied.discount_type === 'fixed'
        ? Number(couponApplied.discount_value)
        : Math.round(basePrice * couponApplied.discount_value / 100))
    : 0;
  const finalPrice = Math.max(0, basePrice - couponDiscount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: coupon.trim() }) });
      const data = await res.json();
      if (data.valid) { setCouponApplied(data.coupon); toast('✅ Coupon applied!'); }
      else { setCouponApplied(null); setCouponError('Invalid or expired coupon code.'); }
    } catch { setCouponError('Could not verify coupon. Try again.'); }
    finally { setCouponLoading(false); }
  };

  const stepContent = useMemo(() => {
    switch (step) {
      case 1: return (
        <div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--navy)', marginBottom: 8 }}>Choose Your Certification</h2>
          <p style={{ color: 'var(--slate)', marginBottom: 24 }}>Select the SAFe certification that aligns with your role and goals.</p>
          
          {/* Google Auth Option */}
          {status === 'loading' ? (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'center' }}>
              <p style={{ color: 'var(--slate)' }}>Checking authentication...</p>
            </div>
          ) : authSession ? (
            <div style={{ background: '#F0F9FF', border: '1px solid #0EA5E9', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  {authSession.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 2 }}>Signed in as {authSession.user.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--slate)', margin: 0 }}>{authSession.user.email}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => signOut()}
                  style={{
                    background: 'transparent',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  Sign Out
                </button>
              </div>
              <p style={{ fontSize: 14, color: '#059669', marginTop: 12, marginBottom: 0 }}>✅ Your details will be auto-filled in the next step</p>
            </div>
          ) : (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 4 }}>Quick Registration with Google</h3>
                <p style={{ fontSize: 14, color: 'var(--slate)' }}>Sign in to auto-fill your details and register faster</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => signIn('google', { callbackUrl: '/?page=register' })}
                  style={{
                    background: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
                <span style={{ color: 'var(--slate)', alignSelf: 'center', fontSize: 14 }}>or continue manually below</span>
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Filter by Role</label>
            <select className="form-input form-select" style={{ maxWidth: 280 }} onChange={e => { }}>
              <option>All Roles</option>
              <option>Scrum Master</option>
              <option>Product Owner</option>
              <option>Leadership</option>
              <option>Technical</option>
            </select>
          </div>
          <div className="grid-2">
            {CERTIFICATIONS.filter(c => c.id !== 'corp').map(cert => (
              <div key={cert.id} className={`cert-card ${selected === cert.id ? 'selected' : ''}`} onClick={() => setSelected(cert.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-navy">{cert.code}</span>
                  {selected === cert.id && <span className="badge badge-green">✓ Selected</span>}
                </div>
                <div className="cert-title" style={{ fontSize: 16 }}>{cert.title}</div>
                <div style={{ fontSize: 13, color: 'var(--slate)', margin: '8px 0', lineHeight: 1.5 }}>{cert.desc.slice(0, 90)}...</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--navy)' }}>{fmt(cert.earlyBird, currency)}</span>
                  <span style={{ fontSize: 12, color: 'var(--slate)' }}>{cert.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: 20, background: '#F0F9FF', borderRadius: 10, border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="building" size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Corporate Bulk Registration?</div>
              <div style={{ fontSize: 13, color: 'var(--slate)' }}>Register 5+ participants and get group pricing. Perfect for team cohorts.</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isCorporate} onChange={e => handleFormChange('isCorporate', e.target.checked)} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Yes, bulk</span>
            </label>
          </div>
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button className="btn btn-primary" disabled={!selected} onClick={() => setStep(2)}>Continue — Choose Date →</button>
          </div>
        </div>
      );

      case 2: return (
        <div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--navy)', marginBottom: 8 }}>Select a Session Date</h2>
          <p style={{ color: 'var(--slate)', marginBottom: 24 }}>All times auto-detected based on your timezone. <strong>EST/PST/CST</strong> options available.</p>
          
          {preSelectedCert && cert && (
            <div style={{ backgroundColor: '#F0F9FF', border: '2px solid #BAE6FD', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>📚</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>YOUR SELECTED COURSE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="badge badge-navy">{cert.code}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)' }}>{cert.title}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 10, lineHeight: 1.5 }}>{cert.desc}</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                    <span style={{ color: 'var(--slate)' }}>⏱ <strong>{cert.duration}</strong></span>
                    <span style={{ color: 'var(--slate)' }}>🎯 <strong>{cert.role}</strong></span>
                    {UPCOMING.filter(s => s.certId === cert.id).map((s, i) => (
                      <span key={i} style={{ color: 'var(--slate)' }}>
                        📅 <strong>{new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> — {s.format} ({s.tz})
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-navy" onClick={() => setStep(1)} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Change Course</button>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {UPCOMING.filter(s => !selected || s.certId === selected).map((s, i) => {
              const c = getCert(s.certId);
              const left = seatsLeft(s);
              const full = left === 0;
              return (
                <div key={i} onClick={() => { if (!full) { setSelectedSession(s); setWaitlistMode(false); } else setWaitlistMode(true); }}
                  style={{ padding: '18px 22px', background: 'white', border: `2px solid ${selectedSession === s ? 'var(--gold)' : full ? '#FEE2E2' : '#E2E8F0'}`, borderRadius: 12, cursor: full ? 'default' : 'pointer', opacity: full ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className="badge badge-navy">{c?.code}</span>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{c?.title}</span>
                      {full && <span className="badge badge-red">Sold Out</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--slate)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>📅 {new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span>🕐 {s.tz}</span>
                      <span>📍 {s.format}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 140 }}>
                    <SeatBar total={s.seats} booked={s.booked} />
                    {full
                      ? <button className="btn btn-outline-navy btn-sm" style={{ marginTop: 8 }} onClick={e => { e.stopPropagation(); setSelectedSession(s); setWaitlistMode(true); setStep(3); }}>Join Waitlist</button>
                      : <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--navy)', marginTop: 6 }}>{fmt(isEarlyBird(s.ebDeadline) ? s.earlyBird : s.price, currency)}</div>
                    }
                    {!full && isEarlyBird(s.ebDeadline) && <div style={{ fontSize: 11, color: 'var(--success)' }}>⚡ Early bird active</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {waitlistMode && <div style={{ padding: 16, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, marginBottom: 16, display: 'flex', gap: 10 }}>
            <Icon name="wait" size={18} />
            <div><strong>This session is full.</strong> Continue to join the waitlist — you'll be automatically notified and offered priority enrollment when seats open.</div>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => preSelectedCert ? setPage('certifications') : setStep(1)}>← Back</button>
            <button className="btn btn-primary" disabled={!selectedSession} onClick={() => setStep(3)}>
              {waitlistMode ? 'Join Waitlist →' : 'Continue →'}
            </button>
          </div>
        </div>
      );

      case 3: return (
        <RegistrationDetailsForm 
          form={form} 
          handleFormChange={handleFormChange}
          corpEmails={corpEmails}
          handleCorpEmailChange={handleCorpEmailChange}
          handleRemoveCorpEmail={handleRemoveCorpEmail}
          waitlistMode={waitlistMode}
          setStep={setStep}
          setCorpEmails={setCorpEmails}
          authSession={authSession}
          authStatus={status}
          onGoogleSignIn={() => signIn('google', { callbackUrl: '/?page=register' })}
          onSignOut={() => signOut({ callbackUrl: '/' })}
        />
      );

      case 4: console.log('PAYMENT DEBUG - finalPrice:', finalPrice, 'session:', session, 'selectedSession:', selectedSession); return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--navy)', marginBottom: 8 }}>Payment</h2>
            <p style={{ color: 'var(--slate)', marginBottom: 24 }}>Secure payment powered by Stripe. Your card details are never stored.</p>
            <div style={{ marginBottom: 20, padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px dashed #CBD5E1' }}>
              <label className="form-label">Coupon Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                  style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  disabled={!!couponApplied}
                />
                {couponApplied ? (
                  <button className="btn btn-sm" onClick={() => { setCouponApplied(null); setCoupon(''); setCouponError(''); }}
                    style={{ background: '#FEE2E2', color: '#991B1B', border: 'none' }}>Remove</button>
                ) : (
                  <button className="btn btn-outline-navy btn-sm" onClick={applyCoupon} disabled={couponLoading || !coupon.trim()}>
                    {couponLoading ? 'Checking…' : 'Apply'}
                  </button>
                )}
              </div>
              {couponApplied && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>✅ ${couponDiscount.toLocaleString('en-US')} off applied!</div>}
              {couponError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{couponError}</div>}
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, marginBottom: 20 }}>
             <PaymentForm
                key={form.email + (selected?.id || '') + finalPrice}
                amount={finalPrice}
                currency={currency}
                name={form.name}
                email={form.email}
                courseTitle={selected?.title || ''}
                onSuccess={() => setStep(5)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <span></span>
            </div>
          </div>
          {/* Summary panel */}
          <div>
            <div style={{ background: '#EEF5FF', border: '1px solid var(--border)', borderRadius: 16, padding: 28, color: 'var(--navy)', position: 'sticky', top: 80 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Order Summary</div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <span className="badge badge-gold" style={{ marginTop: 2 }}>{getCert(selectedSession?.certId || UPCOMING[0].certId)?.code}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{getCert(selectedSession?.certId || UPCOMING[0].certId)?.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{selectedSession ? new Date(selectedSession.date).toLocaleDateString() : 'TBD'}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{selectedSession?.format || 'Virtual'}</div>
                  </div>
                </div>
              </div>
              <div>
                {[['Course Fee', fmt(basePrice, currency)], ['Early Bird Discount', eb ? `-${fmt(session.price - session.earlyBird, currency)}` : 'N/A'], ['Coupon Discount', couponApplied ? `-${fmt(couponDiscount, currency)}` : 'N/A']].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--slate)', marginBottom: 10 }}>
                    <span>{label}</span><span style={{ color: val.startsWith('-') ? 'var(--success)' : 'inherit' }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 6 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'Playfair Display', color: 'var(--gold)' }}>{fmt(finalPrice, currency)}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 8 }}>Tax/GST may apply based on location</div>
              </div>
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(30,58,95,0.05)', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.8 }}>
                  ✓ Instant enrollment confirmation<br />
                  ✓ Calendar invite (.ics) sent immediately<br />
                  ✓ Pre-course materials within 24hrs<br />
                  ✓ Digital certificate upon completion
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      case 5: return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {waitlistMode ? (
            <>
              <div style={{ width: 80, height: 80, background: '#FFFBEB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>⏳</div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 30, color: 'var(--navy)', marginBottom: 12 }}>You're on the Waitlist!</h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.7 }}>We'll notify you immediately when a seat becomes available. Priority is given in waitlist order. You'll have 24 hours to confirm your spot.</p>
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', minWidth: 280 }}>
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, padding: 16, textAlign: 'left', fontSize: 14 }}>
                  📧 Confirmation sent to <strong>{form.email || 'your email'}</strong><br />
                  🔔 Waitlist notifications enabled<br />
                  📅 Alternative dates available above
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', animation: 'pulse-gold 2s infinite' }}>✓</div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 30, color: 'var(--navy)', marginBottom: 12 }}>Registration Confirmed!</h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.7 }}>
                Welcome to <strong>{getCert(selectedSession?.certId || UPCOMING[0].certId)?.title}</strong>! Your seat is secured. Pre-course materials will be sent 7 days before the session.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 700, margin: '0 auto 32px' }}>
                {[['📧', 'Confirmation Email', 'Sent to ' + (form.email || 'your email')], ['📅', 'Calendar Invite', 'Added to your calendar (.ics)'], ['🧾', 'Invoice', 'Available for download'], ['📚', 'Pre-Course Materials', 'Sent 7 days before']].map(([icon, title, desc]) => (
                  <div key={title} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, textAlign: 'left' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary"><Icon name="download" /> Download .ics</button>
                <button className="btn btn-outline-navy"><Icon name="download" /> Download Invoice</button>
              </div>
              <div style={{ marginTop: 32, padding: 20, background: '#EEF5FF', border: '1px solid var(--border)', borderRadius: 12, maxWidth: 500, margin: '32px auto 0' }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: 16, color: 'var(--navy)', marginBottom: 8 }}>🎓 Your Certificate Journey Begins</div>
                <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>Upon successful completion and exam pass, your digital SAFe certificate will be automatically issued and emailed within 48 hours. Your credential will also appear on the Scaled Agile credentials portal.</div>
              </div>
            </>
          )}
        </div>
      );
    }
  }, [step, selected, selectedSession, form, corpEmails, waitlistMode, currency, finalPrice, session, cert, coupon, couponApplied, couponError, couponLoading, couponDiscount, handleFormChange, handleCorpEmailChange, handleRemoveCorpEmail, setStep, setForm, setCorpEmails]);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'linear-gradient(135deg,#EBF2FF 0%,#E6EEFF 100%)', padding: '40px 0 30px' }}>
        <div className="container">
          <div className="section-label">Course Enrollment</div>
          <h1 className="section-title" style={{ fontSize: 28 }}>Register for a SAFe Certification</h1>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* ── Optional Google sign-in banner ── */}
        {status === 'unauthenticated' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 20px', marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>Speed up registration — sign in with Google</div>
              <div style={{ fontSize: 12, color: 'var(--slate)' }}>Your name and email will be auto-filled. No account required to continue manually.</div>
            </div>
            <button
              onClick={() => signIn('google', { callbackUrl: '/?page=register' })}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: 'white', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#0B1629', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}
        {status === 'authenticated' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px 20px', marginBottom: 24 }}>
            {authSession.user?.image
              ? <img src={authSession.user.image} alt="" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #86EFAC' }} />
              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--navy)', flexShrink: 0 }}>{(authSession.user?.name || authSession.user?.email || '?')[0].toUpperCase()}</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>✓ Signed in — details auto-filled</div>
              <div style={{ fontSize: 12, color: 'var(--slate)' }}>{authSession.user?.name}{authSession.user?.name && authSession.user?.email ? ' · ' : ''}{authSession.user?.email}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11, color: 'var(--slate)', cursor: 'pointer', padding: '4px 10px', fontFamily: 'inherit' }}>Sign out</button>
          </div>
        )}

        {/* Steps */}
        <div className="steps" style={{ marginBottom: 40, background: 'white', padding: '20px 24px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          {steps.map((s, i) => {
            const n = i + 1;
            const status = n < step ? 'done' : n === step ? 'active' : 'pending';
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                  <div className={`step-num ${status}`}>{status === 'done' ? '✓' : n}</div>
                  <div className="step-info" style={{ display: n <= 3 || window.innerWidth > 600 ? 'block' : 'none' }}>
                    <div className="step-label">Step {n}</div>
                    <div className="step-title" style={{ fontSize: 13 }}>{s}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <div className={`step-connector ${n < step ? 'done' : ''}`} style={{ flex: 1, minWidth: 16 }} />}
              </div>
            );
          })}
        </div>
        
        {/* Certificate Details Banner - shown when quick link is used */}
        {preSelectedCert && cert && (
          <div style={{
            background: 'linear-gradient(135deg, #DBE8FF, #C8DBFF)',
            color: 'var(--navy)',
            padding: '20px 24px',
            borderRadius: 12,
            marginBottom: 24,
            border: '2px solid var(--gold)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#8B6914', fontWeight: 600, marginBottom: 4 }}>COURSE SELECTED</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="badge badge-gold">{cert.code}</span>
                  <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 600 }}>{cert.title}</h2>
                </div>
                <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 14, lineHeight: 1.5 }}>{cert.desc}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-light)' }}>DURATION</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{cert.duration}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-light)' }}>STARTING FROM</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {isEarlyBird(UPCOMING.find(s => s.certId === selected)?.ebDeadline)
                        ? fmt(UPCOMING.find(s => s.certId === selected)?.earlyBird, currency)
                        : fmt(UPCOMING.find(s => s.certId === selected)?.price, currency)
                      }
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate-light)' }}>UPCOMING DATES</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {UPCOMING.filter(s => s.certId === selected).length > 0
                        ? UPCOMING.filter(s => s.certId === selected).map(s =>
                            new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          ).join(', ')
                        : 'Contact us'
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 120 }}>
                <div style={{ width: 80, height: 80, background: 'rgba(30,58,95,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 12 }}>
                  {step === 1 ? '📚' : step === 2 ? '📅' : step === 3 ? '👤' : step === 4 ? '💳' : '✓'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Step {step} of {steps.length}</div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid #E2E8F0' }}>
          {stepContent}
        </div>
      </div>
    </div>
  );
};

const CorporatePage = ({ toast }) => (
  <div style={{ paddingTop: 64 }}>
    <div style={{ background: 'linear-gradient(135deg,#EBF2FF 0%,#E6EEFF 100%)', padding: '100px 0 60px' }}>
      <div className="container">
        <div className="section-label">Enterprise Solutions</div>
        <h1 className="section-title" style={{ marginBottom: 16 }}>Corporate SAFe Training</h1>
        <p style={{ color: 'var(--slate)', fontSize: 17, maxWidth: 580 }}>
          Tailored SAFe training programs for your entire organization. Private cohorts, custom content, flexible scheduling, and post-training coaching support.
        </p>
      </div>
    </div>
    <div className="section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 60 }}>
          {[['🏢', 'Private Cohort', 'Your team trains together in a private setting. Content is contextualized to your industry and organizational challenges.'],
            ['📊', 'Group Discounts', '5+ participants: 10% off\n11–20 participants: 15% off\n21+ participants: Custom pricing — contact us.'],
            ['📅', 'Flexible Scheduling', 'We work around your team\'s availability. Weekday, evening, and weekend options.'],
            ['🎓', 'LMS Integration', 'Materials and course content can be integrated with your corporate LMS (Cornerstone, Workday, etc.)'],
            ['📜', 'Bulk Certificates', 'Automated certificate issuance for all participants upon exam completion.'],
            ['🤝', 'Post-Training Coaching', '60-day coaching support package available. ART launch facilitation and PI Planning support.']
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--navy)', marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#EBF2FF,#E6EEFF)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 56px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--navy)', marginBottom: 12 }}>Request a Corporate Training Quote</div>
            <p style={{ color: 'var(--slate)', fontSize: 15, marginBottom: 24 }}>Tell us your team size, target certifications, and preferred timeline. We'll respond within 1 business day.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['Contact Name', 'Work Email', 'Company', 'Team Size'].map(f => (
                <input key={f} className="form-input" placeholder={f} />
              ))}
            </div>
          </div>
          <div>
            <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16 }} onClick={() => toast('✅ Inquiry sent! We\'ll respond within 1 business day.')}>
              Send Inquiry →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===================== ADMIN DASHBOARD =====================
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  const navItems = [
    { section: 'Analytics', items: [{ id: 'overview', icon: 'chart', label: 'Overview' }] },
    { section: 'Content', items: [{ id: 'courses', icon: 'book', label: 'Courses' }, { id: 'schedule', icon: 'calendar', label: 'Schedule' }] },
    { section: 'Participants', items: [{ id: 'registrations', icon: 'users', label: 'Registrations' }, { id: 'waitlist', icon: 'wait', label: 'Waitlist' }, { id: 'certificates', icon: 'cert2', label: 'Certificates' }] },
    { section: 'Commerce', items: [{ id: 'coupons', icon: 'coupon', label: 'Coupons' }, { id: 'revenue', icon: 'dollar', label: 'Revenue' }] },
    { section: 'Platform', items: [{ id: 'lms', icon: 'lms', label: 'LMS Integration' }, { id: 'content', icon: 'edit', label: 'Content CMS' }, { id: 'settings', icon: 'settings', label: 'Settings' }] },
  ];

  const AdminContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <div>
          <div className="grid-4" style={{ marginBottom: 32 }}>
            {[
              { label: 'Total Registrations', val: '847', trend: '+23 this month', icon: '👥', color: '#EFF6FF' },
              { label: 'Revenue (YTD)', val: '$623K', trend: '+$42K this month', icon: '💰', color: '#F0FDF4' },
              { label: 'Upcoming Sessions', val: '5', trend: '2 in next 30 days', icon: '📅', color: '#FFFBEB' },
              { label: 'Avg Seat Fill Rate', val: '74%', trend: '+8% vs last quarter', icon: '📊', color: '#FDF4FF' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.color, fontSize: 22 }}>{s.icon}</div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-trend">{s.trend}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="table-wrap">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Upcoming Sessions</span>
                <button className="btn btn-primary btn-sm">+ Add Session</button>
              </div>
              <table>
                <thead>
                  <tr><th>Certification</th><th>Date</th><th>Format</th><th>Fill Rate</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {UPCOMING.map((s, i) => {
                    const c = getCert(s.certId);
                    const pct = Math.round((s.booked / s.seats) * 100);
                    return (
                      <tr key={i}>
                        <td><span className="badge badge-navy" style={{ marginRight: 8 }}>{c?.code}</span>{c?.title}</td>
                        <td style={{ fontSize: 13 }}>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td><span className={`badge ${s.format.startsWith('Virtual') ? 'badge-blue' : 'badge-green'}`}>{s.format.startsWith('Virtual') ? 'Virtual' : 'In-Person'}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="seat-bar" style={{ width: 60 }}><div className="seat-fill" style={{ width: `${pct}%`, background: pct > 80 ? '#EF4444' : '#10B981' }} /></div>
                            <span style={{ fontSize: 12, color: 'var(--slate)' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>${(s.booked * s.earlyBird).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-wrap">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 600 }}>Recent Registrations</div>
              {[{ name: 'Sarah Chen', cert: 'SPC', amount: 3995, time: '2 hrs ago' }, { name: 'Marcus W.', cert: 'SSM', amount: 695, time: '5 hrs ago' }, { name: 'Priya Patel', cert: 'POPM', amount: 795, time: '1 day ago' }, { name: 'James Liu', cert: 'SA', amount: 795, time: '1 day ago' }].map((r, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>{r.name[0]}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div><div style={{ fontSize: 12, color: 'var(--slate)' }}>{r.time}</div></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-navy">{r.cert}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>${r.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case 'courses': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>All Certifications ({CERTIFICATIONS.length})</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" /> Add Certification</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Certification</th><th>Role</th><th>Duration</th><th>Price</th><th>Early Bird</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {CERTIFICATIONS.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.title}</strong><div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'DM Mono' }}>{c.code}</div></td>
                    <td><span className="badge badge-blue">{c.role}</span></td>
                    <td style={{ fontSize: 13 }}>{c.duration}</td>
                    <td style={{ fontWeight: 600 }}>{c.price === 0 ? 'Custom' : `$${c.price}`}</td>
                    <td style={{ color: 'var(--success)' }}>{c.price === 0 ? '—' : `$${c.earlyBird}`}</td>
                    <td><span className="badge badge-green">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-ghost"><Icon name="edit" size={14} /></button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case 'registrations': return (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <input className="form-input" placeholder="Search registrations..." style={{ maxWidth: 280 }} />
            <select className="form-input form-select" style={{ width: 'auto' }}><option>All Courses</option>{CERTIFICATIONS.map(c => <option key={c.id}>{c.title}</option>)}</select>
            <select className="form-input form-select" style={{ width: 'auto' }}><option>All Status</option><option>Confirmed</option><option>Waitlisted</option><option>Cancelled</option></select>
            <button className="btn btn-outline-navy btn-sm"><Icon name="export" /> Export CSV</button>
            <button className="btn btn-primary btn-sm"><Icon name="mail" /> Bulk Email</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Participant</th><th>Certification</th><th>Date</th><th>Company</th><th>Amount</th><th>Payment</th><th>Certificate</th></tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Chen', email: 'sarah@accenture.com', cert: 'SPC', date: '2026-04-28', company: 'Accenture', amount: 3495, paid: true, certified: true },
                  { name: 'Marcus Williams', email: 'marcus@jpmorgan.com', cert: 'RTE', date: '2026-04-12', company: 'JPMorgan', amount: 1095, paid: true, certified: false },
                  { name: 'Priya Patel', email: 'priya@cognizant.com', cert: 'SSM', date: '2026-03-22', company: 'Cognizant', amount: 695, paid: true, certified: false },
                  { name: 'James Liu', email: 'james@ibm.com', cert: 'SA', date: '2026-03-15', company: 'IBM', amount: 795, paid: false, certified: false },
                  { name: 'Elena Rodriguez', email: 'elena@deloitte.com', cert: 'POPM', date: '2026-04-05', company: 'Deloitte', amount: 795, paid: true, certified: false },
                ].map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)' }}>{r.email}</div>
                    </td>
                    <td><span className="badge badge-navy">{r.cert}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td style={{ fontSize: 13 }}>{r.company}</td>
                    <td style={{ fontWeight: 600 }}>${r.amount}</td>
                    <td><span className={`badge ${r.paid ? 'badge-green' : 'badge-red'}`}>{r.paid ? 'Paid' : 'Pending'}</span></td>
                    <td>
                      {r.certified
                        ? <button className="btn btn-sm btn-ghost" style={{ color: 'var(--success)', fontSize: 12 }}><Icon name="download" size={13} /> Issued</button>
                        : <span style={{ fontSize: 12, color: 'var(--slate)' }}>Pending exam</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case 'coupons': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Coupon Management</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" /> Create Coupon</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Type</th><th>Discount</th><th>Used / Limit</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {[{ code: 'SAFE20', type: 'Percentage', value: '20%', used: 23, limit: 50, expires: '2026-04-01', active: true }, { code: 'EARLY10', type: 'Percentage', value: '10%', used: 45, limit: 100, expires: '2026-03-31', active: true }, { code: 'CORP15', type: 'Percentage', value: '15%', used: 8, limit: null, expires: '2026-06-30', active: true }, { code: 'SUMMER50', type: 'Fixed', value: '$50', used: 12, limit: 20, expires: '2026-08-31', active: false }].map((c, i) => (
                  <tr key={i}>
                    <td><span className="font-mono fw-700" style={{ color: 'var(--navy)', letterSpacing: 1 }}>{c.code}</span></td>
                    <td style={{ fontSize: 13 }}>{c.type}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{c.value} off</td>
                    <td><div style={{ fontSize: 13 }}>{c.used} / {c.limit || '∞'}</div><div className="seat-bar" style={{ marginTop: 4, width: 80 }}><div className="seat-fill" style={{ width: `${c.limit ? (c.used / c.limit) * 100 : 30}%`, background: 'var(--gold)' }} /></div></td>
                    <td style={{ fontSize: 13 }}>{c.expires}</td>
                    <td><span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Expired'}</span></td>
                    <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-sm btn-ghost"><Icon name="edit" size={14} /></button><button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}><Icon name="trash" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case 'certificates': return (
        <div>
          <div style={{ marginBottom: 24, padding: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="info" size={20} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Automated Certificate Issuance</div>
              <div style={{ fontSize: 14, color: 'var(--slate)' }}>Certificates are automatically issued within 48 hours when: (1) exam score ≥ 75% is recorded in the LMS, (2) payment is confirmed, and (3) attendance is marked. Certificates are sent via email and posted to the Scaled Agile portal via API.</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Participant</th><th>Certification</th><th>Exam Score</th><th>Issued Date</th><th>Certificate ID</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {[{ name: 'Sarah Chen', cert: 'SAFe SPC', score: 89, issued: '2026-01-15', id: 'CERT-2026-SPC-0847' }, { name: 'David Kim', cert: 'SAFe SSM', score: 92, issued: '2026-01-08', id: 'CERT-2026-SSM-0831' }, { name: 'Jennifer Walsh', cert: 'SAFe SA', score: 78, issued: '2025-12-20', id: 'CERT-2025-SA-0820' }].map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><span className="badge badge-navy">{r.cert}</span></td>
                    <td><span style={{ fontWeight: 700, color: r.score >= 85 ? 'var(--success)' : 'var(--gold)' }}>{r.score}%</span></td>
                    <td style={{ fontSize: 13 }}>{r.issued}</td>
                    <td><span className="mono text-xs" style={{ color: 'var(--slate)' }}>{r.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-ghost"><Icon name="download" size={14} /> PDF</button>
                        <button className="btn btn-sm btn-ghost"><Icon name="mail" size={14} /> Resend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case 'lms': return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'var(--navy)', marginBottom: 8 }}>LMS Integration</h2>
            <p style={{ color: 'var(--slate)' }}>Connect AgileEdge with your corporate Learning Management System for seamless content delivery, progress tracking, and completion reporting.</p>
          </div>
          {[['Cornerstone OnDemand', '🏢', '#DBEAFE', 'Connect', false], ['Workday Learning', '💼', '#F0FDF4', 'Connect', false], ['SAP SuccessFactors', '🔷', '#EEF2FF', 'Connect', false], ['TalentLMS', '🎓', '#FFFBEB', 'Connected', true], ['Moodle', '📚', '#FDF4FF', 'Connect', false], ['Canvas LMS', '🖼️', '#F0FDF4', 'Connect', false]].map(([name, icon, bg, status, connected]) => (
            <div key={name} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
                {connected && <span className="badge badge-green">Connected</span>}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{name}</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16, lineHeight: 1.6 }}>Sync course content, track completion, and automate certificate issuance via {name} API.</div>
              <button className={`btn btn-sm ${connected ? 'btn-outline-navy' : 'btn-primary'}`}>{connected ? '⚙️ Configure' : `${status} →`}</button>
            </div>
          ))}
        </div>
      );

      case 'waitlist': return (
        <div>
          <div style={{ marginBottom: 24, fontWeight: 700, fontSize: 16 }}>Waitlist Management</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Participant</th><th>Certification</th><th>Session Date</th><th>Position</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {[{ name: 'Tom Anderson', email: 'tom@company.com', cert: 'SPC', date: '2026-04-28', pos: 1, joined: '2026-02-15' }, { name: 'Lisa Park', email: 'lisa@corp.com', cert: 'RTE', date: '2026-04-12', pos: 2, joined: '2026-02-18' }, { name: 'Ahmed Hassan', email: 'ahmed@firm.com', cert: 'SPC', date: '2026-04-28', pos: 2, joined: '2026-02-20' }].map((w, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 600 }}>{w.name}</div><div style={{ fontSize: 12, color: 'var(--slate)' }}>{w.email}</div></td>
                    <td><span className="badge badge-navy">{w.cert}</span></td>
                    <td style={{ fontSize: 13 }}>{w.date}</td>
                    <td><span style={{ fontFamily: 'DM Mono', fontWeight: 700, color: w.pos === 1 ? 'var(--gold)' : 'var(--navy)' }}>#{w.pos}</span></td>
                    <td style={{ fontSize: 13 }}>{w.joined}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-primary">Offer Seat</button>
                        <button className="btn btn-sm btn-ghost"><Icon name="mail" size={13} /> Notify</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 24, padding: 20, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>⚙️ Waitlist Automation Settings</div>
            <div style={{ display: 'flex', gap: 32, fontSize: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" defaultChecked /> Auto-notify when seat opens</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" defaultChecked /> 24-hour acceptance window</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" /> Auto-promote next in queue</label>
            </div>
          </div>
        </div>
      );

      default: return (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--slate)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'var(--navy)', marginBottom: 8 }}>Coming Soon</div>
          <div>This module is in development. Part of the full MVP build-out.</div>
        </div>
      );
    }
  };

  return (
    <div className="admin-layout" style={{ paddingTop: 64 }}>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="nav-logo-mark" style={{ width: 30, height: 30, fontSize: 13 }}>AE</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{BRAND.name} Admin</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Management Portal</div>
            </div>
          </div>
        </div>
        {navItems.map(group => (
          <div key={group.section}>
            <div className="sidebar-section">{group.section}</div>
            {group.items.map(item => (
              <button key={item.id} className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="admin-main">
        <div className="admin-header">
          <div className="admin-title">{navItems.flatMap(g => g.items).find(i => i.id === activeTab)?.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--slate)' }}>👤 Dr. Michael Stern</span>
            <span className="badge badge-gold">SPC Admin</span>
          </div>
        </div>
        <div className="admin-body">
          <AdminContent />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="modal-title">Add New Course/Coupon</div>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><Icon name="x" /></button>
            </div>
            <div className="form-group"><label className="form-label">Certification Type</label><select className="form-input form-select"><option>Select type...</option>{CERTIFICATIONS.map(c => <option key={c.id}>{c.title}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">Price ($)</label><input className="form-input" type="number" placeholder="995" /></div>
              <div className="form-group"><label className="form-label">Early Bird ($)</label><input className="form-input" type="number" placeholder="795" /></div>
              <div className="form-group"><label className="form-label">Max Seats</label><input className="form-input" type="number" placeholder="20" /></div>
              <div className="form-group"><label className="form-label">Session Date</label><input className="form-input" type="date" /></div>
            </div>
            <div className="form-group"><label className="form-label">Format</label><select className="form-input form-select"><option>Virtual (Zoom)</option><option>In-Person</option><option>Hybrid</option></select></div>
            <div className="form-group"><label className="form-label">Zoom / Location Link</label><input className="form-input" placeholder="https://zoom.us/j/..." /></div>
            <div className="form-group"><label className="form-label">Materials Link</label><input className="form-input" placeholder="https://drive.google.com/..." /></div>
            <div className="form-group"><label className="form-label">Early Bird Deadline</label><input className="form-input" type="date" /></div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Save Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== APP ROOT =====================
export default function App() {
  const [page, setPage] = useState('home');
  const [preSelectedCert, setPreSelectedCert] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); };

  // Handle URL query parameters (quick links, post-auth redirects)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const cert = params.get('cert');
    const pageParam = params.get('page');

    if (cert) {
      setPreSelectedCert(cert);
      setPage('register');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (pageParam && ['register', 'certifications', 'corporate'].includes(pageParam)) {
      // Restore page state after post-login redirect (e.g. /?page=register)
      setPage(pageParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const isAdmin = page === 'admin';

  return (
    <>
      <style>{globalStyles}</style>
      {!isAdmin && <NavBar page={page} setPage={setPage} />}
      <main style={!isAdmin ? { paddingTop: 0 } : {}}>
        {page === 'home' && <HomePage setPage={setPage} currency={currency} setCurrency={setCurrency} toast={toast} />}
        {page === 'certifications' && <CertificationsPage setPage={setPage} currency={currency} setPreSelectedCert={setPreSelectedCert} />}
        {page === 'register' && <RegistrationFlow currency={currency} toast={toast} preSelectedCert={preSelectedCert} setPage={setPage} />}
        {page === 'corporate' && <CorporatePage toast={toast} />}
        {page === 'admin' && <AdminDashboard />}
      </main>
      {!isAdmin && <Footer setPage={setPage} />}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  );
}
