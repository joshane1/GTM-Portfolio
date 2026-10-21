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
  'Fractional retainer — up to 15 hours/week',
  'Fractional retainer — up to 20 hours/week',
  'Full-time GTM Engineering',
  'Full-time GTM Analytics Engineering',
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
    <a class="${active === 'about' ? 'nav-active' : ''}" href="${aboutHref}">About</a>
  </nav>
  <a class="header-cta" href="/#contact">Let&apos;s talk</a>
</header>`;

const footer = () => `<footer class="operating-footer"><span>© 2026 OSHANE JACKSON</span><span>GTM ENGINEERING / SYSTEMS / ANALYTICS</span><a href="/">HOME</a></footer>`;

function accordion(items) {
  return `<div class="work-accordion" aria-label="Types of GTM engineering work">${items.map((work) => {
    const evidence = work.evidence[0];
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
        <div class="work-accordion-evidence"><span>PROJECT EVIDENCE</span><h5>${esc(evidence?.project ?? 'Representative project')}</h5><p>${esc(evidence?.summary)}</p><div>${work.technologies.slice(0, 4).map((technology) => `<small>${esc(technology)}</small>`).join('')}</div><a class="work-inquiry-link" href="#contact" data-capability="${esc(work.title)}" data-area="${esc(work.slug)}">Discuss this capability <b>→</b></a></div>
      </div></div></div>
    </article>`;
  }).join('')}</div>`;
}

const projectWriteups = [
  {
    number: '01',
    eyebrow: 'WORKFLOW AUTOMATION',
    title: 'Route the Right Accounts to the Right Reps—Automatically',
    summary: 'An explainable Clay-to-n8n-to-HubSpot workflow that routes enriched accounts into six sales lanes, preserves clean ownership logic, and sends incomplete records to review.',
    tags: ['n8n', 'Clay', 'HubSpot', 'Routing logic'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/lead_routing.md',
  },
  {
    number: '02',
    eyebrow: 'ANALYTICS ENGINEERING',
    title: 'Enable Trustworthy Reporting With a Tested CRM Data Model',
    summary: 'A typed, connected, and tested CRM data foundation built with SQL and dbt—including historical reporting logic, relationship checks, and 89 automated tests.',
    tags: ['dbt', 'SQL', 'CRM modeling', 'Data quality'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/data_modeling.md',
  },
  {
    number: '03',
    eyebrow: 'REVENUE ANALYTICS',
    title: 'Turn Funnel and Pipeline Data Into Decisions Leaders Can Trust',
    summary: 'A decision-focused analysis of conversion, channel contribution, pipeline definitions, velocity, bookings, and revenue—organized around eight recurring GTM questions.',
    tags: ['Funnel analytics', 'Pipeline', 'Metric definitions'],
    href: 'https://github.com/joshane1/GTM-Portfolio/blob/main/funnel_analytics.md',
  },
];

const projectWriteupCards = () => projectWriteups.map((project) => `<a class="project-writeup-card" href="${esc(project.href)}" target="_blank" rel="noreferrer" aria-label="Read project write-up: ${esc(project.title)}">
  <div class="project-writeup-meta"><span>PROJECT ${esc(project.number)}</span><small>FICTION CLOUD SIMULATION</small></div>
  <p class="project-writeup-eyebrow">${esc(project.eyebrow)}</p>
  <h3>${esc(project.title)}</h3>
  <p class="project-writeup-summary">${esc(project.summary)}</p>
  <div class="project-writeup-tags">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
  <strong>Read project write-up <b>↗</b></strong>
</a>`).join('');

const sharedHead = (title, description) => `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><style>${css}
html,body{width:100%;min-height:100%;margin:0;background:#f4f0e6;scroll-behavior:smooth}
body{overflow-x:hidden}
.about-glance{min-height:calc(100vh - 155px);padding:clamp(3.5rem,6vw,6rem) 6vw;display:grid;align-items:center;background:#fbf8f1}
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
@media(max-width:720px){.about-glance{min-height:0;padding:3.5rem 1.25rem}.about-glance-copy h1{font-size:clamp(3rem,14vw,4.8rem)}.about-glance-facts{grid-template-columns:1fr}.about-glance-facts div{min-height:82px}.about-glance-visual{grid-template-columns:1fr;margin-top:2rem;padding:1rem}.about-glance .report-portrait{min-height:360px}.about-profile-summary{padding:1.1rem 0 0;border-top:1px solid var(--line);border-left:0}.about-glance-actions{flex-direction:column;align-items:flex-start}.about-brief>div{grid-template-columns:1fr;gap:.35rem}}
@media(max-width:1000px){.single-page-about-grid{grid-template-columns:1fr}.single-page-about-visual{max-width:760px;margin-top:2.5rem;grid-template-columns:minmax(280px,.65fr) 1fr;align-items:center}.single-page-about .report-portrait{min-height:360px}.single-page-about-visual .about-profile-summary{padding:1.25rem 0 1.25rem 1.5rem;border-top:0;border-left:1px solid var(--line)}}
@media(max-width:720px){.single-page-about{padding:4.5rem 1.25rem}.single-page-about-copy h2{font-size:clamp(3rem,14vw,4.8rem)}.single-page-about-facts{grid-template-columns:1fr}.single-page-about-facts div{min-height:82px}.single-page-about-visual{grid-template-columns:1fr;margin-top:2rem;padding:1rem}.single-page-about .report-portrait{min-height:360px}.single-page-about-visual .about-profile-summary{padding:1.1rem 0 0;border-top:1px solid var(--line);border-left:0}.single-page-about-actions{flex-direction:column;align-items:flex-start}}
</style>`;

const behavior = `<script>
document.addEventListener('click',function(event){
  var inquiryLink=event.target.closest('.work-inquiry-link');
  if(inquiryLink){
    var area=inquiryLink.getAttribute('data-area');
    var areaInput=area&&document.querySelector('.inquiry-chip input[data-area="'+area+'"]');
    if(areaInput)areaInput.checked=true;
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
  function updateCarousel(){
    var step=cardStep();
    currentIndex=step?Math.max(0,Math.min(cards.length-1,Math.round(track.scrollLeft/step))):0;
    if(progress)progress.textContent=String(currentIndex+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    if(bar)bar.style.transform='scaleX('+((currentIndex+1)/cards.length)+')';
    if(previous)previous.disabled=currentIndex===0;
    if(next)next.disabled=currentIndex===cards.length-1;
  }
  function moveTo(index){
    currentIndex=Math.max(0,Math.min(cards.length-1,index));
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
    if(event.pointerType!=='mouse'||event.button!==0)return;
    dragging=true;dragged=false;startX=event.clientX;startScroll=track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove',function(event){
    if(!dragging)return;
    var distance=event.clientX-startX;
    if(Math.abs(distance)>5)dragged=true;
    track.scrollLeft=startScroll-distance;
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
  <section class="capability-hero" id="top"><div><p class="report-kicker">GTM ENGINEERING / REVENUE SYSTEMS</p><h1>Enable cleaner data, faster insights, and more reliable <em>GTM decisions.</em></h1></div><aside><p>I&apos;m Oshane Jackson, a GTM Engineer and GTM Analytics Engineer. I design the data models, analytics, enrichment workflows, automations, and scoring systems that help revenue teams operate with greater clarity and consistency.</p><div class="operating-actions"><a class="report-button report-button-primary" href="#types-of-work">Explore types of work</a><a class="report-button" href="#contact">Contact</a></div><small><i></i> AVAILABLE FOR THE RIGHT ROLE OR PROJECT</small></aside></section>
  <section class="capability-work accordion-work-section" id="types-of-work"><div class="capability-section-heading accordion-heading"><div><p class="report-kicker">HOW I HELP GTM TEAMS / 05 CAPABILITIES</p><h2>Five ways I help GTM teams operate <em>better.</em></h2></div><div class="accordion-heading-note"><p>Scan the five areas below, then open the one that matches your current constraint. Each section expands in place; opening another closes the previous one.</p><span>SELECT A ROW TO EXPLORE <i>↓</i></span></div></div>${accordion(workTypes)}</section>
  <section class="project-writeups" id="project-writeups"><div class="project-writeups-heading"><div><p class="report-kicker">PROJECT WRITE-UPS / GITHUB</p><h2>Practical systems for recurring <em>GTM problems.</em></h2></div><div class="project-writeups-intro"><p>Each write-up starts with the operating problem, then shows the design choices, technical logic, validation, and business use of the solution.</p><div class="project-carousel-controls" aria-label="Project carousel controls"><button type="button" data-carousel-prev aria-label="Previous project">←</button><span data-carousel-progress>01 / 03</span><button type="button" data-carousel-next aria-label="Next project">→</button></div></div></div><div class="project-carousel-viewport"><div class="project-carousel-track" data-project-carousel tabindex="0" aria-label="Project write-ups. Swipe or use the arrow buttons to browse.">${projectWriteupCards()}</div></div><div class="project-carousel-progress" aria-hidden="true"><i data-carousel-bar></i></div></section>
  <section class="operating-contact simple-contact inquiry-section" id="contact"><div class="inquiry-intro"><p class="report-kicker">FRACTIONAL GTM ENGINEERING</p><h2>Need dependable GTM engineering <em>capacity?</em></h2><p class="contact-intro">Tell me where your team needs support. I offer fractional retainers of up to 15 or 20 hours per week across GTM data, analytics, enrichment, automation, and scoring.</p></div><form class="inquiry-form" id="inquiry-form" name="inquiry" method="POST" data-netlify="true" netlify-honeypot="company-website"><input type="hidden" name="form-name" value="inquiry"><p hidden><label>Leave this field empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p><label><span>Name</span><input type="text" name="name" autocomplete="name" required></label><label><span>Email</span><input type="email" name="email" autocomplete="email" required></label><label class="inquiry-company"><span>Company name</span><input type="text" name="company" autocomplete="organization"></label><label class="inquiry-engagement"><span>Engagement type</span><select name="engagement" required><option value="">Select one</option>${engagementTypes.map((type) => `<option>${esc(type)}</option>`).join('')}</select></label><fieldset class="inquiry-areas"><legend>Areas of inquiry</legend><div class="inquiry-chips">${inquiryAreas.map(([label, slug]) => `<label class="inquiry-chip"><input type="checkbox" name="areas" value="${esc(label)}"${slug ? ` data-area="${esc(slug)}"` : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset><label class="inquiry-message"><span>Current need</span><textarea name="message" rows="3" placeholder="What is your team trying to improve, and where is the current constraint?"></textarea></label><div class="inquiry-submit"><button class="report-button report-button-light" type="submit">Send inquiry</button><p>Your information is only used to respond to this inquiry.</p><strong data-form-status aria-live="polite"></strong></div></form></section>
  ${footer()}
</main>${behavior}</body></html>`;

const about = `<!doctype html><html lang="en"><head>${sharedHead('About — Oshane Jackson, GTM Engineer', 'About the GTM engineering approach, operating principles, and technical delivery experience.')}</head><body><div class="operating-shell theme-editorial">
  ${header('about')}
  <main id="top">
    <section class="about-glance"><div class="about-glance-grid">
      <div class="about-glance-copy"><p class="report-kicker">ABOUT / GTM ENGINEER</p><h1>I turn GTM operating problems into dependable <em>systems.</em></h1><p class="about-glance-lede">I build dependable data and automation systems for GTM teams—turning operational questions into reporting, enrichment, scoring, and workflow solutions people can trust.</p><p class="about-glance-support">Recent work includes a GTM analytical layer for consistent reporting, a Clay enrichment workflow that turns ICP criteria into CRM-ready account data, and an explainable lead-scoring system using fit and engagement signals.</p><div class="about-brief"><div><span>CORE WORK</span><p>Data modeling · Funnel analytics · Enrichment · Lead scoring · Automation</p></div><div><span>TOOLS</span><p>SQL · dbt · Clay · n8n · CRM workflows · BI</p></div></div><div class="about-glance-actions"><a class="report-button report-button-primary" href="/#types-of-work">Review Types of Work</a><a class="report-button" href="/#contact">Contact</a></div></div>
      <aside class="about-glance-visual"><figure class="report-portrait report-portrait-photo"><img src="/headshot.png" alt="Headshot of Oshane Jackson" width="1146" height="1419"></figure><div class="about-profile-summary"><span>WORKING PROFILE</span><strong>GTM Engineer bridging RevOps, data, and automation.</strong><p>Focused on practical systems that improve reporting trust, lead handling, targeting quality, and prioritization.</p></div></aside>
    </div></section>
  </main>
  ${footer()}
</div></body></html>`;

const singlePageAbout = `<section class="single-page-about" id="about"><div class="single-page-about-grid">
  <div class="single-page-about-copy"><p class="report-kicker">ABOUT / GTM ENGINEER</p><h2>I turn GTM operating problems into dependable <em>systems.</em></h2><p class="single-page-about-lede">I build dependable data and automation systems for GTM teams—turning operational questions into reporting, enrichment, scoring, and workflow solutions people can trust.</p><p class="single-page-about-detail">Recent work includes a GTM analytical layer for consistent reporting, a Clay enrichment workflow that turns ICP criteria into CRM-ready account data, and an explainable lead-scoring system using fit and engagement signals.</p><div class="about-brief"><div><span>CORE WORK</span><p>Data modeling · Funnel analytics · Enrichment · Lead scoring · Automation</p></div><div><span>TOOLS</span><p>SQL · dbt · Clay · n8n · CRM workflows · BI</p></div></div><div class="single-page-about-actions"><a class="report-button report-button-primary" href="#contact">Start a conversation</a><a class="report-button" href="#types-of-work">Review types of work</a></div></div>
  <aside class="single-page-about-visual"><figure class="report-portrait report-portrait-photo"><img src="/headshot.png" alt="Headshot of Oshane Jackson" width="1146" height="1419"></figure><div class="about-profile-summary"><span>WORKING PROFILE</span><strong>GTM Engineer bridging RevOps, data, and automation.</strong><p>Focused on practical systems that improve reporting trust, lead handling, targeting quality, and prioritization.</p></div></aside>
</div></section>`;

const singlePageHome = home
  .replace('accordion-version"', 'accordion-version single-page-version"')
  .replace(header('home'), header('home', '#about'))
  .replace(/<section class="project-writeups"[\s\S]*?<\/section>/, singlePageAbout)
  .replace(/\s*<section class="simple-about capability-about">[\s\S]*?<\/section>/, '');

await fs.mkdir(path.join(outputDir, 'about'), { recursive: true });
await fs.writeFile(path.join(outputDir, 'index.html'), home);
await fs.writeFile(path.join(outputDir, 'about', 'index.html'), about);
await fs.writeFile(path.join(outputDir, 'README-FIRST.txt'), `UPLOAD THIS ENTIRE FOLDER TO NETLIFY DROP\n\n1. Open https://app.netlify.com/drop\n2. Drag the entire GTM-Portfolio-Netlify-Drop folder into the drop area.\n3. Copy the generated netlify.app URL.\n4. In Framer, select your Embed and choose URL.\n5. Paste the Netlify URL.\n\nDo not paste index.html into Framer's HTML field.\n`);
await fs.mkdir(singlePageOutputDir, { recursive: true });
await fs.writeFile(path.join(singlePageOutputDir, 'index.html'), singlePageHome);
await fs.copyFile(path.join(projectDir, 'public', 'headshot.png'), path.join(outputDir, 'headshot.png'));
await fs.copyFile(path.join(projectDir, 'public', 'headshot.png'), path.join(singlePageOutputDir, 'headshot.png'));
await fs.writeFile(path.join(singlePageOutputDir, 'README-FIRST.txt'), `SINGLE-PAGE VERSION — UPLOAD THIS ENTIRE FOLDER TO NETLIFY DROP\n\n1. Open https://app.netlify.com/drop\n2. Drag the entire GTM-Portfolio-Single-Page folder into the drop area.\n3. Copy the generated netlify.app URL.\n4. In Framer, select your Embed and choose URL.\n5. Paste the Netlify URL.\n\nThe About navigation scrolls to the About section on the Home page.\nDo not paste index.html into Framer's HTML field.\n`);

console.log(`Created Netlify Drop folder: ${outputDir}`);
console.log(`Home HTML: ${Buffer.byteLength(home).toLocaleString()} bytes`);
console.log(`About HTML: ${Buffer.byteLength(about).toLocaleString()} bytes`);
console.log(`Created single-page folder: ${singlePageOutputDir}`);
console.log(`Single-page HTML: ${Buffer.byteLength(singlePageHome).toLocaleString()} bytes`);
