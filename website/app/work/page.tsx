import type { Metadata } from 'next';
import Link from 'next/link';
import { workTypes } from '../work-data';
import { resolveSiteTheme, siteThemeClass, themedHref, type ThemeSearchParams } from '../site-theme';

export const metadata: Metadata = {
  title: 'Types of Work — Your Name, GTM Engineer',
  description: 'Five ways I help GTM teams operate better across data, analytics, enrichment, automation, and scoring.',
};

type PageProps = { searchParams: ThemeSearchParams };

export default async function WorkIndexPage({ searchParams }: PageProps) {
  const theme = await resolveSiteTheme(searchParams);

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

      <main>
        <section className="work-index-hero">
          <p className="report-kicker">GTM ENGINEERING CAPABILITIES / 05</p>
          <div>
            <h1>Five ways I help GTM teams operate <em>better.</em></h1>
            <p>Each capability addresses a specific operating constraint and defines the deliverables, technical approach, validation, and evidence needed to evaluate the work.</p>
          </div>
        </section>

        <section className="work-index-list" aria-label="Types of GTM engineering work">
          {workTypes.map((work) => (
            <Link className="work-index-card" href={themedHref(`/work/${work.slug}`, theme)} key={work.slug}>
              <div className="work-index-number"><span>{work.number}</span><small>{work.discipline}</small></div>
              <div className="work-index-main"><h2>{work.title}</h2><p>{work.summary}</p></div>
              <div className="work-index-deliverables">
                <span>SELECT DELIVERABLES</span>
                {work.deliverables.slice(0, 3).map((item) => <small key={item.title}>{item.title}</small>)}
              </div>
              <b>VIEW TYPE OF WORK</b>
            </Link>
          ))}
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
