import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, projects } from '../../portfolio-data';
import { resolveSiteTheme, siteThemeClass, themedHref, type ThemeSearchParams } from '../../site-theme';

type PageProps = { params: Promise<{ slug: string }>; searchParams: ThemeSearchParams };

function WalkthroughVideo() {
  return (
    <div className="report-video" role="img" aria-label="Placeholder for an embedded project walkthrough video">
      <div><span>PROJECT WALKTHROUGH</span><span>03:24 / VIDEO</span></div>
      <button type="button" aria-label="Video placeholder" disabled>PLAY</button>
      <p>CONTEXT / SYSTEM LOGIC / BUSINESS IMPACT</p>
    </div>
  );
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Project not found' };
  return { title: `${project.title} — GTM project`, description: project.summary };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const [{ slug }, theme] = await Promise.all([params, resolveSiteTheme(searchParams)]);
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className={`operating-shell ${siteThemeClass(theme) ?? 'theme-editorial'}`}>
      <header className="site-header operating-header">
        <Link className="monogram" href={themedHref('/', theme)} aria-label="Go to homepage">YN<span>.</span></Link>
        <nav aria-label="Main navigation">
          <Link href={themedHref('/#top', theme)}>Home</Link>
          <Link className="nav-active" href={themedHref(`/solutions#${project.solutionSlug}`, theme)}>Solutions</Link>
          <Link href={themedHref('/about', theme)}>About</Link>
        </nav>
        <Link className="header-cta" href={themedHref('/#contact', theme)}>Let&apos;s talk</Link>
      </header>

      <main className="case-report">
        <section className="case-report-hero">
          <div className="case-report-breadcrumb">
            <Link href={themedHref(`/solutions#${project.solutionSlug}`, theme)}>{project.solutionTitle}</Link>
            <span>CASE STUDY / GTM ENGINEERING</span>
          </div>
          <div className="case-report-grid">
            <div className="case-report-title">
              <p className="report-kicker">REPRESENTATIVE PROJECT</p>
              <h1>{project.title}<em>.</em></h1>
              <p>{project.summary}</p>
              <div className="case-report-actions">
                <a href="#executive-brief">Read executive brief</a>
                <a href="#architecture">Review system flow</a>
              </div>
            </div>
            <WalkthroughVideo />
          </div>
          <div className="case-report-facts">
            <div><span>WORK AREA</span><strong>{project.business}</strong></div>
            <div><span>PRIMARY USERS</span><strong>{project.icp}</strong></div>
            <div><span>TYPE OF WORK</span><strong>{project.solutionTitle}</strong></div>
            <div><span>PRIMARY OUTPUT</span><strong>{project.outcomes[0].value}</strong></div>
          </div>
        </section>

        <section className="executive-brief" id="executive-brief">
          <div className="report-section-heading compact-heading">
            <div><p className="report-kicker">01 / EXECUTIVE BRIEF</p><h2>The operating constraint and the <em>response.</em></h2></div>
            <p>A concise review of the commercial context, the design objective, and the system selected to address it.</p>
          </div>
          <div className="brief-grid">
            <article><span>THE CONSTRAINT</span><h3>What was breaking</h3><p>{project.pain}</p></article>
            <article><span>THE OBJECTIVE</span><h3>What had to change</h3><p>{project.objective}</p></article>
            <article><span>THE RESPONSE</span><h3>What was built</h3><p>{project.approach}</p></article>
          </div>
        </section>

        <section className="architecture-review" id="architecture">
          <div className="architecture-review-copy">
            <p className="report-kicker">02 / SYSTEM ARCHITECTURE</p>
            <h2>From input to owned <em>action.</em></h2>
            <p>{project.approach}</p>
          </div>
          <figure className="architecture-flow">
            <figcaption><span>REFERENCE FLOW</span><span>05 STAGES</span></figcaption>
            <ol>
              {project.architecture.map((step, index) => (
                <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong><i /></li>
              ))}
            </ol>
          </figure>
        </section>

        <section className="outcome-review qualitative-outcomes">
          <div className="report-section-heading compact-heading">
            <div><p className="report-kicker">03 / SOLUTION OUTPUTS</p><h2>What became easier to operate or <em>understand.</em></h2></div>
            <p>These are qualitative outcomes based on the type of work. Add exact measurements only when the verified project detail is available.</p>
          </div>
          <div className="outcome-review-grid">
            {project.outcomes.map((outcome, index) => (
              <article key={outcome.label}>
                <div><span>OUTPUT {String(index + 1).padStart(2, '0')}</span><strong>{outcome.value}</strong></div>
                <h3>{outcome.label}</h3>
                <small>QUALITATIVE RESULT / ADD VERIFIED DETAIL</small>
              </article>
            ))}
          </div>
        </section>

        <section className="case-report-close">
          <div><p className="report-kicker">NEXT REVIEW</p><h2>See the other systems in this practice area.</h2></div>
          <Link href={themedHref(`/solutions#${project.solutionSlug}`, theme)}>BACK TO {project.solutionTitle.toUpperCase()}</Link>
        </section>
      </main>

      <footer className="operating-footer">
        <span>© 2026 YOUR NAME</span>
        <span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span>
        <Link href={themedHref('/', theme)}>HOME</Link>
      </footer>
    </div>
  );
}
