import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjectsForSolution, solutions } from '../portfolio-data';

export const metadata: Metadata = {
  title: 'Solutions — Layout 02',
  description: 'An alternate full-width layout for GTM engineering solutions and sample projects.',
};

export default function AlternateSolutionsPage() {
  return (
    <div className="solutions-shell alt-solutions-shell">
      <header className="site-header solutions-header">
        <Link className="monogram" href="/" aria-label="Go to homepage">OJ<span>.</span></Link>
        <nav aria-label="Main navigation">
          <Link href="/#top">Home</Link>
          <Link className="nav-active" href="/solutions">Solutions</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link className="header-cta" href="/#contact">Let&apos;s talk <span>↗</span></Link>
      </header>

      <main className="solutions-main alt-solutions-main">
        {solutions.map((solution) => {
          const relatedProjects = getProjectsForSolution(solution);

          return (
            <section className={`alt-solution-section solution-${solution.theme}`} id={solution.slug} key={solution.slug}>
              <div className="alt-solution-topline">
                <div className="alt-solution-index">
                  <span>{solution.number} / 03</span>
                  <span>{solution.label}</span>
                </div>
                <p className="kicker">GTM SOLUTION</p>
              </div>

              <div className="alt-solution-hero">
                <h1>{solution.title}<em>.</em></h1>
                <div className="alt-solution-copy">
                  <p className="solution-lede">{solution.summary}</p>
                  <p className="solution-description">{solution.description}</p>
                </div>
              </div>

              <div className="alt-project-band">
                <div className="alt-project-intro">
                  <span>SAMPLE PROJECTS / 02</span>
                  <div className="solution-capabilities" aria-label="Capabilities">
                    {solution.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
                  </div>
                </div>

                {relatedProjects.map((project, index) => (
                  <Link className="alt-project-card" href={`/projects/${project.slug}`} key={project.slug}>
                    <div className="alt-card-topline">
                      <span>PROJECT / {String(index + 1).padStart(2, '0')}</span>
                      <span>↗</span>
                    </div>
                    <h2>{project.title}</h2>
                    <div className="alt-card-bottom">
                      <p>{project.summary}</p>
                      <strong>{project.business}</strong>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="solution-next" aria-hidden="true">
                {solution.number === '03' ? 'END' : 'SCROLL ↓'}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
