'use client';
import Image from 'next/image';

const NAVY  = '#1B2A4A';
const GOLD  = '#C9973A';
const CREAM = '#FAFAF8';
const SLATE = '#4A5568';

const CERTIFICATIONS = [
  'SAFe Program Consultant (SPC 6.0)',
  'Release Train Engineer (RTE)',
  'Project Management Professional (PMP)',
  'Certified ScrumMaster (CSM)',
  'SAFe Agilist (SA)',
  'SAFe Scrum Master (SSM)',
  'SAFe Advanced Scrum Master (SASM)',
  'SAFe Product Owner / Product Manager (POPM)',
];

const COMPETENCIES = [
  'SAFe Framework Implementation',
  'Agile Release Train (ART) Facilitation',
  'PI Planning & Execution',
  'Executive & Leadership Coaching',
  'Organizational Change Management',
  'Lean Portfolio Management',
  'DevOps & Continuous Delivery Pipeline',
  'Team & Technical Agility',
  'Business Agility & Value Streams',
  'Scrum, Kanban & XP Practices',
  'OKRs & Metrics-Driven Improvement',
  'Stakeholder Alignment & Communication',
];

const ACHIEVEMENTS = [
  { metric: '50%', label: 'Improvement in delivery predictability across ARTs' },
  { metric: '32%', label: 'Productivity boost for 700+ employees through Lean-Agile transformation' },
  { metric: '40%', label: 'Increase in data accessibility via platform modernization' },
  { metric: '15+', label: 'Years of enterprise agile coaching & leadership' },
];

const EXPERIENCE = [
  {
    role: 'Senior Agile Coach & RTE',
    org: 'Optimized Solutions / PBGC',
    period: 'Nov 2024 – Present',
    points: [
      'Coaching federal agency teams through SAFe transformation and ART standup',
      'Facilitating PI Planning events, ART syncs, and System Demos',
      'Advising senior leadership on Lean portfolio management and value stream alignment',
      'Driving continuous improvement through Inspect & Adapt workshops',
    ],
  },
  {
    role: 'SAFe Program Consultant & Agile Coach',
    org: 'Enterprise Client Engagements',
    period: 'Prior Experience',
    points: [
      'Led SAFe transformations for Fortune 500 organizations across financial services, healthcare, and government sectors',
      'Coached 20+ Agile teams and multiple ARTs simultaneously toward high performance',
      'Delivered SAFe certification training (SPC, RTE, POPM, SSM, SA) to hundreds of practitioners',
      'Established Communities of Practice and Agile Centers of Excellence',
      'Implemented OKR frameworks and metrics dashboards to track business outcomes',
    ],
  },
];

export default function AboutPage() {
  return (
    <main style={{ background: CREAM, minHeight: '100vh', paddingTop: 104 }}>

      {/* Hero */}
      <section style={{ background: NAVY, color: '#fff', padding: '72px 20px 64px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, position: 'relative', width: 220, height: 260, borderRadius: 12, overflow: 'hidden', border: `4px solid ${GOLD}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <Image
              src="/girijaa-photo.png"
              alt="Girijaa Seshachala — Senior Agile Coach"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              priority
            />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 12 }}>About</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontFamily: 'Georgia, serif', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.15 }}>
              Girijaa Seshachala
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 600, margin: '0 0 20px', letterSpacing: 0.3 }}>
              Senior Agile Coach &nbsp;|&nbsp; SAFe SPC &nbsp;|&nbsp; RTE &nbsp;|&nbsp; PMP &nbsp;|&nbsp; CSM
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 540, margin: 0 }}>
              Transforming organizations through Lean-Agile practices — coaching leaders, teams, and Agile Release Trains to peak performance across federal, financial, and enterprise environments.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section style={{ background: '#fff', padding: '52px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
          {ACHIEVEMENTS.map(({ metric, label }) => (
            <div key={metric} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontFamily: 'Georgia, serif', fontWeight: 700, color: GOLD, lineHeight: 1 }}>{metric}</div>
              <div style={{ fontSize: 14, color: SLATE, marginTop: 10, lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About narrative */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>My Story</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontFamily: 'Georgia, serif', color: NAVY, margin: '0 0 28px' }}>
            15+ Years Driving Agile Excellence
          </h2>
          <div style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ margin: 0 }}>
              I'm Girijaa Seshachala — a Senior Agile Coach and SAFe Program Consultant with over 15 years of experience helping organizations navigate complex transformations. My work spans federal government agencies, Fortune 500 companies, and high-growth enterprises, where I've served as coach, trainer, Release Train Engineer, and trusted strategic advisor.
            </p>
            <p style={{ margin: 0 }}>
              My coaching philosophy centers on sustainable change: I don't just introduce frameworks — I embed Lean-Agile thinking into the culture, systems, and leadership mindset of every organization I work with. Whether I'm facilitating a PI Planning event for 200+ people, coaching a C-suite on portfolio management, or working one-on-one with a Scrum Master on team dynamics, I bring both rigor and empathy to every engagement.
            </p>
            <p style={{ margin: 0 }}>
              As founder of <strong>Optimized Solutions</strong>, I now offer SAFe certification training, Agile coaching services, and enterprise transformation consulting — bringing practitioner-grade experience directly to individuals and organizations ready to grow.
            </p>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section style={{ background: '#fff', padding: '60px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>Experience</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontFamily: 'Georgia, serif', color: NAVY, margin: '0 0 40px' }}>
            Where I've Made an Impact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {EXPERIENCE.map((exp) => (
              <div key={exp.role} style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 200, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{exp.period}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginTop: 4 }}>{exp.org}</div>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 14 }}>{exp.role}</div>
                  <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exp.points.map((pt, i) => (
                      <li key={i} style={{ fontSize: 15, color: SLATE, lineHeight: 1.6 }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competencies */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>Expertise</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontFamily: 'Georgia, serif', color: NAVY, margin: '0 0 32px' }}>
            Core Competencies
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {COMPETENCIES.map((c) => (
              <span key={c} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: NAVY, padding: '8px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ background: '#fff', padding: '60px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>Credentials</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontFamily: 'Georgia, serif', color: NAVY, margin: '0 0 32px' }}>
            Certifications
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {CERTIFICATIONS.map((cert) => (
              <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: CREAM, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: NAVY, color: '#fff', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontFamily: 'Georgia, serif', margin: '0 0 16px' }}>
            Ready to Transform Your Organization?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: '0 0 36px', lineHeight: 1.7 }}>
            Whether you're looking for SAFe certification training, executive coaching, or a full-scale Agile transformation partner — let's connect.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/#contact" style={{ background: GOLD, color: '#fff', padding: '14px 32px', borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Let's Talk
            </a>
            <a href="/quick-register" style={{ background: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' }}>
              View Certifications
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
