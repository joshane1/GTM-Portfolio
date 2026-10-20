export type Project = {
  slug: string;
  solutionSlug: string;
  solutionTitle: string;
  title: string;
  summary: string;
  business: string;
  icp: string;
  pain: string;
  objective: string;
  approach: string;
  architecture: string[];
  outcomes: { value: string; label: string }[];
};

export type Solution = {
  slug: string;
  number: string;
  title: string;
  label: string;
  summary: string;
  description: string;
  stack: string[];
  metric: string;
  capabilities: string[];
  projectSlugs: string[];
  theme: 'paper' | 'dark' | 'lime';
};

export const projects: Project[] = [
  {
    slug: 'analytical-layer',
    solutionSlug: 'analytical-layer',
    solutionTitle: 'Analytical layer',
    title: 'GTM analytical layer',
    summary: 'A shared analytical layer that turns fragmented GTM data into consistent definitions, reliable reporting, and decision-ready views.',
    business: 'GTM analytics and reporting',
    icp: 'Revenue leaders and GTM operators',
    pain: 'Key metrics were calculated differently across tools and reports, making recurring analysis slower and reducing confidence in the numbers.',
    objective: 'Create a dependable analytical foundation with clear entity definitions, reusable metric logic, and views designed around real operating questions.',
    approach: 'The work organizes source data into a practical GTM model, standardizes core definitions, and exposes trusted views that can support reporting and deeper analysis.',
    architecture: ['Audit source data', 'Define core entities', 'Standardize metric logic', 'Build analytical models', 'Publish trusted views'],
    outcomes: [
      { value: 'Shared', label: 'Metric definitions' },
      { value: 'Reusable', label: 'Analytical models' },
      { value: 'Clearer', label: 'GTM decision-making' },
    ],
  },
  {
    slug: 'clay-enrichment',
    solutionSlug: 'clay-enrichment',
    solutionTitle: 'Clay enrichment',
    title: 'Clay enrichment workflow',
    summary: 'A structured Clay workflow that enriches GTM records, normalizes the output, and returns useful context to the systems where teams work.',
    business: 'Prospecting and data operations',
    icp: 'Sales, growth, and revenue operations teams',
    pain: 'Important lead and account fields were incomplete or inconsistent, creating repetitive research and weakening downstream segmentation and routing.',
    objective: 'Automate the enrichment process while maintaining clear field logic, validation rules, and a usable output for GTM teams.',
    approach: 'The workflow identifies the records that need enrichment, gathers the required attributes through Clay, validates and normalizes the result, and writes approved fields back into the operating system.',
    architecture: ['Select target records', 'Run Clay enrichment', 'Normalize field values', 'Validate output quality', 'Sync approved data'],
    outcomes: [
      { value: 'Automated', label: 'Manual research steps' },
      { value: 'Improved', label: 'Record completeness' },
      { value: 'Consistent', label: 'Enrichment output' },
    ],
  },
  {
    slug: 'lead-scoring',
    solutionSlug: 'lead-scoring',
    solutionTitle: 'Lead scoring',
    title: 'Lead scoring system',
    summary: 'An explainable scoring system that combines relevant signals and gives GTM teams a clearer, repeatable way to prioritize leads.',
    business: 'Lead management and prioritization',
    icp: 'Marketing, sales, and revenue operations teams',
    pain: 'Lead follow-up lacked a shared prioritization method, so teams relied on inconsistent judgment and could not easily explain why one lead ranked above another.',
    objective: 'Create a practical scoring model that reflects the available data, makes prioritization transparent, and can be reviewed as performance changes.',
    approach: 'The system defines the signals that matter, prepares them for comparison, applies transparent scoring logic, and groups leads into useful priority bands for action and review.',
    architecture: ['Select relevant signals', 'Prepare scoring inputs', 'Apply transparent weights', 'Assign priority bands', 'Review and refine'],
    outcomes: [
      { value: 'Prioritized', label: 'Lead follow-up' },
      { value: 'Explainable', label: 'Scoring logic' },
      { value: 'Repeatable', label: 'Review process' },
    ],
  },
];

export const solutions: Solution[] = [
  {
    slug: 'analytical-layer',
    number: '01',
    title: 'Analytical layer',
    label: 'Analytics engineering',
    summary: 'Create shared GTM definitions and reliable analytical models from fragmented operational data.',
    description: 'Useful reporting starts beneath the dashboard. This work focuses on entities, metric logic, transformations, and trusted views that make recurring analysis easier to understand and reuse.',
    stack: ['Source data', 'Metric logic', 'Trusted views'],
    metric: 'Consistent reporting',
    capabilities: ['Data-model design', 'Metric definitions', 'Transformation logic', 'Reporting foundations'],
    projectSlugs: ['analytical-layer'],
    theme: 'paper',
  },
  {
    slug: 'clay-enrichment',
    number: '02',
    title: 'Clay enrichment',
    label: 'Workflow automation',
    summary: 'Use Clay to enrich, validate, normalize, and activate the account or lead data needed by GTM teams.',
    description: 'The emphasis is not enrichment for its own sake. It is designing a controlled workflow that produces useful fields, handles data-quality issues, and supports downstream segmentation, routing, or research.',
    stack: ['Clay', 'Validation', 'Data sync'],
    metric: 'Automated research',
    capabilities: ['Enrichment strategy', 'Clay workflow design', 'Field normalization', 'CRM activation'],
    projectSlugs: ['clay-enrichment'],
    theme: 'dark',
  },
  {
    slug: 'lead-scoring',
    number: '03',
    title: 'Lead scoring',
    label: 'Prioritization',
    summary: 'Turn available fit and engagement signals into an explainable priority model for GTM action.',
    description: 'A useful score has to be understandable, operational, and reviewable. This work covers signal selection, weighting, priority bands, activation, and the feedback needed to improve the model.',
    stack: ['Fit signals', 'Scoring logic', 'Priority bands'],
    metric: 'Explainable priority',
    capabilities: ['Signal selection', 'Scoring-model design', 'Priority segmentation', 'Model review'],
    projectSlugs: ['lead-scoring'],
    theme: 'lime',
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsForSolution(solution: Solution) {
  return solution.projectSlugs
    .map((slug) => getProject(slug))
    .filter((project): project is Project => Boolean(project));
}
