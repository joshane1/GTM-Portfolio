import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const outputDir = path.join(projectDir, 'handoff', 'GTM-Portfolio-Netlify-Drop');
const singlePageOutputDir = path.join(projectDir, 'handoff', 'GTM-Portfolio-Single-Page');

async function importTypeScript(relativePath) {
  const source = await fs.readFile(path.join(projectDir, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

const { workTypes } = await importTypeScript('app/work-data.ts');

const engagementTypes = [
  'Full-time — GTM Engineer',
  'Full-time — GTM Analytics Engineer',
  'Contract — GTM Engineer',
  'Contract — GTM Analytics Engineer',
  'General conversation',
];

// [label, work-data slug] — the slug lets "Discuss this capability" preselect the matching chip.
const inquiryAreas = [
  ['GTM data modeling & data quality', 'gtm-data-modeling'],
  ['Pipeline & funnel analytics', 'sales-pipeline-analytics'],
  ['ICP discovery & enrichment', 'icp-discovery-enrichment'],
  ['Lead qualification & automation', 'lead-qualification-automation'],
  ['Lead scoring & signal activation', 'lead-scoring-activation'],
  ['Still defining the need', ''],
];
// Accordion inquiry prompts, keyed by the same work-data slug as `inquiryAreas`, so each
// "Start an inquiry" button selects the matching Areas of inquiry chip.
const capabilityInquiries = {
  'gtm-data-modeling': {
    heading: 'Need a stronger GTM data foundation?',
    message: 'Let’s discuss the reporting, integration, or data-quality problem you’re working through.',
  },
  'sales-pipeline-analytics': {
    heading: 'Need a clearer view of your pipeline?',
    message: 'Let’s discuss the conversion, velocity, or coverage questions slowing down your forecast.',
  },
  'icp-discovery-enrichment': {
    heading: 'Need better-fit accounts to target?',
    message: 'Let’s discuss how you define your ICP and where your account data is incomplete or unreliable.',
  },
  'lead-qualification-automation': {
    heading: 'Need faster, more consistent lead handling?',
    message: 'Let’s discuss the qualification, routing, or handoff steps that still depend on manual work.',
  },
  'lead-scoring-activation': {
    heading: 'Need your team focused on the right leads?',
    message: 'Let’s discuss the fit and buying signals that should shape how your reps prioritize.',
  },
};

let css = await fs.readFile(path.join(projectDir, 'app/globals.css'), 'utf8');
css = css.replace("@import 'tailwindcss';", '');

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const header = (active, aboutHref = '/about/') => `<header class="site-header operating-header">
  <a class="monogram" href="/" aria-label="Go to Home">OJ<span>.</span></a>
  <nav aria-label="Main navigation">
    <a class="${active === 'home' ? 'nav-active' : ''}" href="/">Home</a>
    <a href="/#types-of-work">Types of Work</a>
    <a class="${active === 'about' ? 'nav-active' : ''}" href="${aboutHref}">About Me</a>
  </nav>
  <a class="header-cta" href="/#contact">Let&apos;s talk</a>
</header>`;

const footer = () => `<footer class="operating-footer"><span>© 2026 OSHANE JACKSON</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="/">HOME</a></footer>`;

function accordion(items) {
  return `<div class="work-accordion" aria-label="Types of GTM engineering work">${items.map((work) => {
    const inquiry = capabilityInquiries[work.slug];
    const panelId = `capability-${work.slug}`;
    return `<article class="work-accordion-item">
      <h3><button aria-controls="${panelId}" aria-expanded="false" class="work-accordion-trigger" id="${panelId}-trigger" type="button">
        <span class="work-accordion-identity"><strong>${esc(work.number)}</strong><small>${esc(work.discipline)}</small></span>
        <span class="work-accordion-title"><strong>${esc(work.title)}</strong><span>${esc(work.summary)}</span></span>
        <span class="work-accordion-deliverables"><small>SELECT DELIVERABLES</small>${work.deliverables.slice(0, 3).map((item) => `<span>${esc(item.title)}</span>`).join('')}</span>
        <span class="work-accordion-action" aria-hidden="true"><small>Explore</small><i></i></span>
      </button></h3>
      <div class="work-accordion-panel" id="${panelId}" role="region" aria-labelledby="${panelId}-trigger" aria-hidden="true"><div class="work-accordion-panel-inner"><div class="work-accordion-inquiry">
        <div><h4>${esc(inquiry.heading)}</h4><p>${esc(inquiry.message)}</p></div>
        <a class="work-inquiry-link" href="#inquiry-form" data-area="${esc(work.slug)}">Start an inquiry <b aria-hidden="true">→</b></a>
      </div></div></div>
    </article>`;
  }).join('')}</div>`;
}

const projectWriteups = [
  {
    number: '01',
    eyebrow: 'ACCOUNT DISCOVERY',
    title: 'Build a Target-Account List That Matches the ICP',
    summary: 'A Clay workbook that finds ICP-fit companies in the US and UK, enriches only the missing facts, and labels every account with a segment, region, and fit decision before routing.',
    tags: ['Clay', 'ICP', 'Enrichment', 'Segmentation'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/docs/1_account_discovery.md',
  },
  {
    number: '02',
    eyebrow: 'WORKFLOW AUTOMATION',
    title: 'Route the Right Accounts to the Right Reps—Automatically',
    summary: 'An explainable Clay-to-n8n-to-HubSpot workflow that routes enriched accounts into six sales lanes, preserves clean ownership logic, and sends incomplete records to review.',
    tags: ['n8n', 'Clay', 'HubSpot', 'Routing logic'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/docs/2_account_routing.md',
  },
  {
    number: '03',
    eyebrow: 'ANALYTICS ENGINEERING',
    title: 'Enable Trustworthy Reporting With a Tested CRM Data Model',
    summary: 'A typed, connected, and tested CRM data foundation built with SQL and dbt—including historical reporting logic, relationship checks, and 89 automated tests.',
    tags: ['dbt', 'SQL', 'CRM modeling', 'Data quality'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/docs/3_data_modeling.md',
  },
  {
    number: '04',
    eyebrow: 'REVENUE ANALYTICS',
    title: 'Turn Funnel and Pipeline Data Into Decisions Leaders Can Trust',
    summary: 'A decision-focused analysis of conversion, channel contribution, pipeline definitions, velocity, bookings, and revenue—organized around eight recurring GTM questions.',
    tags: ['Funnel analytics', 'Pipeline', 'Metric definitions'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/docs/4_funnel_analytics.md',
  },
];

const aboutRoles = [
  {
    article: 'a',
    name: 'builder',
    tagline: 'I turn ideas into systems.',
    body: 'This involves breaking down high-level goals into actionable requirements, identifying resource and technical requirements, and architecting solutions. This work spans data models, API connections, workflow automation, analytical processes, and systems built from the ground up. I move between understanding the problem and building the solution.',
  },
  {
    article: 'an',
    name: 'analyst',
    tagline: 'I use the data to tell the story.',
    body: 'As an analyst, I continually test assumptions, identify discrepancies, uncover meaningful insights, and clearly communicate findings to support sound decision-making. Understanding what a number means, how it was produced, and whether it supports the decision being made guides both my technical work and business decisions.',
  },
  {
    article: 'an',
    name: 'entrepreneur',
    tagline: 'I never run out of ideas.',
    body: 'I have pursued businesses in technology, agriculture, and services, adapting to different markets and changing countries to pursue new opportunities. Across these ventures, I have evaluated customer needs, operating requirements, resource constraints, and commercial viability. As an entrepreneur, I remain willing to take calculated risks and change direction when circumstances require it.',
  },
  {
    article: 'an',
    name: 'operator',
    tagline: 'I run the systems I build.',
    body: 'As an operator, I map processes, identify bottlenecks, standardize repeatable work, and automate tasks where technology creates meaningful leverage. I define controls and measures of success so that a system can be evaluated and improved after implementation.',
  },
  {
    article: 'a',
    name: 'technologist',
    tagline: 'I am always looking for a better way.',
    body: 'As a technologist, I design experiments, build prototypes, compare approaches, and evaluate how emerging capabilities behave under real conditions. AI is central to this process. I use it for research, analysis, software development, structured evaluation, and automation while designing the data, validation, and operational controls around it.',
  },
];

const projectWriteupCards = () => projectWriteups.map((project) => `<a class="project-writeup-card" href="${esc(project.href)}" target="_blank" rel="noreferrer" aria-label="Read the write-up on GitHub: ${esc(project.title)}">
  <div class="project-writeup-meta"><span>PROJECT ${esc(project.number)}</span><small>FICTION CLOUD SIMULATION</small></div>
  <p class="project-writeup-eyebrow">${esc(project.eyebrow)}</p>
  <h3>${esc(project.title)}</h3>
  <p class="project-writeup-summary">${esc(project.summary)}</p>
  <div class="project-writeup-tags">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
  <strong>Read the write-up on GitHub <b>↗</b></strong>
</a>`).join('');

const sharedHead = (title, description) => `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><style>${css}
html,body{width:100%;min-height:100%;margin:0;background:#f4f0e6;scroll-behavior:smooth}
body{overflow-x:hidden}
.about-glance{padding:clamp(3.5rem,6vw,6rem) 6vw clamp(2.5rem,3.5vw,3.5rem);display:grid;align-items:center;background:#fbf8f1}
.about-glance-grid{width:100%;max-width:1480px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(330px,430px);gap:clamp(3rem,7vw,8rem);align-items:start}
.about-glance-copy{display:flex;flex-direction:column;justify-content:center}
.about-glance-copy h1{max-width:900px;margin:1rem 0 1.6rem;font:500 clamp(3.2rem,5.9vw,6.4rem)/.9 Georgia,'Times New Roman',serif;letter-spacing:-.065em}
.about-glance-copy h1 em{color:var(--accent-deep);font-weight:inherit}
.about-glance-lede{max-width:760px;margin:0;color:var(--ink);font-size:clamp(1.15rem,1.65vw,1.55rem);line-height:1.5}
.about-glance-support{max-width:720px;margin:1.1rem 0 0;color:var(--muted);line-height:1.7}
.about-glance-experience{max-width:760px;margin:1.1rem 0 0;color:var(--muted);line-height:1.7}
.about-glance-experience strong{color:var(--ink);font-weight:600}
.about-glance-capabilities{max-width:820px;margin:2rem 0 0;padding:1.2rem 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);color:var(--muted);font-size:.88rem;line-height:1.65}
.about-glance-capabilities span{display:block;margin-bottom:.4rem;color:var(--accent-deep);font:700 .64rem/1.3 'Courier New',monospace;letter-spacing:.07em;text-transform:uppercase}
.about-glance-facts{max-width:820px;margin-top:2rem;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-left:1px solid var(--line)}
.about-glance-facts div{min-height:110px;padding:1rem;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between}
.about-glance-facts span{color:var(--muted);font:700 .6rem/1.2 'Courier New',monospace;letter-spacing:.06em;text-transform:uppercase}
.about-glance-facts strong{font-size:.92rem;line-height:1.35}
.about-glance-actions{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem}
.about-brief{max-width:820px;margin-top:2rem;border-top:1px solid var(--line)}
.about-brief>div{display:grid;grid-template-columns:110px 1fr;gap:1.5rem;padding:1rem 0;border-bottom:1px solid var(--line);align-items:start}
.about-brief span{color:var(--accent-deep);font:700 .63rem/1.45 'Courier New',monospace;letter-spacing:.07em;text-transform:uppercase}
.about-brief p{margin:0;color:var(--muted);font-size:.9rem;line-height:1.55}
.about-glance-visual{width:100%;max-width:430px;justify-self:center;align-self:start;margin-top:clamp(6.25rem,7.2vw,7.5rem);padding:1rem 1.25rem 1.25rem;background:#f4f0e6;border:1px solid var(--line);display:grid;gap:1.35rem}
.about-glance .report-portrait{width:calc(100% - 10px);min-height:410px;height:auto;margin:0;box-shadow:10px 10px 0 #9db190}
.about-profile-summary{padding-top:1.1rem;border-top:1px solid var(--line)}
.about-profile-summary span{display:block;margin-bottom:.65rem;color:var(--accent-deep);font:700 .62rem/1.3 'Courier New',monospace;letter-spacing:.07em;text-transform:uppercase}
.about-profile-summary strong{display:block;font:500 1.35rem/1.15 Georgia,'Times New Roman',serif}
.about-profile-summary p{margin:.75rem 0 0;color:var(--muted);font-size:.8rem;line-height:1.55}
.about-identity-index{max-width:760px;margin:1.75rem 0 0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
.about-identity-index a{display:grid;grid-template-columns:2.25rem 8.5rem minmax(0,1fr) auto;gap:.75rem;align-items:baseline;padding:.8rem 0;border-top:1px solid var(--line);color:var(--ink)}
.about-identity-index span{color:var(--accent-deep);font:700 .64rem/1 'Courier New',monospace;letter-spacing:.08em}
.about-identity-index strong{font:500 1.3rem/1.1 Georgia,'Times New Roman',serif;letter-spacing:-.03em;transition:color .2s ease}
.about-identity-index small{color:var(--muted);font-size:.92rem;line-height:1.4}
.about-identity-index b{color:var(--accent-deep);font-size:.85rem;transition:transform .2s ease}
.about-identity-index a:hover strong{color:var(--accent-deep)}
.about-identity-index a:hover b{transform:translateY(3px)}
.about-roles-list li{scroll-margin-top:1.5rem}
.about-profile-summary .about-profile-roles-label{margin-top:1.1rem}
.about-profile-list{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:.35rem .55rem;color:var(--ink);font-size:.95rem;line-height:1.4}
.about-profile-list li{white-space:nowrap}
.about-profile-list li:not(:last-child)::after{content:'•';margin-left:.55rem;color:var(--ink)}
.about-glance-copy h1.about-identity-title{font-size:clamp(3.1rem,5.4vw,6rem);line-height:.92}
.about-roles{padding:clamp(2.75rem,4vw,4rem) 6vw clamp(4rem,7vw,7rem);background:#f4f0e6;border-top:1px solid var(--line)}
.about-roles-inner{max-width:1480px;margin:0 auto}
.about-roles-list{margin:2rem 0 0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
.about-roles-list li{display:grid;grid-template-columns:70px minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(1.5rem,4vw,4.5rem);padding:clamp(2rem,3.5vw,3rem) 0;border-top:1px solid var(--line);align-items:start}
.about-role-number{padding-top:.6rem;color:var(--accent-deep);font:700 .7rem/1 'Courier New',monospace;letter-spacing:.08em}
.about-role-title h2{margin:0;font:500 clamp(2.2rem,3.6vw,3.6rem)/.95 Georgia,'Times New Roman',serif;letter-spacing:-.055em}
.about-role-title h2 em{color:var(--accent-deep);font-weight:inherit}
.about-role-title p{margin:.9rem 0 0;color:var(--ink);font-size:clamp(1.05rem,1.3vw,1.2rem);line-height:1.45}
.about-role-body{max-width:640px;margin:0;padding-top:.35rem;color:var(--muted);line-height:1.75}
.about-focus{padding:clamp(4.5rem,8vw,8rem) 6vw;background:#274334;color:var(--paper)}
.about-focus-grid{max-width:1480px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(3rem,7vw,8rem);align-items:start}
.about-focus .report-kicker{color:#b9d1ad}
.about-focus h2{margin:1rem 0 0;font:500 clamp(3rem,5.4vw,5.9rem)/.92 Georgia,'Times New Roman',serif;letter-spacing:-.065em}
.about-focus h2 em{color:#b9d1ad;font-weight:inherit}
.about-focus-copy p{max-width:640px;margin:0 0 1.1rem;color:#c3cec0;line-height:1.75}
.about-focus-copy .about-focus-lede{color:var(--paper);font-size:clamp(1.15rem,1.6vw,1.45rem);line-height:1.5}
.about-focus-copy .about-focus-availability{margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid rgba(244,240,230,.2);color:var(--paper);font:700 .72rem/1.5 'Courier New',monospace;letter-spacing:.06em;text-transform:uppercase}
.about-focus .report-button-light{border-color:#f4f0e6;background:#f4f0e6;color:#20251f}
.about-focus .report-button-light:hover{border-color:#b4ec9f;background:#b4ec9f}
.about-focus .about-focus-secondary{border-color:rgba(244,240,230,.48);color:var(--paper)}
.about-focus .about-focus-secondary:hover{background:var(--paper);color:#274334}
.single-page-about{padding:clamp(5rem,8vw,8rem) 6vw;scroll-margin-top:82px;background:#fbf8f1;border-bottom:1px solid var(--ink)}
.single-page-about-grid{width:100%;max-width:1480px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(330px,430px);gap:clamp(3rem,7vw,8rem);align-items:start}
.single-page-about-copy h2{max-width:900px;margin:1rem 0 1.6rem;font:500 clamp(3.2rem,5.7vw,6.2rem)/.91 Georgia,'Times New Roman',serif;letter-spacing:-.065em}
.single-page-about-copy h2 em{color:var(--accent-deep);font-weight:inherit}
.single-page-about-lede{max-width:780px;margin:0;color:var(--ink);font-size:clamp(1.15rem,1.55vw,1.45rem);line-height:1.5}
.single-page-about-detail{max-width:740px;margin:1.1rem 0 0;color:var(--muted);line-height:1.7}
.single-page-about-capabilities{max-width:820px;margin:2rem 0 0;padding:1.2rem 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);color:var(--muted);font-size:.88rem;line-height:1.65}
.single-page-about-capabilities span{display:block;margin-bottom:.4rem;color:var(--accent-deep);font:700 .64rem/1.3 'Courier New',monospace;letter-spacing:.07em;text-transform:uppercase}
.single-page-about-facts{max-width:820px;margin-top:2rem;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-left:1px solid var(--line)}
.single-page-about-facts div{min-height:105px;padding:1rem;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between}
.single-page-about-facts span{color:var(--muted);font:700 .6rem/1.2 'Courier New',monospace;letter-spacing:.06em;text-transform:uppercase}
.single-page-about-facts strong{font-size:.92rem;line-height:1.35}
.single-page-about-actions{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.75rem}
.single-page-about-visual{width:100%;max-width:430px;justify-self:center;margin-top:clamp(5.8rem,6.5vw,7rem);padding:1rem 1.25rem 1.25rem;background:#f4f0e6;border:1px solid var(--line);display:grid;gap:1.35rem}
.single-page-about .report-portrait{width:calc(100% - 10px);min-height:410px;height:auto;margin:0;box-shadow:10px 10px 0 #9db190}
.report-portrait.report-portrait-photo{padding:0;border-radius:18px;overflow:hidden;background:#274334}
.report-portrait-photo img{display:block;width:100%;height:100%;flex:1;object-fit:cover;object-position:center top}
@media(max-width:1000px){.about-glance-grid{grid-template-columns:1fr;align-items:stretch}.about-glance-visual{max-width:760px;grid-template-columns:minmax(280px,.65fr) 1fr;align-items:center;align-self:auto;margin-top:2.5rem}.about-glance .report-portrait{min-height:360px}.about-profile-summary{padding:1.25rem 0 1.25rem 1.5rem;border-top:0;border-left:1px solid var(--line)}}
@media(max-width:900px){.about-roles-list li{grid-template-columns:50px minmax(0,1fr);row-gap:1rem}.about-role-body{grid-column:2}.about-focus-grid{grid-template-columns:1fr;gap:2rem}}
@media(max-width:720px){.about-glance{min-height:0;padding:3.5rem 1.25rem}.about-glance-copy h1{font-size:clamp(3rem,14vw,4.8rem)}.about-glance-facts{grid-template-columns:1fr}.about-glance-facts div{min-height:82px}.about-glance-visual{grid-template-columns:1fr;margin-top:2rem;padding:1rem}.about-glance .report-portrait{min-height:360px}.about-profile-summary{padding:1.1rem 0 0;border-top:1px solid var(--line);border-left:0}.about-glance-actions{flex-direction:column;align-items:flex-start}.about-brief>div{grid-template-columns:1fr;gap:.35rem}.about-roles,.about-focus{padding:3.5rem 1.25rem}.about-roles-list li{grid-template-columns:1fr;gap:.75rem}.about-role-number{padding-top:0}.about-role-body{grid-column:auto}.about-identity-index a{grid-template-columns:2rem minmax(0,1fr) auto;row-gap:.2rem}.about-identity-index small{grid-column:2}.about-identity-index b{grid-column:3;grid-row:1}}
@media(max-width:1000px){.single-page-about-grid{grid-template-columns:1fr}.single-page-about-visual{max-width:760px;margin-top:2.5rem;grid-template-columns:minmax(280px,.65fr) 1fr;align-items:center}.single-page-about .report-portrait{min-height:360px}.single-page-about-visual .about-profile-summary{padding:1.25rem 0 1.25rem 1.5rem;border-top:0;border-left:1px solid var(--line)}}
@media(max-width:720px){.single-page-about{padding:4.5rem 1.25rem}.single-page-about-copy h2{font-size:clamp(3rem,14vw,4.8rem)}.single-page-about-facts{grid-template-columns:1fr}.single-page-about-facts div{min-height:82px}.single-page-about-visual{grid-template-columns:1fr;margin-top:2rem;padding:1rem}.single-page-about .report-portrait{min-height:360px}.single-page-about-visual .about-profile-summary{padding:1.1rem 0 0;border-top:1px solid var(--line);border-left:0}.single-page-about-actions{flex-direction:column;align-items:flex-start}}
</style>`;

const behavior = `<script>
// Native smooth scrolling can't be slowed, so ease it manually. The stopping point honors the
// target's CSS scroll-margin-top, and any wheel or touch hands control back to the visitor.
function scrollToForm(target,done){
  var start=scrollY;
  var end=Math.min(document.documentElement.scrollHeight-innerHeight,start+target.getBoundingClientRect().top-parseFloat(getComputedStyle(target).scrollMarginTop));
  var distance=end-start,duration=Math.min(1200,Math.max(700,Math.abs(distance)*.4)),startTime,stopped=false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){scrollTo({top:end,behavior:'instant'});return done();}
  function stop(){stopped=true;}
  addEventListener('wheel',stop,{passive:true,once:true});
  addEventListener('touchstart',stop,{passive:true,once:true});
  requestAnimationFrame(function step(time){
    var p=stopped?1:Math.min(1,(time-(startTime??=time))/duration);
    if(!stopped)scrollTo({top:start+distance*(p<.5?4*p*p*p:1-Math.pow(2-2*p,3)/2),behavior:'instant'});
    if(p<1)return requestAnimationFrame(step);
    removeEventListener('wheel',stop);removeEventListener('touchstart',stop);done();
  });
}

document.addEventListener('click',function(event){
  var inquiryLink=event.target.closest('.work-inquiry-link');
  if(inquiryLink){
    var form=document.getElementById('inquiry-form');
    if(!form)return;
    event.preventDefault();
    // Add the matching area without clearing any the visitor already chose; fire events so listeners see the change.
    var area=inquiryLink.getAttribute('data-area');
    var areaInput=area&&form.querySelector('.inquiry-chip input[data-area="'+area+'"]');
    if(areaInput&&!areaInput.checked){
      areaInput.checked=true;
      areaInput.dispatchEvent(new Event('input',{bubbles:true}));
      areaInput.dispatchEvent(new Event('change',{bubbles:true}));
    }
    scrollToForm(form,function(){if(areaInput)areaInput.focus({preventScroll:true});});
    return;
  }
  var trigger=event.target.closest('.work-accordion-trigger');
  if(!trigger)return;
  var current=trigger.closest('.work-accordion-item');
  var shouldOpen=!current.classList.contains('is-open');
  current.closest('.work-accordion').querySelectorAll('.work-accordion-item').forEach(function(item){
    var open=item===current&&shouldOpen;
    item.classList.toggle('is-open',open);
    item.querySelector('.work-accordion-trigger').setAttribute('aria-expanded',String(open));
    item.querySelector('.work-accordion-panel').setAttribute('aria-hidden',String(!open));
    item.querySelector('.work-accordion-action small').textContent=open?'Close':'Explore';
  });
});

(function(){
  var track=document.querySelector('[data-project-carousel]');
  if(!track)return;
  var cards=Array.from(track.querySelectorAll('.project-writeup-card'));
  var previous=document.querySelector('[data-carousel-prev]');
  var next=document.querySelector('[data-carousel-next]');
  var progress=document.querySelector('[data-carousel-progress]');
  var bar=document.querySelector('[data-carousel-bar]');
  var currentIndex=0;

  function cardStep(){
    if(!cards[0])return 0;
    var gap=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap)||0;
    return cards[0].getBoundingClientRect().width+gap;
  }
  // How many cards fit side by side; on desktop several show at once, so the last index is cards.length - visible.
  function visibleCount(){
    var step=cardStep();
    if(!step)return 1;
    var styles=getComputedStyle(track);
    var gap=parseFloat(styles.columnGap||styles.gap)||0;
    var width=track.clientWidth-(parseFloat(styles.paddingRight)||0);
    return Math.max(1,Math.min(cards.length,Math.floor((width+gap+1)/step)));
  }
  function pad(value){return String(value).padStart(2,'0');}
  function updateCarousel(){
    var step=cardStep();
    var visible=visibleCount();
    var lastIndex=cards.length-visible;
    currentIndex=step?Math.max(0,Math.min(lastIndex,Math.round(track.scrollLeft/step))):0;
    var lastShown=currentIndex+visible;
    if(progress)progress.textContent=(visible>1?pad(currentIndex+1)+'–'+pad(lastShown):pad(lastShown))+' / '+pad(cards.length);
    if(bar)bar.style.transform='scaleX('+(lastShown/cards.length)+')';
    if(previous)previous.disabled=currentIndex===0;
    if(next)next.disabled=currentIndex>=lastIndex;
  }
  function moveTo(index){
    currentIndex=Math.max(0,Math.min(cards.length-visibleCount(),index));
    track.scrollTo({left:cardStep()*currentIndex,behavior:'smooth'});
  }
  if(previous)previous.addEventListener('click',function(){moveTo(currentIndex-1);});
  if(next)next.addEventListener('click',function(){moveTo(currentIndex+1);});
  track.addEventListener('scroll',updateCarousel,{passive:true});
  track.addEventListener('keydown',function(event){
    if(event.key==='ArrowLeft'){event.preventDefault();moveTo(currentIndex-1);}
    if(event.key==='ArrowRight'){event.preventDefault();moveTo(currentIndex+1);}
  });

  var dragging=false;
  var dragged=false;
  var startX=0;
  var startScroll=0;
  track.addEventListener('pointerdown',function(event){
    if(event.pointerType!=='mouse'||event.button!==0||track.scrollWidth<=track.clientWidth)return;
    dragging=true;dragged=false;startX=event.clientX;startScroll=track.scrollLeft;
  });
  track.addEventListener('pointermove',function(event){
    if(!dragging)return;
    var distance=event.clientX-startX;
    // Capture only once a real drag starts; capturing on pointerdown retargets plain clicks away from the card links.
    if(!dragged&&Math.abs(distance)>5){
      dragged=true;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    }
    if(dragged)track.scrollLeft=startScroll-distance;
  });
  track.addEventListener('pointerup',function(event){
    if(!dragging)return;
    dragging=false;track.classList.remove('is-dragging');
    if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
    if(dragged)moveTo(Math.round(track.scrollLeft/cardStep()));
  });
  track.addEventListener('click',function(event){if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
  window.addEventListener('resize',updateCarousel);
  updateCarousel();
})();

(function(){
  var form=document.getElementById('inquiry-form');
  if(!form)return;
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var status=form.querySelector('[data-form-status]');
    var button=form.querySelector('button[type="submit"]');
    function setStatus(state,text){if(status){status.setAttribute('data-state',state);status.textContent=text;}}
    setStatus('sending','Sending your inquiry…');
    if(button)button.disabled=true;
    var data=new FormData(form);
    var areas=data.getAll('areas');
    data.delete('areas');
    data.set('areas',areas.join(', '));
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()})
      .then(function(response){
        if(!response.ok)throw new Error('Form submission failed');
        var firstName=String(data.get('name')||'').trim().split(/\\s+/)[0];
        form.reset();
        setStatus('success',(firstName?'Hi '+firstName+', your':'Your')+' inquiry has been sent. I’ll be in touch soon.');
        if(status&&firstName){
          var nameEl=document.createElement('span');
          nameEl.className='inquiry-status-name';
          nameEl.textContent=firstName;
          status.textContent='';
          status.append('Hi ',nameEl,', your inquiry has been sent. I’ll be in touch soon.');
        }
      })
      .catch(function(){setStatus('error','Something went wrong. Please reach out on LinkedIn instead.');})
      .finally(function(){if(button)button.disabled=false;});
  });
})();
</script>`;

const home = `<!doctype html><html lang="en"><head>${sharedHead('Oshane Jackson — GTM Engineer', 'GTM engineering portfolio covering analytics, data systems, enrichment, automation, and lead scoring.')}</head><body><main class="operating-site work-site capability-home theme-editorial accordion-version">
  ${header('home')}
  <section class="capability-hero" id="top"><div><p class="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p><h1>Turn fragmented GTM processes into dependable <em>revenue systems.</em></h1><p class="capability-hero-lede">I design and build the data foundations, integrations, automations, and decision workflows that improve lead handling, reporting trust, and operational efficiency.</p></div><aside><p>I&apos;m Oshane Jackson, a GTM and Revenue Systems Engineer. I connect CRM data, enrichment, automation, routing, scoring, and analytics to reduce manual work, improve reporting trust, and help revenue teams operate more efficiently.</p><div class="operating-actions"><a class="report-button report-button-primary" href="#types-of-work">Explore types of work</a><a class="report-button" href="#contact">Contact</a></div><small><i></i> AVAILABLE FOR FULL-TIME ROLES &amp; CONTRACTS</small></aside></section>
  <section class="capability-work accordion-work-section" id="types-of-work"><div class="capability-section-heading accordion-heading"><div><p class="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div><div class="accordion-heading-note"><p>These five areas cover the data, analytical, and operational systems I build. Explore an area to start a relevant inquiry, or continue below to view selected project write-ups.</p><span>SELECT A ROW TO EXPLORE <i>↓</i></span></div></div>${accordion(workTypes)}</section>
  <section class="project-writeups" id="project-writeups"><div class="project-writeups-heading"><div><p class="report-kicker">PROJECT WRITE-UPS / GITHUB</p><h2>Practical systems for recurring <em>GTM problems.</em></h2></div><div class="project-writeups-intro"><p>Each write-up covers one part of Fiction Cloud&apos;s lead-to-revenue system, from finding and routing accounts to modeling CRM data and analyzing the funnel, with the build details, checks, and business takeaways.</p><div class="project-carousel-controls" aria-label="Project carousel controls"><button type="button" data-carousel-prev aria-label="Previous project">←</button><span data-carousel-progress>01 / 04</span><button type="button" data-carousel-next aria-label="Next project">→</button></div></div></div><div class="project-carousel-viewport"><div class="project-carousel-track" data-project-carousel tabindex="0" aria-label="Project write-ups. Swipe or use the arrow buttons to browse.">${projectWriteupCards()}</div></div><div class="project-carousel-progress" aria-hidden="true"><i data-carousel-bar></i></div></section>
  <section class="operating-contact simple-contact inquiry-section" id="contact"><div class="inquiry-intro"><p class="report-kicker">FULL-TIME ROLES &amp; CONTRACTS</p><h2>Hiring a GTM Engineer—or need one <em>on contract?</em></h2><div class="contact-intro inquiry-copy"><p>I provide Revenue (GTM) Systems Engineering support to keep revenue teams operating reliably.</p><p class="inquiry-expertise-label">Core Expertise:</p><ul class="inquiry-expertise"><li>Systems Integration &amp; Architecture</li><li>Data &amp; Analytics</li><li>Data Enrichment &amp; Scoring</li><li>Workflow Automation</li></ul><p><em>Available for full-time and contract GTM roles.</em></p></div></div><form class="inquiry-form" id="inquiry-form" name="inquiry" method="POST" data-netlify="true" netlify-honeypot="company-website"><input type="hidden" name="form-name" value="inquiry"><p hidden><label>Leave this field empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p><label><span>Name</span><input type="text" name="name" autocomplete="name" required></label><label><span>Email</span><input type="email" name="email" autocomplete="email" required></label><label class="inquiry-company"><span>Company name</span><input type="text" name="company" autocomplete="organization"></label><label class="inquiry-engagement"><span>Engagement type</span><select name="engagement" required><option value="">Select one</option>${engagementTypes.map((type) => `<option>${esc(type)}</option>`).join('')}</select></label><fieldset class="inquiry-areas"><legend>Areas of inquiry</legend><div class="inquiry-chips">${inquiryAreas.map(([label, slug]) => `<label class="inquiry-chip"><input type="checkbox" name="areas" value="${esc(label)}"${slug ? ` data-area="${esc(slug)}"` : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset><label class="inquiry-message"><span>Current need</span><textarea name="message" rows="3" placeholder="What is your team trying to improve, and where is the current constraint?"></textarea></label><div class="inquiry-submit"><button class="report-button report-button-light" type="submit">Send inquiry</button><p>Your information is only used to respond to this inquiry.</p><strong data-form-status aria-live="polite"></strong></div></form></section>
  ${footer()}
</main>${behavior}</body></html>`;

const about = `<!doctype html><html lang="en"><head>${sharedHead('About Me — Oshane Jackson, GTM Engineer', 'About the GTM engineering approach, operating principles, and technical delivery experience.')}</head><body><div class="operating-shell theme-editorial">
  ${header('about')}
  <main id="top">
    <section class="about-glance"><div class="about-glance-grid">
      <div class="about-glance-copy"><p class="report-kicker">ABOUT ME / GTM SYSTEMS ENGINEER</p><h1 class="about-identity-title">I&apos;m a builder, analyst, entrepreneur, operator, and <em>technologist.</em></h1><p class="about-glance-lede">Working at the intersection of business, data, and technology, I translate strategic goals into analytical systems, automations, and workflows.</p><ol class="about-identity-index" aria-label="Core identities">${aboutRoles.map((role, index) => `<li><a href="#identity-${role.name}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(role.name[0].toUpperCase() + role.name.slice(1))}</strong><small>${esc(role.tagline)}</small><b aria-hidden="true">↓</b></a></li>`).join('')}</ol></div>
      <aside class="about-glance-visual"><figure class="report-portrait report-portrait-photo"><img src="/oshane_profile_photo.webp" alt="Headshot of Oshane Jackson" width="1146" height="1419"></figure><div class="about-profile-summary"><span>LOCATION</span><ul class="about-profile-list"><li>Canada</li><li>USA</li><li>Americas</li></ul><span class="about-profile-roles-label">ROLES</span><ul class="about-profile-list"><li>Analytics Engineer</li><li>Data Analyst</li><li>GTM Engineer</li></ul></div></aside>
    </div></section>
    <section class="about-roles" id="identities" aria-label="Core identities"><div class="about-roles-inner"><p class="report-kicker">CORE IDENTITIES / 05</p><ol class="about-roles-list">${aboutRoles.map((role, index) => `<li id="identity-${role.name}"><span class="about-role-number">${String(index + 1).padStart(2, '0')}</span><div class="about-role-title"><h2>I am ${role.article} <em>${esc(role.name)}.</em></h2><p>${esc(role.tagline)}</p></div><p class="about-role-body">${esc(role.body)}</p></li>`).join('')}</ol></div></section>
    <section class="about-focus"><div class="about-focus-grid">
      <div><p class="report-kicker">MY FOCUS</p><h2>My focus is <em>GTM systems.</em></h2></div>
      <div class="about-focus-copy"><p class="about-focus-lede">GTM Systems Engineering brings these parts of my identity into one field.</p><p>It combines business analysis, system architecture, data, automation, analytics, and operational execution. It requires ideas to be translated into requirements, requirements into systems, and systems into dependable operating processes.</p><p>I apply this approach to data foundations, enrichment, routing, scoring, workflow automation, revenue analytics, and the integrations connecting them.</p><p class="about-focus-availability">I am open to full-time and contract GTM roles.</p><div class="about-glance-actions"><a class="report-button report-button-light" href="/#contact">Start a conversation</a><a class="report-button about-focus-secondary" href="/#types-of-work">Types of Work</a></div></div>
    </div></section>
  </main>
  ${footer()}
</div></body></html>`;

const singlePageAbout = `<section class="single-page-about" id="about"><div class="single-page-about-grid">
  <div class="single-page-about-copy"><p class="report-kicker">ABOUT ME / GTM ENGINEER</p><h2>I turn GTM operating problems into dependable <em>systems.</em></h2><p class="single-page-about-lede">I build dependable data and automation systems for GTM teams—turning operational questions into reporting, enrichment, scoring, and workflow solutions people can trust.</p><p class="single-page-about-detail">Recent work includes a GTM analytical layer for consistent reporting, a Clay enrichment workflow that turns ICP criteria into CRM-ready account data, and an explainable lead-scoring system using fit and engagement signals.</p><div class="about-brief"><div><span>CORE WORK</span><p>Data modeling · Funnel analytics · Enrichment · Lead scoring · Automation</p></div><div><span>TOOLS</span><p>SQL · dbt · Clay · n8n · CRM workflows · BI</p></div></div><div class="single-page-about-actions"><a class="report-button report-button-primary" href="#contact">Start a conversation</a><a class="report-button" href="#types-of-work">Review types of work</a></div></div>
  <aside class="single-page-about-visual"><figure class="report-portrait report-portrait-photo"><img src="/oshane_profile_photo.webp" alt="Headshot of Oshane Jackson" width="1146" height="1419"></figure><div class="about-profile-summary"><span>WORKING PROFILE</span><strong>GTM Engineer bridging RevOps, data, and automation.</strong><p>Focused on practical systems that improve reporting trust, lead handling, targeting quality, and prioritization.</p></div></aside>
</div></section>`;

const singlePageHome = home
  .replace('accordion-version"', 'accordion-version single-page-version"')
  .replace(header('home'), header('home', '#about'))
  .replace(/<section class="project-writeups"[\s\S]*?<\/section>/, singlePageAbout)
  .replace(/\s*<section class="simple-about capability-about">[\s\S]*?<\/section>/, '');

await fs.mkdir(path.join(outputDir, 'about'), { recursive: true });
await fs.writeFile(path.join(outputDir, 'index.html'), home);
await fs.writeFile(path.join(outputDir, 'about', 'index.html'), about);
await fs.writeFile(path.join(outputDir, 'README-FIRST.txt'), `GTM PORTFOLIO — NETLIFY SITE\n\nNetlify builds and publishes this folder automatically from the repository (see netlify.toml).\nTo deploy it manually instead, open https://app.netlify.com/drop and drag this entire folder into the drop area.\n\nDo not edit these files directly. Change the source files and rebuild with: node scripts/build-netlify-embed.mjs\n`);
await fs.mkdir(singlePageOutputDir, { recursive: true });
await fs.writeFile(path.join(singlePageOutputDir, 'index.html'), singlePageHome);
await fs.copyFile(path.join(projectDir, 'public', 'oshane_profile_photo.webp'), path.join(outputDir, 'oshane_profile_photo.webp'));
await fs.copyFile(path.join(projectDir, 'public', 'oshane_profile_photo.webp'), path.join(singlePageOutputDir, 'oshane_profile_photo.webp'));
await fs.writeFile(path.join(singlePageOutputDir, 'README-FIRST.txt'), `GTM PORTFOLIO — SINGLE-PAGE VERSION\n\nThis alternative layout is not published by netlify.toml.\nTo preview it on Netlify, open https://app.netlify.com/drop and drag this entire folder into the drop area.\n\nThe About Me navigation scrolls to the About Me section on the Home page.\n`);

console.log(`Created Netlify Drop folder: ${outputDir}`);
console.log(`Home HTML: ${Buffer.byteLength(home).toLocaleString()} bytes`);
console.log(`About HTML: ${Buffer.byteLength(about).toLocaleString()} bytes`);
console.log(`Created single-page folder: ${singlePageOutputDir}`);
console.log(`Single-page HTML: ${Buffer.byteLength(singlePageHome).toLocaleString()} bytes`);
