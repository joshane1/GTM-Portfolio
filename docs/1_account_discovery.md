# Account Discovery & Enrichment in Clay

## The problem

Sales can't work accounts it hasn't found. The usual ways of building a target list both fall short:

- **Hand-built lists are slow and inconsistent.** Each rep pulls companies from a different source, and nobody records why a company made the cut.
- **Bought lists are fast but messy.** They're full of companies that are too small, in the wrong country, or missing the details needed to assign a rep.

## The solution

A Clay workbook that builds the target-account list for **Fiction Cloud**, a fictional B2B SaaS company:

1. **Find** real companies that match the ideal customer profile (ICP).
2. **Enrich** only the facts that are missing.
3. **Label** every company with a segment, a region, and a fit decision.

The reviewed list feeds the [account routing workflow](2_account_routing.md), which assigns each account to a rep in HubSpot.

## The ideal customer profile

Fiction Cloud sells to B2B operating companies with recurring work across teams, sites or service delivery. The ICP gives the search four rules:

| Dimension | Rule |
|---|---|
| **Company** | B2B operating organization with evidence of recurring cross-team, multi-site or service work |
| **Size** | 201 – 1,000 employees = Mid-Market; 1,001+ = Enterprise. 200 or fewer is out of scope. |
| **Geography** | United States or United Kingdom |
| **Priority industries** | Software, Logistics, Healthcare Operations, Business Services, Manufacturing. Search priorities, not automatic exclusions. |

## The Clay build

![Clay workbook: two company searches feeding two company tables](images/clay_account_discovery_tables.png)

The workbook has one company search per country, each feeding its own company table:

| Search (source) | Company table | Rows | Columns |
|---|---|---:|---:|
| US mid-to-large software & healthcare companies | **US Companies 200+** | 50 | 25 |
| UK B2B companies, multiple industries | **UK Companies 200+** | 23 | 23 |

Enrichment runs at about **0.2 Clay credits per row**. Keeping the US and UK searches in separate tables means every row can be traced back to the search that produced it, and each country's filters can be tuned without disturbing the other.

```mermaid
flowchart LR
    us["Find Companies<br/>US search"] --> ustable["US Companies 200+<br/>50 rows"]
    uk["Find Companies<br/>UK search"] --> uktable["UK Companies 200+<br/>23 rows"]
    ustable --> enrich["Enrich missing facts<br/>+ job signal"]
    uktable --> enrich
    enrich --> derive["Derive segment,<br/>region, fit status"]
    derive --> review["Review &<br/>dedupe"]
    review --> csv["Approved CSV"]
    csv --> routing["n8n account routing<br/>→ HubSpot"]
```

## 1. Discovery: searching for ICP-fit companies

Each search uses Clay's **Find Companies** with filters that mirror the ICP:

| Filter | Set to | Why |
|---|---|---|
| **Location** | United States or United Kingdom, one search each | Country is a required ICP gate |
| **Company size** | Bands covering 201+ employees | Matches the Mid-Market floor; exact headcount is checked after import |
| **Industry** | Closest Clay labels for the priority industries | A starting point for the pilot, broadened later |
| **Domain** | Has a domain | Makes enrichment and CRM matching reliable |

Before importing, a sample of each search is previewed. If too many results are vendors, tiny firms or in the wrong country, the filters are tightened first. Clay joins different filters with AND and choices within one filter with OR, so each added keyword narrows the list.

## 2. Enrichment: paying only for missing facts

Clay search results are treated as candidate data, not facts. Enrichment is spent only where it adds something:

- **Skip what's already there.** If Find Companies already returned a credible size, location or website, no credits are spent re-fetching it.
- **Run conditionally.** Firmographic enrichments use Clay's *Only run if* setting, so they run only on rows with a missing or disputed value.
- **Pull the fields routing needs.** Employee count, headquarters country and state, industry and website.
- **Add a buying signal.** Clay's **Find jobs** enrichment looks for open job postings at each company. Hiring is a sign that a company is growing or changing, which makes it a better time to reach out.

## 3. Derived columns: turning raw data into decisions

Four formula columns turn the enriched data into the fields routing and prioritization need. Each is a short Clay formula, so the logic is visible in the table and anyone can audit it. All four follow the same conventions:

