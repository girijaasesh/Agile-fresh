import CertDetailClient from './CertDetailClient';

const CERT_META = {
  sa:     { title: 'SAFe Agilist (SA) Certification Training', desc: 'Live SAFe Agilist (SA) 6.0 certification training. 16 hours of instructor-led instruction, exam fee included. Lead SAFe transformations with confidence.' },
  ssm:    { title: 'SAFe Scrum Master (SSM) Certification Training', desc: 'Live SAFe Scrum Master (SSM) 6.0 certification. 16 hours of instruction, exam fee included. Master Scrum facilitation in a SAFe enterprise.' },
  sasm:   { title: 'SAFe Advanced Scrum Master (SASM) Certification', desc: 'Advanced Scrum Master training for experienced practitioners. 16 hours live, exam included. Coach teams and ARTs at enterprise scale.' },
  popm:   { title: 'SAFe Product Owner / Product Manager (POPM) Certification', desc: 'SAFe POPM 6.0 live training. 16 hours, exam fee included. Master product ownership and management at enterprise agile scale.' },
  devops: { title: 'SAFe DevOps Practitioner (SDP) Certification Training', desc: 'SAFe DevOps Practitioner 6.0 live training. Build CI/CD pipelines and DevOps culture in a SAFe enterprise. Exam fee included.' },
  rte:    { title: 'SAFe Release Train Engineer (RTE) Certification Training', desc: 'SAFe RTE 6.0 live training. 24 hours of instruction. Become the servant leader of the Agile Release Train. Exam fee included.' },
  spc:    { title: 'SAFe Program Consultant (SPC) Certification Training', desc: 'The most comprehensive SAFe certification. 32 hours live, exam included. Train others in SAFe and lead enterprise transformations.' },
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const meta = CERT_META[id];
  if (!meta) return { title: 'Certification Not Found | AgileEdge' };
  return {
    title: `${meta.title} | AgileEdge`,
    description: meta.desc,
  };
}

export async function generateStaticParams() {
  return Object.keys(CERT_META).map(id => ({ id }));
}

export default async function CertDetailPage({ params }) {
  const { id } = await params;
  return <CertDetailClient certId={id} />;
}
