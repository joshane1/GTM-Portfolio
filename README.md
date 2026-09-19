# Fiction Cloud Inc. core data generator

This folder contains the code to create Fiction Cloud Inc.'s core fictional CRM, marketing, finance, and identity source tables as CSV files. It also creates the April departmental report extracts needed for the Lead-to-Revenue Data Mart / SSOT assignment. It does **not** build the mart, import records into a CRM, or send messages.

## Run it in your Git repository

Copy this folder into a new repository. With Python 3.10 or newer:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python generate.py --output data/core-v1
python validate.py --data data/core-v1
```

The generator refuses to write into an existing output directory. Use a new path for each release or seed; it will not overwrite records you have saved. The default seed is `20260918`. You can use `--seed 1234` for a different but still reproducible surrounding population; the fixed business-case totals remain the same. The pinned Faker version is necessary for bit-for-bit reproducibility across machines using the same Python/runtime behavior.

## What it creates

- `raw/crm/`: accounts, contacts, owners, opportunities, source links, stage events, and field-change events.
- `raw/marketing/`: inquiries, touches, and campaigns.
- `raw/finance/`: billing customers, subscriptions, and monthly service-revenue lines.
- `raw/identity/`: verified billing-customer-to-CRM-account links.
- `reports/baseline/`: row-level April extracts for Marketing, Sales, and Finance. These are *existing reports* in the fictional scenario, not your finished analytical solution.
- `assignments/lead_to_revenue_ssot.md`: the agreed business definitions and target results for the first analytical project.
- `validation_private/expected_results.json`: reference numbers and named data-quality exceptions. Keep this out of your analytical input schemas and portfolio screenshots.
- `business_brief.md`, `source_catalog.md`, and `manifest.json`: context, column list, row counts, file hashes, seed, and version.

The 14 core tables contain 7,860 source rows. The validator checks key relationships, allowed exceptions, historical state, continuous monthly subscription schedules, source-report arithmetic, and file hashes. Expected controlled results include 24 April MQL inquiries versus 20 distinct contacts, $1.20 million Sales pipeline versus $940,000 approved new-business pipeline, $360,000 bookings versus $70,000 April service revenue, and 20 valid open opportunities at June month-end.

## Important boundaries

All companies and people are fictional. Emails use `example.com` and must not be used for outreach. The CSV schemas are logical source tables, not a promise that a CRM has those exact native objects or field names. Importing into HubSpot or Salesforce requires a separate, deliberate mapping; do not import `validation_private/` or analytical-only history tables as CRM contacts or deals by default.

Routing assignment logs, product usage, daily pipeline snapshots, and seller documents are later extensions. Core v1 preserves the accounts, inquiries, owners, and opportunities those extensions can reference. The completed real-world Jamaica Airbnb enrichment project is separate from Fiction Cloud Inc.
