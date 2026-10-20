import type { Metadata } from 'next';
import Link from 'next/link';
import WorkAccordion from '../../components/work-accordion';
import { workTypes } from '../../work-data';

export const metadata: Metadata = {
  title: 'Types of Work — Your Name, GTM Engineer | Accordion Study',
  description: 'Explore five GTM engineering capabilities in a concise, expandable format.',
};

export default function AccordionWorkPage() {
  return (
    <div className="operating-shell work-site theme-editorial accordion-version">
      <header className="site-header operating-header">
        <Link className="monogram" href="/accordion" aria-label="Go to homepage">YN<span>.</span></Link>
        <nav aria-label="Main navigation">
          <Link href="/accordion#top">Home</Link>
          <Link className="nav-active" href="/accordion/work">Types of Work</Link>
          <Link href="/about?theme=editorial">About</Link>
        </nav>
        <Link className="header-cta" href="/accordion#contact">Let&apos;s talk</Link>
      </header>

      <main>
        <section className="work-index-hero accordion-index-hero">
          <p className="report-kicker">GTM ENGINEERING CAPABILITIES / 05</p>
          <div>
            <h1>Find the constraint. Explore the <em>work.</em></h1>
            <div className="accordion-index-intro"><p>Each section covers the operating problem, business value, representative outputs, working approach, tools, and supporting project. Nothing opens a separate page.</p><span>ONE SECTION OPENS AT A TIME</span></div>
          </div>
        </section>

        <section className="accordion-index-list" aria-label="Expandable types of GTM engineering work">
          <WorkAccordion items={workTypes} />
          <div className="accordion-section-links">
            <Link href="/accordion">Return to Home</Link>
            <a href="/framer-work-types-accordion.csv" download>Download Framer CMS CSV</a>
          </div>
        </section>
      </main>

      <footer className="operating-footer">
        <span>© 2026 YOUR NAME</span>
        <span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span>
        <Link href="/accordion#top">HOME</Link>
      </footer>
    </div>
  );
}
