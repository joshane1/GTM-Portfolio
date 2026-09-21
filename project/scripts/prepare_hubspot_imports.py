from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "core-v1" / "raw" / "crm"
OUT = ROOT / "project" / "hubspot_import"
OUT.mkdir(parents=True, exist_ok=True)

def read(name):
    with (RAW / f"{name}.csv").open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def write(name, rows):
    path = OUT / name
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

account_ids = {
    *[f"ACC-CTRL-{n:03d}" for n in range(1, 41)],
    *[f"ACC-{n:03d}" for n in range(1, 21)],
}

accounts = [r for r in read("crm_accounts") if r["account_id"] in account_ids]
accounts.sort(key=lambda r: r["account_id"])
assert len(accounts) == 60

account_by_id = {r["account_id"]: r for r in accounts}

lifecycle = {
    "LEAD": "Lead",
    "MQL": "Marketing Qualified Lead",
    "SQL": "Sales Qualified Lead",
    "OPPORTUNITY": "Opportunity",
    "CUSTOMER": "Customer",
}

companies = [{
    "Company name": r["name"],
    "Company domain name": r["domain"],
    "Lifecycle stage": lifecycle[r["lifecycle_stage_current"]],
    "fc_account_id": r["account_id"],
    "fc_segment": r["segment"],
    "fc_region": r["region"],
    "fc_industry": r["industry"],
} for r in accounts]

eligible_contacts = [r for r in read("crm_contacts") if r["account_id"] in account_ids]
eligible_contacts.sort(key=lambda r: (r["account_id"], r["contact_id"]))

first_by_account = {}
for row in eligible_contacts:
    first_by_account.setdefault(row["account_id"], row)

selected = list(first_by_account.values())
selected_ids = {r["contact_id"] for r in selected}
selected += [r for r in eligible_contacts if r["contact_id"] not in selected_ids][:120-len(selected)]
selected.sort(key=lambda r: r["contact_id"])
assert len(selected) == 120

contacts = []
for row in selected:
    local = row["email"].split("@", 1)[0].split(".")
    contacts.append({
        "Email": row["email"],
        "First name": local[0].title(),
        "Last name": local[1].title(),
        "Lifecycle stage": lifecycle[row["lifecycle_stage_current"]],
        "fc_contact_id": row["contact_id"],
        "fc_persona": row["persona"],
        "Company domain name": account_by_id[row["account_id"]]["domain"],
    })

deal_ids = {
    *[f"OPP-APR-{n:03d}" for n in range(1, 12)],
    *[f"OPP-WON-APR-{n:03d}" for n in range(1, 4)],
    *[f"OPP-COHORT-{n:03d}" for n in range(1, 3)],
    *[f"PH{n:03d}" for n in range(1, 21)],
}

source_deals = [r for r in read("crm_opportunities") if r["opp_id"] in deal_ids]
source_deals.sort(key=lambda r: r["opp_id"])
assert len(source_deals) == 36

stage = {
    "DISCOVERY": "Discovery",
    "EVALUATION": "Evaluation",
    "PROPOSAL": "Proposal",
    "NEGOTIATION": "Negotiation",
    "CLOSED_WON": "Closed won",
    "CLOSED_LOST": "Closed lost",
}

deals = []
for row in source_deals:
    company = account_by_id[row["account_id"]]
    close_date = row["closed_at_current"][:10] or row["expected_close_date_current"]
    deals.append({
        "Deal name": f"{company['name']} - {row['opp_id']}",
        "Pipeline": "Sales Pipeline",
        "Deal stage": stage[row["stage_current"]],
        "Amount": row["amount_usd"],
        "Close date": close_date,
        "fc_opportunity_id": row["opp_id"],
        "fc_opportunity_type": row["opportunity_type"],
        "fc_source_owner_id": row["owner_id"],
        "fc_external_quote_id": row["external_quote_id"],
        "fc_source_stage": row["stage_current"],
        "Company domain name": company["domain"],
    })

write("companies.csv", companies)
write("contacts.csv", contacts)
write("deals.csv", deals)

print(f"companies={len(companies)} contacts={len(contacts)} deals={len(deals)}")