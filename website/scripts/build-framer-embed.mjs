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

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const header = (active) => `
  <header class="site-header operating-header">
    <a class="monogram" href="#" data-route="home" aria-label="Back to home">YN<span>.</span></a>
    <nav aria-label="Main navigation">
      <a class="${active === 'home' ? 'nav-active' : ''}" href="#" data-route="home">Home</a>
      <a class="${active === 'work' ? 'nav-active' : ''}" href="#" data-route="work">Types of Work</a>
      <a class="${active === 'about' ? 'nav-active' : ''}" href="#" data-route="about">About</a>
    </nav>
    <a class="header-cta" href="#" data-scroll="contact">Let&apos;s talk</a>
  </header>`;

const footer = () => `
  <footer class="operating-footer"><span>© 2026 YOUR NAME</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="#" data-route="home">HOME</a></footer>`;

function accordion(items, label = 'Types of GTM engineering work') {
  return `<div class="work-accordion" aria-label="${esc(label)}">${items.map((work) => {
    const evidence = work.evidence[0];
    const githubUrl = evidence?.repositoryUrl ?? 'https://github.com/yourusername';
    const panelId = `capability-${work.slug}`;
    return `<article class="work-accordion-item" data-accordion-item="${esc(work.slug)}">
      <h3><button aria-controls="${panelId}" aria-expanded="false" class="work-accordion-trigger" type="button">
        <span class="work-accordion-identity"><strong>${esc(work.number)}</strong><small>${esc(work.discipline)}</small></span>
        <span class="work-accordion-title"><strong>${esc(work.title)}</strong><span>${esc(work.summary)}</span></span>
        <span class="work-accordion-deliverables"><small>SELECT DELIVERABLES</small>${work.deliverables.slice(0, 3).map((item) => `<span>${esc(item.title)}</span>`).join('')}</span>
        <span class="work-accordion-action" aria-hidden="true"><small>Explore</small><i></i></span>
      </button></h3>
      <div class="work-accordion-panel" id="${panelId}" aria-hidden="true"><div class="work-accordion-panel-inner"><div class="work-accordion-compact">
        <div class="work-accordion-value"><span>WHY IT MATTERS</span><h4>${esc(work.outcomeHeadline)}</h4><p>${esc(work.businessValue)}</p></div>
        <div class="work-accordion-manager-view"><span>WHAT A GTM LEADER GETS</span><ul>${work.benefits.map((benefit) => `<li>${esc(benefit)}</li>`).join('')}</ul></div>
        <div class="work-accordion-evidence"><span>PROJECT EVIDENCE</span><h5>${esc(evidence?.project ?? 'Representative project')}</h5><p>${esc(evidence?.summary)}</p><div>${work.technologies.slice(0, 4).map((technology) => `<small>${esc(technology)}</small>`).join('')}</div><a href="${esc(githubUrl)}" rel="noreferrer" target="_blank">View project on GitHub <b>↗</b></a></div>
      </div></div></div>
    </article>`;
  }).join('')}</div>`;
}

const evidenceProjects = [
  ['Fiction Cloud Analytics', 'Data modeling · Pipeline analytics', 'SQL, dbt, analytical models, funnel logic, and reporting datasets.'],
  ['Fiction Cloud Clay Enrichment', 'ICP discovery · Enrichment', 'Account discovery, enrichment waterfalls, validation, and CRM-ready output.'],
  ['Lead Scoring System', 'Scoring · Signal activation', 'Fit and engagement signals, transparent weighting, priority bands, and CRM activation logic.'],
];

const home = `<main class="operating-site work-site capability-home theme-editorial accordion-version">
  ${header('home')}
  <section class="capability-hero" id="top"><div><p class="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p><h1>I build cleaner data, faster handoffs, and more reliable <em>GTM decisions.</em></h1></div><aside><p>I&apos;m Your Name, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p><div class="operating-actions"><a class="report-button report-button-primary" href="#" data-scroll="types-of-work">Explore types of work</a><a class="report-button" href="#" data-scroll="contact">Contact</a></div><small><i></i> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small></aside></section>
  <section class="capability-work accordion-work-section" id="types-of-work"><div class="capability-section-heading accordion-heading"><div><p class="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div><div class="accordion-heading-note"><p>Scan the five areas below, then open the one that matches your current constraint. Each section expands in place; opening another closes the previous one.</p><span>SELECT A ROW TO EXPLORE <i>↓</i></span></div></div>${accordion(workTypes)}<div class="accordion-section-links"><a href="#" data-route="work">Open the focused Types of Work page</a></div></section>
  <section class="capability-evidence"><div class="capability-evidence-heading"><p class="report-kicker">SELECTED TECHNICAL EVIDENCE</p><div><h2>See how the systems were designed and <em>built.</em></h2><p>These projects demonstrate the models, workflows, validation logic, and technical decisions behind the capabilities above.</p></div></div><div class="evidence-library-grid">${evidenceProjects.map((project, index) => `<article><span>PROJECT ${String(index + 1).padStart(2, '0')}</span><h3>${esc(project[0])}</h3><small>${esc(project[1])}</small><p>${esc(project[2])}</p></article>`).join('')}</div></section>
  <section class="simple-about capability-about"><p class="report-kicker">HOW I WORK</p><div><h2>I connect commercial context to technical <em>execution.</em></h2><p>I work from the business constraint to the data model, workflow, or analytical system needed to resolve it—then make the result clear enough for operators to trust, maintain, and improve.</p></div><a href="#" data-route="about">MORE ABOUT HOW I WORK</a></section>
  <section class="operating-contact simple-contact" id="contact"><div><p class="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><h2>Hiring for this capability—or need it <em>built?</em></h2><p class="contact-intro">I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as clearly scoped project work.</p></div><div class="contact-review"><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a><div><span>YOUR CITY · OPEN TO REMOTE</span><a href="#">LINKEDIN</a><a href="#">GITHUB</a></div></div></section>
  ${footer()}
</main>`;