- **Every row gets an answer.** Each formula ends in a catch-all, so no row is left blank.
- **Unknown is not the same as out of scope.** Missing or unrecognized data returns `NEEDS_REVIEW`; data that clearly fails the ICP returns `OUT_OF_ICP`.
- **Outputs match the routing workflow.** For in-scope companies, segment and region values are the exact codes the [account routing workflow](2_account_routing.md) expects, so nothing has to be relabeled after export. `OUT_OF_ICP` and `NEEDS_REVIEW` are Clay-only values that stop a company before export.

### Segment

Maps Clay's company size band to a sales segment:

```javascript
["201-500", "501-1,000"].includes({{Size}}) ? "MID_MARKET"
: ["1,001-5,000", "5,001-10,000", "10,001+"].includes({{Size}}) ? "ENTERPRISE"
: ["1-10", "11-50", "51-200"].includes({{Size}}) ? "OUT_OF_ICP"
: "NEEDS_REVIEW"
```

| Size band | Segment |
|---|---|
| 201 – 500, 501 – 1,000 | `MID_MARKET` |
| 1,001 – 5,000, 5,001 – 10,000, 10,001+ | `ENTERPRISE` |
| 200 employees or fewer | `OUT_OF_ICP` |
| Blank or unrecognized band | `NEEDS_REVIEW` |

These boundaries follow Clay's available size bands. The exact `employee_count` is exported alongside the segment, so a borderline account can still be checked during review or reclassified if the policy changes.

### Region

Maps the company's headquarters country and state to a sales region:

```javascript
["GB", "UK"].includes({{Derived - Country}}?.toUpperCase()) ? "UK"
: {{Derived - Country}}?.toUpperCase() !== "US"
    ? ({{Derived - Country}} ? "OUT_OF_ICP" : "NEEDS_REVIEW")
: ["AK","AZ","CA","CO","HI","ID","MT","NM","NV","OR","UT","WA","WY"]
    .includes({{Derived - State}}?.toUpperCase()) ? "US_WEST"
: ["AL","AR","CT","DC","DE","FL","GA","IA","IL","IN","KS","KY","LA","MA","MD","ME","MI",
   "MN","MO","MS","NC","ND","NE","NH","NJ","NY","OH","OK","PA","RI","SC","SD","TN","TX",
   "VA","VT","WI","WV"]
    .includes({{Derived - State}}?.toUpperCase()) ? "US_EAST"
: "NEEDS_REVIEW"
```

| Headquarters | Region |
|---|---|
| United Kingdom | `UK` |
| 13 western states: AK, AZ, CA, CO, HI, ID, MT, NM, NV, OR, UT, WA, WY | `US_WEST` |
| The other 37 states plus Washington, DC | `US_EAST` |
| Any other country | `OUT_OF_ICP` |
| Missing country, or a US company with a missing or unrecognized state | `NEEDS_REVIEW` |

Together the two lists cover all 50 states and DC exactly once. The `?.` operators and `toUpperCase()` make the formula safe on blank values and lowercase codes, so a messy row is sent to review instead of breaking the column.

### Job Signal Found

Flags whether the Find jobs enrichment returned at least one open role:

```javascript
{{Find jobs}}?.jobs?.length > 0 ? "YES" : "NO"
```

### Fit Status

Combines the three columns above into one decision per company:

```javascript
[{{Segment}}, {{Region}}].includes("OUT_OF_ICP") ? "NOT_A_FIT"
: [{{Segment}}, {{Region}}].includes("NEEDS_REVIEW") ? "REVIEW"
: {{Job Signal Found}} === "YES" ? "STRONG_FIT"
: "FIT"
```

```mermaid
flowchart TD
    start(["Company row"]) --> q1{"Segment or Region<br/>= OUT_OF_ICP?"}
    q1 -- yes --> out["NOT_A_FIT"]
    q1 -- no --> q2{"Segment or Region<br/>= NEEDS_REVIEW?"}
    q2 -- yes --> review["REVIEW"]
    q2 -- no --> q3{"Open job<br/>posting found?"}
    q3 -- yes --> strong["STRONG_FIT"]
    q3 -- no --> fit["FIT"]
```

