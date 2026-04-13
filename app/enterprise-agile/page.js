import Link from 'next/link';

export const metadata = {
  title: 'Enterprise Agile Implementation Partner | Optimized Solutions',
  description: 'Optimized Solutions partners with Prime Contractors and Government Agencies on SAFe transformations, AWS cloud migrations, and data modernization.',
};

const NAV_H = 64;

// ── Palette ──────────────────────────────
const BG       = '#F7F6F2';        // warm cream
const BG_ALT   = '#EEF2EE';        // soft sage tint
const BG_DARK  = '#2D4A55';        // deep teal
const BORDER   = '#C8C4BC';        // warm gray border
const TEXT     = '#111C20';        // near-black
const MUTED    = '#3D5A60';        // dark teal
const FAINT    = '#5A7880';        // medium teal
const SAGE     = '#2E7D52';        // vivid green
const ROSE     = '#A8432A';        // vivid terracotta
const SKY      = '#1A6E9A';        // vivid blue
const LAVENDER = '#5E3D9E';        // vivid purple
const PEACH    = '#D4A070';        // warm amber

export default function EnterpriseAgilePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: BG, color: TEXT, overflowX: 'hidden', fontSize: 16 }}>

      {/* ── HERO ── */}
      <section style={{ paddingTop: NAV_H, background: BG_ALT, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>

          {/* Label */}
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SAGE, border: `1px solid ${SAGE}`, padding: '4px 14px', borderRadius: 20, background: '#E8F0EA' }}>
              Enterprise Agile & Cloud
            </span>
          </div>

          {/* Headline */}
          <div style={{ padding: '40px 0 32px', borderBottom: `1px solid ${BORDER}` }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(38px, 4vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: TEXT, margin: 0, maxWidth: 700 }}>
              Transformation<br />
              <span style={{ fontStyle: 'italic', color: MUTED }}>Over Transition.</span>
            </h1>
          </div>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${BORDER}` }}>
            {[
              ['01', 'Strategic Portfolio Alignment', 'Synchronizing enterprise strategy with execution so every Value Stream delivers maximum mission impact and measurable ROI.'],
              ['02', 'High-Velocity Agile Release Trains', 'Launching and optimizing ARTs that move organizations from rigid, siloed planning to continuous, flow-based delivery.'],
              ['03', 'Modernized Governance Frameworks', 'Replacing legacy oversight with Lean-Agile governance that maintains strict compliance while accelerating speed-to-market.'],
            ].map(([num, title, desc], i) => (
              <div key={num} style={{ padding: '24px 28px 24px 0', paddingLeft: i === 0 ? 0 : 28, borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 10, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0' }}>
            <a href="#contact" style={{ background: BG_DARK, color: '#F7F6F2', padding: '12px 30px', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 6 }}>Schedule a Consultation →</a>
            <a href="#competencies" style={{ fontSize: 15, color: MUTED, textDecoration: 'none', borderBottom: `1px solid ${FAINT}`, paddingBottom: 1 }}>View Capabilities</a>
          </div>
        </div>
      </section>


      {/* ── CERTIFICATIONS ── */}
      <section id="certifications" style={{ borderBottom: `1px solid ${BORDER}`, background: BG_ALT }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: `1px solid ${BORDER}`, paddingBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SAGE, marginBottom: 10 }}>SAFe Certification Programs</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.5vw, 34px)', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>AI-Empowered SAFe Certifications</h2>
            </div>
            <a href="/quick-register" style={{ fontSize: 15, color: MUTED, textDecoration: 'none', borderBottom: `1px solid ${FAINT}`, paddingBottom: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>View all & register →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 0 }}>
            {[
              { code: 'SA',   title: 'SAFe Agilist',               role: 'Leadership',     color: SKY,      desc: 'Foundation certification for enterprise agile leaders. Lean-Agile mindset and transformation at scale.' },
              { code: 'SSM',  title: 'SAFe Scrum Master',          role: 'Scrum Master',   color: SAGE,     aiPowered: true, desc: 'Master facilitation, coaching, and servant leadership inside a SAFe enterprise environment.' },
              { code: 'SASM', title: 'SAFe Advanced Scrum Master', role: 'Scrum Master',   color: SAGE,     desc: 'Advanced coaching techniques, patterns, anti-patterns, and ART-level coaching.' },
              { code: 'POPM', title: 'SAFe Product Owner/PM',      role: 'Product Owner',  color: PEACH,    aiPowered: true, desc: 'Master product ownership at scale — vision, roadmaps, and backlog prioritization.' },
              { code: 'SDP',  title: 'SAFe DevOps',                role: 'Technical',      color: LAVENDER, desc: 'Implement DevOps and continuous delivery pipelines to accelerate value delivery.' },
            ].map(({ code, title, role, color, aiPowered, desc }, i) => (
              <div key={code} style={{
                padding: '24px 26px',
                borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none',
                borderRight: (i % 2 === 0) ? `1px solid ${BORDER}` : 'none',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}>
                <div style={{ background: color, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, padding: '6px 11px', borderRadius: 4, letterSpacing: '0.05em', flexShrink: 0, marginTop: 2 }}>{code}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</div>
                    {aiPowered && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', whiteSpace: 'nowrap' }}>✦ AI-Powered</span>}
                  </div>
                  <div style={{ fontSize: 12, color: FAINT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>{role}</div>
                  <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}

            {/* Corporate card */}
            <div style={{ padding: '24px 26px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ background: BG_DARK, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, padding: '6px 11px', borderRadius: 4, letterSpacing: '0.05em', flexShrink: 0, marginTop: 2 }}>CORP</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Corporate Workshop</div>
                <div style={{ fontSize: 12, color: FAINT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Private Cohort</div>
                <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.6 }}>Tailored SAFe training for your entire organization. Custom content, format, and flexible scheduling.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/quick-register" style={{ background: BG_DARK, color: '#F7F6F2', padding: '12px 30px', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 6 }}>Register for a Certification →</a>
            <span style={{ fontSize: 14, color: FAINT }}>All courses include SAFe® exam fee, digital badge, and 1-year membership.</span>
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIATION ── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '48px 56px 48px 0', borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SAGE, marginBottom: 14 }}>Our Differentiation</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 2.5vw, 36px)', color: TEXT, lineHeight: 1.15, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                Your Next Engagement Deserves More Than a Staff Aug.
              </h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 24px' }}>
                Federal and enterprise IT leaders face a consistent problem: consultants who speak Agile but deliver waterfall, cloud architects who migrate data without modernizing workflows, and transformation programs that collapse the moment the contract ends.
              </p>
              <a href="#contact" style={{ display: 'inline-block', background: BG_DARK, color: '#F7F6F2', padding: '12px 30px', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 6 }}>Talk to the Principal →</a>
            </div>
            <div style={{ paddingLeft: 56, paddingTop: 48, paddingBottom: 48 }}>
              {[
                ['Documented Transformation Framework', 'Not a slide deck — a repeatable operating model installed into your delivery structure from day one.'],
                ['GovCon Compliance Fluency', 'Deep familiarity with FISMA, FedRAMP, FAR/DFARS contract structures, and federal acquisition lifecycles.'],
                ['Knowledge Transfer by Design', 'Our engagement model is explicitly designed to reduce reliance on us. Your teams own the outcome.'],
                ['Principal-Led, Always', 'The person who sells the engagement is the person who delivers it. No bait-and-switch.'],
              ].map(([title, desc], i) => (
                <div key={title} style={{ display: 'flex', gap: 14, paddingBottom: i < 3 ? 20 : 0, marginBottom: i < 3 ? 20 : 0, borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: FAINT, fontWeight: 700, minWidth: 20, paddingTop: 2 }}>0{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETENCIES ── */}
      <section id="competencies" style={{ background: BG_ALT, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: `1px solid ${BORDER}`, paddingBottom: 20 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.5vw, 34px)', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Core Competencies</h2>
            <span style={{ fontSize: 12, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Three Practice Areas</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { color: SAGE,     label: 'SAFe Implementation',      items: ['Stand up and sustain Agile Release Trains', 'PI Planning at enterprise scale', 'SAFe Portfolio Management', 'Coach RTE, SM, and PO roles', 'Business Agility KPI reporting'] },
              { color: SKY,      label: 'Cloud-Native Modernization', items: ['AWS migration strategy & execution', 'On-premises to cloud, zero-disruption', 'Legacy Data Mart & ETL modernization', 'DevSecOps pipeline alignment', 'Federal data governance compliance'] },
              { color: LAVENDER, label: 'Agile for Government',       items: ['FISMA, FedRAMP, Section 508', 'Agile within FAR/DFARS structures', 'Sprint cadences aligned to budget cycles', 'PMO reporting without bureaucratic drag', 'Mixed gov/contractor team coaching'] },
            ].map((c, i) => (
              <div key={c.label} style={{ padding: '0 40px 0 0', paddingLeft: i === 0 ? 0 : 40, borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 19, color: TEXT, margin: '0 0 18px', lineHeight: 1.3 }}>{c.label}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {c.items.map(item => (
                    <li key={item} style={{ display: 'flex', gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.5 }}>
                      <span style={{ color: c.color, flexShrink: 0 }}>—</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK ── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: `1px solid ${BORDER}`, paddingBottom: 20 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.5vw, 34px)', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Three Phases. One Sustained Outcome.</h2>
            <span style={{ fontSize: 12, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Optimized Solutions Framework</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { num: '01', phase: 'Assess',    title: 'Clarity Before Commitment',       color: SAGE,     desc: 'A structured assessment covering delivery model, cloud posture, team topology, and compliance environment before we recommend anything.',   deliverable: 'Readiness Report + Transformation Roadmap' },
              { num: '02', phase: 'Implement', title: 'Frameworks That Fit Your Reality', color: SKY,      desc: 'SAFe, cloud migration, and data modernization implemented with your specific constraints — no two environments are identical.',             deliverable: 'Live ARTs · Migrated Workloads · Trained Teams' },
              { num: '03', phase: 'Sustain',   title: 'Independence, Not Dependency',    color: LAVENDER, desc: 'Embedded coaching, documented playbooks, and leadership development that deliberately reduce reliance on us over time.',                  deliverable: 'Coaching Bench · Runbooks · Health Metrics' },
            ].map((p, i) => (
              <div key={p.num} style={{ padding: '0 40px 0 0', paddingLeft: i === 0 ? 0 : 40, borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 44, color: BORDER, fontWeight: 700, lineHeight: 1, marginBottom: 10 }}>{p.num}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: p.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Phase {i + 1} — {p.phase}</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 19, color: TEXT, margin: '0 0 10px', lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 16 }}>{p.desc}</p>
                <div style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 12, background: BG_ALT, padding: '10px 14px', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Deliverable</div>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>{p.deliverable}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" style={{ background: BG_ALT, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'center' }}>
          <div style={{ paddingRight: 64, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ROSE, marginBottom: 14 }}>Ready to Move Forward</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 42px)', color: TEXT, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              From Transition<br /><span style={{ fontStyle: 'italic', color: MUTED }}>to Transformation.</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 8px' }}>
              Whether you're a Prime Contractor evaluating teaming partners, a Government Agency CIO modernizing delivery, or an Enterprise CTO who needs someone who has actually done this inside a federal environment — we should talk.
            </p>
            <p style={{ fontSize: 14, color: FAINT, fontStyle: 'italic', margin: 0 }}>The first conversation is a consultation, not a pitch.</p>
          </div>
          <div style={{ paddingLeft: 64, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="mailto:consulting@optim-sol.com?subject=Strategic Partnership Consultation Request"
              style={{ display: 'block', background: BG_DARK, color: '#F7F6F2', padding: '16px 32px', fontWeight: 700, fontSize: 16, textDecoration: 'none', textAlign: 'center', borderRadius: 6 }}>
              Schedule a Consultation →
            </a>
            <a href="mailto:consulting@optim-sol.com"
              style={{ display: 'block', textAlign: 'center', fontSize: 15, color: MUTED, textDecoration: 'none' }}>
              consulting@optim-sol.com
            </a>
            <p style={{ fontSize: 13, color: FAINT, textAlign: 'center', fontStyle: 'italic', margin: 0 }}>
              Limited engagements per quarter to maintain delivery quality.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: BG_DARK, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Optimized Solutions</span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} · Enterprise Agile & Cloud Modernization ·{' '}
          <Link href="/quick-register" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>AgileEdge Training</Link>
        </p>
      </footer>

    </div>
  );
}