const workIndex = `<div class="operating-shell work-site theme-editorial accordion-version">
  ${header('work')}
  <main><section class="work-index-hero accordion-index-hero"><p class="report-kicker">GTM ENGINEERING CAPABILITIES / 05</p><div><h1>Find the constraint. Explore the <em>work.</em></h1><div class="accordion-index-intro"><p>Each section covers the operating problem, business value, representative outputs, tools, and supporting project. Nothing opens a separate page.</p><span>ONE SECTION OPENS AT A TIME</span></div></div></section><section class="accordion-index-list">${accordion(workTypes, 'Expandable types of GTM engineering work')}<div class="accordion-section-links"><a href="#" data-route="home">Return to Home</a></div></section></main>
  ${footer()}
</div>`;

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
  <section class="about-operating-review"><div class="about-principle-review"><div class="report-panel-heading"><span>OPERATING PRINCIPLES</span><span>04</span></div>${principles.map(([number, title, copy]) => `<article><span>${number}</span><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></article>`).join('')}</div><aside class="about-coverage-review"><div class="report-panel-heading"><span>WHAT I BRING TO A TEAM</span><span>01–04</span></div>${coverage.map(([title, detail], index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(title)}</strong><small>${esc(detail)}</small></div>`).join('')}<a href="#" data-route="work">REVIEW THE WORK</a></aside></section>
  <section class="about-ready-cta"><p class="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><div><h2>Need someone who can move from GTM problem to working <em>system?</em></h2><p>I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as focused project work across data, analytics, enrichment, automation, and scoring.</p><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a></div></section>
</main>${footer()}</div>`;

const pages = { home, workIndex, about };
const appScript = `
const pages=${JSON.stringify(pages)};
const app=document.getElementById('app');
let currentPage='home';
function render(page='home',scrollTop=true){
  currentPage=page;
  app.innerHTML=page==='work'?pages.workIndex:page==='about'?pages.about:pages.home;
  if(scrollTop)window.scrollTo(0,0);
}
function setItemState(item,isOpen){
  item.classList.toggle('is-open',isOpen);
  const trigger=item.querySelector('.work-accordion-trigger');
  const panel=item.querySelector('.work-accordion-panel');
  const label=item.querySelector('.work-accordion-action small');
  trigger?.setAttribute('aria-expanded',String(isOpen));
  panel?.setAttribute('aria-hidden',String(!isOpen));
  if(label)label.textContent=isOpen?'Close':'Explore';
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('.work-accordion-trigger');
  if(trigger){
    const current=trigger.closest('.work-accordion-item');
    const shouldOpen=!current.classList.contains('is-open');
    current.closest('.work-accordion').querySelectorAll('.work-accordion-item').forEach(item=>setItemState(item,item===current&&shouldOpen));
    return;
  }
  const routeLink=event.target.closest('[data-route]');
  if(routeLink){
    event.preventDefault();
    render(routeLink.dataset.route||'home');
    return;
  }
  const scrollLink=event.target.closest('[data-scroll]');
  if(scrollLink){
    event.preventDefault();
    const target=scrollLink.dataset.scroll;
    if(currentPage!=='home')render('home',false);
    setTimeout(()=>document.getElementById(target)?.scrollIntoView({behavior:'smooth'}),30);
  }
});
render('home');`;

const embedCss = `${css}
html,body{width:100%;min-height:100%;margin:0;background:#f4f0e6;scroll-behavior:smooth}
body{overflow-x:hidden}
#app{min-height:100vh}
`;

const snippet = `<style>${embedCss}</style><div id="app"></div><script>${appScript}</script>`;
const standalone = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTM Engineering Portfolio — Framer Embed</title><style>${embedCss}</style></head><body><div id="app"></div><script>${appScript}</script></body></html>`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-Embed-Code.txt'), snippet);
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-Embed-Preview.html'), standalone);
await fs.writeFile(path.join(projectDir, 'public', 'GTM-Portfolio-Framer-Embed-Preview.html'), standalone);
console.log(`Created Framer HTML snippet (${Buffer.byteLength(snippet).toLocaleString()} bytes)`);
console.log(`Created standalone preview (${Buffer.byteLength(standalone).toLocaleString()} bytes)`);
