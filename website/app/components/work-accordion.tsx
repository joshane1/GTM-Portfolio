'use client';

import { useId, useState } from 'react';
import type { WorkType } from '../work-data';

type WorkAccordionProps = {
  items: WorkType[];
  label?: string;
};

export default function WorkAccordion({ items, label = 'Types of GTM engineering work' }: WorkAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const instanceId = useId().replaceAll(':', '');

  return (
    <div className="work-accordion" aria-label={label}>
      {items.map((work) => {
        const isOpen = openSlug === work.slug;
        const panelId = `${instanceId}-${work.slug}`;
        const evidence = work.evidence[0];
        const githubUrl = evidence?.repositoryUrl ?? 'https://github.com/yourusername';

        return (
          <article className={`work-accordion-item${isOpen ? ' is-open' : ''}`} key={work.slug}>
            <h3>
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="work-accordion-trigger"
                onClick={() => setOpenSlug(isOpen ? null : work.slug)}
                type="button"
              >
                <span className="work-accordion-identity">
                  <strong>{work.number}</strong>
                  <small>{work.discipline}</small>
                </span>
                <span className="work-accordion-title">
                  <strong>{work.title}</strong>
                  <span>{work.summary}</span>
                </span>
                <span className="work-accordion-deliverables">
                  <small>SELECT DELIVERABLES</small>
                  {work.deliverables.slice(0, 3).map((deliverable) => <span key={deliverable.title}>{deliverable.title}</span>)}
                </span>
                <span className="work-accordion-action" aria-hidden="true">
                  <small>{isOpen ? 'Close' : 'Explore'}</small>
                  <i />
                </span>
              </button>
            </h3>

            <div className="work-accordion-panel" id={panelId} aria-hidden={!isOpen}>
              <div className="work-accordion-panel-inner">
                <div className="work-accordion-compact">
                  <div className="work-accordion-value">
                    <span>WHY IT MATTERS</span>
                    <h4>{work.outcomeHeadline}</h4>
                    <p>{work.businessValue}</p>
                  </div>
                  <div className="work-accordion-manager-view">
                    <span>WHAT A GTM LEADER GETS</span>
                    <ul>{work.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
                  </div>
                  <div className="work-accordion-evidence">
                    <span>PROJECT EVIDENCE</span>
                    <h5>{evidence?.project ?? 'Representative project'}</h5>
                    <p>{evidence?.summary}</p>
                    <div>{work.technologies.slice(0, 4).map((technology) => <small key={technology}>{technology}</small>)}</div>
                    <a href={githubUrl} rel="noreferrer" target="_blank">View project on GitHub <b>↗</b></a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