| Fit status | Meaning | What happens next |
|---|---|---|
| `STRONG_FIT` | Inside the ICP and actively hiring | Prioritized for outreach |
| `FIT` | Inside the ICP, no hiring signal yet | Routed to a rep as normal |
| `REVIEW` | A required fact is missing or unclear | A person checks it before it reaches the CRM |
| `NOT_A_FIT` | Clearly outside the ICP | Kept in the table to explain the exclusion, never exported |

The order of the checks is deliberate. A known disqualifier wins first: a 50-person company is out of scope even if its state is missing, so no one wastes time reviewing it. Missing data comes next: a company with an unknown region is never scored as a fit, because routing it would mean guessing which rep owns it.

## 4. Quality controls

- **Domain is the identity key.** Domains are normalized to lowercase with no URL path, so the same company found twice can be spotted and matched to HubSpot later.
- **Duplicates are reviewed, not auto-deleted.** Clay's auto-dedupe is left off on the raw tables, because a parent company and its subsidiary can share a domain. Possible duplicates are marked and resolved by a person, and the original rows are kept as evidence.
- **Raw tables are preserved.** `REVIEW` and `NOT_A_FIT` rows stay in the workbook, so every exclusion can be explained later.
- **Manual spot check before export.** At least 10 approved rows are checked by hand: headcount matches the segment, the state matches the region, and every source link opens.
- **Existing CRM accounts are flagged.** Companies already in HubSpot are marked for an update or an ownership review instead of being imported as new; the `review_flag` column carries that decision into routing.

## 5. Handoff to routing

Only approved companies (`FIT` or `STRONG_FIT`, with no unresolved duplicates) go into the export view. It's downloaded as `fiction_cloud_icp_accounts_YYYY-MM-DD.csv` and imported into both HubSpot and the n8n routing queue, where the [account routing workflow](2_account_routing.md) assigns each company to one of six sales lanes using its segment and region.

Because the export is filtered on fit status, `OUT_OF_ICP` and `NEEDS_REVIEW` never leave Clay: every exported row carries one of the routing codes (`MID_MARKET` or `ENTERPRISE`, and `US_EAST`, `US_WEST` or `UK`). Routing still checks the region, segment and review flag on every row, so a bad value that slipped through would be sent to `REVIEW` rather than assigned.

The export columns use the same names as the routing queue:

| Export column | Used for |
|---|---|
| `company_name`, `domain` | Identity and HubSpot matching. Domain is normalized and is the unique key. |
| `employee_count`, `segment` | Mid-Market vs. Enterprise lane |
| `hq_country_code`, `hq_state_code`, `region` | US East, US West or UK lane |
| `review_flag` | Set when an approved account still needs a person's decision before an owner is assigned, such as a subsidiary sharing its parent's domain or a company already owned in HubSpot. Routing sends these to `REVIEW`. |
| `fit_status`, `job_signal_found` | Prioritizing outreach |
| `company_profile_url`, `source_table`, `enriched_at` | Audit trail |

## Design decisions

- **Separate searches per country.** Each table's source is unambiguous, and US and UK filters can evolve independently.
- **Enrich on demand, not by default.** Conditional enrichment keeps credit spend proportional to missing data rather than to row count.
- **Formulas over manual tagging.** Segment, region and fit are calculated the same way for every row, and the rules are readable in the table itself.
- **Review is a first-class outcome.** Missing or conflicting data produces `NEEDS_REVIEW`, never a guessed region or segment, so routing downstream only ever sees clean inputs.
- **Shared codes across systems.** Clay outputs the same segment and region codes the routing workflow reads, so the handoff needs no translation step.
- **Signals are kept separate from fit.** Hiring activity raises a company from `FIT` to `STRONG_FIT` but never makes an out-of-profile company a fit.

## What's next

- **Add more buying signals.** Funding rounds, leadership changes and technology changes alongside job postings.
- **Score instead of tier.** Combine fit and signals into a numeric score that the [funnel analytics](4_funnel_analytics.md) can test against actual conversion.
- **Find contacts.** Add Clay's people search to find the right roles at each approved account, inheriting the account's owner.
- **Automate the handoff.** Send approved rows from Clay straight to the n8n routing queue instead of exporting a CSV.

*All companies in this pilot are treated as hypothetical target accounts. No revenue or product usage is implied.*
