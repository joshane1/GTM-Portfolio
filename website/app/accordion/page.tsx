import type { Metadata } from 'next';
import Link from 'next/link';
import WorkAccordion from '../components/work-accordion';
import { workTypes } from '../work-data';

export const metadata: Metadata = {
  title: 'Oshane Jackson — GTM Engineer | Accordion Study',
  description: 'A concise, expandable view of GTM engineering capabilities, projects, and working approach.',
};

const evidenceProjects = [
  { title: 'Fiction Cloud Analytics', supports: 'Data modeling · Pipeline analytics', detail: 'SQL, dbt, analytical models, funnel logic, and reporting datasets.' },
  { title: 'Fiction Cloud Clay Enrichment', supports: 'ICP discovery · Enrichment', detail: 'Account discovery, enrichment waterfalls, validation, and CRM-ready output.' },
  { title: 'Lead Scoring System', supports: 'Scoring · Signal activation', detail: 'Fit and engagement signals, transparent weighting, priority bands, and CRM activation logic.' },
];

export default function AccordionHome() {
  return (
    <main className="operating-site work-site capability-home theme-editorial accordion-version">
      <header className="site-header operating-header">
        <a className="monogram" href="#top" aria-label="Back to top">OJ<span>.</span></a>
        <nav aria-label="Main navigation">
          <Link className="nav-active" href="/accordion#top">Home</Link>
          <Link href="/accordion/work">Types of Work</Link>
          <Link href="/about?theme=editorial">About</Link>
        </nav>
        <a className="header-cta" href="#contact">Let&apos;s talk</a>
      </header>

      <section className="capability-hero" id="top">
        <div>
          <p className="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p>
          <h1>I build cleaner data, faster handoffs, and more reliable <em>GTM decisions.</em></h1>
        </div>
        <aside>
          <p>I&apos;m Oshane Jackson, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p>
          <div className="operating-actions"><a className="report-button report-button-primary" href="#types-of-work">Explore types of work</a><a className="report-button" href="#contact">Contact</a></div>
          <small><i /> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small>
        </aside>
      </section>

      <section className="capability-work accordion-work-section" id="types-of-work">
        <div className="capability-section-heading accordion-heading">
          <div><p className="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div>
          <div className="accordion-heading-note"><p>Scan the five areas below, then open the one that matches your current constraint. Each section expands in place; opening another closes the previous one.</p><span>SELECT A ROW TO EXPLORE <i>↓</i></span></div>
        </div>
        <WorkAccordion items={workTypes} />
        <div className="accordion-section-links">
          <Link href="/accordion/work">Open the focused Types of Work page</Link>
          <a href="/framer-work-types-accordion.csv" download>Download Framer CMS CSV</a>
        </div>
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
        <Link href="/about?theme=editorial">MORE ABOUT HOW I WORK</Link>
      </section>

      <section className="operating-contact simple-contact" id="contact">
        <div><p className="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><h2>Hiring for this capability—or need it <em>built?</em></h2><p className="contact-intro">I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as clearly scoped project work.</p></div>
        <div className="contact-review"><a href="https://www.linkedin.com/in/oshane-jackson/" rel="noreferrer" target="_blank">Connect on LinkedIn</a><div><span>REMOTE</span><a href="https://github.com/joshane1/GTM-Portfolio" rel="noreferrer" target="_blank">GITHUB</a></div></div>
      </section>

      <footer className="operating-footer"><span>© 2026 OSHANE JACKSON</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="#top">BACK TO TOP</a></footer>
    </main>
  );
}
