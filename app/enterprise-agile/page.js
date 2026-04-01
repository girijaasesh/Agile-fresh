import Link from 'next/link';

export const metadata = {
  title: 'Enterprise Agile Implementation Partner | Optim-Soln',
  description: 'Optim-Soln partners with Prime Contractors and Government Agencies on SAFe transformations, AWS cloud migrations, and data modernization.',
};

const NAV_H = 60;

export default function EnterpriseAgilePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: '#FAFAF8', color: '#111', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(250,250,248,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #DDD', height: NAV_H, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#111', fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>Optim-Soln</Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/quick-register" style={{ color: '#666', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Training</Link>
            <Link href="/articles" style={{ color: '#666', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Knowledge Hub</Link>
            <a href="#contact" style={{ background: '#111', color: '#FAFAF8', padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderRadius: 3 }}>Let's Talk</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: NAV_H, background: '#F5F3EE', borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>

          {/* Label */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid #DDD' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', border: '1px solid #C5C1BA', padding: '4px 12px', borderRadius: 3, background: '#EAE7E0' }}>Enterprise Agile & Cloud</span>
          </div>

          {/* Headline */}
          <div style={{ padding: '40px 0 32px', borderBottom: '1px solid #DDD' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#111', margin: 0, maxWidth: 700 }}>
              Transformation<br />
              <span style={{ fontStyle: 'italic', color: '#555' }}>Over Transition.</span>
            </h1>
          </div>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #DDD' }}>
            {[
              ['01', 'Strategic Portfolio Alignment', 'Synchronizing enterprise strategy with execution so every Value Stream delivers maximum mission impact and measurable ROI.'],
              ['02', 'High-Velocity Agile Release Trains', 'Launching and optimizing ARTs that move organizations from rigid, siloed planning to continuous, flow-based delivery.'],
              ['03', 'Modernized Governance Frameworks', 'Replacing legacy oversight with Lean-Agile governance that maintains strict compliance while accelerating speed-to-market.'],
            ].map(([num, title, desc], i) => (
              <div key={num} style={{ padding: '24px 28px 24px 0', paddingLeft: i === 0 ? 0 : 28, borderLeft: i > 0 ? '1px solid #DDD' : 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0' }}>
            <a href="#contact" style={{ background: '#111', color: '#FAFAF8', padding: '11px 28px', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 3 }}>Schedule a Consultation →</a>
            <a href="#competencies" style={{ fontSize: 13, color: '#666', textDecoration: 'none', borderBottom: '1px solid #AAA', paddingBottom: 1 }}>View Capabilities</a>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <section style={{ borderBottom: '2px solid #111', background: '#111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {[['SPC · PMP · CSM', 'Principal Credentials'], ['SAFe · AWS · DevSecOps', 'Core Frameworks'], ['GovCon & Enterprise', 'Sectors Served']].map(([val, label], i) => (
            <div key={label} style={{ flex: 1, padding: '20px 28px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingLeft: i === 0 ? 0 : 28 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#FAFAF8', fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIFFERENTIATION ── */}
      <section style={{ borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '48px 56px 48px 0', borderRight: '1px solid #E5E5E5' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAA', marginBottom: 14 }}>Our Differentiation</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.5vw, 34px)', color: '#111', lineHeight: 1.15, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                Your Next Engagement Deserves More Than a Staff Aug.
              </h2>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, margin: '0 0 24px' }}>
                Federal and enterprise IT leaders face a consistent problem: consultants who speak Agile but deliver waterfall, cloud architects who migrate data without modernizing workflows, and transformation programs that collapse the moment the contract ends.
              </p>
              <a href="#contact" style={{ display: 'inline-block', background: '#111', color: '#FAFAF8', padding: '11px 28px', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 3 }}>Talk to the Principal →</a>
            </div>
            <div style={{ paddingLeft: 56, paddingTop: 48, paddingBottom: 48 }}>
              {[
                ['Documented Transformation Framework', 'Not a slide deck — a repeatable operating model installed into your delivery structure from day one.'],
                ['GovCon Compliance Fluency', 'Deep familiarity with FISMA, FedRAMP, FAR/DFARS contract structures, and federal acquisition lifecycles.'],
                ['Knowledge Transfer by Design', 'Our engagement model is explicitly designed to reduce reliance on us. Your teams own the outcome.'],
                ['Principal-Led, Always', 'The person who sells the engagement is the person who delivers it. No bait-and-switch.'],
              ].map(([title, desc], i) => (
                <div key={title} style={{ display: 'flex', gap: 14, paddingBottom: i < 3 ? 18 : 0, marginBottom: i < 3 ? 18 : 0, borderBottom: i < 3 ? '1px solid #EBEBEB' : 'none' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#CCC', fontWeight: 700, minWidth: 20, paddingTop: 2 }}>0{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#888', lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETENCIES ── */}
      <section id="competencies" style={{ background: '#111', borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 20 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#FAFAF8', margin: 0, letterSpacing: '-0.01em' }}>Core Competencies</h2>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Three Practice Areas</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { color: '#C9A84C', label: 'SAFe Implementation', items: ['Stand up and sustain Agile Release Trains', 'PI Planning at enterprise scale', 'SAFe Portfolio Management', 'Coach RTE, SM, and PO roles', 'Business Agility KPI reporting'] },
              { color: '#60A5FA', label: 'Cloud-Native Modernization', items: ['AWS migration strategy & execution', 'On-premises to cloud, zero-disruption', 'Legacy Data Mart & ETL modernization', 'DevSecOps pipeline alignment', 'Federal data governance compliance'] },
              { color: '#34D399', label: 'Agile for Government', items: ['FISMA, FedRAMP, Section 508', 'Agile within FAR/DFARS structures', 'Sprint cadences aligned to budget cycles', 'PMO reporting without bureaucratic drag', 'Mixed gov/contractor team coaching'] },
            ].map((c, i) => (
              <div key={c.label} style={{ padding: '0 40px 0 0', paddingLeft: i === 0 ? 0 : 40, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ width: 28, height: 3, background: c.color, marginBottom: 18 }} />
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#FAFAF8', margin: '0 0 18px', lineHeight: 1.3 }}>{c.label}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c.items.map(item => (
                    <li key={item} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
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
      <section style={{ borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: '1px solid #E5E5E5', paddingBottom: 20 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Three Phases. One Sustained Outcome.</h2>
            <span style={{ fontSize: 10, color: '#AAA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Optim-Soln Framework</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { num: '01', phase: 'Assess', title: 'Clarity Before Commitment', color: '#C9A84C', desc: 'A structured assessment covering delivery model, cloud posture, team topology, and compliance environment before we recommend anything.', deliverable: 'Readiness Report + Transformation Roadmap' },
              { num: '02', phase: 'Implement', title: 'Frameworks That Fit Your Reality', color: '#60A5FA', desc: 'SAFe, cloud migration, and data modernization implemented with your specific constraints — no two environments are identical.', deliverable: 'Live ARTs · Migrated Workloads · Trained Teams' },
              { num: '03', phase: 'Sustain', title: 'Independence, Not Dependency', color: '#34D399', desc: 'Embedded coaching, documented playbooks, and leadership development that deliberately reduce reliance on us over time.', deliverable: 'Coaching Bench · Runbooks · Health Metrics' },
            ].map((p, i) => (
              <div key={p.num} style={{ padding: '0 40px 0 0', paddingLeft: i === 0 ? 0 : 40, borderLeft: i > 0 ? '1px solid #E5E5E5' : 'none' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#EBEBEB', fontWeight: 700, lineHeight: 1, marginBottom: 10 }}>{p.num}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Phase {i + 1} — {p.phase}</div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#111', margin: '0 0 10px', lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: '#777', lineHeight: 1.75, marginBottom: 16 }}>{p.desc}</p>
                <div style={{ borderTop: '2px solid #111', paddingTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Deliverable</div>
                  <div style={{ fontSize: 12, color: '#111', fontWeight: 600 }}>{p.deliverable}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" style={{ background: '#F5F3EE', borderBottom: '2px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'center' }}>
          <div style={{ paddingRight: 64, borderRight: '1px solid #DDD' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAA', marginBottom: 14 }}>Ready to Move Forward</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3vw, 40px)', color: '#111', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              From Transition<br /><span style={{ fontStyle: 'italic', color: '#555' }}>to Transformation.</span>
            </h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, margin: '0 0 8px' }}>
              Whether you're a Prime Contractor evaluating teaming partners, a Government Agency CIO modernizing delivery, or an Enterprise CTO who needs someone who has actually done this inside a federal environment — we should talk.
            </p>
            <p style={{ fontSize: 12, color: '#AAA', fontStyle: 'italic', margin: 0 }}>The first conversation is a consultation, not a pitch.</p>
          </div>
          <div style={{ paddingLeft: 64, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="mailto:consulting@optim-sol.com?subject=Strategic Partnership Consultation Request"
              style={{ display: 'block', background: '#111', color: '#FAFAF8', padding: '15px 32px', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center', borderRadius: 3 }}>
              Schedule a Consultation →
            </a>
            <a href="mailto:consulting@optim-sol.com"
              style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#999', textDecoration: 'none' }}>
              consulting@optim-sol.com
            </a>
            <p style={{ fontSize: 11, color: '#CCC', textAlign: 'center', fontStyle: 'italic', margin: 0 }}>
              Limited engagements per quarter to maintain delivery quality.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Optim-Soln</span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          © {new Date().getFullYear()} · Enterprise Agile & Cloud Modernization ·{' '}
          <Link href="/enterprise-agile" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>AgileEdge Training</Link>
        </p>
      </footer>

    </div>
  );
}
