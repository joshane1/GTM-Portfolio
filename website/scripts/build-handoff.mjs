import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const outputDir = path.join(projectDir, 'handoff');

async function importTypeScript(relativePath) {
  const source = await fs.readFile(path.join(projectDir, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

const { workTypes } = await importTypeScript('app/work-data.ts');
let css = await fs.readFile(path.join(projectDir, 'app/globals.css'), 'utf8');
css = css.replace("@import 'tailwindcss';", '');

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const header = (active) => `
  <header class="site-header operating-header">
    <a class="monogram" href="#/">YN<span>.</span></a>
    <nav>
      <a class="${active === 'home' ? 'nav-active' : ''}" href="#/">Home</a>
      <a class="${active === 'work' ? 'nav-active' : ''}" href="#/work">Types of Work</a>
      <a class="${active === 'about' ? 'nav-active' : ''}" href="#/about">About</a>
    </nav>
    <a class="header-cta" href="#/" data-scroll="contact">Let&apos;s talk</a>
  </header>`;

const footer = (center = 'GTM ENGINEERING / SYSTEMS / ANALYTICS') => `
  <footer class="operating-footer"><span>© 2026 YOUR NAME</span><span>${esc(center)}</span><a href="#/">HOME</a></footer>`;

const evidenceProjects = [
  ['Fiction Cloud Analytics', 'Data modeling · Pipeline analytics', 'SQL, dbt, analytical models, funnel logic, and reporting datasets.'],
  ['Fiction Cloud Clay Enrichment', 'ICP discovery · Enrichment', 'Account discovery, enrichment waterfalls, validation, and CRM-ready output.'],
  ['Lead Scoring System', 'Scoring · Signal activation', 'Fit and engagement signals, transparent weighting, priority bands, and CRM activation logic.'],
];

const home = `<main class="operating-site work-site capability-home theme-editorial">
  ${header('home')}
  <section class="capability-hero" id="top"><div><p class="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p><h1>I build cleaner data, faster handoffs, and more reliable <em>GTM decisions.</em></h1></div><aside><p>I&apos;m Your Name, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p><div class="operating-actions"><a class="report-button report-button-primary" href="#/" data-scroll="types-of-work">Explore types of work</a><a class="report-button" href="#/" data-scroll="contact">Contact</a></div><small><i></i> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small></aside></section>
  <section class="capability-work" id="types-of-work"><div class="capability-section-heading"><div><p class="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div><p>My work focuses on specific revenue-system constraints—from unreliable data and unclear pipeline performance to manual lead handling and underused buying signals.</p></div><div class="capability-card-grid">${workTypes.map((work) => `<a class="capability-card" href="#/work/${work.slug}"><div><span>${work.number}</span><small>${esc(work.discipline)}</small></div><h3>${esc(work.title)}</h3><p>${esc(work.summary)}</p><ul>${work.deliverables.slice(0, 3).map((item) => `<li>${esc(item.title)}</li>`).join('')}</ul><b>VIEW TYPE OF WORK</b></a>`).join('')}</div><a class="capability-index-link" href="#/work">View the complete Types of Work index</a></section>
  <section class="capability-evidence"><div class="capability-evidence-heading"><p class="report-kicker">SELECTED TECHNICAL EVIDENCE</p><div><h2>See how the systems were designed and <em>built.</em></h2><p>These projects demonstrate the models, workflows, validation logic, and technical decisions behind the capabilities above.</p></div></div><div class="evidence-library-grid">${evidenceProjects.map((project, index) => `<article><span>PROJECT ${String(index + 1).padStart(2, '0')}</span><h3>${esc(project[0])}</h3><small>${esc(project[1])}</small><p>${esc(project[2])}</p></article>`).join('')}</div></section>
  <section class="simple-about capability-about"><p class="report-kicker">HOW I WORK</p><div><h2>I connect commercial context to technical <em>execution.</em></h2><p>I work from the business constraint to the data model, workflow, or analytical system needed to resolve it—then make the result clear enough for operators to trust, maintain, and improve.</p></div><a href="#/about">MORE ABOUT HOW I WORK</a></section>
  <section class="operating-contact simple-contact" id="contact"><div><p class="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><h2>Hiring for this capability—or need it <em>built?</em></h2><p class="contact-intro">I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as clearly scoped project work.</p></div><div class="contact-review"><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a><div><span>YOUR CITY · OPEN TO REMOTE</span><a href="#">LINKEDIN</a><a href="#">GITHUB</a></div></div></section>
  ${footer()}
</main>`;

const workIndex = `<div class="operating-shell work-site theme-editorial">
  ${header('work')}
  <main><section class="work-index-hero"><p class="report-kicker">GTM ENGINEERING CAPABILITIES / 05</p><div><h1>Five ways I help GTM teams operate <em>better.</em></h1><p>Each capability addresses a specific operating constraint and defines the deliverables, technical approach, validation, and evidence needed to evaluate the work.</p></div></section><section class="work-index-list">${workTypes.map((work) => `<a class="work-index-card" href="#/work/${work.slug}"><div class="work-index-number"><span>${work.number}</span><small>${esc(work.discipline)}</small></div><div class="work-index-main"><h2>${esc(work.title)}</h2><p>${esc(work.summary)}</p></div><div class="work-index-deliverables"><span>SELECT DELIVERABLES</span>${work.deliverables.slice(0, 3).map((item) => `<small>${esc(item.title)}</small>`).join('')}</div><b>VIEW TYPE OF WORK</b></a>`).join('')}</section></main>
  ${footer()}
</div>`;

function evidenceCard(evidence) {
  return `<article class="work-evidence-card"><div class="evidence-card-heading"><span>${esc(evidence.project)}</span><span>DEMONSTRATED WORK</span></div>${evidence.videoUrl ? `<div class="work-video-frame"><iframe src="${esc(evidence.videoUrl)}" title="${esc(evidence.title)}" allowfullscreen></iframe></div>` : ''}<div class="work-evidence-content"><h3>${esc(evidence.title)}</h3><p>${esc(evidence.summary)}</p><div class="evidence-demonstrates"><span>WHAT THIS DEMONSTRATES</span><div>${evidence.demonstrates.map((item) => `<small>${esc(item)}</small>`).join('')}</div></div><div class="evidence-technology"><span>TECHNOLOGIES</span><div>${evidence.technologies.map((item) => `<small>${esc(item)}</small>`).join('')}</div></div></div></article>`;
}

const workPages = Object.fromEntries(workTypes.map((work) => [work.slug, `<div class="operating-shell work-site theme-editorial">
  ${header('work')}
  <main class="work-detail">
    <section class="work-detail-hero"><div class="work-detail-breadcrumb"><a href="#/work">Types of Work</a><span>${work.number} / 05</span></div><div class="work-detail-hero-grid"><div><p class="report-kicker">${esc(work.title)} / ${esc(work.discipline)}</p><h1>${esc(work.outcomeHeadline)}<em>.</em></h1></div><div class="work-detail-intro"><p>${esc(work.summary)}</p><div>${work.benefits.map((item) => `<span>${esc(item)}</span>`).join('')}</div></div></div></section>
    <section class="work-overview"><div class="work-section-marker"><span>A</span><small>OVERVIEW &amp; BUSINESS VALUE</small></div><div><h2>When companies need <em>this.</em></h2><p>${esc(work.overview)}</p></div><aside><span>WHY COMPANIES NEED IT</span><p>${esc(work.businessValue)}</p></aside></section>
    <section class="work-deliverables"><div class="work-section-heading"><div class="work-section-marker"><span>B</span><small>SPECIFIC WORK I CAN DELIVER</small></div><h2>What I can <em>deliver.</em></h2></div><div class="deliverable-list">${work.deliverables.map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.title)}</h3><div><small>PROBLEM</small><p>${esc(item.problem)}</p></div><div><small>BUILD</small><p>${esc(item.build)}</p></div><div><small>VALUE</small><p>${esc(item.value)}</p></div></article>`).join('')}</div></section>
    <section class="work-approach"><div class="work-approach-copy"><div class="work-section-marker"><span>C</span><small>MY TECHNICAL APPROACH</small></div><h2>How I build <em>it.</em></h2><div class="work-tech-group"><span>RELEVANT TECHNOLOGIES</span><div>${work.technologies.map((item) => `<small>${esc(item)}</small>`).join('')}</div></div></div><div class="work-approach-flow">${work.approach.map((step, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p></div></article>`).join('')}</div><div class="work-engineering-notes"><div><span>ENGINEERING CONSIDERATIONS</span>${work.considerations.map((item) => `<small>${esc(item)}</small>`).join('')}</div><div><span>VALIDATION</span>${work.validation.map((item) => `<small>${esc(item)}</small>`).join('')}</div></div></section>
    <section class="work-evidence"><div class="work-section-heading"><div class="work-section-marker"><span>D</span><small>DEMONSTRATED WORK</small></div><div><h2>See how the system was designed and <em>built.</em></h2><p>The evidence below shows the source inputs, transformation or workflow logic, validation, outputs, and technical decisions behind this capability.</p></div></div><div class="work-evidence-grid">${work.evidence.map(evidenceCard).join('')}</div></section>
    <section class="work-resources"><div class="work-section-marker"><span>E</span><small>TECHNICAL ARTIFACTS</small></div><div class="work-resource-grid">${work.resources.map((resource) => `<article><span>${esc(resource.kind)}</span><h3>${esc(resource.title)}</h3><p>${esc(resource.description)}</p></article>`).join('')}</div></section>
    <section class="work-cta"><div class="work-section-marker"><span>F</span><small>START A CONVERSATION</small></div><div><h2>${esc(work.ctaHeadline)}</h2><p>${esc(work.ctaText)}</p><p>I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as focused project-based work.</p><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a></div></section>
  </main>
  ${footer(work.title.toUpperCase())}
</div>`]));

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

const about = `<div class="operating-shell theme-editorial">${header('about')}<main class="about-report" id="top">
  <section class="about-report-intro"><div class="about-report-copy"><p class="report-kicker">ABOUT / GTM ENGINEER</p><h1>I connect commercial context to technical <em>execution.</em></h1><p class="about-report-lede">I&apos;m a GTM Engineer and GTM Analytics Engineer working across revenue operations, data, analytics, and automation.</p><p>I help teams move from an operating problem to a dependable system: clarifying the decision or workflow, defining the technical requirements, building and validating the solution, and documenting it for the people who will own it.</p><div class="about-report-meta"><div><span>WORKING RANGE</span><strong>Discovery → delivery</strong></div><div><span>PRIMARY FOCUS</span><strong>Data, analytics &amp; automation</strong></div><div><span>TEAM FIT</span><strong>RevOps · GTM · Data</strong></div></div></div><figure class="report-portrait" role="img" aria-label="Your Name profile monogram"><div><span>GTM ENGINEERING</span><span>PROFILE</span></div><strong>YN</strong><figcaption>Revenue systems · Analytics engineering · Workflow automation</figcaption></figure></section>
  <section class="about-operating-review"><div class="about-principle-review"><div class="report-panel-heading"><span>OPERATING PRINCIPLES</span><span>04</span></div>${principles.map(([number, title, copy]) => `<article><span>${number}</span><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></article>`).join('')}</div><aside class="about-coverage-review"><div class="report-panel-heading"><span>WHAT I BRING TO A TEAM</span><span>01–04</span></div>${coverage.map(([title, detail], index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(title)}</strong><small>${esc(detail)}</small></div>`).join('')}<a href="#/work">REVIEW THE WORK</a></aside></section>
  <section class="about-ready-cta"><p class="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><div><h2>Need someone who can move from GTM problem to working <em>system?</em></h2><p>I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as focused project work across data, analytics, enrichment, automation, and scoring.</p><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a></div></section>
</main>${footer()}</div>`;

const pages = { home, workIndex, work: workPages, about };
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTM Engineering Portfolio — Offline Preview</title><style>${css}#app{min-height:100vh}.offline-note{position:fixed;z-index:100;right:12px;bottom:12px;padding:7px 9px;background:rgba(19,23,18,.88);color:#fff;font:700 10px/1 'Courier New',monospace;letter-spacing:.08em;pointer-events:none}@media print{.offline-note{display:none}}</style></head><body><div id="app"></div><div class="offline-note">OFFLINE DESIGN PREVIEW</div><script>const pages=${JSON.stringify(pages)};const app=document.getElementById('app');function render(){const route=(location.hash.slice(2)||'').split('/').filter(Boolean);if(route[0]==='work'&&route[1]&&pages.work[route[1]])app.innerHTML=pages.work[route[1]];else if(route[0]==='work'||route[0]==='solutions')app.innerHTML=pages.workIndex;else if(route[0]==='about')app.innerHTML=pages.about;else app.innerHTML=pages.home;window.scrollTo(0,0)}document.addEventListener('click',event=>{const link=event.target.closest('[data-scroll]');if(!link)return;event.preventDefault();if(location.hash!=='#/')location.hash='#/';setTimeout(()=>document.getElementById(link.dataset.scroll)?.scrollIntoView({behavior:'smooth'}),20)});window.addEventListener('hashchange',render);if(!location.hash)location.hash='#/';render();</script></body></html>`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Offline-Preview.html'), html);
