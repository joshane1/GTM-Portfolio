import Link from 'next/link';
import { workTypes } from './work-data';
import { resolveSiteTheme, siteThemeClass, themedHref, type ThemeSearchParams } from './site-theme';

const evidenceProjects = [
  { title: 'Fiction Cloud Analytics', supports: 'Data modeling · Pipeline analytics', detail: 'SQL, dbt, analytical models, funnel logic, and reporting datasets.' },
  { title: 'Fiction Cloud Clay Enrichment', supports: 'ICP discovery · Enrichment', detail: 'Account discovery, enrichment waterfalls, validation, and CRM-ready output.' },
  { title: 'Lead Scoring System', supports: 'Scoring · Signal activation', detail: 'Fit and engagement signals, transparent weighting, priority bands, and CRM activation logic.' },
];

type PageProps = { searchParams: ThemeSearchParams };

export default async function Home({ searchParams }: PageProps) {
  const theme = await resolveSiteTheme(searchParams);

  return (
    <main className={`operating-site work-site capability-home ${siteThemeClass(theme) ?? 'theme-editorial'}`}>
      <header className="site-header operating-header">
        <a className="monogram" href="#top" aria-label="Back to top">YN<span>.</span></a>
        <nav aria-label="Main navigation">
          <Link className="nav-active" href={themedHref('/#top', theme)}>Home</Link>
          <Link href={themedHref('/work', theme)}>Types of Work</Link>
          <Link href={themedHref('/about', theme)}>About</Link>
        </nav>
        <a className="header-cta" href="#contact">Let&apos;s talk</a>
      </header>

      <section className="capability-hero" id="top">
        <div>
          <p className="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p>
          <h1>I build cleaner data, faster handoffs, and more reliable <em>GTM decisions.</em></h1>
        </div>
        <aside>
          <p>I&apos;m Your Name, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p>
          <div className="operating-actions"><a className="report-button report-button-primary" href="#types-of-work">Explore types of work</a><a className="report-button" href="#contact">Contact</a></div>
          <small><i /> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small>
        </aside>
      </section>

      <section className="capability-work" id="types-of-work">
        <div className="capability-section-heading">
          <div><p className="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div>
          <p>My work focuses on specific revenue-system constraints—from unreliable data and unclear pipeline performance to manual lead handling and underused buying signals.</p>
        </div>
        <div className="capability-card-grid">
          {workTypes.map((work) => (
            <Link className="capability-card" href={themedHref(`/work/${work.slug}`, theme)} key={work.slug}>
              <div><span>{work.number}</span><small>{work.discipline}</small></div>
              <h3>{work.title}</h3>
              <p>{work.summary}</p>
              <ul>{work.deliverables.slice(0, 3).map((item) => <li key={item.title}>{item.title}</li>)}</ul>
              <b>VIEW TYPE OF WORK</b>
            </Link>
          ))}
        </div>
        <Link className="capability-index-link" href={themedHref('/work', theme)}>View the complete Types of Work index</Link>
      </section>

      <section className="capability-evidence">
        <div className="capability-evidence-heading">
          <p className="report-kicker">SELECTED TECHNICAL EVIDENCE</p>
          <div><h2>See how the systems were designed and <em>built.</em></h2><p>These projects demonstrate the models, workflows, validation logic, and technical decisions behind the capabilities above.</p></div>
        </div>
        <div className="evidence-library-grid">
          {evidenceProjects.map((project, index) => (
            <article key={project.title}>
              <span>PROJECT {String(index + 1).padStart(2, '0')}</span>
              <h3>{project.title}</h3>
              <small>{project.supports}</small>
              <p>{project.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="simple-about capability-about">
        <p className="report-kicker">HOW I WORK</p>
        <div><h2>I connect commercial context to technical <em>execution.</em></h2><p>I work from the business constraint to the data model, workflow, or analytical system needed to resolve it—then make the result clear enough for operators to trust, maintain, and improve.</p></div>
        <Link href={themedHref('/about', theme)}>MORE ABOUT HOW I WORK</Link>
      </section>

      <section className="operating-contact simple-contact" id="contact">
        <div><p className="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><h2>Hiring for this capability—or need it <em>built?</em></h2><p className="contact-intro">I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as clearly scoped project work.</p></div>
        <div className="contact-review"><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a><div><span>YOUR CITY · OPEN TO REMOTE</span><a href="#">LINKEDIN</a><a href="#">GITHUB</a></div></div>
      </section>

      <footer className="operating-footer"><span>© 2026 YOUR NAME</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="#top">BACK TO TOP</a></footer>
    </main>
  );
}
