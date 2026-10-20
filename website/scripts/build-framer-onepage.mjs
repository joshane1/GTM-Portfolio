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

function accordion(items) {
  return `<div class="work-accordion" aria-label="Types of GTM engineering work">${items.map((work) => {
    const evidence = work.evidence[0];
    const githubUrl = evidence?.repositoryUrl ?? 'https://github.com/yourusername';
    const panelId = `capability-${work.slug}`;
    return `<article class="work-accordion-item">
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

const page = `<main class="operating-site work-site capability-home theme-editorial accordion-version">
  <header class="site-header operating-header">
    <a class="monogram" href="#" data-scroll="top" aria-label="Back to top">YN<span>.</span></a>
    <nav aria-label="Main navigation">
      <a class="nav-active" href="#" data-scroll="top">Home</a>
      <a href="#" data-scroll="types-of-work">Types of Work</a>
      <a href="#" data-scroll="about">About</a>
    </nav>
    <a class="header-cta" href="#" data-scroll="contact">Let&apos;s talk</a>
  </header>

  <section class="capability-hero" id="top"><div><p class="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p><h1>I build cleaner data, faster handoffs, and more reliable <em>GTM decisions.</em></h1></div><aside><p>I&apos;m Your Name, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p><div class="operating-actions"><a class="report-button report-button-primary" href="#" data-scroll="types-of-work">Explore types of work</a><a class="report-button" href="#" data-scroll="contact">Contact</a></div><small><i></i> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small></aside></section>

  <section class="capability-work accordion-work-section" id="types-of-work"><div class="capability-section-heading accordion-heading"><div><p class="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div><div class="accordion-heading-note"><p>Scan the five areas below, then open the one that matches your current constraint. Each section expands in place; opening another closes the previous one.</p><span>SELECT A ROW TO EXPLORE <i>↓</i></span></div></div>${accordion(workTypes)}</section>

  <section class="capability-evidence"><div class="capability-evidence-heading"><p class="report-kicker">SELECTED TECHNICAL EVIDENCE</p><div><h2>See how the systems were designed and <em>built.</em></h2><p>These projects demonstrate the models, workflows, validation logic, and technical decisions behind the capabilities above.</p></div></div><div class="evidence-library-grid">${evidenceProjects.map((project, index) => `<article><span>PROJECT ${String(index + 1).padStart(2, '0')}</span><h3>${esc(project[0])}</h3><small>${esc(project[1])}</small><p>${esc(project[2])}</p></article>`).join('')}</div></section>

  <section class="about-report about-report-intro" id="about"><div class="about-report-copy"><p class="report-kicker">ABOUT / GTM ENGINEER</p><h1>I connect commercial context to technical <em>execution.</em></h1><p class="about-report-lede">I&apos;m a GTM Engineer and GTM Analytics Engineer working across revenue operations, data, analytics, and automation.</p><p>I help teams move from an operating problem to a dependable system: clarifying the decision or workflow, defining the technical requirements, building and validating the solution, and documenting it for the people who will own it.</p><div class="about-report-meta"><div><span>WORKING RANGE</span><strong>Discovery → delivery</strong></div><div><span>PRIMARY FOCUS</span><strong>Data, analytics &amp; automation</strong></div><div><span>TEAM FIT</span><strong>RevOps · GTM · Data</strong></div></div></div><figure class="report-portrait" role="img" aria-label="Your Name profile placeholder"><div><span>GTM ENGINEERING</span><span>PROFILE</span></div><strong>YN</strong><figcaption>Revenue systems · Analytics engineering · Workflow automation</figcaption></figure></section>

  <section class="operating-contact simple-contact" id="contact"><div><p class="report-kicker">EMPLOYMENT OR PROJECT-BASED SUPPORT</p><h2>Hiring for this capability—or need it <em>built?</em></h2><p class="contact-intro">I&apos;m open to GTM Engineering and GTM Analytics Engineering roles, as well as clearly scoped project work.</p></div><div class="contact-review"><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a><div><span>YOUR CITY · OPEN TO REMOTE</span><a href="#">LINKEDIN</a><a href="#">GITHUB</a></div></div></section>

  <footer class="operating-footer"><span>© 2026 YOUR NAME</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="#" data-scroll="top">BACK TO TOP</a></footer>
</main>`;

const behavior = `
document.addEventListener('click',function(event){
  var trigger=event.target.closest('.work-accordion-trigger');
  if(trigger){
    var current=trigger.closest('.work-accordion-item');
    var shouldOpen=!current.classList.contains('is-open');
    current.closest('.work-accordion').querySelectorAll('.work-accordion-item').forEach(function(item){
      var open=item===current&&shouldOpen;
      item.classList.toggle('is-open',open);
      item.querySelector('.work-accordion-trigger').setAttribute('aria-expanded',String(open));
      item.querySelector('.work-accordion-panel').setAttribute('aria-hidden',String(!open));
      item.querySelector('.work-accordion-action small').textContent=open?'Close':'Explore';
    });
    return;
  }
  var link=event.target.closest('[data-scroll]');
  if(link){
    event.preventDefault();
    var target=document.getElementById(link.getAttribute('data-scroll'));
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  }
});`;

const embedCss = `${css}
html,body{width:100%;min-height:100%;margin:0;background:#f4f0e6;scroll-behavior:smooth}
body{overflow-x:hidden}
`;

const snippet = `<style>${embedCss}</style>${page}<script>${behavior}</script>`;
const standalone = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTM Engineering Portfolio — One Page</title><style>${embedCss}</style></head><body>${page}<script>${behavior}</script></body></html>`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-One-Page-Code.txt'), snippet);
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-One-Page-Preview.html'), standalone);
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-Embed-Code.txt'), snippet);
await fs.writeFile(path.join(outputDir, 'GTM-Portfolio-Framer-Embed-Preview.html'), standalone);
await fs.writeFile(path.join(projectDir, 'public', 'GTM-Portfolio-Framer-One-Page-Preview.html'), standalone);
console.log(`Created one-page Framer snippet (${Buffer.byteLength(snippet).toLocaleString()} bytes)`);
console.log(`Created one-page preview (${Buffer.byteLength(standalone).toLocaleString()} bytes)`);
