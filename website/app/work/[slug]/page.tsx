import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkType, workTypes, type Evidence } from '../../work-data';
import { resolveSiteTheme, siteThemeClass, themedHref, type ThemeSearchParams } from '../../site-theme';

type PageProps = { params: Promise<{ slug: string }>; searchParams: ThemeSearchParams };

function EvidenceCard({ evidence }: { evidence: Evidence }) {
  return (
    <article className="work-evidence-card">
      <div className="evidence-card-heading"><span>{evidence.project}</span><span>DEMONSTRATED WORK</span></div>
      {evidence.videoUrl ? (
        <div className="work-video-frame">
          <iframe src={evidence.videoUrl} title={evidence.title} allowFullScreen />
        </div>
      ) : null}
      <div className="work-evidence-content">
        <h3>{evidence.title}</h3>
        <p>{evidence.summary}</p>
        <div className="evidence-demonstrates">
          <span>WHAT THIS DEMONSTRATES</span>
          <div>{evidence.demonstrates.map((item) => <small key={item}>{item}</small>)}</div>
        </div>
        <div className="evidence-technology">
          <span>TECHNOLOGIES</span>
          <div>{evidence.technologies.map((item) => <small key={item}>{item}</small>)}</div>
        </div>
        {evidence.repositoryUrl || evidence.documentationUrl ? (
          <div className="evidence-links">
            {evidence.repositoryUrl ? <a href={evidence.repositoryUrl}>GitHub repository</a> : null}
            {evidence.documentationUrl ? <a href={evidence.documentationUrl}>Technical documentation</a> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function generateStaticParams() {
  return workTypes.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkType(slug);
  if (!work) return { title: 'Type of work not found' };
  return { title: `${work.title} — GTM Engineering`, description: work.summary };
}

export default async function WorkTypePage({ params, searchParams }: PageProps) {
  const [{ slug }, theme] = await Promise.all([params, resolveSiteTheme(searchParams)]);
  const work = getWorkType(slug);
  if (!work) notFound();

  return (
    <div className={`operating-shell work-site ${siteThemeClass(theme) ?? 'theme-editorial'}`}>
      <header className="site-header operating-header">
        <Link className="monogram" href={themedHref('/', theme)} aria-label="Go to homepage">YN<span>.</span></Link>
        <nav aria-label="Main navigation">
          <Link href={themedHref('/#top', theme)}>Home</Link>
          <Link className="nav-active" href={themedHref('/work', theme)}>Types of Work</Link>
          <Link href={themedHref('/about', theme)}>About</Link>
        </nav>
        <Link className="header-cta" href={themedHref('/#contact', theme)}>Let&apos;s talk</Link>
      </header>

      <main className="work-detail">
        <section className="work-detail-hero">
          <div className="work-detail-breadcrumb"><Link href={themedHref('/work', theme)}>Types of Work</Link><span>{work.number} / 05</span></div>
          <div className="work-detail-hero-grid">
            <div><p className="report-kicker">{work.title} / {work.discipline}</p><h1>{work.outcomeHeadline}<em>.</em></h1></div>
            <div className="work-detail-intro"><p>{work.summary}</p><div>{work.benefits.map((benefit) => <span key={benefit}>{benefit}</span>)}</div></div>
          </div>
        </section>

        <section className="work-overview">
          <div className="work-section-marker"><span>A</span><small>OVERVIEW &amp; BUSINESS VALUE</small></div>
          <div><h2>When companies need <em>this.</em></h2><p>{work.overview}</p></div>
          <aside><span>WHY COMPANIES NEED IT</span><p>{work.businessValue}</p></aside>
        </section>

        <section className="work-deliverables">
          <div className="work-section-heading"><div className="work-section-marker"><span>B</span><small>SPECIFIC WORK I CAN DELIVER</small></div><h2>What I can <em>deliver.</em></h2></div>
          <div className="deliverable-list">
            {work.deliverables.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <div><small>PROBLEM</small><p>{item.problem}</p></div>
                <div><small>BUILD</small><p>{item.build}</p></div>
                <div><small>VALUE</small><p>{item.value}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="work-approach">
          <div className="work-approach-copy">
            <div className="work-section-marker"><span>C</span><small>MY TECHNICAL APPROACH</small></div>
            <h2>How I build <em>it.</em></h2>
            <div className="work-tech-group"><span>RELEVANT TECHNOLOGIES</span><div>{work.technologies.map((item) => <small key={item}>{item}</small>)}</div></div>
          </div>
          <div className="work-approach-flow">
            {work.approach.map((step, index) => (
              <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.detail}</p></div></article>
            ))}
          </div>
          <div className="work-engineering-notes">
            <div><span>ENGINEERING CONSIDERATIONS</span>{work.considerations.map((item) => <small key={item}>{item}</small>)}</div>
            <div><span>VALIDATION</span>{work.validation.map((item) => <small key={item}>{item}</small>)}</div>
          </div>
        </section>

        <section className="work-evidence">
          <div className="work-section-heading"><div className="work-section-marker"><span>D</span><small>DEMONSTRATED WORK</small></div><div><h2>See how the system was designed and <em>built.</em></h2><p>The evidence below shows the source inputs, transformation or workflow logic, validation, outputs, and technical decisions behind this capability.</p></div></div>
          <div className="work-evidence-grid">{work.evidence.map((item) => <EvidenceCard evidence={item} key={`${item.project}-${item.title}`} />)}</div>
        </section>

        <section className="work-resources">
          <div className="work-section-marker"><span>E</span><small>TECHNICAL ARTIFACTS</small></div>
          <div className="work-resource-grid">
            {work.resources.map((resource) => {
              const content = <><span>{resource.kind}</span><h3>{resource.title}</h3><p>{resource.description}</p>{resource.href ? <b>OPEN RESOURCE</b> : null}</>;
              return resource.href ? <a href={resource.href} key={resource.title}>{content}</a> : <article key={resource.title}>{content}</article>;
            })}
          </div>
        </section>

        <section className="work-cta">
          <div className="work-section-marker"><span>F</span><small>START A CONVERSATION</small></div>
          <div><h2>{work.ctaHeadline}</h2><p>{work.ctaText}</p><p>I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as focused project-based work.</p><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a></div>
        </section>
      </main>

      <footer className="operating-footer">
        <span>© 2026 YOUR NAME</span>
        <span>{work.title.toUpperCase()}</span>
        <Link href={themedHref('/work', theme)}>ALL TYPES OF WORK</Link>
      </footer>
    </div>
  );
}
