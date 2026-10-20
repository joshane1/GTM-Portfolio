import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveSiteTheme, siteThemeClass, themedHref, type ThemeSearchParams } from '../site-theme';

export const metadata: Metadata = {
  title: 'About — Your Name, GTM Engineer',
  description: 'How I connect commercial context to technical execution across revenue operations, data, analytics, and automation.',
};

const principles = [
  ['01', 'Start with the constraint', 'Find the operational bottleneck before choosing the workflow, model, or tool.'],
  ['02', 'Build the smallest useful system', 'Ship a focused first version, make the result visible, and learn from real usage.'],
  ['03', 'Design for the operator', 'A system only creates leverage when the people using it can understand and trust it.'],
  ['04', 'Compound what works', 'Turn proven workflows into durable infrastructure that improves as the team grows.'],
];

const coverage = [
  ['Commercial context', 'DISCOVERY / REQUIREMENTS'],
  ['System design', 'LOGIC / DATA / GOVERNANCE'],
  ['Technical delivery', 'BUILD / QA / DOCUMENTATION'],
  ['Operational handoff', 'ENABLEMENT / FEEDBACK'],
];

type PageProps = { searchParams: ThemeSearchParams };

export default async function AboutPage({ searchParams }: PageProps) {
  const theme = await resolveSiteTheme(searchParams);

  return (
    <div className={`operating-shell ${siteThemeClass(theme) ?? 'theme-editorial'}`}>
      <header className="site-header operating-header">
        <Link className="monogram" href={themedHref('/#top', theme)} aria-label="Go to homepage">YN<span>.</span></Link>
        <nav aria-label="Main navigation">
          <Link href={themedHref('/#top', theme)}>Home</Link>
          <Link href={themedHref('/work', theme)}>Types of Work</Link>
          <Link className="nav-active" href={themedHref('/about', theme)}>About</Link>
        </nav>
        <Link className="header-cta" href={themedHref('/#contact', theme)}>Let&apos;s talk</Link>
      </header>

      <main className="about-report" id="top">
        <section className="about-report-intro">
          <div className="about-report-copy">
            <p className="report-kicker">ABOUT / GTM ENGINEER</p>
            <h1>I connect commercial context to technical <em>execution.</em></h1>
            <p className="about-report-lede">I&apos;m a GTM Engineer and GTM Analytics Engineer working across revenue operations, data, analytics, and automation.</p>
            <p>I help teams move from an operating problem to a dependable system: clarifying the decision or workflow, defining the technical requirements, building and validating the solution, and documenting it for the people who will own it.</p>
            <div className="about-report-meta">
              <div><span>WORKING RANGE</span><strong>Discovery → delivery</strong></div>
              <div><span>PRIMARY FOCUS</span><strong>Data, analytics &amp; automation</strong></div>
              <div><span>TEAM FIT</span><strong>RevOps · GTM · Data</strong></div>
            </div>
          </div>
          <figure className="report-portrait" role="img" aria-label="Your Name profile monogram">
            <div><span>GTM ENGINEERING</span><span>PROFILE</span></div>
            <strong>YN</strong>
            <figcaption>Revenue systems · Analytics engineering · Workflow automation</figcaption>
          </figure>
        </section>

        <section className="about-operating-review">
          <div className="about-principle-review">
            <div className="report-panel-heading"><span>OPERATING PRINCIPLES</span><span>04</span></div>
            {principles.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <div><h2>{title}</h2><p>{copy}</p></div>
              </article>
            ))}
          </div>
          <aside className="about-coverage-review">
            <div className="report-panel-heading"><span>WHAT I BRING TO A TEAM</span><span>01–04</span></div>
            {coverage.map(([title, detail], index) => (
              <div key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            ))}
            <Link href={themedHref('/work', theme)}>REVIEW THE WORK</Link>
          </aside>
        </section>

        <section className="about-ready-cta">
          <p className="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p>
          <div>
            <h2>Need someone who can move from GTM problem to working <em>system?</em></h2>
            <p>I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as focused project work across data, analytics, enrichment, automation, and scoring.</p>
            <a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a>
          </div>
        </section>
      </main>

      <footer className="operating-footer">
        <span>© 2026 YOUR NAME</span>
        <span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span>
        <Link href={themedHref('/#top', theme)}>HOME</Link>
      </footer>
    </div>
  );
}
