export type Deliverable = {
  title: string;
  problem: string;
  build: string;
  value: string;
};

export type Evidence = {
  project: string;
  title: string;
  summary: string;
  technologies: string[];
  demonstrates: string[];
  videoUrl?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
};

export type TechnicalResource = {
  kind: string;
  title: string;
  description: string;
  href?: string;
};

export type WorkType = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  discipline: string;
  summary: string;
  outcomeHeadline: string;
  ctaHeadline: string;
  ctaText: string;
  overview: string;
  businessValue: string;
  benefits: string[];
  deliverables: Deliverable[];
  approach: { title: string; detail: string }[];
  technologies: string[];
  considerations: string[];
  validation: string[];
  evidence: Evidence[];
  resources: TechnicalResource[];
};

export const workTypes: WorkType[] = [
  {
    slug: 'gtm-data-modeling',
    number: '01',
    title: 'GTM Data Modeling & Data Quality',
    shortTitle: 'Data modeling & quality',
    discipline: 'Analytics engineering',
    summary: 'Build the dependable data foundation behind GTM reporting, automation, and decision-making.',
    outcomeHeadline: 'Create a GTM data foundation your reports and workflows can trust',
    ctaHeadline: 'Need a GTM data layer your team can trust?',
    ctaText: 'Let\'s discuss the current source systems, reporting requirements, and the analytical foundation needed to support them.',
    overview: 'This work connects CRM, marketing, product, and operational data into a shared analytical model. It defines the entities, relationships, and business logic that let teams answer the same question consistently across reports and workflows.',
    businessValue: 'Companies need this when source systems disagree, metric definitions drift, or every new analysis requires manual reconciliation. A governed analytical layer reduces reporting ambiguity, makes downstream automation safer, and gives revenue teams a foundation they can extend without rebuilding the logic each time.',
    benefits: ['Consistent GTM definitions', 'Reusable reporting datasets', 'Faster analysis', 'Earlier detection of data issues'],
    deliverables: [
      { title: 'CRM and marketing data integration', problem: 'Customer and campaign data lives in separate systems with inconsistent identifiers.', build: 'Source mappings, ingestion logic, identity rules, and a documented integrated model.', value: 'A reliable base for cross-channel reporting and activation.' },
      { title: 'dbt transformation layer', problem: 'Business logic is scattered across dashboards, spreadsheets, and one-off queries.', build: 'Modular staging, intermediate, and mart models with documented dependencies.', value: 'Reusable logic that is easier to test, review, and maintain.' },
      { title: 'Dimensional GTM model', problem: 'Teams cannot consistently connect accounts, contacts, opportunities, activities, and campaigns.', build: 'Fact and dimension models designed around recurring GTM questions.', value: 'Clear relationships and more dependable funnel analysis.' },
      { title: 'Metric standardization', problem: 'Pipeline, conversion, and activity metrics change between reports.', build: 'A governed metric catalog with agreed definitions, grain, filters, and ownership.', value: 'Less debate about numbers and more focus on decisions.' },
      { title: 'Automated data-quality testing', problem: 'Broken joins, stale sources, and invalid values are discovered after reports fail.', build: 'Freshness, uniqueness, accepted-value, relationship, and business-rule tests.', value: 'Problems surface before they affect operating decisions.' },
    ],
    approach: [
      { title: 'Audit', detail: 'Map source systems, owners, grain, identifiers, refresh expectations, and known failure points.' },
      { title: 'Define', detail: 'Agree on core GTM entities, canonical fields, metric definitions, and required outputs.' },
      { title: 'Model', detail: 'Build modular transformations and marts with explicit lineage and naming conventions.' },
      { title: 'Test', detail: 'Validate structural integrity, business rules, freshness, and reconciliation against source totals.' },
      { title: 'Publish', detail: 'Document the model and expose trusted views for reporting, scoring, and activation.' },
    ],
    technologies: ['SQL', 'dbt', 'Cloud data warehouses', 'CRM data', 'Marketing-platform data', 'BI tools'],
    considerations: ['Entity resolution', 'Model grain', 'Slowly changing attributes', 'Metric ownership', 'Lineage and documentation'],
    validation: ['Source-to-model reconciliation', 'Schema and relationship tests', 'Freshness monitoring', 'Stakeholder acceptance checks'],
    evidence: [
      { project: 'Fiction Cloud Analytics', title: 'Building the GTM analytical foundation', summary: 'Demonstrates how CRM and revenue data can be organized into reusable models for consistent reporting and analysis.', technologies: ['SQL', 'dbt', 'Data warehouse', 'BI'], demonstrates: ['Source staging', 'Dimensional modeling', 'Metric definitions', 'Data-quality checks'] },
    ],
    resources: [
      { kind: 'Architecture', title: 'GTM model lineage', description: 'A source-to-mart view showing how operational data becomes trusted reporting tables.' },
      { kind: 'Documentation', title: 'Metric definition catalog', description: 'A reusable structure for metric grain, calculation, filters, ownership, and validation.' },
    ],
  },
  {
    slug: 'sales-pipeline-analytics',
    number: '02',
    title: 'Sales Pipeline & Funnel Analytics',
    shortTitle: 'Pipeline & funnel analytics',
    discipline: 'Revenue analytics',
    summary: 'Turn opportunity and activity data into a clear view of conversion, velocity, coverage, and sales performance.',
    outcomeHeadline: 'Make pipeline movement, conversion, and velocity visible',
    ctaHeadline: 'Need clearer visibility into pipeline performance?',
    ctaText: 'Let\'s review the current opportunity data, reporting gaps, and the decisions your pipeline analysis needs to support.',
    overview: 'This work creates the datasets and analytical views required to understand how pipeline is created, progresses, stalls, and converts. It connects stage history, ownership, timing, and commercial outcomes so leaders can distinguish a reporting symptom from the underlying operating problem.',
    businessValue: 'Companies need pipeline analytics when forecasts are difficult to explain, stage conversion is unclear, or performance reviews depend on manually assembled spreadsheets. Reliable funnel analysis helps leaders focus coaching, capacity, process, and investment decisions on the stages that constrain revenue.',
    benefits: ['Visible conversion constraints', 'Comparable stage performance', 'Clearer pipeline movement', 'Decision-ready sales reporting'],
    deliverables: [
      { title: 'Conversion analysis', problem: 'Teams see final outcomes but cannot locate where qualified demand is being lost.', build: 'Stage, segment, source, owner, and cohort conversion datasets and views.', value: 'A clearer diagnosis of funnel leakage and improvement opportunities.' },
      { title: 'Opportunity-stage tracking', problem: 'Current-stage fields hide how opportunities moved over time.', build: 'A stage-history model with entries, exits, regressions, skipped stages, and time in stage.', value: 'A defensible account of pipeline progression and process adherence.' },
      { title: 'Pipeline velocity analysis', problem: 'Pipeline value alone does not explain how quickly revenue is likely to materialize.', build: 'Velocity measures combining volume, value, conversion, and sales-cycle duration.', value: 'Better visibility into the mechanisms driving pipeline output.' },
      { title: 'Sales performance dataset', problem: 'Rep and team reporting relies on inconsistent dashboard calculations.', build: 'A governed reporting mart with targets, activity, pipeline, and outcome measures at defined grains.', value: 'Comparable performance views with less manual preparation.' },
      { title: 'Funnel reporting package', problem: 'Leaders need recurring reporting but the underlying dataset is not reusable.', build: 'Documented reporting tables and dashboards designed around operating reviews.', value: 'Faster reviews and a consistent basis for follow-up analysis.' },
    ],
    approach: [
      { title: 'Frame', detail: 'Define the commercial question, reporting grain, stage model, time window, and comparison groups.' },
      { title: 'Reconstruct', detail: 'Model opportunity history so movement can be measured rather than inferred from current state.' },
      { title: 'Calculate', detail: 'Create conversion, duration, velocity, coverage, and performance measures from governed logic.' },
      { title: 'Segment', detail: 'Compare results by source, market, product, owner, cohort, and other meaningful dimensions.' },
      { title: 'Explain', detail: 'Publish views that connect the metric to the operating decision it should inform.' },
    ],
    technologies: ['SQL', 'dbt', 'CRM opportunity history', 'BI tools', 'Spreadsheets for QA'],
    considerations: ['Stage-history accuracy', 'Open-opportunity bias', 'Cohort selection', 'Metric grain', 'Target and ownership changes'],
    validation: ['Stage-event reconciliation', 'Closed-won and closed-lost checks', 'Sample opportunity tracing', 'Dashboard-to-source comparison'],
    evidence: [
      { project: 'Fiction Cloud Analytics', title: 'Modeling pipeline movement and funnel performance', summary: 'Demonstrates opportunity-stage reconstruction, conversion analysis, pipeline velocity, and reusable reporting datasets.', technologies: ['SQL', 'dbt', 'Data warehouse', 'BI'], demonstrates: ['Stage history', 'Funnel conversion', 'Pipeline velocity', 'Sales reporting marts'] },
    ],
    resources: [
      { kind: 'Architecture', title: 'Opportunity-history model', description: 'A technical view of stage events, opportunity snapshots, and derived funnel measures.' },
      { kind: 'Documentation', title: 'Funnel metric specification', description: 'Definitions for entry, progression, conversion, duration, velocity, and cohort logic.' },
    ],
  },
  {
    slug: 'icp-discovery-enrichment',
    number: '03',
    title: 'ICP Account Discovery & Enrichment',
    shortTitle: 'ICP discovery & enrichment',
    discipline: 'GTM data operations',
    summary: 'Find, qualify, enrich, and validate the accounts and contacts a GTM motion should pursue.',
    outcomeHeadline: 'Turn an ICP definition into qualified, CRM-ready account data',
    ctaHeadline: 'Need to turn your ICP into usable account data?',
    ctaText: 'Let\'s define the target criteria, required attributes, enrichment workflow, and validation needed for activation.',
    overview: 'This work translates an ICP hypothesis into a usable account and contact dataset. It combines discovery criteria, enrichment sources, validation rules, and field normalization so the output can support prospecting, segmentation, routing, and measurement inside the CRM.',
    businessValue: 'Companies need this when market lists are incomplete, research is performed manually, or enriched fields are too inconsistent to support action. A controlled enrichment workflow improves targeting quality and gives operators a repeatable way to produce CRM-ready data.',
    benefits: ['More relevant account coverage', 'Less manual research', 'Consistent qualification fields', 'CRM-ready output'],
    deliverables: [
      { title: 'ICP account discovery', problem: 'The target market is defined conceptually but not translated into a reproducible account list.', build: 'Search criteria, source strategy, qualification logic, and a deduplicated account dataset.', value: 'A reviewable market universe aligned to the commercial thesis.' },
      { title: 'Clay enrichment workflow', problem: 'Key account and contact attributes are missing or require repetitive research.', build: 'A Clay table with waterfalls, enrichment logic, conditional runs, and normalized output fields.', value: 'Repeatable research with better control over data quality and cost.' },
      { title: 'Account and contact qualification', problem: 'Enrichment returns data but does not determine whether a record is usable or relevant.', build: 'Explicit qualification rules, confidence checks, and exclusion reasons.', value: 'Fewer low-quality records entering sales workflows.' },
      { title: 'Data validation and normalization', problem: 'Source values vary in format, meaning, and reliability.', build: 'Validation rules, standard categories, provenance fields, and exception handling.', value: 'Safer segmentation and more dependable downstream automation.' },
      { title: 'CRM-ready dataset', problem: 'Research output cannot be loaded cleanly into the existing operating system.', build: 'Mapped fields, deduplication logic, import keys, ownership rules, and activation documentation.', value: 'Faster activation without creating a second data-quality problem.' },
    ],
    approach: [
      { title: 'Specify', detail: 'Translate the ICP into observable criteria, required fields, acceptable sources, and exclusions.' },
      { title: 'Discover', detail: 'Build the candidate account universe and preserve source and provenance information.' },
      { title: 'Enrich', detail: 'Use Clay workflows and appropriate providers to collect the attributes needed for qualification.' },
      { title: 'Validate', detail: 'Normalize values, assess confidence, deduplicate records, and route ambiguous cases for review.' },
      { title: 'Activate', detail: 'Prepare a CRM-ready dataset and document how fields should be used downstream.' },
    ],
    technologies: ['Clay', 'Enrichment providers', 'CRM', 'Spreadsheets', 'APIs', 'Validation rules'],
    considerations: ['Provider coverage', 'Waterfall cost', 'Field provenance', 'Deduplication', 'Privacy and acceptable use'],
    validation: ['Manual sample review', 'Coverage and null analysis', 'Duplicate checks', 'CRM import validation'],
    evidence: [
      { project: 'Fiction Cloud Clay Enrichment', title: 'From ICP criteria to CRM-ready account data', summary: 'Demonstrates account discovery, Clay enrichment, field normalization, qualification, and preparation for activation.', technologies: ['Clay', 'Enrichment APIs', 'CRM fields', 'Validation logic'], demonstrates: ['ICP criteria', 'Waterfall enrichment', 'Data validation', 'CRM-ready output'] },
    ],
    resources: [
      { kind: 'Architecture', title: 'Enrichment workflow map', description: 'A visual sequence from target-record selection through providers, validation, and CRM sync.' },
      { kind: 'Documentation', title: 'Field and source specification', description: 'Required fields, preferred providers, fallback logic, provenance, and acceptance criteria.' },
    ],
  },
  {
    slug: 'lead-qualification-automation',
    number: '04',
    title: 'Lead Qualification & Workflow Automation',
    shortTitle: 'Qualification & automation',
    discipline: 'GTM systems engineering',
    summary: 'Automate qualification, assignment, routing, and CRM updates without losing control of exceptions.',
    outcomeHeadline: 'Replace manual lead triage with consistent, observable workflows',
    ctaHeadline: 'Need to automate lead handling without losing control?',
    ctaText: 'Let\'s map the qualification, routing, CRM, and exception-handling requirements for a dependable workflow.',
    overview: 'This work turns operational rules into dependable workflows. It covers how records enter the system, how they are qualified and assigned, how duplicates and exceptions are handled, and how the resulting state is written back to the CRM and monitored.',
    businessValue: 'Companies need this when response depends on manual review, routing logic is difficult to audit, or automation breaks silently. A well-designed workflow reduces repetitive handling while preserving ownership, traceability, and a clear path for exceptions.',
    benefits: ['Faster record handling', 'Consistent assignment rules', 'Fewer duplicate actions', 'Visible exceptions and failures'],
    deliverables: [
      { title: 'Automated lead routing', problem: 'New leads wait for manual review or follow inconsistent assignment rules.', build: 'A workflow that validates inputs, evaluates routing rules, assigns an owner, and records the decision.', value: 'Faster, more consistent handoff to the appropriate GTM motion.' },
      { title: 'Geographic and segment assignment', problem: 'Territory, market, and segment rules are encoded differently across systems.', build: 'A centralized decision table and workflow logic for assignment and fallback handling.', value: 'Clearer ownership and easier rule maintenance.' },
      { title: 'Duplicate prevention', problem: 'Repeated submissions and inconsistent identifiers create duplicate records or actions.', build: 'Lookup, match, merge-or-update, and idempotency controls before downstream actions run.', value: 'Cleaner CRM data and fewer conflicting notifications or assignments.' },
      { title: 'CRM integration workflow', problem: 'Data has to move between forms, enrichment tools, and the CRM without losing context.', build: 'Mapped API operations, payload validation, retry handling, and state updates.', value: 'A dependable handoff between systems with less manual intervention.' },
      { title: 'Exception and failure handling', problem: 'Automation failures are invisible or require engineering investigation to resolve.', build: 'Explicit error branches, alerts, review queues, logging, and replay procedures.', value: 'Faster recovery and more trustworthy automation.' },
    ],
    approach: [
      { title: 'Map', detail: 'Document triggers, inputs, ownership rules, dependencies, expected outputs, and exception paths.' },
      { title: 'Design', detail: 'Separate qualification, routing, integration, and notification logic into reviewable steps.' },
      { title: 'Build', detail: 'Implement the workflow with explicit validation, idempotency, logging, and secure credentials.' },
      { title: 'Test', detail: 'Run normal, boundary, duplicate, missing-data, and dependency-failure scenarios.' },
      { title: 'Operate', detail: 'Add monitoring, ownership, documentation, and a controlled method for changing rules.' },
    ],
    technologies: ['n8n', 'CRM APIs', 'Webhooks', 'JavaScript', 'JSON', 'Enrichment services'],
    considerations: ['Idempotency', 'Rate limits', 'Credential security', 'Rule ownership', 'Error recovery'],
    validation: ['Scenario test matrix', 'Payload inspection', 'Duplicate tests', 'Failure and retry tests'],
    evidence: [
      { project: 'Fiction Cloud n8n Account Routing', title: 'Designing a dependable account-routing workflow', summary: 'Demonstrates validation, geographic and segment assignment, duplicate handling, CRM integration, and explicit exception paths.', technologies: ['n8n', 'Webhooks', 'CRM API', 'JavaScript'], demonstrates: ['Routing logic', 'Duplicate prevention', 'CRM payloads', 'Exception handling'] },
    ],
    resources: [
      { kind: 'Architecture', title: 'n8n workflow diagram', description: 'A node-level view of trigger, validation, routing, CRM operations, notifications, and failure branches.' },
      { kind: 'Documentation', title: 'Routing decision table', description: 'A maintainable representation of geography, segment, fallback, and exception rules.' },
    ],
  },
  {
    slug: 'lead-scoring-activation',
    number: '05',
    title: 'Lead Scoring & Buying-Signal Activation',
    shortTitle: 'Scoring & signal activation',
    discipline: 'Prioritization systems',
    summary: 'Translate fit, engagement, and product signals into explainable priority and timely sales action.',
    outcomeHeadline: 'Turn fit and buying signals into explainable sales priority',
    ctaHeadline: 'Need to turn buying signals into consistent sales action?',
    ctaText: 'Let\'s define the decision, source signals, scoring logic, activation path, and review process.',
    overview: 'This work defines which signals matter, how they should be combined, and how the resulting priority should appear inside the CRM and daily sales workflow. It includes the model, the activation logic, and the feedback needed to review performance over time.',
    businessValue: 'Companies need this when teams have more leads or accounts than they can evaluate manually, or when useful buying signals never reach the right owner. An explainable scoring and activation system concentrates attention while giving operators a clear way to inspect and improve the logic.',
    benefits: ['More consistent prioritization', 'Explainable score components', 'Faster signal activation', 'Reviewable model performance'],
    deliverables: [
      { title: 'ICP-fit scoring', problem: 'Account quality is judged inconsistently or with overly broad firmographic filters.', build: 'A transparent fit model with documented features, weights, exclusions, and score bands.', value: 'A repeatable view of which accounts best match the commercial thesis.' },
      { title: 'Engagement scoring', problem: 'Individual activities are visible but their combined significance is unclear.', build: 'A time-aware engagement model with event weights, decay, thresholds, and account aggregation.', value: 'A clearer view of meaningful activity rather than raw volume.' },
      { title: 'Product-usage signals', problem: 'Commercial teams cannot easily distinguish casual usage from meaningful readiness or expansion patterns.', build: 'Modeled usage features, thresholds, and interpretable signal definitions.', value: 'Product behavior becomes usable context for GTM prioritization.' },
      { title: 'CRM score activation', problem: 'Scores exist in analysis but do not influence daily work.', build: 'CRM fields, bands, reasons, views, and workflow triggers aligned to the operating motion.', value: 'Priority becomes visible and actionable where teams already work.' },
      { title: 'Automated sales notifications', problem: 'High-value signal changes are discovered late or arrive without context.', build: 'Owned alerts containing score movement, contributing reasons, supporting evidence, and the expected action.', value: 'Faster response with enough context to act thoughtfully.' },
    ],
    approach: [
      { title: 'Define', detail: 'Identify the decision the score should support and the action associated with each priority band.' },
      { title: 'Engineer', detail: 'Create stable fit, engagement, and usage features with clear lineage and update cadence.' },
      { title: 'Model', detail: 'Apply transparent weighting or rules and preserve reason codes for explainability.' },
      { title: 'Activate', detail: 'Publish scores, reasons, and changes into CRM views, workflows, and notifications.' },
      { title: 'Evaluate', detail: 'Review coverage, stability, conversion, false positives, and operator feedback before changing logic.' },
    ],
    technologies: ['SQL', 'dbt', 'CRM', 'Product events', 'Marketing engagement data', 'Workflow automation'],
    considerations: ['Feature leakage', 'Score explainability', 'Event decay', 'Account aggregation', 'Model drift'],
    validation: ['Distribution and coverage review', 'Historical backtesting', 'Reason-code inspection', 'Sales feedback loop'],
    evidence: [
      { project: 'Lead Scoring System', title: 'Building an explainable lead-priority model', summary: 'Demonstrates signal selection, transparent weighting, priority bands, CRM activation, and a repeatable review process.', technologies: ['SQL', 'CRM fields', 'Scoring logic', 'Workflow automation'], demonstrates: ['Fit signals', 'Engagement inputs', 'Priority bands', 'Activation logic'] },
    ],
    resources: [
      { kind: 'Architecture', title: 'Signal-to-action architecture', description: 'A view of source signals, feature logic, scoring, reason codes, CRM activation, and notifications.' },
      { kind: 'Documentation', title: 'Scoring specification', description: 'Feature definitions, weights, thresholds, exclusions, bands, actions, and evaluation checks.' },
    ],
  },
];

export function getWorkType(slug: string) {
  return workTypes.find((item) => item.slug === slug);
}
